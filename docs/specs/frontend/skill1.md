# NextOpportunityFind — Frontend Blueprint (Corrected, Scope-Aligned) — v2

This supersedes the earlier frontend blueprint. It corrects one scope
violation (Interview Prep Studio was still present despite being confirmed
OUT OF SCOPE per skill_2) and closes two real gaps (no data-erasure UI, no
retention-loop surface). Everything else — design tokens, glassmorphism
style, state management choices, performance targets — carries over
unchanged; those were sound.

---

## 1. System Architecture (corrected)

```
graph TD
    subgraph "Desktop Web Portal (Port 3000)"
        App["App.jsx"]
        Sidebar["Sidebar.jsx"]
        Header["Header.jsx"]
        App --> Tab1["OverviewDashboard.jsx"]
        App --> Tab2["ResumeAnalyzer.jsx"]
        App --> Tab3["JobDiscovery.jsx"]
        App --> Tab4["MncOpportunityHub.jsx"]
        App --> Tab5["TailoringHub.jsx"]
        App --> Tab6["ApplicationPipeline.jsx"]
        App --> Tab7["SettingsPrivacy.jsx"]
        Tab1 --> Sub1["OutcomeDiagnosisCard.jsx"]
        Tab1 --> Sub2["NotificationCenter.jsx"]
        Tab2 --> Sub3["DragDropResumeEditor.jsx"]
        Tab3 --> Sub4["SkillGapActionPlanModal.jsx"]
        Tab7 --> Sub5["DataErasureControl.jsx"]
        Tab7 --> Sub6["NotificationPreferences.jsx"]
    end
    subgraph "Mobile PWA (Port 3001)"
        MobApp["App.jsx"]
        MobApp --> MobNav["MobileBottomNav.jsx"]
        MobApp --> Mob1["MobileOverview.jsx"]
        MobApp --> Mob2["MobileAtsScanner.jsx"]
        MobApp --> Mob3["MobileJobFeed.jsx"]
        MobApp --> Mob4["MobilePipeline.jsx"]
        MobApp --> Mob5["MobileSettings.jsx"]
    end
    subgraph "FastAPI Backend (Port 8000)"
        API["/api/* Routes"]
    end
    App -. "Vite Proxy (/api)" .-> API
    MobApp -. "Vite Proxy (/api)" .-> API
```

**What changed and why:**
- `InterviewPrepStudio.jsx` and its sub-panels (`CodingQuestionPractice.jsx`,
  `PrepResourcesTab.jsx`, `CompanyBriefPanel.jsx`, `QuestionBankPanel.jsx`,
  `MockCoachPanel.jsx`) are **removed** — `interview_prep`/`coding_attempts`
  were confirmed OUT OF SCOPE per skill_2's gap audit. 6 desktop tabs, not 7.
- `MobileInterviewPrep.jsx` removed from mobile nav — 4 primary icons
  (Home, ATS, Jobs, Pipeline) plus Settings, not 5 with Prep.
- Added `SettingsPrivacy.jsx` (desktop) / `MobileSettings.jsx` (mobile) —
  houses the data-erasure control (skill_3 compliance) and notification
  preferences (skill_5 compliance). Neither existed in the prior blueprint.
- Added `NotificationCenter.jsx` on the dashboard and `SkillGapActionPlanModal.jsx`
  under Job Discovery — both are already-shipped backend features (per the
  skill_2 audit report) that had no frontend surface in the prior blueprint.
- If Interview Prep is ever reopened per skill_2's revisit condition (Tier 1+2
  proving volume), reintroduce it as a new tab at that time — don't build it
  speculatively now.

---

## 2. Design System Tokens
Unchanged from the original — implement globally:

```css
:root {
  --bg-primary: #0b0f19;
  --panel-bg: rgba(15, 23, 42, 0.65);
  --panel-border: rgba(255, 255, 255, 0.08);
  --accent-indigo: #6366f1;
  --accent-purple: #8b5cf6;
  --accent-emerald: #10b981;
  --accent-sky: #38bdf8;
  --accent-rose: #f43f5e;
  --accent-amber: #f59e0b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Glassmorphism card style — unchanged:
```css
.glass-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  transition: all 0.2s ease;
}
.glass-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

