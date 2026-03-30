from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.trip_plan import TripPlan, TripPlanStatus
from app.repositories.base import BaseRepository


class TripPlanRepository(BaseRepository[TripPlan]):
    def __init__(self, db: AsyncSession):
        super().__init__(TripPlan, db)

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[TripPlan]:
        result = await self.db.execute(
            select(TripPlan).order_by(TripPlan.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> list[TripPlan]:
        result = await self.db.execute(
            select(TripPlan)
            .where(TripPlan.user_id == user_id)
            .order_by(TripPlan.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_pending(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(TripPlan).where(TripPlan.status == TripPlanStatus.pending)
        )
        return result.scalar_one()
