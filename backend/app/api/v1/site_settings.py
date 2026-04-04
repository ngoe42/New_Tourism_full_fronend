from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.site_settings import SiteSettings
from app.schemas.site_settings import SiteSettingsResponse, SiteSettingsUpdate

router = APIRouter(tags=["Settings"])


async def _get_or_create(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).limit(1))
    settings = result.scalar_one_or_none()
    if settings is None:
        settings = SiteSettings(show_prices=False)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings


@router.get("", response_model=SiteSettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await _get_or_create(db)


@router.put("", response_model=SiteSettingsResponse, dependencies=[Depends(require_admin)])
async def update_settings(data: SiteSettingsUpdate, db: AsyncSession = Depends(get_db)):
    settings = await _get_or_create(db)
    settings.show_prices = data.show_prices
    await db.commit()
    await db.refresh(settings)
    return settings
