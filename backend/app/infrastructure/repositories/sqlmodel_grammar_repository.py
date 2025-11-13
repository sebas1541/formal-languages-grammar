"""SQLModel-backed implementation of the grammar repository."""
from __future__ import annotations

from typing import Sequence

from sqlmodel import Session, select

from app.application.interfaces.grammar_repository import GrammarRepository
from app.core.errors import EntityNotFoundError
from app.domain.entities.grammar import Grammar, ProductionRule
from app.infrastructure.models.grammar_model import GrammarModel


class SQLModelGrammarRepository(GrammarRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, grammar: Grammar) -> Grammar:
        model = self._to_model(grammar)
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def list(self) -> Sequence[Grammar]:
        statement = select(GrammarModel)
        results = self._session.exec(statement).all()
        return [self._to_domain(model) for model in results]

    def get(self, grammar_id: int) -> Grammar:
        model = self._get_model(grammar_id)
        return self._to_domain(model)

    def update(self, grammar: Grammar) -> Grammar:
        if grammar.id is None:
            raise ValueError("Cannot update a grammar without an identifier")
        model = self._get_model(grammar.id)
        model.name = grammar.name
        model.grammar_type = grammar.grammar_type
        model.non_terminals = list(grammar.non_terminals)
        model.terminals = list(grammar.terminals)
        model.start_symbol = grammar.start_symbol
        model.productions = [rule.to_dict() for rule in grammar.productions]
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def delete(self, grammar_id: int) -> None:
        model = self._get_model(grammar_id)
        self._session.delete(model)
        self._session.commit()

    def _get_model(self, grammar_id: int) -> GrammarModel:
        model = self._session.get(GrammarModel, grammar_id)
        if model is None:
            raise EntityNotFoundError(f"Grammar with id={grammar_id} was not found")
        return model

    def _to_domain(self, model: GrammarModel) -> Grammar:
        return Grammar(
            id=model.id,
            name=model.name,
            grammar_type=model.grammar_type,
            non_terminals=tuple(model.non_terminals),
            terminals=tuple(model.terminals),
            start_symbol=model.start_symbol,
            productions=tuple(
                ProductionRule.from_iterables(rule["left"], rule["right"])
                for rule in model.productions
            ),
        )

    def _to_model(self, grammar: Grammar) -> GrammarModel:
        return GrammarModel(
            id=grammar.id,
            name=grammar.name,
            grammar_type=grammar.grammar_type,
            non_terminals=list(grammar.non_terminals),
            terminals=list(grammar.terminals),
            start_symbol=grammar.start_symbol,
            productions=[rule.to_dict() for rule in grammar.productions],
        )
