from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_optional, require_admin
from app.models.user import User
from app.schemas.trip_plan import TripPlanCreate, TripPlanResponse, TripPlanAdminUpdate, PaginatedTripPlans
from app.services.trip_plan import TripPlanService

router = APIRouter(tags=["Trip Planning"])


@router.post("", response_model=TripPlanResponse, status_code=201)
async def create_trip_plan(
    data: TripPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    service = TripPlanService(db)
    return await service.create(data, user=current_user)


@router.get("/me", response_model=PaginatedTripPlans)
async def my_trip_plans(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    return await service.list_by_user(current_user, page=page, per_page=per_page)


@router.get("/{plan_id}", response_model=TripPlanResponse)
async def get_trip_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    return await service.get(plan_id, user=current_user)


@router.get("", response_model=PaginatedTripPlans, dependencies=[Depends(require_admin)])
async def list_all_trip_plans(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    return await service.list_all(page=page, per_page=per_page)


@router.put("/{plan_id}", response_model=TripPlanResponse, dependencies=[Depends(require_admin)])
async def admin_update_trip_plan(
    plan_id: int,
    data: TripPlanAdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    return await service.admin_update(plan_id, data)
