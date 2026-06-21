from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class PaymentAttempt(Base):
    """Records every Pesapal order created for a booking.

    The Booking row keeps pesapal_order_tracking_id / pesapal_merchant_reference
    pointing at the *latest* attempt so that status polls keep working.
    Historical attempts are preserved here so that:
      - stale IPNs (for superseded orders) can be matched without corrupting
        the booking's current tracking-ID.
      - the full payment history is auditable.
    """

    __tablename__ = "payment_attempts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order_tracking_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, unique=True, index=True
    )
    merchant_reference: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    redirect_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payment_attempts")
