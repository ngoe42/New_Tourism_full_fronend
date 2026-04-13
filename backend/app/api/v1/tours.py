import hashlib
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.cache import cache_get, cache_set, cache_delete, cache_delete_pattern, TTL_SHORT, TTL_MEDIUM
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.tour import TourCreate, TourUpdate, TourResponse, TourListResponse, TourImageResponse, PaginatedTours
from app.services.tour import TourService
from app.services.media import MediaService


async def _invalidate_tours() -> None:
    """Wipe all tour-related cache entries."""
    await cache_delete_pattern("tours:list:*")
    await cache_delete_pattern("tours:featured:*")
    await cache_delete_pattern("tour:*")

router = APIRouter(tags=["Tours"])


@router.get("", response_model=PaginatedTours)
async def list_tours(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=200),
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    admin: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    raw = f"{page}:{per_page}:{q}:{category}:{min_price}:{max_price}:{admin}"
    cache_key = "tours:list:" + hashlib.md5(raw.encode()).hexdigest()
    cached = await cache_get(cache_key)
    if cached is not None:
        return JSONResponse(content=cached)
    service = TourService(db)
    data = await service.list_tours(
        page=page, per_page=per_page, query=q,
        category=category, min_price=min_price, max_price=max_price,
        admin=admin,
    )
    await cache_set(cache_key, jsonable_encoder(data), TTL_SHORT)
    return data


@router.get("/featured", response_model=list[TourListResponse])
async def get_featured_tours(limit: int = Query(6, ge=1, le=12), db: AsyncSession = Depends(get_db)):
    cache_key = f"tours:featured:{limit}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return JSONResponse(content=cached)
    from app.repositories.tour import TourRepository
    repo = TourRepository(db)
    data = await repo.get_featured(limit=limit)
    await cache_set(cache_key, jsonable_encoder(data), TTL_MEDIUM)
    return data


@router.get("/{tour_id_or_slug}", response_model=TourResponse)
async def get_tour(tour_id_or_slug: str, db: AsyncSession = Depends(get_db)):
    cache_key = f"tour:{tour_id_or_slug}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return JSONResponse(content=cached)
    service = TourService(db)
    if tour_id_or_slug.isdigit():
        tour = await service.get_tour(int(tour_id_or_slug))
    else:
        tour = await service.get_tour_by_slug(tour_id_or_slug)
    await cache_set(cache_key, jsonable_encoder(tour), TTL_MEDIUM)
    return tour


@router.post("", response_model=TourResponse, status_code=201, dependencies=[Depends(require_admin)])
async def create_tour(data: TourCreate, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    result = await service.create_tour(data)
    await _invalidate_tours()
    return result


@router.put("/{tour_id}", response_model=TourResponse, dependencies=[Depends(require_admin)])
async def update_tour(tour_id: int, data: TourUpdate, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    result = await service.update_tour(tour_id, data)
    await _invalidate_tours()
    return result


@router.delete("/{tour_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_tour(tour_id: int, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    await service.delete_tour(tour_id)
    await _invalidate_tours()


@router.post("/{tour_id}/images", response_model=TourImageResponse, status_code=201)
async def upload_tour_image(
    tour_id: int,
    file: UploadFile = File(...),
    is_cover: bool = Form(False),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    media = await MediaService(db).upload(file, current_user)
    result = await TourService(db).add_image(tour_id, media.url, media.public_id, is_cover=is_cover)
    await _invalidate_tours()
    return result


@router.delete("/{tour_id}/images/{image_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_tour_image(tour_id: int, image_id: int, db: AsyncSession = Depends(get_db)):
    service = TourService(db)
    await service.delete_image(image_id)
    await _invalidate_tours()
