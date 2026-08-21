# 22 — TECHNICAL DEBT & ARCHITECTURAL REFACTORING LOG
**Auditor**: Principal Systems Architect  
**Priority Classification**: High, Medium, Low Debt Items.

---

## 1. Technical Debt Inventory & Impact Matrix

| ID | Component / File | Description of Technical Debt | Architectural Impact | Remediation Plan | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TD-01**| `web/src/utils/leetcodeCompanyQuestions.js` | 4.85 MB static JS catalog is bundled synchronously into main `index.js`. | Bloats initial bundle size to 4.49 MB ($493\text{ kB}$ gzip), increasing First Contentful Paint time. | Convert `CodingSandboxStudio` to `React.lazy()` or load question catalog via chunked dynamic import. | **HIGH** |
| **TD-02**| `web/src/components/SalaryIntelligenceStudio.jsx` | File contains `export default function SalaryIntelligenceStudio() { return null; }` (6 lines). | Dead file; salary intelligence is actively embedded inside `OverviewDashboard.jsx`. | Either remove the unused stub file or extract the CTC calculator widget from `OverviewDashboard.jsx` into this component. | **MEDIUM** |
| **TD-03**| `backend/app/main.py` (`datetime.utcnow()`) | Widespread usage of `datetime.datetime.utcnow()` across models and routes. | Python 3.12 deprecation warnings; scheduled for future Python release removal. | Replace with `datetime.datetime.now(datetime.UTC)` across backend models and test suites. | **MEDIUM** |
| **TD-04**| Scraper Execution in Request Thread | `POST /api/jobs/mnc/scan` and `POST /api/internships/india/scan` run scrapers synchronously. | Takes 3–5 seconds during which the HTTP request is blocked. | Offload scraper runs to FastAPI `BackgroundTasks` or Celery task queue with polling status. | **MEDIUM** |
| **TD-05**| Database Migration Engine | Custom `auto_migrate_sqlite()` function in `main.py` instead of formal Alembic migrations. | Works well for SQLite but limits rollback branching in team environments. | Initialize Alembic directory (`alembic init`) for multi-developer database change tracking. | **LOW** |
| **TD-06**| `backend/conftest.py` missing | Tests expecting `db: Session` fixture fail if `conftest.py` is absent. | 3 tests in `test_agent8_comprehensive.py` fail under clean global `pytest`. | Add `backend/conftest.py` exporting `@pytest.fixture def db(): ...`. | **HIGH** |
| **TD-07**| Duplicate `agent/` folder in root | Root directory contains `backend/agent/` as well as `backend/app/agents/`. | Redundant legacy duplication may cause confusion. | Standardize imports to `backend.app.agents.*` and archive legacy root copies. | **LOW** |

---

## 2. Refactoring Timeline & Estimated Effort

* **Sprint 1 (Quick Wins - 1-2 Days)**:
  * Fix `backend/conftest.py` fixture.
  * Update `datetime.datetime.utcnow()` to `datetime.datetime.now(datetime.UTC)`.
  * Add `React.lazy()` to `App.jsx` for heavy studio views.
* **Sprint 2 (Architecture Hardening - 3-4 Days)**:
  * Convert scraper endpoints to FastAPI `BackgroundTasks`.
  * Clean unused `SalaryIntelligenceStudio.jsx` stub.
  * Initialize formal Alembic migration baseline.
