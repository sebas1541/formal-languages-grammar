"""AI service for grammar explanations using Gemini."""
from __future__ import annotations

from google import genai
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.core.config import get_settings
from app.domain.entities.grammar import Grammar


class AIService:
    """Service for AI-powered grammar explanations."""

    def __init__(self):
        """Initialize AI service with Gemini API."""
        settings = get_settings()
        if not settings.gemini_api_key:
            raise HTTPException(
                status_code=500,
                detail="Gemini API key not configured"
            )
        
        # Store config for creating clients
        self.api_key = settings.gemini_api_key
        self.model_name = "gemini-2.5-flash"
        self.generation_config = genai.types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=2048,
        )

    def _build_prompt(self, grammar: Grammar) -> str:
        """Build a prompt for explaining the grammar."""
        grammar_type = "Libre de Contexto (Tipo 2)" if grammar.grammar_type == "type_2" else "Regular (Tipo 3)"
        
        productions_text = "\n".join(
            f"{prod.left} → {' '.join(prod.right)}"
            for prod in grammar.productions
        )
        
        prompt = f"""Eres un profesor de teoría de la computación. Explica esta gramática formal:

**Gramática: {grammar.name}**
- Tipo: {grammar_type}
- Inicio: {grammar.start_symbol}
- No terminales: {', '.join(grammar.non_terminals)}
- Terminales: {', '.join(grammar.terminals)}

Producciones:
{productions_text}

Escribe UNA explicación en markdown que incluya:
1. Qué lenguaje genera
2. Cómo funcionan las producciones
3. 2-3 ejemplos de cadenas válidas
4. Patrón interesante

Formato: usa ## para títulos, **bold**, listas con -, y ` para código.
IMPORTANTE: Usa doble salto de línea entre párrafos para separarlos visualmente.
Máximo 250 palabras. Sé directo y claro."""
        
        return prompt

    def explain_grammar_stream(self, grammar: Grammar):
        """Generate grammar explanation from Gemini."""
        prompt = self._build_prompt(grammar)
        
        try:
            with genai.Client(api_key=self.api_key) as client:
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=self.generation_config
                )
                
                if response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if candidate.content and candidate.content.parts:
                        text = "".join(part.text for part in candidate.content.parts if part.text)
                        return {"text": text}
                
                return {"text": "No se pudo generar una explicación."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    def ask_about_grammar_stream(self, grammar: Grammar, question: str, context: str = ""):
        """Generate AI response to a specific question about the grammar."""
        grammar_type = "Libre de Contexto (Tipo 2)" if grammar.grammar_type == "type_2" else "Regular (Tipo 3)"
        
        productions_text = "\n".join(
            f"{prod.left} → {' '.join(prod.right)}"
            for prod in grammar.productions
        )
        
        prompt = f"""Gramática: {grammar.name} ({grammar_type})
Inicio: {grammar.start_symbol}
Producciones:
{productions_text}

Conversación previa:
{context}

Pregunta: {question}

Responde en markdown (usa ##, **bold**, listas, `code`).
IMPORTANTE: Usa doble salto de línea entre párrafos para separarlos.
Máximo 150 palabras. Sé directo."""

        try:
            with genai.Client(api_key=self.api_key) as client:
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=self.generation_config
                )
                
                if response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if candidate.content and candidate.content.parts:
                        text = "".join(part.text for part in candidate.content.parts if part.text)
                        return {"text": text}
                
                return {"text": "No se pudo generar una respuesta."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
