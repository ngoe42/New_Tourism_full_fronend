from datetime import datetime, timedelta, timezone

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.email_rate_limit import EmailRateLimitRepository

_HOURLY_LIMIT = 5
_DAILY_LIMIT = 20
_CLEANUP_HOURS = 48


class RateLimitService:
    def __init__(self, db: AsyncSession):
        self.repo = EmailRateLimitRepository(db)

    async def can_send_email(self, email: str) -> tuple[bool, str]:
        now = datetime.now(timezone.utc)
        hourly_cutoff = now - timedelta(hours=1)
        daily_cutoff = now - timedelta(hours=24)

        hourly_count = await self.repo.count_recent(email, hourly_cutoff)
        daily_count = await self.repo.count_recent(email, daily_cutoff)

        if hourly_count >= _HOURLY_LIMIT:
            oldest = now - timedelta(hours=1)
            wait_seconds = int((oldest + timedelta(hours=1) - now).total_seconds())
            wait_minutes = max(1, wait_seconds // 60)
            logger.warning(f"Rate limit hit for {email}: {hourly_count} in last hour")
            return False, f"Too many booking attempts from this email. Please wait {wait_minutes} minutes before trying again."

        if daily_count >= _DAILY_LIMIT:
            oldest = now - timedelta(hours=24)
            wait_seconds = int((oldest + timedelta(hours=24) - now).total_seconds())
            wait_minutes = max(1, wait_seconds // 60)
            logger.warning(f"Rate limit hit for {email}: {daily_count} in last 24 hours")
            return False, f"Too many booking attempts from this email. Please wait {wait_minutes} minutes before trying again."

        return True, ""

    async def record_email_send(self, email: str, action_type: str | None = "booking") -> None:
        now = datetime.now(timezone.utc)
        await self.repo.create(email=email, action_type=action_type)
        logger.info(f"Rate limit record created for {email} at {now.isoformat()}")

        cleanup_cutoff = now - timedelta(hours=_CLEANUP_HOURS)
        deleted = await self.repo.cleanup_old(cleanup_cutoff)
        if deleted:
            logger.debug(f"Cleaned up {deleted} old rate limit records (before {cleanup_cutoff.isoformat()})")
