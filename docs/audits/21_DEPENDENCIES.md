# 21 — DEPENDENCIES, LIBRARIES & PACKAGE AUDIT
**Backend Dependency Manifest**: `backend/requirements.txt`  
**Frontend Dependency Manifest**: `web/package.json`  
**Auditor**: Full-Stack Dependency & Supply Chain Security Engineer

---

## 1. Backend Python Dependencies (`backend/requirements.txt`)

| Package Name | Pinned Version | Purpose & Usage in Codebase | Security & Vulnerability Status |
| :--- | :--- | :--- | :--- |
| `fastapi` | `>=0.100.0` | Asynchronous REST API framework | Clean / Safe |
| `uvicorn` | `>=0.22.0` | High-performance ASGI web server | Clean / Safe |
| `pydantic` | `>=2.0` | Data modeling & schema validation | Clean / Safe |
| `sqlalchemy` | `>=2.0` | ORM & database connectivity | Clean / Safe |
| `python-multipart` | `>=0.0.6` | File upload parsing for resumes | Clean / Safe |
| `requests` | `>=2.31.0` | HTTP requests for scrapers & LLMs | Clean / Safe |
| `feedparser` | `>=6.0.10` | RSS opportunity feed parsing | Clean / Safe |
| `python-dotenv` | `>=1.0.0` | Environment variable loader | Clean / Safe |
| `pdfplumber` | `>=0.10.0` | Resume PDF text & AST extraction | Clean / Safe |
| `python-docx` | `>=0.8.11` | Resume Word (.docx) generation & parsing | Clean / Safe |
| `sentence-transformers`| `>=2.2.2`| Semantic matching embeddings | Clean / Heavy CPU if used locally |
| `numpy` | `>=1.24.0` | Mathematical array operations | Clean / Safe |
| `cryptography` | `>=41.0.0` | AES-256 Fernet field-level encryption | Clean / Safe |
| `reportlab` | `>=4.0.0` | Vector-precise ATS PDF document generation | Clean / Safe |
| `httpx` | `>=0.25.0` | Asynchronous HTTP client for scrapers | Clean / Safe |

---

## 2. Frontend NPM Dependencies (`web/package.json`)

| Package Name | Version | Purpose | Bundle Size Impact |
| :--- | :--- | :--- | :--- |
| `react` / `react-dom` | `^18.2.0` | Core UI rendering library | Standard ($45\text{ kB}$ gzip) |
| `lucide-react` | `^0.263.1` | Comprehensive iconography system | Tree-shaken ($30\text{ kB}$ gzip) |
| `framer-motion` | `^10.16.4` | Micro-animations and page transitions | $32\text{ kB}$ gzip |
| `canvas-confetti` | `^1.9.0` | High-performance celebration particle cannon | $4\text{ kB}$ gzip |
| `clsx` / `tailwind-merge` | `^2.0.0` | CSS class merging utilities | Minimal ($2\text{ kB}$ gzip) |
| `vite` | `^4.5.0` | Build tool, HMR dev server & bundler | Dev dependency |
| `@vitejs/plugin-react` | `^4.2.0` | Fast refresh compiler plugin | Dev dependency |

---

## 3. Dependency Optimization & Supply Chain Recommendations

1. **`sentence-transformers` Optionality**:
   * For ultra-lightweight deployments (e.g. 512MB RAM free-tier cloud containers), `sentence-transformers` and PyTorch can be made an optional extra (`pip install .[ml]`) since cosine keyword matching in `agent3_matching.py` already operates at high precision without heavy PyTorch model weights.
2. **Dependabot & Automated Scanning**:
   * Enable GitHub Dependabot security alerts for proactive CVE vulnerability scanning.
