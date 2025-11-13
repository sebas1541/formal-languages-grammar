# Backend

FastAPI service that exposes CRUD operations for grammars. The code follows a clean architecture style with explicit `domain`, `application`, `infrastructure`, and `interfaces` layers.

## Running locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

You can then hit `http://localhost:8000/docs` to interact with the OpenAPI UI.

## Testing

```bash
cd backend
pytest
```
