from typing import List, Optional
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.route import RouteCreate, RouteUpdate, RouteOut, RouteImageOut
from app.services.route import RouteService
from app.dependencies.auth import require_admin

router = APIRouter()


@router.get("/", response_model=List[RouteOut])
async def get_all_routes(
    published_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    service = RouteService(db)
    routes = await service.get_all_routes()
    if published_only:
        routes = [r for r in routes if r.is_published]
    return routes


@router.get("/{slug_or_id}", response_model=RouteOut)
async def get_route(slug_or_id: str, db: AsyncSession = Depends(get_db)):
    service = RouteService(db)
    if slug_or_id.isdigit():
        return await service.get_route(int(slug_or_id))
    return await service.get_route_by_slug(slug_or_id)


@router.post("/", response_model=RouteOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_route(route_in: RouteCreate, db: AsyncSession = Depends(get_db)):
    return await RouteService(db).create_route(route_in)


@router.put("/{route_id}", response_model=RouteOut, dependencies=[Depends(require_admin)])
async def update_route(route_id: int, route_in: RouteUpdate, db: AsyncSession = Depends(get_db)):
    return await RouteService(db).update_route(route_id, route_in)


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_route(route_id: int, db: AsyncSession = Depends(get_db)):
    await RouteService(db).delete_route(route_id)


# ── Image endpoints ─────────────────────────────────────────────────────────

@router.post("/{route_id}/images", response_model=RouteImageOut, status_code=201,
             dependencies=[Depends(require_admin)])
async def upload_route_image(
    route_id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    is_cover: bool = Form(False),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService(db).upload_image(route_id, file, caption=caption, is_cover=is_cover)


@router.delete("/{route_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_route_image(route_id: int, image_id: int, db: AsyncSession = Depends(get_db)):
    await RouteService(db).delete_image(route_id, image_id)
