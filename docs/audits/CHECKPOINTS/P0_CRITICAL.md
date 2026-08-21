# P0 — CRITICAL PRIORITY CHECKPOINTS

```text
CHECKPOINT: CP-001
TASK: Centralize Pytest Session Fixtures
PRIORITY: P0
CURRENT STATUS: 3 tests in test_agent8_comprehensive.py error on missing 'db' fixture
FILES: backend/conftest.py
DEPENDENCIES: pytest, sqlalchemy
IMPLEMENTATION REQUIREMENTS:
  Create backend/conftest.py with `@pytest.fixture def db(): ...` yielding a clean testing session and rolling back transactions cleanly.
TEST REQUIREMENTS:
  Run `python -m pytest backend/test_agent8_comprehensive.py` and verify all 6 tests pass.
SECURITY REQUIREMENTS:
  None.
DONE WHEN:
  `python -m pytest backend/` executes with 0 setup errors.
STATUS: NOT STARTED
```

```text
CHECKPOINT: CP-002
TASK: Fix Mismatched Profile Tailoring Assertion
PRIORITY: P0
CURRENT STATUS: test_type_mismatch_resilience fails in test_skill4_zero_hallucination_standard.py
FILES: backend/app/agents/agent4_tailor.py, backend/test_skill4_zero_hallucination_standard.py
DEPENDENCIES: agent4_tailor
IMPLEMENTATION REQUIREMENTS:
  Update fallback summary when profile has no summary to explicitly reference the target company:
  `f"Candidate targeting {job.get('role_title', 'Software Engineer')} role at {job.get('company', 'Target Company')}: AI summary unavailable, needs manual input."`
TEST REQUIREMENTS:
  Run `python -m pytest backend/test_skill4_zero_hallucination_standard.py` and verify 100% pass rate.
SECURITY REQUIREMENTS:
  Preserve zero-hallucination guarantee.
DONE WHEN:
  Test passes cleanly.
STATUS: NOT STARTED
```
