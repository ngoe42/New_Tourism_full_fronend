from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_admin, get_current_user
from app.models.user import User
from app.schemas.role import (
    AdminUserCreate,
    AdminUserUpdate,
    PermissionResponse,
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    UserWithRoleResponse,
)
from app.services.user_management import UserManagementService

router = APIRouter(tags=["User Management"])


# ── Permissions ───────────────────────────────────────────────────────────────

@router.get(
    "/permissions",
    response_model=list[PermissionResponse],
    dependencies=[Depends(require_admin)],
)
async def list_permissions(db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.list_permissions()


# ── Roles ─────────────────────────────────────────────────────────────────────

@router.get(
    "/roles",
    response_model=list[RoleResponse],
    dependencies=[Depends(require_admin)],
)
async def list_roles(db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.list_roles()


@router.get(
    "/roles/{role_id}",
    response_model=RoleResponse,
    dependencies=[Depends(require_admin)],
)
async def get_role(role_id: int, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.get_role(role_id)


@router.post(
    "/roles",
    response_model=RoleResponse,
    status_code=201,
    dependencies=[Depends(require_admin)],
)
async def create_role(data: RoleCreate, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.create_role(data)


@router.put(
    "/roles/{role_id}",
    response_model=RoleResponse,
    dependencies=[Depends(require_admin)],
)
async def update_role(role_id: int, data: RoleUpdate, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.update_role(role_id, data)


@router.delete(
    "/roles/{role_id}",
    status_code=204,
    dependencies=[Depends(require_admin)],
)
async def delete_role(role_id: int, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    await svc.delete_role(role_id)


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get(
    "/users",
    response_model=list[UserWithRoleResponse],
    dependencies=[Depends(require_admin)],
)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    svc = UserManagementService(db)
    return await svc.list_users(skip=skip, limit=limit)


@router.get(
    "/users/{user_id}",
    response_model=UserWithRoleResponse,
    dependencies=[Depends(require_admin)],
)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.get_user(user_id)


@router.post(
    "/users",
    response_model=UserWithRoleResponse,
    status_code=201,
    dependencies=[Depends(require_admin)],
)
async def create_user(data: AdminUserCreate, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.create_user(data)


@router.put(
    "/users/{user_id}",
    response_model=UserWithRoleResponse,
    dependencies=[Depends(require_admin)],
)
async def update_user(user_id: int, data: AdminUserUpdate, db: AsyncSession = Depends(get_db)):
    svc = UserManagementService(db)
    return await svc.update_user(user_id, data)


@router.delete(
    "/users/{user_id}",
    status_code=204,
    dependencies=[Depends(require_admin)],
)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = UserManagementService(db)
    await svc.delete_user(user_id, current_user.id)


@router.post(
    "/users/{user_id}/erase",
    dependencies=[Depends(require_admin)],
)
async def erase_customer_data(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Full GDPR erasure: anonymise user PII, delete bookings & inquiries,
    and suppress the email address in SendGrid so no future emails are sent."""
    svc = UserManagementService(db)
    return await svc.erase_customer_data(user_id, current_user.id)
