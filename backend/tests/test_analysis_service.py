from __future__ import annotations

from app.application.dto.analysis_dto import ParseRequestDTO
from app.application.services.analysis_service import GrammarAnalysisService
from app.domain.entities.grammar import EPSILON_SYMBOL, Grammar, GrammarType, ProductionRule
from tests.fakes import InMemoryGrammarRepository


def make_parentheses_grammar() -> Grammar:
    return Grammar(
        id=1,
        name="Parentheses",
        grammar_type=GrammarType.TYPE_2,
        non_terminals=("S",),
        terminals=("a", "b"),
        start_symbol="S",
        productions=(
            ProductionRule.from_iterables("S", ["a", "S", "b"]),
            ProductionRule.from_iterables("S", [EPSILON_SYMBOL]),
        ),
    )


def make_generator() -> GrammarAnalysisService:
    repository = InMemoryGrammarRepository()
    repository.add(make_parentheses_grammar())
    return GrammarAnalysisService(repository)


def test_parse_service_returns_tree() -> None:
    service = make_generator()
    result = service.parse_string(1, ParseRequestDTO(input_string="aabb"))
    assert result.accepted is True
    assert result.derivation_tree is not None


def test_generate_service_respects_limit() -> None:
    service = make_generator()
    result = service.generate_strings(1, limit=3)
    assert result.strings == ["ε", "ab", "aabb"]
