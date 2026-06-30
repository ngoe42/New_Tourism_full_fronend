from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,        # 3 containers × 8 workers × 8 = 192 connections
    max_overflow=3,     # keeps total per-worker under 8, all 24 workers under ~200
    pool_timeout=15,
    pool_recycle=1800,
    connect_args={
        "timeout": 10,            # asyncpg connection timeout (seconds)
        "command_timeout": 30,    # query timeout (seconds) — catches slow queries
    },
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
