"""
Seed sample images for all 6 Kilimanjaro routes.
Uses publicly accessible Unsplash photo URLs (CDN, no auth needed).
Run inside Docker: docker-compose exec api python seed_route_images.py
"""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.route import Route, RouteImage

# Reliable Unsplash CDN URLs — mountain / Kilimanjaro / trekking theme
ROUTE_IMAGES = {
    "machame-route": [
        {
            "url": "https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=1200&q=80&auto=format&fit=crop",
            "caption": "Machame Route rainforest approach",
            "is_cover": True,
        },
        {
            "url": "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1200&q=80&auto=format&fit=crop",
            "caption": "Summit ridge at dawn",
            "is_cover": False,
        },
        {
            "url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
            "caption": "Kilimanjaro alpine zone",
            "is_cover": False,
        },
    ],
    "marangu-route": [
        {
            "url": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80&auto=format&fit=crop",
            "caption": "Marangu Route hut accommodations",
            "is_cover": True,
        },
        {
            "url": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&auto=format&fit=crop",
            "caption": "Trekking through the moorland",
            "is_cover": False,
        },
    ],
    "lemosho-route": [
        {
            "url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
            "caption": "Lemosho Route — Shira Plateau",
            "is_cover": True,
        },
        {
            "url": "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80&auto=format&fit=crop",
            "caption": "Panoramic views from Lemosho",
            "is_cover": False,
        },
        {
            "url": "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=1200&q=80&auto=format&fit=crop",
            "caption": "Summit crater morning light",
            "is_cover": False,
        },
    ],
    "rongai-route": [
        {
            "url": "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&q=80&auto=format&fit=crop",
            "caption": "Rongai Route wilderness approach",
            "is_cover": True,
        },
        {
            "url": "https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=1200&q=80&auto=format&fit=crop",
            "caption": "Northern slopes at sunrise",
            "is_cover": False,
        },
    ],
    "umbwe-route": [
        {
            "url": "https://images.unsplash.com/photo-1472566316349-bce77aa2a778?w=1200&q=80&auto=format&fit=crop",
            "caption": "Umbwe Route steep direct ascent",
            "is_cover": True,
        },
        {
            "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
            "caption": "Rocky technical terrain",
            "is_cover": False,
        },
    ],
    "northern-circuit-route": [
        {
            "url": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80&auto=format&fit=crop",
            "caption": "Northern Circuit — 360° mountain views",
            "is_cover": True,
        },
        {
            "url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80&auto=format&fit=crop",
            "caption": "Remote northern wilderness",
            "is_cover": False,
        },
        {
            "url": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80&auto=format&fit=crop",
            "caption": "Aerial view — summit approach",
            "is_cover": False,
        },
    ],
}


async def seed_images():
    async with AsyncSessionLocal() as session:
        for slug, images in ROUTE_IMAGES.items():
            result = await session.execute(select(Route).where(Route.slug == slug))
            route = result.scalar_one_or_none()
            if not route:
                print(f"  SKIP  {slug} — route not found")
                continue

            # Check existing images
            existing = await session.execute(
                select(RouteImage).where(RouteImage.route_id == route.id)
            )
            if existing.scalars().first():
                print(f"  SKIP  {slug} — images already seeded")
                continue

            for order, img in enumerate(images):
                session.add(RouteImage(
                    route_id=route.id,
                    url=img["url"],
                    caption=img["caption"],
                    is_cover=img["is_cover"],
                    order=order,
                ))
            print(f"  OK    {slug} — {len(images)} image(s) added")

        await session.commit()
        print("\nDone seeding route images.")


if __name__ == "__main__":
    asyncio.run(seed_images())
