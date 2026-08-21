---
name: nextopportunityfind-retention-reengagement
description: Use this skill whenever building, modifying, reviewing, or extending any notification mechanism, re-engagement loop, digest generator, scheduled discovery/MNC scan trigger, or candidate retention system in NextOpportunityFind. It defines the factual event-driven notification architecture, anti-spam and zero-filler standards, candidate-controlled preference models, digest batching, rate controls, DPDP erasure coupling, and frontend telemetry — ensuring candidate retention is driven by authentic, high-signal value rather than artificial growth hacks or spam.
---

# NextOpportunityFind — Retention & Re-Engagement Loop Standard (Skill 5)

This is the authoritative standard for all candidate re-engagement, retention
mechanics, event notifications, and digest communications in NextOpportunityFind.
It exists so that every session builds high-trust, habit-forming touchpoints
that respect candidate attention, enforce DPDP compliance, prevent token waste,
and strictly adhere to zero-hallucination standards.

---

## 1. Product Philosophy & Core Identity

### The Retention Problem in Job Search Tools
Most job search tools suffer from a fatal retention profile:
1. A candidate uploads a resume, optimizes ATS score once, downloads an export,
   and never returns.
2. Platforms attempt to fix this with low-signal "growth hacks" — generic spam
   emails ("We miss you!", "500 new jobs added in Tech!"), artificial urgency,
   or vague claims that erode candidate trust.

### NextOpportunityFind's Re-Engagement Principle
NextOpportunityFind rejects generic spam in favor of **Factual, Event-Driven
Retention Triggers**. A re-engagement notification is sent *if and only if* a
concrete, verified event occurred in the system that directly affects the
candidate's specific job search.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EVENT TRIGGER ENGINE                            │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│ 1. High-Match Discovery  │ 2. MNC Career Scan Done  │ 3. Dead Link Hit │
│ (Score ≥ 80% on profile) │ (10 Portals Swept Live)  │ (Kanban 404/410) │
├──────────────────────────┼──────────────────────────┼──────────────────┤
│ 4. Quality Score Tier    │ 5. Skill-Gap Milestone   │                  │
│ (ATS score tier upgrade) │ (2-Week Plan Progress)   │                  │
└──────────────────────────┴──────────────────────────┴──────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CANDIDATE PREFERENCE FILTER                          │
│   (Cadence: Immediate | Daily Digest | Weekly Digest | Off)            │
│   (Category Toggles: Matches | MNC | Dead Links | Quality | Milestones)│
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   MULTI-CHANNEL DISPATCH                               │
│   - In-App Notification Center (OverviewDashboard.jsx)                 │
│   - Daily/Weekly Markdown/HTML Digest Formatters                       │
│   - Mobile PWA Badges (Port 3001)                                      │
└────────────────────────────────────────────────────────────────────────┘
```

### The Non-Negotiable Zero-Filler Guarantee
- If there are **zero** new events for a candidate, the Notification Center in
  the UI renders **nothing** (`return null`).
- No generic "Check out recent jobs", no placeholder filler cards, no fake match
  counts, and no unsolicited marketing pings.
- Retention is earned through precision and relevance, never noise.

---

## 2. Canonical Trigger Types & Severity Catalog

Every notification record in the system belongs to one of 5 canonical trigger types:

| Trigger Type (`trigger_type`) | Trigger Condition | Severity (`severity`) | Destination Tab (`action_tab`) | Description & Content Payload |
| :--- | :--- | :--- | :--- | :--- |
| `qualified_match` | Scraper / discovery sweep indexes a job with `match_score >= 80%` | `success` | `jobs` | States exact count of high-match roles found with company & title tags. |
| `mnc_scan` | Deep scan of the 10 registered MNC career portals completes | `info` | `mnc` | Informs candidate of new MNC enterprise openings matching their domain. |
| `dead_link` | Link resolver detects a saved application URL is 404/410/dead | `warning` / `urgent` | `pipeline` | Immediate warning so candidate doesn't waste time on stale portals. |
| `quality_score_tier` | Profile ATS benchmark crosses tier (e.g., `<70` → `≥85` Top Tier) | `success` | `profile` | Acknowledges quantified resume improvement across 5 ATS pillars. |
| `skill_gap_milestone` | Candidate closes missing keywords via 2-week learning vault | `info` | `jobs` | Tracks skill closing progress against target role descriptions. |

### Severity Token Guidelines
- `success` (`#10b981` Emerald): High-value positive opportunities (e.g. 85%+ matches, ATS tier upgrades).
- `info` (`#6366f1` Indigo / `#38bdf8` Sky): System status, completed scans, learning vault updates.
- `warning` (`#f59e0b` Amber): Non-blocking issues needing attention (e.g. 3 missing critical keywords).
- `urgent` (`#f43f5e` Rose): Action-required items (e.g. dead application portal links).

---

## 3. Candidate-Controlled Preference Engine

Candidate sovereignty over alert frequency is mandatory. Notification preferences
must be fully customizable from `SettingsPrivacy.jsx` (Desktop) and `MobileSettings.jsx` (Mobile PWA).

### Cadence Modes (`cadence`)
1. `immediate`: Real-time in-app alert badges and instant notifications.
2. `daily_digest` *(Default)*: Consolidates all 24-hour events into a single morning summary.
3. `weekly_digest`: Consolidates 7-day progress, new matches, and MNC portal updates into a weekly digest.
4. `off` / `muted`: Completely disables push/digest notifications while preserving in-app inbox history.

