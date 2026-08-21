# 07 — BACKEND ARCHITECTURE & AGENT AUDIT
**Framework**: FastAPI 0.100+ on Uvicorn ASGI Server  
**Python Runtime**: Python 3.12  
**Directory**: `f:/Thnextoppr/backend`  
**Architecture**: Asynchronous Multi-Agent Micro-Monolith with SQLite/PostgreSQL Engine and AES-256 Fernet Encryption.

---

## 1. Directory Structure & Key Modules

```text
backend/
├── requirements.txt              # FastAPI, SQLAlchemy, ReportLab, Pydantic, Python-Docx, Cryptography
├── start_production.py           # Production bootstrapper and health auditor
├── app/
│   ├── main.py                   # 2,390 lines, 48 REST API endpoints, CORS, auto-migrations
│   ├── config.py                 # Central platform settings & monetization switches
│   ├── llm_client.py             # Dual LLM client (Gemini 1.5 Flash + Groq LLaMA 3.1 failover)
│   ├── llm_guardrails.py         # XML prompt sandboxing & Pydantic structured output validation
│   ├── data_source_registry.py   # Registry of compliance, scrapers, and terms-of-service status
│   ├── db/
│   │   ├── database.py           # SQLAlchemy engine, session maker, WAL pragma setup
│   │   └── models.py             # 19 SQLAlchemy ORM models with relations & cascade rules
│   ├── schemas/
│   │   └── schemas.py            # 28 Pydantic v2 schemas for request/response validation
│   ├── security/
│   │   ├── encryption.py         # Field-level AES-256 Fernet encryption/decryption
│   │   ├── auth.py               # Token verification & X-API-Key dependencies
│   │   ├── rate_limiter.py       # Leaky-bucket in-memory rate limiter per IP/profile
│   │   ├── usage_caps.py         # Weekly candidate usage quotas
│   │   └── cost_telemetry.py     # Real-time LLM token counter and USD cost tracker
│   └── agents/                   # 11 autonomous processing agents & scrapers
```

---

## 2. Multi-Agent System Deep Dive

### Agent 1: Resume Parser & Canonical ATS Scorer (`agent1_parser.py`)
* **File Size**: 32,017 bytes (~850 lines)
* **Core Functions**:
  * `parse_resume_content(file_bytes, filename)`: Extracts plain text and builds AST JSON.
  * `compute_ats_score(profile_dict)`: Executes mathematical scoring across 5 canonical pillars (Skills, Impact, Contact, Structure, Keywords).
  * `validate_resume_upload(file_bytes, filename)`: Verifies file magic bytes, MIME types, and size constraints.
* **Status**: **COMPLETE**

### Agent 2: Opportunity Ingestion Engine (`agent2_discovery.py`)
* **File Size**: 18,752 bytes
* **Core Functions**:
  * `discover_all_jobs(db)`: Ingests structured opportunities from local catalogs and RSS sources.
  * `normalize_job_data(raw_job)`: Standardizes location, remote flags, salary, and skill tags.
* **Status**: **COMPLETE**

### Agent 2B: MNC Direct Portal Scanner (`agent2b_mnc_scanner.py`)
* **File Size**: 47,147 bytes (~1,100 lines)
* **Target Platforms**: Google Careers, Microsoft Careers, Amazon Jobs, Apple Jobs, Meta Careers, TCS iBegin / NQT, Infosys Career Hub, Wipro Elite, Accenture India.
* **Rate Limiting & Hardening**: Adheres to robots.txt guidelines, rotates user-agents, respects rate limits, and verifies direct ATS links.
* **Status**: **COMPLETE**

### Agent 2C: India Internships Scraper & Aggregator (`agent2c_india_internships_scraper.py`)
* **File Size**: 42,853 bytes (~1,000 lines)
* **Target Platforms**: Unstop (formerly Dare2Compete), Cuvette Tech, Internshala, Wellfound, GitHub 2026 Campus Internships Repo.
* **Data Fields**: Monthly INR stipend normalization, PPO conversion flag, location flexibility, direct apply link.
* **Status**: **COMPLETE**

### Agent 2D: Global Tech Jobs Scraper (`agent2d_global_jobs_scraper.py`)
* **File Size**: 12,172 bytes
* **Target Platforms**: FreeHire ATS aggregator (~50 ATS normalized) and LinkedIn public guest job feed.
* **Status**: **COMPLETE**

### Agent 3: Semantic & Multi-Factor Matchmaker (`agent3_matching.py`)
* **File Size**: 9,150 bytes
* **Matching Algorithm**:
  $$\text{Match Score} = 0.40 \cdot \text{Skill Overlap} + 0.25 \cdot \text{Semantic Cosine} + 0.20 \cdot \text{Domain} + 0.15 \cdot \text{Location}$$
* **Status**: **COMPLETE**

### Agent 4: Zero-Hallucination Tailor & Multi-Format Exporter (`agent4_tailor.py` & `agent4_export_generator.py`)
* **File Size**: 67,869 bytes combined
* **Capabilities**:
  * Zero-hallucination prompt generator wrapped in XML inert boundaries.
  * ReportLab 4.0 PDF generator with dynamic pagination, clean typography, and zero overflow.
  * Python-Docx Word document generator.
  * LaTeX Jinja ModernCV and Deedy-style `.tex` generator.
  * Markdown `.md` generator.
* **Status**: **COMPLETE**

### Agent 6: Recruiter Cold Outreach Engine (`agent6_batch_email.py`)
* **File Size**: 5,157 bytes
* **Capabilities**: Generates personalized cold emails to recruiters and engineering managers, prepares batch dispatch queues, and simulates SMTP delivery.
* **Status**: **COMPLETE**

### Agent 7: Outcome Intelligence & Bottleneck Diagnosis (`agent7_outcome_intelligence.py`)
* **File Size**: 6,359 bytes
* **Capabilities**: Detects longitudinal application bottlenecks (e.g. 5+ rejections at screening indicates missing domain keywords; zero callbacks after link opened indicates resume formatting issue).
* **Status**: **COMPLETE**

### Agent 8: AI Interview Prep & Study Material Studio (`agent8_interview_prep.py`)
* **File Size**: 67,683 bytes (~1,600 lines)
* **Capabilities**:
  * Generates tailored company briefing dossiers (Tech stack, architecture challenges, news).
  * Generates 10 targeted interview questions (5 technical conceptual + 5 behavioral STAR).
  * Evaluates candidate verbal/typed answers against a 4-pillar rubric.
  * Recommends structured learning resources from curated seed database.
* **Status**: **COMPLETE**

### Source Router: Link Hardening & Canonical Resolution (`source_router.py`)
* **File Size**: 21,880 bytes
* **Capabilities**: Resolves tracking URLs to destination ATS URLs (Greenhouse, Lever, Ashby, Workday, SmartRecruiters) and performs background health checks to purge dead links.
* **Status**: **COMPLETE**

---

## 3. Middleware & Security Implementation

1. **CORS Middleware**: Configured in `main.py` with `allow_origins=["*"]`, `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]`.
2. **GZip Compression**: GZipMiddleware enabled for all JSON and text payloads $> 1000\text{ bytes}$.
3. **Database WAL Pragma**: SQLite auto-configures `PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;` on connection, preventing database locks during concurrent reads and writes.
4. **Auto-Migration Engine**: `auto_migrate_sqlite()` checks schema on startup and adds missing columns automatically without data loss.
