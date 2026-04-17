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
    from app.services.user_management import UserManagementService

    async with AsyncSessionLocal() as db:
        # Seed roles & permissions first
        await UserManagementService.seed_roles_and_permissions(db)
        await db.commit()

        repo = UserRepository(db)
        if not await repo.email_exists(settings.FIRST_ADMIN_EMAIL):
            from app.repositories.role import RoleRepository
            role_repo = RoleRepository(db)
            admin_role = await role_repo.get_by_name("Admin")
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                name="Admin",
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
                role_id=admin_role.id if admin_role else None,
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
