---
name: nextopportunityfind-security-compliance
description: Use this skill whenever adding, modifying, or reviewing any API endpoint, any code that touches candidate PII (resumes, contact details, parsed profile data), any LLM-calling endpoint, any file upload handler, or any secrets/environment configuration in NextOpportunityFind. Trigger this before shipping a new endpoint, before wiring a new feature to an LLM call, before touching agent1_parser.py (PII ingestion), before touching .env or config.py, and before any deploy to an environment reachable by real users. This is a horizontal, non-negotiable standard — it applies regardless of which agent or phase the work belongs to.
---

# NextOpportunityFind — Security & Compliance Standard (Skill 3)

This defines the minimum bar for anything touching real user data or costing
real money per request. Nothing here is optional for a production or
real-user-facing deploy — a feature that is otherwise "done" per skill_2's
scope is NOT done if it violates this standard. If a session is about to ship
an endpoint that touches PII or calls an LLM without these controls, stop and
flag it rather than proceeding.

## 1. Auth — required on every LLM-cost and PII endpoint
Any endpoint that (a) triggers an LLM call, or (b) reads/writes candidate PII,
must require authentication. This includes at minimum:
- `POST /api/profile/upload`
- `GET /api/profile`, `POST /api/profile`
- `POST /api/resume/tailor/{match_id}`
- `POST /api/prep/mock-session` (if/when interview prep is reopened per skill_2)
- Any quality-analysis or content-generation endpoint
- `GET /api/profile/export/*`

A full OAuth/JWT system is not required immediately (that's deferred per
skill_2's Tier 2/dropped section) — a simple API key or lightweight JWT stub
is the acceptable minimum bar. What's not acceptable is shipping any of these
endpoints with zero auth "temporarily," even for an internal demo, once real
candidate data is involved. No public-facing PII endpoint without auth, ever.

## 2. Rate limiting — required on every LLM-cost endpoint
Add per-user rate limits (e.g. via `slowapi` or a Redis-backed limiter) on:
- Resume tailoring
- Content quality analysis (if it triggers an LLM call rather than pure regex/heuristics)
- Mock interview scoring (if/when reopened)
- Batch operations of any kind

Default: 20 requests/hour/profile unless a specific feature has a documented
reason to differ. This exists to bound AI cost exposure — see also section 5
(usage caps), which is the product-level version of the same concern.

## 3. DPDP Act compliance — consent, encryption, retention, erasure
All four parts are required together; encryption alone is not compliance.
- **Consent**: `POST /api/profile/upload` must capture and store a
  `consent_given` boolean with a timestamp before parsing runs.
- **Encryption at rest**: `raw_resume_text`, `raw_extracted_content`, and
  `working_content` (or equivalent fields) must be encrypted at the
  application level (e.g. AES-GCM-256 with a key from environment secrets,
  never hardcoded).
- **Retention window**: a `data_retention_days` config value and a scheduled
  purge job for inactive profiles' PII past that window.
- **Right to erasure**: a working `DELETE /api/profile/{id}` that performs a
  real cascade delete across every table holding that profile's data
  (`profiles`, `matches`, `resumes_tailored`, `applications`, `email_log` if
  it exists, `interview_prep` if reopened, `outcome_diagnosis`,
  `outcome_events`) — not a soft-delete flag. If a new table is added later
  that stores profile-linked data, it must be added to this cascade.

## 4. Secrets hygiene
- Confirm `.env` is in `.gitignore`. If ever unsure whether a secret was
  historically committed, check history before assuming it's clean — and
  rotate the key if it was ever exposed, rather than just removing it going
  forward.
- No secrets baked into Docker images or committed config files.
- SMTP credentials, LLM API keys, and any third-party keys are
  environment-sourced only.

## 5. File upload validation (Agent 1 / resume ingestion)
- Enforce a max file size (e.g. 10MB).
- Whitelist MIME types explicitly — PDF, DOCX, ODT, TXT only, per the
  formats this project actually supports. Reject anything else before it
  reaches the parser.
- Wrap parsing in a timeout + try/except so a malformed or adversarial file
  cannot crash the main process — fail gracefully with a clear error, log it,
  move on.

## 6. Usage caps (cost control, product-level)
Even with `MONETIZATION_ENABLED = False` and unlimited nominal credits, add
soft weekly caps per profile (e.g. 5 resume tailors/week, 10 mock-interview
turns/week if reopened, 1 email batch/week if reopened) enforced at the API
layer with a clear message when hit — not a silent failure or infinite
allowance. This exists because "free" without bounds is an unbounded cost
liability, not a real pricing decision.

## 7. Cost telemetry
Log estimated token cost per LLM call, tagged by profile ID and endpoint, so
real cost-per-active-user is knowable before Tier 2/monetization decisions
are made. Structured log fields (profile_id, endpoint, estimated_tokens,
estimated_cost), not free-text log lines — this needs to be queryable later.

## Standing rules for any session working on this project
- Treat "no auth on this endpoint yet" as a blocker for any real-user deploy,
  not a nice-to-have — flag it explicitly rather than shipping around it.
- Never store PII unencrypted "just for this feature" or "just for testing" —
  the same encryption standard applies in every environment that touches real
  or realistic candidate data.
- Any new table or field that stores profile-linked PII must be added to the
  cascade-delete path in the same change that introduces it — don't let
  erasure coverage drift out of sync with the schema.
- Any new LLM-calling endpoint must get rate limiting and usage caps in the
  same change that introduces the endpoint — not as a follow-up ticket.
- If asked to relax any of these ("just for now," "just for the demo," "we'll
  add auth later") on an environment reachable by real users or real data,
  confirm that tradeoff explicitly rather than silently agreeing — this
  mirrors skill_2's rule about reopening deliberately-closed risk decisions.