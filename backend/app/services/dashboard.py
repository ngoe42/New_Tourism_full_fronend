from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_get, cache_set, TTL_SHORT
from app.schemas.dashboard import DashboardStats

_DASHBOARD_CACHE_KEY = "dashboard:stats"
_DASHBOARD_CACHE_TTL = 30  # 30 seconds — stale dashboard is acceptable, DB load is not


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stats(self) -> DashboardStats:
        # Try cache first
        cached = await cache_get(_DASHBOARD_CACHE_KEY)
        if cached is not None:
            return DashboardStats(**cached)

        # Single round-trip: 10 aggregates in one query
        sql = text("""
            SELECT
              (SELECT count(*) FROM users)                                              AS total_users,
              (SELECT count(*) FROM tours)                                              AS total_tours,
              (SELECT count(*) FROM bookings)                                           AS total_bookings,
              COALESCE((SELECT sum(total_price) FROM bookings WHERE status = 'confirmed'), 0) AS total_revenue,
              (SELECT count(*) FROM bookings      WHERE status = 'pending')             AS pending_bookings,
              (SELECT count(*) FROM bookings      WHERE status = 'confirmed')           AS confirmed_bookings,
              (SELECT count(*) FROM inquiries     WHERE is_read = false)                AS pending_inquiries,
              (SELECT count(*) FROM trip_plans    WHERE status = 'pending')             AS pending_trip_plans,
              (SELECT count(*) FROM tours         WHERE is_published = true)            AS active_tours,
              (SELECT count(*) FROM testimonials  WHERE is_approved = false)            AS pending_testimonials
        """)
        result = await self.db.execute(sql)
        row = result.one()

        stats = DashboardStats(
            total_users=row.total_users,
            total_tours=row.total_tours,
            total_bookings=row.total_bookings,
            total_revenue=float(row.total_revenue),
            pending_bookings=row.pending_bookings,
            confirmed_bookings=row.confirmed_bookings,
            pending_inquiries=row.pending_inquiries,
            pending_trip_plans=row.pending_trip_plans,
            active_tours=row.active_tours,
            pending_testimonials=row.pending_testimonials,
        )

        # Cache for 30s — dashboard is the most-hit admin endpoint
        await cache_set(_DASHBOARD_CACHE_KEY, stats.model_dump(), ttl=_DASHBOARD_CACHE_TTL)
        return stats
