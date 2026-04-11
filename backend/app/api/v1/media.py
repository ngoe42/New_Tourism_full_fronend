import random
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.experience import Experience
from app.models.route import Route, RouteImage
from app.models.tour import Tour, TourImage
from app.models.user import User
from app.schemas.media import MediaResponse, MediaUploadResponse
from app.services.media import MediaService

router = APIRouter(tags=["Media"])


@router.post("/upload", response_model=MediaUploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    tour_id: Optional[int] = Query(None),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db)
    media = await service.upload(file, current_user, tour_id=tour_id)
    return media


@router.get("", response_model=list[MediaResponse], dependencies=[Depends(require_admin)])
async def list_media(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db)
    return await service.list_all(page=page, per_page=per_page)


@router.get("/hero-images", response_model=list[str])
async def list_hero_images(
    limit: int = Query(30, ge=1, le=80),
    db: AsyncSession = Depends(get_db),
):
    urls: list[str] = []

    tour_rows = await db.execute(
        select(TourImage.url)
        .join(Tour, TourImage.tour_id == Tour.id)
        .where(Tour.is_published == True)
        .order_by(TourImage.created_at.desc())
        .limit(limit * 2)
    )
    urls.extend([r[0] for r in tour_rows.all() if r[0]])

    route_rows = await db.execute(
        select(RouteImage.url)
        .join(Route, RouteImage.route_id == Route.id)
        .where(Route.is_published == True)
        .order_by(RouteImage.created_at.desc())
        .limit(limit * 2)
    )
    urls.extend([r[0] for r in route_rows.all() if r[0]])

    exp_rows = await db.execute(
        select(Experience.image_url)
        .where(Experience.is_active == True)
        .order_by(Experience.updated_at.desc())
        .limit(limit * 2)
    )
    urls.extend([r[0] for r in exp_rows.all() if r[0]])

    cleaned: list[str] = []
    seen = set()
    for u in urls:
        if not u:
            continue
        if "/uploads/videos/" in u:
            continue
        key = u.strip()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(key)

    random.shuffle(cleaned)
    return cleaned[:limit]


@router.delete("/{media_id}", status_code=204)
async def delete_media(
    media_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db)
    await service.delete(media_id)
