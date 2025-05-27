import contextlib
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# SQLAlchemy Base class for declarative models
Base = declarative_base()

# Create async engine
if settings.USE_SQLITE:
    SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///./{settings.SQLITE_DB_FILE}"
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_async_engine(
        str(settings.SQLALCHEMY_DATABASE_URI),
        echo=False,
        future=True,
        pool_pre_ping=True,
    )

# Create async session factory
SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Context manager for getting a connection to use in initialization scripts
@contextlib.asynccontextmanager
async def get_connection() -> AsyncGenerator[AsyncConnection, None]:
    """
    Async context manager for getting a connection
    """
    async with engine.begin() as connection:
        yield connection


# Initialize the database tables
async def initialize_database() -> None:
    """
    Create all tables in the database
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)