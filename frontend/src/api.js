/**
 * api.js — HTTP client for the FastAPI backend.
 *
 * Dev:  Vite proxy forwards /api/* → http://localhost:8000  (no CORS issues)
 * Prod: Set VITE_API_URL=https://your-railway-backend.up.railway.app in Vercel env vars
 */
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
    : "/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 45000, // 45 seconds — Groq responds in ~1s, but allow for cold starts
  headers: { "Content-Type": "application/json" },
});

// Log errors in development
client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (import.meta.env.DEV) {
      console.error("[API]", err.response?.data || err.message);
    }
    const msg =
      err.response?.data?.detail ||
      err.message ||
      "Network error. Is the backend running?";
    return Promise.reject(new Error(msg));
  }
);

/**
 * Send a chat message.
 * @param {string} message
 * @param {string} language  "en" | "ur"
 * @param {Array}  history   [{role, content}]
 */
export async function sendMessage(message, language = "en", history = []) {
  const res = await client.post("/chat", {
    message,
    language,
    history: history.slice(-6), // last 3 turns = 6 messages
  });
  return res.data; // { answer, sources, language, backend }
}

/**
 * Poll backend health.
 * @returns {{ status, rag_ready, llm_ready, llm_backend, key_configured }}
 */
export async function getHealth() {
  const res = await client.get("/health");
  return res.data;
}
