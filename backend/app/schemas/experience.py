from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ExperienceBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    order: int = 0
    is_active: bool = True


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class ExperienceResponse(ExperienceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExperienceReorderItem(BaseModel):
    id: int
    order: int
