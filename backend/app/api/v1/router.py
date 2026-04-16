from fastapi import APIRouter

from app.api.v1 import auth, users, tours, bookings, inquiries, trip_plans, media, testimonials, admin, experiences, routes, site_settings, payments

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(tours.router, prefix="/tours", tags=["Tours"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["Inquiries"])
api_router.include_router(trip_plans.router, prefix="/trip-plans", tags=["Trip Plans"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(testimonials.router, prefix="/testimonials", tags=["Testimonials"])
api_router.include_router(experiences.router, prefix="/experiences", tags=["Experiences"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(site_settings.router, prefix="/settings", tags=["Settings"])
