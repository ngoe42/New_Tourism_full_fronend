from fastapi import APIRouter, Depends, HTTPException, Query, Request, status as http_status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.limiter import limiter
from app.dependencies.auth import get_current_user, get_current_user_optional, require_admin
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingPublicResponse, BookingStatusUpdate, BookingAdminUpdate, PaginatedBookings
from app.repositories.booking import BookingRepository
from app.services.booking import BookingService

router = APIRouter(tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
@limiter.limit("5/hour")
async def create_booking(
    request: Request,
    data: BookingCreate,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.create_booking(data, current_user)


@router.get("/lookup", response_model=BookingPublicResponse)
@limiter.limit("10/minute")
async def lookup_booking_public(
    request: Request,
    id: int = Query(..., description="Booking ID"),
    email: str = Query(..., description="Email used when booking"),
    db: AsyncSession = Depends(get_db),
):
    """Public booking lookup — verifies ID + email match before returning details."""
    repo = BookingRepository(db)
    booking = await repo.get(id)
    if not booking or booking.contact_email.lower() != email.strip().lower():
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.get("/me", response_model=PaginatedBookings)
async def my_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.list_user_bookings(current_user, page=page, per_page=per_page)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.get_booking(booking_id, current_user)


@router.get("", response_model=PaginatedBookings, dependencies=[Depends(require_admin)])
async def list_all_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.list_all_bookings(page=page, per_page=per_page)


@router.put("/{booking_id}/status", response_model=BookingResponse, dependencies=[Depends(require_admin)])
async def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.update_status(booking_id, data)


@router.put("/{booking_id}", response_model=BookingResponse, dependencies=[Depends(require_admin)])
async def admin_update_booking(
    booking_id: int,
    data: BookingAdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.admin_update(booking_id, data)


@router.delete("/{booking_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    await service.delete_booking(booking_id)
