import asyncio
import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings as app_settings
from app.core.database import get_db
from app.core.cache import cache_get, cache_set, cache_delete, TTL_LONG
from app.dependencies.auth import require_admin
from app.models.site_settings import SiteSettings
from app.schemas.site_settings import SiteSettingsResponse, SiteSettingsUpdate, HeroImageAdd

_KEY = "site:settings"


async def _invalidate_settings() -> None:
    await cache_delete(_KEY)

router = APIRouter(tags=["Settings"])

ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
MAX_VIDEO_SIZE = 150 * 1024 * 1024  # 150 MB


async def _get_or_create(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).limit(1))
    row = result.scalar_one_or_none()
    if row is None:
        from sqlalchemy import text
        # Acquire a named advisory lock so that two concurrent requests which
        # both saw row=None can't both INSERT — the second one re-reads under
        # the lock and finds the row already created by the first.
        await db.execute(text("SELECT pg_advisory_xact_lock(20241001)"))
        result = await db.execute(select(SiteSettings).limit(1))
        row = result.scalar_one_or_none()
        if row is None:
            row = SiteSettings(show_prices=False)
            db.add(row)
            await db.commit()
            await db.refresh(row)
    return row


@router.get("", response_model=SiteSettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    cached = await cache_get(_KEY)
    if cached is not None:
        return JSONResponse(content=cached)
    row = await _get_or_create(db)
    await cache_set(_KEY, jsonable_encoder(row), TTL_LONG)
    return row


@router.put("", response_model=SiteSettingsResponse, dependencies=[Depends(require_admin)])
async def update_settings(data: SiteSettingsUpdate, db: AsyncSession = Depends(get_db)):
    row = await _get_or_create(db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    await db.commit()
    await db.refresh(row)
    await _invalidate_settings()
    return row


@router.post("/hero-images", response_model=SiteSettingsResponse, dependencies=[Depends(require_admin)])
async def add_hero_image(data: HeroImageAdd, db: AsyncSession = Depends(get_db)):
    row = await _get_or_create(db)
    images = list(row.hero_images or [])
    if data.url not in images:
        images.append(data.url)
    row.hero_images = images
    await db.commit()
    await db.refresh(row)
    await _invalidate_settings()
    return row


@router.delete("/hero-images/{idx}", response_model=SiteSettingsResponse, dependencies=[Depends(require_admin)])
async def remove_hero_image(idx: int, db: AsyncSession = Depends(get_db)):
    row = await _get_or_create(db)
    images = list(row.hero_images or [])
    if 0 <= idx < len(images):
        images.pop(idx)
        row.hero_images = images
        await db.commit()
        await db.refresh(row)
        await _invalidate_settings()
    return row


@router.post("/hero-video", response_model=SiteSettingsResponse, dependencies=[Depends(require_admin)])
async def upload_hero_video(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: mp4, webm, mov.",
        )

    # Stream upload into a spooled temp file (stays in RAM up to 50 MB, then
    # spills to disk).  This avoids holding 2× the file size in RAM that the
    # previous bytearray + bytes(contents) conversion caused.
    total_size = 0
    tmp = tempfile.SpooledTemporaryFile(max_size=50 * 1024 * 1024)
    try:
        while True:
            chunk = await file.read(1024 * 1024)  # 1 MB chunks
            if not chunk:
                break
            total_size += len(chunk)
            if total_size > MAX_VIDEO_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Video exceeds 150 MB limit.",
                )
            tmp.write(chunk)
        tmp.seek(0)
        video_url = await _store_video(tmp, file.filename, file.content_type)
    finally:
        tmp.close()

    # Persist the URL; if the DB write fails, delete the already-uploaded
    # cloud/local asset so no orphan files are left behind.
    try:
        row = await _get_or_create(db)
        row.hero_video_url = video_url
        await db.commit()
        await db.refresh(row)
        await _invalidate_settings()
        return row
    except Exception:
        await _remove_video(video_url)
        raise


@router.delete("/hero-video", response_model=SiteSettingsResponse, dependencies=[Depends(require_admin)])
async def delete_hero_video(db: AsyncSession = Depends(get_db)):
    row = await _get_or_create(db)
    if row.hero_video_url:
        await _remove_video(row.hero_video_url)
        row.hero_video_url = None
        await db.commit()
        await db.refresh(row)
        await _invalidate_settings()
    return row


async def _remove_video(url: str) -> None:
    if url.startswith("/uploads/"):
        local_path = Path(__file__).resolve().parents[3] / "static" / url.lstrip("/")
        if await asyncio.to_thread(local_path.exists):
            await asyncio.to_thread(local_path.unlink)

    elif "amazonaws.com" in url and app_settings.AWS_BUCKET_NAME and app_settings.AWS_ACCESS_KEY_ID:
        import boto3
        key = "/".join(url.split("/")[3:])
        s3 = boto3.client(
            "s3",
            aws_access_key_id=app_settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=app_settings.AWS_SECRET_ACCESS_KEY,
            region_name=app_settings.AWS_REGION,
        )
        await asyncio.to_thread(s3.delete_object, Bucket=app_settings.AWS_BUCKET_NAME, Key=key)

    elif "cloudinary.com" in url and app_settings.CLOUDINARY_CLOUD_NAME:
        import cloudinary.uploader
        import cloudinary
        cloudinary.config(
            cloud_name=app_settings.CLOUDINARY_CLOUD_NAME,
            api_key=app_settings.CLOUDINARY_API_KEY,
            api_secret=app_settings.CLOUDINARY_API_SECRET,
        )
        parts = url.split("/upload/")[1].split(".")
        public_id = parts[0]
        await asyncio.to_thread(cloudinary.uploader.destroy, public_id, resource_type="video")


async def _store_video(fileobj, filename: str, content_type: str) -> str:
    """Upload a video file-like object to the configured storage provider.
    Accepts any seekable file-like object (SpooledTemporaryFile, BytesIO, etc.).
    The caller is responsible for seek(0) before calling this function.
    """
    if app_settings.AWS_BUCKET_NAME and app_settings.AWS_ACCESS_KEY_ID:
        import boto3
        s3 = boto3.client(
            "s3",
            aws_access_key_id=app_settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=app_settings.AWS_SECRET_ACCESS_KEY,
            region_name=app_settings.AWS_REGION,
        )
        key = f"karibu_safari/videos/{uuid.uuid4()}_{filename}"
        # upload_fileobj streams multipart and works with any file-like object;
        # put_object(Body=bytes) required a full in-memory copy.
        await asyncio.to_thread(
            s3.upload_fileobj,
            fileobj,
            app_settings.AWS_BUCKET_NAME,
            key,
            ExtraArgs={"ContentType": content_type},
        )
        return f"https://{app_settings.AWS_BUCKET_NAME}.s3.{app_settings.AWS_REGION}.amazonaws.com/{key}"

    elif app_settings.CLOUDINARY_CLOUD_NAME and app_settings.CLOUDINARY_API_KEY:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=app_settings.CLOUDINARY_CLOUD_NAME,
            api_key=app_settings.CLOUDINARY_API_KEY,
            api_secret=app_settings.CLOUDINARY_API_SECRET,
        )
        def _do_upload():
            return cloudinary.uploader.upload(
                fileobj,
                resource_type="video",
                folder="karibu_safari/videos",
                public_id=f"hero_{uuid.uuid4().hex}",
            )
        result = await asyncio.to_thread(_do_upload)
        return result["secure_url"]

    else:
        upload_dir = Path(__file__).resolve().parents[3] / "static" / "uploads" / "videos"
        upload_dir.mkdir(parents=True, exist_ok=True)
        ext = Path(filename).suffix or ".mp4"
        unique_name = f"hero_{uuid.uuid4().hex}{ext}"
        dest = upload_dir / unique_name
        def _write_chunks():
            with open(dest, "wb") as out:
                while True:
                    chunk = fileobj.read(1024 * 1024)
                    if not chunk:
                        break
                    out.write(chunk)
        await asyncio.to_thread(_write_chunks)
        return f"/uploads/videos/{unique_name}"
