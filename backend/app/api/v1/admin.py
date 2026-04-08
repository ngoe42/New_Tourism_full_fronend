from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
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


@router.post("/send-email", dependencies=[Depends(require_admin)])
async def send_reply_email(
    data: SendEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        await send_email(to=data.to, subject=data.subject, body=data.body)
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

    if data.booking_id:
        from app.repositories.booking import BookingRepository
        repo = BookingRepository(db)
        booking = await repo.get(data.booking_id)
        if booking:
            await repo.update(booking, {"is_replied": True})

    return {"message": "Email sent successfully"}
