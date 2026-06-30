import asyncio
from typing import Optional
import time
import httpx
from loguru import logger
from app.core.config import settings


async def _retry_http(coro_factory, max_attempts: int = 3, retryable_statuses=frozenset({502, 503, 504})):
    """Retry an HTTP call on transient failures (network errors or 5xx)."""
    for attempt in range(1, max_attempts + 1):
        try:
            resp = await coro_factory()
            if resp.status_code in retryable_statuses and attempt < max_attempts:
                wait = 0.5 * (2 ** (attempt - 1))
                logger.warning(f"HTTP {resp.status_code} — retrying in {wait:.1f}s (attempt {attempt}/{max_attempts})")
                await asyncio.sleep(wait)
                continue
            resp.raise_for_status()
            return resp
        except httpx.TimeoutException as exc:
            if attempt < max_attempts:
                wait = 0.5 * (2 ** (attempt - 1))
                logger.warning(f"HTTP timeout — retrying in {wait:.1f}s (attempt {attempt}/{max_attempts})")
                await asyncio.sleep(wait)
                continue
            raise exc
        except httpx.NetworkError as exc:
            if attempt < max_attempts:
                wait = 0.5 * (2 ** (attempt - 1))
                logger.warning(f"Network error — retrying in {wait:.1f}s (attempt {attempt}/{max_attempts})")
                await asyncio.sleep(wait)
                continue
            raise exc

_TOKEN_CACHE: dict = {}   # keyed by base_url → {"token": str, "expires_at": float}
_TOKEN_TTL = 240          # cache for 4 min (token is valid 5 min per Pesapal docs)

# Lock to prevent thundering herd on concurrent token refresh
_token_lock: Optional[asyncio.Lock] = None

# Shared httpx client with connection pooling (created lazily, closed at shutdown)
_http_client: Optional[httpx.AsyncClient] = None


def _get_token_lock() -> asyncio.Lock:
    global _token_lock
    if _token_lock is None:
        _token_lock = asyncio.Lock()
    return _token_lock


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(connect=5.0, read=15.0, write=5.0, pool=2.0)
        )
    return _http_client


async def close_http_client() -> None:
    """Call during application shutdown."""
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None


class PesapalService:
    """Pesapal v3 API client (sandbox and live)."""

    SANDBOX_URL = "https://cybqa.pesapal.com/pesapalv3"
    LIVE_URL = "https://pay.pesapal.com/v3"

    def __init__(self) -> None:
        self.base_url = (
            self.LIVE_URL
            if settings.PESAPAL_ENVIRONMENT == "live"
            else self.SANDBOX_URL
        )

    # ── Authentication ────────────────────────────────────────────────

    async def get_token(self) -> str:
        cached = _TOKEN_CACHE.get(self.base_url)
        if cached and time.monotonic() < cached["expires_at"]:
            return cached["token"]

        async with _get_token_lock():
            # Double-check after acquiring lock (another coroutine may have refreshed)
            cached = _TOKEN_CACHE.get(self.base_url)
            if cached and time.monotonic() < cached["expires_at"]:
                return cached["token"]

            url = f"{self.base_url}/api/Auth/RequestToken"
            client = _get_http_client()
            resp = await _retry_http(
                lambda: client.post(
                    url,
                    json={
                        "consumer_key": settings.PESAPAL_CONSUMER_KEY,
                        "consumer_secret": settings.PESAPAL_CONSUMER_SECRET,
                    },
                    headers={"Accept": "application/json", "Content-Type": "application/json"},
                )
            )
            data = resp.json()
            if data.get("status") not in ("200", 200):
                raise RuntimeError(f"Pesapal auth failed: {data}")
            token = data["token"]
            _TOKEN_CACHE[self.base_url] = {"token": token, "expires_at": time.monotonic() + _TOKEN_TTL}
            logger.debug("Pesapal auth token refreshed")
            return token

    async def _headers(self) -> dict:
        token = await self.get_token()
        return {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    # ── IPN Registration ──────────────────────────────────────────────

    async def register_ipn(self, ipn_url: str) -> str:
        """Register an IPN URL and return the ipn_id."""
        headers = await self._headers()
        url = f"{self.base_url}/api/URLSetup/RegisterIPN"
        client = _get_http_client()
        resp = await _retry_http(
            lambda: client.post(
                url,
                json={"url": ipn_url, "ipn_notification_type": "GET"},
                headers=headers,
            )
        )
        data = resp.json()
        ipn_id: str = data["ipn_id"]
        logger.info(f"Pesapal IPN registered: {ipn_id}")
        return ipn_id

    # ── Submit Order ──────────────────────────────────────────────────

    async def submit_order(
        self,
        *,
        merchant_reference: str,
        amount: float,
        currency: str,
        description: str,
        callback_url: str,
        ipn_id: str,
        email: str,
        phone: Optional[str],
        first_name: str,
        last_name: str,
    ) -> dict:
        """Submit a payment order; returns dict with redirect_url & order_tracking_id."""
        headers = await self._headers()
        url = f"{self.base_url}/api/Transactions/SubmitOrderRequest"
        payload = {
            "id": merchant_reference,
            "currency": currency,
            "amount": round(float(amount), 2),
            "description": description,
            "callback_url": callback_url,
            "notification_id": ipn_id,
            "billing_address": {
                "email_address": email,
                "phone_number": phone or "",
                "country_code": "TZ",
                "first_name": first_name,
                "last_name": last_name,
            },
        }
        client = _get_http_client()
        resp = await _retry_http(lambda: client.post(url, json=payload, headers=headers))
        data = resp.json()
        if data.get("status") not in ("200", 200):
            raise RuntimeError(f"Pesapal order submission failed: {data}")
        logger.info(
            f"Pesapal order submitted — ref={merchant_reference} tracking={data.get('order_tracking_id')}"
        )
        return data

    # ── Transaction Status ────────────────────────────────────────────

    async def get_transaction_status(self, order_tracking_id: str) -> dict:
        """Query the current payment status for a tracking ID."""
        headers = await self._headers()
        url = f"{self.base_url}/api/Transactions/GetTransactionStatus"
        client = _get_http_client()
        resp = await _retry_http(lambda: client.get(url, params={"orderTrackingId": order_tracking_id}, headers=headers))
        return resp.json()
