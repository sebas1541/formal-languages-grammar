"""Dependency wiring for API routers."""
from __future__ import annotations

from fastapi import Depends
from sqlmodel import Session

from app.application.services.grammar_service import GrammarService
from app.infrastructure.db.session import get_session
from app.infrastructure.repositories.sqlmodel_grammar_repository import (
    SQLModelGrammarRepository,
)


def get_grammar_service(session: Session = Depends(get_session)) -> GrammarService:
    repository = SQLModelGrammarRepository(session)
    return GrammarService(repository)
