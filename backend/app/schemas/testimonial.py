import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


def strip_html(v: str) -> str:
    return re.sub(r'<[^>]*>', '', v)


class TestimonialCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    rating: int = Field(..., ge=1, le=5)
    message: str = Field(..., min_length=10)
    tour_id: Optional[int] = None

    @field_validator("name", "location", "message")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return strip_html(v)


class TestimonialAdminUpdate(BaseModel):
    is_approved: Optional[bool] = None
    is_featured: Optional[bool] = None


class TestimonialResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    tour_id: Optional[int] = None
    name: str
    location: Optional[str] = None
    rating: int
    message: str
    avatar_url: Optional[str] = None
    is_approved: bool
    is_featured: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedTestimonials(BaseModel):
    items: list[TestimonialResponse]
    total: int
    page: int
    per_page: int
    pages: int
