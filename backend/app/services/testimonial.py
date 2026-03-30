from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.testimonial import Testimonial
from app.models.user import User
from app.repositories.testimonial import TestimonialRepository
from app.schemas.testimonial import TestimonialCreate, TestimonialAdminUpdate, PaginatedTestimonials


class TestimonialService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TestimonialRepository(db)

    async def create(self, data: TestimonialCreate, user: Optional[User] = None) -> Testimonial:
        testimonial = Testimonial(
            user_id=user.id if user else None,
            tour_id=data.tour_id,
            name=data.name,
            location=data.location,
            rating=data.rating,
            message=data.message,
            avatar_url=user.email if user else None,
            is_approved=False,
        )
        return await self.repo.create(testimonial)

    async def get(self, testimonial_id: int) -> Testimonial:
        t = await self.repo.get(testimonial_id)
        if not t:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
        return t

    async def list_approved(self, page: int = 1, per_page: int = 12) -> PaginatedTestimonials:
        skip = (page - 1) * per_page
        items = await self.repo.get_approved(skip=skip, limit=per_page)
        total = await self.repo.count_approved()
        return PaginatedTestimonials(
            items=items, total=total, page=page, per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def list_all(self, page: int = 1, per_page: int = 20) -> PaginatedTestimonials:
        skip = (page - 1) * per_page
        items = await self.repo.get_all_paginated(skip=skip, limit=per_page)
        total = await self.repo.count()
        return PaginatedTestimonials(
            items=items, total=total, page=page, per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def admin_update(self, testimonial_id: int, data: TestimonialAdminUpdate) -> Testimonial:
        t = await self.get(testimonial_id)
        return await self.repo.update(t, data.model_dump(exclude_none=True))

    async def delete(self, testimonial_id: int) -> None:
        t = await self.get(testimonial_id)
        await self.repo.delete(t)
