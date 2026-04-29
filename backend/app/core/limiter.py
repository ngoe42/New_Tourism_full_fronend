from fastapi import Request
from slowapi import Limiter

from app.core.config import settings


def _get_client_ip(request: Request) -> str:
    """Extract client IP, safe behind reverse proxies (Railway, Render, etc.)."""
    if forwarded := request.headers.get("X-Forwarded-For"):
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


limiter = Limiter(
    key_func=_get_client_ip,
    storage_uri=settings.REDIS_URL or "memory://",
)
