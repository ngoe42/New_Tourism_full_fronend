import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


def strip_html(v: str) -> str:
    return re.sub(r'<[^>]*>', '', v)


class ExperienceBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    image_url: str = Field(..., max_length=2000)
    order: int = 0
    is_active: bool = True

    @field_validator("title", "subtitle", "description", "image_url")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    image_url: Optional[str] = Field(None, max_length=2000)
    order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("title", "subtitle", "description", "image_url")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


# NOTE: Response model intentionally does NOT inherit ExperienceBase.
# Input constraints (max_length, sanitizers) must never be applied to data
# coming OUT of the database — legacy rows that exceed newer limits would
# make every GET endpoint fail with a 500 (ResponseValidationError).
class ExperienceResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    order: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExperienceReorderItem(BaseModel):
    id: int
    order: int
