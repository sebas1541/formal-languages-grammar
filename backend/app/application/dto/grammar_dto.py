"""Data transfer objects used by the grammar service and API."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.domain.entities.grammar import Grammar, GrammarType, ProductionRule


class ProductionRuleDTO(BaseModel):
    left: str = Field(min_length=1, description="Non-terminal on the left side")
    right: List[str] = Field(description="Sequence of symbols on the right side")

    @field_validator("right")
    @classmethod
    def validate_right(cls, value: List[str]) -> List[str]:
        cleaned = [symbol.strip() for symbol in value]
        if not cleaned:
            raise ValueError("Production right side cannot be empty")
        if any(not symbol for symbol in cleaned):
            raise ValueError("Production symbols must be non-empty strings")
        return cleaned

    @field_validator("left")
    @classmethod
    def validate_left(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Left symbol cannot be blank")
        return stripped


class GrammarBaseDTO(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    grammar_type: GrammarType
    non_terminals: List[str]
    terminals: List[str]
    start_symbol: str
    productions: List[ProductionRuleDTO]

    @field_validator("non_terminals", "terminals")
    @classmethod
    def validate_symbol_sets(cls, value: List[str], info) -> List[str]:
        cleaned = [symbol.strip() for symbol in value if symbol.strip()]
        if not cleaned:
            raise ValueError(f"{info.field_name.replace('_', ' ').title()} cannot be empty")
        if len(set(cleaned)) != len(cleaned):
            raise ValueError(f"{info.field_name.replace('_', ' ').title()} must be unique")
        return cleaned

    @field_validator("start_symbol")
    @classmethod
    def validate_start_symbol(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Start symbol cannot be blank")
        return stripped

    @model_validator(mode="after")
    def check_relationships(self) -> "GrammarBaseDTO":
        terminals = set(self.terminals)
        non_terminals = set(self.non_terminals)
        if terminals.intersection(non_terminals):
            raise ValueError("Terminals and non-terminals must be disjoint")
        return self


class GrammarCreateDTO(GrammarBaseDTO):
    """Payload used to create a grammar."""


class GrammarUpdateDTO(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    grammar_type: Optional[GrammarType] = None
    non_terminals: Optional[List[str]] = None
    terminals: Optional[List[str]] = None
    start_symbol: Optional[str] = None
    productions: Optional[List[ProductionRuleDTO]] = None

    @field_validator("non_terminals", "terminals")
    @classmethod
    def validate_symbol_lists(cls, value: Optional[List[str]], info) -> Optional[List[str]]:
        if value is None:
            return value
        cleaned = [symbol.strip() for symbol in value if symbol.strip()]
        if not cleaned:
            raise ValueError(f"{info.field_name.replace('_', ' ').title()} cannot be empty")
        if len(set(cleaned)) != len(cleaned):
            raise ValueError(f"{info.field_name.replace('_', ' ').title()} must be unique")
        return cleaned

    @field_validator("start_symbol")
    @classmethod
    def validate_start(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Start symbol cannot be blank")
        return stripped

    @model_validator(mode="after")
    def ensure_payload(self) -> "GrammarUpdateDTO":
        if not any([
            self.name,
            self.grammar_type,
            self.non_terminals,
            self.terminals,
            self.start_symbol,
            self.productions,
        ]):
            raise ValueError("At least one field must be provided for an update")
        return self


class GrammarReadDTO(GrammarBaseDTO):
    model_config = ConfigDict(from_attributes=True)

    id: int

    @classmethod
    def from_domain(cls, grammar: Grammar) -> "GrammarReadDTO":
        return cls(
            id=grammar.id or 0,
            name=grammar.name,
            grammar_type=grammar.grammar_type,
            non_terminals=list(grammar.non_terminals),
            terminals=list(grammar.terminals),
            start_symbol=grammar.start_symbol,
            productions=[
                ProductionRuleDTO(left=rule.left, right=list(rule.right))
                for rule in grammar.productions
            ],
        )


def dto_to_domain_production(rule: ProductionRuleDTO) -> ProductionRule:
    """Convert a DTO into a domain production rule."""

    return ProductionRule.from_iterables(left=rule.left, right=rule.right)


def dto_to_domain_grammar(
    data: GrammarBaseDTO, grammar_id: int | None = None
) -> Grammar:
    """Create a domain Grammar object from the DTO data."""

    return Grammar(
        id=grammar_id,
        name=data.name,
        grammar_type=data.grammar_type,
        non_terminals=tuple(data.non_terminals),
        terminals=tuple(data.terminals),
        start_symbol=data.start_symbol,
        productions=tuple(dto_to_domain_production(rule) for rule in data.productions),
    )
