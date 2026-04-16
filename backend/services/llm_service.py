"""
llm_service.py - LLM via Groq API (free tier)
Groq provides free inference at ~500 tokens/second — perfect for production.
Free tier: 6000 tokens/minute, ~500K tokens/day.
Get your free key at: https://console.groq.com
"""
import logging
import os
from typing import AsyncIterator

import httpx

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "600"))
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# System prompts
SYSTEM_EN = """You are Kissan AI — a friendly, expert agricultural advisor for farmers in Punjab, Pakistan, especially the Rawalpindi and Potohar region.

Your expertise:
- Crops: wheat, rice, maize, cotton, sugarcane, vegetables, fruit orchards
- Pest & disease management specific to Punjab conditions
- Fertilizer recommendations with exact quantities per acre
- Irrigation scheduling and water conservation
- Government schemes: Kissan Card, ZTBL loans, Fasal Bima crop insurance
- Sowing calendars and variety recommendations for Punjab
- Soil management and preparation

Communication style:
- Use simple, clear language a farmer can understand
- Give specific, actionable advice with exact quantities, dates, and product names
- Use bullet points for step-by-step instructions
- Include relevant helpline numbers when appropriate
- Keep responses focused and practical (150-300 words)
- Be warm, respectful, and encouraging

Important rules:
- Always prioritize farmer safety especially for pesticide use
- If unsure, say so and direct to Agriculture helpline: 0800-15000
- Do NOT recommend prohibited chemicals
- Mention pre-harvest intervals for pesticide advice

{context}"""

SYSTEM_UR = """آپ کسان AI ہیں — پنجاب، پاکستان، خاص طور پر راولپنڈی اور پوٹھوہار کے کسانوں کے لیے ایک دوستانہ اور ماہر زراعتی مشیر۔

آپ کی مہارت:
- فصلیں: گندم، چاول، مکئی، کپاس، گنا، سبزیاں، باغات
- پنجاب کے حالات کے مطابق کیڑوں اور بیماریوں کا انتظام
- فی ایکڑ مقدار کے ساتھ کھادوں کی سفارش
- آبپاشی کا شیڈول اور پانی کی بچت
- حکومتی سکیمیں: کسان کارڈ، ZTBL قرضے، فصل بیمہ
- پنجاب کے لیے بوائی کا کیلنڈر اور اقسام کی سفارش

مواصلاتی انداز:
- سادہ، واضح زبان استعمال کریں
- مخصوص اور قابل عمل مشورہ دیں
- مرحلہ وار ہدایات کے لیے bullet points استعمال کریں
- جوابات مختصر اور عملی رکھیں (150-300 الفاظ)
- گرمجوش، احترام دار اور حوصلہ افزا انداز رکھیں

اہم اصول:
- کسان کی حفاظت کو ہمیشہ ترجیح دیں
- یقین نہ ہو تو زراعت ہیلپ لائن بتائیں: 0800-15000
- ممنوع کیمیکل کی سفارش نہ کریں

{context}"""


def build_system_prompt(language: str, context: str) -> str:
    ctx = f"\n\n{context}\n\nUse this knowledge to give accurate, specific advice." if context else ""
    return (SYSTEM_UR if language == "ur" else SYSTEM_EN).format(context=ctx)