Add one status-specific token set for use in `SettingsPrivacy.jsx` and
`NotificationCenter.jsx` — a destructive-action style, since data erasure
needs to visually read as serious/irreversible, distinct from ordinary
danger buttons:
```css
.btn-destructive-confirm {
  background: transparent;
  border: 1px solid var(--accent-rose);
  color: var(--accent-rose);
}
.btn-destructive-confirm:hover {
  background: var(--accent-rose);
  color: var(--text-primary);
}
```

---

## 3. Folder Structure (corrected)

```
web/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   ├── resumeService.js
│   │   ├── jobService.js
│   │   ├── analyticsService.js
│   │   ├── notificationService.js       # NEW — skill_5
│   │   └── privacyService.js            # NEW — skill_3 erasure/consent
│   ├── components/
│   │   ├── common/          # Button, Card, Modal, Badge, ProgressRing, EmptyState, Skeleton
│   │   ├── layout/          # Sidebar, Header, MobileNav
│   │   ├── dashboard/       # OverviewDashboard, OutcomeDiagnosisCard, MetricGauge, NotificationCenter
│   │   ├── resume/          # ResumeAnalyzer, DragDropResumeEditor, AtsScoreGauge, AtsRawView, ExportButtons
│   │   ├── jobs/            # JobDiscovery, JobCard, MatchBadge, KeywordOverlap, SkillGapActionPlanModal
│   │   ├── mnc/             # MncOpportunityHub, MncTemplateCard
│   │   ├── tailoring/       # TailoringHub, CoverNoteEditor
│   │   ├── pipeline/        # ApplicationPipeline, KanbanColumn
│   │   └── settings/        # SettingsPrivacy, DataErasureControl, NotificationPreferences   # NEW
│   ├── hooks/               # useDebounce, useLocalStorage, useResumeData, useJobMatches, useNotifications
│   ├── context/             # AuthContext, ProfileContext, ThemeContext
│   ├── store/               # Zustand stores: resumeStore, jobStore, pipelineStore, notificationStore
│   ├── utils/                # formatters, validators, constants, atsHelpers
│   ├── styles/               # global.css, variables.css, animations.css
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
├── .env.development
├── .env.production
├── vite.config.js
└── package.json
```

The `interview/` directory, `useInterviewPrep` hook, `interviewStore`, and
`interviewService.js` are removed entirely — not stubbed, not commented out.
If Interview Prep is reopened later, rebuild this directory fresh against
whatever the reopened backend contract looks like at that time, rather than
resurrecting frontend code that's been sitting dormant.

---

## 4. Core Screens & Components

### 4.1 Overview Dashboard (`OverviewDashboard.jsx`)
- Circular SVG metric gauges for Total Opportunities, Active Applications,
  ATS Health Score.
- `OutcomeDiagnosisCard`: analyzes application transition patterns (e.g.
  "3 consecutive rejections in Fintech — consider adding relevant keywords")
  with 1-click "Apply Recommendation" actions. Per skill_4: this card
  surfaces factual patterns detected in the candidate's own data — it must
  not generate or imply specific keyword suggestions the candidate hasn't
  actually seen flagged elsewhere in their gap analysis. Cross-reference
  against Agent 3's actual missing-keyword output; don't let the card
  invent plausible-sounding advice.
- **`NotificationCenter.jsx` (NEW)**: surfaces skill_5's retention triggers
  — new qualified matches, MNC scan completions, quality-tier changes, dead
  saved links. Each notification card shows the specific factual event
  (count of new matches, which scan completed) with a direct link into the
  relevant tab. No generic "come back and check" cards — if there's nothing
  new, this section is empty, not filled with filler content.

### 4.2 Live Resume & ATS Studio (`ResumeAnalyzer.jsx`)
Three view modes, unchanged from original:
- **Split Mode**: left form editor, right live ATS score gauge with
  recommendation cards.
- **Visual A4 Preview**: pixel-perfect printable A4 resume simulation.
- **ATS Raw View**: terminal-style mono text showing parsed plain-text output.

ATS 5-Pillar Engine display (0–100):
```
[Total ATS Score]
├── Skills Density (35 pts)
├── Action Verbs & Metrics (25 pts)
├── Summary Alignment (20 pts)
└── Section Structure (20 pts)
```

