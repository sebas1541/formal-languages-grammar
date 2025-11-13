"""Repository contracts for persisting grammars."""
from __future__ import annotations

from typing import Protocol, Sequence

from app.domain.entities.grammar import Grammar


class GrammarRepository(Protocol):
    """Abstraction over grammar persistence."""

    def add(self, grammar: Grammar) -> Grammar:
        ...

    def list(self) -> Sequence[Grammar]:
        ...

    def get(self, grammar_id: int) -> Grammar:
        ...

    def update(self, grammar: Grammar) -> Grammar:
        ...

    def delete(self, grammar_id: int) -> None:
        ...
