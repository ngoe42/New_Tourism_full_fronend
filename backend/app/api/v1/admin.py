from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.schemas.dashboard import DashboardStats
from app.schemas.inquiry import InquiryUpdate
from app.services.dashboard import DashboardService
from app.services.email_service import send_email
from app.services.inquiry import InquiryService

router = APIRouter(tags=["Admin Dashboard"])


@router.get("/dashboard", response_model=DashboardStats, dependencies=[Depends(require_admin)])
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    service = DashboardService(db)
    return await service.get_stats()


class SendEmailRequest(BaseModel):
    to: EmailStr
    subject: str
    body: str
    inquiry_id: Optional[int] = None
    booking_id: Optional[int] = None
    # Optional payment details — auto-filled from booking when booking_id is set
    item_name: Optional[str] = None
    price: Optional[float] = None
    payment_link: Optional[str] = None


@router.post("/send-email", dependencies=[Depends(require_admin)])
async def send_reply_email(
    data: SendEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    item_name = data.item_name
    price = data.price
    payment_link = data.payment_link

    # Auto-enrich from booking record when booking_id is supplied
    include_terms = False

    if data.booking_id:
        from sqlalchemy.orm import selectinload
        from app.models.booking import Booking as BookingModel
        from app.core.config import settings as _s
        result = await db.execute(
            select(BookingModel)
            .options(selectinload(BookingModel.tour))
            .where(BookingModel.id == data.booking_id)
        )
        booking = result.scalar_one_or_none()
        if booking:
            if price is None and booking.total_price:
                price = float(booking.total_price)
            if item_name is None and booking.tour:
                item_name = f"{booking.tour.title} · {booking.guests} guest{'s' if booking.guests != 1 else ''}"
            if payment_link is None:
                # Use stored Pesapal redirect URL first; fall back to contact page
                payment_link = (
                    booking.payment_redirect_url
                    or f"{_s.FRONTEND_URL}/contact"
                )
            include_terms = True
            for key, value in {"is_replied": True}.items():
                if hasattr(booking, key):
                    setattr(booking, key, value)
            await db.flush()

    try:
        await send_email(
            to=data.to,
            subject=data.subject,
            body=data.body,
            item_name=item_name,
            price=price,
            payment_link=payment_link,
            btn_label="Complete Payment",
            include_terms=include_terms,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send email: {str(e)}",
        )

    if data.inquiry_id:
        svc = InquiryService(db)
        await svc.update(data.inquiry_id, InquiryUpdate(is_replied=True, is_read=True))

    return {"message": "Email sent successfully"}
