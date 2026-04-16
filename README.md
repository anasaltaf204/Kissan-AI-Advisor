# 🌾 Kissan AI Advisor — کسان AI مشیر

<div align="center">

**Bilingual AI Agricultural Chatbot for Punjab, Pakistan Farmers**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue)](https://python.org)
[![Node 18+](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Free-orange)](https://console.groq.com)

*Aligned with Pakistan's National AI Policy — AI for agriculture and rural inclusion*

</div>

---

## 📖 What Is This?

**Kissan AI Advisor** is a full-stack, production-ready bilingual (Urdu + English) agricultural chatbot for farmers in **Punjab, Pakistan** — especially the **Rawalpindi and Potohar** region.

It combines:
- **RAG (Retrieval-Augmented Generation)** using TF-IDF search over a 35-entry bilingual knowledge base
- **Groq free API** for blazing-fast LLM inference (~1 second responses, no GPU needed)
- **Beautiful React frontend** — fully responsive, works on Android phones and laptops

### 🇵🇰 Why This Matters

Pakistan's agricultural sector employs 37% of its workforce. Most farmers speak Urdu and have limited access to quality digital advice. This project demonstrates how AI can bridge that gap — locally, affordably, and bilingually.

---

## ✨ Features

| Feature | Detail |
|---------|--------|
| 🌾 **Bilingual** | Full Urdu (Nastaliq) and English with one-click toggle |
| ⚡ **Fast** | ~1 second responses via Groq free tier |
| 📱 **Mobile-first** | Tested on Android phones, fills full screen |
| 🧠 **RAG** | 35+ knowledge base entries on Punjab crops, pests, schemes |
| 🔒 **Free** | Groq free tier: 500,000 tokens/day — zero cost |
| 🌿 **Crops** | Wheat, rice, maize, cotton, sugarcane, vegetables, orchards |
| 🐛 **Pests** | Yellow rust, whitefly, fall armyworm, locust, and more |
| 🏛️ **Schemes** | Kissan Card, ZTBL loans, Fasal Bima, fertilizer subsidy |
| 💾 **Lightweight** | No model download, ~150 MB total install |
| 📤 **Export** | Save chat as text file |

---

## 🏗️ Architecture

```
User (Browser / Phone)
        │
        ▼
   React Frontend (Vite + Tailwind)
        │  axios POST /api/chat
        ▼
   FastAPI Backend
        ├── TF-IDF RAG  ←  knowledge_base.json (35 entries)
        │   (sklearn, zero downloads, <1s startup)
        │
        └── Groq API  →  llama-3.1-8b-instant
            (free tier, ~1s response)
```

---

## 📁 Project Structure

```
kissan-ai-advisor/
├── README.md
├── LICENSE
├── .gitignore
├── requirements.txt          ← backend deps (for Railway root install)
├── Procfile                  ← Railway/Heroku start command
├── railway.json              ← Railway config
│
├── backend/
│   ├── main.py               ← FastAPI app entry point
│   ├── requirements.txt      ← backend Python dependencies
│   ├── .env.example          ← copy to .env and fill in your key
│   ├── routers/
│   │   └── chat.py           ← /api/chat and /api/health endpoints
│   ├── services/
│   │   ├── rag_service.py    ← TF-IDF retrieval
│   │   └── llm_service.py    ← Groq API + demo fallback
│   └── data/
│       └── knowledge_base.json  ← 35 bilingual agriculture entries
│
└── frontend/
    ├── package.json
    ├── vite.config.js        ← dev proxy → backend
    ├── tailwind.config.js
    ├── vercel.json           ← Vercel SPA routing
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           ← fullscreen layout
        ├── api.js            ← axios API client
        ├── index.css         ← global styles + Urdu RTL
        └── components/
            ├── Header.jsx
            ├── ChatPane.jsx      ← chat orchestration
            ├── MessageBubble.jsx ← message rendering + markdown
            ├── InputBar.jsx      ← textarea + send
            ├── Suggestions.jsx   ← quick-start chips
            ├── InitOverlay.jsx   ← loading state
            └── Disclaimer.jsx    ← advisory notice
```

---

## 🔑 Step 0 — Get a FREE Groq API Key (Required)

The app uses Groq for LLM inference. It is **completely free** — no credit card needed.

1. Go to **https://console.groq.com**
2. Click **Sign Up** → verify email
3. Go to **API Keys** → click **Create API Key**
4. Copy the key — it looks like: `gsk_xxxxxxxxxxxxxxxxxxxx`
5. You will paste this in Step 3 below

**Free tier limits:** 6,000 tokens/minute · 500,000 tokens/day — more than enough for demos and real use.

> **Without the key:** The app still runs in Demo Mode with built-in responses. Good for testing the UI, but the AI won't answer custom questions.

---

## 🖥️ Prerequisites

Install these before proceeding:

| Tool | Version | Download |
|------|---------|----------|
| Python | **3.11 or 3.12** | https://python.org/downloads/ |
| Node.js | **18, 20, or 22 LTS** | https://nodejs.org/en/download/ |
| Git | Any | https://git-scm.com/download/win |

**Windows install tips:**
- When installing Python, **check "Add Python to PATH"** on the first screen
- When installing Node.js, accept all defaults
- After installing, open a **new** Command Prompt to verify:

```cmd
python --version
node --version
npm --version
```

You should see version numbers. If `python` is not found, try `python3`.

---

## 🚀 Local Setup (Windows — Step by Step)

### Step 1 — Download the project

**Option A — If you have Git:**
```cmd
git clone https://github.com/your-username/kissan-ai-advisor.git
cd kissan-ai-advisor
```

**Option B — If you downloaded the ZIP:**
```cmd
cd Downloads
cd kissan-ai-advisor
```

---

### Step 2 — Set up the Backend

Open **Command Prompt** (`Win + R` → type `cmd` → Enter):

```cmd
cd kissan-ai-advisor\backend
```

Create a virtual environment (keeps packages isolated):
```cmd
python -m venv venv
```

Activate it:
```cmd
venv\Scripts\activate
```

You should see `(venv)` at the start of your prompt. Now install packages:
```cmd
pip install -r requirements.txt
```

This downloads ~50 MB and takes 1–3 minutes. You should see packages installing.

> **If `pip install` fails with SSL error:** Run `python -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt`

---

### Step 3 — Configure Environment Variables

Still inside `backend/`, create your `.env` file:

```cmd
copy .env.example .env
```

Now open `.env` with Notepad:
```cmd
notepad .env
```

Find this line:
```
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Replace `gsk_your_groq_api_key_here` with your actual Groq key from Step 0:
```
GROQ_API_KEY=gsk_abc123yourrealkeyhere
```

Also update the ALLOWED_ORIGINS to include your frontend URL:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Save and close Notepad (`Ctrl+S`, then close).

---

### Step 4 — Start the Backend

Make sure you are still in `backend/` with `(venv)` active:

```cmd
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO  | 🌾 Kissan AI Advisor — Starting
INFO  | 📚 Initializing RAG service (TF-IDF)...
INFO  | ✅ RAG ready — 35 entries indexed
INFO  | ✅ Groq LLM ready (model: llama-3.1-8b-instant)
INFO  | ✅ Ready | RAG=True | LLM=groq
INFO  | Uvicorn running on http://0.0.0.0:8000
```

**Test it:** Open http://localhost:8000 in your browser — you should see `{"app": "Kissan AI Advisor", ...}`

**Keep this terminal open.** The backend must be running for the frontend to work.

---

### Step 5 — Set up and Start the Frontend

Open a **second** Command Prompt window (`Win + R` → `cmd`):

```cmd
cd kissan-ai-advisor\frontend
```

Install packages:
```cmd
npm install
```

This downloads ~200 MB (React, Tailwind, etc.) and takes 1–3 minutes.

Start the frontend:
```cmd
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open **http://localhost:5173** in your browser.

---

### ✅ It's Working When:

1. The chat UI loads and fills the full screen
2. The header shows **"Online"** (green dot) — usually within 3–4 seconds
3. You can type a question and get a response in ~1–2 seconds
4. The language toggle button switches between English and Urdu

---

## 📚 How to Add More Knowledge

To teach the AI about additional topics, edit `backend/data/knowledge_base.json`.

Add a new entry at the end of the array (before the final `]`):

```json
{
  "id": "kb_036",
  "topic": "tomato_disease",
  "language": "en",
  "question": "How do I treat early blight on tomatoes?",
  "answer": "Early blight (Alternaria solani) shows as brown spots with yellow rings on leaves. Treatment: Spray Mancozeb 80WP at 2.5g per liter water every 7-10 days. Remove infected leaves. Avoid wetting foliage when irrigating.",
  "tags": ["tomato", "blight", "disease", "fungicide", "vegetable"]
}
```

**Rules:**
- `id` must be unique — just increment the number (`kb_036`, `kb_037`, etc.)
- `language`: `"en"` for English, `"ur"` for Urdu
- `tags`: space-separated keywords that help retrieval
- **Restart the backend** after adding entries (Ctrl+C, then `uvicorn main:app --port 8000 --reload`)

---

## 🌐 Deployment Guide

### Part A — Deploy Frontend to Vercel (Free)

Vercel hosts the React frontend for free. No credit card required.

#### Step 1 — Push your code to GitHub

1. Create a GitHub account at https://github.com if you don't have one
2. Create a **new repository** (click the `+` icon → New repository)
3. Name it `kissan-ai-advisor`, set it to **Public**, click **Create**
4. In your project folder, run:

```cmd
git init
git add .
git commit -m "Initial commit: Kissan AI Advisor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kissan-ai-advisor.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

#### Step 2 — Deploy on Vercel

1. Go to **https://vercel.com** → Sign up with GitHub (free)
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Select your `kissan-ai-advisor` repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

5. Under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-railway-app.up.railway.app` *(add this after Step B)* |

6. Click **Deploy**

Vercel will give you a URL like `https://kissan-ai-advisor.vercel.app` — **save this**.

> **Note:** The frontend will show "Cannot connect to backend" until you deploy the backend in Part B and update `VITE_API_URL`.

---

### Part B — Deploy Backend to Railway (Free Starter)

Railway hosts the FastAPI backend. Free Starter plan gives $5 credit/month — enough for demos.

#### Step 1 — Sign up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"** → Sign in with GitHub

#### Step 2 — Create the backend service

1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your `kissan-ai-advisor` repository
3. Railway will detect the `Procfile` and auto-configure

#### Step 3 — Set environment variables on Railway

Click your service → **"Variables"** tab → Add these:

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | `gsk_your_actual_groq_key` |
| `GROQ_MODEL` | `llama-3.1-8b-instant` |
| `MAX_TOKENS` | `600` |
| `ALLOWED_ORIGINS` | `https://your-kissan-app.vercel.app,http://localhost:5173` |

> Replace `https://your-kissan-app.vercel.app` with the actual URL Vercel gave you.

#### Step 4 — Get your Railway URL

1. Click your service → **"Settings"** tab
2. Under **"Domains"**, click **"Generate Domain"**
3. You'll get something like: `https://kissan-ai-backend.up.railway.app`

#### Step 5 — Update Vercel with the Railway URL

1. Go back to **Vercel** → Your project → **Settings** → **Environment Variables**
2. Update `VITE_API_URL` to your Railway URL: `https://kissan-ai-backend.up.railway.app`
3. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

---

### Part C — Verify Deployment

1. Visit your Vercel URL (e.g., `https://kissan-ai-advisor.vercel.app`)
2. The header should show **"Online"** within a few seconds
3. Type a question — you should get a response in ~1–2 seconds
4. Test Urdu by clicking the language toggle and asking a question in Urdu

**Test the backend directly:**
```
https://your-railway-app.up.railway.app/api/health
```
You should see: `{"status":"ok","rag_ready":true,"llm_ready":true,...}`

---

## 🔧 Troubleshooting

### ❌ `python` is not recognized

```cmd
REM Try python3 instead:
python3 --version

REM Or find Python in:
where python
where python3

REM If Python is installed but not in PATH:
REM Uninstall and reinstall Python, checking "Add to PATH" this time
```

### ❌ `venv\Scripts\activate` gives an error on PowerShell

```powershell
# Run this ONCE in PowerShell (as Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate normally:
venv\Scripts\activate
```

### ❌ `pip install` fails / SSL certificate error

```cmd
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

### ❌ Frontend shows "Cannot connect to backend"

Check these in order:
1. Is the backend running? Open http://localhost:8000 — you should see JSON.
2. Is `ALLOWED_ORIGINS` in `backend/.env` set to `http://localhost:5173`?
3. Did you save the `.env` file after editing?
4. Restart the backend: press `Ctrl+C`, then run `uvicorn main:app --port 8000 --reload` again.

### ❌ Header shows "Demo Mode" not "Online"

The backend is running but your Groq API key is missing or wrong.

1. Open `backend/.env` in Notepad
2. Make sure the line looks like: `GROQ_API_KEY=gsk_abc123...` (no quotes, no spaces)
3. Make sure the key is your ACTUAL key from https://console.groq.com (not the placeholder)
4. Save the file, restart the backend

### ❌ `npm install` fails / EACCES permission error

```cmd
REM Close all terminal windows, reopen as Administrator:
REM Right-click Command Prompt → "Run as Administrator"
npm install
```

### ❌ Port 8000 already in use

```cmd
REM Find what is using port 8000:
netstat -ano | findstr :8000

REM Kill it (replace PID with the number shown):
taskkill /PID 12345 /F

REM Or use a different port:
uvicorn main:app --port 8001 --reload
REM Then update vite.config.js proxy target to http://localhost:8001
```

### ❌ Railway deployment fails

1. Check the Railway build logs (click your service → **"Build Logs"**)
2. Make sure `requirements.txt` exists in the **root** of the repository (not just in `backend/`)
3. Check that `Procfile` exists in the root and contains the correct command
4. Ensure all environment variables are set in Railway's Variables tab

### ❌ Responses are slow (>5 seconds)

- Groq free tier is normally very fast (~1s). Slow responses = network issue.
- Check your internet connection.
- If deploying on Railway, the first request after a cold start may take 5–10s. Subsequent requests are fast.
- Railway free tier sleeps after 30 minutes of inactivity. First request after sleep = 5–10s cold start.

---

## 📞 Agricultural Resources for Farmers

| Service | Contact |
|---------|---------|
| Punjab Agriculture Helpline | **0800-15000** (free) |
| ZTBL Bank Helpline | **0800-35000** (free) |
| Rescue Punjab (Emergency) | **1122** |
| Pakistan Met Department | www.pmd.gov.pk |
| NARC Research Centre | www.narc.gov.pk |
| Punjab Agriculture Dept | www.agripunjab.gov.pk |
| Kissan Portal | kisanportal.punjab.gov.pk |

---

## 🤝 Contributing

Ideas for improvement:
- Add more Urdu knowledge base entries
- Add voice input (Web Speech API)
- Add crop disease photo detection
- Add real-time mandi price fetching
- Support more languages (Punjabi, Sindhi, Pashto)
- Add rainfall/frost forecast integration from PMD

Pull requests welcome! Open an issue first for major changes.

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
Made with ❤️ for Pakistan's farmers | پاکستان کے کسانوں کے لیے
<br/>
<em>If this helped you, please ⭐ the repo and share on LinkedIn!</em>
</div>
