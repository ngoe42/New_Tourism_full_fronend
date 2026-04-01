from fastapi import APIRouter

from app.api.v1 import auth, users, tours, bookings, inquiries, trip_plans, media, testimonials, admin, experiences

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(tours.router)
api_router.include_router(bookings.router)
api_router.include_router(inquiries.router)
api_router.include_router(trip_plans.router)
api_router.include_router(media.router)
api_router.include_router(testimonials.router)
api_router.include_router(experiences.router)
api_router.include_router(admin.router)
