import enum
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Float, Numeric, Integer, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class TripPlanStatus(str, enum.Enum):
    pending = "pending"
    reviewing = "reviewing"
    quoted = "quoted"
    confirmed = "confirmed"
    cancelled = "cancelled"


class TripPlan(Base):
    __tablename__ = "trip_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    budget: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    number_of_people: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    travel_dates: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    preferences: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    special_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[TripPlanStatus] = mapped_column(
        Enum(TripPlanStatus), default=TripPlanStatus.pending, nullable=False, index=True
    )
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quoted_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped[Optional["User"]] = relationship("User", back_populates="trip_plans")
