/**
 * ChatPane.jsx — Orchestrates the chat area.
 *
 * Layout:   [messages area — flex-1, scrollable]
 *           [disclaimer strip]
 *           [input bar]
 *
 * The key fix: this component uses flex-col + min-h-0 + flex-1.
 * Without min-h-0 on the parent, the messages div cannot shrink
 * and the input gets pushed off screen on mobile.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Download } from "lucide-react";
import MessageBubble, { TypingBubble } from "./MessageBubble";
import Suggestions from "./Suggestions";
import InputBar from "./InputBar";
import Disclaimer from "./Disclaimer";
import InitOverlay from "./InitOverlay";
import { sendMessage, getHealth } from "../api";

const POLL_MS = 3500;
const MAX_RETRIES = 14;

export default function ChatPane({ language, onStatusChange }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [ready, setReady] = useState(false);
  const [backendStatus, setBackendStatus] = useState("connecting");
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const retryCount = useRef(0);

  // ── Status helper ───────────────────────────────────────
  const setStatus = useCallback((s) => {
    setBackendStatus(s);
    onStatusChange?.(s);
  }, [onStatusChange]);

  // ── Health polling ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const h = await getHealth();
        if (cancelled) return;
        if (h.rag_ready && h.llm_ready) {
          setReady(true);
          setStatus(h.llm_backend === "demo" ? "demo" : "ready");
          clearInterval(pollRef.current);
        } else {
          retryCount.current++;
          if (retryCount.current >= MAX_RETRIES) {
            setStatus("error");
            clearInterval(pollRef.current);
          }
        }
      } catch {
        if (cancelled) return;
        retryCount.current++;
        if (retryCount.current >= MAX_RETRIES) {
          setStatus("error");
          clearInterval(pollRef.current);
        }
      }
    }

    poll();
    pollRef.current = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [setStatus]);

  // ── Auto-scroll ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ── Send handler ────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!text.trim() || typing) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text.trim(),
      ts: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    const history = messages
      .filter((m) => !m.error)
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));

    try {
      const data = await sendMessage(text, language, history);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          backend: data.backend,
          ts: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            language === "ur"
              ? `معذرت، ایک خرابی آ گئی:\n\n${err.message}\n\nبیک اینڈ چل رہا ہے؟ README دیکھیں۔`
              : `Sorry, something went wrong:\n\n**${err.message}**\n\nIs the backend running? Check README.md for setup instructions.`,
          error: true,
          ts: new Date(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }, [messages, language, typing]);

  // ── Clear chat ──────────────────────────────────────────
  const clearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm(
      language === "ur"
        ? "کیا تمام گفتگو مٹانا چاہتے ہیں؟"
        : "Clear all messages?"
    )) setMessages([]);
  };

  // ── Export ──────────────────────────────────────────────
  const exportChat = () => {
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `kissan-chat-${Date.now()}.txt`;
    a.click();
  };

  const isEmpty = messages.length === 0;

  return (
    /*
     * flex-col + min-h-0 is the critical CSS pattern.
     * flex-1 fills remaining height after header.
     * min-h-0 allows children to scroll correctly inside flex containers.
     */
    <div className="flex flex-col flex-1 min-h-0 bg-forest-50 bg-grain">

      {/* ── Toolbar (only when messages exist) ── */}
      {!isEmpty && (
        <div className="flex-shrink-0 flex items-center justify-between
                        px-4 py-1.5 bg-white/70 backdrop-blur-sm
                        border-b border-forest-100 text-xs text-gray-400">
          <span>{messages.length} {language === "ur" ? "پیغامات" : "messages"}</span>
          <div className="flex gap-3">
            <button onClick={exportChat} title="Export"
                    className="hover:text-forest-600 transition-colors">
              <Download size={14} />
            </button>
            <button onClick={clearChat} title="Clear"
                    className="hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Messages area (scrollable) ── */}
      <div className="flex-1 min-h-0 chat-scroll px-3 sm:px-5 py-4 space-y-4">

        {/* Init overlay while backend warms up */}
        {!ready && <InitOverlay language={language} status={backendStatus} />}

        {/* Suggestions grid when empty + ready */}
        {ready && isEmpty && (
          <Suggestions language={language} onSelect={handleSend} />
        )}

        {/* Message bubbles */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} language={language} />
        ))}

        {/* Typing indicator */}
        {typing && <TypingBubble language={language} />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Disclaimer ── */}
      <Disclaimer language={language} />

      {/* ── Input bar ── */}
      <InputBar
        onSend={handleSend}
        loading={typing}
        disabled={!ready}
        language={language}
      />
    </div>
  );
}
