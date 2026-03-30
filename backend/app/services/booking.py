from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.repositories.booking import BookingRepository
from app.repositories.tour import TourRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, PaginatedBookings


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
        return await self.booking_repo.create(booking)

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
