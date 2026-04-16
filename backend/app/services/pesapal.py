from typing import Optional
import httpx
from loguru import logger
from app.core.config import settings


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
        url = f"{self.base_url}/api/Auth/RequestToken"
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                url,
                json={
                    "consumer_key": settings.PESAPAL_CONSUMER_KEY,
                    "consumer_secret": settings.PESAPAL_CONSUMER_SECRET,
                },
                headers={"Accept": "application/json", "Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") not in ("200", 200):
                raise RuntimeError(f"Pesapal auth failed: {data}")
            return data["token"]

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
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                url,
                json={"url": ipn_url, "ipn_notification_type": "GET"},
                headers=headers,
            )
            resp.raise_for_status()
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
            "amount": round(amount, 2),
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
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
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
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params={"orderTrackingId": order_tracking_id}, headers=headers)
            resp.raise_for_status()
            return resp.json()
