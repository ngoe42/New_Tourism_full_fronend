import asyncio
from typing import Optional, Union

import resend
from loguru import logger

from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

_RESEND_TIMEOUT = 15.0


async def _send_email_with_retry(email_params: dict, max_attempts: int = 3) -> dict:
    """Call resend.Emails.send_async with timeout and retry on transient errors."""
    last_exc = None
    for attempt in range(1, max_attempts + 1):
        try:
            response = await asyncio.wait_for(
                resend.Emails.send_async(email_params),
                timeout=_RESEND_TIMEOUT,
            )
            return response
        except (asyncio.TimeoutError, resend.exceptions.ResendError) as exc:
            last_exc = exc
            if attempt < max_attempts:
                wait = 0.5 * (2 ** (attempt - 1))
                logger.warning(
                    f"Resend attempt {attempt}/{max_attempts} failed ({type(exc).__name__})"
                    f" — retrying in {wait:.1f}s"
                )
                await asyncio.sleep(wait)
                continue
        except Exception as exc:
            last_exc = exc
            if attempt < max_attempts:
                wait = 0.5 * (2 ** (attempt - 1))
                logger.warning(
                    f"Resend attempt {attempt}/{max_attempts} failed ({type(exc).__name__})"
                    f" — retrying in {wait:.1f}s"
                )
                await asyncio.sleep(wait)
                continue
    raise last_exc  # type: ignore[misc]


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


def _payment_block(
    item_name: Optional[str],
    price: Optional[float],
    payment_link: Optional[str],
    btn_label: str = "Proceed to Payment",
) -> str:
    """Returns an HTML payment-details section with payment button."""
    if not price and not payment_link:
        return ""

    price_html = (
        f'<tr>'
        f'<td style="padding:8px 0; color:#555; font-size:14px;">Total Price</td>'
        f'<td style="padding:8px 0; color:#0f3d2e; font-size:18px; font-weight:700; text-align:right;">'
        f'USD&nbsp;{price:,.2f}'
        f'</td></tr>'
    ) if price else ""

    item_html = (
        f'<tr>'
        f'<td style="padding:8px 0; color:#555; font-size:14px;">Package</td>'
        f'<td style="padding:8px 0; color:#222; font-size:14px; font-weight:600; text-align:right;">{item_name}</td>'
        f'</tr>'
    ) if item_name else ""

    btn_html = (
        f'<div style="margin-top:24px;">'
        f'<a href="{payment_link}" '
        f'style="display:block; width:100%; box-sizing:border-box; background:#c9a96e; color:#fff !important; '
        f'font-size:16px; font-weight:800; padding:18px 24px; border-radius:10px; '
        f'text-decoration:none; letter-spacing:1px; text-align:center; text-transform:uppercase;">'
        f'{btn_label} &rarr;'
        f'</a>'
        f'<p style="margin:10px 0 0; text-align:center; font-size:11px; color:#aaa;">'
        f'Or copy this link: <a href="{payment_link}" style="color:#c9a96e; word-break:break-all;">{payment_link}</a>'
        f'</p>'
        f'</div>'
    ) if payment_link else ""

    return f"""
    <div style="margin:24px 32px 0; border:2px solid #c9a96e; border-radius:10px; overflow:hidden;">
      <div style="background:#0f3d2e; padding:14px 20px; display:flex; align-items:center; gap:8px;">
        <p style="margin:0; color:#c9a96e; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">
          &#128274;&nbsp; Secure Payment Details
        </p>
      </div>
      <div style="padding:20px 20px 24px;">
        <table style="width:100%; border-collapse:collapse; margin-bottom:4px;">
          {item_html}
          {price_html}
        </table>
        {btn_html}
      </div>
    </div>
    """


