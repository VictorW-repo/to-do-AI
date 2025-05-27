#!/bin/bash
set -e

# Define colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Todo AI Development Environment...${NC}"

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found, creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created! Please edit it with your API keys before continuing.${NC}"
    exit 1
fi

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
poetry install --no-interaction
poetry run python -m app.main &
BACKEND_PID=$!
cd ..

# Start frontend
echo -e "${GREEN}Starting frontend development server...${NC}"
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to handle cleanup
cleanup() {
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup on exit
trap cleanup INT TERM

echo -e "${GREEN}Development environment is running!${NC}"
echo -e "${YELLOW}Backend:${NC} http://localhost:8000/api/v1/graphql"
echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for user to cancel
wait