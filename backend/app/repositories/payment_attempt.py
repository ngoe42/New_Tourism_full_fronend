from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment_attempt import PaymentAttempt


class PaymentAttemptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, attempt: PaymentAttempt) -> PaymentAttempt:
        self.db.add(attempt)
        await self.db.flush()
        await self.db.refresh(attempt)
        return attempt

    async def get_by_tracking_id_for_update(self, tracking_id: str) -> Optional[PaymentAttempt]:
        """SELECT … FOR UPDATE so concurrent IPN calls for the same tracking ID are serialised."""
        result = await self.db.execute(
            select(PaymentAttempt)
            .where(PaymentAttempt.order_tracking_id == tracking_id)
            .with_for_update()
        )
        return result.scalar_one_or_none()

    async def get_by_merchant_reference(self, merchant_ref: str) -> Optional[PaymentAttempt]:
        """Fallback lookup used when the tracking ID was never stored (rare race).
        Returns the most recent attempt matching the given merchant_reference.
        """
        result = await self.db.execute(
            select(PaymentAttempt)
            .where(PaymentAttempt.merchant_reference == merchant_ref)
            .order_by(PaymentAttempt.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def update_status(self, attempt: PaymentAttempt, status: str) -> None:
        attempt.status = status
        await self.db.flush()
