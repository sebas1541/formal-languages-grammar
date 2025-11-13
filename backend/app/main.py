"""FastAPI entry point."""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.errors import DomainValidationError, EntityNotFoundError
from app.infrastructure.db.session import init_db
from app.interfaces.api.routers import grammars


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    app.include_router(grammars.router, prefix=settings.api_prefix)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    @app.exception_handler(DomainValidationError)
    async def handle_domain_error(request: Request, exc: DomainValidationError) -> JSONResponse:  # noqa: D401,E501
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(EntityNotFoundError)
    async def handle_not_found(request: Request, exc: EntityNotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    return app


app = create_app()
