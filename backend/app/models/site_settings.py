from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    show_prices: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hero_video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    story_image_1: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    story_image_2: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    cta_bg_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
