"""
Seed Mount Meru and Ol Doinyo Lengai route data.
Run inside Docker: docker exec karibu_api python seed_mountain_routes.py
Idempotent — skips routes whose slug already exists.
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.route import Route
from sqlalchemy import select

# ─────────────────────────────────────────────────────────────────────────────
#  MOUNT MERU ROUTES
# ─────────────────────────────────────────────────────────────────────────────
MERU_ROUTES = [
    {
        "name": "Momella Route – 3 Days",
        "slug": "meru-momella-3-days",
        "nickname": "The Wildlife Trek",
        "nickname_explanation": "Unique among major African peaks, every ascent of Mount Meru is accompanied by an armed park ranger — because elephant, buffalo and colobus monkey share the trail with you.",
        "mountain": "meru",
        "duration": "3 Days / 2 Nights",
        "difficulty": "Challenging",
        "success_rate": "88%",
        "max_altitude": "4,566m",
        "distance": "~56 km round trip",
        "group_size": "1 – 10 people",
        "best_season": "Jun–Feb (avoid Mar–May rains)",
        "price": 950.00,
        "short_description": "A fast-paced 3-day ascent of Tanzania's second-highest peak via the Momella Route. Wildlife-rich lower slopes give way to dramatic crater walls and a razor-edge summit ridge with Kilimanjaro floating above the clouds.",
        "full_description": (
            "Mount Meru rises 4,566 metres inside Arusha National Park — a dramatic, ash-cone volcano "
            "with a sheer inner crater wall that makes it visually unlike any other African peak. "
            "The Momella Route is the only trail on Meru, but what a trail it is: you'll walk through "
            "forests alive with colobus monkeys and giant hornbills, past grazing giraffe and buffalo "
            "on the open moorland, and up a breathtaking cliff-edge crater rim to Socialist Peak.\n\n"
            "The 3-day schedule pushes hard but rewards with a fast, focused expedition. An armed park "
            "ranger accompanies every team from gate to summit — not ceremony, but genuine wildlife management. "
            "The summit ridge at dawn, with Kilimanjaro's snow cap burning white above the cloud layer, "
            "is among the most extraordinary panoramas in all of East Africa."
        ),
        "package_details": "Includes park fees, ranger fee, hut accommodation (Miriakamba & Saddle Huts), all meals on mountain, guide, porters, and airport/hotel transfers.",
        "requirements": "Good cardiovascular fitness required. No technical experience needed. Comfortable hiking boots essential. Minimum age 10 years.",
        "highlights": [
            "Armed park ranger escort through genuine African wilderness",
            "Colobus monkeys, buffalo, giraffe and elephant on the lower trail",
            "Spectacular Ash Cone and sheer inner crater walls",
            "Summit ridge views of Kilimanjaro above the clouds",
            "Miriakamba and Saddle Hut mountain accommodation",
            "Far fewer climbers than Kilimanjaro — a genuinely wild experience",
        ],
        "itinerary": [
            {"day": "Day 1", "title": "Momella Gate → Miriakamba Hut", "description": "Transfer to Arusha National Park Momella Gate (1,524m). Register, meet your ranger and porters, then descend into Ngurdoto Crater before ascending through dense Afromontane forest. Wildlife sightings are common on this lower section. Arrive at Miriakamba Hut (2,514m) for dinner and overnight. Distance: ~10 km. Ascent: ~1,000m.", "distance": "~10 km"},
            {"day": "Day 2", "title": "Miriakamba Hut → Saddle Hut → Little Meru", "description": "An early start through open heath and moorland. The trail rises steeply to Saddle Hut (3,566m) — your base for the next two nights. After lunch and rest, make an acclimatisation hike to Little Meru (3,820m) for panoramic views and altitude adaptation. Return to Saddle Hut for dinner. Distance: ~10 km. Ascent: ~1,300m.", "distance": "~10 km"},
            {"day": "Day 3", "title": "Summit Push → Momella Gate → Arusha", "description": "Wake at midnight. Under starlight, follow the crater rim to Rhino Point (3,800m), then push along the knife-edge ridge to Socialist Peak (4,566m) before sunrise. The view of Kilimanjaro at first light is extraordinary. Descend all the way to Momella Gate, completing the circuit. Transfer back to your Arusha hotel. Distance: ~20 km. Ascent/Descent: ~1,000m / ~3,000m.", "distance": "~20 km"},
        ],
        "included": [
            "Arusha National Park entrance fees",
            "Mandatory armed park ranger",
            "Certified mountain guide",
            "Porters (1 porter per climber)",
            "Miriakamba and Saddle Hut accommodation fees",
            "All meals while on the mountain (Day 1 dinner through Day 3 lunch)",
            "Emergency oxygen cylinder",
            "Hotel/airport transfers (Arusha area)",
        ],
        "excluded": [
            "International flights",
            "Tanzania visa",
            "Travel and medical insurance (mandatory)",
            "Personal trekking gear",
            "Tips for guides and porters",
            "Hotel accommodation before/after trek",
            "Personal items and beverages",
        ],
        "packing_list": [
            "Layered clothing: moisture-wicking base, fleece mid-layer, waterproof shell",
            "Insulated jacket (temperatures drop to -5°C at summit)",
            "-10°C sleeping bag",
            "Broken-in trekking boots with ankle support",
            "Trekking poles (highly recommended)",
            "Headlamp with fresh batteries (essential for summit night)",
            "Sun protection: sunscreen SPF50+, UV sunglasses, sun hat",
            "2 x 1-litre water bottles or hydration bladder",
            "Personal first aid kit and any prescription medications",
            "Light daypack (porters carry main luggage)",
        ],
        "is_published": True,
    },
    {
        "name": "Momella Route – 4 Days",
        "slug": "meru-momella-4-days",
        "nickname": "The Acclimatisation Master",
        "nickname_explanation": "The 4-day Meru climb is the gold standard preparation for Kilimanjaro. The extra night at altitude dramatically increases your oxygen efficiency before tackling Africa's highest summit.",
        "mountain": "meru",
        "duration": "4 Days / 3 Nights",
        "difficulty": "Moderate–Challenging",
        "success_rate": "95%",
        "max_altitude": "4,566m",
        "distance": "~56 km round trip",
        "group_size": "1 – 10 people",
        "best_season": "Jun–Feb (avoid Mar–May rains)",
        "price": 1150.00,
        "short_description": "The 4-day Meru climb gives your body time to fully adapt at altitude before the summit push. Higher success rate, less fatigue, and the most rewarding wildlife experience on any Tanzanian mountain.",
        "full_description": (
            "For climbers planning to summit Kilimanjaro, the 4-day Mount Meru climb is the single best "
            "investment you can make. The extra acclimatisation night at Saddle Hut (3,566m) allows your "
            "body to significantly increase red blood cell production, boosting oxygen efficiency by an "
            "estimated 15–25% before you even set foot on Kilimanjaro.\n\n"
            "Beyond the physiological benefits, the slower pace turns this into a genuine wildlife "
            "expedition. You have time to explore the crater floor, observe the Ash Cone from multiple "
            "angles, and simply absorb the extraordinary isolation of this peak. The 4-day itinerary "
            "has a 95% summit success rate — among the highest of any high-altitude trek in Africa."
        ),
        "package_details": "Includes park fees, ranger fee, hut accommodation (Miriakamba, Saddle Hut x2), all meals on mountain, guide, porters, and airport/hotel transfers.",
        "requirements": "Suitable for first-time high-altitude trekkers. Good general fitness required. Particularly recommended as Kilimanjaro pre-acclimatisation.",
        "highlights": [
            "Extra acclimatisation night at Saddle Hut — higher summit success rate",
            "Full crater floor exploration on Day 3",
            "Armed park ranger wildlife escort throughout",
            "Best Kilimanjaro pre-climb preparation available",
            "Complete African wilderness experience with minimal crowds",
        ],
        "itinerary": [
            {"day": "Day 1", "title": "Momella Gate → Miriakamba Hut", "description": "Transfer to Momella Gate (1,524m). Through Ngurdoto Crater and Afromontane forest to Miriakamba Hut (2,514m). Wildlife-rich walk with potential sightings of buffalo, giraffe and colobus monkey. Distance: ~10 km.", "distance": "~10 km"},
            {"day": "Day 2", "title": "Miriakamba → Saddle Hut + Little Meru Acclimatisation", "description": "Steep ascent through heath and moorland to Saddle Hut (3,566m). Afternoon acclimatisation hike to Little Meru (3,820m). Sunset views across the Rift Valley. Distance: ~10 km.", "distance": "~10 km"},
            {"day": "Day 3", "title": "Rest & Acclimatisation Day — Crater Exploration", "description": "A crucial altitude adaptation day. Morning exploration of the inner crater floor and Ash Cone viewpoints. Afternoon rest. Your body uses this day to maximise oxygen efficiency. Distance: ~6 km easy.", "distance": "~6 km"},
            {"day": "Day 4", "title": "Summit Push → Full Descent → Arusha", "description": "Midnight departure along the crater rim to Socialist Peak (4,566m) for sunrise. Kilimanjaro visible above the cloud layer. Full descent to Momella Gate and transfer back to Arusha. Distance: ~20 km.", "distance": "~20 km"},
        ],
        "included": [
            "Arusha National Park entrance fees (4 days)",
            "Mandatory armed park ranger",
            "Certified mountain guide",
            "Porters (1 porter per climber)",
            "Miriakamba Hut x1 and Saddle Hut x2 accommodation",
            "All meals on mountain",
            "Emergency oxygen cylinder",
            "Hotel/airport transfers (Arusha area)",
        ],
        "excluded": [
            "International flights",
            "Tanzania visa",
            "Travel and medical insurance",
            "Personal trekking gear",
            "Tips for guides and porters",
            "Arusha hotel accommodation",
        ],
        "packing_list": [
            "Layered clothing system (base, fleece, waterproof shell)",
            "Insulated down jacket for summit night",
            "-10°C rated sleeping bag",
            "Broken-in trekking boots",
            "Trekking poles",
            "Headlamp and spare batteries",
            "Sunscreen, UV sunglasses, hat",
            "Water bottles or hydration bladder (2L minimum)",
            "Personal first aid kit",
        ],
        "is_published": True,
    },
]

# ─────────────────────────────────────────────────────────────────────────────
#  OL DOINYO LENGAI ROUTES
# ─────────────────────────────────────────────────────────────────────────────
LENGAI_ROUTES = [
    {
        "name": "Night Summit Trek",
        "slug": "lengai-night-summit-trek",
        "nickname": "The Midnight Volcano",
        "nickname_explanation": "Lengai is always climbed at night — the extreme midday heat on exposed black volcanic ash makes a daytime ascent dangerous. The summit at dawn is one of the most extraordinary experiences in Africa.",
        "mountain": "lengai",
        "duration": "1 Day",
        "difficulty": "Very Challenging",
        "success_rate": "82%",
        "max_altitude": "2,962m",
        "distance": "~10 km round trip",
        "group_size": "1 – 8 people",
        "best_season": "Jun–Feb (avoid long rains Apr–May)",
        "price": 480.00,
        "short_description": "Depart at midnight from Lake Natron. Climb through volcanic ash and ancient lava flows on a brutally steep gradient to reach the crater rim of Earth's only active carbonatite volcano at sunrise. Nothing prepares you for this.",
        "full_description": (
            "Ol Doinyo Lengai — the 'Mountain of God' in Maa — is unlike any other climb on Earth. "
            "This is the planet's only active carbonatite volcano, erupting natrocarbonatite lava so cool "
            "(~500°C) it appears black on the crater floor and turns blindingly white as it oxidises in air. "
            "The Maasai consider it the home of their supreme god Engai and approach it with deep reverence.\n\n"
            "The ascent begins at midnight from the Lake Natron camp. The gradient averages 45–60% — "
            "loose volcanic ash giving way to hardened lava flows and near-vertical gullies near the summit. "
            "There is no shade, no water source, and no gentle section. This is raw, demanding, and utterly "
            "unlike the managed experience of Kilimanjaro.\n\n"
            "The reward: standing at the crater rim as the first gold light floods the Great Rift Valley, "
            "watching Lake Natron turn crimson and pink beneath you while active lava flows glow in the "
            "crater below. A geological and spiritual wonder that very few humans ever witness."
        ),
        "package_details": "Includes Lake Natron camp accommodation (the night before), guide, climbing permit, and return transfer from Arusha.",
        "requirements": "High fitness level essential. Previous hiking experience required. Steep loose volcanic terrain demands agility and mental strength. Not suitable for beginners or those with knee problems.",
        "highlights": [
            "Only active carbonatite volcano on Earth",
            "Midnight ascent under a star-blanketed Rift Valley sky",
            "Crater rim sunrise over Lake Natron",
            "Active lava flows visible inside the crater",
            "Sacred site of the Maasai people",
            "Utterly unique volcanic landscape found nowhere else on the planet",
        ],
        "itinerary": [
            {"day": "Day 0 (Evening)", "title": "Arrive at Lake Natron Base Camp", "description": "Drive from Arusha (~4–5 hours via 4WD). Arrive Lake Natron camp in the afternoon. Briefing with your guide. Early dinner, gear check, and sleep. You will be woken at midnight.", "distance": "N/A"},
            {"day": "Night Ascent", "title": "Midnight Departure → Summit (2,962m)", "description": "Wake at 00:00. Headlamps on, depart the camp and begin the ascent through loose volcanic ash. The gradient steepens continuously. Your guide sets the pace. At Stella Point equivalent (~2,600m) the final gullies require hands-and-feet scrambling. Crater rim at approximately 05:30–06:00 — just as sunrise ignites the Rift Valley.", "distance": "~5 km ascent"},
            {"day": "Summit Day", "title": "Crater Rim → Descent → Lake Natron", "description": "Spend 20–30 minutes at the crater rim observing the active carbonatite field. Begin descent — significantly faster but hard on knees. Return to camp for breakfast. Depart for Arusha in the afternoon.", "distance": "~5 km descent"},
        ],
        "included": [
            "Ol Doinyo Lengai climbing permit",
            "Certified local guide (born in the Lake Natron area)",
            "Lake Natron camp accommodation (1 night pre-climb)",
            "Meals at camp (dinner, breakfast)",
            "Return 4WD transfers from Arusha",
        ],
        "excluded": [
            "International flights",
            "Tanzania visa",
            "Travel and medical insurance (mandatory)",
            "Personal headlamp, boots and trekking poles",
            "Tips for guide and camp staff",
            "Beverages beyond water",
        ],
        "packing_list": [
            "Strong headlamp with fresh batteries (absolutely essential)",
            "Trekking poles (highly recommended for loose ash descent)",
            "Trekking boots with ankle support — NOT sandals",
            "Gaiters to keep ash out of boots",
            "Light fleece or jacket (cool temperatures midnight to ~4am)",
            "Lightweight fast-dry trousers (NO shorts — volcanic ash is abrasive)",
            "High SPF sunscreen and UV sunglasses for descent in daylight",
            "3 litres water minimum",
            "High-energy snacks (gel packs, nuts, chocolate)",
            "Small backpack 15–20L",
        ],
        "is_published": True,
    },
    {
        "name": "Lengai & Lake Natron Discovery",
        "slug": "lengai-lake-natron-discovery",
        "nickname": "Volcano & Flamingo",
        "nickname_explanation": "Lake Natron, at the foot of Ol Doinyo Lengai, is the breeding ground for 75% of the world's lesser flamingos. The combination of active volcano at night and a million flamingos at dawn is one of Africa's great spectacles.",
        "mountain": "lengai",
        "duration": "2 Days",
        "difficulty": "Very Challenging",
        "success_rate": "82%",
        "max_altitude": "2,962m",
        "distance": "~20 km total",
        "group_size": "1 – 8 people",
        "best_season": "Jun–Feb",
        "price": 620.00,
        "short_description": "Combine the midnight Ol Doinyo Lengai summit with a Lake Natron flamingo walk — the single most dramatic 48 hours in Tanzania. Active volcano, sacred Maasai landscape, and a million pink flamingos.",
        "full_description": (
            "This 2-day package combines two of East Africa's most extraordinary natural experiences: "
            "the midnight ascent of Ol Doinyo Lengai and a guided walk to the flamingo flats of Lake Natron.\n\n"
            "Lake Natron is one of the most caustic lakes on Earth — its extreme alkalinity (pH 10.5) and "
            "red coloration from halobacteria make it appear like another planet. Yet it is the primary "
            "breeding ground for 2.5 million lesser flamingos, which nest on the soda flats during the "
            "season. Walking along the lakeshore at dawn with Lengai's smoke plume rising behind you is "
            "a photograph and a memory unlike anything else Africa offers.\n\n"
            "The package runs back-to-back: arrive at camp, summit at midnight, flamingo walk the following "
            "morning, then return to Arusha. Every hour is filled with something remarkable."
        ),
        "package_details": "Includes all summit package elements plus Lake Natron guided flamingo walk, camp accommodation x1 night, and 4WD transfers.",
        "requirements": "Same as Night Summit Trek — high fitness required. Flamingo walk is flat and easy.",
        "highlights": [
            "Ol Doinyo Lengai midnight summit ascent",
            "Active carbonatite lava flows at crater rim",
            "Lake Natron guided flamingo walk at dawn",
            "Up to 2.5 million lesser flamingos during breeding season",
            "Red and alien-looking Lake Natron landscape",
            "Complete Great Rift Valley wilderness experience",
        ],
        "itinerary": [
            {"day": "Day 1 (Afternoon)", "title": "Arusha → Lake Natron Camp", "description": "4WD transfer to Lake Natron (~4–5 hrs). Arrive camp, briefing, early dinner and rest. Midnight wake-up call.", "distance": "Transfer"},
            {"day": "Night", "title": "Midnight Summit Ascent → Crater Rim at Dawn", "description": "As per the Night Summit Trek. Midnight departure, summit at sunrise, descent to camp for breakfast.", "distance": "~10 km"},
            {"day": "Day 2 (Morning)", "title": "Lake Natron Flamingo Walk", "description": "After breakfast and a short rest, guided walk to the Lake Natron flamingo flats. Walk along the soda shore among thousands of lesser flamingos with Lengai's smoke plume behind you. Depart for Arusha midday, arriving late afternoon.", "distance": "~6 km easy"},
        ],
        "included": [
            "Ol Doinyo Lengai climbing permit",
            "Certified guide",
            "Lake Natron camp accommodation (1 night)",
            "All camp meals (dinner x1, breakfast x1, packed lunch x1)",
            "Lake Natron flamingo walk",
            "Return 4WD transfers from Arusha",
        ],
        "excluded": [
            "International flights and Tanzania visa",
            "Travel insurance (mandatory)",
            "Personal gear",
            "Tips",
            "Additional beverages",
        ],
        "packing_list": [
            "Headlamp (essential)",
            "Trekking boots and gaiters",
            "Trekking poles",
            "Warm layer for midnight start",
            "Light clothes for flamingo walk",
            "Sunscreen and hat",
            "Camera with long lens (for flamingos)",
            "3+ litres water capacity",
        ],
        "is_published": True,
    },
    {
        "name": "Sacred Volcano & Maasai Cultural Journey",
        "slug": "lengai-maasai-cultural-journey",
        "nickname": "The Full Rift Valley Immersion",
        "nickname_explanation": "This 3-day journey combines Africa's most dramatic volcano summit with authentic Maasai village immersion and the Engare Sero waterfall — delivering a complete cultural and natural experience of the southern Rift Valley.",
        "mountain": "lengai",
        "duration": "3 Days",
        "difficulty": "Challenging",
        "success_rate": "82%",
        "max_altitude": "2,962m",
        "distance": "~30 km total activities",
        "group_size": "1 – 8 people",
        "best_season": "Jun–Feb",
        "price": 850.00,
        "short_description": "Three days in the Great Rift Valley: summit the sacred volcano at midnight, walk among a million flamingos at Lake Natron, and spend an afternoon in a traditional Maasai boma. The most complete Lake Natron expedition available.",
        "full_description": (
            "Ol Doinyo Lengai sits at the intersection of Maasai spiritual life and some of East Africa's "
            "most spectacular natural phenomena. This 3-day package honours both dimensions fully.\n\n"
            "The Maasai boma visit on Day 2 is not a tourist performance — it is a genuine introduction "
            "to Maasai life facilitated through our long-standing relationship with communities around "
            "Lake Natron. You'll meet elders, learn about traditional cattle culture, participate in "
            "a brief jumping ceremony if invited, and understand why Lengai is so sacred to this people.\n\n"
            "The Engare Sero waterfall hike on Day 3 takes you to a hidden cascade tumbling from the "
            "Rift Valley escarpment into a green oasis — extraordinary contrast after the volcanic "
            "moonscape of the previous days. The famous Engare Sero footprint site, containing the oldest "
            "human footprints in East Africa (120,000 years old), is nearby.\n\n"
            "This is the definitive Lake Natron and Ol Doinyo Lengai expedition — nothing left out."
        ),
        "package_details": "Full expedition includes all meals, camp accommodation x2 nights, summit, flamingo walk, Maasai village visit, and Engare Sero hike with cultural guide.",
        "requirements": "Good fitness for volcano ascent. All other activities are easy to moderate.",
        "highlights": [
            "Ol Doinyo Lengai midnight summit and crater views",
            "Lake Natron flamingo flats — up to 2.5 million lesser flamingos",
            "Authentic Maasai boma visit and cultural exchange",
            "Engare Sero waterfall hike in the Rift Valley escarpment",
            "Site of 120,000-year-old human footprints",
            "Complete Great Rift Valley spiritual and natural experience",
        ],
        "itinerary": [
            {"day": "Day 1", "title": "Arusha → Lake Natron → Maasai Village Visit", "description": "Morning transfer from Arusha (4–5 hrs 4WD). Afternoon Maasai boma visit with cultural guide. Return to camp for dinner, briefing, and early rest. Midnight wake-up.", "distance": "Transfer + cultural visit"},
            {"day": "Night / Day 2 Morning", "title": "Midnight Summit Ascent + Flamingo Walk", "description": "Midnight departure for Ol Doinyo Lengai summit. Crater rim at sunrise. Descend to camp for breakfast. Short rest then guided Lake Natron flamingo walk along the soda shore. Return to camp, rest, light lunch.", "distance": "~10 km + ~6 km walk"},
            {"day": "Day 3", "title": "Engare Sero Waterfall & Footprints → Arusha", "description": "Morning hike to the Engare Sero waterfall (approx 3 hrs return). Optional stop at the ancient human footprint site. Packed lunch. Afternoon transfer back to Arusha, arriving evening.", "distance": "~8 km hike"},
        ],
        "included": [
            "Ol Doinyo Lengai climbing permit",
            "Certified mountain guide",
            "Cultural guide for Maasai visit",
            "Maasai community fee",
            "Lake Natron camp accommodation (2 nights)",
            "All meals at camp (2 dinners, 2 breakfasts, 2 packed lunches)",
            "Lake Natron flamingo walk",
            "Engare Sero waterfall entry fee",
            "Return 4WD transfers from Arusha",
        ],
        "excluded": [
            "International flights and Tanzania visa",
            "Travel and medical insurance (mandatory)",
            "Personal trekking gear",
            "Tips for guides and camp staff",
            "Personal gifts or purchases at Maasai village",
        ],
        "packing_list": [
            "Headlamp and trekking poles (essential for summit)",
            "Trekking boots and gaiters",
            "Light casual clothes for village visit (modest dress required)",
            "Swimwear and towel (waterfall optional swim)",
            "Sunscreen, hat, UV sunglasses",
            "Camera (long lens for flamingos strongly recommended)",
            "3+ litres water capacity",
            "Light backpack",
            "Small gift ideas for village (optional — ask us for guidance)",
        ],
        "is_published": True,
    },
]


async def seed():
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        seeded = 0
        skipped = 0
        for route_data in MERU_ROUTES + LENGAI_ROUTES:
            slug = route_data["slug"]
            existing = await db.execute(select(Route).where(Route.slug == slug))
            if existing.scalar_one_or_none():
                print(f"  SKIP  {slug}")
                skipped += 1
                continue
            route = Route(**route_data)
            db.add(route)
            print(f"  SEED  {slug}")
            seeded += 1
        await db.commit()
        print(f"\nDone — {seeded} routes seeded, {skipped} skipped.")


if __name__ == "__main__":
    asyncio.run(seed())
