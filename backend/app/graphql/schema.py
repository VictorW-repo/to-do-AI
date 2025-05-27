from typing import AsyncGenerator, List, Optional

import strawberry
from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.types import Info

from app.core.deps import db_dependency
from app.db.models import TodoStatus as DBTodoStatus
from app.graphql.types import (
    CreateTodoInput,
    CreateTodoPayload,
    DeleteTodoPayload,
    ToggleTodoStatusPayload,
    Todo,
    TodoStatus,
    TodoStreamToken,
    TodoSuggestionPayload,
    UpdateTodoInput,
    UpdateTodoPayload,
)
from app.services.llm import LLMService
from app.services.todo import TodoService


async def get_db_from_info(info: Info) -> AsyncSession:
    """Extract DB session from GraphQL context"""
    db = info.context["db"]
    return db


async def get_user_id_from_info(info: Info) -> int:
    """Extract user ID from GraphQL context (for future auth)"""
    # This is a placeholder for future authentication
    # Currently returns a default user
    return 1


@strawberry.type
class Query:
    @strawberry.field
    async def todos(
        self, 
        info: Info, 
        include_completed: bool = True, 
        limit: int = 100, 
        offset: int = 0
    ) -> List[Todo]:
        """Get all todos for the current user"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        todo_service = TodoService(db)
        db_todos = await todo_service.get_todos(
            user_id=user_id,
            include_completed=include_completed,
            limit=limit,
            skip=offset,
        )
        
        return [Todo.from_db_model(todo) for todo in db_todos]

    @strawberry.field
    async def todo(self, info: Info, id: int) -> Optional[Todo]:
        """Get a specific todo by ID"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        todo_service = TodoService(db)
        db_todo = await todo_service.get_todo_by_id(todo_id=id, user_id=user_id)
        
        if not db_todo:
            return None
            
        return Todo.from_db_model(db_todo)


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_todo(
        self, info: Info, input: CreateTodoInput
    ) -> CreateTodoPayload:
        """Create a new todo"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        todo_service = TodoService(db)
        db_todo = await todo_service.create_todo(
            user_id=user_id,
            title=input.title,
            description=input.description,
            priority=input.priority,
            due_date=input.due_date,
            is_ai_generated=input.is_ai_generated,
        )
        
        # Don't close the session - let the middleware handle it
        
        return CreateTodoPayload(todo=Todo.from_db_model(db_todo))

    @strawberry.mutation
    async def update_todo(
        self, info: Info, input: UpdateTodoInput
    ) -> UpdateTodoPayload:
        """Update an existing todo"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        todo_service = TodoService(db)
        db_status = input.status.to_db_status() if input.status else None
        
        db_todo = await todo_service.update_todo(
            todo_id=input.id,
            user_id=user_id,
            title=input.title,
            description=input.description,
            status=db_status,
            priority=input.priority,
            due_date=input.due_date,
        )
        
        if not db_todo:
            return UpdateTodoPayload(todo=None)
            
        return UpdateTodoPayload(todo=Todo.from_db_model(db_todo))

    @strawberry.mutation
    async def toggle_todo_status(
        self, info: Info, id: int
    ) -> ToggleTodoStatusPayload:
        """Toggle the completion status of a todo"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        todo_service = TodoService(db)
        db_todo = await todo_service.toggle_todo_status(todo_id=id, user_id=user_id)
        
        if not db_todo:
            return ToggleTodoStatusPayload(todo=None)
            
        return ToggleTodoStatusPayload(todo=Todo.from_db_model(db_todo))

    @strawberry.mutation
    async def delete_todo(self, info: Info, id: int) -> DeleteTodoPayload:
        """Delete a todo"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        todo_service = TodoService(db)
        success = await todo_service.delete_todo(todo_id=id, user_id=user_id)
        
        return DeleteTodoPayload(success=success, id=id if success else None)
        
    @strawberry.mutation
    async def generate_todo_suggestion(self, info: Info) -> TodoSuggestionPayload:
        """Generate a todo suggestion based on existing todos"""
        db = await get_db_from_info(info)
        user_id = await get_user_id_from_info(info)
        
        # Get existing todos to provide context for generation
        todo_service = TodoService(db)
        existing_todos = await todo_service.get_todos(user_id=user_id, limit=10)
        
        # Set up LLM service for generation
        llm_service = LLMService()
        
        # Generate the suggestion (non-streaming)
        suggestion = await llm_service.generate_todo_suggestion(existing_todos, user_id)
        
        # Don't close the session - let the middleware handle it
        
        return TodoSuggestionPayload(suggestion=suggestion)


# Keep for backward compatibility but mark as deprecated
@strawberry.type
class Subscription:
    @strawberry.subscription
    async def generate_todo(self, info: Info) -> AsyncGenerator[TodoStreamToken, None]:
        """Subscribe to AI-generated todo suggestions (deprecated)"""
        # This method won't be called anymore, but keep it for compatibility
        raise NotImplementedError("Streaming is no longer supported")


# Create Strawberry schema
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
)