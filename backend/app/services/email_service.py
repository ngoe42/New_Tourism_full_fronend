from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from loguru import logger

from app.core.config import settings


def _payment_block(
    item_name: Optional[str],
    price: Optional[float],
    payment_link: Optional[str],
    btn_label: str = "Complete Payment",
) -> str:
    """Returns an HTML payment-details section, or empty string if nothing to show."""
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
            <td style="padding:4px 0; color:#555; font-size:13px;">30–59 days before travel</td>
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
    item_name: Optional[str] = None,
    price: Optional[float] = None,
    payment_link: Optional[str] = None,
    btn_label: str = "Complete Payment",
    include_terms: bool = False,
) -> str:
    payment_section = _payment_block(item_name, price, payment_link, btn_label)
    terms_section = _payment_terms_block() if include_terms else ""
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #222; background: #faf8f3; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <div style="background: #0f3d2e; padding: 28px 32px;">
            <p style="color: #c9a96e; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 4px;">Nelson Tours &amp; Safari</p>
            <h1 style="color: #fff; font-size: 20px; margin: 0;">Message from our team</h1>
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
    to: str,
    subject: str,
    body: str,
    *,
    item_name: Optional[str] = None,
    price: Optional[float] = None,
    payment_link: Optional[str] = None,
    btn_label: str = "Complete Payment",
    include_terms: bool = False,
) -> bool:
    """Send email via SendGrid. Returns True on success, False if not configured or on error."""
    if not settings.SENDGRID_API_KEY:
        logger.warning("Email not sent: SENDGRID_API_KEY is not configured.")
        return False

    logger.info(f"Sending email to {to} via SendGrid")

    from sendgrid.helpers.mail import ReplyTo
    import asyncio

    html = _build_html(body, item_name=item_name, price=price, payment_link=payment_link, btn_label=btn_label, include_terms=include_terms)

    plain = body
    if price:
        plain += f"\n\n--- Payment Details ---\n"
        if item_name:
            plain += f"Package : {item_name}\n"
        plain += f"Total   : USD {price:,.2f}\n"
    if payment_link:
        plain += f"Pay Now : {payment_link}\n"
    if include_terms:
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

    message = Mail(
        from_email=(settings.EMAIL_FROM, "Nelson Tours & Safari"),
        to_emails=to,
        subject=subject,
        html_content=html,
        plain_text_content=plain,
    )
    message.reply_to = ReplyTo(settings.EMAIL_FROM, "Nelson Tours & Safari")

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        # sg.send() is synchronous — run in a thread pool to avoid blocking the event loop
        response = await asyncio.to_thread(sg.send, message)
        logger.info(f"Email sent to {to} — status: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"SendGrid error sending to {to}: {e}")
        return False


async def send_inquiry_confirmation_email(
    name: str,
    email: str,
    tour_interest: Optional[str],
    message: Optional[str],
) -> None:
    """Send confirmation to customer + notification to admin when an inquiry is submitted."""
    first = name.split()[0]
    subject_line = tour_interest or "Your Safari Inquiry"

    # ── Customer confirmation ────────────────────────────────────────────────
    customer_body = (
        f"Dear {first},\n\n"
        f"Thank you for reaching out to Nelson Tours & Safari!\n\n"
        f"We have received your inquiry"
        + (f" about {tour_interest}" if tour_interest else "")
        + f" and our safari specialists will contact you within 24 hours to craft your perfect journey.\n\n"
        f"Your Inquiry Summary\n"
        f"--------------------\n"
        f"Name    : {name}\n"
        f"Email   : {email}\n"
        + (f"Interest: {tour_interest}\n" if tour_interest else "")
        + (f"Message : {message}\n" if message else "")
        + f"\nIn the meantime, feel free to explore our tours and Kilimanjaro routes on our website.\n\n"
        f"Warm regards,\nNelson Tours & Safari Team\n+255 750 005 973"
    )
    await send_email(
        to=email,
        subject=f"We received your inquiry — {subject_line} | Nelson Tours & Safari",
        body=customer_body,
    )

    # ── Admin notification ───────────────────────────────────────────────────
    admin_body = (
        f"New Inquiry Received\n"
        f"====================\n"
        f"Name    : {name}\n"
        f"Email   : {email}\n"
        + (f"Interest: {tour_interest}\n" if tour_interest else "")
        + (f"Message :\n{message}\n" if message else "")
        + f"\nReply directly to {email} or log in to the admin panel to manage this inquiry."
    )
    await send_email(
        to=settings.EMAIL_FROM,
        subject=f"[New Inquiry] {name} — {subject_line}",
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
