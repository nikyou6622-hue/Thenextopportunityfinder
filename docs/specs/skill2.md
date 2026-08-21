---
name: nextopportunityfind-scope-and-roadmap
description: Use this skill whenever building, planning, reviewing, or extending any feature in NextOpportunityFind. It defines what is currently in scope (Tier 1 core loop, Tier 2 near-term), what has been deliberately dropped or deferred, and why — so no session accidentally rebuilds a dropped feature (auto-apply, cold email, voice interviewer) or deprioritizes the actual differentiators (India-specific job sources, zero-hallucination guarantee, retention loop). Trigger this before starting any new feature, before adding a new phase/agent, before touching source_router.py or any scraping/discovery code, and before any planning or roadmap discussion.
---

# NextOpportunityFind — Scope & Roadmap (Skill 2)

This is the authoritative scope decision for this project. It exists so that
every future session — yours or an AI assistant's — makes the same
prioritization calls instead of re-litigating them from scratch or silently
drifting back toward a feature that was deliberately cut.

## Product identity, in one line
A resume-quality + job-matching tool with clean, honest apply links —
not an autonomous application-submission agent. This positioning was a
deliberate pivot, not a limitation. It removes the biggest legal, trust, and
maintenance risks in the category while keeping 100% of the highest-value,
most shareable features (ATS scoring, tailored resumes, matching).

## Workflow (current, canonical)
```
Upload Resume → ATS Score Optimization → Discover & Match (job recommendations)
→ Direct Apply Links (+ Big MNC Scanner feeds into this) → Tailor & Multi-Format Export
```

## TIER 1 — Core loop. Build/maintain this first, always.
1. **Resume ingestion & zero-hallucination parsing** (Agent 1) — PDF/DOCX/ODT/TXT
   extraction, DPDP consent capture, AES-GCM-256 field-level encryption at rest
   for PII. Non-negotiable before any real user data flows through the system.
   Must include a working right-to-erasure / cascade-delete path, not just
   encryption.
2. **ATS score optimization & content quality engine** (Agents 1 & 4) —
   5-pillar scoring, weak-verb detection, unquantified-achievement detection,
   unsubstantiated-skill detection, live re-scoring. This is the highest-trust,
   most shareable feature in the product — prioritize correctness and
   perceived intelligence here over speed of shipping other phases.
3. **Semantic matching & gap analysis** (Agent 3) — match score, skill overlap,
   missing-keyword gap analysis. Core value, no legal risk, works standalone.
4. **Tailored export — PDF/DOCX/Markdown** (Agent 4) — zero-hallucination
   guarantee is absolute: missing fields get neutral placeholders
   (`[Add description]`), never fabricated content. Adaptive section ordering
   (freshers get Education/Projects promoted). Font-density-aware PDF sizing.
   Quality score and missing-field metadata must reach the candidate before
   they export/submit — this isn't optional, it's the point of the feature.

## TIER 2 — Add only once Tier 1 has real users validating it.
5. **Discovery, narrowed and link-out only** (Agent 2) — LinkedIn, Indeed, and
   YC Work at a Startup as link-out-only sources (no scraping of protected
   ATS portals, no auto-apply). Add back at least one India-specific source
   (Internshala + CutShort or Instahyre) — **do not let the source list drift
   down to global-only boards.** India-specific startup discovery is this
   product's actual differentiation versus every US-built alternative
   (Teal, Jobscan, Simplify, LazyApply, Sonara). If a session finds itself
   about to ship with only LinkedIn/Indeed/YC as sources, that's scope drift —
   flag it, don't silently proceed.
6. **Big MNC career portal scanner** (Agent 2b) — only after a
   `data_source_registry.py`-style compliance record exists (access_method,
   robots_txt_checked_at, terms_reviewed) for each target company's portal.
   No scanning without that groundwork.
