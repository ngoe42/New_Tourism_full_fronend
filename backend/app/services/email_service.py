from typing import Optional

import resend
from loguru import logger

from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


def _cancellation_policy_block() -> str:
    """Returns an HTML Cancellation Policy section (non-payment terms)."""
    return """
    <div style="margin:20px 32px 0; border:1px solid #e8e0d0; border-radius:10px; overflow:hidden;">
      <div style="background:#f5f0e8; padding:12px 20px; border-bottom:1px solid #e8e0d0;">
        <p style="margin:0; color:#0f3d2e; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">
          Cancellation Policy
        </p>
      </div>
      <div style="padding:16px 20px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0; color:#555; font-size:13px;">60+ days before travel</td>
            <td style="padding:4px 0; color:#333; font-size:13px; text-align:right;">Deposit non-refundable; balance fully refunded</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#555; font-size:13px;">30\u201359 days before travel</td>
            <td style="padding:4px 0; color:#333; font-size:13px; text-align:right;">50% of total amount refunded</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#555; font-size:13px;">Under 30 days</td>
            <td style="padding:4px 0; color:#333; font-size:13px; text-align:right;">No refund</td>
          </tr>
        </table>
      </div>
    </div>
    """


def _build_html(
    body: str,
) -> str:
    cancellation_section = _cancellation_policy_block()
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #222; background: #faf8f3; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <div style="background: #0f3d2e; padding: 24px 32px; text-align: center;">
            <img src="{settings.FRONTEND_URL}/images/logo/logo.png" alt="Nelson Tours &amp; Safari" style="height: 80px; width: auto; object-fit: contain; display: inline-block;" />
          </div>
          <div style="padding: 32px; white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #333;">
            {body.replace(chr(10), '<br>')}
          </div>
          {cancellation_section}
          <div style="background: #f5f5f0; padding: 20px 32px; margin-top: 24px; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            Nelson Tours &amp; Safari · Sokoine Road, Arusha, Tanzania · +255 750 005 973
          </div>
        </div>
      </body>
    </html>
    """


async def send_email(
    to: str,
    subject: str,
    body: str,
) -> bool:
    """Send email via Resend. Returns True on success, False if not configured or on error."""
    if not settings.RESEND_API_KEY:
        logger.warning("Email not sent: RESEND_API_KEY is not configured.")
        return False

    logger.info(f"[email] Sending '{subject}' to {to}")

    html = _build_html(body)

    plain = body

    try:
        response = await resend.Emails.send_async({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
            "text": plain,
        })

        email_id = response.get("id", "unknown")
        logger.info(f"[email] ✓ Sent '{subject}' to {to} — Resend EmailId={email_id}")
        return True
    except resend.exceptions.ResendError as e:
        logger.error(f"[email] ✗ Resend FAILED sending to {to}: {e}")
        return False
    except Exception as e:
        logger.error(f"[email] ✗ Unexpected error sending to {to}: {type(e).__name__}: {e}")
        return False


async def send_inquiry_confirmation_email(
    name: str,
    email: str,
    tour_interest: Optional[str],
    message: Optional[str],
) -> None:
    """Generic inquiry confirmation (contact form / no route selected)."""
    first = name.split()[0]
    subject_line = tour_interest or "Your Safari Inquiry"

    customer_body = (
        f"Dear {first},\n\n"
        f"Thank you for reaching out to Nelson Tours & Safari!\n\n"
        f"We have received your inquiry"
        + (f" about {tour_interest}" if tour_interest else "")
        + f" and our safari specialists will contact you within 24 hours to craft your perfect journey.\n\n"
        f"Your Inquiry Details\n"
        f"--------------------\n"
        f"Name    : {name}\n"
        f"Email   : {email}\n"
        + (f"Interest: {tour_interest}\n" if tour_interest else "")
        + (f"Message : {message}\n" if message else "")
        + f"\nWarm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
    )
    await send_email(
        to=email,
        subject=f"We received your inquiry — {subject_line} | Nelson Tours & Safari",
        body=customer_body,
    )

    admin_body = (
        f"New Inquiry Received\n"
        f"====================\n"
        f"Name    : {name}\n"
        f"Email   : {email}\n"
        + (f"Interest: {tour_interest}\n" if tour_interest else "")
        + (f"Message :\n{message}\n" if message else "")
        + f"\nReply directly to {email} or log in to the admin panel."
    )
    await send_email(
        to=settings.EMAIL_FROM,
        subject=f"[New Inquiry] {name} — {subject_line}",
        body=admin_body,
    )


async def send_route_booking_email(
    name: str,
    email: str,
    phone: Optional[str],
    route_name: str,
    route_nickname: Optional[str],
    route_duration: str,
    route_difficulty: Optional[str],
    route_max_altitude: Optional[str],
    route_price: float,
    route_included: Optional[list],
    route_best_season: Optional[str],
    travel_date,
    guests: int,
    special_requests: Optional[str],
) -> None:
    """Rich route/Kilimanjaro booking confirmation sent on form submit."""
    first = name.split()[0]
    full_name = route_nickname or route_name
    price_per_person = route_price
    total = price_per_person * guests

    date_str = travel_date.strftime("%B %d, %Y") if travel_date else "To be confirmed"

    included_lines = ""
    if route_included:
        included_lines = "\nWhat's Included\n" + "-" * 30 + "\n"
        included_lines += "\n".join(f"✓  {item}" for item in route_included[:8])
        if len(route_included) > 8:
            included_lines += f"\n   ... and {len(route_included) - 8} more items"
        included_lines += "\n"

    season_line = f"Best Season      : {route_best_season}\n" if route_best_season else ""
    altitude_line = f"Max Altitude     : {route_max_altitude}\n" if route_max_altitude else ""
    difficulty_line = f"Difficulty       : {route_difficulty}\n" if route_difficulty else ""
    phone_line = f"Phone            : {phone}\n" if phone else ""
    requests_line = f"\nSpecial Requests : {special_requests}\n" if special_requests else ""

    body = (
        f"Dear {first},\n\n"
        f"Thank you for your Kilimanjaro booking inquiry!\n\n"
        f"We have received your request for the {full_name} and our team will contact you "
        f"within 24 hours to confirm availability and finalize your booking with a secure payment link.\n\n"
        f"Your Booking Summary\n"
        f"{'=' * 40}\n"
        f"Route            : {route_name}\n"
        f"Duration         : {route_duration}\n"
        + difficulty_line
        + altitude_line
        + season_line
        + f"Travel Date      : {date_str}\n"
        f"Number of Guests : {guests} {'Guest' if guests == 1 else 'Guests'}\n"
        f"Price Per Person : USD {price_per_person:,.2f}\n"
        f"{'=' * 40}\n"
        + included_lines
        + f"\nYour Contact Details\n"
        f"--------------------\n"
        f"Name             : {name}\n"
        f"Email            : {email}\n"
        + phone_line
        + requests_line
        + f"\nOur safari specialists will reach out to you shortly with:\n"
        f"  • Availability confirmation for your selected dates\n"
        f"  • A full itinerary and packing list\n"
        f"  • A secure payment link to lock in your spot\n\n"
        f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
    )

    await send_email(
        to=email,
        subject=f"Kilimanjaro Booking Request — {route_name} | Nelson Tours & Safari",
        body=body,
    )

    admin_body = (
        f"New Kilimanjaro Booking Request\n"
        f"{'=' * 40}\n"
        f"Route       : {route_name}\n"
        f"Duration    : {route_duration}\n"
        f"Travel Date : {date_str}\n"
        f"Guests      : {guests}\n"
        f"Total Est.  : USD {total:,.2f}\n\n"
        f"Customer\n"
        f"--------\n"
        f"Name  : {name}\n"
        f"Email : {email}\n"
        + (f"Phone : {phone}\n" if phone else "")
        + (f"Notes : {special_requests}\n" if special_requests else "")
        + f"\nReply to {email} or view in the admin panel → Inquiries."
    )
    await send_email(
        to=settings.EMAIL_FROM,
        subject=f"[Kilimanjaro Booking] {name} — {route_name}",
        body=admin_body,
    )


async def send_booking_admin_notification(
    booking_id: int,
    tour_title: str,
    contact_name: str,
    contact_email: str,
    contact_phone: Optional[str],
    travel_date,
    guests: int,
    total_price: float,
) -> None:
    """Notify the admin that a new booking has been created."""
    body = (
        f"New Booking Received\n"
        f"====================\n"
        f"Booking Ref : #{booking_id}\n"
        f"Tour        : {tour_title}\n"
        f"Travel Date : {travel_date.strftime('%B %d, %Y')}\n"
        f"Guests      : {guests}\n"
        f"Total Price : USD {total_price:,.2f}\n\n"
        f"Customer Details\n"
        f"----------------\n"
        f"Name  : {contact_name}\n"
        f"Email : {contact_email}\n"
        + (f"Phone : {contact_phone}\n" if contact_phone else "")
        + f"\nLog in to the admin panel to review and confirm this booking."
    )
    await send_email(
        to=settings.EMAIL_FROM,
        subject=f"[New Booking #{booking_id}] {contact_name} — {tour_title}",
        body=body,
    )


async def send_payment_success_email(
    booking_id: int,
    tour_title: str,
    contact_name: str,
    contact_email: str,
    travel_date,
    guests: int,
    total_price: float,
    transaction_id: Optional[str] = None,
) -> None:
    """Send payment confirmation email to customer and admin after successful Pesapal payment."""
    first = contact_name.split()[0]
    date_str = travel_date.strftime("%B %d, %Y") if travel_date else "To be confirmed"
    transaction_line = f"Transaction ID   : {transaction_id}\n" if transaction_id else ""

    customer_body = (
        f"Dear {first},\n\n"
        f"Great news! Your payment has been received and confirmed.\n\n"
        f"Your safari booking is now fully confirmed and our team is preparing everything for your adventure.\n\n"
        f"Payment Confirmation\n"
        f"{'=' * 40}\n"
        f"Booking Ref      : #{booking_id}\n"
        f"Tour             : {tour_title}\n"
        f"Travel Date      : {date_str}\n"
        f"Guests           : {guests} {'Guest' if guests == 1 else 'Guests'}\n"
        f"Amount Paid      : USD {total_price:,.2f}\n"
        f"Payment Status   : CONFIRMED ✓\n"
        + transaction_line
        + f"{'=' * 40}\n\n"
        f"What Happens Next\n"
        f"-----------------\n"
        f"✓  You will receive a detailed itinerary within 24 hours\n"
        f"✓  Our team will contact you to discuss logistics and packing\n"
        f"✓  A welcome package with all travel details will be sent closer to your departure\n\n"
        f"If you have any questions, feel free to reply to this email or call us at +255 750 005 973.\n\n"
        f"We look forward to welcoming you!\n\n"
        f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
    )

    await send_email(
        to=contact_email,
        subject=f"Payment Confirmed — {tour_title} | Nelson Tours & Safari",
        body=customer_body,
    )

    admin_body = (
        f"Payment Received\n"
        f"================\n"
        f"Booking Ref  : #{booking_id}\n"
        f"Tour         : {tour_title}\n"
        f"Travel Date  : {date_str}\n"
        f"Guests       : {guests}\n"
        f"Amount       : USD {total_price:,.2f}\n"
        + transaction_line
        + f"\nCustomer\n"
        f"--------\n"
        f"Name  : {contact_name}\n"
        f"Email : {contact_email}\n\n"
        f"Booking status has been automatically set to CONFIRMED."
    )
    await send_email(
        to=settings.EMAIL_FROM,
        subject=f"[Payment Received #{booking_id}] {contact_name} — {tour_title}",
        body=admin_body,
    )
