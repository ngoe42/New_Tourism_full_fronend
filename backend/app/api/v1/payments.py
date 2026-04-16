from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user_optional
from app.models.user import User
from app.services.payment import PaymentService

router = APIRouter(tags=["Payments"])


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
    orderMerchantReference: str = Query(...),
    orderNotificationType: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Pesapal IPN callback — called by Pesapal servers on payment status change."""
    service = PaymentService(db)
    return await service.handle_ipn(orderTrackingId, orderMerchantReference)


@router.get("/status/{booking_id}")
async def payment_status(
    booking_id: int,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Poll the current Pesapal payment status for a booking."""
    service = PaymentService(db)
    return await service.get_payment_status(booking_id, current_user)
