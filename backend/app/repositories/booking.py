from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.booking import Booking, BookingStatus
from app.repositories.base import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    def __init__(self, db: AsyncSession):
        super().__init__(Booking, db)

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> list[Booking]:
        result = await self.db.execute(
            select(Booking)
            .where(Booking.user_id == user_id)
            .order_by(Booking.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_user(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.user_id == user_id)
        )
        return result.scalar_one()

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[Booking]:
        result = await self.db.execute(
            select(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_status(self, status: BookingStatus) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.status == status)
        )
        return result.scalar_one()

    async def get_by_tracking_id(self, tracking_id: str) -> Optional[Booking]:
        result = await self.db.execute(
            select(Booking).where(Booking.pesapal_order_tracking_id == tracking_id)
        )
        return result.scalar_one_or_none()

    async def get_total_revenue(self) -> float:
        result = await self.db.execute(
            select(func.sum(Booking.total_price)).where(Booking.status == BookingStatus.confirmed)
        )
        return result.scalar_one() or 0.0
