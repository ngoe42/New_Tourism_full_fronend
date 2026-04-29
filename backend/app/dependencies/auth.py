from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.core.token_blacklist import is_blacklisted, is_blacklisted_async
from app.models.user import User, UserRole
from app.repositories.user import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if await is_blacklisted_async(payload):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get(int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    # Invalidate tokens issued before the last password change (reset-password flow)
    if user.password_changed_at and payload.get("iat"):
        if float(payload["iat"]) < user.password_changed_at.timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired after password change — please log in again",
                headers={"WWW-Authenticate": "Bearer"},
            )
    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    # Decode and validate — return None only for expired/malformed tokens
    # (the frontend will auto-refresh). Raise on revoked/deactivated so
    # those users cannot slip through optional-auth endpoints.
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        return None
    if await is_blacklisted_async(payload):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )
    user_id = payload.get("sub")
    if not user_id:
        return None
    repo = UserRepository(db)
    user = await repo.get(int(user_id))
    if not user:
        return None
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    if user.password_changed_at and payload.get("iat"):
        if float(payload["iat"]) < user.password_changed_at.timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired after password change — please log in again",
            )
    return user


def require_role(*roles: UserRole):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker


require_admin = require_role(UserRole.admin)


def require_permission(*codenames: str):
    """Require the user's assigned role to have at least one of the given permissions.
    Users with the legacy ``admin`` enum role always pass."""
    async def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        # Legacy admin enum bypass
        if current_user.role == UserRole.admin:
            return current_user
        role = current_user.assigned_role
        if role and any(role.has_permission(c) for c in codenames):
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing required permission: {list(codenames)}",
        )
    return permission_checker
