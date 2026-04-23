import re
import uuid

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.repositories.booking import BookingRepository
from app.repositories.tour import TourRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingAdminUpdate, PaginatedBookings
from app.services.email_service import send_email, send_booking_admin_notification
from app.services.pesapal import PesapalService


def _parse_duration_days(duration: str) -> int:
    """Extract the number of days from a string like '3 Days', '7 days / 6 nights'."""
    m = re.search(r'(\d+)\s*day', duration, re.IGNORECASE)
    return int(m.group(1)) if m else 1


async def send_booking_confirmation_email(
    booking: "Booking",
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
) -> None:
    """Send booking confirmation email. Re-usable from create_booking & initiate_payment."""
    logger.info(f"[email] Preparing booking confirmation for #{booking.id} → {contact_email}")
    try:
        name = contact_name.split()[0]

        email_payment_link = payment_link or f"{settings.FRONTEND_URL}/contact"
        has_pesapal = payment_link is not None

        if has_pesapal:
            payment_instruction = (
                "Please complete your deposit payment using the button below "
                "to secure your reservation."
            )
        else:
            payment_instruction = (
                "To complete your payment and secure this reservation, "
                "please contact our team — we will send you a secure payment link within the hour."
            )

        location_line = f"Location          : {tour_location}\n" if tour_location else ""
        duration_line = f"Duration          : {tour_duration}\n" if tour_duration else ""

        included_block = ""
        if tour_included:
            included_block = "\nWhat's Included\n" + "-" * 30 + "\n"
            included_block += "\n".join(f"✓  {item}" for item in tour_included[:8])
            if len(tour_included) > 8:
                included_block += f"\n   ... and {len(tour_included) - 8} more items"
            included_block += "\n"

        body = (
            f"Dear {name},\n\n"
            f"Thank you for choosing Nelson Tours & Safari!\n\n"
            f"Your booking request has been received. {payment_instruction}\n\n"
            f"Booking Summary\n"
            f"{'=' * 40}\n"
            f"Booking Reference : #{booking.id}\n"
            f"Tour              : {tour_title}\n"
            + location_line
            + duration_line
            + f"Travel Date       : {travel_date.strftime('%B %d, %Y')}\n"
            f"Number of Guests  : {guests} {'Guest' if guests == 1 else 'Guests'}\n"
            f"{'=' * 40}\n"
            + included_block
            + f"\nOur team will be in touch within 24 hours to assist with any questions.\n\n"
            f"We look forward to crafting an unforgettable safari experience for you.\n\n"
            f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
        )
        await send_email(
            to=contact_email,
            subject=f"Booking Confirmed — {tour_title} | Nelson Tours & Safari",
            body=body,
            item_name=f"{tour_title} · {guests} {'Guest' if guests == 1 else 'Guests'}",
            price=total_price,
            payment_link=email_payment_link,
            btn_label="Complete Payment" if has_pesapal else "Contact Us to Pay",
            include_terms=True,
        )
    except Exception as exc:
        logger.error(f"[email] Booking confirmation FAILED for #{booking.id}: {type(exc).__name__}: {exc}")


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.tour_repo = TourRepository(db)

    async def create_booking(self, data: BookingCreate, user: User | None) -> Booking:
        tour = await self.tour_repo.get(data.tour_id)
        if not tour or not tour.is_published:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tour not found")

        duration_days = _parse_duration_days(tour.duration)
        if await self.booking_repo.has_confirmed_overlap(tour.id, data.travel_date, duration_days):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This tour is already booked and confirmed for the selected dates. Please choose different dates.",
            )

        total_price = tour.price * data.guests

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

        payment_link: str | None = None

        if settings.PESAPAL_CONSUMER_KEY and settings.PESAPAL_CONSUMER_SECRET:
            try:
                pesapal = PesapalService()
                ipn_id = settings.PESAPAL_IPN_ID or await pesapal.register_ipn(
                    f"{settings.BACKEND_URL}/api/v1/payments/ipn"
                )
                merchant_ref = f"NTS-{booking.id}-{uuid.uuid4().hex[:8].upper()}"
                name_parts = data.contact_name.split(" ", 1)
                result = await pesapal.submit_order(
                    merchant_reference=merchant_ref,
                    amount=total_price,
                    currency="USD",
                    description=f"Safari booking #{booking.id} — {tour.title}",
                    callback_url=f"{settings.FRONTEND_URL}/payment/callback",
                    ipn_id=ipn_id,
                    email=data.contact_email,
                    phone=data.contact_phone,
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
            except Exception as exc:
                logger.error(f"Pesapal init failed for booking #{booking.id}: {exc}")

        # Always send confirmation email immediately after booking is created.
        # If Pesapal succeeded, payment_link contains the redirect URL.
        # If Pesapal failed or is not configured, payment_link is None and
        # send_booking_confirmation_email will fall back to a contact link.
        email_payment_link = (
            f"{settings.FRONTEND_URL}/payment/resume?id={booking.id}"
            if payment_link else None
        )
        logger.info(f"Booking #{booking.id} created — sending confirmation to {data.contact_email} (payment_link={'set' if payment_link else 'none'})")
        await send_booking_confirmation_email(
            booking=booking,
            tour_title=tour.title,
            contact_name=data.contact_name,
            contact_email=data.contact_email,
            travel_date=data.travel_date,
            guests=data.guests,
            total_price=total_price,
            payment_link=email_payment_link,
            tour_location=tour.location or "",
            tour_duration=tour.duration or "",
            tour_included=tour.included or [],
        )

        try:
            await send_booking_admin_notification(
                booking_id=booking.id,
                tour_title=tour.title,
                contact_name=data.contact_name,
                contact_email=data.contact_email,
                contact_phone=data.contact_phone,
                travel_date=data.travel_date,
                guests=data.guests,
                total_price=total_price,
            )
        except Exception as exc:
            logger.error(f"Admin booking notification failed for #{booking.id}: {exc}")

        return booking

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

    async def update_status(self, booking_id: int, data: BookingStatusUpdate) -> Booking:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        update_data = {"status": data.status}
        if data.notes:
            update_data["notes"] = data.notes
        return await self.booking_repo.update(booking, update_data)

    async def admin_update(self, booking_id: int, data: BookingAdminUpdate) -> Booking:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        return await self.booking_repo.update(booking, update_data)

    async def delete_booking(self, booking_id: int) -> None:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        await self.booking_repo.delete(booking)
