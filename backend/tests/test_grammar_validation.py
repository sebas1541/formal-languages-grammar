from __future__ import annotations

import pytest

from app.application.dto.grammar_dto import GrammarCreateDTO, GrammarUpdateDTO, ProductionRuleDTO
from app.application.services.grammar_service import GrammarService
from app.core.errors import DomainValidationError
from app.domain.entities.grammar import GrammarType
from tests.fakes import InMemoryGrammarRepository


def build_service() -> GrammarService:
    return GrammarService(InMemoryGrammarRepository())


def test_create_grammar_requires_valid_start_symbol() -> None:
    service = build_service()
    payload = GrammarCreateDTO(
        name="Invalid",
        grammar_type=GrammarType.TYPE_2,
        non_terminals=["S"],
        terminals=["a"],
        start_symbol="A",
        productions=[ProductionRuleDTO(left="S", right=["a"])],
    )
    with pytest.raises(DomainValidationError):
        service.create(payload)


def test_regular_grammar_rules_enforced() -> None:
    service = build_service()
    payload = GrammarCreateDTO(
        name="Regular",
        grammar_type=GrammarType.TYPE_3,
        non_terminals=["S", "A"],
        terminals=["a", "b"],
        start_symbol="S",
        productions=[
            ProductionRuleDTO(left="S", right=["a", "A", "b"]),
        ],
    )
    with pytest.raises(DomainValidationError):
        service.create(payload)


def test_update_returns_latest_representation() -> None:
    repository = InMemoryGrammarRepository()
    service = GrammarService(repository)
    created = service.create(
        GrammarCreateDTO(
            name="Grammar",
            grammar_type=GrammarType.TYPE_2,
            non_terminals=["S"],
            terminals=["a"],
            start_symbol="S",
            productions=[ProductionRuleDTO(left="S", right=["a", "S"])],
        )
    )
    updated = service.update(
        created.id,
        GrammarUpdateDTO(name="Renamed", terminals=["a", "b"], productions=[
            ProductionRuleDTO(left="S", right=["a"])
        ]),
    )
    assert updated.name == "Renamed"
    assert updated.terminals == ["a", "b"]
    assert len(updated.productions) == 1
