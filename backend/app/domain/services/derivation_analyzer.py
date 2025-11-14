"""Derivation-based parser and generator for grammars."""
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict, List, Sequence, Tuple

from app.core.errors import DomainValidationError
from app.domain.entities.analysis import (
    DerivationStep,
    GenerationOutcome,
    ParseOutcome,
    ParseTreeNode,
)
from app.domain.entities.grammar import EPSILON_SYMBOL, Grammar, ProductionRule


@dataclass(frozen=True)
class _DerivationState:
    symbols: Tuple[str, ...]
    paths: Tuple[Tuple[int, ...], ...]
    history: Tuple[DerivationStep, ...]


class DerivationAnalyzer:
    """Explore grammar derivations via BFS to parse or generate strings."""

    def __init__(self, grammar: Grammar, max_queue: int = 5000) -> None:
        self._grammar = grammar
        self._non_terminals = set(grammar.non_terminals)
        self._terminals = set(grammar.terminals)
        self._productions: Dict[str, Tuple[ProductionRule, ...]] = self._index_productions(
            grammar.productions
        )
        self._use_separator = any(len(symbol) > 1 for symbol in grammar.terminals)
        self._max_queue = max_queue

    def parse(self, raw_input: str, max_steps: int | None = None) -> ParseOutcome:
        tokens = self._tokenize(raw_input)
        for token in tokens:
            if token not in self._terminals:
                raise DomainValidationError(
                    f"Input token '{token}' is not part of the grammar terminals"
                )
        max_steps = max_steps or self._default_max_steps(len(tokens))
        initial_state = _DerivationState(
            symbols=(self._grammar.start_symbol,),
            paths=((),),
            history=(),
        )
        queue: Deque[_DerivationState] = deque([initial_state])
        visited: set[Tuple[str, ...]] = set()
        target = tuple(tokens)
        while queue:
            state = queue.popleft()
            if len(state.history) > max_steps:
                continue
            key = state.symbols
            if key in visited:
                continue
            visited.add(key)
            if self._count_terminals(state.symbols) > len(tokens):
                continue
            if self._is_terminal_sequence(state.symbols):
                if key == target:
                    tree = self._build_tree(state.history)
                    return ParseOutcome(True, tree, steps=len(state.history))
                continue
            if not self._prefix_matches(state.symbols, tokens):
                continue
            next_index = self._next_non_terminal_index(state.symbols)
            if next_index is None:
                continue
            symbol = state.symbols[next_index]
            productions = self._productions.get(symbol, ())
            for production in productions:
                new_symbols = self._apply_production(state.symbols, next_index, production)
                new_paths = self._update_paths(state.paths, next_index, production)
                new_history = state.history + (DerivationStep(state.paths[next_index], production),)
                queue.append(
                    _DerivationState(
                        symbols=new_symbols,
                        paths=new_paths,
                        history=new_history,
                    )
                )
                if len(queue) > self._max_queue:
                    queue.pop()
        return ParseOutcome(False, None, steps=max_steps)

    def generate(self, limit: int = 10, max_states: int | None = None) -> GenerationOutcome:
        if limit <= 0:
            raise DomainValidationError("Generation limit must be positive")
        queue: Deque[Tuple[str, ...]] = deque([(self._grammar.start_symbol,)])
        seen: set[Tuple[str, ...]] = set()
        results: List[str] = []
        processed = 0
        max_states = max_states or limit * 200
        while queue and len(results) < limit and processed < max_states:
            current = queue.popleft()
            processed += 1
            if current in seen:
                continue
            seen.add(current)
            if self._is_terminal_sequence(current):
                rendered = self._render_tokens(current)
                if rendered not in results:
                    results.append(rendered)
                continue
            next_index = self._next_non_terminal_index(current)
            if next_index is None:
                continue
            symbol = current[next_index]
            for production in self._productions.get(symbol, ()):  # type: ignore[index]
                new_symbols = self._apply_production(current, next_index, production)
                queue.append(new_symbols)
        return GenerationOutcome(strings=results)

    def _index_productions(
        self, productions: Sequence[ProductionRule]
    ) -> Dict[str, Tuple[ProductionRule, ...]]:
        mapping: Dict[str, List[ProductionRule]] = {}
        for production in productions:
            mapping.setdefault(production.left, []).append(production)
        return {key: tuple(value) for key, value in mapping.items()}

    def _tokenize(self, raw: str) -> List[str]:
        stripped = raw.strip()
        if not stripped or stripped == EPSILON_SYMBOL:
            return []
        if self._use_separator or " " in raw:
            return [token for token in raw.split() if token]
        return list(raw)

    def _default_max_steps(self, token_length: int) -> int:
        base = max(token_length, 1)
        return base + len(self._non_terminals) * 2 + 5

    def _is_terminal_sequence(self, symbols: Sequence[str]) -> bool:
        return all(symbol in self._terminals for symbol in symbols)

    def _count_terminals(self, symbols: Sequence[str]) -> int:
        return sum(1 for symbol in symbols if symbol in self._terminals)

    def _prefix_matches(self, symbols: Sequence[str], tokens: Sequence[str]) -> bool:
        prefix: List[str] = []
        for symbol in symbols:
            if symbol in self._non_terminals:
                break
            prefix.append(symbol)
        if len(prefix) > len(tokens):
            return False
        return tokens[: len(prefix)] == prefix

    def _next_non_terminal_index(self, symbols: Sequence[str]) -> int | None:
        for index, symbol in enumerate(symbols):
            if symbol in self._non_terminals:
                return index
        return None

    def _apply_production(
        self,
        symbols: Tuple[str, ...],
        index: int,
        production: ProductionRule,
    ) -> Tuple[str, ...]:
        replacement = self._production_body(production)
        return symbols[:index] + replacement + symbols[index + 1 :]

    def _update_paths(
        self,
        paths: Tuple[Tuple[int, ...], ...],
        index: int,
        production: ProductionRule,
    ) -> Tuple[Tuple[int, ...], ...]:
        parent_path = paths[index]
        replacement = self._production_body(production)
        before = list(paths[:index])
        new_children = tuple(parent_path + (child_index,) for child_index in range(len(replacement)))
        after = list(paths[index + 1 :])
        return tuple(before + list(new_children) + after)

    def _production_body(self, production: ProductionRule) -> Tuple[str, ...]:
        if len(production.right) == 1 and production.right[0] == EPSILON_SYMBOL:
            return tuple()
        return production.right

    def _build_tree(self, history: Tuple[DerivationStep, ...]) -> ParseTreeNode:
        root = ParseTreeNode(symbol=self._grammar.start_symbol)
        for step in history:
            node = root
            for child_index in step.path:
                node = node.children[child_index]
            children: List[ParseTreeNode] = []
            for symbol in step.production.right:
                child_node = ParseTreeNode(symbol=symbol)
                children.append(child_node)
            node.children = children
        return root

    def _render_tokens(self, tokens: Sequence[str]) -> str:
        if not tokens:
            return EPSILON_SYMBOL
        if self._use_separator:
            return " ".join(tokens)
        return "".join(tokens)