### Granular Category Toggles
Candidates can independently toggle any alert channel:
- `new_matches_enabled` (Boolean)
- `mnc_scans_enabled` (Boolean)
- `quality_tips_enabled` (Boolean)
- `dead_links_enabled` (Boolean)
- `skill_gap_milestones_enabled` (Boolean)

---

## 4. Database Schema & Data Contracts

### 1. `NotificationEventModel` (`notification_events` table)
```python
class NotificationEventModel(Base):
    __tablename__ = "notification_events"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False, index=True)
    trigger_type = Column(String, index=True, nullable=False) # qualified_match, mnc_scan, quality_score_tier, dead_link, skill_gap_milestone
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    data_payload = Column(JSON, default=dict)
    action_tab = Column(String, default="overview") # jobs, mnc, pipeline, profile, overview
    severity = Column(String, default="info") # info, success, warning, urgent
    is_read = Column(Boolean, default=False)
    batch_id = Column(String, nullable=True)
    delivered_channel = Column(String, default="in_app") # in_app, email_digest, push
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
```

### 2. `NotificationPreferenceModel` (`notification_preferences` table)
```python
class NotificationPreferenceModel(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), unique=True, nullable=False, index=True)
    cadence = Column(String, default="daily_digest") # immediate, daily_digest, weekly_digest, off
    new_matches_enabled = Column(Boolean, default=True)
    mnc_scans_enabled = Column(Boolean, default=True)
    quality_tips_enabled = Column(Boolean, default=True)
    dead_links_enabled = Column(Boolean, default=True)
    skill_gap_milestones_enabled = Column(Boolean, default=True)
    last_notification_sent_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
```

---

## 5. API Endpoints Specification

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/{profile_id}` | Optional / Session | Returns unread and active factual notifications for candidate. |
| `GET` | `/api/notifications` | Active Session | Returns active notifications for default active profile. |
| `POST` | `/api/notifications/{id}/read` | Active Session | Marks a specific notification event as read. |
| `POST` | `/api/notifications/mark-all-read` | Active Session | Marks all candidate notifications as read. |
| `GET` | `/api/notifications/{profile_id}/preferences` | Optional / Session | Fetches current cadence and category toggles. |
| `PUT` | `/api/notifications/{profile_id}/preferences` | Active Session | Updates notification cadence and toggle preferences. |
| `POST` | `/api/notifications/digest/preview` | Active Session | Generates a preview of the candidate's formatted digest. |

---

## 6. Frontend UI Components Architecture

### 1. `NotificationCenter.jsx` (Desktop & Mobile)
- Positioned prominently at the top of `OverviewDashboard.jsx`.
- Real-time rendering with glassmorphism aesthetics.
- Dismissible cards (`handleDismiss`) with persistent state.
- Zero-filler rule: Returns `null` when no unread notifications exist.
- Click-to-navigate action triggers (`onNavigate(action_tab)`).

### 2. `NotificationPreferences.jsx` (`SettingsPrivacy.jsx`)
- Segmented control for cadence selection (`Immediate`, `Daily Digest`, `Weekly Digest`, `Off`).
- Visual toggle switches for all 5 notification categories.
- Instant server synchronization with feedback toast notifications.

---

## 7. Security, DPDP Compliance & Token Economics

### 1. DPDP Cascade Erasure Integration (Skill 3 Standard)
- Per the Digital Personal Data Protection (DPDP) Act standard, when a candidate
  triggers account deletion via `DELETE /api/profile/{id}`, all records in:
  - `notification_events`
  - `notification_preferences`
  MUST be completely cascade deleted in the same atomic database transaction.
- No orphan notification records or tracking logs may remain post-deletion.

### 2. Zero-Hallucination Notification Integrity (Skill 4 Standard)
- Notification titles and messages must NEVER contain fabricated statistics or
  imagined company names.
- Example: If 3 jobs match, say `"3 High-Match Opportunities Found"`, NEVER
  `"Dozens of recruiters are looking for your profile"`.
- If an MNC scan found 0 new roles, emit no alert or explicitly state 0 listings.

### 3. Deterministic Templating (Zero Token Waste)
- Re-engagement notifications and digest bodies MUST be generated using fast,
  deterministic string interpolation and rule engines, NOT recurrent LLM calls.
- LLM inference is strictly reserved for user-directed resume tailoring (Agent 4)
  and semantic matching (Agent 3) — never for background notification dispatch.

### 4. Anti-Spam Coalescing & Rate Bounds
- Event Coalescing: If a scraper sweep discovers 20 new matching jobs in a single
  run, generate **1 consolidated notification** (`"20 New High-Match Roles Found"`),
  never 20 individual notifications.
- Frequency Capping: Maximum of 1 outbound digest per 24-hour cycle for `daily_digest`,
  and 1 per 7-day cycle for `weekly_digest`.

---

## 8. Standing Rules for Any Session Working on Retention

1. **Never add filler notification cards** — If `notifications.length === 0`, return `null`. Never render generic encouragement cards.
2. **Never send unsolicited communications without preference consent** — Always check `cadence !== "off"` and specific category boolean flags before dispatching.
3. **Always link notifications to direct actionable UI tabs** — Every notification must include an `action_tab` (`jobs`, `mnc`, `pipeline`, `profile`, `overview`).
4. **Enforce atomic cascade delete** — Ensure `cascade_delete_profile()` always purges `notification_events` and `notification_preferences`.
5. **Verify with automated tests** — Run `backend/test_skill5_retention_and_reengagement.py` before marking any retention work complete.
