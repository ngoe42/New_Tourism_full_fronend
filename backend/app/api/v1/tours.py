from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.tour import TourCreate, TourUpdate, TourResponse, TourListResponse, PaginatedTours
from app.services.tour import TourService

router = APIRouter(tags=["Tours"])


@router.get("", response_model=PaginatedTours)
async def list_tours(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = TourService(db)
    return await service.list_tours(
        page=page, per_page=per_page, query=q,
        category=category, min_price=min_price, max_price=max_price,
    )


@router.get("/featured", response_model=list[TourListResponse])
async def get_featured_tours(limit: int = Query(6, ge=1, le=12), db: AsyncSession = Depends(get_db)):
    from app.repositories.tour import TourRepository
    repo = TourRepository(db)
    return await repo.get_featured(limit=limit)


@router.get("/{tour_id_or_slug}", response_model=TourResponse)
async def get_tour(tour_id_or_slug: str, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    if tour_id_or_slug.isdigit():
        return await service.get_tour(int(tour_id_or_slug))
    return await service.get_tour_by_slug(tour_id_or_slug)


@router.post("", response_model=TourResponse, status_code=201, dependencies=[Depends(require_admin)])
async def create_tour(data: TourCreate, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    return await service.create_tour(data)


@router.put("/{tour_id}", response_model=TourResponse, dependencies=[Depends(require_admin)])
async def update_tour(tour_id: int, data: TourUpdate, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    return await service.update_tour(tour_id, data)


@router.delete("/{tour_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_tour(tour_id: int, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    await service.delete_tour(tour_id)


@router.delete("/{tour_id}/images/{image_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_tour_image(tour_id: int, image_id: int, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    await service.delete_image(image_id)
