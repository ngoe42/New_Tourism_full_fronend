from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.experience import Experience
from app.repositories.experience import ExperienceRepository
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    ExperienceReorderItem,
)

router = APIRouter(tags=["Experiences"])


@router.get("", response_model=List[ExperienceResponse])
async def list_experiences(db: AsyncSession = Depends(get_db)):
    repo = ExperienceRepository(db)
    return await repo.get_all_active()


@router.get("/all", response_model=List[ExperienceResponse])
async def list_all_experiences(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    repo = ExperienceRepository(db)
    return await repo.get_all()


@router.post("", response_model=ExperienceResponse, status_code=201)
async def create_experience(
    data: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    repo = ExperienceRepository(db)
    experience = Experience(**data.model_dump())
    result = await repo.create(experience)
    await db.commit()
    await db.refresh(result)
    return result


@router.put("/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    data: ExperienceUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    repo = ExperienceRepository(db)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await repo.update(experience_id, updates)
    if not result:
        raise HTTPException(status_code=404, detail="Experience not found")
    await db.commit()
    await db.refresh(result)
    return result


@router.delete("/{experience_id}", status_code=204)
async def delete_experience(
    experience_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    repo = ExperienceRepository(db)
    deleted = await repo.delete(experience_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Experience not found")
    await db.commit()


@router.post("/reorder", status_code=200)
async def reorder_experiences(
    items: List[ExperienceReorderItem],
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    repo = ExperienceRepository(db)
    await repo.bulk_reorder([{"id": i.id, "order": i.order} for i in items])
    await db.commit()
    return {"ok": True}
