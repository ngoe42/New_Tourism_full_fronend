from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.tour import Tour, TourImage
from app.repositories.base import BaseRepository


class TourRepository(BaseRepository[Tour]):
    def __init__(self, db: AsyncSession):
        super().__init__(Tour, db)

    async def get_by_slug(self, slug: str) -> Optional[Tour]:
        result = await self.db.execute(select(Tour).where(Tour.slug == slug))
        return result.scalar_one_or_none()

    async def get_published(self, skip: int = 0, limit: int = 20) -> list[Tour]:
        result = await self.db.execute(
            select(Tour).where(Tour.is_published == True).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_published(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Tour).where(Tour.is_published == True)
        )
        return result.scalar_one()

    async def get_featured(self, limit: int = 6) -> list[Tour]:
        result = await self.db.execute(
            select(Tour)
            .where(Tour.is_featured == True, Tour.is_published == True)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def search(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Tour], int]:
        stmt = select(Tour).where(Tour.is_published == True)

        if query:
            stmt = stmt.where(
                or_(
                    Tour.title.ilike(f"%{query}%"),
                    Tour.location.ilike(f"%{query}%"),
                    Tour.description.ilike(f"%{query}%"),
                )
            )
        if category:
            stmt = stmt.where(Tour.category == category)
        if min_price is not None:
            stmt = stmt.where(Tour.price >= min_price)
        if max_price is not None:
            stmt = stmt.where(Tour.price <= max_price)

        count_result = await self.db.execute(
            select(func.count()).select_from(stmt.subquery())
        )
        total = count_result.scalar_one()

        result = await self.db.execute(stmt.offset(skip).limit(limit))
        return list(result.scalars().all()), total

    async def slug_exists(self, slug: str, exclude_id: Optional[int] = None) -> bool:
        stmt = select(Tour.id).where(Tour.slug == slug)
        if exclude_id:
            stmt = stmt.where(Tour.id != exclude_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None


class TourImageRepository(BaseRepository[TourImage]):
    def __init__(self, db: AsyncSession):
        super().__init__(TourImage, db)

    async def get_by_tour(self, tour_id: int) -> list[TourImage]:
        result = await self.db.execute(
            select(TourImage).where(TourImage.tour_id == tour_id).order_by(TourImage.order)
        )
        return list(result.scalars().all())

    async def set_cover(self, tour_id: int, image_id: int) -> None:
        from sqlalchemy import update
        await self.db.execute(
            update(TourImage).where(TourImage.tour_id == tour_id).values(is_cover=False)
        )
        await self.db.execute(
            update(TourImage).where(TourImage.id == image_id).values(is_cover=True)
        )
        await self.db.flush()
