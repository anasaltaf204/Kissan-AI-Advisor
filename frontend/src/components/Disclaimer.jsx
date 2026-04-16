/**
 * Disclaimer.jsx — Dismissible advisory notice at bottom of chat.
 */
import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function Disclaimer({ language }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  const isUr = language === "ur";

  return (
    <div className="flex-shrink-0 bg-wheat-50 border-t border-wheat-200 px-4 py-1.5">
      <div className="flex items-start gap-2 max-w-2xl mx-auto">
        <AlertTriangle size={13} className="text-wheat-600 flex-shrink-0 mt-0.5" />
        <p className={`text-[11px] text-wheat-700 flex-1 leading-relaxed ${isUr ? "urdu text-right" : ""}`}>
          {isUr
            ? "مشاورتی مقاصد کے لیے ہے۔ اہم فیصلوں کے لیے اپنے مقامی زرعی ترقیاتی افسر سے رابطہ کریں۔ ہیلپ لائن: 0800-15000"
            : "For advisory purposes only. For critical decisions consult your local Agriculture Extension Officer. Helpline: 0800-15000 (free)"}
        </p>
        <button
          onClick={() => setGone(true)}
          className="text-wheat-400 hover:text-wheat-600 flex-shrink-0 mt-0.5"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
