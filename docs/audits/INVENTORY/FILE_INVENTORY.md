# INVENTORY — COMPLETE FILE & CODEBASE REPOSITORY MAP

## 1. Root Infrastructure & Orchestration
* `Dockerfile`: Multi-stage build (Node 20 Alpine builder + Python 3.12 Slim runtime with healthcheck).
* `docker-compose.yml`: Container orchestration binding port 8000 with volume persistence.
* `start_production.py`: Production CLI runner with frontend build verification, DB audit, and Uvicorn boot.
* `logo.png`: Official high-resolution brand asset (TNO emblem + "Thenextopportunity - Find Your Next Step").
* `nextoppr.db`: SQLite database file in WAL mode with active schema tables.

## 2. Backend Modules (`backend/app/`)
* `backend/app/main.py`: 2,390 lines. Master FastAPI application mounting 48 REST API endpoints, CORS, GZip, static SPA mounting, and SQLite auto-migrations.
* `backend/app/config.py`: Platform configuration, monetization flags, credit quotas.
* `backend/app/llm_client.py`: Dual LLM interface connecting to Google Gemini 1.5 Flash and Groq Cloud LLaMA 3.1 8B.
* `backend/app/llm_guardrails.py`: XML sandboxing (`wrap_untrusted_content`) and Pydantic structured output validation.
* `backend/app/data_source_registry.py`: Data source compliance, robots.txt status, and terms-of-service registry.
* `backend/app/db/database.py`: SQLAlchemy engine, session maker, WAL pragma setup.
* `backend/app/db/models.py`: 19 ORM database models (`UserModel`, `ProfileModel`, `JobModel`, `MatchModel`, etc.).
* `backend/app/schemas/schemas.py`: 28 Pydantic v2 schemas for API serialization and validation.
* `backend/app/security/encryption.py`: AES-256 Fernet field-level encryption/decryption.
* `backend/app/security/auth.py`: Token verification and `X-API-Key` dependency handlers.
* `backend/app/security/rate_limiter.py`: In-memory leaky-bucket rate limiter.
* `backend/app/security/usage_caps.py`: Weekly quota trackers for LLM endpoints.
* `backend/app/security/cost_telemetry.py`: Token consumption and USD cost tracker.

## 3. Backend Autonomous Agents (`backend/app/agents/`)
* `agent1_parser.py`: Multi-format resume parser (PDF/DOCX/TXT) and 5-pillar mathematical ATS scorer.
* `agent2_discovery.py`: Ingestion engine for local and RSS opportunity feeds.
* `agent2b_mnc_scanner.py`: Direct career portal scraper for Google, Microsoft, Amazon, Apple, Meta, TCS, Infosys, Wipro, Accenture.
* `agent2c_india_internships_scraper.py`: Scraper suite for Unstop, Cuvette, Internshala, Wellfound, and GitHub 2026 campus repo.
* `agent2d_global_jobs_scraper.py`: FreeHire ATS aggregator and LinkedIn public guest job feed.
* `agent3_matching.py`: Multi-factor candidate-to-job matching algorithm.
* `agent4_tailor.py`: Zero-hallucination resume tailoring engine with deterministic fallback.
* `agent4_export_generator.py`: Document generation engine (ReportLab PDF, Python-Docx Word, LaTeX ModernCV/Deedy, Markdown).
* `agent4_resume_professional.py`: Professional bullet point pattern rewriter.
* `agent5_reporting.py`: System-wide metrics, ATS distribution curves, pipeline aggregates.
* `agent6_batch_email.py`: Recruiter cold outreach email generator and batch dispatch simulator.
* `agent7_outcome_intelligence.py`: Longitudinal hiring bottleneck diagnosis and candidate feedback.
* `agent8_interview_prep.py`: AI voice mock simulator, company brief dossier generator, 1000+ question bank.
* `learning_and_questions_seed.py`: Seed data for technical roadmaps and conceptual interview questions.
* `outcome_tracker.py`: Transition auditor logging application lifecycle milestones.
* `salary_intelligence.py`: CTC benchmarks, compensation tiers, and salary negotiation strategies.
* `source_router.py`: URL classification, link health revalidation sweeps, and direct canonical ATS resolution.

## 4. Frontend Application (`web/src/`)
* `web/index.html`: Single Page Application HTML entry with dark mode tokens and SEO metadata.
* `web/src/main.jsx`: React DOM root entry point.
* `web/src/App.jsx`: Root state container, tab router, celebration triggers, and API orchestrator.
* `web/src/index.css`: Global design system with glassmorphism, HSL gradients, and tactile buttons.
* `web/src/components/`: 36 React components (views, modals, mascot universe, UI primitives).
* `web/src/utils/leetcodeCompanyQuestions.js`: 4.8MB pre-indexed database of enterprise LeetCode questions by company.
* `web/src/utils/resumeTemplates.js`: Layout definitions for all 11 certified ATS templates.
* `web/src/utils/resumeScoring.js`: Frontend mathematical rubric calculator.
* `web/src/utils/interviewOralQuestions.js`: Curated oral interview questions.
* `web/src/utils/codingInterviewUniversityData.js`: Engineering computer science syllabus topics.
