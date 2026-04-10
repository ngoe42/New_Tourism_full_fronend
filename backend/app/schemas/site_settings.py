from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SiteSettingsResponse(BaseModel):
    id: int
    show_prices: bool
    hero_video_url: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    show_prices: bool
