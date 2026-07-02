import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


def strip_html(v: str) -> str:
    return re.sub(r'<[^>]*>', '', v)


# ── Permission ────────────────────────────────────────────────────────────────
class PermissionResponse(BaseModel):
    id: int
    codename: str
    name: str
    module: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Role ──────────────────────────────────────────────────────────────────────
class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    permission_ids: list[int] = Field(default_factory=list)

    @field_validator("name", "description")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    permission_ids: Optional[list[int]] = None

    @field_validator("name", "description")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_system: bool
    permissions: list[PermissionResponse] = []
    user_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class RoleBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


# ── Admin user management ─────────────────────────────────────────────────────
class AdminUserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=100)
    role_id: Optional[int] = None
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return strip_html(v)


class AdminUserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    new_password: Optional[str] = Field(None, min_length=8, max_length=100)

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


class UserWithRoleResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    permissions: list[str] = []
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
