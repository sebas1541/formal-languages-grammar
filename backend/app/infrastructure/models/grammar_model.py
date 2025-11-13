"""SQLModel representation of a Grammar."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import Column, Enum as SAEnum, JSON
from sqlmodel import Field, SQLModel

from app.domain.entities.grammar import GrammarType


class GrammarModel(SQLModel, table=True):
    __tablename__ = "grammars"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    grammar_type: GrammarType = Field(sa_column=Column(SAEnum(GrammarType, name="grammar_type")))
    non_terminals: List[str] = Field(sa_column=Column(JSON, nullable=False))
    terminals: List[str] = Field(sa_column=Column(JSON, nullable=False))
    start_symbol: str
    productions: List[Dict[str, Any]] = Field(sa_column=Column(JSON, nullable=False))
