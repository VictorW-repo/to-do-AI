import asyncio
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL

from app.core.config import settings
from app.core.deps import check_health
from app.db.seed import seed_database
from app.db.session import SessionLocal, initialize_database
from app.graphql.schema import schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events for the FastAPI app
    """
    # Initialize database on startup
    await initialize_database()
    
    # Seed database with sample data
    await seed_database()
    
    yield
    
    # Cleanup on shutdown (if needed)
    pass


# Get context for GraphQL with a fresh database session
async def get_context(request: Request):
    """Get GraphQL context with database session"""
    # Create a new session for each request
    session = SessionLocal()
    # Store the session on the request state for cleanup
    request.state.db_session = session
    return {"request": request, "db": session}


# Create GraphQL router with WebSocket subscription support
graphql_app = GraphQLRouter(
    schema,
    subscription_protocols=[
        GRAPHQL_TRANSPORT_WS_PROTOCOL,
        GRAPHQL_WS_PROTOCOL,
    ],
    path=settings.GRAPHQL_PATH,
    context_getter=get_context,
)


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)


# Add middleware to close database sessions
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    """Ensure database sessions are properly closed"""
    response = await call_next(request)
    
    # Check if this is a GraphQL request that created a session
    if hasattr(request.state, "db_session") and request.state.db_session:
        await request.state.db_session.close()
        request.state.db_session = None
    
    return response


# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount GraphQL router
app.include_router(graphql_app, prefix=settings.API_V1_STR)


# Health check endpoint
@app.get("/health")
async def health_check(is_healthy: bool = Depends(check_health)):
    """
    Health check endpoint for monitoring and k8s probes
    """
    if is_healthy:
        return {"status": "ok"}
    return {"status": "error"}


# Development server
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)