"""Domain entities that describe grammar concepts."""
from __future__ import annotations

from dataclasses import dataclass, replace
from enum import Enum
from typing import Iterable, Tuple


EPSILON_SYMBOL = "ε"


class GrammarType(str, Enum):
    """Supported grammar classifications."""

    TYPE_2 = "type_2"
    TYPE_3 = "type_3"


@dataclass(slots=True, frozen=True)
class ProductionRule:
    """Grammar production rule."""

    left: str
    right: Tuple[str, ...]

    def to_dict(self) -> dict[str, list[str]]:
        return {"left": self.left, "right": list(self.right)}

    @staticmethod
    def from_iterables(left: str, right: Iterable[str]) -> "ProductionRule":
        return ProductionRule(left=left, right=tuple(right))


@dataclass(slots=True, frozen=True)
class Grammar:
    """Aggregate root that represents a formal grammar."""

    id: int | None
    name: str
    grammar_type: GrammarType
    non_terminals: Tuple[str, ...]
    terminals: Tuple[str, ...]
    start_symbol: str
    productions: Tuple[ProductionRule, ...]

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "grammar_type": self.grammar_type.value,
            "non_terminals": list(self.non_terminals),
            "terminals": list(self.terminals),
            "start_symbol": self.start_symbol,
            "productions": [rule.to_dict() for rule in self.productions],
        }

    def with_id(self, grammar_id: int) -> "Grammar":
        return replace(self, id=grammar_id)

