from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_users: int
    total_tours: int
    total_bookings: int
    total_revenue: float
    pending_bookings: int
    confirmed_bookings: int
    pending_inquiries: int
    pending_trip_plans: int
    active_tours: int
    pending_testimonials: int
