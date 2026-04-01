"""
Replace/seed the 5 core experiences shown in the navbar dropdown.
Run inside Docker: docker-compose exec api python seed_experiences.py
"""
import asyncio
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal
from app.models.experience import Experience

EXPERIENCES = [
    {
        "title": "Maasai Tribe Experience",
        "subtitle": "Step into the living culture of East Africa's most iconic people",
        "description": "Spend time with a genuine Maasai community — witness the jumping dance, learn about traditional medicine, visit a boma homestead, and hear stories passed down through generations. An authentic cultural immersion unlike any other.",
        "image_url": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80&auto=format&fit=crop",
        "order": 0,
        "is_active": True,
    },
    {
        "title": "Serval Wildlife",
        "subtitle": "Track Africa's most elegant wild cat in its natural habitat",
        "description": "Encounter the elusive serval on a guided wildlife excursion through Tanzania's grasslands. Expert trackers and naturalists guide you through the bush, offering rare sightings of this beautiful spotted cat and other incredible wildlife.",
        "image_url": "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=80&auto=format&fit=crop",
        "order": 1,
        "is_active": True,
    },
    {
        "title": "Hadzabe Tribe Experience",
        "subtitle": "Walk alongside one of Earth's last hunter-gatherer tribes",
        "description": "Join the Hadzabe — one of the world's last remaining hunter-gatherer peoples — on a morning hunt. Learn to use a traditional bow and arrow, forage for berries and tubers, and gain profound respect for a way of life that has endured for 10,000 years.",
        "image_url": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80&auto=format&fit=crop",
        "order": 2,
        "is_active": True,
    },
    {
        "title": "Tanzanite Gem Experience in Mererani",
        "subtitle": "Discover the only place on Earth where tanzanite is found",
        "description": "Visit the famous Mererani Hills mines — the sole source of the rare blue-violet tanzanite gemstone. Tour the mining operations, meet local gem cutters, and take home a piece of Tanzania's geological wonder.",
        "image_url": "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80&auto=format&fit=crop",
        "order": 3,
        "is_active": True,
    },
    {
        "title": "Chemka Hotspring & Materuni Waterfall",
        "subtitle": "Swim in crystal-clear springs beneath the shadow of Kilimanjaro",
        "description": "Cool off in the enchanting Chemka (Kikuletwa) Hot Springs, fed by underground volcanic waters and shaded by fig trees. Combine with a trek to the stunning Materuni Waterfall on the slopes of Kilimanjaro for a full day of natural wonders.",
        "image_url": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80&auto=format&fit=crop",
        "order": 4,
        "is_active": True,
    },
]


async def main():
    async with AsyncSessionLocal() as session:
        await session.execute(delete(Experience))
        await session.commit()
        print("Cleared existing experiences.")

        for exp_data in EXPERIENCES:
            exp = Experience(**exp_data)
            session.add(exp)

        await session.commit()
        print(f"Seeded {len(EXPERIENCES)} experiences:")
        for e in EXPERIENCES:
            print(f"  ✓  {e['title']}")

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
