from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Float, Numeric, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Tour(Base):
    __tablename__ = "tours"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    duration: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    group_size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="Safari")
    badge: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    highlights: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    itinerary: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    included: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    excluded: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    images: Mapped[list["TourImage"]] = relationship(
        "TourImage", back_populates="tour", cascade="all, delete-orphan", lazy="selectin"
    )
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="tour", lazy="noload", passive_deletes=True)
    testimonials: Mapped[list["Testimonial"]] = relationship("Testimonial", back_populates="tour", lazy="noload", passive_deletes=True)


class TourImage(Base):
    __tablename__ = "tour_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tour_id: Mapped[int] = mapped_column(ForeignKey("tours.id", ondelete="CASCADE"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    public_id: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    tour: Mapped["Tour"] = relationship("Tour", back_populates="images")
