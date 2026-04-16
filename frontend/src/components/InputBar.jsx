/**
 * InputBar.jsx — Message input, fully mobile-optimized.
 * - Auto-resize textarea (1 line → max 5 lines)
 * - Enter to send, Shift+Enter for newline
 * - Character limit with counter
 * - Safe-area padding for iOS home bar
 */
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

const MAX = 600;

export default function InputBar({ onSend, loading, disabled, language }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const isUr = language === "ur";

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  }, [text]);

  const canSend = text.trim().length > 0 && !loading && !disabled && text.length <= MAX;

  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const remaining = MAX - text.length;
  const nearLimit = remaining < 80;

  return (
    <div className="flex-shrink-0 bg-white border-t border-forest-100 safe-bottom">
      <div className="px-3 sm:px-4 py-2.5 flex items-end gap-2.5">

        {/* Textarea wrapper */}
        <div className="flex-1 relative">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            disabled={disabled || loading}
            dir={isUr ? "rtl" : "ltr"}
            placeholder={
              disabled
                ? (isUr ? "شروع ہو رہا ہے…" : "Starting up…")
                : (isUr
                    ? "اپنا سوال لکھیں… (مثال: گندم کب بوئیں؟)"
                    : "Ask a farming question… (e.g. When to sow wheat?)")
            }
            rows={1}
            className={`
              w-full resize-none rounded-2xl border text-sm
              px-4 py-2.5 pr-${nearLimit ? "14" : "4"}
              bg-forest-50 border-forest-200 text-gray-800
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${isUr ? "urdu text-right" : ""}
              ${text.length > MAX ? "border-red-300 bg-red-50" : ""}
            `}
            style={{ minHeight: "44px", maxHeight: "130px" }}
          />

          {/* Character counter */}
          {nearLimit && (
            <span
              className={`absolute bottom-2.5 right-3 text-[10px] font-medium
                          ${text.length > MAX ? "text-red-500" : "text-gray-400"}`}
            >
              {remaining}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={send}
          disabled={!canSend}
          aria-label="Send"
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-150 shadow-sm
            ${canSend
              ? "bg-forest-600 hover:bg-forest-700 text-white active:scale-90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
        >
          {loading
            ? <Loader2 size={17} className="animate-spin" />
            : <Send size={17} className={isUr ? "rotate-180" : ""} />}
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-gray-400 pb-2 px-4">
        {isUr
          ? "Enter دبائیں یا بھیجیں بٹن کلک کریں"
          : "Enter to send · Shift+Enter for new line"}
      </p>
    </div>
  );
}
