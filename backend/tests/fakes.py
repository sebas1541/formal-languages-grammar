"""Test doubles for repositories and domain helpers."""
from __future__ import annotations

from typing import Dict, List

from app.application.interfaces.grammar_repository import GrammarRepository
from app.core.errors import EntityNotFoundError
from app.domain.entities.grammar import Grammar


class InMemoryGrammarRepository(GrammarRepository):
    """Simple in-memory repository used in tests."""

    def __init__(self) -> None:
        self._items: Dict[int, Grammar] = {}
        self._counter = 1

    def add(self, grammar: Grammar) -> Grammar:
        grammar_with_id = grammar.with_id(self._counter)
        self._items[self._counter] = grammar_with_id
        self._counter += 1
        return grammar_with_id

    def list(self) -> List[Grammar]:
        return list(self._items.values())

    def get(self, grammar_id: int) -> Grammar:
        if grammar_id not in self._items:
            raise EntityNotFoundError
        return self._items[grammar_id]

    def update(self, grammar: Grammar) -> Grammar:
        if grammar.id is None or grammar.id not in self._items:
            raise EntityNotFoundError
        self._items[grammar.id] = grammar
        return grammar

    def delete(self, grammar_id: int) -> None:
        self._items.pop(grammar_id, None)
