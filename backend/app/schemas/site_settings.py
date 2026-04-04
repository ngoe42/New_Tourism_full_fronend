from datetime import datetime
from pydantic import BaseModel


class SiteSettingsResponse(BaseModel):
    id: int
    show_prices: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    show_prices: bool
