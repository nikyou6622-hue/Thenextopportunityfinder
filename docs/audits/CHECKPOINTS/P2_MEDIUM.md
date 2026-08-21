# P2 — MEDIUM PRIORITY CHECKPOINTS

```text
CHECKPOINT: CP-201
TASK: Replace Deprecated datetime.utcnow()
PRIORITY: P2
CURRENT STATUS: Emits Python 3.12 deprecation warnings
FILES: backend/app/main.py, backend/app/db/models.py, backend/app/agents/*.py
DEPENDENCIES: datetime.timezone
IMPLEMENTATION REQUIREMENTS:
  Replace `datetime.datetime.utcnow()` with `datetime.datetime.now(datetime.UTC)`.
TEST REQUIREMENTS:
  Run pytest and verify 0 deprecation warnings from datetime.
SECURITY REQUIREMENTS:
  None.
DONE WHEN:
  Pytest runs with clean logs.
STATUS: NOT STARTED
```

```text
CHECKPOINT: CP-202
TASK: Clean Unused SalaryIntelligenceStudio.jsx Stub
PRIORITY: P2
CURRENT STATUS: File contains a 6-line stub
FILES: web/src/components/SalaryIntelligenceStudio.jsx, web/src/components/OverviewDashboard.jsx
DEPENDENCIES: None
IMPLEMENTATION REQUIREMENTS:
  Extract the CTC & Salary Calculator widget from OverviewDashboard into SalaryIntelligenceStudio.jsx for modularity.
TEST REQUIREMENTS:
  Verify salary calculation works in both Overview and standalone tab.
SECURITY REQUIREMENTS:
  None.
DONE WHEN:
  Component is fully functional and tested.
STATUS: NOT STARTED
```
