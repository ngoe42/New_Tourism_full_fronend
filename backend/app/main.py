import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.responses import Response
from loguru import logger


class CachedStaticFiles(StaticFiles):
    """StaticFiles with long-lived Cache-Control headers for uploaded media."""
    async def get_response(self, path: str, scope) -> Response:
        response = await super().get_response(path, scope)
        if response.status_code == 200:
            response.headers["Cache-Control"] = "public, max-age=604800, immutable"  # 7 days
        return response

from app.core.config import settings
from app.core.cache import init_redis, close_redis
from app.core.limiter import limiter
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    app.state.admin_seed_task = asyncio.create_task(_seed_admin_background())
    await init_redis()
    yield
    seed_task = getattr(app.state, "admin_seed_task", None)
    if seed_task and not seed_task.done():
        seed_task.cancel()
    await close_redis()
    logger.info("Shutting down...")


async def _seed_admin():
    from app.core.database import AsyncSessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User, UserRole
    from app.repositories.user import UserRepository

    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        if not await repo.email_exists(settings.FIRST_ADMIN_EMAIL):
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                name="Admin",
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
            )
            await repo.create(admin)
            await db.commit()
            logger.info(f"Admin user created: {settings.FIRST_ADMIN_EMAIL}")


async def _seed_admin_background():
    try:
        await _seed_admin()
    except Exception:
        logger.exception("Admin seeding failed during startup; continuing so the app can serve health checks")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready API for Nelson Tour and Safari luxury travel platform",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global exception handler to ensure CORS headers on all errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router)

_uploads_dir = Path(__file__).resolve().parents[1] / "static" / "uploads"
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", CachedStaticFiles(directory=str(_uploads_dir)), name="uploads")


@app.get("/health", tags=["Health"])
async def health_check():
    from app.core.cache import _redis
    redis_status = "disabled"
    if _redis is not None:
        try:
            await _redis.ping()
            redis_status = "connected"
        except Exception:
            redis_status = "error"
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
        "redis": redis_status,
    }


@app.get("/debug/booking-test", tags=["Debug"])
async def debug_booking_test():
    """Temporary diagnostic — remove after fixing the 500."""
    import traceback
    from sqlalchemy import text, inspect as sa_inspect
    from app.core.database import AsyncSessionLocal

    results = {}

    # 1. Check DB connection
    try:
        async with AsyncSessionLocal() as db:
            row = await db.execute(text("SELECT 1"))
            results["db_connection"] = "ok"
    except Exception as e:
        results["db_connection"] = f"FAIL: {e}"
        return results

    # 2. Check alembic version
    try:
        async with AsyncSessionLocal() as db:
            row = await db.execute(text("SELECT version_num FROM alembic_version"))
            versions = [r[0] for r in row.fetchall()]
            results["alembic_versions"] = versions
    except Exception as e:
        results["alembic_versions"] = f"FAIL: {e}"

    # 3. Check bookings table schema (is user_id nullable?)
    try:
        async with AsyncSessionLocal() as db:
            row = await db.execute(text(
                "SELECT column_name, is_nullable, data_type "
                "FROM information_schema.columns "
                "WHERE table_name = 'bookings' AND column_name = 'user_id'"
            ))
            col = row.fetchone()
            results["user_id_column"] = {
                "column": col[0], "nullable": col[1], "type": col[2]
            } if col else "NOT FOUND"
    except Exception as e:
        results["user_id_column"] = f"FAIL: {e}"

    # 4. Check Pesapal config
    results["pesapal_key_set"] = bool(settings.PESAPAL_CONSUMER_KEY)
    results["pesapal_key_preview"] = (settings.PESAPAL_CONSUMER_KEY or "")[:5] + "..."
    results["pesapal_env"] = settings.PESAPAL_ENVIRONMENT
    results["backend_url"] = settings.BACKEND_URL

    # 5. Try a test booking insert + rollback
    try:
        from app.models.booking import Booking, BookingStatus
        from datetime import date
        async with AsyncSessionLocal() as db:
            test = Booking(
                user_id=None,
                tour_id=1,
                travel_date=date(2026, 1, 1),
                guests=1,
                total_price=100.0,
                status=BookingStatus.pending,
                contact_name="Test",
                contact_email="test@test.com",
            )
            db.add(test)
            await db.flush()
            results["test_insert_null_user"] = f"ok — id={test.id}"
            await db.rollback()
    except Exception as e:
        results["test_insert_null_user"] = f"FAIL: {traceback.format_exc()}"

    # 6. Check slowapi / limiter
    try:
        from app.core.limiter import _get_client_ip
        results["limiter_func"] = str(_get_client_ip)
    except Exception as e:
        results["limiter"] = f"FAIL: {e}"

    return results
