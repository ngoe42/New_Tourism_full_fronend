import uuid
from typing import Optional

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.repositories.booking import BookingRepository
from app.repositories.tour import TourRepository
from app.services.pesapal import PesapalService


class PaymentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.tour_repo = TourRepository(db)
        self.pesapal = PesapalService()

    # ── IPN ID ───────────────────────────────────────────────────────

    async def _get_or_register_ipn_id(self) -> str:
        """Use pre-configured IPN ID or register one on the fly."""
        if settings.PESAPAL_IPN_ID:
            return settings.PESAPAL_IPN_ID
        ipn_url = f"{settings.BACKEND_URL}/api/v1/payments/ipn"
        return await self.pesapal.register_ipn(ipn_url)

    # ── Initiate Payment ─────────────────────────────────────────────

    async def initiate_payment(self, booking_id: int, user: User | None) -> dict:
        """Create a Pesapal order for the given booking and return the redirect URL."""
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if user and booking.user_id and booking.user_id != user.id and user.role.value != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if not settings.PESAPAL_CONSUMER_KEY or not settings.PESAPAL_CONSUMER_SECRET:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment gateway not configured",
            )

        if booking.payment_status == "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking has already been paid",
            )

        merchant_reference = f"NTS-{booking.id}-{uuid.uuid4().hex[:8].upper()}"
        callback_url = f"{settings.FRONTEND_URL}/payment/callback"

        name_parts = booking.contact_name.split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "."

        try:
            ipn_id = await self._get_or_register_ipn_id()
            result = await self.pesapal.submit_order(
                merchant_reference=merchant_reference,
                amount=booking.total_price,
                currency="USD",
                description=f"Safari booking #{booking.id} — Nelson Tours & Safari",
                callback_url=callback_url,
                ipn_id=ipn_id,
                email=booking.contact_email,
                phone=booking.contact_phone,
                first_name=first_name,
                last_name=last_name,
            )
        except Exception as exc:
            logger.error(f"Pesapal payment initiation failed for booking {booking_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Payment gateway error: {exc}",
            )

        await self.booking_repo.update(booking, {
            "pesapal_order_tracking_id": result["order_tracking_id"],
            "pesapal_merchant_reference": merchant_reference,
            "payment_status": "PENDING",
            "payment_redirect_url": result["redirect_url"],
        })

        return {
            "redirect_url": result["redirect_url"],
            "order_tracking_id": result["order_tracking_id"],
            "merchant_reference": merchant_reference,
            "booking_id": booking.id,
        }

    # ── IPN Callback ─────────────────────────────────────────────────

    async def handle_ipn(
        self,
        order_tracking_id: str,
        merchant_reference: Optional[str] = None,
    ) -> dict:
        """Handle Pesapal IPN — update booking payment & booking status."""
        booking = await self.booking_repo.get_by_tracking_id(order_tracking_id)
        if not booking:
            logger.warning(f"IPN received for unknown tracking ID: {order_tracking_id}")
            return {"status": "200", "message": "IPN received"}

        try:
            status_data = await self.pesapal.get_transaction_status(order_tracking_id)
        except Exception as exc:
            logger.error(f"Failed to query Pesapal status for {order_tracking_id}: {exc}")
            return {"status": "200", "message": "IPN received"}

        payment_status = status_data.get("payment_status_description", "").upper()
        updates: dict = {"payment_status": payment_status}

        if payment_status == "COMPLETED":
            updates["status"] = BookingStatus.confirmed
            logger.info(f"Booking #{booking.id} confirmed via Pesapal IPN")
        elif payment_status in ("FAILED", "INVALID", "REVERSED"):
            logger.warning(f"Booking #{booking.id} payment {payment_status}")

        await self.booking_repo.update(booking, updates)

        return {
            "orderNotificationType": "IPNCHANGE",
            "orderTrackingId": order_tracking_id,
            "orderMerchantReference": merchant_reference or booking.pesapal_merchant_reference,
            "status": "200",
        }

    # ── Poll Status ──────────────────────────────────────────────────

    async def get_payment_status(self, booking_id: int, user: User | None) -> dict:
        """Poll Pesapal for latest payment status and sync to booking."""
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if user and booking.user_id and booking.user_id != user.id and user.role.value != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if not booking.pesapal_order_tracking_id:
            return {
                "payment_status": "NOT_INITIATED",
                "booking_status": booking.status,
                "booking_id": booking.id,
            }

        try:
            status_data = await self.pesapal.get_transaction_status(
                booking.pesapal_order_tracking_id
            )
            payment_status = status_data.get("payment_status_description", "UNKNOWN").upper()
            updates: dict = {"payment_status": payment_status}
            if payment_status == "COMPLETED":
                updates["status"] = BookingStatus.confirmed
            await self.booking_repo.update(booking, updates)
        except Exception as exc:
            logger.error(f"Status poll failed for booking {booking_id}: {exc}")
            payment_status = booking.payment_status or "UNKNOWN"

        return {
            "payment_status": payment_status,
            "booking_status": booking.status,
            "booking_id": booking.id,
            "order_tracking_id": booking.pesapal_order_tracking_id,
            "redirect_url": booking.payment_redirect_url,
        }
