# INVENTORY — COMPLETE EXTERNAL SERVICE & INTEGRATION SPECIFICATION

| Service / Provider | Integration Domain | Integration SDK / Method | Authentication / Key | Rate Limits | Fallback Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** | Primary LLM Generation (Tailor, Mock QA) | Direct HTTPS REST (`generativelanguage.googleapis.com`) | `GEMINI_API_KEY` | 15 RPM / 1M TPM (Free Tier) | Fails over to Groq LLaMA 3.1 | **COMPLETE** |
| **Groq Cloud API** | Secondary High-Speed LLM Failover | Direct HTTPS REST (`api.groq.com`) | `GROQ_API_KEY` | 30 RPM (Free Tier) | Fails over to Deterministic Rule Engine | **COMPLETE** |
| **FreeHire API** | Global tech opportunity feed (~50 ATS normalized) | Direct HTTPS REST (`freehire.io`) | Public / None | Standard web rate limits | Fallback to cached catalog | **COMPLETE** |
| **LinkedIn Guest Search** | Public live job search feed | HTTPS GET Requests | Public / None | Standard web rate limits | Fallback to FreeHire / Local | **COMPLETE** |
| **Unstop (Dare2Compete)** | Indian tech competitions & internships | HTTPS Web Scraper (`unstop.com`) | Public / None | 1 req / 2 sec backoff | Fallback to SQLite seed data | **COMPLETE** |
| **Cuvette Tech** | Verified startup software internships | HTTPS Web Scraper (`cuvette.tech`) | Public / None | 1 req / 2 sec backoff | Fallback to SQLite seed data | **COMPLETE** |
| **Internshala** | Indian tech internship requisitions | HTTPS Web Scraper (`internshala.com`) | Public / None | 1 req / 2 sec backoff | Fallback to SQLite seed data | **COMPLETE** |
| **Wellfound (AngelList)** | Early-stage global & Indian startups | HTTPS Web Scraper (`wellfound.com`) | Public / None | 1 req / 2 sec backoff | Fallback to SQLite seed data | **COMPLETE** |
| **GitHub Campus Repo** | 2026 Tech Internships Open Catalog | Raw Markdown Ingestion | Public / None | None | Fallback to SQLite seed data | **COMPLETE** |
| **Direct ATS Portals** | Greenhouse, Lever, Ashby, Workday, SmartRecruiters | HTTP HEAD/GET link resolution | None | 5-second timeout | Raw job apply URL fallback | **COMPLETE** |
| **Browser Web Audio API** | Microphone audio recording & speech synthesis | HTML5 MediaStream / Web Audio API | Client Permission | None | Fallback to text input mode | **COMPLETE** |
