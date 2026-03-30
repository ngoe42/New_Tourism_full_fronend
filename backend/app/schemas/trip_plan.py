from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models.trip_plan import TripPlanStatus


class TripPlanCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    destination: str = Field(..., min_length=2, max_length=255)
    budget: Optional[float] = Field(None, gt=0)
    number_of_people: int = Field(..., ge=1, le=100)
    travel_dates: Optional[str] = Field(None, max_length=255)
    duration_days: Optional[int] = Field(None, ge=1, le=365)
    preferences: Optional[List[str]] = []
    special_requirements: Optional[str] = None


class TripPlanAdminUpdate(BaseModel):
    status: Optional[TripPlanStatus] = None
    admin_notes: Optional[str] = None
    quoted_price: Optional[float] = Field(None, gt=0)


class TripPlanResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    email: str
    phone: Optional[str] = None
    destination: str
    budget: Optional[float] = None
    number_of_people: int
    travel_dates: Optional[str] = None
    duration_days: Optional[int] = None
    preferences: Optional[List[str]] = []
    special_requirements: Optional[str] = None
    status: TripPlanStatus
    admin_notes: Optional[str] = None
    quoted_price: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedTripPlans(BaseModel):
    items: list[TripPlanResponse]
    total: int
    page: int
    per_page: int
    pages: int
