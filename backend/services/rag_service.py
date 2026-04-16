"""
rag_service.py - Retrieval-Augmented Generation using TF-IDF
Uses sklearn TF-IDF + cosine similarity — NO model downloads, NO heavy dependencies.
Starts instantly and works perfectly offline.
"""
import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "data" / "knowledge_base.json"
TOP_K = int(os.getenv("TOP_K", "3"))
MIN_SIMILARITY = 0.05  # Low threshold — TF-IDF scores are naturally lower than neural


class RAGService:
    """
    TF-IDF based RAG. Fast, zero-download, works on any Python 3.8+ system.
    Retrieves the most relevant knowledge base entries for each user query.
    """

    def __init__(self):
        self.knowledge_base: List[Dict[str, Any]] = []
        self.vectorizer: TfidfVectorizer = None
        self.doc_matrix = None
        self._ready = False

    def initialize(self) -> None:
        """Load knowledge base and build TF-IDF index. Takes <1 second."""
        logger.info("📚 Initializing RAG service (TF-IDF)...")

        # Load JSON
        if not KNOWLEDGE_BASE_PATH.exists():
            raise FileNotFoundError(f"Knowledge base not found: {KNOWLEDGE_BASE_PATH}")

        with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
            self.knowledge_base = json.load(f)

        # Build searchable corpus: question + answer preview + tags
        corpus = []
        for entry in self.knowledge_base:
            q = entry.get("question", "")
            a = entry.get("answer", "")[:300]
            tags = " ".join(entry.get("tags", []))
            topic = entry.get("topic", "")
            # Repeat question to give it more weight
            corpus.append(f"{q} {q} {topic} {tags} {a}")

        # Fit TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),       # unigrams and bigrams
            max_features=5000,
            sublinear_tf=True,        # dampen high-frequency terms
            analyzer="word",
            min_df=1,
        )
        self.doc_matrix = self.vectorizer.fit_transform(corpus)
        self._ready = True
        logger.info(f"✅ RAG ready — {len(self.knowledge_base)} entries indexed")

    def retrieve(self, query: str, top_k: int = TOP_K) -> List[Dict[str, Any]]:
        """Return top-k most relevant knowledge base entries for the query."""
        if not self._ready:
            return []

        q_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(q_vec, self.doc_matrix)[0]
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score >= MIN_SIMILARITY:
                entry = dict(self.knowledge_base[idx])
                entry["_similarity"] = round(score, 4)
                results.append(entry)

        return results

    def format_context(self, docs: List[Dict[str, Any]]) -> str:
        """Format retrieved docs as context string for the LLM."""
        if not docs:
            return ""
        parts = ["=== Relevant Knowledge from Database ==="]
        for i, doc in enumerate(docs, 1):
            lang_flag = "🇵🇰 Urdu" if doc.get("language") == "ur" else "🇬🇧 English"
            parts.append(
                f"\n[{i}] Topic: {doc.get('topic', '')} | {lang_flag}\n"
                f"Q: {doc.get('question', '')}\n"
                f"A: {doc.get('answer', '')}"
            )
        return "\n".join(parts)

    @property
    def is_ready(self) -> bool:
        return self._ready

    def stats(self) -> dict:
        return {
            "ready": self._ready,
            "entries": len(self.knowledge_base),
            "engine": "TF-IDF (sklearn)",
        }


# Singleton
rag_service = RAGService()
