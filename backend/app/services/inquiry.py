from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inquiry import Inquiry
from app.repositories.inquiry import InquiryRepository
from app.schemas.inquiry import InquiryCreate, InquiryUpdate, PaginatedInquiries


class InquiryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = InquiryRepository(db)

    async def create(self, data: InquiryCreate) -> Inquiry:
        inquiry = Inquiry(
            name=data.name,
            email=data.email,
            phone=data.phone,
            message=data.message,
            tour_interest=data.tour_interest,
        )
        return await self.repo.create(inquiry)

    async def get(self, inquiry_id: int) -> Inquiry:
        inquiry = await self.repo.get(inquiry_id)
        if not inquiry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
        return inquiry

    async def list_all(self, page: int = 1, per_page: int = 20) -> PaginatedInquiries:
        skip = (page - 1) * per_page
        items = await self.repo.get_all_paginated(skip=skip, limit=per_page)
        total = await self.repo.count()
        return PaginatedInquiries(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def update(self, inquiry_id: int, data: InquiryUpdate) -> Inquiry:
        inquiry = await self.get(inquiry_id)
        return await self.repo.update(inquiry, data.model_dump(exclude_none=True))

    async def delete(self, inquiry_id: int) -> None:
        inquiry = await self.get(inquiry_id)
        await self.repo.delete(inquiry)
