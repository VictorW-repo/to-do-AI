from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Todo, TodoStatus


class TodoService:
    """Service for todo CRUD operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_todos(
        self, user_id: int, skip: int = 0, limit: int = 100, include_completed: bool = True
    ) -> List[Todo]:
        """Get all todos for a user"""
        query = select(Todo).filter(Todo.user_id == user_id).order_by(Todo.priority.desc(), Todo.created_at.desc())
        
        if not include_completed:
            query = query.filter(Todo.status != TodoStatus.COMPLETED)
            
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_todo_by_id(self, todo_id: int, user_id: int) -> Optional[Todo]:
        """Get a specific todo by ID for a user"""
        query = select(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create_todo(
        self,
        user_id: int,
        title: str,
        description: Optional[str] = None,
        priority: int = 1,
        due_date: Optional[datetime] = None,
        is_ai_generated: bool = False,
    ) -> Todo:
        """Create a new todo for a user"""
        todo = Todo(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            is_ai_generated=is_ai_generated,
        )
        self.db.add(todo)
        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def update_todo(
        self,
        todo_id: int,
        user_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[TodoStatus] = None,
        priority: Optional[int] = None,
        due_date: Optional[datetime] = None,
    ) -> Optional[Todo]:
        """Update a todo for a user"""
        todo = await self.get_todo_by_id(todo_id, user_id)
        if not todo:
            return None

        if title is not None:
            todo.title = title
        if description is not None:
            todo.description = description
        if status is not None:
            todo.status = status
            if status == TodoStatus.COMPLETED:
                todo.completed_at = datetime.utcnow()
            else:
                todo.completed_at = None
        if priority is not None:
            todo.priority = priority
        if due_date is not None:
            todo.due_date = due_date

        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def toggle_todo_status(self, todo_id: int, user_id: int) -> Optional[Todo]:
        """Toggle the completion status of a todo"""
        todo = await self.get_todo_by_id(todo_id, user_id)
        if not todo:
            return None

        if todo.status == TodoStatus.PENDING:
            todo.status = TodoStatus.COMPLETED
            todo.completed_at = datetime.utcnow()
        else:
            todo.status = TodoStatus.PENDING
            todo.completed_at = None

        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def delete_todo(self, todo_id: int, user_id: int) -> bool:
        """Delete a todo for a user"""
        todo = await self.get_todo_by_id(todo_id, user_id)
        if not todo:
            return False

        await self.db.delete(todo)
        await self.db.commit()
        return True