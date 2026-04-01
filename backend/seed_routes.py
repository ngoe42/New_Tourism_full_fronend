import asyncio
from app.core.database import AsyncSessionLocal
from app.models.route import Route

routes_data = [
    {
        "name": "Machame Route",
        "slug": "machame-route",
        "nickname": "Whiskey Route",
        "nickname_explanation": "Known as the 'Whiskey Route' because it is considered tougher and more challenging than the 'Coca-Cola' (Marangu) route, requiring better acclimatization.",
        "short_description": "The most popular route on Kilimanjaro. It offers stunning scenery and high success rates due to its 'walk high, sleep low' profile.",
        "full_description": "The Machame Route is widely considered the most beautiful route up Mount Kilimanjaro. The trek begins in the lush rainforests of the mountain's lower slopes and steadily ascends through heath, moorland, and alpine desert zones before reaching the arctic conditions at the summit. The route is physically demanding but offers excellent acclimatization opportunities.",
        "duration": "6-7 Days",
        "difficulty": "Challenging",
        "requirements": "Good physical fitness, basic trekking gear, sleeping bag (-15°C).",
        "price": 1850.00,
        "package_details": "Includes park fees, camping fees, rescue fees, professional English-speaking guide, porters, cook, 3 meals a day while on the mountain, and camping equipment."
    },
    {
        "name": "Marangu Route",
        "slug": "marangu-route",
        "nickname": "Coca-Cola Route",
        "nickname_explanation": "Dubbed the 'Coca-Cola Route' as it is considered the easiest path, traditionally offering Coca-Cola for sale at the huts along the way.",
        "short_description": "The oldest and most established route. It is the only route that offers hut accommodation instead of camping.",
        "full_description": "The Marangu Route is a classic trek on Mount Kilimanjaro. It is the oldest, most well-established route. Many favor the Marangu route because it is considered to be the easiest path on the mountain, given its gradual slope. It is also the only route which offers sleeping huts in dormitory style accommodations.",
        "duration": "5-6 Days",
        "difficulty": "Moderate",
        "requirements": "Moderate fitness, basic trekking gear.",
        "price": 1700.00,
        "package_details": "Includes park fees, hut fees, rescue fees, professional guide, porters, cook, and 3 meals a day. No camping equipment required."
    },
    {
        "name": "Lemosho Route",
        "slug": "lemosho-route",
        "nickname": None,
        "nickname_explanation": None,
        "short_description": "Considered the most beautiful route on Kilimanjaro with panoramic views on various sides of the mountain.",
        "full_description": "The Lemosho Route is one of the newer routes on Mount Kilimanjaro. The route begins in the west and rather than simply intersecting Shira Plateau, Lemosho crosses it from Shira Ridge to Shira Camp. Climbers encounter low traffic until the route joins the Machame route. It offers incredible scenery and a very high success rate.",
        "duration": "7-8 Days",
        "difficulty": "Challenging",
        "requirements": "Good physical fitness, camping gear, sleeping bag (-15°C).",
        "price": 2100.00,
        "package_details": "Includes park fees, camping fees, rescue fees, professional guide, porters, cook, 3 meals a day, and high-quality camping equipment."
    },
    {
        "name": "Rongai Route",
        "slug": "rongai-route",
        "nickname": None,
        "nickname_explanation": None,
        "short_description": "The only route that approaches Kilimanjaro from the north. It is remote, wild, and retains a sense of untouched wilderness.",
        "full_description": "The Rongai route approaches Kilimanjaro from the north, close to the Kenyan border. It is less crowded than most other routes and passes through true wilderness areas. The descent is via the Marangu route, meaning you get to see both sides of the mountain. It is a good choice for the rainy season as the north side gets less precipitation.",
        "duration": "6-7 Days",
        "difficulty": "Moderate to Challenging",
        "requirements": "Good fitness, camping gear.",
        "price": 1950.00,
        "package_details": "Includes transport to the remote northern gate, park fees, camping fees, guide, porters, cook, and camping equipment."
    },
    {
        "name": "Umbwe Route",
        "slug": "umbwe-route",
        "nickname": None,
        "nickname_explanation": None,
        "short_description": "The steepest, shortest, and most direct route to the summit. Recommended only for experienced trekkers.",
        "full_description": "The Umbwe Route is known for its caves and is the steepest, shortest, and most direct route to Uhuru Peak. Due to its fast ascent, it does not provide the necessary stages for altitude acclimatization. Therefore, the success rate is low. It is a very taxing route, suitable only for those with prior experience climbing at high altitudes.",
        "duration": "6 Days",
        "difficulty": "Very Challenging",
        "requirements": "Excellent fitness, previous high-altitude experience, premium cold-weather gear.",
        "price": 1900.00,
        "package_details": "Includes park fees, camping fees, professional guide, porters, cook, and camping equipment."
    },
    {
        "name": "Northern Circuit Route",
        "slug": "northern-circuit-route",
        "nickname": None,
        "nickname_explanation": None,
        "short_description": "The longest route, offering the highest success rate and a 360-degree view of the mountain.",
        "full_description": "The Northern Circuit is the newest and longest route on Mount Kilimanjaro. It begins in the west at the Lemosho gate, but instead of traversing the southern face, it heads north, circling the main peak before approaching the summit from the east. It offers nearly 360-degree views, very low traffic, and the best acclimatization profile of all routes.",
        "duration": "9 Days",
        "difficulty": "Challenging",
        "requirements": "Excellent stamina, camping gear, sleeping bag (-15°C).",
        "price": 2400.00,
        "package_details": "Includes extended park fees, camping fees, rescue fees, professional guide, porters, cook, 3 meals a day, and all camping equipment."
    }
]

async def seed_routes():
    async with AsyncSessionLocal() as session:
        for data in routes_data:
            from sqlalchemy import select
            query = select(Route).where(Route.slug == data["slug"])
            result = await session.execute(query)
            existing = result.scalar_one_or_none()
            
            if not existing:
                route = Route(**data)
                session.add(route)
        
        await session.commit()
        print("Routes seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_routes())
