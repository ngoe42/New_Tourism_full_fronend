from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class SiteSettingsResponse(BaseModel):
    id: int
    show_prices: bool
    show_blog: bool = True
    hero_video_url: Optional[str] = None
    hero_mode: str = "video"
    hero_images: list[str] = []
    story_image_1: Optional[str] = None
    story_image_2: Optional[str] = None
    cta_bg_image: Optional[str] = None
    logo_url: Optional[str] = None
    tours_hero_label: Optional[str] = None
    tours_hero_title: Optional[str] = None
    tours_hero_description: Optional[str] = None
    tours_hero_image: Optional[str] = None
    routes_hero_title: Optional[str] = None
    routes_hero_description: Optional[str] = None
    routes_hero_image: Optional[str] = None
    about_hero_image: Optional[str] = None
    about_team_1_image: Optional[str] = None
    about_team_2_image: Optional[str] = None
    about_team_3_image: Optional[str] = None
    wonders_kilimanjaro_image: Optional[str] = None
    wonders_safari_image: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("hero_images", mode="before")
    @classmethod
    def coerce_hero_images(cls, v):
        return v if isinstance(v, list) else []


class SiteSettingsUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""
    show_prices: Optional[bool] = None
    show_blog: Optional[bool] = None
    hero_mode: Optional[str] = None
    story_image_1: Optional[str] = None
    story_image_2: Optional[str] = None
    cta_bg_image: Optional[str] = None
    logo_url: Optional[str] = None
    tours_hero_label: Optional[str] = None
    tours_hero_title: Optional[str] = None
    tours_hero_description: Optional[str] = None
    tours_hero_image: Optional[str] = None
    routes_hero_title: Optional[str] = None
    routes_hero_description: Optional[str] = None
    routes_hero_image: Optional[str] = None
    about_hero_image: Optional[str] = None
    about_team_1_image: Optional[str] = None
    about_team_2_image: Optional[str] = None
    about_team_3_image: Optional[str] = None
    wonders_kilimanjaro_image: Optional[str] = None
    wonders_safari_image: Optional[str] = None


class HeroImageAdd(BaseModel):
    url: str
