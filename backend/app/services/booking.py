import asyncio
import re
import uuid
from typing import Set

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

# Track background tasks to prevent silent GC and lost exceptions
_background_tasks: Set[asyncio.Task] = set()

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.payment_attempt import PaymentAttempt
from app.models.site_settings import SiteSettings
from app.models.user import User
from app.repositories.booking import BookingRepository
from app.repositories.payment_attempt import PaymentAttemptRepository
from app.repositories.tour import TourRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingAdminUpdate, PaginatedBookings
from app.services.email_service import send_email, send_booking_admin_notification, send_payment_success_email, send_payment_booking_confirmation_email
from app.services.pesapal import PesapalService
from app.services.rate_limit_service import RateLimitService
from sqlalchemy import select
from sqlalchemy import text as sa_text


def _parse_duration_days(duration: str) -> int:
    """Extract the number of days from a string like '3 Days', '7 days / 6 nights'."""
    m = re.search(r'(\d+)\s*day', duration, re.IGNORECASE)
    return int(m.group(1)) if m else 1


async def _init_pesapal_background(
    booking_id: int,
    tour_title: str,
    contact_name: str,
    contact_email: str,
    contact_phone: str | None,
    total_price: float,
    send_payment_version: bool,
) -> None:
    """Background task: init Pesapal payment, then send confirmation email.

    Runs on its own DB session so the request handler never waits for Pesapal (2–20s).
    """
    payment_link: str | None = None
    try:
        async with AsyncSessionLocal() as db:
            repo = BookingRepository(db)
            attempt_repo = PaymentAttemptRepository(db)

            booking = await repo.get_for_update(booking_id)
            if not booking:
                logger.error(f"[bg-pesapal] Booking #{booking_id} vanished")
                return

            # Don't re-init if already completed
            if booking.payment_status == "COMPLETED":
                logger.info(f"[bg-pesapal] Booking #{booking_id} already paid — skipping Pesapal init")
                return
            # Don't re-init if a fresh link already exists (< 5 min)
            if booking.payment_redirect_url and booking.updated_at:
                age = datetime.now(timezone.utc) - booking.updated_at.replace(tzinfo=timezone.utc)
                if age < timedelta(minutes=5):
                    logger.info(f"[bg-pesapal] Booking #{booking_id} has fresh link — skipping init")
                    payment_link = booking.payment_redirect_url
                    return

            pesapal = PesapalService()
            ipn_id = settings.PESAPAL_IPN_ID or await pesapal.register_ipn(
                f"{settings.BACKEND_URL}/api/v1/payments/ipn"
            )
            merchant_ref = f"NTS-{booking_id}-{uuid.uuid4().hex[:8].upper()}"
            name_parts = contact_name.split(" ", 1)
            result = await pesapal.submit_order(
                merchant_reference=merchant_ref,
                amount=total_price,
                currency="USD",
                description=f"Safari booking #{booking_id} — {tour_title}",
                callback_url=f"{settings.FRONTEND_URL}/payment/callback",
                ipn_id=ipn_id,
                email=contact_email,
                phone=contact_phone,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else ".",
            )
            payment_link = result["redirect_url"]
            await repo.update(booking, {
                "pesapal_order_tracking_id": result["order_tracking_id"],
                "pesapal_merchant_reference": merchant_ref,
                "payment_status": "PENDING",
                "payment_redirect_url": payment_link,
            })
            await attempt_repo.create(PaymentAttempt(
                booking_id=booking_id,
                order_tracking_id=result["order_tracking_id"],
                merchant_reference=merchant_ref,
                redirect_url=payment_link,
                status="PENDING",
            ))
            await db.commit()
    except Exception as exc:
        logger.error(f"[bg-pesapal] Pesapal init failed for booking #{booking_id}: {exc}")
        # Mark booking so expiry job picks it up
        try:
            async with AsyncSessionLocal() as db:
                repo = BookingRepository(db)
                booking = await repo.get(booking_id)
                if booking and not booking.pesapal_order_tracking_id:
                    await repo.update(booking, {"payment_status": "FAILED"})
                    await db.commit()
        except Exception:
            logger.exception(f"[bg-pesapal] Failed to mark booking #{booking_id} as FAILED")
        return

    # Email: fires after Pesapal completes — no DB session shared.
    email_payment_link = (
        f"{settings.FRONTEND_URL}/payment/resume?id={booking_id}"
        if payment_link else None
    )
    await _send_booking_emails_background(
        booking_id=booking_id,
        tour_title=tour_title,
        contact_name=contact_name,
        contact_email=contact_email,
        contact_phone=contact_phone,
        travel_date=None,  # passed separately below
        guests=0,
        total_price=total_price,
        payment_link=email_payment_link,
        send_payment_version=send_payment_version,
    )

    # Send admin notification
    try:
        await send_booking_admin_notification(
            booking_id=booking_id,
            tour_title=tour_title,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            travel_date=None,
            guests=0,
            total_price=total_price,
        )
    except Exception as exc:
        logger.error(f"[bg-pesapal] Admin notification failed for #{booking_id}: {exc}")


