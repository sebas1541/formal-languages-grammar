# ForGram - Formal Languages Grammar Tool

A web application for defining, analyzing, and visualizing formal grammars (Type 2 and Type 3).

## What it does

**Backend**: FastAPI REST API that manages grammars, validates strings, generates derivation trees, and provides AI explanations using Gemini.

**Frontend**: Next.js web interface for creating grammars, parsing strings, visualizing derivation trees, and chatting with AI about grammar concepts.

**Database**: SQLite for storing grammar definitions. Automatically created on first run.

## Quick Start

### 1. Start Backend (with Docker)

```bash
# Optional: Add your Gemini API key for AI features
cp .env.example .env
# Edit .env and add your API key

# Start backend
docker-compose up -d

# Verify it's running
curl http://localhost:8000/api/v1/grammars/
# Should return: []

# Or visit http://localhost:8000/docs for API documentation
```

Docker handles the database and dependencies automatically.

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev

# Frontend will be at http://localhost:3000
```

**Important**: Backend must be running on port 8000 for frontend to connect.

## Manual Setup (without Docker)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Optional: Create .env file with Gemini API key
echo "GRAMMAR_GEMINI_API_KEY=your_key" > .env

uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features

- Create and manage Type 2 (Context-Free) and Type 3 (Regular) grammars
- Parse strings and validate against grammar rules
- Visualize derivation trees
- Generate example strings from grammars
- AI-powered explanations using Gemini 2.5 Flash
- Import/export grammars as JSON
- Example grammars included

## Tech Stack

- Backend: Python 3.11, FastAPI, SQLAlchemy, SQLite
- Frontend: Next.js 15, TypeScript, TailwindCSS, React Query
- AI: Google Gemini 2.5 Flash
- Deployment: Docker, Docker Compose
