from typing import AsyncGenerator, Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async SQLAlchemy session
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        await session.close()


class DatabaseDependency:
    """Class-based dependency that can be used in GraphQL resolvers"""
    
    def __init__(self):
        self.db: Optional[AsyncSession] = None
    
    async def __call__(self) -> AsyncGenerator[AsyncSession, None]:
        session = SessionLocal()
        self.db = session
        try:
            yield self.db
        finally:
            await session.close()
            self.db = None


# Create a reusable database dependency
db_dependency = DatabaseDependency()


# For possible future authentication
async def get_current_user():
    """
    Stub for future authentication implementation
    Currently returns a default user
    """
    # This is a placeholder for future authentication
    return {"id": 1, "username": "default_user"}


# Health check dependency
async def check_health() -> bool:
    """
    Dependency for health check
    """
    # We could add more comprehensive health checks here
    # For example, checking database connectivity
    return True