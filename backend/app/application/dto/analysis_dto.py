"""DTOs for parsing and generation operations."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field

from app.domain.entities.analysis import GenerationOutcome, ParseOutcome, ParseTreeNode


class ParseRequestDTO(BaseModel):
    input_string: str = Field(default="", description="String to evaluate against the grammar")
    max_steps: Optional[int] = Field(
        default=None, ge=1, description="Optional override for derivation depth"
    )


class ParseTreeNodeDTO(BaseModel):
    symbol: str
    children: List["ParseTreeNodeDTO"] = Field(default_factory=list)

    @classmethod
    def from_domain(cls, node: ParseTreeNode) -> "ParseTreeNodeDTO":
        return cls(
            symbol=node.symbol,
            children=[cls.from_domain(child) for child in node.children],
        )


class ParseResponseDTO(BaseModel):
    accepted: bool
    steps: int
    derivation_tree: Optional[ParseTreeNodeDTO] = None

    @classmethod
    def from_outcome(cls, outcome: ParseOutcome) -> "ParseResponseDTO":
        tree = (
            ParseTreeNodeDTO.from_domain(outcome.tree) if outcome.tree is not None else None
        )
        return cls(accepted=outcome.accepted, steps=outcome.steps, derivation_tree=tree)


class GenerationResponseDTO(BaseModel):
    strings: List[str]

    @classmethod
    def from_outcome(cls, outcome: GenerationOutcome) -> "GenerationResponseDTO":
        return cls(strings=outcome.strings)


ParseTreeNodeDTO.model_rebuild()
