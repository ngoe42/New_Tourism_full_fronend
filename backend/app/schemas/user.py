from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    role: UserRole
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    permissions: list[str] = []
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_user(cls, user) -> "UserResponse":
        role_obj = getattr(user, "assigned_role", None)
        return cls(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            role_id=user.role_id,
            role_name=role_obj.name if role_obj else None,
            permissions=[p.codename for p in role_obj.permissions] if role_obj else [],
            is_active=user.is_active,
            created_at=user.created_at,
        )


class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
