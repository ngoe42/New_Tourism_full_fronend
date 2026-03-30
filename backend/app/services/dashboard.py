from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import BookingStatus
from app.repositories.booking import BookingRepository
from app.repositories.inquiry import InquiryRepository
from app.repositories.testimonial import TestimonialRepository
from app.repositories.tour import TourRepository
from app.repositories.trip_plan import TripPlanRepository
from app.repositories.user import UserRepository
from app.schemas.dashboard import DashboardStats


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.tour_repo = TourRepository(db)
        self.booking_repo = BookingRepository(db)
        self.inquiry_repo = InquiryRepository(db)
        self.trip_repo = TripPlanRepository(db)
        self.testimonial_repo = TestimonialRepository(db)

    async def get_stats(self) -> DashboardStats:
        total_users = await self.user_repo.count()
        total_tours = await self.tour_repo.count()
        total_bookings = await self.booking_repo.count()
        total_revenue = await self.booking_repo.get_total_revenue()
        pending_bookings = await self.booking_repo.count_by_status(BookingStatus.pending)
        confirmed_bookings = await self.booking_repo.count_by_status(BookingStatus.confirmed)
        pending_inquiries = await self.inquiry_repo.count_unread()
        pending_trip_plans = await self.trip_repo.count_pending()
        active_tours = await self.tour_repo.count_published()
        pending_testimonials = await self.testimonial_repo.count_pending()

        return DashboardStats(
            total_users=total_users,
            total_tours=total_tours,
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            pending_bookings=pending_bookings,
            confirmed_bookings=confirmed_bookings,
            pending_inquiries=pending_inquiries,
            pending_trip_plans=pending_trip_plans,
            active_tours=active_tours,
            pending_testimonials=pending_testimonials,
        )
