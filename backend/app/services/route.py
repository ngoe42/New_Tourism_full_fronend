import io
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.route import Route, RouteImage
from app.schemas.route import RouteCreate, RouteUpdate
from app.repositories.route import RouteRepository

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class RouteService:
    def __init__(self, session: AsyncSession):
        self.repository = RouteRepository(session)
        self._session = session

    async def get_all_routes(self) -> List[Route]:
        return await self.repository.get_all()

    async def get_route(self, route_id: int) -> Route:
        route = await self.repository.get_by_id(route_id)
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
        return route

    async def get_route_by_slug(self, slug: str) -> Route:
        route = await self.repository.get_by_slug(slug)
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
        return route

    async def create_route(self, route_in: RouteCreate) -> Route:
        if await self.repository.get_by_slug(route_in.slug):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Route with this slug already exists")
        return await self.repository.create(route_in)

    async def update_route(self, route_id: int, route_in: RouteUpdate) -> Route:
        route = await self.get_route(route_id)
        if route_in.slug and route_in.slug != route.slug:
            if await self.repository.get_by_slug(route_in.slug):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="Route with this slug already exists")
        return await self.repository.update(route, route_in)

    async def delete_route(self, route_id: int) -> None:
        route = await self.get_route(route_id)
        for img in (route.images or []):
            await self._delete_file(img.url, img.public_id)
        await self.repository.delete(route)

    # ── Image management ────────────────────────────────────────────────────
    async def upload_image(self, route_id: int, file: UploadFile,
                           caption: Optional[str] = None, is_cover: bool = False) -> RouteImage:
        route = await self.get_route(route_id)
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"File type {file.content_type} not allowed")
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 10MB")
        url, public_id = await self._store(contents, file.filename, file.content_type)
        return await self.repository.add_image(
            route_id=route.id, url=url, public_id=public_id,
            caption=caption, is_cover=is_cover
        )

    async def _delete_file(self, url, public_id=None) -> None:
        try:
            if public_id:
                if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
                    import cloudinary.uploader
                    cloudinary.uploader.destroy(public_id)
                elif settings.AWS_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID:
                    import boto3
                    s3 = boto3.client("s3", aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                      aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                      region_name=settings.AWS_REGION)
                    s3.delete_object(Bucket=settings.AWS_BUCKET_NAME, Key=public_id)
            elif url and url.startswith('/uploads/'):
                parts = url.split('/uploads/', 1)
                if len(parts) == 2:
                    local_path = Path(__file__).resolve().parents[2] / "static" / "uploads" / parts[1]
                    if local_path.exists():
                        local_path.unlink()
        except Exception:
            pass

    async def _store(self, contents: bytes, filename: str, content_type: str):
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            import cloudinary, cloudinary.uploader
            cloudinary.config(cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                              api_key=settings.CLOUDINARY_API_KEY,
                              api_secret=settings.CLOUDINARY_API_SECRET)
            r = cloudinary.uploader.upload(io.BytesIO(contents), folder="karibu_routes",
                                           overwrite=False)
            return r["secure_url"], r["public_id"]
        elif settings.AWS_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID:
            import boto3
            s3 = boto3.client("s3", aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                              aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                              region_name=settings.AWS_REGION)
            key = f"karibu_routes/{uuid.uuid4()}_{filename}"
            s3.put_object(Bucket=settings.AWS_BUCKET_NAME, Key=key,
                          Body=contents, ContentType=content_type)
            return (f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}"
                    f".amazonaws.com/{key}"), key
        else:
            upload_dir = Path(__file__).resolve().parents[2] / "static" / "uploads"
            upload_dir.mkdir(parents=True, exist_ok=True)
            ext = Path(filename).suffix or ".jpg"
            unique_name = f"{uuid.uuid4().hex}{ext}"
            (upload_dir / unique_name).write_bytes(contents)
            return f"/uploads/{unique_name}", None

    async def delete_image(self, route_id: int, image_id: int) -> None:
        await self.get_route(route_id)
        image = await self.repository.get_image(image_id)
        if not image or image.route_id != route_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
        await self._delete_file(image.url, image.public_id)
        await self.repository.delete_image(image)
