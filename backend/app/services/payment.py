import asyncio
import re
import uuid
from typing import Optional, Set

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.booking import Booking, BookingStatus
from app.models.payment_attempt import PaymentAttempt
from app.models.user import User
from app.repositories.booking import BookingRepository
from app.repositories.payment_attempt import PaymentAttemptRepository
from app.repositories.tour import TourRepository
from app.services.booking import send_booking_confirmation_email
from app.services.email_service import send_payment_success_email, send_email as _send_email
from app.services.pesapal import PesapalService

_background_tasks: Set[asyncio.Task] = set()
_TERMINAL_PAYMENT_STATES = frozenset({"COMPLETED", "FAILED", "INVALID", "REVERSED"})


class PaymentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.tour_repo = TourRepository(db)
        self.attempt_repo = PaymentAttemptRepository(db)
        self.pesapal = PesapalService()

    # ── IPN ID ───────────────────────────────────────────────────────

    async def _get_or_register_ipn_id(self) -> str:
        """Use pre-configured IPN ID or register one on the fly."""
        if settings.PESAPAL_IPN_ID:
            return settings.PESAPAL_IPN_ID
        ipn_url = f"{settings.BACKEND_URL}/api/v1/payments/ipn"
        return await self.pesapal.register_ipn(ipn_url)

    # ── Initiate Payment ─────────────────────────────────────────────

    async def initiate_payment(self, booking_id: int, user: User | None) -> dict:
        """Create a Pesapal order for the given booking and return the redirect URL."""
        booking = await self.booking_repo.get_for_update(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        # Ownership: if booking belongs to a user, require auth as that user or admin
        if booking.user_id is not None:
            if not user or (booking.user_id != user.id and user.role.value != "admin"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if not settings.PESAPAL_CONSUMER_KEY or not settings.PESAPAL_CONSUMER_SECRET:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment gateway not configured",
            )

        if booking.payment_status == "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking has already been paid",
            )

        # Idempotency: if a PENDING payment was initiated recently (< 5 min),
        # return the existing redirect URL instead of creating a duplicate order.
        if (
            booking.payment_status == "PENDING"
            and booking.payment_redirect_url
            and booking.updated_at
        ):
            from datetime import datetime, timezone, timedelta
            age = datetime.now(timezone.utc) - booking.updated_at.replace(tzinfo=timezone.utc)
            if age < timedelta(minutes=5):
                return {
                    "redirect_url": booking.payment_redirect_url,
                    "order_tracking_id": booking.pesapal_order_tracking_id,
                    "merchant_reference": booking.pesapal_merchant_reference,
                    "booking_id": booking.id,
                }

        merchant_reference = f"NTS-{booking.id}-{uuid.uuid4().hex[:8].upper()}"
        callback_url = f"{settings.FRONTEND_URL}/payment/callback"

        name_parts = booking.contact_name.split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "."

        try:
            ipn_id = await self._get_or_register_ipn_id()
            result = await self.pesapal.submit_order(
                merchant_reference=merchant_reference,
                amount=booking.total_price,
                currency="USD",
                description=f"Safari booking #{booking.id} — Nelson Tours & Safari",
                callback_url=callback_url,
                ipn_id=ipn_id,
                email=booking.contact_email,
                phone=booking.contact_phone,
                first_name=first_name,
                last_name=last_name,
            )
        except Exception as exc:
            logger.error(f"Pesapal payment initiation failed for booking {booking_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Payment gateway error: {exc}",
            )

        # Check whether a confirmation email was sent for the CURRENT payment link.
        # A URL older than 5 minutes is stale/expired, so send a fresh notification.
        email_already_sent = False
        if booking.payment_redirect_url and booking.updated_at:
            from datetime import datetime, timezone, timedelta
            age = datetime.now(timezone.utc) - booking.updated_at.replace(tzinfo=timezone.utc)
            email_already_sent = age < timedelta(minutes=5)

        await self.booking_repo.update(booking, {
            "pesapal_order_tracking_id": result["order_tracking_id"],
            "pesapal_merchant_reference": merchant_reference,
            "payment_status": "PENDING",
            "payment_redirect_url": result["redirect_url"],
        })
        await self.attempt_repo.create(PaymentAttempt(
            booking_id=booking.id,
            order_tracking_id=result["order_tracking_id"],
            merchant_reference=merchant_reference,
            redirect_url=result["redirect_url"],
            status="PENDING",
        ))

        if not email_already_sent:
            tour = booking.tour
            resume_link = f"{settings.FRONTEND_URL}/payment/resume?id={booking.id}"
            _t = asyncio.create_task(send_booking_confirmation_email(
                booking_id=booking.id,
                tour_title=tour.title if tour else f"Booking #{booking.id}",
                contact_name=booking.contact_name,
                contact_email=booking.contact_email,
                travel_date=booking.travel_date,
                guests=booking.guests,
                total_price=booking.total_price,
                payment_link=resume_link,
                tour_location=tour.location if tour else "",
                tour_duration=tour.duration if tour else "",
                tour_included=tour.included if tour else [],
            ))
            _background_tasks.add(_t)
            _t.add_done_callback(_background_tasks.discard)

        return {
            "redirect_url": result["redirect_url"],
            "order_tracking_id": result["order_tracking_id"],
            "merchant_reference": merchant_reference,
            "booking_id": booking.id,
        }

    # ── IPN Callback ─────────────────────────────────────────────────

    # Compiled pattern for valid NTS merchant references (NTS-{id}-{8 hex chars}).
    _MERCHANT_REF_RE = re.compile(r"^NTS-(\d+)-[A-F0-9]{8}$", re.IGNORECASE)

    async def handle_ipn(
        self,
        order_tracking_id: str,
        merchant_reference: Optional[str] = None,
    ) -> dict:
        """Handle Pesapal IPN — update booking payment & booking status.

        Transaction discipline
        ─────────────────────
        TX-1  Acquire row-level locks; snapshot IDs & contact data; commit so locks
              are released *before* the outbound Pesapal HTTP call (2–20 s).
        HTTP  Query Pesapal with no DB lock held.
        TX-2  Re-acquire locks, write authoritative status, commit.
        BG    Fire confirmation email as asyncio background task — never blocks.
        """
        # ── TX-1 : resolve attempt → booking, snapshot, commit ───────────────
        attempt = await self.attempt_repo.get_by_tracking_id_for_update(order_tracking_id)

        if not attempt and merchant_reference:
            if self._MERCHANT_REF_RE.match(merchant_reference.strip()):
                attempt = await self.attempt_repo.get_by_merchant_reference(
                    merchant_reference.strip()
                )
                if attempt:
                    logger.info(
                        f"IPN fallback: matched attempt #{attempt.id} via "
                        f"merchant_reference {merchant_reference}"
                    )

        use_legacy = False
        booking_id: Optional[int] = None
        attempt_merchant_ref: Optional[str] = None

        if attempt:
            booking_snap = await self.booking_repo.get_for_update(attempt.booking_id)
            if not booking_snap:
                logger.warning(
                    f"IPN: booking #{attempt.booking_id} not found for attempt #{attempt.id}"
                )
                await self.db.commit()
                return {"status": "200", "message": "IPN received"}
            booking_id = booking_snap.id
            attempt_merchant_ref = attempt.merchant_reference
            _tour = booking_snap.tour  # eager-loaded; attributes persist after commit
            _email_ctx = dict(
                booking_id=booking_snap.id,
                tour_title=_tour.title if _tour else f"Booking #{booking_snap.id}",
                contact_name=booking_snap.contact_name,
                contact_email=booking_snap.contact_email,
                travel_date=booking_snap.travel_date,
                guests=booking_snap.guests,
                total_price=booking_snap.total_price,
            )
        else:
            # RB-2 — Legacy: booking created before the payment_attempts migration.
            # Tier 1: tracking-ID column on the booking row itself.
            # Tier 2: merchant_reference column (handles callbacks where Pesapal
            #         sends a different tracking ID than the one we stored).
            booking_snap = await self.booking_repo.get_by_tracking_id_for_update(
                order_tracking_id
            )
            if booking_snap:
                logger.info(
                    f"IPN legacy fallback: matched booking #{booking_snap.id} "
                    f"by tracking_id (pre-migration)"
                )
            elif merchant_reference:
                booking_snap = await self.booking_repo.get_by_merchant_reference_for_update(
                    merchant_reference.strip()
                )
                if booking_snap:
                    logger.info(
                        f"IPN legacy fallback: matched booking #{booking_snap.id} "
                        f"by merchant_reference={merchant_reference} (pre-migration)"
                    )
            if not booking_snap:
                logger.warning(
                    f"IPN received for unknown tracking_id={order_tracking_id} "
                    f"merchant_reference={merchant_reference} — no attempt or booking found"
                )
                await self.db.commit()
                return {"status": "200", "message": "IPN received"}
            use_legacy = True
            booking_id = booking_snap.id
            attempt_merchant_ref = merchant_reference
            _tour = booking_snap.tour
            _email_ctx = dict(
                booking_id=booking_snap.id,
                tour_title=_tour.title if _tour else f"Booking #{booking_snap.id}",
                contact_name=booking_snap.contact_name,
                contact_email=booking_snap.contact_email,
                travel_date=booking_snap.travel_date,
                guests=booking_snap.guests,
                total_price=booking_snap.total_price,
            )

        # Release all row-level locks BEFORE any outbound network call.
        await self.db.commit()

        # ── HTTP : query Pesapal — no DB lock held ────────────────────────────
        try:
            status_data = await self.pesapal.get_transaction_status(order_tracking_id)
        except Exception as exc:
            logger.error(f"Failed to query Pesapal status for {order_tracking_id}: {exc}")
            return {"status": "200", "message": "IPN received"}

        payment_status = status_data.get("payment_status_description", "").upper()

        # ── TX-2 : re-lock → write ─────────────────────────────────────────────
        booking = await self.booking_repo.get_for_update(booking_id)
        if not booking:
            logger.error(f"IPN TX-2: booking #{booking_id} disappeared between transactions")
            return {"status": "200", "message": "IPN received"}

        if not use_legacy:
            attempt = await self.attempt_repo.get_by_tracking_id_for_update(order_tracking_id)
            if attempt:
                await self.attempt_repo.update_status(attempt, payment_status)

        is_latest = booking.pesapal_order_tracking_id == order_tracking_id
        already_confirmed = booking.status == BookingStatus.confirmed
        booking_updates: dict = {}
        send_confirmation_email = False

        if payment_status == "COMPLETED":
            booking_updates["payment_status"] = payment_status
            if booking.status == BookingStatus.cancelled:
                # RB-3 — never silently reactivate a cancelled booking.
                logger.warning(
                    f"IPN COMPLETED for cancelled booking #{booking.id} "
                    f"— not reactivating. Manual review required."
                )
            elif not already_confirmed:
                booking_updates["status"] = BookingStatus.confirmed
                send_confirmation_email = True
                logger.info(
                    f"Booking #{booking.id} confirmed via Pesapal IPN "
                    f"(tracking={order_tracking_id})"
                )
        elif is_latest:
            booking_updates["payment_status"] = payment_status
            if payment_status in ("FAILED", "INVALID", "REVERSED"):
                logger.warning(f"Booking #{booking.id} latest payment {payment_status}")
        else:
            logger.info(
                f"IPN for stale attempt (tracking={order_tracking_id}): "
                f"booking #{booking.id} current={booking.pesapal_order_tracking_id} "
                f"— not applied"
            )

        if booking_updates:
            await self.booking_repo.update(booking, booking_updates)

        # ── BG : email fired after write, no locks held ───────────────────────
        if send_confirmation_email:
            _t = asyncio.create_task(
                send_payment_success_email(**_email_ctx, transaction_id=order_tracking_id)
            )
            _background_tasks.add(_t)
            _t.add_done_callback(_background_tasks.discard)

        return {
            "orderNotificationType": "IPNCHANGE",
            "orderTrackingId": order_tracking_id,
            "orderMerchantReference": attempt_merchant_ref or merchant_reference,
            "status": "200",
        }

    # ── Resend Payment Link ───────────────────────────────────────────

    async def resend_payment_link(self, email: str, booking_ref: str) -> None:
        """Find a booking by email + ref, generate a fresh payment link if needed, and email it."""
        import re
        booking_id_int: Optional[int] = None

        # Resolve booking ID from NTS-{id}-XXXX or plain numeric ref
        match = re.match(r"^NTS-(\d+)-", booking_ref.strip().upper())
        if match:
            booking_id_int = int(match.group(1))
        elif booking_ref.strip().isdigit():
            booking_id_int = int(booking_ref.strip())

        if not booking_id_int:
            logger.warning(f"resend-link: unparseable ref={booking_ref}")
            return

        # FOR UPDATE prevents two concurrent resend calls from both creating Pesapal orders
        booking = await self.booking_repo.get_for_update(booking_id_int)

        # Security: silently ignore if not found or email doesn't match
        if not booking or booking.contact_email.lower() != email.lower():
            logger.warning(f"resend-link: no match for email={email} ref={booking_ref}")
            return

        if booking.payment_status == "COMPLETED":
            logger.info(f"resend-link: booking #{booking.id} already paid — skipping")
            return

        # 5-min idempotency: if a fresh pending order exists, resend that URL without
        # creating yet another Pesapal order (prevents duplicate orders on double-click).
        if booking.payment_redirect_url and booking.updated_at:
            from datetime import datetime, timezone, timedelta
            age = datetime.now(timezone.utc) - booking.updated_at.replace(tzinfo=timezone.utc)
            if age < timedelta(minutes=5):
                tour = booking.tour
                tour_title = tour.title if tour else f"Booking #{booking.id}"
                first = booking.contact_name.split()[0]
                _email_kw = dict(
                    to=booking.contact_email,
                    subject=f"Your Payment Link — {tour_title} | Nelson Tours & Safari",
                    body=(
                        f"Dear {first},\n\nHere is your payment link for booking "
                        f"#{booking.id} — {tour_title}.\n\nClick the button below to complete "
                        f"your secure payment.\n\nWarm regards,\nNelson Tours & Safari Team"
                    ),
                    item_name=f"{tour_title} · {booking.guests} {'Guest' if booking.guests == 1 else 'Guests'}",
                    price=booking.total_price,
                    payment_link=f"{settings.FRONTEND_URL}/payment/resume?id={booking.id}",
                    btn_label="Complete Payment",
                )
                _log_id = booking.id
                await self.db.commit()  # release FOR UPDATE lock before I/O
                _t = asyncio.create_task(_send_email(**_email_kw))
                _background_tasks.add(_t)
                _t.add_done_callback(_background_tasks.discard)
                logger.info(f"resend-link: existing fresh link resent for booking #{_log_id} to {email}")
                return

        tour = booking.tour
        tour_title = tour.title if tour else f"Booking #{booking.id}"

        # Generate a fresh Pesapal order — stored links expire after ~1 hour
        try:
            ipn_id = await self._get_or_register_ipn_id()
            merchant_ref = f"NTS-{booking.id}-{uuid.uuid4().hex[:8].upper()}"
            name_parts = booking.contact_name.split(" ", 1)
            result = await self.pesapal.submit_order(
                merchant_reference=merchant_ref,
                amount=booking.total_price,
                currency="USD",
                description=f"Safari booking #{booking.id} — {tour_title}",
                callback_url=f"{settings.FRONTEND_URL}/payment/callback",
                ipn_id=ipn_id,
                email=booking.contact_email,
                phone=booking.contact_phone,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else ".",
            )
            payment_link = result["redirect_url"]
            await self.booking_repo.update(booking, {
                "pesapal_order_tracking_id": result["order_tracking_id"],
                "pesapal_merchant_reference": merchant_ref,
                "payment_status": "PENDING",
                "payment_redirect_url": payment_link,
            })
            await self.attempt_repo.create(PaymentAttempt(
                booking_id=booking.id,
                order_tracking_id=result["order_tracking_id"],
                merchant_reference=merchant_ref,
                redirect_url=payment_link,
                status="PENDING",
            ))
        except Exception as exc:
            logger.error(f"resend-link: Pesapal order failed for booking #{booking.id}: {exc}")
            return

        first = booking.contact_name.split()[0]
        body = (
            f"Dear {first},\n\n"
            f"Here is your payment link for booking #{booking.id} — {tour_title}.\n\n"
            f"Click the button below to complete your secure payment. "
            f"If the link has expired, please contact us and we will send you a new one.\n\n"
            f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
        )
        resume_link = f"{settings.FRONTEND_URL}/payment/resume?id={booking.id}"
        _email_kw = dict(
            to=booking.contact_email,
            subject=f"Your Payment Link — {tour_title} | Nelson Tours & Safari",
            body=body,
            item_name=f"{tour_title} · {booking.guests} {'Guest' if booking.guests == 1 else 'Guests'}",
            price=booking.total_price,
            payment_link=resume_link,
            btn_label="Complete Payment",
        )
        _log_id = booking.id
        await self.db.commit()  # release FOR UPDATE lock before I/O
        _t = asyncio.create_task(_send_email(**_email_kw))
        _background_tasks.add(_t)
        _t.add_done_callback(_background_tasks.discard)
        logger.info(f"resend-link: payment link resent for booking #{_log_id} to {email}")

    # ── Poll Status ──────────────────────────────────────────────────

    async def get_payment_status(self, booking_id: int, user: User | None) -> dict:
        """Poll Pesapal for latest payment status and sync to booking.

        Short-circuits for terminal states to avoid hammering Pesapal and writing
        unchanged status on every frontend poll.  Acquires a write lock only when
        a confirmed status transition actually needs to be written.
        """
        booking = await self.booking_repo.get(booking_id)   # plain read — no lock
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking.user_id is not None:
            if not user or (booking.user_id != user.id and user.role.value != "admin"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if not booking.pesapal_order_tracking_id:
            return {
                "payment_status": "NOT_INITIATED",
                "booking_status": booking.status,
                "booking_id": booking.id,
            }

        current_status = booking.payment_status or "UNKNOWN"

        # Short-circuit: terminal failure states never change — skip HTTP + DB entirely.
        if current_status in ("FAILED", "INVALID", "REVERSED"):
            return {
                "payment_status": current_status,
                "booking_status": booking.status,
                "booking_id": booking.id,
                "order_tracking_id": booking.pesapal_order_tracking_id,
                "redirect_url": booking.payment_redirect_url,
            }
        # Short-circuit: fully confirmed — nothing left to do.
        if current_status == "COMPLETED" and booking.status == BookingStatus.confirmed:
            return {
                "payment_status": current_status,
                "booking_status": booking.status,
                "booking_id": booking.id,
                "order_tracking_id": booking.pesapal_order_tracking_id,
                "redirect_url": booking.payment_redirect_url,
            }

        payment_status = current_status
        try:
            status_data = await self.pesapal.get_transaction_status(
                booking.pesapal_order_tracking_id
            )   # external call — no DB lock held here
            payment_status = status_data.get("payment_status_description", "UNKNOWN").upper()

            if payment_status == "COMPLETED" and booking.status != BookingStatus.confirmed:
                # Acquire lock only for the write; re-check to avoid duplicate emails.
                locked = await self.booking_repo.get_for_update(booking_id)
                if locked and locked.status != BookingStatus.confirmed:
                    await self.booking_repo.update(locked, {
                        "payment_status": payment_status,
                        "status": BookingStatus.confirmed,
                    })
                    tour = locked.tour
                    _s = asyncio.create_task(send_payment_success_email(
                        booking_id=locked.id,
                        tour_title=tour.title if tour else f"Booking #{locked.id}",
                        contact_name=locked.contact_name,
                        contact_email=locked.contact_email,
                        travel_date=locked.travel_date,
                        guests=locked.guests,
                        total_price=locked.total_price,
                        transaction_id=booking.pesapal_order_tracking_id,
                    ))
                    _background_tasks.add(_s)
                    _s.add_done_callback(_background_tasks.discard)
            elif payment_status != current_status:
                # Only write if status actually changed — avoids constant flush storm.
                await self.booking_repo.update(booking, {"payment_status": payment_status})

        except Exception as exc:
            logger.error(f"Status poll failed for booking {booking_id}: {exc}")

        return {
            "payment_status": payment_status,
            "booking_status": booking.status,
            "booking_id": booking.id,
            "order_tracking_id": booking.pesapal_order_tracking_id,
            "redirect_url": booking.payment_redirect_url,
        }
