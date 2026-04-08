import resend
from loguru import logger

from app.core.config import settings


def _build_html(body: str) -> str:
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
          <div style="background: #f5f5f0; padding: 20px 32px; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            Nelson Tours &amp; Safari · Sokoine Road, Arusha, Tanzania · +255 750 005 973
          </div>
        </div>
      </body>
    </html>
    """


async def send_email(to: str, subject: str, body: str) -> None:
    """Send email via Resend HTTP API (works on Railway / any cloud host)."""
    if not settings.RESEND_API_KEY:
        raise RuntimeError(
            "Email not configured. Set RESEND_API_KEY in environment variables."
        )

    resend.api_key = settings.RESEND_API_KEY

    logger.info(f"Sending email to {to} via Resend")

    try:
        params: resend.Emails.SendParams = {
            "from": settings.EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": _build_html(body),
            "text": body,
        }
        result = resend.Emails.send(params)
        logger.info(f"Email sent successfully — id: {result.get('id')}")
    except Exception as e:
        logger.error(f"Resend error: {e}")
        raise RuntimeError(f"Failed to send email: {e}")
