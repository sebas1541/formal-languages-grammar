from __future__ import annotations

from fastapi.testclient import TestClient

from app.application.services.analysis_service import GrammarAnalysisService
from app.application.services.grammar_service import GrammarService
from app.interfaces.api.dependencies import get_analysis_service, get_grammar_service
from app.main import create_app
from tests.fakes import InMemoryGrammarRepository


def build_client() -> tuple[TestClient, InMemoryGrammarRepository]:
    app = create_app()
    repository = InMemoryGrammarRepository()
    grammar_service = GrammarService(repository)
    analysis_service = GrammarAnalysisService(repository)

    app.dependency_overrides[get_grammar_service] = lambda: grammar_service
    app.dependency_overrides[get_analysis_service] = lambda: analysis_service

    client = TestClient(app)
    return client, repository


def create_sample_grammar(client: TestClient) -> int:
    payload = {
        "name": "Balanced",
        "grammar_type": "type_2",
        "non_terminals": ["S"],
        "terminals": ["a", "b"],
        "start_symbol": "S",
        "productions": [
            {"left": "S", "right": ["a", "S", "b"]},
            {"left": "S", "right": ["ε"]},
        ],
    }
    response = client.post("/api/v1/grammars/", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def test_parse_endpoint_returns_derivation_tree() -> None:
    client, _ = build_client()
    grammar_id = create_sample_grammar(client)

    response = client.post(
        f"/api/v1/grammars/{grammar_id}/parse",
        json={"input_string": "aabb"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["accepted"] is True
    assert body["derivation_tree"] is not None


def test_generate_endpoint_enforces_limit_validation() -> None:
    client, _ = build_client()
    grammar_id = create_sample_grammar(client)

    response = client.get(f"/api/v1/grammars/{grammar_id}/generate", params={"limit": 0})

    assert response.status_code == 400
    assert "detail" in response.json()
