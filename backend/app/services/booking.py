import uuid

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.repositories.booking import BookingRepository
from app.repositories.tour import TourRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, PaginatedBookings
from app.services.email_service import send_email
from app.services.pesapal import PesapalService


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.tour_repo = TourRepository(db)

    async def create_booking(self, data: BookingCreate, user: User) -> Booking:
        tour = await self.tour_repo.get(data.tour_id)
        if not tour or not tour.is_published:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tour not found")

        total_price = tour.price * data.guests

        booking = Booking(
            user_id=user.id,
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

        if settings.SENDGRID_API_KEY:
            try:
                name = data.contact_name.split()[0]
                body = (
                    f"Dear {name},\n\n"
                    f"Thank you for choosing Nelson Tours & Safari!\n\n"
                    f"Your booking request has been received and is pending payment confirmation. "
                    f"Please complete your deposit payment using the button below to secure your reservation.\n\n"
                    f"Booking Reference : #{booking.id}\n"
                    f"Tour              : {tour.title}\n"
                    f"Travel Date       : {data.travel_date.strftime('%B %d, %Y')}\n"
                    f"Guests            : {data.guests}\n\n"
                    f"Our team will be in touch within 24 hours to assist with any questions.\n\n"
                    f"We look forward to crafting an unforgettable safari experience for you.\n\n"
                    f"Warm regards,\nNelson Tours & Safari Team"
                )
                await send_email(
                    to=data.contact_email,
                    subject=f"Booking Request Received — {tour.title} | Nelson Tours & Safari",
                    body=body,
                    item_name=f"{tour.title} · {data.guests} guest{'s' if data.guests > 1 else ''}",
                    price=total_price,
                    payment_link=payment_link,
                    include_terms=True,
                )
            except Exception as exc:
                logger.error(f"Booking confirmation email failed for #{booking.id}: {exc}")

        return booking

    async def get_booking(self, booking_id: int, user: User) -> Booking:
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking.user_id != user.id and user.role.value != "admin":
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
