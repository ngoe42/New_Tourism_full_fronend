"""
Update Mount Meru and Ol Doinyo Lengai route data with corrected/enriched details.
Run: docker exec karibu_api python update_mountain_routes.py
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.route import Route
from sqlalchemy import select

UPDATES = {
    # ── OL DOINYO LENGAI ────────────────────────────────────────────────────
    "lengai-night-summit-trek": {
        "max_altitude": "2,878m",
        "distance": "~8–10 km round trip",
        "duration": "1 Day (5–7 hrs ascent · 3–4 hrs descent)",
        "short_description": (
            "Depart at 1:00 AM from Engaresero village near Lake Natron. Climb the western flank on "
            "a brutally steep, switchback-free gradient of loose volcanic ash and ancient lava to reach "
            "the crater rim at sunrise. The only official summit route on Earth's only active carbonatite volcano."
        ),
        "full_description": (
            "Ol Doinyo Lengai — the 'Mountain of God' in Maa — has exactly one summit route: the Western Route "
            "ascending directly from the Engaresero area near Lake Natron. There are no switchbacks. "
            "The gradient runs at 45–60% virtually from base to rim, across loose volcanic ash that slides "
            "beneath your feet with every step. The final section narrows to a knife-edge ridge leading to "
            "the crater rim itself.\n\n"
            "All ascents begin at 1:00 AM. There are two practical reasons: the midday heat on exposed black "
            "volcanic ash is genuinely dangerous (surface temperatures can exceed 60°C), and a 1:00 AM start "
            "times the arrival at the crater rim precisely with sunrise — when the Rift Valley ignites with "
            "colour and Lake Natron turns crimson and pink below you.\n\n"
            "This is the planet's only active carbonatite volcano, erupting natrocarbonatite lava so cool "
            "(~500°C) it appears black when fluid and turns blindingly white as it oxidises in contact with "
            "air. Sacred to the Maasai as the home of their supreme god Engai, the mountain carries a "
            "spiritual weight that no photograph can fully convey. Standing at the crater rim at dawn, "
            "watching active lava glow in the crater below while the Rift Valley burns gold and pink around "
            "you — this is one of the most extraordinary experiences in all of East Africa."
        ),
        "package_details": (
            "Starting point: Engaresero village, Lake Natron (west side approach). "
            "Includes lake camp accommodation the night before, certified local guide, climbing permit, "
            "all meals at camp, and 4WD return transfers from Arusha (~4–5 hrs each way)."
        ),
        "requirements": (
            "High fitness level is essential. The ascent is 5–7 hours of non-stop steep climbing "
            "with no switchbacks on loose volcanic ash — no rest sections exist. Strong ankles, "
            "gaiters, and trekking poles are mandatory. Not suitable for beginners, those with "
            "knee problems, or anyone without prior trekking experience."
        ),
        "highlights": [
            "Earth's only active carbonatite volcano — a geological phenomenon found nowhere else",
            "Western Route: direct ascent from Engaresero, Lake Natron (the only summit route)",
            "1:00 AM midnight start — arrive at crater rim exactly at sunrise",
            "Loose volcanic ash, no switchbacks — extremely steep and raw",
            "Final ridge section to the crater rim with active lava visible below",
            "Rift Valley and Lake Natron panorama at dawn",
            "Sacred Maasai site — the home of Engai, god of the Maasai",
        ],
        "itinerary": [
            {
                "day": "Day 0 (Evening)",
                "title": "Arusha → Engaresero Camp, Lake Natron",
                "description": (
                    "4WD transfer from Arusha to Engaresero village near Lake Natron (~4–5 hours). "
                    "Arrive camp in the afternoon. Briefing with your guide: route overview, gear check, "
                    "safety protocols. Early dinner at 6:00 PM. Sleep by 8:00 PM. "
                    "Wake-up call at 00:30."
                ),
                "distance": "Transfer only",
            },
            {
                "day": "Night Ascent (01:00 AM)",
                "title": "Western Route — Engaresero → Crater Rim (2,878m)",
                "description": (
                    "Depart Engaresero at 1:00 AM. The trail begins immediately steep on loose volcanic "
                    "ash — there are no switchbacks and no flat sections. The entire ascent is direct. "
                    "The gradient steepens progressively from base through the mid-mountain ash fields "
                    "to the exposed upper lava flows. The final kilometre follows a narrow ridge to the "
                    "crater rim. Expect 5–7 hours total. Arrive at the crater rim at approximately "
                    "06:00–08:00, timed for sunrise over the Rift Valley."
                ),
                "distance": "~4–5 km ascent · +2,878m altitude",
            },
            {
                "day": "Summit Morning",
                "title": "Crater Rim Observation → Descent → Camp",
                "description": (
                    "Spend 20–30 minutes at the crater rim. Observe the active carbonatite lava field "
                    "below — black when molten, turning white as it cools and oxidises. The Rift Valley "
                    "and Lake Natron spread out below you in full sunrise colour. Begin descent on the "
                    "same western route — 3–4 hours down on loose ash (poles are essential). "
                    "Return to Engaresero camp for breakfast, then drive back to Arusha."
                ),
                "distance": "~4–5 km descent",
            },
        ],
    },

    "lengai-lake-natron-discovery": {
        "max_altitude": "2,878m",
        "distance": "~18 km total",
        "short_description": (
            "The definitive 2-day Rift Valley experience: midnight ascent of Ol Doinyo Lengai from "
            "Engaresero on the only official western route, followed by a guided walk among a million "
            "lesser flamingos on the soda flats of Lake Natron."
        ),
        "full_description": (
            "This 2-day package combines two of East Africa's most extraordinary natural spectacles: "
            "the midnight western route ascent of Ol Doinyo Lengai (2,878m) and a guided walk to the "
            "flamingo flats of Lake Natron.\n\n"
            "The volcano ascent departs at 1:00 AM from Engaresero — the only starting point for the "
            "single official summit route. The western flank is switchback-free, climbing directly "
            "on loose volcanic ash at gradients up to 60%. No other summit route exists on Lengai; "
            "this is the only way up.\n\n"
            "Lake Natron is one of the most caustic lakes on Earth (pH 10.5), its surface coloured "
            "red by halobacteria. Yet it is the primary breeding ground for 2.5 million lesser flamingos. "
            "Walking the soda shore the morning after your summit — Lengai's plume rising behind you, "
            "flamingos stretching to the horizon — is an image that defines the Great Rift Valley."
        ),
        "package_details": (
            "Starting point: Engaresero, Lake Natron (west side of Lengai). "
            "Includes camp accommodation x1 night, certified guide, climbing permit, flamingo walk, "
            "all camp meals, 4WD return transfers from Arusha."
        ),
        "highlights": [
            "Western Route midnight ascent from Engaresero — the only summit route on Lengai",
            "Crater rim at sunrise: active lava, Rift Valley panorama, Lake Natron below",
            "Lake Natron flamingo walk — up to 2.5 million lesser flamingos",
            "Alien red soda lake landscape with Lengai's smoke plume as backdrop",
            "Complete Rift Valley wilderness experience in 48 hours",
        ],
        "itinerary": [
            {
                "day": "Day 1 (Afternoon)",
                "title": "Arusha → Engaresero Camp, Lake Natron",
                "description": (
                    "4WD transfer to Engaresero camp near Lake Natron (~4–5 hrs). "
                    "Arrive, rest, briefing, early dinner. Sleep by 8:00 PM. "
                    "Wake-up call at 00:30 for the summit start."
                ),
                "distance": "Transfer",
            },
            {
                "day": "Night / Day 2 Morning",
                "title": "1:00 AM Western Route Summit → Crater Rim at Dawn",
                "description": (
                    "Depart Engaresero at 1:00 AM. Direct western ascent on loose volcanic ash — "
                    "no switchbacks, no flat sections. 5–7 hours of sustained steep climbing. "
                    "Summit crater rim at sunrise (2,878m). Observe active carbonatite lava. "
                    "Descend 3–4 hours. Return to camp for breakfast."
                ),
                "distance": "~8–10 km",
            },
            {
                "day": "Day 2 (Late Morning)",
                "title": "Lake Natron Flamingo Walk → Arusha",
                "description": (
                    "After breakfast and rest, guided walk along the Lake Natron soda shore among "
                    "thousands of lesser flamingos with Lengai's steam plume rising behind you. "
                    "Depart for Arusha midday, arriving late afternoon."
                ),
                "distance": "~6–8 km easy walk",
            },
        ],
    },

    "lengai-maasai-cultural-journey": {
        "max_altitude": "2,878m",
        "distance": "~30 km total activities",
        "short_description": (
            "Three days in the Great Rift Valley: midnight western route summit of Ol Doinyo Lengai "
            "from Engaresero, a million flamingos on Lake Natron, authentic Maasai boma visit, and "
            "the Engare Sero waterfall and ancient human footprints. The complete Lengai expedition."
        ),
        "full_description": (
            "This 3-day package delivers the full Ol Doinyo Lengai and Lake Natron experience. "
            "The mountain itself has only one summit route — the western flank from Engaresero — "
            "ascending directly without switchbacks on loose volcanic ash to the crater rim at 2,878m. "
            "Start time is always 1:00 AM to avoid the extreme midday heat on exposed black ash.\n\n"
            "The Maasai boma visit on Day 1 is not a tourist performance. Lengai sits at the centre "
            "of Maasai spiritual life — it is the home of Engai, their supreme god. The communities "
            "around Lake Natron have a deep and living relationship with the mountain. Our cultural "
            "guide facilitates a genuine introduction to this world: elders, cattle culture, "
            "traditional ceremony.\n\n"
            "The Engare Sero waterfall hike on Day 3 leads to a hidden cascade in the Rift Valley "
            "escarpment, near the site of the oldest human footprints in East Africa (120,000 years)."
        ),
        "package_details": (
            "Starting point: Engaresero, Lake Natron (west side of Lengai). "
            "Full expedition includes camp x2 nights, all meals, summit, flamingo walk, "
            "Maasai village, Engare Sero hike, and 4WD return transfers from Arusha."
        ),
    },

    # ── MOUNT MERU ──────────────────────────────────────────────────────────
    "meru-momella-3-days": {
        "distance": "~45 km total",
        "short_description": (
            "A fast-paced 3-day ascent via the Momella Route from Momella Gate (east side) inside "
            "Arusha National Park. Through wildlife-rich forest and moorland, past crater walls, "
            "up Rhino Point to the knife-edge summit ridge — and Kilimanjaro floating above the "
            "clouds from Socialist Peak (4,566m)."
        ),
        "full_description": (
            "Mount Meru's one official route — the Momella Route — begins at Momella Gate on the "
            "east side of Arusha National Park. It is the only permitted climbing route on the mountain. "
            "The trail rises through genuine African wildlife habitat: Afromontane forest alive with "
            "colobus monkeys, hornbills, and sunbirds; open moorland shared with buffalo, giraffe, "
            "and elephant; then the dramatic inner crater wall and upper alpine ridge.\n\n"
            "The route flows from Momella Gate (1,524m) through the forest to Miriakamba Hut (2,514m), "
            "then up through heath and moorland to Saddle Hut (3,566m). The summit push follows the "
            "crater rim via Rhino Point (3,800m) along a narrow ridge — the most technically exposed "
            "section on any standard East African trekking peak — before reaching Socialist Peak (4,566m).\n\n"
            "An armed park ranger accompanies every team throughout — not ceremony but genuine wildlife "
            "management. This transforms the lower sections into a walking safari unlike anything else "
            "in high-altitude trekking. From the summit at dawn, Kilimanjaro's glaciated dome rises "
            "above the cloudscape — one of East Africa's defining panoramas."
        ),
        "package_details": (
            "Route: Momella Gate (east side) → Miriakamba Hut → Saddle Hut → Rhino Point → Socialist Peak → descent. "
            "Includes park fees, mandatory armed ranger, guide, porters, hut accommodation, all mountain meals, "
            "and Arusha transfers."
        ),
        "itinerary": [
            {
                "day": "Day 1",
                "title": "Momella Gate (1,524m) → Miriakamba Hut (2,514m)",
                "description": (
                    "Transfer to Momella Gate on the east side of Arusha National Park. Register, "
                    "meet your armed park ranger and mountain crew. Descend into the Ngurdoto Crater "
                    "area before ascending through dense Afromontane forest. Wildlife sightings common "
                    "— giraffe and colobus monkey are frequent companions. Arrive Miriakamba Hut for "
                    "dinner and overnight."
                ),
                "distance": "~10 km · +990m ascent",
            },
            {
                "day": "Day 2",
                "title": "Miriakamba Hut (2,514m) → Saddle Hut (3,566m) + Little Meru (3,820m)",
                "description": (
                    "Steep ascent through open heath and moorland. Buffalo and elephant sometimes "
                    "visible on this section. Arrive Saddle Hut (3,566m) for lunch. Afternoon "
                    "acclimatisation hike to Little Meru (3,820m) — panoramic views across the "
                    "Rift Valley and first sight of Kilimanjaro on the horizon. Return to Saddle "
                    "Hut for dinner and overnight."
                ),
                "distance": "~10 km · +1,300m ascent",
            },
            {
                "day": "Day 3",
                "title": "Summit Push (00:00) → Rhino Point → Socialist Peak (4,566m) → Momella Gate",
                "description": (
                    "Wake at midnight. Follow the crater rim trail to Rhino Point (3,800m), "
                    "then traverse the exposed summit ridge — the most technically demanding "
                    "section of the climb — to Socialist Peak (4,566m). Arrive at sunrise to "
                    "find Kilimanjaro's snow dome burning above the cloud layer. Descend the "
                    "full route back to Momella Gate (3–4 hours). Transfer to Arusha."
                ),
                "distance": "~25 km · +1,000m / -3,000m",
            },
        ],
    },

    "meru-momella-4-days": {
        "distance": "~45 km total",
        "short_description": (
            "The 4-day Momella Route from Momella Gate — the gold standard for Kilimanjaro "
            "acclimatisation. An extra altitude night at Saddle Hut (3,566m) gives your body time "
            "to adapt before the Rhino Point ridge push to Socialist Peak (4,566m). 95% summit rate."
        ),
        "full_description": (
            "Meru has one official climbing route: the Momella Route from Momella Gate (east side). "
            "The 4-day schedule adds an acclimatisation day at Saddle Hut (3,566m), which is the "
            "single most effective physiological preparation available before attempting Kilimanjaro.\n\n"
            "The route flows: Momella Gate (1,524m) → Miriakamba Hut (2,514m) → Saddle Hut (3,566m) "
            "x2 nights → crater rim via Rhino Point (3,800m) → Socialist Peak (4,566m) → descent. "
            "The summit ridge from Rhino Point is the most exposed section: a narrow volcanic traverse "
            "with vertical drops on the inner crater side.\n\n"
            "An armed park ranger escorts every team throughout — TANAPA regulation because Arusha "
            "National Park's resident wildlife (buffalo, elephant, giraffe) actively uses the trail "
            "corridor. The extra day also allows crater floor exploration and full appreciation of "
            "Meru's extraordinary inner landscape before the summit push."
        ),
        "package_details": (
            "Route: Momella Gate (east) → Miriakamba Hut → Saddle Hut (x2 nights) → Rhino Point → "
            "Socialist Peak → descent. Includes park fees, mandatory armed ranger, guide, porters, "
            "all hut accommodation, all mountain meals, and Arusha transfers."
        ),
        "itinerary": [
            {
                "day": "Day 1",
                "title": "Momella Gate (1,524m) → Miriakamba Hut (2,514m)",
                "description": (
                    "Transfer to Momella Gate, east side of Arusha National Park. Meet your "
                    "armed ranger and mountain crew. Ascend through Afromontane forest with "
                    "regular wildlife — giraffe, colobus monkey, buffalo. Arrive Miriakamba "
                    "Hut for dinner and overnight."
                ),
                "distance": "~10 km · +990m",
            },
            {
                "day": "Day 2",
                "title": "Miriakamba (2,514m) → Saddle Hut (3,566m) + Little Meru (3,820m)",
                "description": (
                    "Steep ascent through heath moorland. Afternoon acclimatisation hike to "
                    "Little Meru summit (3,820m). First clear views of Kilimanjaro. "
                    "Return to Saddle Hut for dinner and overnight."
                ),
                "distance": "~10 km · +1,300m",
            },
            {
                "day": "Day 3",
                "title": "Acclimatisation Day — Crater Floor & Ash Cone",
                "description": (
                    "A full day at altitude for physiological adaptation. Morning guided walk "
                    "into the inner crater, exploring the Ash Cone and crater floor formations. "
                    "Afternoon rest at Saddle Hut. Your body uses this day to maximise red blood "
                    "cell production before the summit push."
                ),
                "distance": "~6 km easy",
            },
            {
                "day": "Day 4",
                "title": "Summit Push (00:00) → Rhino Point → Socialist Peak (4,566m) → Momella Gate",
                "description": (
                    "Midnight departure. Follow the crater rim to Rhino Point (3,800m), then "
                    "traverse the narrow exposed summit ridge to Socialist Peak (4,566m). "
                    "Arrive at sunrise with Kilimanjaro above the clouds. Full descent to "
                    "Momella Gate. Transfer to Arusha."
                ),
                "distance": "~25 km · +1,000m / -3,000m",
            },
        ],
    },
}


async def update():
    async with AsyncSessionLocal() as db:
        updated = 0
        for slug, changes in UPDATES.items():
            result = await db.execute(select(Route).where(Route.slug == slug))
            route = result.scalar_one_or_none()
            if not route:
                print(f"  MISS  {slug} (not found)")
                continue
            for field, value in changes.items():
                setattr(route, field, value)
            print(f"  UPDATE {slug}")
            updated += 1
        await db.commit()
        print(f"\nDone — {updated} routes updated.")


if __name__ == "__main__":
    asyncio.run(update())
