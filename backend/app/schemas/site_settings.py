from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class SiteSettingsResponse(BaseModel):
    id: int
    show_prices: bool
    show_blog: bool = True
    send_payment_email: bool = False
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
    send_payment_email: Optional[bool] = None
    hero_mode: Optional[str] = Field(None, max_length=50)
    story_image_1: Optional[str] = Field(None, max_length=2000)
    story_image_2: Optional[str] = Field(None, max_length=2000)
    cta_bg_image: Optional[str] = Field(None, max_length=2000)
    logo_url: Optional[str] = Field(None, max_length=2000)
    tours_hero_label: Optional[str] = Field(None, max_length=255)
    tours_hero_title: Optional[str] = Field(None, max_length=255)
    tours_hero_description: Optional[str] = Field(None, max_length=1000)
    tours_hero_image: Optional[str] = Field(None, max_length=2000)
    routes_hero_title: Optional[str] = Field(None, max_length=255)
    routes_hero_description: Optional[str] = Field(None, max_length=1000)
    routes_hero_image: Optional[str] = Field(None, max_length=2000)
    about_hero_image: Optional[str] = Field(None, max_length=2000)
    about_team_1_image: Optional[str] = Field(None, max_length=2000)
    about_team_2_image: Optional[str] = Field(None, max_length=2000)
    about_team_3_image: Optional[str] = Field(None, max_length=2000)
    wonders_kilimanjaro_image: Optional[str] = Field(None, max_length=2000)
    wonders_safari_image: Optional[str] = Field(None, max_length=2000)


class HeroImageAdd(BaseModel):
    url: str = Field(..., max_length=2000)
