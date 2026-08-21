# 20 — ENVIRONMENT VARIABLES & CONFIGURATION AUDIT
**Reference Files**: `backend/.env.example`, `backend/app/config.py`, `backend/app/llm_client.py`  
**Security Rule**: Never print actual production secret values in documentation.

---

## 1. Master Environment Variable Inventory

| Variable Name | Used By | Required? | Purpose | Safe to Expose to Client? | Default / Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | `llm_client.py` | Optional | Google Gemini 1.5 Flash API Key for AI resume tailoring & mock interviews | **NO (Server Secret)** | If empty, fails over to Groq or deterministic rules |
| `GROQ_API_KEY` | `llm_client.py` | Optional | Groq Cloud LLaMA 3.1 8B Instant API Key | **NO (Server Secret)** | If empty, fails over to deterministic rules |
| `CRYPTO_SECRET_KEY`| `encryption.py` | Optional | AES-256 Fernet secret key for DPDP field-level database encryption | **NO (Server Secret)** | Auto-generated stable fallback key |
| `DATABASE_URL` | `database.py` | Optional | SQLAlchemy connection string (SQLite or PostgreSQL) | **NO (Server Secret)** | `sqlite:///./nextoppr.db` |
| `HOST` | `main.py`, `start_production.py` | Optional | Host IP address to bind FastAPI/Uvicorn | **YES** | `0.0.0.0` |
| `PORT` | `main.py`, `start_production.py` | Optional | Port to bind FastAPI/Uvicorn | **YES** | `8000` |
| `ALLOWED_ORIGINS`| `main.py` | Optional | CORS whitelist comma-separated URLs | **YES** | `*` (or explicit localhost/domain in prod) |
| `MONETIZATION_ENABLED`| `config.py` | Optional | Flag to gate premium features (Currently False for 100% free mode)| **YES** | `False` |
| `VITE_API_URL` | `web/src/App.jsx` | Optional | Base URL for frontend API proxy | **YES** | `/api` (Proxies to `:8000` via Vite) |

---

## 2. Configuration Setup Guide for Production Deployments

Create a `.env` file in `f:/Thnextoppr/backend/.env` containing:

```bash
# Server Binding
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite:///./nextoppr.db

# LLM Providers (Optional - Full deterministic fallback if omitted)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Security Encryption Key (Generate via: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
CRYPTO_SECRET_KEY=your_fernet_aes256_key_here
```
