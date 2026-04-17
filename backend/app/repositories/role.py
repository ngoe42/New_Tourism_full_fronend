from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.role import Role, Permission, role_permissions
from app.models.user import User
from app.repositories.base import BaseRepository


class PermissionRepository(BaseRepository[Permission]):
    def __init__(self, db: AsyncSession):
        super().__init__(Permission, db)

    async def get_by_codenames(self, codenames: list[str]) -> list[Permission]:
        result = await self.db.execute(
            select(Permission).where(Permission.codename.in_(codenames))
        )
        return list(result.scalars().all())

    async def get_by_ids(self, ids: list[int]) -> list[Permission]:
        if not ids:
            return []
        result = await self.db.execute(
            select(Permission).where(Permission.id.in_(ids))
        )
        return list(result.scalars().all())


class RoleRepository(BaseRepository[Role]):
    def __init__(self, db: AsyncSession):
        super().__init__(Role, db)

    async def get_with_permissions(self, role_id: int) -> Optional[Role]:
        result = await self.db.execute(
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.id == role_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Role]:
        result = await self.db.execute(select(Role).where(Role.name == name))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Role]:
        result = await self.db.execute(
            select(Role).options(selectinload(Role.permissions)).order_by(Role.id)
        )
        return list(result.scalars().all())

    async def get_user_count(self, role_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(User).where(User.role_id == role_id)
        )
        return result.scalar_one()

    async def set_permissions(self, role: Role, permission_ids: list[int]) -> Role:
        perm_repo = PermissionRepository(self.db)
        permissions = await perm_repo.get_by_ids(permission_ids)
        role.permissions = permissions
        await self.db.flush()
        await self.db.refresh(role)
        return role
