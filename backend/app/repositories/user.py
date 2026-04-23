from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_active_users(self, skip: int = 0, limit: int = 20) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.is_active == True).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_role(self, role: UserRole) -> int:
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count()).select_from(User).where(User.role == role)
        )
        return result.scalar_one()

    async def email_exists(self, email: str) -> bool:
        result = await self.db.execute(select(User.id).where(User.email == email))
        return result.scalar_one_or_none() is not None

    async def get_superadmin_by_username(self, username: str) -> Optional[User]:
        from sqlalchemy import func as sqlfunc
        result = await self.db.execute(
            select(User).where(
                User.is_superadmin == True,
                sqlfunc.lower(User.name) == username.lower(),
            )
        )
        return result.scalar_one_or_none()

    async def get_superadmin_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.is_superadmin == True, User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_all_non_superadmin(self, skip: int = 0, limit: int = 20) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.is_superadmin == False).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
