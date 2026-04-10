from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.inquiry import Inquiry
from app.repositories.base import BaseRepository


class InquiryRepository(BaseRepository[Inquiry]):
    def __init__(self, db: AsyncSession):
        super().__init__(Inquiry, db)

    def _apply_filters(self, stmt, search: Optional[str], status: Optional[str]):
        if search:
            term = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Inquiry.name).like(term),
                    func.lower(Inquiry.email).like(term),
                )
            )
        if status == "new":
            stmt = stmt.where(Inquiry.is_read == False, Inquiry.is_replied == False)
        elif status == "read":
            stmt = stmt.where(Inquiry.is_read == True, Inquiry.is_replied == False)
        elif status == "replied":
            stmt = stmt.where(Inquiry.is_replied == True)
        return stmt

    async def get_all_paginated(
        self, skip: int = 0, limit: int = 20,
        search: Optional[str] = None, status: Optional[str] = None,
    ) -> list[Inquiry]:
        stmt = select(Inquiry).order_by(Inquiry.created_at.desc())
        stmt = self._apply_filters(stmt, search, status)
        result = await self.db.execute(stmt.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def count_filtered(self, search: Optional[str] = None, status: Optional[str] = None) -> int:
        stmt = select(func.count()).select_from(Inquiry)
        stmt = self._apply_filters(stmt, search, status)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def count_unread(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Inquiry).where(Inquiry.is_read == False)
        )
        return result.scalar_one()
