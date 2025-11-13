"""Grammar API endpoints."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status

from app.application.dto.grammar_dto import (
    GrammarCreateDTO,
    GrammarReadDTO,
    GrammarUpdateDTO,
)
from app.application.services.grammar_service import GrammarService
from app.interfaces.api.dependencies import get_grammar_service

router = APIRouter(prefix="/grammars", tags=["grammars"])


@router.post("/", response_model=GrammarReadDTO, status_code=status.HTTP_201_CREATED)
def create_grammar(
    payload: GrammarCreateDTO, service: GrammarService = Depends(get_grammar_service)
) -> GrammarReadDTO:
    return service.create(payload)


@router.get("/", response_model=List[GrammarReadDTO])
def list_grammars(service: GrammarService = Depends(get_grammar_service)) -> List[GrammarReadDTO]:
    return service.list()


@router.get("/{grammar_id}", response_model=GrammarReadDTO)
def get_grammar(
    grammar_id: int, service: GrammarService = Depends(get_grammar_service)
) -> GrammarReadDTO:
    return service.retrieve(grammar_id)


@router.put("/{grammar_id}", response_model=GrammarReadDTO)
def update_grammar(
    grammar_id: int,
    payload: GrammarUpdateDTO,
    service: GrammarService = Depends(get_grammar_service),
) -> GrammarReadDTO:
    return service.update(grammar_id, payload)


@router.delete("/{grammar_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grammar(
    grammar_id: int, service: GrammarService = Depends(get_grammar_service)
) -> None:
    service.delete(grammar_id)
