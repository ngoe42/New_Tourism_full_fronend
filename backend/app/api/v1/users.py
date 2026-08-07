from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_password_hash
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserResponse, UserUpdate, UserPasswordChange, UserAdminUpdate

router = APIRouter(tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    return await repo.update(current_user, data.model_dump(exclude_none=True))


@router.put("/me/password", response_model=UserResponse)
async def change_password(
    data: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone
    from app.core.security import verify_password
    from fastapi import HTTPException, status
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    repo = UserRepository(db)
    return await repo.update(current_user, {
        "hashed_password": get_password_hash(data.new_password),
        "password_changed_at": datetime.now(timezone.utc),
    })


@router.get("", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    # Only the Super Admin may see superadmin accounts (i.e. himself);
    # they are invisible to every other admin/manager.
    if current_user.is_superadmin:
        return await repo.get_all(skip=skip, limit=limit)
    return await repo.get_all_non_superadmin(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException, status
    repo = UserRepository(db)
    # Superadmin rows resolve only for the Super Admin himself; everyone
    # else receives 404 so the account's existence is never revealed.
    if current_user.is_superadmin:
        user = await repo.get(user_id)
    else:
        user = await repo.get_non_superadmin(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def admin_update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException, status
    repo = UserRepository(db)
    user = await repo.get_non_superadmin(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await repo.update(user, data.model_dump(exclude_none=True))
