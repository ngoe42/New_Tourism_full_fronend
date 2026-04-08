from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings


async def send_email(to: str, subject: str, body: str) -> None:
    """Send a plain-text + HTML email via SMTP."""
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        raise RuntimeError("SMTP credentials are not configured. Set SMTP_USER and SMTP_PASS in .env")

    html_body = f"""
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

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASS,
        start_tls=settings.SMTP_TLS,
    )
