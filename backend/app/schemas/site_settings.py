from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SiteSettingsResponse(BaseModel):
    id: int
    show_prices: bool
    hero_video_url: Optional[str] = None
    story_image_1: Optional[str] = None
    story_image_2: Optional[str] = None
    cta_bg_image: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""
    show_prices: Optional[bool] = None
    story_image_1: Optional[str] = None
    story_image_2: Optional[str] = None
    cta_bg_image: Optional[str] = None
