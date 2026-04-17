from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Table, Column, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


# ── Many-to-many: Role ↔ Permission ──────────────────────────────────────────
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    codename: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False, default="general")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    roles: Mapped[list["Role"]] = relationship(
        "Role", secondary=role_permissions, back_populates="permissions"
    )

    def __repr__(self) -> str:
        return f"<Permission {self.codename}>"


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    permissions: Mapped[list["Permission"]] = relationship(
        "Permission", secondary=role_permissions, back_populates="roles", lazy="selectin"
    )
    users: Mapped[list["User"]] = relationship("User", back_populates="assigned_role", lazy="noload")

    def has_permission(self, codename: str) -> bool:
        return any(p.codename == codename for p in self.permissions)

    def __repr__(self) -> str:
        return f"<Role {self.name}>"


# ── Default permission codenames ──────────────────────────────────────────────
ALL_PERMISSIONS = [
    ("view_dashboard",       "View Dashboard",        "dashboard"),
    ("manage_users",         "Manage Users",          "users"),
    ("manage_roles",         "Manage Roles",          "users"),
    ("manage_tours",         "Manage Tours",          "tours"),
    ("manage_bookings",      "Manage Bookings",       "bookings"),
    ("manage_inquiries",     "Manage Inquiries",      "inquiries"),
    ("manage_testimonials",  "Manage Testimonials",   "testimonials"),
    ("manage_experiences",   "Manage Experiences",    "experiences"),
    ("manage_routes",        "Manage Routes",         "routes"),
    ("manage_settings",      "Manage Settings",       "settings"),
    ("manage_blog",          "Manage Blog",           "blog"),
    ("send_emails",          "Send Emails",           "communications"),
]
