/**
 * Suggestions.jsx — Welcome screen with quick-start chips.
 * Shown when chat is empty and backend is ready.
 */
import React from "react";

const EN = [
  { e: "🌾", t: "When to sow wheat in Punjab?" },
  { e: "🐛", t: "Yellow rust treatment on wheat?" },
  { e: "💧", t: "How many irrigations does wheat need?" },
  { e: "🪪", t: "How do I get a Kissan Card?" },
  { e: "🌽", t: "Best time to plant maize?" },
  { e: "❄️", t: "How to protect crops from frost?" },
  { e: "🏦", t: "How to get a ZTBL loan?" },
  { e: "🥬", t: "Winter vegetables for Rawalpindi?" },
];

const UR = [
  { e: "🌾", t: "گندم کی بوائی کب کریں؟" },
  { e: "🐛", t: "گندم کی زنگ کا علاج کیسے کریں؟" },
  { e: "💧", t: "گندم کو کتنے پانی کی ضرورت ہے؟" },
  { e: "🪪", t: "کسان کارڈ کیسے بنوائیں؟" },
  { e: "🌿", t: "کپاس کی سفید مکھی کا علاج؟" },
  { e: "❄️", t: "پالے سے فصل کیسے بچائیں؟" },
  { e: "🏦", t: "ZTBL سے قرضہ کیسے ملتا ہے؟" },
  { e: "🥬", t: "راولپنڈی میں سردیوں کی سبزیاں؟" },
];

export default function Suggestions({ language, onSelect }) {
  const isUr = language === "ur";
  const chips = isUr ? UR : EN;

  return (
    <div className="px-1 pb-2 animate-fade-up">
      {/* Welcome card */}
      <div className="text-center py-6 px-4">
        {/* Logo mark */}
        <div className="relative inline-block mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800
                          flex items-center justify-center shadow-lg mx-auto">
            <span className="text-3xl">🌾</span>
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full
                           border-2 border-white flex items-center justify-center text-[9px]">
            AI
          </span>
        </div>

        <h2 className={`font-display font-bold text-forest-900 text-xl mb-1
                        ${isUr ? "urdu" : ""}`}>
          {isUr ? "السلام علیکم! میں کسان AI ہوں" : "Assalam-o-Alaikum! I'm Kissan AI"}
        </h2>
        <p className={`text-sm text-gray-500 max-w-xs mx-auto leading-relaxed
                       ${isUr ? "urdu" : ""}`}>
          {isUr
            ? "پنجاب، پاکستان کے کسانوں کے لیے زرعی مشیر — کوئی بھی سوال پوچھیں"
            : "Agricultural advisor for Punjab farmers — ask me anything about crops, pests, fertilizers & schemes"}
        </p>

        {/* Quick stats */}
        <div className="flex justify-center gap-4 mt-4">
          {[
            { n: "35+", l: isUr ? "موضوعات" : "Topics" },
            { n: "2", l: isUr ? "زبانیں" : "Languages" },
            { n: "100%", l: isUr ? "مفت" : "Free" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-bold text-forest-700 text-sm">{s.n}</p>
              <p className="text-[11px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chips grid */}
      <p className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wide
                     mb-2 px-1 ${isUr ? "urdu text-right" : ""}`}>
        {isUr ? "جلدی سوالات" : "Quick questions"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {chips.map((c, i) => (
          <button
            key={i}
            onClick={() => onSelect(c.t)}
            className={`
              flex items-start gap-2.5 text-left
              bg-white hover:bg-forest-50 active:bg-forest-100
              border border-forest-100 hover:border-forest-300
              rounded-2xl p-3 text-sm text-gray-700
              transition-all duration-150 active:scale-[0.97] shadow-sm
              ${isUr ? "flex-row-reverse urdu text-right" : ""}
            `}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{c.e}</span>
            <span className="leading-snug text-[12px]">{c.t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
