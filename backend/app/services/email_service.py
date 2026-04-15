from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from loguru import logger

from app.core.config import settings


def _payment_block(
    item_name: Optional[str],
    price: Optional[float],
    payment_link: Optional[str],
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
        f'<div style="text-align:center; margin-top:20px;">'
        f'<a href="{payment_link}" '
        f'style="display:inline-block; background:#c9a96e; color:#fff; font-size:14px; font-weight:700; '
        f'padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:0.5px;">'
        f'View Payment &amp; Booking Details &rarr;'
        f'</a></div>'
    ) if payment_link else ""

    return f"""
    <div style="margin:24px 32px 0; border:2px solid #c9a96e; border-radius:10px; overflow:hidden;">
      <div style="background:#0f3d2e; padding:12px 20px;">
        <p style="margin:0; color:#c9a96e; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">
          Payment Details
        </p>
      </div>
      <div style="padding:16px 20px;">
        <table style="width:100%; border-collapse:collapse;">
          {item_html}
          {price_html}
        </table>
        {btn_html}
      </div>
    </div>
    """


def _build_html(
    body: str,
    *,
    item_name: Optional[str] = None,
    price: Optional[float] = None,
    payment_link: Optional[str] = None,
) -> str:
    payment_section = _payment_block(item_name, price, payment_link)
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
) -> None:
    """Send email via SendGrid.  Optionally includes a payment-details block."""
    if not settings.SENDGRID_API_KEY:
        raise RuntimeError(
            "Email not configured. Set SENDGRID_API_KEY in environment variables."
        )

    logger.info(f"Sending email to {to} via SendGrid")

    from sendgrid.helpers.mail import ReplyTo

    html = _build_html(body, item_name=item_name, price=price, payment_link=payment_link)

    plain = body
    if price:
        plain += f"\n\n--- Payment Details ---\n"
        if item_name:
            plain += f"Package : {item_name}\n"
        plain += f"Total   : USD {price:,.2f}\n"
    if payment_link:
        plain += f"Link    : {payment_link}\n"

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
        response = sg.send(message)
        logger.info(f"Email sent — status: {response.status_code}")
    except Exception as e:
        logger.error(f"SendGrid error: {e}")
        raise RuntimeError(f"Failed to send email: {e}")
