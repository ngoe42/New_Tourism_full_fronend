from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.route import Route, RouteImage
from app.schemas.route import RouteCreate, RouteUpdate


class RouteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[Route]:
        result = await self.session.execute(select(Route).order_by(Route.name))
        return list(result.scalars().all())

    async def get_by_id(self, route_id: int) -> Optional[Route]:
        result = await self.session.execute(select(Route).where(Route.id == route_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Route]:
        result = await self.session.execute(select(Route).where(Route.slug == slug))
        return result.scalar_one_or_none()

    async def create(self, route_in: RouteCreate) -> Route:
        route = Route(**route_in.model_dump())
        self.session.add(route)
        await self.session.flush()
        await self.session.refresh(route)
        return route

    async def update(self, route: Route, route_in: RouteUpdate) -> Route:
        for field, value in route_in.model_dump(exclude_unset=True).items():
            setattr(route, field, value)
        await self.session.flush()
        await self.session.refresh(route)
        return route

    async def delete(self, route: Route) -> None:
        await self.session.delete(route)
        await self.session.flush()

    # ── Image helpers ───────────────────────────────────────────────────────
    async def add_image(self, route_id: int, url: str, public_id: Optional[str] = None,
                        caption: Optional[str] = None, is_cover: bool = False) -> RouteImage:
        existing = await self.session.execute(
            select(RouteImage).where(RouteImage.route_id == route_id).order_by(RouteImage.order.desc()).limit(1)
        )
        last = existing.scalar_one_or_none()
        order = (last.order + 1) if last else 0
        img = RouteImage(route_id=route_id, url=url, public_id=public_id,
                         caption=caption, is_cover=is_cover, order=order)
        self.session.add(img)
        await self.session.flush()
        await self.session.refresh(img)
        return img

    async def get_image(self, image_id: int) -> Optional[RouteImage]:
        result = await self.session.execute(select(RouteImage).where(RouteImage.id == image_id))
        return result.scalar_one_or_none()

    async def delete_image(self, image: RouteImage) -> None:
        await self.session.delete(image)
        await self.session.flush()
