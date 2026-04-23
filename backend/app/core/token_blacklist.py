"""
In-memory refresh token blacklist.

Stores a fingerprint (sub:exp) for each invalidated refresh token.
Entries auto-expire when the token's own exp time passes, keeping
memory usage bounded. For multi-instance deploys, swap this for a
Redis SET with TTL using the optional REDIS_URL.
"""
from datetime import datetime, timezone
from threading import Lock

_blacklist: dict[str, float] = {}   # fingerprint -> exp (unix timestamp)
_lock = Lock()


def _fingerprint(payload: dict) -> str:
    return f"{payload['sub']}:{payload['exp']}"


def blacklist_token(payload: dict) -> None:
    """Add a decoded token payload to the blacklist."""
    fp = _fingerprint(payload)
    exp = float(payload.get("exp", 0))
    with _lock:
        _blacklist[fp] = exp
        _purge_expired()


def is_blacklisted(payload: dict) -> bool:
    """Return True if the token has been explicitly invalidated."""
    fp = _fingerprint(payload)
    with _lock:
        return fp in _blacklist


def _purge_expired() -> None:
    """Remove entries whose token has already expired (called under lock)."""
    now = datetime.now(timezone.utc).timestamp()
    expired = [fp for fp, exp in _blacklist.items() if exp < now]
    for fp in expired:
        del _blacklist[fp]
