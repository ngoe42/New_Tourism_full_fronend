from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
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


@router.delete("/{media_id}", status_code=204)
async def delete_media(
    media_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db)
    await service.delete(media_id)