Exports: PDF, DOCX, Markdown via `ExportButtons.jsx`. Each export action
must surface `missing_fields`/`quality_analysis` metadata from the backend
(per skill_4's export-generator work) before triggering download — show a
lightweight "3 fields still need attention" banner with a link back into
the editor, not a silent export. Clear/Reset button calls
`POST /api/profile/{id}/reset`.

### 4.3 Discover & Match Hub (`JobDiscovery.jsx`)
- Bi-encoder semantic match badge (Green ≥80%, Sky 65–79%, Amber <65%).
- Keyword Overlap Visualizer with missing keywords and "+ Add to Resume"
  triggers (opens the relevant `ResumeAnalyzer.jsx` section, doesn't
  auto-insert text — per skill_4, the candidate writes their own content).
- Protected Domain Shield: direct links to official application portals only.
- Batch CSV/JSON importer for custom job lists.
- **`SkillGapActionPlanModal.jsx` (NEW)**: surfaces the already-shipped
  `GET /api/skills/action-plan` endpoint. Triggered from a "Close this gap"
  action on any job card with missing keywords. Shows the 2-week plan
  (Week 1: fundamentals, Week 2: production integration/resume project)
  with links to the underlying `LearningResourceModel` resources. This was
  built on the backend per the skill_2 audit but had no UI — this closes
  that gap.

### 4.4 Big MNC Openings (`MncOpportunityHub.jsx`)
- Direct portal tracker for the 10 registered Tier-1 companies (Google,
  Microsoft, Amazon, Meta, Apple, Uber, Netflix, Salesforce, Adobe, Oracle)
  — confirm each links to an actual careers subdomain/path, not a bare
  root domain (flagged as worth double-checking in the compliance registry).
- One-click "Run Deep Portal Scan" with animated status polling.
- FAANG/MNC-pattern resume templates: Google Silicon Single-Column, Amazon
  STAR-Format, Meta High-Velocity, Microsoft Enterprise Systems.

### 4.5 Tailor & Apply (`TailoringHub.jsx`)
- Displays target company, role title, match %, status badge.
- View tailored summary and quality-analysis suggestions (advisory only,
  per skill_4 — never auto-inserted into the candidate's resume).
- Status selector reflecting skill_1's actual lifecycle: `Matched` →
  `Tailored` → `Pending Review` → `Link Opened` → `Interview Scheduled` →
  `Offer` → `Archived`. Note: **no "Submitted" status** — per skill_1's
  classify-and-link-out pivot, this app cannot confirm submission, only that
  the candidate opened the application link. Don't imply confirmation the
  system doesn't have.
- Source-platform badge (Greenhouse / Lever / Ashby / Company Direct /
  Email / Discovery-Only) next to each application, per skill_1.

### 4.6 Application Pipeline Kanban (`ApplicationPipeline.jsx`)
5-column Kanban matching the corrected lifecycle: Saved/Tailored,
Link Opened, Interviewing, Offer Received, Archived/Rejected. Drag-and-drop
between columns where feasible, status dropdown as fallback.

### 4.7 Settings & Privacy (`SettingsPrivacy.jsx`) — NEW, closes a real gap
This tab didn't exist in the prior blueprint at all. It houses:
- **`DataErasureControl.jsx`**: a visible, clearly-labeled "Delete my
  account & all data" action. Must:
  - Require explicit confirmation (type-to-confirm or a two-step modal —
    this is irreversible, per skill_3's cascade delete).
  - Call the backend's actual cascade-delete endpoint
    (`DELETE /api/profile/{id}`), not a soft-delete or deactivation.
  - Clearly state what gets deleted (resume data, matches, applications,
    notification history — everything covered by skill_3's cascade list).
  - On success, log the candidate out and clear all local state
    (Zustand stores, cached queries) — don't leave stale data visible
    client-side after a server-side erasure.
- **`NotificationPreferences.jsx`**: candidate-controlled cadence setting
  per skill_5 (immediate / daily digest / weekly digest / off) — this is
  what makes skill_5's "user-controllable frequency" requirement real
  rather than just a backend field nobody can set.
- A visible restatement of DPDP consent already given (timestamp, what was
  consented to) — not just a checkbox at upload time with no later record
  the candidate can review.

---

## 5. State Management & Data Fetching

### 5.1 Client State (Zustand) — unchanged pattern, extended
```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useResumeStore = create(
  persist(
    (set) => ({
      resumeData: null,
      atsScore: null,
      isLoading: false,
      setResumeData: (data) => set({ resumeData: data }),
      setAtsScore: (score) => set({ atsScore: score }),
      updateField: (section, field, value) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            [section]: {
              ...state.resumeData[section],
              [field]: value,
            },
          },
        })),
      clearResume: () => set({ resumeData: null, atsScore: null }),
    }),
    { name: 'resume-storage' }
  )
);
```

Add a `notificationStore.js` for skill_5's cadence preference and unread
notification state — separate from `resumeStore` since it's a distinct
domain with its own persistence needs.

**Important**: `DataErasureControl.jsx`'s success handler must call
`clearResume()`, and the equivalent clear method on every other persisted
store (`jobStore`, `pipelineStore`, `notificationStore`), plus
`queryClient.clear()` (TanStack Query) — an erasure that leaves local
persisted state behind is not a real erasure from the candidate's
perspective, even if the server-side delete succeeded.

### 5.2 Server State (TanStack Query) — unchanged
```js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});
```

```js
export function useResumeData(profileId) {
  return useQuery({
    queryKey: ['resume', profileId],
    queryFn: () => resumeService.getProfile(profileId),
    enabled: !!profileId,
  });
}
```

Add `useNotifications(profileId)` following the same pattern, backed by
`notificationService.js` — poll or use whatever delivery mechanism skill_5's
backend implementation exposes (short-poll is fine for v1; don't over-build
websockets/push infra before this is proven wanted).

---

## 6. API Integration Layer

### Axios Client — unchanged
```js
// api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 429) {
      // Surface skill_3's rate-limit/usage-cap responses distinctly —
      // this is not a generic error, show the Retry-After / weekly-cap
      // message the backend returns, not a blank "something went wrong."
      return Promise.reject(new Error(error.response?.data?.detail || 'Rate limit reached — try again shortly.'));
    }
    return Promise.reject(new Error(error.response?.data?.detail || error.message));
  }
);
export default client;
```

### Service Modules (corrected)
```js
// api/resumeService.js
import client from './client';

export const resumeService = {
  getProfile: (profileId) => client.get(`/profile/${profileId}`).then((r) => r.data),
  updateProfile: (profileId, data) => client.put(`/profile/${profileId}`, data).then((r) => r.data),
  uploadResume: (formData) => client.post('/profile/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  resetProfile: (profileId) => client.post(`/profile/${profileId}/reset`),
  exportResume: (profileId, format) => client.get(`/resume/export/${profileId}?format=${format}`, {
    responseType: 'blob',
  }),
};
```

```js
// api/privacyService.js — NEW
import client from './client';

export const privacyService = {
  getConsentRecord: (profileId) => client.get(`/profile/${profileId}/consent`).then((r) => r.data),
  eraseProfile: (profileId) => client.delete(`/profile/${profileId}`),
};
```

```js
// api/notificationService.js — NEW
import client from './client';

export const notificationService = {
  getNotifications: (profileId) => client.get(`/notifications/${profileId}`).then((r) => r.data),
  getPreferences: (profileId) => client.get(`/notifications/${profileId}/preferences`).then((r) => r.data),
  updatePreferences: (profileId, prefs) => client.put(`/notifications/${profileId}/preferences`, prefs),
};
```

Remove `interviewService.js` entirely.

---

## 7. Reusable UI Components

Unchanged — `Button.jsx`, `ProgressRing.jsx` carry over as originally
specified:

```jsx
// Button.jsx
import { Loader2 } from 'lucide-react';
const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  destructiveConfirm: 'btn-destructive-confirm',
};
export function Button({ variant = 'primary', size = 'md', loading, icon, children, ...props }) {
  return (
    <button className={`btn ${variants[variant]} btn-${size}`} disabled={loading} {...props}>
      {loading ? <Loader2 className="animate-spin" size={16} /> : icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
```

```jsx
// ProgressRing.jsx
export function ProgressRing({ value, size = 120, strokeWidth = 8, color = 'var(--accent-indigo)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size}>
      <circle stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size/2} cy={size/2} />
      <circle stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" fill="transparent" r={radius} cx={size/2} cy={size/2}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="bold" fill="white">
        {value}%
      </text>
    </svg>
  );
}
```

---

## 8. Performance Optimization — unchanged
- Code splitting via `React.lazy()` and `Suspense` for route components.
- Bundle analysis via `rollup-plugin-visualizer`.

```js
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios', '@tanstack/react-query', 'zustand'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
  },
});
```

Removing the entire Interview Prep tab (coding practice UI, mock coach
real-time interaction handling) also directly helps the bundle-size target —
that was one of the heavier feature areas in the original spec.

---

## 9. Mobile PWA — corrected
Separate Vite project in `mobile/`, port 3001. Use `vite-plugin-pwa` for
offline support and installability.

**Bottom Navigation (corrected)**: 5 icons — Home, ATS, Jobs, Pipeline,
Settings. (Not Home/ATS/Jobs/Prep/Pipeline — Prep is removed, Settings is
added so `DataErasureControl` and notification preferences are reachable
on mobile too, not desktop-only.)

Touch optimizations — unchanged:
- Minimum touch target 48x48px.
- Swipeable job cards using `react-swipeable` or custom touch events.
- Bottom sheet modals — use this pattern for `SkillGapActionPlanModal` and
  the data-erasure confirmation on mobile.

---

## 10. Security & Compliance (corrected — was underspecified)
- **DPDP Consent**: explicit checkbox before file upload, timestamp stored
  and later visible to the candidate in `SettingsPrivacy.jsx` (not just
  captured once and never shown again).
- **Zero-hallucination**: no hardcoded fallback data anywhere in the
  frontend; empty states show neutral placeholders or genuinely empty UI,
  never invented sample content styled to look real.
- **Cascade erasure**: `DataErasureControl.jsx` is the real, visible,
  candidate-triggered path — not just a backend capability with no UI, and
  not a "reset" button that only clears form fields without calling the
  actual erasure endpoint.
- **Notification preferences**: candidate-controlled, per skill_5 — not
  hardcoded frequency.
- All external apply links must be HTTPS to official domains, no scraping
  or automation of protected ATS portals from the frontend — the "Open
  Application" action opens the resolved URL in a new tab and fires
  click-tracking (per skill_1), it never auto-fills or auto-submits anything.

---

## 11. Acceptance Criteria for 10/10 (corrected)
```
□ 6 desktop tabs implemented with full functionality (Interview Prep removed).
□ Glassmorphism design applied consistently.
□ Real-time ATS score updates when editing resume.
□ PDF, DOCX, Markdown exports work correctly and surface missing-field warnings before download.
□ Job discovery shows match percentage and keyword overlap.
□ Skill-gap-to-action plan modal is reachable from job cards with missing keywords.
□ MNC hub displays job listings for at least 10 top companies, each linking to a real careers path.
□ Application pipeline Kanban reflects the correct link-out lifecycle (no "Submitted" status).
□ Notification center surfaces skill_5 retention events with zero filler/generic content.
□ Settings & Privacy tab includes a working, visible data-erasure control that clears local AND server state.
□ Notification preferences are candidate-controllable (immediate/daily/weekly/off).
□ Mobile PWA functions on all modern devices with touch gestures; 5-icon nav includes Settings, not Prep.
□ Bundle size < 280KB gzip (desktop) — easier to hit with Interview Prep removed.
□ All API errors handled gracefully, including 429 rate-limit/usage-cap responses shown distinctly.
□ Accessibility: keyboard navigation, ARIA labels, contrast ratios.
□ No fabricated data anywhere; missing fields show placeholders.
□ No Interview Prep, coding practice, or mock-interview UI present anywhere in the primary build.
```

---

## 12. Environment Variables — unchanged
`.env.development`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

`.env.production`:
```
VITE_API_BASE_URL=https://api.nextopportunityfind.com/api
```

---

This is the corrected blueprint — hand this version to your coding
assistant instead of the original. If Interview Prep is ever reopened per
skill_2's stated revisit condition, that's a new, separate blueprint pass
at that time, not something to build speculatively alongside this one.