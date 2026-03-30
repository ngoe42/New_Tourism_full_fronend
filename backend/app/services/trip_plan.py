from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trip_plan import TripPlan
from app.models.user import User
from app.repositories.trip_plan import TripPlanRepository
from app.schemas.trip_plan import TripPlanCreate, TripPlanAdminUpdate, PaginatedTripPlans


class TripPlanService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TripPlanRepository(db)

    async def create(self, data: TripPlanCreate, user: Optional[User] = None) -> TripPlan:
        plan = TripPlan(
            user_id=user.id if user else None,
            name=data.name,
            email=data.email,
            phone=data.phone,
            destination=data.destination,
            budget=data.budget,
            number_of_people=data.number_of_people,
            travel_dates=data.travel_dates,
            duration_days=data.duration_days,
            preferences=data.preferences or [],
            special_requirements=data.special_requirements,
        )
        return await self.repo.create(plan)

    async def get(self, plan_id: int, user: Optional[User] = None) -> TripPlan:
        plan = await self.repo.get(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip plan not found")
        if user and user.role.value != "admin" and plan.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return plan

    async def list_all(self, page: int = 1, per_page: int = 20) -> PaginatedTripPlans:
        skip = (page - 1) * per_page
        items = await self.repo.get_all_paginated(skip=skip, limit=per_page)
        total = await self.repo.count()
        return PaginatedTripPlans(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def list_by_user(self, user: User, page: int = 1, per_page: int = 10) -> PaginatedTripPlans:
        skip = (page - 1) * per_page
        items = await self.repo.get_by_user(user.id, skip=skip, limit=per_page)
        total = await self.repo.count()
        return PaginatedTripPlans(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def admin_update(self, plan_id: int, data: TripPlanAdminUpdate) -> TripPlan:
        plan = await self.repo.get(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip plan not found")
        return await self.repo.update(plan, data.model_dump(exclude_none=True))
