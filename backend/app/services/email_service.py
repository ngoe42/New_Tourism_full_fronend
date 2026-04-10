import httpx
from loguru import logger

from app.core.config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


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
    """Send email via Brevo (Sendinblue) HTTP API — no SMTP, works on Railway."""
    if not settings.BREVO_API_KEY:
        raise RuntimeError(
            "Email not configured. Set BREVO_API_KEY in environment variables."
        )

    logger.info(f"Sending email to {to} via Brevo")

    payload = {
        "sender": {"name": settings.EMAIL_FROM_NAME, "email": settings.EMAIL_FROM},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": _build_html(body),
        "textContent": body,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            BREVO_API_URL,
            json=payload,
            headers={
                "accept": "application/json",
                "api-key": settings.BREVO_API_KEY,
                "content-type": "application/json",
            },
        )

    if response.status_code not in (200, 201):
        error_detail = response.json().get("message", response.text)
        logger.error(f"Brevo error {response.status_code}: {error_detail}")
        raise RuntimeError(f"Brevo error: {error_detail}")

    logger.info(f"Email sent — messageId: {response.json().get('messageId')}")
