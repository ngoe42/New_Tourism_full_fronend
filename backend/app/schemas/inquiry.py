from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    message: str = Field(..., min_length=10)
    tour_interest: Optional[str] = Field(None, max_length=255)
    route_id: Optional[int] = None
    travel_date: Optional[date] = None
    guests: Optional[int] = Field(None, ge=1, le=50)


class InquiryResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    tour_interest: Optional[str] = None
    is_read: bool
    is_replied: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_replied: Optional[bool] = None


class PaginatedInquiries(BaseModel):
    items: list[InquiryResponse]
    total: int
    page: int
    per_page: int
    pages: int
