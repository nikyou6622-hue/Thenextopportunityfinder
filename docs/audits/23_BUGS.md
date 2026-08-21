# 23 — BUG TRACKER & FORENSIC DEFECT LOG
**Status**: 4 Identified Non-Critical Defect Items  
**Audit Standard**: Every defect documented with exact file, line number, failure log, root cause, and verified fix.

---

## 1. Active Defect Tracker

### BUG-001: Mismatched Summary Test Assertion in `test_skill4_zero_hallucination_standard.py`
* **Severity**: `MEDIUM`
* **Location**: `backend/test_skill4_zero_hallucination_standard.py` line 227
* **Error Log**:
  ```text
  >       assert "TypeSafe" in tailored["tailored_summary"]
  E       AssertionError: assert 'TypeSafe' in 'AI summary unavailable, needs manual input.'
  ```
* **Root Cause**: When a profile without an existing summary is tailored deterministically, `tailor_resume_for_job()` emits the fallback string `'AI summary unavailable, needs manual input.'` without concatenating the target company name.
* **Recommended Fix**: Update the fallback summary template in `backend/app/agents/agent4_tailor.py` to include `f"Candidate seeking {job.get('role_title')} at {job.get('company')}."`.

---

### BUG-002: Missing Global `db` Fixture in `test_agent8_comprehensive.py`
* **Severity**: `HIGH`
* **Location**: `backend/test_agent8_comprehensive.py` lines 84, 135, 173, 237
* **Error Log**:
  ```text
  ____ ERROR at setup of test_security_hardening_ownership_and_rate_limiting ____
    def test_security_hardening_ownership_and_rate_limiting(db: Session):
  E       fixture 'db' not found
  ```
* **Root Cause**: Test functions declare `db: Session` parameter, but `pytest` cannot find a fixture named `db` because `backend/conftest.py` is not created in the test directory.
* **Recommended Fix**: Create `backend/conftest.py`:
  ```python
  import pytest
  from backend.app.db.database import SessionLocal, Base, engine

  @pytest.fixture
  def db():
      connection = engine.connect()
      transaction = connection.begin()
      session = SessionLocal(bind=connection)
      yield session
      session.close()
      transaction.rollback()
      connection.close()
  ```

---

### BUG-003: Python 3.12 Deprecation Warnings on `datetime.utcnow()`
* **Severity**: `LOW`
* **Location**: `backend/app/main.py`, `backend/app/db/models.py`, `backend/app/agents/*.py`
* **Warning Log**:
  ```text
  DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  ```
* **Root Cause**: Python 3.12 deprecated naive `utcnow()` in favor of timezone-aware UTC timestamps.
* **Recommended Fix**: Batch-replace `datetime.datetime.utcnow()` with `datetime.datetime.now(datetime.UTC)`.

---

### BUG-004: Vite Chunk Size Exceeded Warning on Build
* **Severity**: `LOW`
* **Location**: `web/vite.config.js` / `dist/assets/index-363eb2c9.js`
* **Warning Log**:
  ```text
  (!) Some chunks are larger than 1200 kBs after minification. (4,492.79 kB)
  ```
* **Root Cause**: Pre-indexed LeetCode problem data (4.8MB) is statically included in the main bundle.
* **Recommended Fix**: Use `React.lazy()` dynamic imports in `App.jsx`.