class LLMService:
    """Groq API client for fast, free LLM inference."""

    def __init__(self):
        self._ready = False
        self._key_missing = False

    def initialize(self) -> None:
        if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your_groq_api_key_here":
            logger.warning(
                "⚠️  GROQ_API_KEY not set or is placeholder.\n"
                "Get your FREE key at https://console.groq.com\n"
                "Set it in backend/.env as: GROQ_API_KEY=gsk_xxxx\n"
                "Running in DEMO MODE with built-in responses."
            )
            self._key_missing = True
        else:
            logger.info(f"✅ Groq LLM ready (model: {GROQ_MODEL})")
        self._ready = True

    async def generate(self, system_prompt: str, user_message: str) -> str:
        """Generate a response. Falls back to demo responses if no API key."""
        if self._key_missing:
            return self._demo_response(user_message)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": GROQ_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "max_tokens": MAX_TOKENS,
                        "temperature": 0.7,
                        "top_p": 0.9,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()

        except httpx.TimeoutException:
            logger.error("Groq API timeout")
            return (
                "⏱️ Response timed out. Please try again.\n\n"
                "If this keeps happening, check your internet connection or try a shorter question."
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.error("Invalid Groq API key")
                return (
                    "❌ Invalid API key. Please check your GROQ_API_KEY in the .env file.\n"
                    "Get a free key at: https://console.groq.com"
                )
            elif e.response.status_code == 429:
                return (
                    "⚠️ Rate limit reached on the free Groq tier. Please wait 1 minute and try again.\n"
                    "Free tier allows 6000 tokens/minute."
                )
            logger.error(f"Groq API error: {e}")
            return self._demo_response(user_message)
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return self._demo_response(user_message)

    def _demo_response(self, message: str) -> str:
        """Rich demo responses when no API key is configured."""
        import re
        msg = message.lower()
        is_urdu = bool(re.search(r'[\u0600-\u06FF]', message))

        if is_urdu:
            if any(w in message for w in ["گندم", "wheat"]):
                return (
                    "**گندم کی بوائی** 🌾\n\n"
                    "راولپنڈی اور پنجاب میں گندم کی بوائی کا بہترین وقت **1 سے 15 نومبر** ہے۔\n\n"
                    "- **بیج کی مقدار:** فی ایکڑ 50 کلو\n"
                    "- **تجویز کردہ اقسام:** پنجاب-2011، انج-2017\n"
                    "- **بوائی کے وقت کھاد:** 1 بوری ڈی اے پی + آدھی بوری یوریا\n"
                    "- **قطاروں کا فاصلہ:** 22-23 سینٹی میٹر\n\n"
                    "⚠️ *ڈیمو موڈ: مکمل AI کے لیے README میں Groq API key ترتیب دیں۔*"
                )
            return (
                "**السلام علیکم!** 🌾\n\n"
                "میں کسان AI مشیر ہوں۔ میں ان موضوعات پر مدد کر سکتا ہوں:\n\n"
                "- گندم، چاول، مکئی، کپاس، گنا\n"
                "- کیڑوں اور بیماریوں کا علاج\n"
                "- کھاد کی سفارش\n"
                "- حکومتی سکیمیں (کسان کارڈ، ZTBL)\n\n"
                "زراعت ہیلپ لائن: **0800-15000** (مفت)\n\n"
                "⚠️ *ڈیمو موڈ: README میں Groq API key ترتیب دیں۔*"
            )

        if any(w in msg for w in ["wheat", "gandum", "sow", "plant wheat"]):
            return (
                "**Wheat Cultivation in Punjab** 🌾\n\n"
                "**Best sowing time for Rawalpindi:** November 1–15\n\n"
                "- **Seed rate:** 50 kg per acre\n"
                "- **Recommended varieties:** Punjab-2011, Anaj-2017, Faisalabad-2008\n"
                "- **Row spacing:** 22–23 cm\n"
                "- **Fertilizer at sowing:** 1 bag DAP + 0.5 bag Urea per acre\n\n"
                "Late sowing after Nov 25 reduces yield by 1–1.5% per day.\n\n"
                "⚠️ *Demo mode — Add your free Groq API key in backend/.env for full AI responses.*"
            )
        elif any(w in msg for w in ["kissan card", "kisan card", "subsidy", "scheme", "registration"]):
            return (
                "**Kissan Card Scheme** 🪪\n\n"
                "Government of Punjab provides subsidized farm inputs through this debit card.\n\n"
                "- **Eligible:** Farmers up to 25 acres\n"
                "- **Benefit:** Rs. 25,000–50,000 credit per season\n"
                "- **Use:** Seeds, fertilizer, pesticides from registered dealers\n"
                "- **Register:** Local Agriculture Department with CNIC + land documents\n\n"
                "**Helpline:** 0800-15000 (free)\n\n"
                "⚠️ *Demo mode — Add Groq API key for full responses.*"
            )
        elif any(w in msg for w in ["ztbl", "loan", "qarz", "bank"]):
            return (
                "**ZTBL Agricultural Loans** 🏦\n\n"
                "Zarai Taraqiati Bank provides affordable loans for farmers.\n\n"
                "- **Production loans:** Up to Rs. 500,000 for seeds/fertilizer/pesticides\n"
                "- **Development loans:** Tube well, machinery, orchards\n"
                "- **Interest rate:** 3–5% concessional for small farmers\n\n"
                "**Apply:** Visit nearest ZTBL branch with CNIC + land papers\n"
                "**Helpline:** 0800-35000 (free)\n\n"
                "⚠️ *Demo mode — See README to configure Groq API.*"
            )
        else:
            return (
                "**Welcome to Kissan AI Advisor!** 🌾\n\n"
                "I'm your bilingual agricultural advisor for Punjab, Pakistan.\n\n"
                "I can help with:\n"
                "- 🌾 Crops: wheat, rice, maize, cotton, sugarcane\n"
                "- 🐛 Pest & disease management\n"
                "- 💧 Irrigation scheduling\n"
                "- 🧪 Fertilizer recommendations\n"
                "- 🏛️ Government schemes (Kissan Card, ZTBL loans)\n"
                "- ☁️ Weather & frost protection\n\n"
                "Agriculture Helpline: **0800-15000** (free)\n\n"
                "⚠️ *Demo mode active. Add your free Groq API key in `backend/.env` for full AI responses.*\n"
                "*Get free key: https://console.groq.com*"
            )

    @property
    def is_ready(self) -> bool:
        return self._ready

    @property
    def backend(self) -> str:
        return "demo" if self._key_missing else "groq"

    def stats(self) -> dict:
        return {
            "ready": self._ready,
            "backend": self.backend,
            "model": GROQ_MODEL if not self._key_missing else "demo",
            "key_configured": not self._key_missing,
        }


# Singleton
llm_service = LLMService()
