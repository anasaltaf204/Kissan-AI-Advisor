/**
 * Header.jsx — App header bar.
 * Stays fixed at top. Shows brand, status pill, and language toggle.
 */
import React from "react";
import { Sprout, Languages, Wifi, WifiOff, Loader } from "lucide-react";

const STATUS = {
  connecting: { dot: "bg-amber-400 animate-pulse", label: "Connecting…" },
  ready:      { dot: "bg-emerald-400",             label: "Online" },
  demo:       { dot: "bg-amber-400",               label: "Demo Mode" },
  error:      { dot: "bg-red-400",                 label: "Offline" },
};

export default function Header({ language, onToggleLang, status }) {
  const s = STATUS[status] || STATUS.connecting;
  const isUr = language === "ur";

  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white shadow-lg z-10">
      <div className="flex items-center justify-between px-4 py-3 gap-3">

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 border border-white/20
                          flex items-center justify-center shadow-inner">
            <Sprout size={20} className="text-wheat-300" />
          </div>

          {/* Title */}
          <div className="min-w-0">
            <h1 className="font-display font-bold text-[15px] sm:text-lg leading-tight truncate text-white">
              {isUr ? "کسان AI مشیر" : "Kissan AI Advisor"}
            </h1>
            <p className="text-[11px] text-forest-300 leading-none mt-0.5 hidden xs:block">
              {isUr ? "پنجاب · راولپنڈی · پاکستان" : "Punjab · Rawalpindi · Pakistan"}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Status pill — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full
                          px-2.5 py-1 text-[11px] font-medium text-forest-100 border border-white/10">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
            {s.label}
          </div>

          {/* Language toggle */}
          <button
            onClick={onToggleLang}
            title={isUr ? "Switch to English" : "اردو میں تبدیل کریں"}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95
                       border border-white/20 rounded-full px-3 py-1.5 text-[12px] font-semibold
                       transition-all duration-150 select-none"
          >
            <Languages size={13} />
            <span>{isUr ? "EN" : "اردو"}</span>
          </button>
        </div>
      </div>

      {/* Mobile status strip */}
      {status !== "ready" && (
        <div className="sm:hidden flex items-center gap-1.5 px-4 pb-2 text-[11px] text-forest-300">
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
          {status === "demo" && (
            <span className="text-wheat-400 ml-1">
              {isUr ? "— Groq API key درکار ہے" : "— Add Groq API key for full AI"}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
