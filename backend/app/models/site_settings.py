from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, JSON, String
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
    hero_mode: Mapped[str] = mapped_column(String(20), default="video", nullable=False)
    hero_images: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    show_blog: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    tours_hero_label: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    tours_hero_title: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    tours_hero_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    tours_hero_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    routes_hero_title: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    routes_hero_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    routes_hero_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    about_hero_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    about_team_1_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    about_team_2_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    about_team_3_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    wonders_kilimanjaro_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    wonders_safari_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
