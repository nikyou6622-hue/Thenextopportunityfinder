# ⚡ NextOpportunityFind (India Tech & Startup Edition)

> **Next-Generation Multi-Agent AI Career Intelligence Platform**  
> AI-Powered Role Discovery, Ingestion Hardening, Canonical Direct Apply Links, Resume Tailoring, CS Interview Studio & DPDP Act 2023 Trust Architecture.

---

## 🌟 Executive Summary

**NextOpportunityFind** is an end-to-end, multi-agent AI career platform engineered for software engineers, tech freshers, and experienced professionals navigating the Indian and global technology ecosystems.

The platform continuously discovers verified opportunities from startup job boards, Big-MNC career portals, and internship hubs, parses multi-format resumes, computes multi-dimensional compatibility scores, rewrites resumes against high-selection-rate ATS patterns, prepares candidates with CS interview question banks and 2-week skill-gap roadmaps, and routes applications via direct, verified canonical links — all while strictly adhering to the DPDP Act 2023.

---

## 🏗️ Systematic Directory Structure

```text
Thnextoppr/
│
├── backend/                     # Python FastAPI Backend & Agent Core
│   ├── app/
│   │   ├── agents/              # Multi-Agent Intelligence Services
│   │   │   ├── agent1_parser.py          # Resume parsing, OCR & 5-pillar ATS scorer
│   │   │   ├── agent2_discovery.py       # Job discovery & aggregator ingestion
│   │   │   ├── agent2b_mnc_scanner.py    # Big-MNC direct career portal scrapers
│   │   │   ├── agent3_matching.py        # Vector/semantic matching & skill gaps
│   │   │   ├── agent4_tailor.py          # Deterministic & LLM resume tailoring
│   │   │   ├── agent4_export_generator.py# Multi-format export (PDF, DOCX, MD, JSON)
│   │   │   ├── agent5_reporting.py       # Candidate progress & analytics reports
│   │   │   ├── agent6_batch_email.py     # Recruiter cold email outreach engine
│   │   │   ├── agent7_outcome_intelligence.py # Application outcome diagnosis
│   │   │   ├── agent8_interview_prep.py  # STAR question bank & mock evaluator
│   │   │   └── salary_intelligence.py   # Deterministic Indian tech salary index
│   │   ├── db/                  # Database Layer (SQLAlchemy ORM & Migrations)
│   │   │   ├── database.py               # Engine, SessionLocal & auto-migration
│   │   │   └── models.py                 # All 22 relational database tables
│   │   ├── schemas/             # Pydantic Request/Response Models
│   │   │   └── schemas.py                # Type-safe validation schemas
│   │   ├── security/            # Security, Auth & Compliance
│   │   │   ├── auth.py                   # JWT generation, verification & cookies
│   │   │   ├── encryption.py             # AES-256 GCM field-level encryption
│   │   │   └── cost_telemetry.py         # LLM token & API cost telemetry
│   │   ├── data_source_registry.py       # Scraper catalog & health registry
│   │   └── main.py              # FastAPI Application & 48 REST API Endpoints
│   ├── conftest.py              # Central Pytest fixtures & test DB session
│   ├── requirements.txt         # Python runtime dependencies
│   ├── start_production.py      # Production server bootstrap script
│   └── test_*.py                # 19 Pytest automated test suites (82 test functions)
│
├── web/                         # React + Vite Web Application (Desktop & Tablet)
│   ├── src/
│   │   ├── components/          # 36 Specialized UI Studio Components
│   │   │   ├── OverviewDashboard.jsx     # Master analytics, funnel & action cards
│   │   │   ├── ResumeAnalyzer.jsx        # ATS scoring studio & interactive editor
│   │   │   ├── JobDiscovery.jsx          # Live opportunity finder & filters
│   │   │   ├── MncOpportunityHub.jsx     # MNC career portal scanner dashboard
│   │   │   ├── IndiaInternshipHub.jsx    # Fresher & tier-2/3 college internship hub
│   │   │   ├── TailoringHub.jsx          # AI resume tailoring & diff visualizer
│   │   │   ├── ApplicationPipeline.jsx   # Kanban application lifecycle tracker
│   │   │   ├── InterviewPrepStudio.jsx   # Role-specific question bank & STAR mock studio
│   │   │   ├── CodingSandboxStudio.jsx   # LeetCode 17-pattern DSA code runner
│   │   │   ├── RecruiterOutreachStudio.jsx # Cold outreach email generator
│   │   │   ├── LearningRoadmapStudio.jsx # 2-Week skill-gap learning roadmap
│   │   │   └── SettingsPrivacy.jsx       # DPDP consent & one-click Right to Erasure
│   │   ├── utils/               # Audio triggers, sound effects & templates
│   │   ├── assets/              # SVGs, icons & illustrations
│   │   ├── App.jsx              # Main application root & code-split router
│   │   ├── index.css            # Production CSS design system & micro-animations
│   │   └── main.jsx             # React DOM entry point
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite bundle optimizations & manual chunks
│
├── mobile/                      # React + Vite Mobile-Optimized Web Application
│   ├── src/                     # Touch-first responsive mobile interface
│   ├── package.json
│   └── vite.config.js
│
├── docs/                        # Complete System Documentation & Audits
│   ├── audits/                  # 28-File Architectural & QA Audit Reports
│   ├── specs/                   # Functional specifications (Skill 1–5 standards)
│   ├── summaries/               # Milestone summaries & production scorecard
│   ├── architecture/            # Architecture diagrams & design specs
│   └── README.md                # Documentation index & reading guide
│
├── data_leetcode_companies/     # DSA Question Bank across 600+ Top Tech Companies
├── resume-templates/            # Certified Single-Column ATS Resume Templates
├── resource/                    # Brand assets, animated SVGs & lotties
├── scripts/                     # Data ingestion & ETL conversion scripts
├── Dockerfile                   # Multi-stage production container image
├── docker-compose.yml           # Unified multi-service orchestration
├── start_production.py          # Unified single-command launcher
└── README.md                    # Project master documentation (this file)
```

