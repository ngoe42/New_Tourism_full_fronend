from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user_optional, require_admin
from app.models.user import User
from app.schemas.testimonial import (
    TestimonialCreate, TestimonialResponse, TestimonialAdminUpdate, PaginatedTestimonials
)
from app.services.testimonial import TestimonialService

router = APIRouter(tags=["Testimonials"])


@router.post("", response_model=TestimonialResponse, status_code=201)
async def create_testimonial(
    data: TestimonialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    service = TestimonialService(db)
    return await service.create(data, user=current_user)


@router.get("", response_model=PaginatedTestimonials)
async def list_testimonials(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    service = TestimonialService(db)
    return await service.list_approved(page=page, per_page=per_page)


@router.get("/all", response_model=PaginatedTestimonials, dependencies=[Depends(require_admin)])
async def list_all_testimonials(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = TestimonialService(db)
    return await service.list_all(page=page, per_page=per_page)


@router.put("/{testimonial_id}/approve", response_model=TestimonialResponse, dependencies=[Depends(require_admin)])
async def approve_testimonial(testimonial_id: int, db: AsyncSession = Depends(get_db)):
    service = TestimonialService(db)
    return await service.admin_update(testimonial_id, TestimonialAdminUpdate(is_approved=True))


@router.put("/{testimonial_id}", response_model=TestimonialResponse, dependencies=[Depends(require_admin)])
async def admin_update_testimonial(
    testimonial_id: int,
    data: TestimonialAdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = TestimonialService(db)
    return await service.admin_update(testimonial_id, data)


@router.delete("/{testimonial_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_testimonial(testimonial_id: int, db: AsyncSession = Depends(get_db)):
    service = TestimonialService(db)
    await service.delete(testimonial_id)
