from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.limiter import limiter
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token,
    create_password_reset_token, verify_password_reset_token,
)
from app.core.config import settings
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, AccessTokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import AuthService
from app.services.email_service import send_email
from datetime import timedelta


class SuperLoginRequest(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user = await service.register(data)
    return UserResponse.from_user(user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data.email, data.password)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_access_token(data.refresh_token)


class LogoutRequest(BaseModel):
    refresh_token: str
    access_token: str | None = None


@router.post("/logout", status_code=200)
async def logout(data: LogoutRequest):
    from app.core.token_blacklist import blacklist_token
    from app.core.security import decode_token
    payload = decode_token(data.refresh_token)
    if payload and payload.get("type") == "refresh":
        blacklist_token(payload)
    # Also blacklist the access token so it is immediately revoked
    if data.access_token:
        access_payload = decode_token(data.access_token)
        if access_payload and access_payload.get("type") == "access":
            blacklist_token(access_payload)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_user(current_user)


@router.post("/super-login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def super_login(request: Request, data: SuperLoginRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_superadmin_by_username(data.username)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(subject=user.id)
    from app.schemas.user import UserResponse as UR
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UR.from_user(user),
    )


@router.post("/forgot-password", status_code=200)
@limiter.limit("5/hour")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_email(data.email)
    if user and user.is_active:
        token = create_password_reset_token(user.id)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        body = (
            f"Hello {user.name},\n\n"
            f"You requested a password reset for your Nelson Safari account.\n\n"
            f"Click the link below to set a new password (valid for 1 hour):\n"
            f"{reset_url}\n\n"
            f"If you did not request this, ignore this email.\n\n"
            f"Nelson Tours & Safari Team"
        )
        await send_email(to=user.email, subject="Password Reset — Nelson Tours & Safari", body=body)
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=200)
@limiter.limit("5/hour")
async def reset_password(request: Request, data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    from app.core.security import decode_token as _decode
    raw_payload = _decode(data.token)
    user_id = verify_password_reset_token(data.token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    repo = UserRepository(db)
    user = await repo.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    # Prevent token reuse: if the password was already changed after the
    # token was issued, reject it.
    if raw_payload and user.updated_at:
        token_iat = raw_payload.get("iat") or (raw_payload.get("exp", 0) - 3600)
        if user.updated_at.timestamp() > token_iat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This reset link has already been used",
            )
    await repo.update(user, {
        "hashed_password": get_password_hash(data.new_password),
        "password_changed_at": datetime.now(timezone.utc),
    })
    return {"message": "Password updated successfully"}
