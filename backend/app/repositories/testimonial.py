from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.testimonial import Testimonial
from app.repositories.base import BaseRepository


class TestimonialRepository(BaseRepository[Testimonial]):
    def __init__(self, db: AsyncSession):
        super().__init__(Testimonial, db)

    async def get_approved(self, skip: int = 0, limit: int = 20) -> list[Testimonial]:
        result = await self.db.execute(
            select(Testimonial)
            .where(Testimonial.is_approved == True)
            .order_by(Testimonial.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_approved(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Testimonial).where(Testimonial.is_approved == True)
        )
        return result.scalar_one()

    async def count_pending(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Testimonial).where(Testimonial.is_approved == False)
        )
        return result.scalar_one()

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[Testimonial]:
        result = await self.db.execute(
            select(Testimonial).order_by(Testimonial.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_featured(self, limit: int = 6) -> list[Testimonial]:
        result = await self.db.execute(
            select(Testimonial)
            .where(Testimonial.is_approved == True, Testimonial.is_featured == True)
            .limit(limit)
        )
        return list(result.scalars().all())
