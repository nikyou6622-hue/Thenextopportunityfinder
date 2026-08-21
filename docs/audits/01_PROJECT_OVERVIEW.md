# 01 — PROJECT OVERVIEW & SCOPE
**Product Name**: Thenextopportunity  
**Tagline**: Find Your Next Step — The AI Career Acceleration Operating System  
**Audience**: Software Engineers, Tech Students (B.Tech/BE/MCA/BCA), Data Scientists, QA Engineers, DevOps, Career Switchers.

---

## 1. Problem Statement
Job seekers in the software engineering market face a fragmented, high-friction journey:
* **ATS Black Box**: Candidates submit resumes that fail automated Applicant Tracking Systems due to poor keyword matching, table formatting errors, or missing quantitative metrics.
* **Fake & Expired Listings**: Aggregators spam users with dead links, affiliate redirects, or ghost postings with no direct ATS application portal.
* **Hallucinatory AI Resume Tools**: Existing AI resume rewrite tools invent unearned credentials, fake GPA, or fictitious company roles, damaging candidate credibility.
* **Fragmented Tooling**: Candidates must use 5-8 separate platforms (LeetCode, Overleaf, Job Boards, LinkedIn, Mock Interview platforms, Email clients) with zero shared context.
* **Privacy & Spam Violations**: Traditional job boards sell user contact details to third-party telemarketers and training academies without consent.

---

## 2. The Thenextopportunity Solution
Thenextopportunity consolidates the entire technical job search pipeline into a single, unified, local-first operating system:

```text
+-----------------------------------------------------------------------------------------+
|                                  THENEXTOPPORTUNITY                                     |
|                                                                                         |
|  [1. ATS Resume Studio]    -->   [2. Verified Opportunity Feed]  -->  [3. 1-Click Tailor] |
|   * 11 A4 templates               * MNC Hub (Google, TCS...)           * Zero Hallucination |
|   * Real-time 5-pillar score      * India Internships (Unstop...)      * Diff Comparison    |
|   * PDF / Docx / TeX / MD         * Live Link Revalidation             * ATS Boost Recs     |
|                                                                                         |
|  [4. Kanban Pipeline]      -->   [5. AI Mock Interview Studio]   -->  [6. Coding Sandbox] |
|   * Click & apply tracking        * Voice speech-to-text QA            * In-browser Python  |
|   * Status transitions            * Company-specific briefs            * LeetCode index     |
|   * Bottleneck diagnosis          * Real-time rubric feedback          * 17 enterprise tracks|
+-----------------------------------------------------------------------------------------+
```

---

## 3. Core Functional Pillars

### Pillar 1: ATS Live Resume Engine & Canonical Rubric
* **11 Certified ATS Templates**: `Modern Clean`, `ATS Safe (Harvard)`, `Executive Minimalist`, `Left Rail Tech`, `Compact Silicon Valley`, `Academic / Research`, `Two-Column Modern`, `Creative Portfolio`, `Latex ModernCV (Engineering)`, `Latex Deedy Style`, `Latex Sleek Indigo`.
* **Mathematical 5-Pillar Score**:
  * Skills Coverage: 35 points
  * Impact Metrics & Quantified Action Verbs: 25 points
  * Essential Contact & Link Validity: 15 points
  * Structural Flow & AST Section Hierarchy: 15 points
  * Keyword Domain Alignment: 10 points
* **Live Zero-Lag A4 Preview**: React SVG/HTML renderer with drag-and-drop section reordering (`summary`, `skills`, `experience`, `projects`, `education`).

### Pillar 2: Multi-Source Opportunity Scraper & Link Hardening
* **Active Scrapers**:
  * `agent2b_mnc_scanner.py`: Tier-1 Big Tech (Google, Microsoft, Amazon, Apple, Meta) + Indian IT Services (TCS NQT, Infosys Springboard, Wipro Elite, Accenture, Cognizant).
  * `agent2c_india_internships_scraper.py`: Cuvette, Unstop, Internshala, Wellfound, GitHub 2026 Campus Internships Repo.
  * `agent2d_global_jobs_scraper.py`: FreeHire ATS aggregator + LinkedIn public guest job feed.
* **Link Resolution Standard**: HTTP HEAD/GET resolution to canonical ATS portals (Greenhouse, Lever, Ashby, Workday, SmartRecruiters) and automatic flagging of dead/expired listings.

### Pillar 3: Zero-Hallucination Tailoring & Document Generation
* **Strict Candidate-Grounding**: LLM is constrained via XML boundary sandboxing (`<candidate_resume_text>`, `<job_description_text>`) and Pydantic schemas. It is strictly prohibited from introducing fake companies, tools, dates, or degrees.
* **Multi-Format Export**: ReportLab PDF, Python-Docx Word, LaTeX Jinja `.tex`, and GitHub Markdown `.md`.

### Pillar 4: AI Voice & Technical Interview Prep Studio
* **Company Briefing Generator**: Pulls funding stage, product tech stack, core business challenges, and recent news.
* **AI Mock Simulator**: In-browser microphone audio recording, speech synthesis, and answer evaluation scoring across 4 pillars (Technical Accuracy, Relevance, Communication, Structure).
* **Question Bank**: 1,000+ technical conceptual, behavioral, and system design questions.

### Pillar 5: In-Browser Coding Sandbox & Enterprise LeetCode Catalog
* **DSA Execution Engine**: Client-side sandboxed runner for Python, JavaScript, and SQL.
* **LeetCode Company Tag Index**: 4.8 MB pre-indexed database (`leetcodeCompanyQuestions.js`) mapping problems to Google, Meta, Amazon, Apple, Microsoft, Uber, Netflix, and Indian IT Services.

### Pillar 6: India DPDP Act (2023) Privacy & Data Protection
* **Field-Level Encryption**: AES-256 Fernet encryption for raw resume text and sensitive candidate data in SQLite/PostgreSQL.
* **Right to Erasure (Hard Cascade Purge)**: One-click deletion of all profiles, resumes, application history, and interview prep transcripts.
* **Data Portability**: Full JSON export of candidate profile and career metadata.
