# P1 — HIGH PRIORITY CHECKPOINTS

```text
CHECKPOINT: CP-101
TASK: Dynamic Code Splitting for LeetCode Catalog & Heavy Sub-Studios
PRIORITY: P1
CURRENT STATUS: Main client bundle is 4.49 MB (unminified)
FILES: web/src/App.jsx, web/vite.config.js
DEPENDENCIES: React.lazy, Suspense, Vite Rollup Options
IMPLEMENTATION REQUIREMENTS:
  1. Lazy load `CodingSandboxStudio`, `InterviewPrepStudio`, `ResumeAnalyzer`, `IndiaInternshipHub`.
  2. Provide fallback with `<BrandedLoadingState />`.
  3. Configure rollup manualChunks for large static assets.
TEST REQUIREMENTS:
  Run `npm run build` in `web/` and verify main index chunk size is < 250 kB.
SECURITY REQUIREMENTS:
  None.
DONE WHEN:
  Build completes with 0 chunk size warnings.
STATUS: NOT STARTED
```

```text
CHECKPOINT: CP-102
TASK: Async Scraper Execution via FastAPI BackgroundTasks
PRIORITY: P1
CURRENT STATUS: Scraping endpoints execute synchronously blocking HTTP response
FILES: backend/app/main.py, backend/app/agents/agent2b_mnc_scanner.py, backend/app/agents/agent2c_india_internships_scraper.py
DEPENDENCIES: fastapi.BackgroundTasks
IMPLEMENTATION REQUIREMENTS:
  Update `/api/jobs/mnc/scan` and `/api/internships/india/scan` to launch scan in BackgroundTasks, returning 202 Accepted and allowing frontend to poll status.
TEST REQUIREMENTS:
  Endpoint responds in < 50 ms.
SECURITY REQUIREMENTS:
  Rate limit simultaneous background scans per IP.
DONE WHEN:
  Frontend shows non-blocking scanning spinner while background worker syncs jobs.
STATUS: NOT STARTED
```
