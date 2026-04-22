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
from app.services.booking import send_booking_confirmation_email
from app.services.email_service import send_payment_success_email
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

        # Check whether a confirmation email was already sent during create_booking.
        # If not (Pesapal failed then), send it now with the payment link.
        email_already_sent = booking.payment_redirect_url is not None

        await self.booking_repo.update(booking, {
            "pesapal_order_tracking_id": result["order_tracking_id"],
            "pesapal_merchant_reference": merchant_reference,
            "payment_status": "PENDING",
            "payment_redirect_url": result["redirect_url"],
        })

        if not email_already_sent:
            tour = booking.tour
            await send_booking_confirmation_email(
                booking=booking,
                tour_title=tour.title if tour else f"Booking #{booking.id}",
                contact_name=booking.contact_name,
                contact_email=booking.contact_email,
                travel_date=booking.travel_date,
                guests=booking.guests,
                total_price=booking.total_price,
                payment_link=result["redirect_url"],
                tour_location=tour.location if tour else "",
                tour_duration=tour.duration if tour else "",
                tour_included=tour.included if tour else [],
            )

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
        already_confirmed = booking.status == BookingStatus.confirmed

        if payment_status == "COMPLETED":
            updates["status"] = BookingStatus.confirmed
            logger.info(f"Booking #{booking.id} confirmed via Pesapal IPN")
        elif payment_status in ("FAILED", "INVALID", "REVERSED"):
            logger.warning(f"Booking #{booking.id} payment {payment_status}")

        await self.booking_repo.update(booking, updates)

        if payment_status == "COMPLETED" and not already_confirmed:
            tour = booking.tour
            try:
                await send_payment_success_email(
                    booking_id=booking.id,
                    tour_title=tour.title if tour else f"Booking #{booking.id}",
                    contact_name=booking.contact_name,
                    contact_email=booking.contact_email,
                    travel_date=booking.travel_date,
                    guests=booking.guests,
                    total_price=booking.total_price,
                    transaction_id=order_tracking_id,
                )
            except Exception as exc:
                logger.error(f"Payment success email failed for booking #{booking.id}: {exc}")

        return {
            "orderNotificationType": "IPNCHANGE",
            "orderTrackingId": order_tracking_id,
            "orderMerchantReference": merchant_reference or booking.pesapal_merchant_reference,
            "status": "200",
        }

    # ── Resend Payment Link ───────────────────────────────────────────

    async def resend_payment_link(self, email: str, booking_ref: str) -> None:
        """Find a booking by email + ref, generate a fresh payment link if needed, and email it."""
        import re
        booking = None

        # Try NTS-{id}-XXXX format first
        match = re.match(r"^NTS-(\d+)-", booking_ref.strip().upper())
        if match:
            booking = await self.booking_repo.get(int(match.group(1)))
        else:
            # Try plain numeric ID
            if booking_ref.strip().isdigit():
                booking = await self.booking_repo.get(int(booking_ref.strip()))

        # Security: silently ignore if not found or email doesn't match
        if not booking or booking.contact_email.lower() != email.lower():
            logger.warning(f"resend-link: no match for email={email} ref={booking_ref}")
            return

        if booking.payment_status == "COMPLETED":
            logger.info(f"resend-link: booking #{booking.id} already paid — skipping")
            return

        tour = booking.tour
        tour_title = tour.title if tour else f"Booking #{booking.id}"

        # Reuse stored link if still valid, otherwise generate a fresh one
        payment_link = booking.payment_redirect_url
        if not payment_link:
            try:
                ipn_id = await self._get_or_register_ipn_id()
                merchant_ref = f"NTS-{booking.id}-{uuid.uuid4().hex[:8].upper()}"
                name_parts = booking.contact_name.split(" ", 1)
                result = await self.pesapal.submit_order(
                    merchant_reference=merchant_ref,
                    amount=booking.total_price,
                    currency="USD",
                    description=f"Safari booking #{booking.id} — {tour_title}",
                    callback_url=f"{settings.FRONTEND_URL}/payment/callback",
                    ipn_id=ipn_id,
                    email=booking.contact_email,
                    phone=booking.contact_phone,
                    first_name=name_parts[0],
                    last_name=name_parts[1] if len(name_parts) > 1 else ".",
                )
                payment_link = result["redirect_url"]
                await self.booking_repo.update(booking, {
                    "pesapal_order_tracking_id": result["order_tracking_id"],
                    "pesapal_merchant_reference": merchant_ref,
                    "payment_status": "PENDING",
                    "payment_redirect_url": payment_link,
                })
            except Exception as exc:
                logger.error(f"resend-link: Pesapal order failed for booking #{booking.id}: {exc}")
                return

        from app.services.email_service import send_email
        first = booking.contact_name.split()[0]
        body = (
            f"Dear {first},\n\n"
            f"Here is your payment link for booking #{booking.id} — {tour_title}.\n\n"
            f"Click the button below to complete your secure payment. "
            f"If the link has expired, please contact us and we will send you a new one.\n\n"
            f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
        )
        await send_email(
            to=booking.contact_email,
            subject=f"Your Payment Link — {tour_title} | Nelson Tours & Safari",
            body=body,
            item_name=f"{tour_title} · {booking.guests} {'Guest' if booking.guests == 1 else 'Guests'}",
            price=booking.total_price,
            payment_link=payment_link,
            btn_label="Complete Payment",
        )
        logger.info(f"resend-link: payment link resent for booking #{booking.id} to {email}")

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
            already_confirmed = booking.status == BookingStatus.confirmed
            if payment_status == "COMPLETED":
                updates["status"] = BookingStatus.confirmed
            await self.booking_repo.update(booking, updates)
            if payment_status == "COMPLETED" and not already_confirmed:
                tour = booking.tour
                try:
                    await send_payment_success_email(
                        booking_id=booking.id,
                        tour_title=tour.title if tour else f"Booking #{booking.id}",
                        contact_name=booking.contact_name,
                        contact_email=booking.contact_email,
                        travel_date=booking.travel_date,
                        guests=booking.guests,
                        total_price=booking.total_price,
                        transaction_id=booking.pesapal_order_tracking_id,
                    )
                except Exception as exc:
                    logger.error(f"Payment success email failed for booking #{booking.id}: {exc}")
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
