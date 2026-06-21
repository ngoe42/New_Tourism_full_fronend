from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Numeric, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    nickname: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    nickname_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    full_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    success_rate: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    max_altitude: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    distance: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    group_size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    best_season: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal('0.00'))
    package_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    highlights: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    itinerary: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    included: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    excluded: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    packing_list: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    mountain: Mapped[str] = mapped_column(String(50), nullable=False, default='kilimanjaro', index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    images: Mapped[list["RouteImage"]] = relationship(
        "RouteImage", back_populates="route", cascade="all, delete-orphan", lazy="selectin"
    )


class RouteImage(Base):
    __tablename__ = "route_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    public_id: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    route: Mapped["Route"] = relationship("Route", back_populates="images")
