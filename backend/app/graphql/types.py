from datetime import datetime
from enum import Enum
from typing import List, Optional

import strawberry
from strawberry.types import Info

from app.db.models import TodoStatus as DBTodoStatus


@strawberry.enum
class TodoStatus(Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    
    @classmethod
    def from_db_status(cls, db_status: DBTodoStatus) -> "TodoStatus":
        """Convert DB status to GraphQL enum"""
        if db_status == DBTodoStatus.PENDING:
            return TodoStatus.PENDING
        return TodoStatus.COMPLETED
    
    def to_db_status(self) -> DBTodoStatus:
        """Convert GraphQL enum to DB status"""
        if self == TodoStatus.PENDING:
            return DBTodoStatus.PENDING
        return DBTodoStatus.COMPLETED


@strawberry.type
class Todo:
    id: int
    title: str
    description: Optional[str]
    status: TodoStatus
    priority: int
    due_date: Optional[datetime]
    is_ai_generated: bool
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    @classmethod
    def from_db_model(cls, db_model) -> "Todo":
        """Convert from DB model to GraphQL type"""
        return cls(
            id=db_model.id,
            title=db_model.title,
            description=db_model.description,
            status=TodoStatus.from_db_status(db_model.status),
            priority=db_model.priority,
            due_date=db_model.due_date,
            is_ai_generated=db_model.is_ai_generated,
            created_at=db_model.created_at,
            updated_at=db_model.updated_at,
            completed_at=db_model.completed_at,
        )


@strawberry.input
class CreateTodoInput:
    title: str
    description: Optional[str] = None
    priority: int = 1
    due_date: Optional[datetime] = None
    is_ai_generated: bool = False


@strawberry.input
class UpdateTodoInput:
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TodoStatus] = None
    priority: Optional[int] = None
    due_date: Optional[datetime] = None


@strawberry.type
class CreateTodoPayload:
    todo: Todo


@strawberry.type
class UpdateTodoPayload:
    todo: Optional[Todo]


@strawberry.type
class DeleteTodoPayload:
    success: bool
    id: Optional[int]


@strawberry.type
class TodoStreamToken:
    token: str


@strawberry.type
class TodoSuggestionPayload:
    suggestion: str


@strawberry.type
class ToggleTodoStatusPayload:
    todo: Optional[Todo]