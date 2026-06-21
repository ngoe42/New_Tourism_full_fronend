from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    nickname: Optional[str] = None
    nickname_explanation: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    success_rate: Optional[str] = None
    max_altitude: Optional[str] = None
    distance: Optional[str] = None
    group_size: Optional[str] = None
    best_season: Optional[str] = None
    requirements: Optional[str] = None
    price: Optional[float] = None
    package_details: Optional[str] = None
    highlights: Optional[List] = None
    itinerary: Optional[List] = None
    included: Optional[List] = None
    excluded: Optional[List] = None
    packing_list: Optional[List] = None
    mountain: Optional[str] = None
    is_published: Optional[bool] = None


class RouteOut(RouteBase):
    id: int
    images: List[RouteImageOut] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
