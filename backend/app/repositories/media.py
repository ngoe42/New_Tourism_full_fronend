from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.media import Media
from app.repositories.base import BaseRepository


class MediaRepository(BaseRepository[Media]):
    def __init__(self, db: AsyncSession):
        super().__init__(Media, db)

    async def get_by_tour(self, tour_id: int) -> list[Media]:
        result = await self.db.execute(
            select(Media).where(Media.tour_id == tour_id).order_by(Media.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_public_id(self, public_id: str) -> Optional[Media]:
        result = await self.db.execute(select(Media).where(Media.public_id == public_id))
        return result.scalar_one_or_none()

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[Media]:
        result = await self.db.execute(
            select(Media).order_by(Media.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
