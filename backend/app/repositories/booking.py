from datetime import date, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.booking import Booking, BookingStatus
from app.repositories.base import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    def __init__(self, db: AsyncSession):
        super().__init__(Booking, db)

    @staticmethod
    def _eager(stmt):
        """Eagerly load tour & user to avoid lazy-load in async mode."""
        return stmt.options(selectinload(Booking.tour), selectinload(Booking.user))

    async def get(self, id: int) -> Optional[Booking]:
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == id))
        )
        return result.scalar_one_or_none()

    async def create(self, obj: Booking) -> Booking:
        self.db.add(obj)
        await self.db.flush()
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == obj.id))
        )
        return result.scalar_one()

    async def update(self, obj: Booking, data: dict) -> Booking:
        for key, value in data.items():
            if value is not None and hasattr(obj, key):
                setattr(obj, key, value)
        await self.db.flush()
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == obj.id))
        )
        return result.scalar_one()

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> list[Booking]:
        result = await self.db.execute(
            self._eager(
                select(Booking)
                .where(Booking.user_id == user_id)
                .order_by(Booking.created_at.desc())
                .offset(skip).limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def count_by_user(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.user_id == user_id)
        )
        return result.scalar_one()

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[Booking]:
        result = await self.db.execute(
            self._eager(
                select(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def count_by_status(self, status: BookingStatus) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.status == status)
        )
        return result.scalar_one()

    async def get_by_tracking_id(self, tracking_id: str) -> Optional[Booking]:
        result = await self.db.execute(
            self._eager(
                select(Booking).where(Booking.pesapal_order_tracking_id == tracking_id)
            )
        )
        return result.scalar_one_or_none()

    async def has_confirmed_overlap(
        self,
        tour_id: int,
        travel_date: date,
        duration_days: int,
        exclude_booking_id: int | None = None,
    ) -> bool:
        """Return True if a confirmed & paid booking already covers the date range."""
        window = timedelta(days=max(duration_days - 1, 0))
        range_start = travel_date - window
        range_end = travel_date + window

        stmt = (
            select(func.count())
            .select_from(Booking)
            .where(
                Booking.tour_id == tour_id,
                Booking.status == BookingStatus.confirmed,
                Booking.payment_status == "COMPLETED",
                Booking.travel_date >= range_start,
                Booking.travel_date <= range_end,
            )
        )
        if exclude_booking_id:
            stmt = stmt.where(Booking.id != exclude_booking_id)

        result = await self.db.execute(stmt)
        return result.scalar_one() > 0

    async def get_total_revenue(self) -> float:
        result = await self.db.execute(
            select(func.sum(Booking.total_price)).where(Booking.status == BookingStatus.confirmed)
        )
        return result.scalar_one() or 0.0
