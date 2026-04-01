import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.core.config import settings
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    app.state.admin_seed_task = asyncio.create_task(_seed_admin_background())
    yield
    seed_task = getattr(app.state, "admin_seed_task", None)
    if seed_task and not seed_task.done():
        seed_task.cancel()
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

_allowed_origins = settings.get_allowed_origins()
_allow_wildcard = settings.DEBUG or _allowed_origins == ["*"]
_cors_origins = ["*"] if _allow_wildcard else _allowed_origins
_cors_credentials = not _allow_wildcard

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_cors_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

_uploads_dir = Path(__file__).resolve().parents[2] / "static" / "uploads"
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION, "app": settings.APP_NAME}
