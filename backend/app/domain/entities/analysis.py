"""Domain-level data structures for parsing outcomes."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from app.domain.entities.grammar import ProductionRule


@dataclass(slots=True, frozen=True)
class DerivationStep:
    """Represents the application of a production rule at a tree path."""

    path: Tuple[int, ...]
    production: ProductionRule


@dataclass(slots=True)
class ParseTreeNode:
    """Node for derivation trees."""

    symbol: str
    children: List["ParseTreeNode"] = field(default_factory=list)


@dataclass(slots=True)
class ParseOutcome:
    """Result of attempting to parse a string."""

    accepted: bool
    tree: Optional[ParseTreeNode]
    steps: int


@dataclass(slots=True)
class GenerationOutcome:
    """Generated strings from a grammar."""

    strings: List[str]