async def send_booking_confirmation_email(
    booking_id: int,
    tour_title: str,
    contact_name: str,
    contact_email: str,
    travel_date,
    guests: int,
    total_price: float,
    payment_link: str | None,
    tour_location: str = "",
    tour_duration: str = "",
    tour_included: list | None = None,
    send_payment_version: bool | None = None,
) -> None:
    """Send booking confirmation email.

    When send_payment_version is None (default) the admin toggle is queried from the DB.
    Passing a bool avoids an extra DB session per email.
    """
    logger.info(f"[email] Preparing booking confirmation for #{booking_id} → {contact_email}")
    try:
        if send_payment_version is None:
            send_payment_version = False
            async with AsyncSessionLocal() as settings_db:
                result = await settings_db.execute(select(SiteSettings).limit(1))
                site_settings = result.scalar_one_or_none()
                if site_settings and site_settings.send_payment_email:
                    send_payment_version = True

        if send_payment_version:
            logger.info(f"[email] Using PAYMENT email template for #{booking_id} (admin toggle ENABLED)")
            await send_payment_booking_confirmation_email(
                booking_id=booking_id,
                tour_title=tour_title,
                contact_name=contact_name,
                contact_email=contact_email,
                travel_date=travel_date,
                guests=guests,
                total_price=total_price,
                payment_link=payment_link,
                tour_location=tour_location,
                tour_duration=tour_duration,
                tour_included=tour_included,
            )
        else:
            logger.info(f"[email] Using CONTACT-ONLY email template for #{booking_id} (admin toggle DISABLED)")
            name = contact_name.split()[0]

            location_line = f"Location          : {tour_location}\n" if tour_location else ""
            duration_line = f"Duration          : {tour_duration}\n" if tour_duration else ""

            included_block = ""
            if tour_included:
                included_block = "\nWhat's Included\n" + "-" * 30 + "\n"
                included_block += "\n".join(f"✓  {item}" for item in tour_included[:8])
                if len(tour_included) > 8:
                    included_block += f"\n   ... and {len(tour_included) - 8} more items"
                included_block += "\n"

            contact_block = (
                "\nContact Us\n"
                f"{'=' * 40}\n"
                f"Phone  : +255 750 005 973\n"
                f"Email  : booking@nelsontoursandsafari.com\n"
                f"WhatsApp: https://wa.me/255750005973\n"
                f"{'=' * 40}\n"
            )

            body = (
                f"Dear {name},\n\n"
                f"Thank you for choosing Nelson Tours & Safari!\n\n"
                f"Your booking request has been received. Our team will contact you shortly to confirm your reservation.\n\n"
                f"Booking Summary\n"
                f"{'=' * 40}\n"
                f"Booking Reference : #{booking_id}\n"
                f"Tour              : {tour_title}\n"
                + location_line
                + duration_line
                + f"Travel Date       : {travel_date.strftime('%B %d, %Y')}\n"
                f"Number of Guests  : {guests} {'Guest' if guests == 1 else 'Guests'}\n"
                f"{'=' * 40}\n"
                + included_block
                + contact_block
                + f"\nOur team will be in touch within 24 hours to assist with any questions.\n\n"
                f"We look forward to crafting an unforgettable safari experience for you.\n\n"
                f"Warm regards,\nNelson Tours & Safari Team"
            )
            bcc_list = [e.strip() for e in settings.BCC_EMAILS.split(",") if e.strip()]
            await send_email(
                to=contact_email,
                subject=f"Booking Confirmed — {tour_title} | Nelson Tours & Safari",
                body=body,
                bcc=bcc_list,
                include_cancellation=False,
            )

        async with AsyncSessionLocal() as rate_db:
            rate_svc = RateLimitService(rate_db)
            await rate_svc.record_email_send(contact_email, action_type="booking_confirmation")
            await rate_db.commit()

        logger.info(f"[email] Booking confirmation {'PAYMENT' if send_payment_version else 'CONTACT'} email sent for #{booking_id}")
    except Exception as exc:
        logger.error(f"[email] Booking confirmation FAILED for #{booking_id}: {type(exc).__name__}: {exc}")


