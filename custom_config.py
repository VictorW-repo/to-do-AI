from typing import Any, Dict, List, Optional, Union
import json

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo AI"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration with default value
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://frontend:3000"]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        # If it's already a list, return it
        if isinstance(v, list):
            return v
        # If it's an empty string or None, return default list
        if not v:
            return ["http://localhost:3000", "http://localhost:8000", "http://frontend:3000"]
        # If it's a string but not JSON, split by comma
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        # If it's a string that might be JSON, try to parse it, but return default on error
        try:
            if isinstance(v, str):
                return json.loads(v)
        except:
            return ["http://localhost:3000", "http://localhost:8000", "http://frontend:3000"]
        # Default fallback
        return ["http://localhost:3000", "http://localhost:8000", "http://frontend:3000"]

    # Database configuration
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "app"
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="after")
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=values.data.get("POSTGRES_USER"),
            password=values.data.get("POSTGRES_PASSWORD"),
            host=values.data.get("POSTGRES_SERVER"),
            path=f"{values.data.get('POSTGRES_DB') or ''}",
        )
    
    # Fallback to SQLite for local development - set default to True
    USE_SQLITE: bool = True
    SQLITE_DB_FILE: str = "todos.db"
    
    # OpenAI configuration with default API key
    OPENAI_API_KEY: str = "sk-dummy-key-for-development"
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_TIMEOUT: int = 60

    # GraphQL configuration
    GRAPHQL_PATH: str = "/graphql"
    GRAPHQL_SUBSCRIPTION_PATH: str = "/graphql/ws"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)


settings = Settings()