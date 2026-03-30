from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserAdminUpdate, UserPasswordChange
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, AccessTokenResponse
from app.schemas.tour import TourCreate, TourUpdate, TourResponse, TourListResponse, PaginatedTours
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingResponse, PaginatedBookings
from app.schemas.inquiry import InquiryCreate, InquiryResponse, InquiryUpdate, PaginatedInquiries
from app.schemas.trip_plan import TripPlanCreate, TripPlanAdminUpdate, TripPlanResponse, PaginatedTripPlans
from app.schemas.media import MediaResponse, MediaUploadResponse
from app.schemas.testimonial import TestimonialCreate, TestimonialAdminUpdate, TestimonialResponse, PaginatedTestimonials
from app.schemas.dashboard import DashboardStats

__all__ = [
    "UserCreate", "UserUpdate", "UserResponse", "UserAdminUpdate", "UserPasswordChange",
    "LoginRequest", "TokenResponse", "RefreshRequest", "AccessTokenResponse",
    "TourCreate", "TourUpdate", "TourResponse", "TourListResponse", "PaginatedTours",
    "BookingCreate", "BookingStatusUpdate", "BookingResponse", "PaginatedBookings",
    "InquiryCreate", "InquiryResponse", "InquiryUpdate", "PaginatedInquiries",
    "TripPlanCreate", "TripPlanAdminUpdate", "TripPlanResponse", "PaginatedTripPlans",
    "MediaResponse", "MediaUploadResponse",
    "TestimonialCreate", "TestimonialAdminUpdate", "TestimonialResponse", "PaginatedTestimonials",
    "DashboardStats",
]
