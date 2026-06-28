from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.limiter import limiter
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


@router.post("/send-email", dependencies=[Depends(require_admin)])
@limiter.limit("20/hour")
async def send_reply_email(
    request: Request,
    data: SendEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    # Mark booking as replied when booking_id is supplied
    if data.booking_id:
        from app.models.booking import Booking as BookingModel
        result = await db.execute(
            select(BookingModel).where(BookingModel.id == data.booking_id)
        )
        booking = result.scalar_one_or_none()
        if booking:
            for key, value in {"is_replied": True}.items():
                if hasattr(booking, key):
                    setattr(booking, key, value)
            await db.flush()

    try:
        await send_email(
            to=data.to,
            subject=data.subject,
            body=data.body,
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
