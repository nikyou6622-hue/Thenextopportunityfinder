# 13 — EXTERNAL INTEGRATIONS & THIRD-PARTY SERVICES AUDIT
**Architecture**: Resilient Multi-Provider Integration with Automatic Local Fallbacks

---

## 1. External Integrations Catalog

| Provider / Service | Integration Purpose | Integration Method | Environment Variable | Fallback Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** | Primary LLM generation for tailoring & mock interview prep | Direct HTTPS REST API | `GEMINI_API_KEY` | Fails over to Groq Cloud LLaMA 3.1 | **COMPLETE** |
| **Groq Cloud API** | Secondary high-speed LLM failover | Direct HTTPS REST API | `GROQ_API_KEY` | Fails over to Deterministic Rule Engine | **COMPLETE** |
| **FreeHire API** | Global tech job feed (~50 ATS normalized) | HTTPS REST API | None (Public Feed) | Cached fallback catalog | **COMPLETE** |
| **LinkedIn Guest Search** | Public live job search feed | HTTPS GET Requests | None | FreeHire / Local catalog | **COMPLETE** |
| **Unstop (Dare2Compete)** | Indian tech competitions & internships | HTTPS Scraper / Aggregator | None | Seed database | **COMPLETE** |
| **Cuvette Tech** | Verified startup software internships | HTTPS Scraper / Aggregator | None | Seed database | **COMPLETE** |
| **Internshala** | Indian tech internship requisitions | HTTPS Scraper / Aggregator | None | Seed database | **COMPLETE** |
| **Wellfound (AngelList)** | Early-stage global & Indian startups | HTTPS Scraper / Aggregator | None | Seed database | **COMPLETE** |
| **GitHub Campus Repo** | 2026 Tech Internships Open Catalog | Raw Markdown Ingestion | None | Seed database | **COMPLETE** |
| **Direct ATS Portals** | Greenhouse, Lever, Ashby, Workday, SmartRecruiters | HTTP HEAD/GET link resolution | None | Raw job application URL | **COMPLETE** |
| **Browser Web Audio API** | Microphone recording for voice mock prep | HTML5 MediaStream API | None (Client-side) | Text input fallback mode | **COMPLETE** |

---

## 2. Integration Failure & Rate Limit Resiliency

### 1. LLM API Rate Limits or Outages
* If Google Generative AI returns `429 Too Many Requests` or `503 Service Unavailable`, `generate_llm_text()` catches the exception in under $100\text{ ms}$ and seamlessly tries Groq Cloud.
* If Groq is also unconfigured or unavailable, the backend immediately executes deterministic rule-based resume tailoring and returns pre-computed question banks without throwing a 500 error to the candidate.

### 2. Job Board Scraper Anti-Bot / Rate Limiting
* All web scrapers in `agent2b_mnc_scanner.py` and `agent2c_india_internships_scraper.py` implement:
  * Exponential backoff retry logic (up to 3 retries).
  * Rotating standard browser User-Agents.
  * Standard request timeouts (10 seconds max per request).
  * Strict robots.txt compliance checks.
  * Local caching in SQLite to prevent repetitive external hits.

### 3. Client Offline & Network Disconnection
* Frontend caching: Bookmarked jobs (`nof_saved_jobs`) and candidate auth state (`nof_user`) are mirrored in `localStorage`.
* If network fails, the user can continue viewing saved jobs, practicing DSA in the sandbox, and testing resume templates offline.
