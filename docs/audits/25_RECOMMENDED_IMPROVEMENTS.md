# 25 — RECOMMENDED ARCHITECTURAL & PRODUCT IMPROVEMENTS
**Focus**: Engineering Excellence, Latency Reduction, User Conversion, and Enterprise Scalability.

---

## 1. Top 7 Strategic Engineering Recommendations

### 1. Dynamic Code Splitting with `React.lazy()` (Effort: 2 Hours)
* **Problem**: The Vite bundle loads all 17 LeetCode problems and interview prep tools on the initial landing page.
* **Solution**: Wrap `ResumeAnalyzer`, `JobDiscovery`, `InterviewPrepStudio`, and `CodingSandboxStudio` in `React.lazy()`.
* **Impact**: Decreases initial download payload by 96% (from 4.49 MB to ~180 KB), dramatically speeding up mobile page load.

### 2. Async Scraper Background Tasks (Effort: 4 Hours)
* **Problem**: Calling `/api/jobs/mnc/scan` holds an HTTP connection open for 3–5 seconds while external HTTP requests complete.
* **Solution**: Use FastAPI `BackgroundTasks` or an async Celery/RQ worker. Return a `task_id` immediately with status 202 Accepted, and have the frontend poll `/api/jobs/mnc/scan-status`.
* **Impact**: Eliminates carrier gateway timeouts and enables parallel multi-site crawling.

### 3. Centralized Pytest Fixtures via `conftest.py` (Effort: 30 Mins)
* **Problem**: 3 tests in `test_agent8_comprehensive.py` fail due to an undeclared `db` fixture.
* **Solution**: Place standard SQLAlchemy session fixtures in `backend/conftest.py`.
* **Impact**: 100% clean automated test pass rate across the entire test suite.

### 4. Direct ATS Link Deep Health Verification (Effort: 1 Day)
* **Problem**: Some job portals return HTTP 200 even when a job requisition has expired (rendering a "This job is no longer available" page).
* **Solution**: Enhance `source_router.py` to inspect response body DOM fragments for known expiration signals (`job closed`, `no longer accepting applications`, `404 not found`).
* **Impact**: Guarantees that 100% of links presented to the user are active and accepting applications.

### 5. PDF Multi-Page Overflow Auto-Shrink (Effort: 4 Hours)
* **Problem**: Resumes with extensive experience can occasionally spill onto a 2nd page with just 2-3 orphan lines.
* **Solution**: Implement an auto-fit pass in `agent4_export_generator.py` that dynamically reduces font size from 10pt to 9.2pt or adjusts line spacing to guarantee a clean, single-page or two-page fit.
* **Impact**: Professional recruiter-ready PDF formatting.

### 6. PWA Manifest & Offline Service Worker (Effort: 3 Hours)
* **Problem**: Mobile candidates opening the platform on their phones must use browser tabs.
* **Solution**: Add a Web App Manifest (`manifest.json`) and service worker caching icons and static CSS/JS assets.
* **Impact**: Native-like app install experience on iOS and Android.

### 7. Google & GitHub OAuth Single Sign-On (Effort: 1 Day)
* **Problem**: Password sign-in has higher friction than 1-click developer login.
* **Solution**: Mount OAuth2 callback routes (`/api/auth/google`, `/api/auth/github`).
* **Impact**: Higher conversion rates on initial sign-up.