def _payment_terms_block() -> str:
    """Returns an HTML Payment Terms & Conditions section."""
    return """
    <div style="margin:20px 32px 0; border:1px solid #e8e0d0; border-radius:10px; overflow:hidden;">
      <div style="background:#f5f0e8; padding:12px 20px; border-bottom:1px solid #e8e0d0;">
        <p style="margin:0; color:#0f3d2e; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">
          Payment Terms &amp; Conditions
        </p>
      </div>
      <div style="padding:16px 20px;">

        <p style="margin:0 0 6px; color:#0f3d2e; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
          Deposit &amp; Balance Schedule
        </p>
        <table style="width:100%; border-collapse:collapse; margin-bottom:14px;">
          <tr>
            <td style="padding:4px 0; color:#555; font-size:13px;">&#10003;&nbsp; Deposit (30%)</td>
            <td style="padding:4px 0; color:#333; font-size:13px; text-align:right;">Required to confirm your reservation</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#555; font-size:13px;">&#10003;&nbsp; Balance (70%)</td>
            <td style="padding:4px 0; color:#333; font-size:13px; text-align:right;">Due 60 days before travel date</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#555; font-size:13px;">&#10003;&nbsp; Late bookings</td>
            <td style="padding:4px 0; color:#333; font-size:13px; text-align:right;">Full payment required if booking within 60 days</td>
          </tr>
        </table>

        <p style="margin:0 0 6px; color:#0f3d2e; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
          Accepted Payment Methods
        </p>
        <p style="margin:0 0 14px; color:#555; font-size:13px; line-height:1.6;">
          Visa &nbsp;&#183;&nbsp; Mastercard &nbsp;&#183;&nbsp; M-Pesa &nbsp;&#183;&nbsp; Airtel Money
          <br>All transactions are processed securely via <strong>Pesapal</strong> in USD.
        </p>

        <p style="margin:0 0 6px; color:#0f3d2e; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
          Cancellation Policy
        </p>
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
    *,
    include_cancellation: bool = True,
) -> str:
    cancellation_section = _cancellation_policy_block() if include_cancellation else ""
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


def _build_payment_html(
    body: str,
    *,
    item_name: Optional[str] = None,
    price: Optional[float] = None,
    payment_link: Optional[str] = None,
    btn_label: str = "Proceed to Payment",
) -> str:
    """Build full HTML email with payment block and payment terms."""
    payment_section = _payment_block(item_name, price, payment_link, btn_label)
    terms_section = _payment_terms_block()
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
          {payment_section}
          {terms_section}
          <div style="background: #f5f5f0; padding: 20px 32px; margin-top: 24px; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            Nelson Tours &amp; Safari · Sokoine Road, Arusha, Tanzania · +255 750 005 973
          </div>
        </div>
      </body>
    </html>
    """