---

## ⚡ Quickstart & Running Locally

### 1. Prerequisites
* **Python**: `3.10` or higher
* **Node.js**: `18.x` or `20.x` LTS
* **Package Managers**: `pip` and `npm`

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python start_production.py
```
* Backend starts at `http://localhost:8000`
* Interactive API Documentation (Swagger UI) at `http://localhost:8000/docs`

### 3. Frontend Web Setup
```bash
cd web
npm install
npm run dev
```
* Web Portal starts at `http://localhost:3001` (or `http://localhost:3000`)

### 4. Running via Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Testing & Quality Assurance

Run the complete 19-suite backend automated test battery:

```bash
pytest backend -v
```

### Verified Test Coverage:
* **Total Test Suites**: 19 Files
* **Collected Test Functions**: 82 Top-Level Pytest Functions
* **Pass Rate**: **100% Pass Rate (82/82 Passing)**
* **Verification Scope**:
  * DPDP 2023 Field Encryption & 22-Table Cascade Hard Erasure
  * Robots.txt Crawl Delay Compliance & Job Fingerprinting
  * Canonical Apply Link Resolution & Link-out Tracking
  * Zero-Hallucination Resume Rewriting Guardrails
  * STAR Rubric Mock Interview Evaluation & Hinglish Support

---

## 🛡️ Security & DPDP Compliance

* **Data Protection (DPDP Act 2023)**:
  * Field-level AES-256 GCM encryption at rest for raw resume text and PII.
  * Explicit user consent opt-in required before resume ingestion.
  * One-click **Right to Erasure** (`DELETE /api/profile/{id}`) triggering a deterministic cascade deletion across all 22 database tables with **zero orphaned rows**.
  * Automated 90-day retention purge loop active on server startup.
* **Authentication**:
  * Secure, `HttpOnly; SameSite=Strict` cookie-based JWT authentication (`nof_auth_token`).
  * CORS restricted strictly to approved origin whitelist.
* **Cold Outreach Protections**:
  * Consumer SMTP services (Gmail, Yahoo, Outlook) are strictly blocked to protect domain reputation.
  * Only transactional delivery APIs (SendGrid, Postmark, AWS SES, Resend, Brevo) permitted with hard hourly/weekly rate limits.

---

## 📊 Scorecard Summary

| System Area | Inventory Count | Production Status |
| :--- | :---: | :---: |
| **Frontend UI Components** | 36 Components | ✅ 100% Verified |
| **Backend REST Endpoints** | 48 Endpoints | ✅ 100% Audited & Secure |
| **Database Schema** | 22 Relational Tables | ✅ 100% Cascade Verified |
| **Automated Test Battery** | 19 Suites / 82 Functions | ✅ 100% Passing (82/82) |
| **Initial JS Bundle Size** | 133.94 kB (34.14 kB gzip) | ✅ Code-Split & Optimized |

---

## 📖 Complete Documentation

For the full 28-part architectural audit, API specifications, and functional deep-dives, see the [Documentation Index](file:///f:/Thnextoppr/docs/README.md).
