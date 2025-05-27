Here’s a **comprehensive, clean README.md** tailored exactly to your project and requirements:

---

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

ai-todo-app/
├── README.md                 # Project overview & run instructions
├── .env.example              # Sample env vars for backend & frontend
├── .gitignore                # Files to ignore in Git/zips
├── docker-compose.yml        # Docker orchestration for db + backend + frontend
├── Dockerfile                # Docker build for backend (FastAPI)
├── Dockerfile.frontend       # Docker build for frontend (Next.js)
│
├── scripts/
│   ├── init_db.py            # CLI to initialize & seed the SQLite DB
│   └── start.sh              # One‑command local dev startup script
│
├── backend/                  
│   ├── pyproject.toml        # Poetry config & dependency list
│   ├── poetry.lock           # Locked Python dependencies
│   └── app/
│       ├── main.py           # FastAPI app setup & GraphQL mounting
│       ├── core/
│       │   ├── config.py     # Loads `.env` into pydantic Settings
│       │   └── deps.py       # Dependency‐injection helpers (e.g., get_db)
│       ├── db/
│       │   ├── session.py    # Async SQLAlchemy engine & sessionmaker
│       │   ├── models.py     # ORM model for Todo items
│       │   └── seed.py       # Seeds DB with sample todos on startup
│       ├── graphql/
│       │   ├── types.py      # GraphQL object type definitions
│       │   └── schema.py     # Queries & mutations (no subscriptions)
│       └── services/
│           ├── todo.py       # CRUD wrappers around the DB
│           └── llm.py        # Single‑shot OpenAI call for todo generation
│
└── frontend/
    ├── package.json          # NPM scripts & JS dependency list
    ├── tsconfig.json         # TS config & `@/*` path alias
    ├── postcss.config.js     # PostCSS setup for TailwindCSS
    ├── tailwind.config.js    # TailwindCSS configuration
    ├── next.config.js        # Webpack alias for `@ → src`
    ├── .env.example          # Sample frontend env (NEXT_PUBLIC_*)
    └── src/
        ├── lib/
        │   ├── apollo.ts         # Apollo Client over HTTP only
        │   └── persistence.ts    # Spinner state persistence util
        ├── graphql/
        │   ├── queries.ts        # GraphQL queries for todos
        │   └── mutations.ts      # GraphQL mutations (including AI)
        ├── styles/
        │   └── globals.css       # Tailwind’s base/components/util imports
        ├── components/
        │   ├── ui/               
        │   │   ├── button.tsx      # Styled Button with variant & size
        │   │   ├── input.tsx       # Styled text Input
        │   │   ├── checkbox.tsx    # Styled Checkbox w/ onCheckedChange
        │   │   └── toaster.tsx     # Placeholder for toast notifications
        │   ├── Layout.tsx         # App shell & theme provider
        │   ├── Spinner.tsx        # Generic loading spinner component
        │   ├── TodoInput.tsx      # Form for text + AI‑powered todo
        │   ├── TodoItem.tsx       # Renders each todo with controls
        │   └── Toaster.tsx        # (optional) toast container import
        └── pages/
            ├── _app.tsx          # Wraps app with Apollo & Theme providers
            └── index.tsx         # Main todo‑list page & component imports
