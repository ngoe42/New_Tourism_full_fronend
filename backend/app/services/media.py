import io
from typing import Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.media import Media
from app.models.user import User
from app.repositories.media import MediaRepository


ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class MediaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MediaRepository(db)

    async def upload(self, file: UploadFile, user: User, tour_id: Optional[int] = None) -> Media:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, WEBP or GIF.",
            )

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit",
            )

        url, public_id = await self._upload_to_provider(contents, file.filename, file.content_type)

        media = Media(
            url=url,
            public_id=public_id,
            filename=file.filename,
            file_size=len(contents),
            content_type=file.content_type,
            tour_id=tour_id,
            uploaded_by=user.id,
        )
        return await self.repo.create(media)

    async def _upload_to_provider(self, contents: bytes, filename: str, content_type: str) -> tuple[str, Optional[str]]:
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            return await self._upload_cloudinary(contents, filename)
        elif settings.AWS_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID:
            return await self._upload_s3(contents, filename, content_type)
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No storage provider configured. Set Cloudinary or S3 credentials in .env",
            )

    async def _upload_cloudinary(self, contents: bytes, filename: str) -> tuple[str, str]:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
        result = cloudinary.uploader.upload(
            io.BytesIO(contents),
            folder="karibu_safari",
            public_id=filename.rsplit(".", 1)[0],
            overwrite=False,
        )
        return result["secure_url"], result["public_id"]

    async def _upload_s3(self, contents: bytes, filename: str, content_type: str) -> tuple[str, str]:
        import boto3
        import uuid
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        key = f"karibu_safari/{uuid.uuid4()}_{filename}"
        s3.put_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=key,
            Body=contents,
            ContentType=content_type,
        )
        url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
        return url, key

    async def delete(self, media_id: int) -> None:
        media = await self.repo.get(media_id)
        if not media:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
        if media.public_id:
            await self._delete_from_provider(media.public_id)
        await self.repo.delete(media)

    async def _delete_from_provider(self, public_id: str) -> None:
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            import cloudinary.uploader
            cloudinary.uploader.destroy(public_id)
        elif settings.AWS_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID:
            import boto3
            s3 = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
            s3.delete_object(Bucket=settings.AWS_BUCKET_NAME, Key=public_id)

    async def list_all(self, page: int = 1, per_page: int = 20):
        skip = (page - 1) * per_page
        return await self.repo.get_all_paginated(skip=skip, limit=per_page)
