from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.schemas.inquiry import InquiryCreate, InquiryResponse, InquiryUpdate, PaginatedInquiries
from app.services.inquiry import InquiryService

router = APIRouter(tags=["Inquiries"])


@router.post("", response_model=InquiryResponse, status_code=201)
async def create_inquiry(data: InquiryCreate, db: AsyncSession = Depends(get_db)):
    service = InquiryService(db)
    return await service.create(data)


@router.get("", response_model=PaginatedInquiries, dependencies=[Depends(require_admin)])
async def list_inquiries(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = InquiryService(db)
    return await service.list_all(page=page, per_page=per_page)


@router.get("/{inquiry_id}", response_model=InquiryResponse, dependencies=[Depends(require_admin)])
async def get_inquiry(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    service = InquiryService(db)
    return await service.get(inquiry_id)


@router.put("/{inquiry_id}", response_model=InquiryResponse, dependencies=[Depends(require_admin)])
async def update_inquiry(inquiry_id: int, data: InquiryUpdate, db: AsyncSession = Depends(get_db)):
    service = InquiryService(db)
    return await service.update(inquiry_id, data)


@router.delete("/{inquiry_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_inquiry(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    service = InquiryService(db)
    await service.delete(inquiry_id)
