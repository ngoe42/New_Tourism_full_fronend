from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.dependencies.auth import get_current_user_optional, get_current_user
from app.models.user import User
from app.services.payment import PaymentService
from app.services.pesapal import PesapalService

router = APIRouter(tags=["Payments"])


class ResendLinkRequest(BaseModel):
    email: EmailStr
    booking_ref: str


@router.post("/initiate/{booking_id}")
async def initiate_payment(
    booking_id: int,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Initiate a Pesapal payment for an existing booking. Returns redirect_url."""
    service = PaymentService(db)
    return await service.initiate_payment(booking_id, current_user)


@router.get("/ipn")
async def pesapal_ipn(
    orderTrackingId: str = Query(...),
    orderMerchantReference: Optional[str] = Query(None),
    orderNotificationType: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Pesapal IPN callback — called by Pesapal servers on payment status change."""
    service = PaymentService(db)
    return await service.handle_ipn(orderTrackingId, orderMerchantReference)


@router.post("/register-ipn")
async def register_ipn(
    current_user: User = Depends(get_current_user),
):
    """Admin: register the IPN URL with Pesapal and return the ipn_id.
    Copy the returned ipn_id into your PESAPAL_IPN_ID environment variable.
    """
    if current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    if not settings.PESAPAL_CONSUMER_KEY or not settings.PESAPAL_CONSUMER_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Pesapal credentials not configured",
        )
    ipn_url = f"{settings.BACKEND_URL}/api/v1/payments/ipn"
    pesapal = PesapalService()
    ipn_id = await pesapal.register_ipn(ipn_url)
    return {
        "ipn_id": ipn_id,
        "ipn_url": ipn_url,
        "message": "Set PESAPAL_IPN_ID to the ipn_id value in your environment variables.",
    }


@router.get("/status/{booking_id}")
async def payment_status(
    booking_id: int,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Poll the current Pesapal payment status for a booking."""
    service = PaymentService(db)
    return await service.get_payment_status(booking_id, current_user)


@router.get("/link/{booking_id}")
async def get_payment_link(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Return the stored Pesapal redirect URL for a booking (used by the email resume link)."""
    from app.repositories.booking import BookingRepository
    repo = BookingRepository(db)
    booking = await repo.get(booking_id)
    if not booking or not booking.payment_redirect_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment link not found")
    return {
        "booking_id": booking.id,
        "redirect_url": booking.payment_redirect_url,
        "tour_title": booking.tour.title if booking.tour else "",
        "total_price": booking.total_price,
        "payment_status": booking.payment_status,
    }


@router.post("/resend-link")
async def resend_payment_link(
    data: ResendLinkRequest,
    db: AsyncSession = Depends(get_db),
):
    """Guest recovery: resend payment link to email for a given booking reference.
    Accepts booking_ref as either 'NTS-{id}-XXXX' format or plain booking ID.
    Always returns 200 to avoid leaking booking existence.
    """
    service = PaymentService(db)
    await service.resend_payment_link(data.email, data.booking_ref)
    return {"message": "If a matching booking was found, the payment link has been sent to your email."}
