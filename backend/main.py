"""
main.py - Kissan AI Advisor Backend
FastAPI application with RAG + Groq LLM.

Local run:
    cd backend
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Production (Railway):
    uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
"""
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load .env BEFORE importing services (they read env vars at import time)
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.rag_service import rag_service
from services.llm_service import llm_service
from routers.chat import router as chat_router

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("kissan")


# ── Startup / Shutdown ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 55)
    logger.info("🌾  Kissan AI Advisor — Starting")
    logger.info("=" * 55)

    # Initialize RAG (instant — TF-IDF, no downloads)
    try:
        rag_service.initialize()
    except Exception as e:
        logger.error(f"RAG init failed: {e}")

    # Initialize LLM (validates API key, very fast)
    try:
        llm_service.initialize()
    except Exception as e:
        logger.error(f"LLM init failed: {e}")

    logger.info(f"✅ Ready | RAG={rag_service.is_ready} | LLM={llm_service.backend}")
    logger.info("=" * 55)

    yield  # ← app runs here

    logger.info("🛑 Shutting down")


# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="Kissan AI Advisor",
    description="Bilingual agricultural chatbot for Punjab, Pakistan farmers.",
    version="2.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
)
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(chat_router)


@app.get("/", tags=["root"])
async def root():
    return {
        "app": "Kissan AI Advisor",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "chat": "/api/chat  [POST]",
        "status": "running",
    }


# ── Direct run ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
        log_level="info",
    )
