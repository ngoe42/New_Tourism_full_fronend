"""
Redis caching helpers.

Usage
-----
  from app.core.cache import cache_get, cache_set, cache_delete, cache_delete_pattern

All functions are no-ops (return None / do nothing) when Redis is unavailable,
so the rest of the application never needs to handle cache errors.
"""

import json
from typing import Any, Optional

from loguru import logger

import redis.asyncio as aioredis

from app.core.config import settings as app_settings

# ── TTL constants (seconds) ───────────────────────────────────────────────────
TTL_SHORT  = 300   # 5 min  — paginated tour lists
TTL_MEDIUM = 600   # 10 min — experiences, routes, featured tours
TTL_LONG   = 1800  # 30 min — site settings (logo, hero video, etc.)

# ── Internal singleton ────────────────────────────────────────────────────────
_redis: Optional[aioredis.Redis] = None


# ── Lifecycle ─────────────────────────────────────────────────────────────────

async def init_redis() -> None:
    """Call once during application startup."""
    global _redis
    if not app_settings.REDIS_URL:
        logger.info("REDIS_URL not set — Redis caching disabled")
        return
    try:
        _redis = aioredis.from_url(
            app_settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        await _redis.ping()
        logger.info("Redis connected — caching enabled")
    except Exception as exc:
        logger.warning(f"Redis unavailable ({exc}) — caching disabled")
        _redis = None


async def close_redis() -> None:
    """Call once during application shutdown."""
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
        logger.info("Redis connection closed")


# ── Public helpers ────────────────────────────────────────────────────────────

async def cache_get(key: str) -> Optional[Any]:
    """Return deserialised value or None on miss / error."""
    if _redis is None:
        return None
    try:
        raw = await _redis.get(key)
        return json.loads(raw) if raw is not None else None
    except Exception as exc:
        logger.warning(f"cache_get [{key}]: {exc}")
        return None


async def cache_set(key: str, value: Any, ttl: int = TTL_MEDIUM) -> None:
    """Serialise and store value with TTL (seconds)."""
    if _redis is None:
        return
    try:
        await _redis.setex(key, ttl, json.dumps(value, default=str))
    except Exception as exc:
        logger.warning(f"cache_set [{key}]: {exc}")


async def cache_delete(*keys: str) -> None:
    """Delete one or more exact keys."""
    if _redis is None or not keys:
        return
    try:
        await _redis.delete(*keys)
    except Exception as exc:
        logger.warning(f"cache_delete {keys}: {exc}")


async def cache_delete_pattern(pattern: str) -> None:
    """Delete all keys matching a glob pattern, e.g. 'tours:list:*'."""
    if _redis is None:
        return
    try:
        keys = await _redis.keys(pattern)
        if keys:
            await _redis.delete(*keys)
    except Exception as exc:
        logger.warning(f"cache_delete_pattern [{pattern}]: {exc}")
