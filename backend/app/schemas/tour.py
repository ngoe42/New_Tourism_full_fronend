from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


class TourImageResponse(BaseModel):
    id: int
    url: str
    public_id: Optional[str] = None
    is_cover: bool
    order: int

    model_config = {"from_attributes": True}


class ItineraryDay(BaseModel):
    day: int
    title: str
    description: str


class TourBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    duration: str = Field(..., max_length=100)
    location: str = Field(..., max_length=255)
    group_size: Optional[str] = Field(None, max_length=100)
    category: str = Field(default="Safari", max_length=100)
    badge: Optional[str] = Field(None, max_length=100)
    highlights: Optional[List[str]] = []
    itinerary: Optional[List[Any]] = []
    included: Optional[List[str]] = []
    excluded: Optional[List[str]] = []
    is_published: bool = False
    is_featured: bool = False


class TourCreate(TourBase):
    slug: Optional[str] = None


class TourUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    duration: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    group_size: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    badge: Optional[str] = Field(None, max_length=100)
    highlights: Optional[List[str]] = None
    itinerary: Optional[List[Any]] = None
    included: Optional[List[str]] = None
    excluded: Optional[List[str]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


# NOTE: Response model intentionally does NOT inherit TourBase.
# Input constraints (max_length, gt=0, etc.) must never be applied to data
# coming OUT of the database — legacy rows that exceed newer limits would
# make every GET endpoint fail with a 500 (ResponseValidationError).
class TourResponse(BaseModel):
    id: int
    title: str
    slug: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    price: float
    duration: str
    location: str
    group_size: Optional[str] = None
    category: str = "Safari"
    badge: Optional[str] = None
    highlights: Optional[List[str]] = []
    itinerary: Optional[List[Any]] = []
    included: Optional[List[str]] = []
    excluded: Optional[List[str]] = []
    is_published: bool = False
    is_featured: bool = False
    rating: float
    review_count: int
    images: List[TourImageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TourListResponse(BaseModel):
    id: int
    title: str
    slug: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    price: float
    duration: str
    location: str
    group_size: Optional[str] = None
    category: str
    badge: Optional[str] = None
    rating: float
    review_count: int
    is_featured: bool
    is_published: bool
    images: List[TourImageResponse] = []

    model_config = {"from_attributes": True}


class PaginatedTours(BaseModel):
    items: List[TourListResponse]
    total: int
    page: int
    per_page: int
    pages: int
