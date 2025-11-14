"""Dependency wiring for API routers."""
from __future__ import annotations

from fastapi import Depends
from sqlmodel import Session

from app.application.services.analysis_service import GrammarAnalysisService
from app.application.services.grammar_service import GrammarService
from app.infrastructure.db.session import get_session
from app.infrastructure.repositories.sqlmodel_grammar_repository import (
    SQLModelGrammarRepository,
)


def _get_repository(session: Session = Depends(get_session)) -> SQLModelGrammarRepository:
    return SQLModelGrammarRepository(session)


def get_grammar_service(
    repository: SQLModelGrammarRepository = Depends(_get_repository),
) -> GrammarService:
    return GrammarService(repository)


def get_analysis_service(
    repository: SQLModelGrammarRepository = Depends(_get_repository),
) -> GrammarAnalysisService:
    return GrammarAnalysisService(repository)