async def _send_booking_emails_background(
    booking_id: int,
    tour_title: str,
    contact_name: str,
    contact_email: str,
    contact_phone: str | None,
    travel_date,
    guests: int,
    total_price: float,
    payment_link: str | None,
    tour_location: str = "",
    tour_duration: str = "",
    tour_included: list | None = None,
    send_payment_version: bool | None = None,
) -> None:
    """Background task: send confirmation + admin notification emails."""
    await send_booking_confirmation_email(
        booking_id=booking_id,
        tour_title=tour_title,
        contact_name=contact_name,
        contact_email=contact_email,
        travel_date=travel_date,
        guests=guests,
        total_price=total_price,
        payment_link=payment_link,
        tour_location=tour_location,
        tour_duration=tour_duration,
        tour_included=tour_included,
        send_payment_version=send_payment_version,
    )
    try:
        await send_booking_admin_notification(
            booking_id=booking_id,
            tour_title=tour_title,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            travel_date=travel_date,
            guests=guests,
            total_price=total_price,
        )
    except Exception as exc:
        logger.error(f"Admin booking notification failed for #{booking_id}: {exc}")


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.tour_repo = TourRepository(db)
        self.attempt_repo = PaymentAttemptRepository(db)

    async def create_booking(self, data: BookingCreate, user: User | None) -> Booking:
        tour = await self.tour_repo.get(data.tour_id)
        if not tour or not tour.is_published:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tour not found")

        # Check email rate limit before proceeding with booking
        rate_limiter = RateLimitService(self.db)
        can_send, error_msg = await rate_limiter.can_send_email(data.contact_email)
        if not can_send:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=error_msg)

        # Serialize concurrent bookings for the same tour+date to prevent double-booking
        await self.booking_repo.acquire_booking_lock(data.tour_id, data.travel_date)

        # Check for overlapping confirmed/pending bookings while lock is held
        duration_days = _parse_duration_days(tour.duration or "")
        if await self.booking_repo.has_confirmed_overlap(data.tour_id, data.travel_date, duration_days):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This tour is already booked for the requested dates.",
            )

        total_price = tour.price * data.guests

        # Snapshot tour scalars before commit expires them
        tour_title = tour.title
        tour_location = tour.location or ""
        tour_duration = tour.duration or ""
        tour_included = list(tour.included or [])

        booking = Booking(
            user_id=user.id if user else None,
            tour_id=data.tour_id,
            travel_date=data.travel_date,
            guests=data.guests,
            total_price=total_price,
            status=BookingStatus.pending,
            special_requests=data.special_requests,
            contact_name=data.contact_name,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
        )
        booking = await self.booking_repo.create(booking)

        # ── Commit: persist booking row and release the advisory lock. ──────────
        # The DB session / connection is released here.  Everything after this
        # runs in background tasks on independent sessions, so the request handler
        # never blocks on Pesapal (2–20s) or email (Resend API).
        await self.db.commit()
        booking_id = booking.id

        # Invalidate availability cache for this tour+date so subsequent
        # overlap checks see the new booking immediately (or within 30s).
        from app.core.cache import cache_delete
        _ = asyncio.ensure_future(cache_delete(
            f"availability:{data.tour_id}:{data.travel_date.isoformat()}"
        ))

        # Look up send_payment_email toggle (on the already-committed session — fast)
        _send_payment = False
        try:
            _result = await self.db.execute(select(SiteSettings).limit(1))
            _settings = _result.scalar_one_or_none()
            if _settings and _settings.send_payment_email:
                _send_payment = True
        except Exception:
            logger.warning("[email] Failed to read SiteSettings toggle — using default (no payment)")

        logger.info(
            f"Booking #{booking_id} created — queueing Pesapal init + emails for "
            f"{data.contact_email} (send_payment={_send_payment})"
        )

        # Fire background tasks — these open their own DB sessions.
        if settings.PESAPAL_CONSUMER_KEY and settings.PESAPAL_CONSUMER_SECRET:
            _t = asyncio.create_task(_init_pesapal_background(
                booking_id=booking_id,
                tour_title=tour_title,
                contact_name=data.contact_name,
                contact_email=data.contact_email,
                contact_phone=data.contact_phone,
                total_price=total_price,
                send_payment_version=_send_payment,
            ))
            _background_tasks.add(_t)
            _t.add_done_callback(_background_tasks.discard)

        # Re-fetch so the returned object is fully loaded and not in an expired state.
        return await self.booking_repo.get(booking_id)

    async def get_booking(self, booking_id: int, user: User) -> Booking:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if user.role.value != "admin" and booking.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return booking

    async def list_user_bookings(self, user: User, page: int = 1, per_page: int = 10) -> PaginatedBookings:
        skip = (page - 1) * per_page
        bookings = await self.booking_repo.get_by_user(user.id, skip=skip, limit=per_page)
        total = await self.booking_repo.count_by_user(user.id)
        return PaginatedBookings(
            items=bookings,
            total=total,
            page=page,
            per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def list_all_bookings(self, page: int = 1, per_page: int = 20) -> PaginatedBookings:
        skip = (page - 1) * per_page
        bookings = await self.booking_repo.get_all_paginated(skip=skip, limit=per_page)
        total = await self.booking_repo.count()
        return PaginatedBookings(
            items=bookings,
            total=total,
            page=page,
            per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    # Valid booking status transitions
    _VALID_TRANSITIONS: dict[BookingStatus, set[BookingStatus]] = {
        BookingStatus.pending: {BookingStatus.confirmed, BookingStatus.cancelled},
        BookingStatus.confirmed: {BookingStatus.completed, BookingStatus.cancelled},
        BookingStatus.cancelled: {BookingStatus.pending},
        BookingStatus.completed: set(),
    }

    async def update_status(self, booking_id: int, data: BookingStatusUpdate) -> Booking:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        allowed = self._VALID_TRANSITIONS.get(booking.status, set())
        if data.status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from '{booking.status.value}' to '{data.status.value}'",
            )
        was_pending = booking.status != BookingStatus.confirmed
        update_data = {"status": data.status}
        if data.notes:
            update_data["notes"] = data.notes
        updated = await self.booking_repo.update(booking, update_data)
        # Notify customer when admin manually confirms (bank transfer, etc.)
        if data.status == BookingStatus.confirmed and was_pending:
            tour = updated.tour
            task = asyncio.create_task(send_payment_success_email(
                booking_id=updated.id,
                tour_title=tour.title if tour else f"Booking #{updated.id}",
                contact_name=updated.contact_name,
                contact_email=updated.contact_email,
                travel_date=updated.travel_date,
                guests=updated.guests,
                total_price=updated.total_price,
                transaction_id=updated.pesapal_order_tracking_id or "Admin-Confirmed",
            ))
            _background_tasks.add(task)
            task.add_done_callback(_background_tasks.discard)
        return updated

    async def admin_update(self, booking_id: int, data: BookingAdminUpdate) -> Booking:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        # Guard: financial and date fields must not be mutated on a completed booking
        # to preserve payment audit accuracy.
        if booking.status in (BookingStatus.confirmed, BookingStatus.completed):
            protected = {"guests", "total_price", "travel_date"} & set(update_data)
            if protected:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot modify {sorted(protected)} on a completed booking",
                )
        # Recalculate total_price when guests change without an explicit new price
        if "guests" in update_data and "total_price" not in update_data:
            tour = await self.tour_repo.get(booking.tour_id)
            if tour:
                update_data["total_price"] = tour.price * update_data["guests"]
        return await self.booking_repo.update(booking, update_data)

    async def delete_booking(self, booking_id: int) -> None:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        await self.booking_repo.delete(booking)
