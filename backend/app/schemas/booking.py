from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    tour_id: int
    travel_date: date
    guests: int = Field(..., ge=1, le=50)
    special_requests: Optional[str] = None
    contact_name: str = Field(..., min_length=2, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = Field(None, max_length=50)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    notes: Optional[str] = None


class BookingAdminUpdate(BaseModel):
    travel_date: Optional[date] = None
    guests: Optional[int] = Field(None, ge=1, le=50)
    total_price: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None
    special_requests: Optional[str] = None


class BookingTourInfo(BaseModel):
    id: int
    title: str
    slug: str
    location: str
    duration: str

    model_config = {"from_attributes": True}


class BookingUserInfo(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class BookingResponse(BaseModel):
    id: int
    tour_id: int
    user_id: Optional[int] = None
    travel_date: date
    guests: int
    total_price: float
    status: BookingStatus
    special_requests: Optional[str] = None
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    pesapal_order_tracking_id: Optional[str] = None
    pesapal_merchant_reference: Optional[str] = None
    payment_status: Optional[str] = None
    payment_redirect_url: Optional[str] = None
    tour: Optional[BookingTourInfo] = None
    user: Optional[BookingUserInfo] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingPublicResponse(BaseModel):
    id: int
    tour_id: int
    travel_date: date
    guests: int
    total_price: float
    status: BookingStatus
    special_requests: Optional[str] = None
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    payment_status: Optional[str] = None
    tour: Optional[BookingTourInfo] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedBookings(BaseModel):
    items: list[BookingResponse]
    total: int
    page: int
    per_page: int
    pages: int
