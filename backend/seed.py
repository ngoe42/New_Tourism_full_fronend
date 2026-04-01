"""
Seed script – inserts admin user, sample tours, images, and testimonials.

Local Docker:  python seed.py
Railway:       railway run python seed.py

The script reads DATABASE_URL (or DATABASE_URL_SYNC) from the environment.
If neither is set it falls back to the local Docker credentials.
"""
import json
import os
import sys
import psycopg2
from datetime import datetime, timezone

_LOCAL = dict(host="localhost", port=5435, user="postgres", password="password", dbname="karibu_safari")


def _get_conn():
    url = os.environ.get("DATABASE_URL_SYNC") or os.environ.get("DATABASE_URL")
    if url:
        # Strip SQLAlchemy driver prefixes so psycopg2 can use the URL directly
        url = (
            url.replace("postgresql+asyncpg://", "postgresql://")
               .replace("postgresql+psycopg2://", "postgresql://")
        )
        print(f"Connecting via DATABASE_URL …")
        return psycopg2.connect(url)
    print("No DATABASE_URL found – connecting to local Docker DB …")
    return psycopg2.connect(**_LOCAL)

TOURS = [
    {
        "title": "Great Serengeti Migration Safari",
        "slug": "great-serengeti-migration-safari",
        "subtitle": "Witness the greatest wildlife spectacle on Earth",
        "description": (
            "Experience the awe-inspiring Great Migration as over 1.5 million wildebeest "
            "thunder across the Serengeti plains. Your expert naturalist guide will position "
            "you perfectly for the legendary Mara River crossings, dramatic predator-prey "
            "encounters, and golden savannah sunsets from a private tented camp."
        ),
        "price": 4850.0,
        "duration": "8 Days / 7 Nights",
        "location": "Serengeti, Tanzania",
        "group_size": "2–8 guests",
        "category": "Safari",
        "badge": "Best Seller",
        "rating": 4.9,
        "review_count": 142,
        "is_published": True,
        "is_featured": True,
        "highlights": [
            "Witness the Great Wildebeest Migration river crossings",
            "Exclusive private tented camp in the heart of the Serengeti",
            "Hot-air balloon safari at dawn over the plains",
            "Big Five game drives with certified naturalist guides",
            "Bush dinner under the stars with local storytelling",
        ],
        "included": [
            "All accommodation (luxury tented camps)",
            "All meals from arrival to departure",
            "Daily game drives in 4WD safari vehicles",
            "Airport transfers",
            "Park fees and conservation levies",
            "Balloon safari (one flight included)",
        ],
        "excluded": [
            "International flights",
            "Travel insurance",
            "Personal shopping and gratuities",
            "Visa fees",
        ],
        "itinerary": [
            {"day": 1, "title": "Arrival in Arusha", "description": "Welcome briefing and overnight at Arusha luxury lodge."},
            {"day": 2, "title": "Fly to Serengeti", "description": "Charter flight to the central Serengeti. Afternoon game drive."},
            {"day": 3, "title": "Migration Tracking", "description": "Full day following the herds with your expert guide."},
            {"day": 4, "title": "Mara River Crossing", "description": "Position at the river at dawn for the dramatic crossings."},
            {"day": 5, "title": "Balloon Safari", "description": "Pre-dawn balloon flight followed by bush breakfast."},
            {"day": 6, "title": "Southern Plains", "description": "Explore the Ndutu area — calving season hot-spot."},
            {"day": 7, "title": "Ngorongoro Crater", "description": "Descend into the crater for a full day of game viewing."},
            {"day": 8, "title": "Departure", "description": "Transfer to Kilimanjaro International Airport."},
        ],
        "images": [
            {"url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", "is_cover": True, "order": 0},
            {"url": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", "is_cover": False, "order": 1},
            {"url": "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200", "is_cover": False, "order": 2},
        ],
    },
    {
        "title": "Kilimanjaro Summit Trek",
        "slug": "kilimanjaro-summit-trek",
        "subtitle": "Conquer Africa's highest peak via the Lemosho Route",
        "description": (
            "Stand on the Roof of Africa at 5,895 m. The Lemosho Route is widely regarded as "
            "the most scenic and highest success-rate path to Uhuru Peak. Our experienced "
            "mountain crew, acclimatisation-optimised schedule, and premium mountain camps "
            "give you the best possible chance of reaching the summit."
        ),
        "price": 3200.0,
        "duration": "9 Days / 8 Nights",
        "location": "Mount Kilimanjaro, Tanzania",
        "group_size": "2–12 guests",
        "category": "Trekking",
        "badge": "Adventure",
        "rating": 4.8,
        "review_count": 98,
        "is_published": True,
        "is_featured": True,
        "highlights": [
            "Lemosho Route — highest summit success rate",
            "Experienced KINAPA-licensed guides",
            "Premium mountain tents and sleeping gear provided",
            "Certificate of summit achievement",
            "Scenic traverse through five climate zones",
        ],
        "included": [
            "All park fees and rescue fees",
            "Experienced guide, assistant guide and porters",
            "All meals on the mountain",
            "Premium camping equipment",
            "Hotel nights in Moshi before and after trek",
        ],
        "excluded": [
            "International flights",
            "Tips for crew (recommended)",
            "Personal trekking gear",
            "Travel insurance",
        ],
        "itinerary": [
            {"day": 1, "title": "Arrive Moshi", "description": "Briefing and gear check at hotel."},
            {"day": 2, "title": "Lemosho Gate → Big Tree Camp", "description": "Enter lush rainforest (2,780 m)."},
            {"day": 3, "title": "Shira 1 Camp", "description": "Cross the Shira Plateau (3,500 m)."},
            {"day": 4, "title": "Lava Tower acclimatisation", "description": "Hike high, sleep low strategy at 3,900 m."},
            {"day": 5, "title": "Barranco → Karanga Camp", "description": "Navigate the famous Barranco Wall."},
            {"day": 6, "title": "Barafu Base Camp", "description": "Rest and prepare for summit night (4,640 m)."},
            {"day": 7, "title": "Summit Night → Uhuru Peak", "description": "Midnight start, reach Uhuru at sunrise (5,895 m)."},
            {"day": 8, "title": "Descent to Mweka Gate", "description": "Long descent through moorland."},
            {"day": 9, "title": "Moshi Departure", "description": "Celebration breakfast and airport transfer."},
        ],
        "images": [
            {"url": "https://images.unsplash.com/photo-1621414050946-6c43c85e-a9c?w=1200", "is_cover": True, "order": 0},
            {"url": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200", "is_cover": False, "order": 1},
            {"url": "https://images.unsplash.com/photo-1609198093327-cfab90a25f9a?w=1200", "is_cover": False, "order": 2},
        ],
    },
    {
        "title": "Zanzibar Island Escape",
        "slug": "zanzibar-island-escape",
        "subtitle": "Turquoise waters, ancient Stone Town and spice-scented breezes",
        "description": (
            "After the dust of the savannah, Zanzibar is pure paradise. Swim in crystal-clear "
            "Indian Ocean waters, discover the UNESCO-listed Stone Town labyrinth, sail on a "
            "traditional dhow at sunset, and explore the island's famous spice plantations. "
            "Your private villa sits right on the white-sand beach."
        ),
        "price": 2100.0,
        "duration": "6 Days / 5 Nights",
        "location": "Zanzibar, Tanzania",
        "group_size": "2–6 guests",
        "category": "Beach",
        "badge": "Relaxation",
        "rating": 4.9,
        "review_count": 87,
        "is_published": True,
        "is_featured": True,
        "highlights": [
            "Private beachfront villa on Nungwi beach",
            "Guided Stone Town heritage walk",
            "Sunset dhow cruise with fresh seafood",
            "Spice plantation tour with local chef lunch",
            "Snorkelling at Mnemba Atoll",
        ],
        "included": [
            "Private beachfront villa accommodation",
            "Daily breakfast and two dinners",
            "All guided excursions listed",
            "Airport transfers on Zanzibar",
            "Snorkelling equipment",
        ],
        "excluded": [
            "Flights to/from Zanzibar",
            "Personal expenses",
            "Additional meals and beverages",
        ],
        "itinerary": [
            {"day": 1, "title": "Arrival Zanzibar", "description": "Transfer to villa. Afternoon at leisure on the beach."},
            {"day": 2, "title": "Stone Town", "description": "Guided walk through the UNESCO World Heritage old town."},
            {"day": 3, "title": "Spice Tour", "description": "Plantation tour and seafood lunch with local chef."},
            {"day": 4, "title": "Mnemba Atoll", "description": "Full-day snorkelling excursion. Dolphin spotting."},
            {"day": 5, "title": "Dhow Cruise", "description": "Sunset sailing with grilled seafood on board."},
            {"day": 6, "title": "Departure", "description": "Breakfast and airport transfer."},
        ],
        "images": [
            {"url": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200", "is_cover": True, "order": 0},
            {"url": "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200", "is_cover": False, "order": 1},
            {"url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "is_cover": False, "order": 2},
        ],
    },
    {
        "title": "Ngorongoro Crater Wildlife Safari",
        "slug": "ngorongoro-crater-wildlife-safari",
        "subtitle": "Descend into the world's largest intact volcanic caldera",
        "description": (
            "The Ngorongoro Crater is a natural wonder unlike any other — a self-contained "
            "ecosystem teeming with over 25,000 animals including the endangered black rhino. "
            "Stay in a luxury lodge perched on the crater rim with sweeping panoramic views, "
            "and descend at dawn for an unforgettable day of game viewing."
        ),
        "price": 1950.0,
        "duration": "4 Days / 3 Nights",
        "location": "Ngorongoro, Tanzania",
        "group_size": "2–8 guests",
        "category": "Safari",
        "badge": "Wildlife",
        "rating": 4.8,
        "review_count": 64,
        "is_published": True,
        "is_featured": False,
        "highlights": [
            "Full-day crater floor game drive",
            "Black rhino sighting opportunity",
            "Luxury rim lodge with panoramic crater views",
            "Cultural visit to a Maasai village",
            "Guided nature walk on the crater rim",
        ],
        "included": [
            "3 nights luxury crater-rim lodge",
            "All meals",
            "Crater descent game drive",
            "Conservation fees",
            "Airport transfers",
        ],
        "excluded": [
            "International flights",
            "Travel insurance",
            "Personal gratuities",
        ],
        "itinerary": [
            {"day": 1, "title": "Arrival Arusha → Ngorongoro", "description": "Scenic drive through the highlands. Crater-rim lodge check-in."},
            {"day": 2, "title": "Crater Full Day", "description": "Dawn descent, full day on the crater floor."},
            {"day": 3, "title": "Maasai & Rim Walk", "description": "Morning Maasai village visit, afternoon nature walk."},
            {"day": 4, "title": "Departure", "description": "Breakfast with crater views, transfer to Arusha airport."},
        ],
        "images": [
            {"url": "https://images.unsplash.com/photo-1551244072-5d12893278bc?w=1200", "is_cover": True, "order": 0},
            {"url": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200", "is_cover": False, "order": 1},
        ],
    },
    {
        "title": "Tarangire & Lake Manyara Safari",
        "slug": "tarangire-lake-manyara-safari",
        "subtitle": "Elephant herds and tree-climbing lions in untouched wilderness",
        "description": (
            "Tarangire is home to Tanzania's largest elephant herds and ancient baobab trees "
            "that dwarf the landscape. Combine it with Lake Manyara — famous for its pink "
            "flamingo flocks and the world-famous tree-climbing lions — for a short but "
            "utterly spectacular safari experience."
        ),
        "price": 1650.0,
        "duration": "4 Days / 3 Nights",
        "location": "Tarangire & Manyara, Tanzania",
        "group_size": "2–10 guests",
        "category": "Safari",
        "badge": "Value Pick",
        "rating": 4.7,
        "review_count": 51,
        "is_published": True,
        "is_featured": False,
        "highlights": [
            "Tarangire's legendary elephant herds",
            "Tree-climbing lions at Lake Manyara",
            "Thousands of flamingos on the alkaline lake shore",
            "Ancient baobab tree walk with naturalist",
            "Night game drive (special permit)",
        ],
        "included": [
            "3 nights mid-range tented camp",
            "All meals",
            "Game drives",
            "Park fees",
            "Airport transfers",
        ],
        "excluded": [
            "International flights",
            "Travel insurance",
            "Gratuities",
        ],
        "itinerary": [
            {"day": 1, "title": "Arrive → Tarangire", "description": "Afternoon game drive in Tarangire National Park."},
            {"day": 2, "title": "Full Day Tarangire", "description": "Full day exploring elephant corridors and baobab groves."},
            {"day": 3, "title": "Lake Manyara", "description": "Morning drive to Manyara. Afternoon lake shore game drive."},
            {"day": 4, "title": "Departure", "description": "Early morning walk, then transfer to Arusha."},
        ],
        "images": [
            {"url": "https://images.unsplash.com/photo-1551244072-5d12893278bc?w=1200", "is_cover": True, "order": 0},
            {"url": "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200", "is_cover": False, "order": 1},
        ],
    },
    {
        "title": "Selous & Ruaha Wilderness Expedition",
        "slug": "selous-ruaha-wilderness-expedition",
        "subtitle": "Tanzania's wild south — vast, remote and exclusively yours",
        "description": (
            "Escape the crowds and discover Tanzania's untouched southern circuit. "
            "The Selous Game Reserve (UNESCO World Heritage Site) and Ruaha National Park "
            "together form one of Africa's largest protected ecosystems. Walking safaris, "
            "boat safaris and exceptional birding set this apart from any other experience."
        ),
        "price": 5500.0,
        "duration": "10 Days / 9 Nights",
        "location": "Selous & Ruaha, Tanzania",
        "group_size": "2–6 guests",
        "category": "Safari",
        "badge": "Exclusive",
        "rating": 5.0,
        "review_count": 29,
        "is_published": True,
        "is_featured": True,
        "highlights": [
            "Walking safaris led by armed FGASA guides",
            "Rufiji River boat safari — hippos and crocodiles",
            "Exclusive-use private camp in Ruaha",
            "Exceptional Big Five sightings in true wilderness",
            "World-class birding — over 440 species recorded",
        ],
        "included": [
            "All accommodation (private luxury camps)",
            "All meals and local beverages",
            "All safari activities",
            "Internal charter flights",
            "Park and reserve fees",
        ],
        "excluded": [
            "International flights to Dar es Salaam",
            "Premium imported beverages",
            "Personal gratuities",
        ],
        "itinerary": [
            {"day": 1, "title": "Arrival Dar es Salaam", "description": "Overnight at luxury Dar es Salaam hotel."},
            {"day": 2, "title": "Charter to Selous", "description": "Morning flight. Afternoon boat safari on the Rufiji River."},
            {"day": 3, "title": "Selous Game Drives", "description": "Full day in the reserve with expert guide."},
            {"day": 4, "title": "Walking Safari", "description": "Guided bush walk through the reserve."},
            {"day": 5, "title": "Selous to Ruaha", "description": "Charter flight to Ruaha National Park."},
            {"day": 6, "title": "Ruaha Morning & Evening Drives", "description": "Explore the vast Ruaha ecosystem."},
            {"day": 7, "title": "Full Day Ruaha", "description": "Sunrise to sunset game viewing."},
            {"day": 8, "title": "Walking Safari Ruaha", "description": "Guided walking safari with armed escort."},
            {"day": 9, "title": "Final Drives", "description": "Last morning game drive and farewell dinner."},
            {"day": 10, "title": "Departure", "description": "Charter back to Dar es Salaam, international connection."},
        ],
        "images": [
            {"url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", "is_cover": True, "order": 0},
            {"url": "https://images.unsplash.com/photo-1568017388877-13bff411e1b5?w=1200", "is_cover": False, "order": 1},
            {"url": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1200", "is_cover": False, "order": 2},
        ],
    },
]

TESTIMONIALS = [
    {
        "name": "Sarah & James Whitfield",
        "location": "London, United Kingdom",
        "rating": 5,
        "message": "Nelson Tour and Safari exceeded every expectation. The river crossing was otherworldly — thousands of wildebeest thundering into the Mara River while our guide calmly explained the ecology. The tented camp felt like a five-star hotel in the middle of the wild. We will absolutely return.",
        "avatar_url": "https://randomuser.me/api/portraits/women/44.jpg",
        "is_approved": True,
        "is_featured": True,
        "tour_slug": "great-serengeti-migration-safari",
    },
    {
        "name": "Marcus Chen",
        "location": "San Francisco, USA",
        "rating": 5,
        "message": "Summiting Kilimanjaro at sunrise was the most profound experience of my life. The guides were incredibly professional, reading every sign of altitude sickness perfectly. The celebration at Uhuru Peak had me in tears. Worth every penny and more.",
        "avatar_url": "https://randomuser.me/api/portraits/men/32.jpg",
        "is_approved": True,
        "is_featured": True,
        "tour_slug": "kilimanjaro-summit-trek",
    },
    {
        "name": "Amélie Dubois",
        "location": "Paris, France",
        "rating": 5,
        "message": "The dhow sailing at sunset over turquoise water was pure magic. Stone Town was a labyrinth of history and flavor. Our villa was perfection. Nelson Tour and Safari has a gift for crafting experiences that feel both luxurious and authentic.",
        "avatar_url": "https://randomuser.me/api/portraits/women/68.jpg",
        "is_approved": True,
        "is_featured": True,
        "tour_slug": "zanzibar-island-escape",
    },
    {
        "name": "Thomas & Petra Müller",
        "location": "Munich, Germany",
        "rating": 5,
        "message": "Waking up with a view over the crater, sipping champagne on the rim at sunset — this is how you experience Africa. The black rhino sighting on day two was something we'll talk about forever. Absolutely first class from start to finish.",
        "avatar_url": "https://randomuser.me/api/portraits/men/75.jpg",
        "is_approved": True,
        "is_featured": False,
        "tour_slug": "ngorongoro-crater-wildlife-safari",
    },
    {
        "name": "Priya Sharma",
        "location": "Mumbai, India",
        "rating": 5,
        "message": "The southern circuit is Africa's best-kept secret. Walking safaris in Ruaha with no one else around — just us, our guide, and a herd of elephants 50 metres away. Extraordinary. The private camp was beyond anything I imagined possible in the bush.",
        "avatar_url": "https://randomuser.me/api/portraits/women/90.jpg",
        "is_approved": True,
        "is_featured": True,
        "tour_slug": "selous-ruaha-wilderness-expedition",
    },
]


def seed():
    now = datetime.now(timezone.utc)
    conn = _get_conn()
    cur = conn.cursor()

    # ── Admin user ────────────────────────────────────────────────────────────
    admin_email = os.environ.get("FIRST_ADMIN_EMAIL", "admin@nelsontoursandsafari.com")
    admin_password = os.environ.get("FIRST_ADMIN_PASSWORD", "ChangeMe123!")
    try:
        from passlib.context import CryptContext
        _pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed = _pwd.hash(admin_password)
    except ImportError:
        print("passlib not installed – skipping admin seed", file=sys.stderr)
        hashed = None

    if hashed:
        cur.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        if cur.fetchone() is None:
            cur.execute(
                """
                INSERT INTO users (email, name, hashed_password, role, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, 'admin', true, %s, %s)
                """,
                (admin_email, "Admin", hashed, now, now),
            )
            print(f"  ✓ Admin user created: {admin_email}")
        else:
            cur.execute(
                "UPDATE users SET hashed_password = %s WHERE email = %s",
                (hashed, admin_email),
            )
            print(f"  ✓ Admin password updated: {admin_email}")
        conn.commit()

    print("Seeding tours...")
    tour_id_map = {}
    for t in TOURS:
        images = t.pop("images")
        cur.execute(
            """
            INSERT INTO tours
              (title, slug, subtitle, description, price, duration, location,
               group_size, category, badge, highlights, itinerary, included,
               excluded, is_published, is_featured, is_active, rating,
               review_count, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,true,%s,%s,%s,%s)
            ON CONFLICT (slug) DO UPDATE SET
              title=EXCLUDED.title,
              is_published=EXCLUDED.is_published,
              is_featured=EXCLUDED.is_featured,
              updated_at=EXCLUDED.updated_at
            RETURNING id
            """,
            (
                t["title"], t["slug"], t.get("subtitle"), t.get("description"),
                t["price"], t["duration"], t["location"], t.get("group_size"),
                t.get("category", "Safari"), t.get("badge"),
                json.dumps(t.get("highlights", [])),
                json.dumps(t.get("itinerary", [])),
                json.dumps(t.get("included", [])),
                json.dumps(t.get("excluded", [])),
                t.get("is_published", True),
                t.get("is_featured", False),
                t.get("rating", 0.0),
                t.get("review_count", 0),
                now, now,
            ),
        )
        tour_id = cur.fetchone()[0]
        tour_id_map[t["slug"]] = tour_id
        print(f"  ✓ Tour: {t['title']} (id={tour_id})")

        # delete old images then re-insert
        cur.execute("DELETE FROM tour_images WHERE tour_id = %s", (tour_id,))
        for img in images:
            cur.execute(
                """
                INSERT INTO tour_images (tour_id, url, is_cover, "order", created_at)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (tour_id, img["url"], img["is_cover"], img["order"], now),
            )
        t["images"] = images  # restore for cleanliness

    print("\nSeeding testimonials...")
    cur.execute("DELETE FROM testimonials")
    for tm in TESTIMONIALS:
        tour_id = tour_id_map.get(tm["tour_slug"])
        cur.execute(
            """
            INSERT INTO testimonials
              (name, location, rating, message, avatar_url, is_approved,
               is_featured, tour_id, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                tm["name"], tm["location"], tm["rating"], tm["message"],
                tm["avatar_url"], tm["is_approved"], tm["is_featured"],
                tour_id, now,
            ),
        )
        print(f"  ✓ Testimonial: {tm['name']}")

    conn.commit()
    cur.close()
    conn.close()
    print("\n✅ Seed complete!")


if __name__ == "__main__":
    seed()
