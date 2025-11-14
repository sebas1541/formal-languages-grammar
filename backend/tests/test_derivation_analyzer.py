from __future__ import annotations

import pytest

from app.core.errors import DomainValidationError
from app.domain.entities.grammar import EPSILON_SYMBOL, Grammar, GrammarType, ProductionRule
from app.domain.services.derivation_analyzer import DerivationAnalyzer


def parentheses_grammar() -> Grammar:
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


def sum_grammar() -> Grammar:
    return Grammar(
        id=2,
        name="Sum",
        grammar_type=GrammarType.TYPE_2,
        non_terminals=("S", "T"),
        terminals=("id", "+"),
        start_symbol="S",
        productions=(
            ProductionRule.from_iterables("S", ["id", "T"]),
            ProductionRule.from_iterables("T", ["+", "id", "T"]),
            ProductionRule.from_iterables("T", [EPSILON_SYMBOL]),
        ),
    )


def epsilon_grammar() -> Grammar:
    return Grammar(
        id=3,
        name="Epsilon",
        grammar_type=GrammarType.TYPE_2,
        non_terminals=("S",),
        terminals=("a",),
        start_symbol="S",
        productions=(ProductionRule.from_iterables("S", [EPSILON_SYMBOL]),),
    )


def test_balanced_string_is_accepted() -> None:
    analyzer = DerivationAnalyzer(parentheses_grammar())
    outcome = analyzer.parse("aabb")
    assert outcome.accepted is True
    assert outcome.tree is not None
    assert outcome.steps > 0


def test_invalid_token_raises_error() -> None:
    analyzer = DerivationAnalyzer(parentheses_grammar())
    with pytest.raises(DomainValidationError):
        analyzer.parse("ac")


def test_generation_orders_by_length() -> None:
    analyzer = DerivationAnalyzer(parentheses_grammar())
    outcome = analyzer.generate(limit=4)
    assert outcome.strings == ["ε", "ab", "aabb", "aaabbb"]


def test_multisymbol_terminals_are_tokenized() -> None:
    analyzer = DerivationAnalyzer(sum_grammar())
    assert analyzer.parse("id + id").accepted is True


def test_parse_accepts_explicit_epsilon_symbol() -> None:
    analyzer = DerivationAnalyzer(epsilon_grammar())
    assert analyzer.parse("ε").accepted is True
    assert analyzer.parse("").accepted is True


def test_generate_requires_positive_limit() -> None:
    analyzer = DerivationAnalyzer(parentheses_grammar())
    with pytest.raises(DomainValidationError):
        analyzer.generate(limit=0)
