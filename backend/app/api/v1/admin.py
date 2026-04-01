from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.schemas.dashboard import DashboardStats
from app.services.dashboard import DashboardService

router = APIRouter(tags=["Admin Dashboard"])


@router.get("/dashboard", response_model=DashboardStats, dependencies=[Depends(require_admin)])
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    service = DashboardService(db)
    return await service.get_stats()
