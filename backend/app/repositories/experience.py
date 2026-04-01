from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.experience import Experience


class ExperienceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_active(self) -> List[Experience]:
        result = await self.db.execute(
            select(Experience)
            .where(Experience.is_active == True)
            .order_by(Experience.order.asc(), Experience.id.asc())
        )
        return list(result.scalars().all())

    async def get_all(self) -> List[Experience]:
        result = await self.db.execute(
            select(Experience).order_by(Experience.order.asc(), Experience.id.asc())
        )
        return list(result.scalars().all())

    async def get(self, experience_id: int) -> Optional[Experience]:
        result = await self.db.execute(
            select(Experience).where(Experience.id == experience_id)
        )
        return result.scalar_one_or_none()

    async def create(self, experience: Experience) -> Experience:
        self.db.add(experience)
        await self.db.flush()
        await self.db.refresh(experience)
        return experience

    async def update(self, experience_id: int, data: dict) -> Optional[Experience]:
        await self.db.execute(
            update(Experience).where(Experience.id == experience_id).values(**data)
        )
        return await self.get(experience_id)

    async def delete(self, experience_id: int) -> bool:
        experience = await self.get(experience_id)
        if not experience:
            return False
        await self.db.delete(experience)
        return True

    async def bulk_reorder(self, items: List[dict]) -> None:
        for item in items:
            await self.db.execute(
                update(Experience)
                .where(Experience.id == item["id"])
                .values(order=item["order"])
            )
