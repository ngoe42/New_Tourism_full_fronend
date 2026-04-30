import hashlib
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select, func, text
from sqlalchemy.orm import selectinload
from app.models.booking import Booking, BookingStatus
from app.repositories.base import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    def __init__(self, db: AsyncSession):
        super().__init__(Booking, db)

    @staticmethod
    def _eager(stmt):
        """Eagerly load tour & user to avoid lazy-load in async mode."""
        return stmt.options(selectinload(Booking.tour), selectinload(Booking.user))

    async def get(self, id: int) -> Optional[Booking]:
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == id))
        )
        return result.scalar_one_or_none()

    async def create(self, obj: Booking) -> Booking:
        self.db.add(obj)
        await self.db.flush()
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == obj.id))
        )
        return result.scalar_one()

    async def update(self, obj: Booking, data: dict) -> Booking:
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        await self.db.flush()
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == obj.id))
        )
        return result.scalar_one()

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> list[Booking]:
        result = await self.db.execute(
            self._eager(
                select(Booking)
                .where(Booking.user_id == user_id)
                .order_by(Booking.created_at.desc())
                .offset(skip).limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def count_by_user(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.user_id == user_id)
        )
        return result.scalar_one()

    async def get_all_paginated(self, skip: int = 0, limit: int = 20) -> list[Booking]:
        result = await self.db.execute(
            self._eager(
                select(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def count_by_status(self, status: BookingStatus) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.status == status)
        )
        return result.scalar_one()

    async def get_by_tracking_id(self, tracking_id: str) -> Optional[Booking]:
        result = await self.db.execute(
            self._eager(
                select(Booking).where(Booking.pesapal_order_tracking_id == tracking_id)
            )
        )
        return result.scalar_one_or_none()

    async def has_confirmed_overlap(
        self,
        tour_id: int,
        travel_date: date,
        duration_days: int,
        exclude_booking_id: int | None = None,
    ) -> bool:
        """Return True if a confirmed booking, or a fresh pending booking (< 24 h old),
        already covers the date range.  Abandoned pending bookings older than 24 hours are
        excluded so they no longer permanently block a tour date after payment abandonment.
        """
        window = timedelta(days=max(duration_days - 1, 0))
        range_start = travel_date - window
        range_end = travel_date + window
        pending_cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

        stmt = (
            select(func.count())
            .select_from(Booking)
            .where(
                Booking.tour_id == tour_id,
                Booking.travel_date >= range_start,
                Booking.travel_date <= range_end,
                or_(
                    Booking.status == BookingStatus.confirmed,
                    and_(
                        Booking.status == BookingStatus.pending,
                        Booking.created_at >= pending_cutoff,
                    ),
                ),
            )
        )
        if exclude_booking_id:
            stmt = stmt.where(Booking.id != exclude_booking_id)

        result = await self.db.execute(stmt)
        return result.scalar_one() > 0

    async def get_total_revenue(self) -> Decimal:
        result = await self.db.execute(
            select(func.sum(Booking.total_price)).where(Booking.status == BookingStatus.confirmed)
        )
        return result.scalar_one() or Decimal("0.00")

    async def acquire_booking_lock(self, tour_id: int, travel_date: date) -> None:
        """Acquire a PostgreSQL advisory lock to serialize bookings for the same tour+date.
        Uses SHA-256 for a deterministic key across all pods — Python hash() is randomized
        per-process via PYTHONHASHSEED and must never be used for cross-pod coordination.
        """
        lock_key = int(
            hashlib.sha256(f"booking:{tour_id}:{travel_date}".encode()).hexdigest(), 16
        ) % (2**31)
        await self.db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": lock_key})

    async def get_for_update(self, id: int) -> Optional[Booking]:
        """SELECT ... FOR UPDATE to prevent concurrent modifications."""
        result = await self.db.execute(
            self._eager(select(Booking).where(Booking.id == id).with_for_update())
        )
        return result.scalar_one_or_none()

    async def get_by_tracking_id_for_update(self, tracking_id: str) -> Optional[Booking]:
        """SELECT ... FOR UPDATE by Pesapal tracking ID."""
        result = await self.db.execute(
            self._eager(
                select(Booking).where(
                    Booking.pesapal_order_tracking_id == tracking_id
                ).with_for_update()
            )
        )
        return result.scalar_one_or_none()

    async def get_by_merchant_reference_for_update(self, merchant_ref: str) -> Optional[Booking]:
        """SELECT ... FOR UPDATE by Pesapal merchant reference (legacy IPN fallback)."""
        result = await self.db.execute(
            self._eager(
                select(Booking).where(
                    Booking.pesapal_merchant_reference == merchant_ref
                ).with_for_update()
            )
        )
        return result.scalar_one_or_none()

    async def expire_abandoned(self) -> int:
        """Cancel pending bookings that have been abandoned.

        • No payment URL (link never generated): expire after 2 h.
        • Has payment URL (checkout started but abandoned): expire after 24 h.

        Returns the number of bookings expired.
        """
        now = datetime.now(timezone.utc)
        cutoff_no_link = now - timedelta(hours=2)
        cutoff_with_link = now - timedelta(hours=24)
        stmt = (
            select(Booking)
            .where(
                Booking.status == BookingStatus.pending,
                or_(
                    and_(
                        Booking.payment_redirect_url.is_(None),
                        Booking.created_at < cutoff_no_link,
                    ),
                    and_(
                        Booking.payment_redirect_url.isnot(None),
                        Booking.created_at < cutoff_with_link,
                    ),
                ),
            )
        )
        result = await self.db.execute(stmt)
        bookings = list(result.scalars().all())
        count = 0
        for b in bookings:
            b.status = BookingStatus.cancelled
            count += 1
        if count:
            await self.db.flush()
        return count
