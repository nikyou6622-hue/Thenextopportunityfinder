# NextOpportunityFind — Pivot Prompt: Auto-Apply → Classify & Link-Out

Hand this to your coding assistant against the repo. It removes the Playwright
auto-fill/auto-submit path and replaces it with a simpler, safer "classify the
source, give the candidate a clean apply link" flow. This also lets you drop
Phase 9 (headless Playwright adapters, CAPTCHA solving) from the roadmap entirely.

---

## PROMPT

You are working on NextOpportunityFind. Pivot Agent 5 (`source_router.py` and
related files in `backend/app/main.py` / `nextopportunityfind/routing/`,
`nextopportunityfind/apply/`) away from automated form-filling and submission,
toward classification + link-out only. Do NOT delete existing application
tracking (Kanban, outcome intelligence) — only the automated-submission path
changes.

### 1. Remove/retire the auto-fill submission path
- Remove or archive `greenhouse_apply.py` and any other Playwright-based
  auto-fill/submit scripts. If Playwright is used elsewhere in the project,
  leave the dependency; otherwise remove it from `requirements.txt`.
- Remove the `dry_run` auto-submit logic from `POST /api/applications/{id}/submit`.
  This endpoint should no longer attempt to fill or submit any external form.

### 2. Redefine what Agent 5 does
Agent 5 becomes a **classifier + link resolver**, not a submitter:
- For each job in `matches` / `applications`, classify `apply_url` into one of:
  `greenhouse`, `lever`, `ashby`, `company_direct`, `email_only`, `linkedin_discovery_only`,
  `naukri_discovery_only`, `internshala_discovery_only` (reuse existing domain-detection
  logic from the current router — that part doesn't need to change).
- Validate the URL is live (HTTP HEAD request, follow redirects, confirm it doesn't
  404 or redirect to a generic "job no longer available" page) before surfacing it
  to the candidate. Flag dead links with a `link_status` field (`live`, `dead`,
  `unchecked`) rather than silently showing broken links.
- Store the canonical resolved URL (after redirect-following) in `applications.apply_url_resolved`,
  separate from the raw discovered URL, so redirect chains don't break over time.

### 3. Update the applications schema and lifecycle
- Add `link_opened_at` (DATETIME, nullable) to `applications` — set when the
  candidate clicks the apply link from your UI (track via a lightweight
  `POST /api/applications/{id}/track-click` endpoint that logs the click, then
  redirects/returns the resolved URL).
- Update lifecycle stages in `agent7_outcome_intelligence.py` /
  `outcome_tracker.py`: replace `submitted` with `link_opened` as the stage after
  `pending_manual_review`. The candidate self-reports moving to `interview_scheduled`,
  `offer_received`, etc. — same as before, just without a false claim of automated
  submission.
- Remove `form_autofill_data` (JSON) from the `applications` table, or repurpose
  it to store just the classification metadata (source platform, link status) —
  drop any field that implied stored form-fill data, since you're no longer
  storing third-party form field mappings.

### 4. Update the frontend (`ApplicationPipeline.jsx`)
- Replace "Auto-Apply" / "Review & Submit" actions with a single clear
  "Open Application" button per card that opens `apply_url_resolved` in a new
  tab and fires the click-tracking endpoint.
- Add a small source-platform badge (Greenhouse / Lever / Ashby / Company Direct /
  Email) next to each application card so candidates know what they're walking into.
- For `email_only` listings, keep the existing Agent 6 batch-email flow as is —
  that path is unaffected by this pivot, it's a separate outreach mechanism, not
  auto-apply.
- For `linkedin_discovery_only` / `naukri_discovery_only` / `internshala_discovery_only`,
  show the listing with a note like "Apply directly on [Platform]" linking to the
  original listing — reinforcing the discovery-only policy you already have.

### 5. Roadmap update
- Mark Phase 9 ("Full Headless Playwright Auto-Apply Adapters & CAPTCHA Solver")
  as `[DROPPED]` in the phases document, with a one-line rationale: replaced by
  classify-and-link-out to reduce legal/trust risk and maintenance burden.
- Update Phase 5's description in the same doc to reflect the new scope:
  "Smart ATS Application Classifier & Link Resolver" instead of "Application
  Router & Auto-Fill."

### 6. Tests
- Update or replace any existing Playwright-based tests for auto-apply.
- Add tests for: URL classification accuracy, dead-link detection, click tracking,
  and the updated lifecycle stage transitions (no more `submitted` status assumptions
  anywhere else in the codebase — grep for `"submitted"` across the backend and
  frontend and update every reference).

---

After this, re-run `test_agent8_and_outcomes.py` since it likely references
lifecycle stages that just changed, and confirm the dashboard metrics
(`/api/dashboard/metrics`) don't break on the renamed `submitted` → `link_opened` stage.