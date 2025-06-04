import argparse
import asyncio
from datetime import datetime, timedelta
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import Todo, TodoStatus, User
from app.db.session import SessionLocal, initialize_database

# Sample todo data
SAMPLE_TODOS = [
    {
        "title": "Complete project proposal",
        "description": "Draft the full proposal for the client project",
        "status": TodoStatus.PENDING,
        "priority": 3,
        "due_date": datetime.utcnow() + timedelta(days=2),
        "is_ai_generated": False,
    },
    {
        "title": "Review pull requests",
        "description": "Check team PRs and provide feedback",
        "status": TodoStatus.COMPLETED,
        "priority": 2,
        "due_date": datetime.utcnow() - timedelta(days=1),
        "is_ai_generated": False,
        "completed_at": datetime.utcnow() - timedelta(hours=2),
    },
    {
        "title": "Update documentation",
        "description": "Add API endpoints to the docs",
        "status": TodoStatus.PENDING,
        "priority": 1,
        "due_date": datetime.utcnow() + timedelta(days=5),
        "is_ai_generated": True,
    },
    {
        "title": "Schedule team meeting",
        "description": "Organize weekly sync with team",
        "status": TodoStatus.PENDING,
        "priority": 2,
        "due_date": None,
        "is_ai_generated": False,
    },
]


async def create_default_user(session: AsyncSession) -> User:
    """Create a default user if none exists"""
    result = await session.execute(select(User).filter(User.username == "demo_user"))
    user = result.scalars().first()

    if not user:
        user = User(
            username="demo_user",
            email="demo@example.com",
            # In production, this would be properly hashed
            hashed_password="$2b$12$CwY2zJvXjRgRA4/g1rCmNuJbVgveTGVZ84hG3Nn4axbUXHxPFqj2u",  # password: password123
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print("Created default user: demo_user")

    return user


async def create_sample_todos(
    session: AsyncSession, user_id: int, force: bool = False
) -> List[Todo]:
    """Create sample todo items for the user"""
    result = await session.execute(select(Todo).filter(Todo.user_id == user_id))
    existing_todos = result.scalars().all()

    if existing_todos and not force:
        print(f"Found {len(existing_todos)} existing todos. Skipping seed.")
        return existing_todos

    if force and existing_todos:
        for todo in existing_todos:
            await session.delete(todo)
        await session.commit()

    todos = []
    for todo_data in SAMPLE_TODOS:
        todo = Todo(user_id=user_id, **todo_data)
        session.add(todo)
        todos.append(todo)

    await session.commit()
    for todo in todos:
        await session.refresh(todo)
    print(f"Created {len(todos)} sample todos for user_id: {user_id}")
    return todos


async def seed_database(force: bool = False) -> None:
    """Initialize and seed the database with sample data"""
    await initialize_database()

    async with SessionLocal() as session:
        user = await create_default_user(session)
        await create_sample_todos(session, user.id, force=force)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the database with initial data")
    parser.add_argument(
        "--force", action="store_true", help="Force re-creation of sample data"
    )
    args = parser.parse_args()

    asyncio.run(seed_database(force=args.force))
    print("Database seeding completed.")
