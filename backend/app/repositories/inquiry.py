from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.inquiry import Inquiry
from app.repositories.base import BaseRepository


class InquiryRepository(BaseRepository[Inquiry]):
    def __init__(self, db: AsyncSession):
        super().__init__(Inquiry, db)

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[Inquiry]:
        result = await self.db.execute(
            select(Inquiry).order_by(Inquiry.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_unread(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Inquiry).where(Inquiry.is_read == False)
        )
        return result.scalar_one()
