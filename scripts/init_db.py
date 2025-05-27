#!/usr/bin/env python3
import asyncio
import os
import sys
from pathlib import Path

# Add the parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.db.session import initialize_database
from backend.app.db.seed import seed_database


async def init():
    """Initialize the database and seed it with sample data."""
    print("Initializing database...")
    await initialize_database()
    print("Database tables created!")

    print("Seeding database with sample data...")
    await seed_database()
    print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(init())
    print("Database initialization completed.")