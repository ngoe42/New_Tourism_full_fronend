"""
Token blacklist — Redis-backed with in-memory fallback.

Uses Redis when available for multi-instance consistency (horizontal scaling).
Falls back to an in-memory dict when Redis is not configured, which works
fine for single-instance deployments.
"""
import asyncio
from datetime import datetime, timezone
from threading import Lock

from app.core.cache import cache_get, cache_set, _redis

_BLACKLIST_PREFIX = "token_blacklist:"

# ── In-memory fallback ────────────────────────────────────────────────────
_blacklist: dict[str, float] = {}   # fingerprint -> exp (unix timestamp)
_lock = Lock()


def _fingerprint(payload: dict) -> str:
    return f"{payload['sub']}:{payload['exp']}"


def _use_redis() -> bool:
    """Return True if a Redis connection is available."""
    return _redis is not None


def blacklist_token(payload: dict) -> None:
    """Add a decoded token payload to the blacklist (sync wrapper)."""
    fp = _fingerprint(payload)
    exp = float(payload.get("exp", 0))
    ttl = max(int(exp - datetime.now(timezone.utc).timestamp()), 60)

    # Always update in-memory mirror for fast sync checks
    with _lock:
        _blacklist[fp] = exp
        _purge_expired()

    # Also persist to Redis for cross-instance consistency
    if _use_redis():
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(_redis_blacklist_add(fp, ttl))
            else:
                asyncio.run(_redis_blacklist_add(fp, ttl))
        except Exception:
            pass


def is_blacklisted(payload: dict) -> bool:
    """Return True if the token has been explicitly invalidated (sync wrapper)."""
    fp = _fingerprint(payload)

    # For Redis check we also maintain an in-memory mirror of recently
    # blacklisted fingerprints so the sync check is always fast.
    with _lock:
        if fp in _blacklist:
            return True

    return False


async def is_blacklisted_async(payload: dict) -> bool:
    """Async version — checks Redis then in-memory fallback."""
    fp = _fingerprint(payload)

    if _use_redis():
        try:
            val = await cache_get(f"{_BLACKLIST_PREFIX}{fp}")
            if val is not None:
                return True
        except Exception:
            pass

    with _lock:
        return fp in _blacklist


async def _redis_blacklist_add(fp: str, ttl: int) -> None:
    """Add a fingerprint to the Redis blacklist with TTL."""
    await cache_set(f"{_BLACKLIST_PREFIX}{fp}", "1", ttl)


def _purge_expired() -> None:
    """Remove entries whose token has already expired (called under lock)."""
    now = datetime.now(timezone.utc).timestamp()
    expired = [fp for fp, exp in _blacklist.items() if exp < now]
    for fp in expired:
        del _blacklist[fp]
