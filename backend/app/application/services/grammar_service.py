"""Application service responsible for grammar orchestration."""
from __future__ import annotations

from typing import List

from app.application.dto.grammar_dto import (
    GrammarCreateDTO,
    GrammarReadDTO,
    GrammarUpdateDTO,
    ProductionRuleDTO,
    dto_to_domain_grammar,
)
from app.application.interfaces.grammar_repository import GrammarRepository
from app.core.errors import DomainValidationError
from app.domain.entities.grammar import EPSILON_SYMBOL, Grammar, GrammarType, ProductionRule


class GrammarService:
    """Use-case service that coordinates grammar operations."""

    def __init__(self, repository: GrammarRepository) -> None:
        self._repository = repository

    def create(self, payload: GrammarCreateDTO) -> GrammarReadDTO:
        grammar = dto_to_domain_grammar(payload)
        self._validate(grammar)
        stored = self._repository.add(grammar)
        return GrammarReadDTO.from_domain(stored)

    def list(self) -> List[GrammarReadDTO]:
        grammars = self._repository.list()
        return [GrammarReadDTO.from_domain(grammar) for grammar in grammars]

    def retrieve(self, grammar_id: int) -> GrammarReadDTO:
        grammar = self._repository.get(grammar_id)
        return GrammarReadDTO.from_domain(grammar)

    def update(self, grammar_id: int, payload: GrammarUpdateDTO) -> GrammarReadDTO:
        existing = self._repository.get(grammar_id)
        updated = self._merge(existing, payload)
        self._validate(updated)
        stored = self._repository.update(updated)
        return GrammarReadDTO.from_domain(stored)

    def delete(self, grammar_id: int) -> None:
        self._repository.delete(grammar_id)

    def _merge(self, existing: Grammar, payload: GrammarUpdateDTO) -> Grammar:
        data = payload.model_dump(exclude_none=True)
        productions = existing.productions
        if "productions" in data:
            productions = tuple(
                self._to_domain_production(prod) for prod in data["productions"]
            )
        return Grammar(
            id=existing.id,
            name=data.get("name", existing.name),
            grammar_type=data.get("grammar_type", existing.grammar_type),
            non_terminals=tuple(data.get("non_terminals", list(existing.non_terminals))),
            terminals=tuple(data.get("terminals", list(existing.terminals))),
            start_symbol=data.get("start_symbol", existing.start_symbol),
            productions=productions,
        )

    def _to_domain_production(self, production_payload: dict | ProductionRuleDTO) -> ProductionRule:
        if isinstance(production_payload, ProductionRuleDTO):
            payload = production_payload
        else:
            payload = ProductionRuleDTO.model_validate(production_payload)
        return ProductionRule.from_iterables(payload.left, payload.right)

    def _validate(self, grammar: Grammar) -> None:
        non_terminals = set(grammar.non_terminals)
        terminals = set(grammar.terminals)
        if grammar.start_symbol not in non_terminals:
            raise DomainValidationError("Start symbol must be part of the non-terminal set")
        if not grammar.productions:
            raise DomainValidationError("At least one production must be defined")
        for rule in grammar.productions:
            if rule.left not in non_terminals:
                raise DomainValidationError(
                    f"Left symbol '{rule.left}' must be a known non-terminal"
                )
            if EPSILON_SYMBOL in rule.right and len(rule.right) > 1:
                raise DomainValidationError("Epsilon productions must be used alone")
            for symbol in rule.right:
                if symbol == EPSILON_SYMBOL:
                    continue
                if symbol not in non_terminals and symbol not in terminals:
                    raise DomainValidationError(
                        f"Symbol '{symbol}' is not defined in the grammar alphabet"
                    )
        if grammar.grammar_type == GrammarType.TYPE_3:
            self._validate_regular_grammar(grammar, non_terminals, terminals)

    def _validate_regular_grammar(
        self,
        grammar: Grammar,
        non_terminals: set[str],
        terminals: set[str],
    ) -> None:
        for rule in grammar.productions:
            right = rule.right
            if len(right) == 1 and right[0] == EPSILON_SYMBOL:
                if rule.left != grammar.start_symbol:
                    raise DomainValidationError(
                        "Only the start symbol may produce epsilon in a regular grammar"
                    )
                continue
            if len(right) == 1:
                if right[0] not in terminals:
                    raise DomainValidationError(
                        f"Regular production '{rule.left} -> {' '.join(right)}' must end in a terminal"
                    )
                continue
            if len(right) == 2:
                terminal, non_terminal = right
                if terminal not in terminals or non_terminal not in non_terminals:
                    raise DomainValidationError(
                        "Right-linear productions must follow the pattern A -> aB"
                    )
                continue
            raise DomainValidationError(
                f"Regular grammar productions cannot have length {len(right)}"
            )