async def send_email(
    to: Union[str, list[str]],
    subject: str,
    body: str,
    bcc: Optional[list[str]] = None,
    *,
    include_cancellation: bool = True,
) -> bool:
    """Send email via Resend. Returns True on success, False if not configured or on error."""
    if not settings.RESEND_API_KEY:
        logger.warning("Email not sent: RESEND_API_KEY is not configured.")
        return False

    recipients = [to] if isinstance(to, str) else to
    logger.info(f"[email] Sending '{subject}' to {recipients}")

    html = _build_html(body, include_cancellation=include_cancellation)

    plain = body

    email_params = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": recipients,
        "subject": subject,
        "html": html,
        "text": plain,
    }
    if bcc:
        email_params["bcc"] = bcc

    try:
        response = await _send_email_with_retry(email_params)

        email_id = response.get("id", "unknown")
        logger.info(f"[email] ✓ Sent '{subject}' to {recipients} — Resend EmailId={email_id}")
        return True
    except resend.exceptions.ResendError as e:
        logger.error(f"[email] ✗ Resend FAILED sending to {recipients}: {e}")
        return False
    except Exception as e:
        logger.error(f"[email] ✗ Unexpected error sending to {recipients}: {type(e).__name__}: {e}")
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
    admin_recipients = [e.strip() for e in settings.ADMIN_NOTIFICATION_EMAILS.split(",") if e.strip()]
    await send_email(
        to=admin_recipients,
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
    admin_recipients = [e.strip() for e in settings.ADMIN_NOTIFICATION_EMAILS.split(",") if e.strip()]
    await send_email(
        to=admin_recipients,
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
        + f"\nLog in to the admin panel to review and confirm this booking:\n"
        f"{settings.FRONTEND_URL}/login\n"
    )
    admin_recipients = [e.strip() for e in settings.ADMIN_NOTIFICATION_EMAILS.split(",") if e.strip()]
    await send_email(
        to=admin_recipients,
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
    admin_recipients = [e.strip() for e in settings.ADMIN_NOTIFICATION_EMAILS.split(",") if e.strip()]
    await send_email(
        to=admin_recipients,
        subject=f"[Payment Received #{booking_id}] {contact_name} — {tour_title}",
        body=admin_body,
    )


async def send_payment_booking_confirmation_email(
    booking_id: int,
    tour_title: str,
    contact_name: str,
    contact_email: str,
    travel_date,
    guests: int,
    total_price: float,
    payment_link: str | None,
    tour_location: str = "",
    tour_duration: str = "",
    tour_included: list | None = None,
) -> None:
    """Send booking confirmation email WITH payment details, terms, and payment button.
    
    This is the recovered old template — includes payment details, payment terms,
    cancellation policy, and a 'Proceed to Payment' button.
    Used when admin has enabled the 'send_payment_email' setting.
    Recovered from commit 738fdf1 (parent).
    """
    logger.info(f"[email] Preparing PAYMENT booking confirmation for #{booking_id} → {contact_email}")
    try:
        name = contact_name.split()[0]

        email_payment_link = payment_link or f"{settings.FRONTEND_URL}/contact"
        has_pesapal = payment_link is not None

        if has_pesapal:
            payment_instruction = (
                "Please complete your deposit payment using the button below "
                "to secure your reservation."
            )
        else:
            payment_instruction = (
                "To complete your payment and secure this reservation, "
                "please contact our team — we will send you a secure payment link within the hour."
            )

        location_line = f"Location          : {tour_location}\n" if tour_location else ""
        duration_line = f"Duration          : {tour_duration}\n" if tour_duration else ""

        included_block = ""
        if tour_included:
            included_block = "\nWhat's Included\n" + "-" * 30 + "\n"
            included_block += "\n".join(f"✓  {item}" for item in tour_included[:8])
            if len(tour_included) > 8:
                included_block += f"\n   ... and {len(tour_included) - 8} more items"
            included_block += "\n"

        booking_link = f"{settings.FRONTEND_URL}/booking/{booking_id}"
        body = (
            f"Dear {name},\n\n"
            f"Thank you for choosing Nelson Tours & Safari!\n\n"
            f"Your booking request has been received. {payment_instruction}\n\n"
            f"Booking Summary\n"
            f"{'=' * 40}\n"
            f"Booking Reference : #{booking_id}\n"
            f"Tour              : {tour_title}\n"
            + location_line
            + duration_line
            + f"Travel Date       : {travel_date.strftime('%B %d, %Y')}\n"
            f"Number of Guests  : {guests} {'Guest' if guests == 1 else 'Guests'}\n"
            f"{'=' * 40}\n"
            + included_block
            + f"\nView your booking online: {booking_link}\n\n"
            f"Our team will be in touch within 24 hours to assist with any questions.\n\n"
            f"We look forward to crafting an unforgettable safari experience for you.\n\n"
            f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
        )

        if not settings.RESEND_API_KEY:
            logger.warning("Payment email not sent: RESEND_API_KEY is not configured.")
            return

        plain = body
        if total_price:
            plain += f"\n\n--- Payment Details ---\n"
            plain += f"Package : {tour_title} · {guests} {'Guest' if guests == 1 else 'Guests'}\n"
            plain += f"Total   : USD {total_price:,.2f}\n"
        if email_payment_link:
            plain += f"Pay Now : {email_payment_link}\n"
        plain += (
            "\n\n--- Payment Terms ---\n"
            "Deposit (30%)  : Required to confirm your reservation\n"
            "Balance (70%)  : Due 60 days before travel date\n"
            "Late bookings  : Full payment required if booking within 60 days\n"
            "Methods        : Visa · Mastercard · M-Pesa · Airtel Money (via Pesapal, in USD)\n"
            "\nCancellation Policy:\n"
            "  60+ days  → Deposit non-refundable; balance fully refunded\n"
            "  30–59 days → 50% of total amount refunded\n"
            "  Under 30  → No refund\n"
        )

        html = _build_payment_html(
            body,
            item_name=f"{tour_title} · {guests} {'Guest' if guests == 1 else 'Guests'}",
            price=total_price,
            payment_link=email_payment_link,
            btn_label="Proceed to Payment" if has_pesapal else "Contact Us to Pay",
        )

        bcc_list = [e.strip() for e in settings.BCC_EMAILS.split(",") if e.strip()]
        email_params = {
            "from": settings.RESEND_FROM_EMAIL,
            "to": [contact_email],
            "subject": f"Booking Confirmed — {tour_title} | Nelson Tours & Safari",
            "html": html,
            "text": plain,
        }
        if bcc_list:
            email_params["bcc"] = bcc_list
        response = await _send_email_with_retry(email_params)

        email_id = response.get("id", "unknown")
        logger.info(f"[email] ✓ Payment booking confirmation sent #{booking_id} to {contact_email} — Resend EmailId={email_id}")
    except Exception as exc:
        logger.error(f"[email] Payment booking confirmation FAILED for #{booking_id}: {type(exc).__name__}: {exc}")