7. **Retention/re-engagement loop** (not yet built as of this writing) —
   "3 new matches found," "MNC scan found something for you." Build this
   *before* polishing Tier 2 further — without it, every phase in the workflow
   is a one-time visit, not a habit. This is one of the two highest-leverage
   gaps in the current product.
8. **Skill-gap-to-action step** — turn a missing-keyword gap analysis result
   into a concrete two-week closing plan or resource link, using the existing
   `learning_resources` data model. Cheap to add, converts a static analysis
   screen into a reason to return.

## DROPPED — do not build these unless explicitly re-approved
Each of these was cut for a specific reason. If a future prompt asks to "add
auto-apply" or similar, treat that as a request to reopen a closed decision,
not a routine feature ask — confirm intent explicitly before building.

- **Auto-apply / Playwright form-filling** (old Phase 9). Dropped: highest
  legal/ToS and trust risk in the whole roadmap (wrong-field submissions,
  fragile per-ATS selector maintenance, CAPTCHA arms race). Replaced entirely
  by classify-and-link-out.
- **Batch cold email outreach** (old Agent 6). Dropped: second-highest risk
  after auto-apply — SMTP account suspension risk if sent via a candidate's
  personal email, spam-filter/reputation risk, CAN-SPAM-style compliance
  burden. Link-out-only already captures most of the value with none of this risk.
- **Interview prep / mock interview simulator / coding practice hub**
  (old Agent 8). Deferred, not because it's a bad idea, but because it's a
  large build (question banks, AI scoring, coding sandbox) that doesn't help
  a candidate get matched or tailored faster — it's a retention feature
  wearing a core-feature costume. Revisit only after Tier 1+2 prove there are
  real users reaching the interview stage in volume.
- **Real-time voice AI interviewer** (old Phase 13). Dropped for now:
  expensive (WebRTC + STT/TTS infra), complex, solving a problem with zero
  current user data to justify it.
- **Full multi-tenant SaaS auth + billing** (old Phase 12). Deferred as a full
  system. Basic auth (API key or simple JWT) is still required now for
  security on any LLM-cost endpoint — that is NOT dropped, only the full
  workspace/Stripe/Razorpay billing architecture is deferred until there's
  paying-intent signal from real users.
- **24/7 autonomous scraping daemon + residential proxy rotation**
  (old Phase 11). Deferred: on-demand scans (already in Tier 2 MNC scanner)
  are sufficient until real volume demands continuous background scraping.
  Don't build scheduler/proxy infrastructure speculatively.
- **Compensation intelligence display.** Deferred, not dropped — the
  underlying data (compensation ranges via canonical normalization) is
  already captured in Phase 3's schema. Building the display/analysis layer
  can wait until Tier 1+2 ship; don't let this become a Tier 1 distraction.
- **Outcome-feedback-into-matching loop.** Deferred, not dropped — this is a
  genuine long-term moat (proprietary data a competitor can't copy overnight),
  but it needs a real base of tracked outcomes to be useful. Don't build this
  before there's at least ~100 tracked application outcomes to learn from.

## Standing rules for any session working on this project
- Never reintroduce automated form submission or cold email as a default —
  if asked to, confirm explicitly this reopens a deliberate risk-reduction
  decision rather than treating it as a normal feature request.
- Never let India-specific source coverage silently shrink to "LinkedIn +
  Indeed + YC only" — that's the product's actual differentiation, not a
  detail.
- The zero-hallucination guarantee applies to every content-generation
  surface, not just the export generator — any new AI-assisted feature
  (e.g. skill-gap plans, quality suggestions) must stay advisory/informational
  and never fabricate or auto-insert unverified facts into candidate-facing output.
- Before adding any new scraping source, confirm it has an entry in the
  compliance/source registry (access method, robots.txt status, terms
  reviewed) — this applies equally to Tier 2 discovery and the MNC scanner.
- Basic auth and rate limiting on LLM-cost endpoints is a Tier 1 security
  requirement, not a "later" item, even though it's not one of the six
  candidate-facing phases above.