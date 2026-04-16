/**
 * MessageBubble.jsx — Renders a single chat message.
 * Supports: markdown-like formatting, Urdu RTL, source chips, error state.
 */
import React from "react";
import { Bot, User, AlertCircle } from "lucide-react";

/** Detect Urdu/Arabic script */
function isUrduText(text) {
  return /[\u0600-\u06FF]/.test(text);
}

/** Convert simple markdown to safe HTML */
function renderMarkdown(raw) {
  if (!raw) return "";

  // Escape HTML entities
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold **text**
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic *text*  (but not ** already handled)
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Bullet lists: lines starting with - or •
  s = s.replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>");
  // Numbered lists
  s = s.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  // Wrap consecutive <li> in <ul>
  s = s.replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g, (m) => `<ul>${m}</ul>`);

  // Paragraphs — double newlines
  const blocks = s.split(/\n{2,}/);
  s = blocks
    .map((b) => {
      const t = b.trim();
      if (t.startsWith("<ul>") || t.startsWith("<li>")) return t;
      return `<p>${t.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  return s;
}

/** Source attribution chips */
function SourceChips({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sources.slice(0, 3).map((s, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[10px] font-medium
                     bg-forest-50 text-forest-700 border border-forest-200
                     rounded-full px-2 py-0.5"
          title={`Relevance: ${(s.score * 100).toFixed(0)}%`}
        >
          📚 {s.topic?.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

/** Format timestamp */
function fmtTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ── User message ── */
function UserBubble({ msg }) {
  const ur = isUrduText(msg.content);
  return (
    <div className="flex items-end gap-2 justify-end animate-fade-up">
      <div className="max-w-[78%] sm:max-w-[65%] flex flex-col items-end">
        <div
          className={`bg-gradient-to-br from-forest-600 to-forest-700 text-white
                      rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm
                      text-sm leading-relaxed whitespace-pre-wrap
                      ${ur ? "urdu text-right" : ""}`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 mr-1">{fmtTime(msg.ts)}</span>
      </div>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wheat-400
                      flex items-center justify-center shadow-sm">
        <User size={15} className="text-white" />
      </div>
    </div>
  );
}

/** ── Bot message ── */
function BotBubble({ msg, language }) {
  const ur = isUrduText(msg.content);
  const html = renderMarkdown(msg.content);

  return (
    <div className="flex items-end gap-2 animate-fade-up">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full
                      bg-gradient-to-br from-forest-500 to-forest-700
                      flex items-center justify-center shadow-sm">
        <Bot size={15} className="text-white" />
      </div>

      <div className="max-w-[82%] sm:max-w-[70%]">
        {/* Bot label */}
        <p className="text-[11px] font-semibold text-forest-600 mb-1 ml-1">
          🌾 Kissan AI
          {msg.backend === "demo" && (
            <span className="ml-1 text-amber-500 font-normal">[demo]</span>
          )}
        </p>

        {/* Bubble */}
        <div
          className={`rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 text-sm
                      ${msg.error
                        ? "bg-red-50 border border-red-200"
                        : "bg-white border border-forest-100"
                      }`}
        >
          {msg.error ? (
            <div className="flex gap-2 items-start text-red-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          ) : (
            <div
              className={`prose-msg text-gray-800 leading-relaxed ${ur ? "urdu text-right" : ""}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        {!msg.error && <SourceChips sources={msg.sources} />}
        <span className="text-[10px] text-gray-400 mt-1 ml-1 block">{fmtTime(msg.ts)}</span>
      </div>
    </div>
  );
}

/** ── Typing indicator ── */
export function TypingBubble() {
  return (
    <div className="flex items-end gap-2 animate-fade-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full
                      bg-gradient-to-br from-forest-500 to-forest-700
                      flex items-center justify-center shadow-sm">
        <Bot size={15} className="text-white" />
      </div>
      <div className="bg-white border border-forest-100 rounded-2xl rounded-bl-sm
                      shadow-sm px-4 py-3">
        <p className="text-[11px] font-semibold text-forest-600 mb-2">🌾 Kissan AI</p>
        <div className="flex gap-1.5 items-center">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`w-2 h-2 rounded-full bg-forest-400 animate-bounce-dot dot-${n}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** ── Default export ── */
export default function MessageBubble({ msg, language }) {
  return msg.role === "user"
    ? <UserBubble msg={msg} />
    : <BotBubble msg={msg} language={language} />;
}
