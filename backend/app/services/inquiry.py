from typing import Optional
from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inquiry import Inquiry
from app.repositories.inquiry import InquiryRepository
from app.repositories.route import RouteRepository
from app.schemas.inquiry import InquiryCreate, InquiryUpdate, PaginatedInquiries
from app.services.email_service import send_inquiry_confirmation_email, send_route_booking_email


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
        inquiry = await self.repo.create(inquiry)

        try:
            if data.route_id:
                route_repo = RouteRepository(self.db)
                route = await route_repo.get_by_id(data.route_id)
                if route:
                    await send_route_booking_email(
                        name=data.name,
                        email=data.email,
                        phone=data.phone,
                        route_name=route.name,
                        route_nickname=route.nickname,
                        route_duration=route.duration,
                        route_difficulty=route.difficulty,
                        route_max_altitude=route.max_altitude,
                        route_price=route.price,
                        route_included=route.included,
                        route_best_season=route.best_season,
                        travel_date=data.travel_date,
                        guests=data.guests or 1,
                        special_requests=data.message,
                    )
                else:
                    await send_inquiry_confirmation_email(
                        name=data.name,
                        email=data.email,
                        tour_interest=data.tour_interest,
                        message=data.message,
                    )
            else:
                await send_inquiry_confirmation_email(
                    name=data.name,
                    email=data.email,
                    tour_interest=data.tour_interest,
                    message=data.message,
                )
        except Exception as exc:
            logger.error(f"Inquiry email failed for {data.email}: {exc}")

        return inquiry

    async def get(self, inquiry_id: int) -> Inquiry:
        inquiry = await self.repo.get(inquiry_id)
        if not inquiry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
        return inquiry

    async def list_all(
        self, page: int = 1, per_page: int = 20,
        search: Optional[str] = None, status: Optional[str] = None,
    ) -> PaginatedInquiries:
        skip = (page - 1) * per_page
        items = await self.repo.get_all_paginated(skip=skip, limit=per_page, search=search, status=status)
        total = await self.repo.count_filtered(search=search, status=status)
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
