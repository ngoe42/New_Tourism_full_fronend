from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.role import Role, Permission, ALL_PERMISSIONS
from app.models.user import User, UserRole
from app.repositories.role import RoleRepository, PermissionRepository
from app.repositories.user import UserRepository
from app.schemas.role import (
    AdminUserCreate,
    AdminUserUpdate,
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    UserWithRoleResponse,
)


class UserManagementService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.perm_repo = PermissionRepository(db)

    # ── Permissions ───────────────────────────────────────────────────────────

    async def list_permissions(self) -> list[Permission]:
        return await self.perm_repo.get_all(skip=0, limit=100)

    # ── Roles ─────────────────────────────────────────────────────────────────

    async def list_roles(self) -> list[RoleResponse]:
        roles = await self.role_repo.list_all()
        result = []
        for role in roles:
            count = await self.role_repo.get_user_count(role.id)
            result.append(RoleResponse(
                id=role.id,
                name=role.name,
                description=role.description,
                is_system=role.is_system,
                permissions=role.permissions,
                user_count=count,
                created_at=role.created_at,
            ))
        return result

    async def get_role(self, role_id: int) -> RoleResponse:
        role = await self.role_repo.get_with_permissions(role_id)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        count = await self.role_repo.get_user_count(role.id)
        return RoleResponse(
            id=role.id,
            name=role.name,
            description=role.description,
            is_system=role.is_system,
            permissions=role.permissions,
            user_count=count,
            created_at=role.created_at,
        )

    async def create_role(self, data: RoleCreate) -> RoleResponse:
        if await self.role_repo.get_by_name(data.name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Role '{data.name}' already exists",
            )
        role = Role(name=data.name, description=data.description, is_system=False)
        role = await self.role_repo.create(role)
        if data.permission_ids:
            role = await self.role_repo.set_permissions(role, data.permission_ids)
        return await self.get_role(role.id)

    async def update_role(self, role_id: int, data: RoleUpdate) -> RoleResponse:
        role = await self.role_repo.get_with_permissions(role_id)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        if data.name and data.name != role.name:
            existing = await self.role_repo.get_by_name(data.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Role '{data.name}' already exists",
                )
            role.name = data.name
        if data.description is not None:
            role.description = data.description
        await self.db.flush()
        if data.permission_ids is not None:
            role = await self.role_repo.set_permissions(role, data.permission_ids)
        return await self.get_role(role.id)

    async def delete_role(self, role_id: int) -> None:
        role = await self.role_repo.get_with_permissions(role_id)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        if role.is_system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System roles cannot be deleted",
            )
        count = await self.role_repo.get_user_count(role_id)
        if count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete role assigned to {count} user(s). Reassign them first.",
            )
        await self.role_repo.delete(role)

    # ── Users ─────────────────────────────────────────────────────────────────

    async def list_users(self, skip: int = 0, limit: int = 50) -> list[UserWithRoleResponse]:
        users = await self.user_repo.get_all(skip=skip, limit=limit)
        return [self._user_to_response(u) for u in users]

    async def get_user(self, user_id: int) -> UserWithRoleResponse:
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return self._user_to_response(user)

    async def create_user(self, data: AdminUserCreate) -> UserWithRoleResponse:
        if await self.user_repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        if data.role_id:
            role = await self.role_repo.get(data.role_id)
            if not role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid role_id",
                )
            legacy_role = UserRole.admin if role.name.lower() == "admin" else UserRole.customer
        else:
            legacy_role = UserRole.customer

        user = User(
            email=data.email,
            name=data.name,
            hashed_password=get_password_hash(data.password),
            role=legacy_role,
            role_id=data.role_id,
            is_active=data.is_active,
        )
        user = await self.user_repo.create(user)
        return self._user_to_response(user)

    async def update_user(self, user_id: int, data: AdminUserUpdate) -> UserWithRoleResponse:
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        updates: dict = {}
        if data.name is not None:
            updates["name"] = data.name
        if data.email is not None and data.email != user.email:
            if await self.user_repo.email_exists(data.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )
            updates["email"] = data.email
        if data.is_active is not None:
            updates["is_active"] = data.is_active
        if data.role_id is not None:
            role = await self.role_repo.get(data.role_id)
            if not role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid role_id",
                )
            updates["role_id"] = data.role_id
            updates["role"] = UserRole.admin if role.name.lower() == "admin" else UserRole.customer

        user = await self.user_repo.update(user, updates)
        return self._user_to_response(user)

    async def delete_user(self, user_id: int, current_user_id: int) -> None:
        if user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account",
            )
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        await self.user_repo.update(user, {"is_active": False})

    # ── Seeding ───────────────────────────────────────────────────────────────

    @staticmethod
    async def seed_roles_and_permissions(db: AsyncSession) -> None:
        """Create default permissions and system roles if they don't exist."""
        perm_repo = PermissionRepository(db)
        role_repo = RoleRepository(db)

        # Seed permissions
        existing = await perm_repo.get_all(skip=0, limit=200)
        existing_codes = {p.codename for p in existing}
        new_perms = []
        for codename, name, module in ALL_PERMISSIONS:
            if codename not in existing_codes:
                p = Permission(codename=codename, name=name, module=module)
                db.add(p)
                new_perms.append(p)
        if new_perms:
            await db.flush()
            logger.info(f"Seeded {len(new_perms)} new permissions")

        all_perms = await perm_repo.get_all(skip=0, limit=200)

        # Seed Admin role (all permissions)
        admin_role = await role_repo.get_by_name("Admin")
        if not admin_role:
            admin_role = Role(name="Admin", description="Full system access", is_system=True)
            admin_role = await role_repo.create(admin_role)
            logger.info("Seeded Admin role")
        admin_role.permissions = all_perms
        await db.flush()

        # Seed Manager role
        manager_role = await role_repo.get_by_name("Manager")
        if not manager_role:
            manager_perms = [p for p in all_perms if p.codename in (
                "view_dashboard", "manage_bookings", "manage_inquiries",
                "manage_testimonials", "send_emails",
            )]
            manager_role = Role(name="Manager", description="Booking & customer management", is_system=True)
            manager_role = await role_repo.create(manager_role)
            manager_role.permissions = manager_perms
            await db.flush()
            logger.info("Seeded Manager role")

        # Seed Editor role
        editor_role = await role_repo.get_by_name("Editor")
        if not editor_role:
            editor_perms = [p for p in all_perms if p.codename in (
                "view_dashboard", "manage_tours", "manage_experiences",
                "manage_routes", "manage_blog",
            )]
            editor_role = Role(name="Editor", description="Content management", is_system=True)
            editor_role = await role_repo.create(editor_role)
            editor_role.permissions = editor_perms
            await db.flush()
            logger.info("Seeded Editor role")

        # Seed Customer role (no admin permissions)
        customer_role = await role_repo.get_by_name("Customer")
        if not customer_role:
            customer_role = Role(name="Customer", description="Public user", is_system=True)
            customer_role = await role_repo.create(customer_role)
            logger.info("Seeded Customer role")

        # Assign existing users without role_id to the right role
        from sqlalchemy import select, update
        admin_users = await db.execute(
            select(User).where(User.role == UserRole.admin, User.role_id.is_(None))
        )
        for u in admin_users.scalars().all():
            u.role_id = admin_role.id

        customer_users = await db.execute(
            select(User).where(User.role == UserRole.customer, User.role_id.is_(None))
        )
        for u in customer_users.scalars().all():
            u.role_id = customer_role.id

        await db.flush()

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _user_to_response(user: User) -> UserWithRoleResponse:
        role_obj = user.assigned_role
        return UserWithRoleResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value if user.role else "customer",
            role_id=user.role_id,
            role_name=role_obj.name if role_obj else None,
            permissions=[p.codename for p in role_obj.permissions] if role_obj else [],
            is_active=user.is_active,
            created_at=user.created_at,
        )
