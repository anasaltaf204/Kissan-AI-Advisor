"""
routers/chat.py - Chat API endpoints
Pipeline: User message -> TF-IDF RAG retrieval -> System prompt -> Groq LLM -> Response
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.rag_service import rag_service
from services.llm_service import llm_service, build_system_prompt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


# ── Pydantic schemas ──────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=4096)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    language: str = Field(default="en", pattern="^(en|ur)$")
    history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    sources: List[dict] = []
    language: str = "en"
    backend: str = "unknown"


class HealthResponse(BaseModel):
    status: str
    rag_ready: bool
    llm_ready: bool
    llm_backend: str
    rag_entries: int
    key_configured: bool


# ── Routes ────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health():
    """Health check — frontend polls this on startup."""
    rag_stats = rag_service.stats()
    llm_stats = llm_service.stats()
    return HealthResponse(
        status="ok" if (rag_service.is_ready and llm_service.is_ready) else "initializing",
        rag_ready=rag_service.is_ready,
        llm_ready=llm_service.is_ready,
        llm_backend=llm_service.backend,
        rag_entries=rag_stats.get("entries", 0),
        key_configured=llm_stats.get("key_configured", False),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main chat endpoint.
    1. Retrieve relevant docs via TF-IDF RAG
    2. Build system prompt with context
    3. Call Groq LLM
    4. Return answer + sources
    """
    if not llm_service.is_ready:
        raise HTTPException(status_code=503, detail="Service is initializing. Please retry in a moment.")

    msg = req.message.strip()
    lang = req.language

    logger.info(f"Chat | lang={lang} | msg='{msg[:60]}'")

    # 1. RAG retrieval
    docs = rag_service.retrieve(msg) if rag_service.is_ready else []
    context = rag_service.format_context(docs)

    # 2. Build prompt
    system_prompt = build_system_prompt(lang, context)

    # 3. Generate
    answer = await llm_service.generate(system_prompt, msg)

    # 4. Format sources (strip internal fields)
    sources = [
        {
            "topic": d.get("topic", ""),
            "question": d.get("question", "")[:80],
            "language": d.get("language", "en"),
            "score": round(d.get("_similarity", 0.0), 3),
        }
        for d in docs
    ]

    logger.info(f"Response | backend={llm_service.backend} | chars={len(answer)}")
    return ChatResponse(answer=answer, sources=sources, language=lang, backend=llm_service.backend)
