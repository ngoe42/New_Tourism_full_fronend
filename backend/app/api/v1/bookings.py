from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingStatusUpdate, PaginatedBookings
from app.services.booking import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    return await service.create_booking(data, current_user)


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
