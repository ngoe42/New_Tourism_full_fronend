from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


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
    description: Optional[str] = None
    permission_ids: list[int] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    permission_ids: Optional[list[int]] = None


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
    email: str = Field(..., min_length=5, max_length=255)
    name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=100)
    role_id: Optional[int] = None
    is_active: bool = True


class AdminUserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[str] = Field(None, min_length=5, max_length=255)
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


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
