"""Service that coordinates parsing and string generation."""
from __future__ import annotations

from app.application.dto.analysis_dto import (
    GenerationResponseDTO,
    ParseRequestDTO,
    ParseResponseDTO,
)
from app.application.interfaces.grammar_repository import GrammarRepository
from app.domain.services.derivation_analyzer import DerivationAnalyzer


class GrammarAnalysisService:
    """High-level operations for parsing and generation."""

    def __init__(self, repository: GrammarRepository) -> None:
        self._repository = repository

    def parse_string(self, grammar_id: int, payload: ParseRequestDTO) -> ParseResponseDTO:
        grammar = self._repository.get(grammar_id)
        analyzer = DerivationAnalyzer(grammar)
        outcome = analyzer.parse(payload.input_string, payload.max_steps)
        return ParseResponseDTO.from_outcome(outcome)

    def generate_strings(self, grammar_id: int, limit: int = 10) -> GenerationResponseDTO:
        grammar = self._repository.get(grammar_id)
        analyzer = DerivationAnalyzer(grammar)
        outcome = analyzer.generate(limit=limit)
        return GenerationResponseDTO.from_outcome(outcome)
