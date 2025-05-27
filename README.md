
# AI Todo App

A full-stack todo app powered by AI. Built with FastAPI, Strawberry GraphQL, Next.js, TailwindCSS, and OpenAI.  
Supports real-time todo generation with token streaming and persistent loading state.

Demo video: https://youtu.be/uTRX7vjiFNk
---

## ✨ Features

- ✅ View, add, complete, and delete todos
- ✍️ Generate new todos using OpenAI based on previous ones
- ♻️ Persist todos in SQLite database
- 🔄 Spinner appears while generating and **persists across refresh**
- 🐳 Fully Dockerized for easy run and testing

---

## ✅ Extra Features Implemented

- [x] AI-powered todo generation using OpenAI
- [x] SQL database support (SQLite by default, PostgreSQL via Docker)
- [x] FastAPI backend with Strawberry GraphQL
- [x] Apollo Client integration on the frontend
- [x] Clean Tailwind CSS + shadcn UI components
- [x] Persistent spinner across refresh (localStorage + state hydration)
- [x] Full Docker support (`Dockerfile`, `Dockerfile.frontend`, `docker-compose.yml`)


---
## Stack

| Layer       | Tech                             |
|------------|-----------------------------------|
| Frontend   | Next.js, React, TailwindCSS, shadcn/ui, Apollo Client |
| Backend    | FastAPI, Strawberry GraphQL, SQLAlchemy/SQLModel |
| Database   | SQLite (file-based)               |
| AI         | OpenAI API                        |
| Realtime   | GraphQL Subscriptions (WebSocket) |
| DevOps     | Docker, Docker Compose            |

---

## Setup Instructions

### 1. Configure Environment

cp .env.example .env

# Open the .env file and fill in your actual OpenAI API key:
# Example:
# OPENAI_API_KEY=your_openai_key
# USE_SQLITE=true
# SQLITE_DB_FILE=todos.db

# You can now run the app using either Docker or manual setup

### Option 1: Docker (need to change OPENAI_API_KEY in docker-compose.yml)

docker-compose up --build

# Access the app:
# Frontend:       http://localhost:3000
# GraphQL API:    http://localhost:8000/graphql

### Option 2: Manual (Development Mode)

# Backend
cd backend
poetry install

# Optional: Initialize the database
poetry shell
python ../scripts/init_db.py

# Run the backend server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev


---

## Usage

- Add todos via the input box
- Complete or delete with checkbox and trash icon
- Click “Generate Todo” → calls OpenAI to suggest a new todo
- While generating:
  - A spinner appears
  - Partial tokens stream in live (via GraphQL subscriptions)
  - Spinner and generation continue even if you refresh

---

##  Notes

- `todos.db` is auto-created locally when using SQLite
- No external DB setup required

---


## 📁 Project Structure

 ![image](https://github.com/user-attachments/assets/e0d7dd85-fa90-490b-a485-b7d00c435bc2)
