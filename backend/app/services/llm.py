import httpx
from typing import List, Optional

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.models import Todo


class TodoSuggestion(BaseModel):
    """Model for OpenAI API to generate structured todo suggestions"""
    title: str = Field(..., description="The title of the todo item")
    description: Optional[str] = Field(None, description="A detailed description of the todo")
    priority: int = Field(
        1, description="Priority from 1 (lowest) to 3 (highest)", ge=1, le=3
    )


class LLMService:
    """Service for interacting with OpenAI API"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.timeout = settings.OPENAI_TIMEOUT

    async def generate_todo_suggestion(
        self, existing_todos: List[Todo], user_id: int
    ) -> str:
        """Generate a todo suggestion based on existing todos - no streaming"""
        # Generate the system message with context from existing todos
        system_message = self._create_system_message(existing_todos)
        
        try:
            # Call the OpenAI API without streaming
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": "Generate a new todo suggestion."},
                ],
                temperature=0.7,
                max_tokens=150,
                stream=False,
            )
            
            # Return the complete generated text
            return response.choices[0].message.content
            
        except httpx.HTTPStatusError as e:
            error_message = f"OpenAI API error: {str(e)}"
            return f"Error: {error_message}"
        
        except Exception as e:
            error_message = f"Unexpected error: {str(e)}"
            return f"Error: {error_message}"

    def _create_system_message(self, existing_todos: List[Todo]) -> str:
        """Create a system message with context from existing todos"""
        # Format existing todos as context
        todo_context = "\n".join(
            [
                f"- {todo.title}" + (f": {todo.description}" if todo.description else "")
                for todo in existing_todos[-5:]  # Use the 5 most recent todos
            ]
        )
        
        return (
            "You are an intelligent todo list assistant. Your job is to suggest a relevant "
            "new todo item based on the user's existing todos.\n\n"
            f"Here are the user's recent todos:\n{todo_context}\n\n"
            "Generate a single, specific, actionable todo item that would be relevant "
            "to add to this list. The suggestion should be coherent with the existing "
            "todos and provide value to the user. Keep the title brief (under 10 words) "
            "and give a short but helpful description.\n\n"
            "Format your response as a natural suggestion starting with a phrase like "
            "'How about...' or 'Consider adding...' followed by the todo item. "
            "Don't use JSON or structured format, just natural text."
        )