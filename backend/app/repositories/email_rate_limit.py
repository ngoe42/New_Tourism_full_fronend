from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_rate_limit import EmailRateLimit


class EmailRateLimitRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def count_recent(
        self, email: str, since: datetime
    ) -> int:
        stmt = (
            select(func.count())
            .select_from(EmailRateLimit)
            .where(
                EmailRateLimit.email == email,
                EmailRateLimit.created_at >= since,
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def create(self, email: str, action_type: Optional[str] = None) -> EmailRateLimit:
        record = EmailRateLimit(
            email=email,
            action_type=action_type,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(record)
        await self.db.flush()
        return record

    async def cleanup_old(self, cutoff: datetime) -> int:
        stmt = delete(EmailRateLimit).where(EmailRateLimit.created_at < cutoff)
        result = await self.db.execute(stmt)
        await self.db.flush()
        return result.rowcount
