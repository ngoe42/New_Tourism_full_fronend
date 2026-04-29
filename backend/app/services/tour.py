import re
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tour import Tour, TourImage
from app.repositories.tour import TourRepository, TourImageRepository
from app.schemas.tour import TourCreate, TourUpdate, PaginatedTours
from app.services.media import MediaService


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


class TourService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tour_repo = TourRepository(db)
        self.image_repo = TourImageRepository(db)

    async def create_tour(self, data: TourCreate) -> Tour:
        slug = data.slug or _slugify(data.title)
        base_slug = slug
        counter = 1
        while await self.tour_repo.slug_exists(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        tour = Tour(
            title=data.title,
            slug=slug,
            subtitle=data.subtitle,
            description=data.description,
            price=data.price,
            duration=data.duration,
            location=data.location,
            group_size=data.group_size,
            category=data.category,
            badge=data.badge,
            highlights=data.highlights or [],
            itinerary=data.itinerary or [],
            included=data.included or [],
            excluded=data.excluded or [],
            is_published=data.is_published,
            is_featured=data.is_featured,
        )
        return await self.tour_repo.create(tour)

    async def get_tour(self, tour_id: int) -> Tour:
        tour = await self.tour_repo.get(tour_id)
        if not tour:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tour not found")
        return tour

    async def get_tour_by_slug(self, slug: str) -> Tour:
        tour = await self.tour_repo.get_by_slug(slug)
        if not tour:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tour not found")
        return tour

    async def list_tours(
        self,
        page: int = 1,
        per_page: int = 12,
        query: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        admin: bool = False,
    ) -> PaginatedTours:
        skip = (page - 1) * per_page
        if admin:
            tours = await self.tour_repo.get_all(skip=skip, limit=per_page)
            total = await self.tour_repo.count()
        else:
            tours, total = await self.tour_repo.search(
                query=query,
                category=category,
                min_price=min_price,
                max_price=max_price,
                skip=skip,
                limit=per_page,
            )
        return PaginatedTours(
            items=tours,
            total=total,
            page=page,
            per_page=per_page,
            pages=max(1, -(-total // per_page)),
        )

    async def update_tour(self, tour_id: int, data: TourUpdate) -> Tour:
        tour = await self.get_tour(tour_id)
        update_data = data.model_dump(exclude_none=True)
        return await self.tour_repo.update(tour, update_data)

    async def delete_tour(self, tour_id: int) -> None:
        tour = await self.get_tour(tour_id)
        # Snapshot image refs before deleting the DB records
        image_refs = [(img.url, img.public_id) for img in (tour.images or [])]
        await self.tour_repo.delete(tour)
        await self.db.commit()
        # Best-effort cloud cleanup after DB is committed
        media_svc = MediaService(self.db)
        for url, public_id in image_refs:
            await media_svc.delete_file(url, public_id)

    async def add_image(self, tour_id: int, url: str, public_id: Optional[str] = None, is_cover: bool = False) -> TourImage:
        await self.get_tour(tour_id)
        image = TourImage(tour_id=tour_id, url=url, public_id=public_id, is_cover=is_cover, order=0)
        return await self.image_repo.create(image)

    async def delete_image(self, image_id: int) -> None:
        image = await self.image_repo.get(image_id)
        if not image:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
        url, public_id = image.url, image.public_id
        await self.image_repo.delete(image)
        await self.db.commit()
        # Best-effort cloud cleanup after DB is committed
        await MediaService(self.db).delete_file(url, public_id)
