# Backend

FastAPI service that exposes CRUD operations for grammars. The code follows a clean architecture style with explicit `domain`, `application`, `infrastructure`, and `interfaces` layers.

## Capabilities

- Define, update, import, and export type-2/type-3 grammars.
- Evaluate input strings and retrieve the derivation tree built via BFS exploration.
- Generate the shortest strings produced by a grammar (10 by default) using breadth-first derivations.

## Running locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

You can then hit `http://localhost:8000/docs` to interact with the OpenAPI UI.

### API Overview

- `POST /api/v1/grammars/` — create/import a grammar definition.
- `GET /api/v1/grammars/{id}/export` — retrieve a stored grammar (suitable for JSON download).
- `POST /api/v1/grammars/{id}/parse` — check if a string belongs to the grammar; returns derivation tree on success.
- `GET /api/v1/grammars/{id}/generate?limit=10` — list the first `limit` strings generated with BFS.

## Testing

```bash
cd backend
pytest
```
