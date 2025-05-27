# ===== Build Stage =====
FROM python:3.9-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       curl \
       build-essential \
       libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry==1.6.1

# Copy poetry configuration files
COPY backend/pyproject.toml backend/poetry.lock* /app/

# Configure poetry to not create a virtual environment
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi


# ===== Runtime Stage =====
FROM python:3.9-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq5 \
       curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create scripts package with __init__.py
RUN mkdir -p /app/scripts
RUN touch /app/scripts/__init__.py

# Create backend structure
RUN mkdir -p /app/backend/app/core

# Create a fixed config file directly in the image
RUN echo "from typing import Any, Dict, List, Optional, Union\nimport json\n\nfrom pydantic import PostgresDsn, field_validator\nfrom pydantic_settings import BaseSettings, SettingsConfigDict\nfrom dotenv import load_dotenv\nload_dotenv()\n\n\nclass Settings(BaseSettings):\n    PROJECT_NAME: str = \"Todo AI\"\n    API_V1_STR: str = \"/api/v1\"\n    \n    # CORS Configuration with default value\n    BACKEND_CORS_ORIGINS: List[str] = [\"http://localhost:3000\", \"http://localhost:8000\", \"http://frontend:3000\"]\n    \n    @field_validator(\"BACKEND_CORS_ORIGINS\", mode=\"before\")\n    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:\n        # If it's already a list, return it\n        if isinstance(v, list):\n            return v\n        # If it's an empty string or None, return default list\n        if not v:\n            return [\"http://localhost:3000\", \"http://localhost:8000\", \"http://frontend:3000\"]\n        # If it's a string but not JSON, split by comma\n        if isinstance(v, str) and not v.startswith(\"[\"):\n            return [i.strip() for i in v.split(\",\")]\n        # If it's a string that might be JSON, try to parse it, but return default on error\n        try:\n            if isinstance(v, str):\n                return json.loads(v)\n        except:\n            return [\"http://localhost:3000\", \"http://localhost:8000\", \"http://frontend:3000\"]\n        # Default fallback\n        return [\"http://localhost:3000\", \"http://localhost:8000\", \"http://frontend:3000\"]\n\n    # Database configuration\n    POSTGRES_SERVER: str = \"db\"\n    POSTGRES_USER: str = \"postgres\"\n    POSTGRES_PASSWORD: str = \"postgres\"\n    POSTGRES_DB: str = \"app\"\n    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None\n\n    @field_validator(\"SQLALCHEMY_DATABASE_URI\", mode=\"after\")\n    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:\n        if isinstance(v, str):\n            return v\n        \n        return PostgresDsn.build(\n            scheme=\"postgresql+asyncpg\",\n            username=values.data.get(\"POSTGRES_USER\"),\n            password=values.data.get(\"POSTGRES_PASSWORD\"),\n            host=values.data.get(\"POSTGRES_SERVER\"),\n            path=f\"{values.data.get('POSTGRES_DB') or ''}\",\n        )\n    \n    # Fallback to SQLite for local development - set default to True\n    USE_SQLITE: bool = True\n    SQLITE_DB_FILE: str = \"todos.db\"\n    \n    # OpenAI configuration with default API key\n    OPENAI_API_KEY: str = \"sk-dummy-key-for-development\"\n    OPENAI_MODEL: str = \"gpt-3.5-turbo\"\n    OPENAI_TIMEOUT: int = 60\n\n    # GraphQL configuration\n    GRAPHQL_PATH: str = \"/graphql\"\n    GRAPHQL_SUBSCRIPTION_PATH: str = \"/graphql/ws\"\n\n    model_config = SettingsConfigDict(env_file=\".env\", env_file_encoding=\"utf-8\", case_sensitive=True)\n\n\nsettings = Settings()" > /app/backend/app/core/config.py

# Copy CLI helpers (init_db script)
COPY scripts/ /app/scripts/

# Copy backend code except for the config.py file
COPY backend/app/ /app/backend/app/

# Create symlink for app import path
RUN ln -s /app/backend/app /app/app

# Copy the fixed config file to the symlinked location as well
RUN cp /app/backend/app/core/config.py /app/app/core/config.py

# Set environment variables
ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    USE_SQLITE=true \
    SQLITE_DB_FILE=todos.db \
    OPENAI_API_KEY=sk-dummy-key-for-development

# Create non-root user
RUN addgroup --system --gid 1001 appgroup \
 && adduser  --system --uid 1001 --gid 1001 appuser

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]