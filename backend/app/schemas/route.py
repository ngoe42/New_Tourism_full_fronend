import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


def strip_html(v: str) -> str:
    return re.sub(r'<[^>]*>', '', v)


class RouteImageOut(BaseModel):
    id: int
    url: str
    public_id: Optional[str] = None
    caption: Optional[str] = None
    is_cover: bool = False
    order: int = 0

    class Config:
        from_attributes = True


class RouteBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=255)
    nickname: Optional[str] = Field(None, max_length=255)
    nickname_explanation: Optional[str] = Field(None, max_length=1000)
    short_description: Optional[str] = Field(None, max_length=500)
    full_description: Optional[str] = Field(None, max_length=10000)
    duration: str = Field(..., max_length=100)
    difficulty: Optional[str] = Field(None, max_length=100)
    success_rate: Optional[str] = Field(None, max_length=50)
    max_altitude: Optional[str] = Field(None, max_length=50)
    distance: Optional[str] = Field(None, max_length=50)
    group_size: Optional[str] = Field(None, max_length=100)
    best_season: Optional[str] = Field(None, max_length=255)
    requirements: Optional[str] = Field(None, max_length=5000)
    price: float = Field(default=0.0, ge=0)
    package_details: Optional[str] = Field(None, max_length=5000)
    highlights: Optional[List[str]] = None
    itinerary: Optional[List[dict]] = None
    included: Optional[List[str]] = None
    excluded: Optional[List[str]] = None
    packing_list: Optional[List[str]] = None
    mountain: str = Field(default='kilimanjaro', max_length=100)
    is_published: bool = True

    @field_validator("name", "slug", "nickname", "nickname_explanation",
                     "short_description", "full_description", "duration",
                     "difficulty", "success_rate", "max_altitude", "distance",
                     "group_size", "best_season", "requirements",
                     "package_details", "mountain")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = Field(None, min_length=2, max_length=255)
    nickname: Optional[str] = Field(None, max_length=255)
    nickname_explanation: Optional[str] = Field(None, max_length=1000)
    short_description: Optional[str] = Field(None, max_length=500)
    full_description: Optional[str] = Field(None, max_length=10000)
    duration: Optional[str] = Field(None, max_length=100)
    difficulty: Optional[str] = Field(None, max_length=100)
    success_rate: Optional[str] = Field(None, max_length=50)
    max_altitude: Optional[str] = Field(None, max_length=50)
    distance: Optional[str] = Field(None, max_length=50)
    group_size: Optional[str] = Field(None, max_length=100)
    best_season: Optional[str] = Field(None, max_length=255)
    requirements: Optional[str] = Field(None, max_length=5000)
    price: Optional[float] = Field(None, ge=0)
    package_details: Optional[str] = Field(None, max_length=5000)
    highlights: Optional[List[str]] = None
    itinerary: Optional[List[dict]] = None
    included: Optional[List[str]] = None
    excluded: Optional[List[str]] = None
    packing_list: Optional[List[str]] = None
    mountain: Optional[str] = Field(None, max_length=100)
    is_published: Optional[bool] = None

    @field_validator("name", "slug", "nickname", "nickname_explanation",
                     "short_description", "full_description", "duration",
                     "difficulty", "success_rate", "max_altitude", "distance",
                     "group_size", "best_season", "requirements",
                     "package_details", "mountain")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


# NOTE: Response model intentionally does NOT inherit RouteBase.
# Input constraints (max_length, min_length, sanitizers) must never be
# applied to data coming OUT of the database — legacy rows that exceed
# newer limits would make every GET endpoint fail with a 500
# (ResponseValidationError).
class RouteOut(BaseModel):
    id: int
    name: str
    slug: str
    nickname: Optional[str] = None
    nickname_explanation: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    duration: str
    difficulty: Optional[str] = None
    success_rate: Optional[str] = None
    max_altitude: Optional[str] = None
    distance: Optional[str] = None
    group_size: Optional[str] = None
    best_season: Optional[str] = None
    requirements: Optional[str] = None
    price: float = 0.0
    package_details: Optional[str] = None
    highlights: Optional[List] = None
    itinerary: Optional[List] = None
    included: Optional[List] = None
    excluded: Optional[List] = None
    packing_list: Optional[List] = None
    mountain: str = 'kilimanjaro'
    is_published: bool = True
    images: List[RouteImageOut] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
