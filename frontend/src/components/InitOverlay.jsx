/**
 * InitOverlay.jsx — Shown while backend is starting up.
 * Backend is fast now (TF-IDF + Groq key validation = ~2 seconds).
 */
import React, { useState, useEffect } from "react";
import { Loader2, Server, Zap, CheckCircle2, XCircle } from "lucide-react";

export default function InitOverlay({ language, status }) {
  const [dots, setDots] = useState(1);
  const isUr = language === "ur";

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 600);
    return () => clearInterval(t);
  }, []);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-up">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200
                        flex items-center justify-center">
          <XCircle size={28} className="text-red-400" />
        </div>
        <div className="text-center max-w-xs">
          <h3 className={`font-semibold text-red-700 mb-1 ${isUr ? "urdu" : ""}`}>
            {isUr ? "بیک اینڈ سے منسلک نہیں ہو سکا" : "Cannot connect to backend"}
          </h3>
          <p className={`text-sm text-gray-500 leading-relaxed ${isUr ? "urdu" : ""}`}>
            {isUr
              ? "یقینی کریں کہ بیک اینڈ پورٹ 8000 پر چل رہا ہے:\ncd backend && uvicorn main:app --port 8000"
              : "Make sure the backend is running on port 8000:\n"}
          </p>
          {!isUr && (
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-2 text-gray-700">
              cd backend && uvicorn main:app --port 8000
            </code>
          )}
        </div>
      </div>
    );
  }

  const steps = isUr
    ? ["ڈیٹا بیس لوڈ ہو رہی ہے…", "AI سروس شروع ہو رہی ہے…", "تقریباً تیار…"]
    : ["Loading knowledge base…", "Connecting to AI service…", "Almost ready…"];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 animate-fade-up">
      {/* Spinner */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800
                        flex items-center justify-center shadow-lg">
          <span className="text-3xl">🌾</span>
        </div>
        <Loader2 size={20} className="absolute -top-2 -right-2 text-forest-500 animate-spin" />
      </div>

      <div className="text-center">
        <h3 className={`font-display font-bold text-forest-800 text-lg mb-1 ${isUr ? "urdu" : ""}`}>
          {isUr ? "کسان AI شروع ہو رہا ہے" : "Starting Kissan AI"}
          {"·".repeat(dots)}
        </h3>
        <p className={`text-sm text-gray-500 ${isUr ? "urdu" : ""}`}>
          {isUr ? "چند لمحات انتظار کریں" : "This takes just a few seconds"}
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 w-full max-w-[220px]">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-5 h-5 rounded-full bg-forest-100 flex-shrink-0
                            flex items-center justify-center">
              <Server size={11} className="text-forest-500" />
            </div>
            <span className={`text-xs ${isUr ? "urdu" : ""}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
