# 06 — FRONTEND ARCHITECTURE & COMPONENT AUDIT
**Framework**: React 18.2.0 + Vite 4.5.14  
**Directory**: `f:/Thnextoppr/web`  
**Styling Paradigm**: Vanilla CSS Design System (`web/src/index.css`) with Inline HSL & Glassmorphic Tokens, Lucide-React Icons, Framer Motion Micro-Animations.

---

## 1. Directory Structure & Key Modules

```text
web/
├── index.html                    # Single Page Application HTML entry & SEO meta
├── package.json                  # Dependencies: react, framer-motion, lucide-react, canvas-confetti
├── vite.config.js                # Vite build config with port 3001 and /api proxy to :8000
└── src/
    ├── main.jsx                  # React DOM root render
    ├── App.jsx                   # Master state container, navigation orchestrator
    ├── index.css                 # 1,100-line global stylesheet, glassmorphism, tactile buttons
    ├── components/               # 36 specialized UI components
    │   ├── characters/           # Nova AI mascot, speech bubble, sound FX, confetti
    │   └── ui/                   # Primitive dropdowns, sparkles, animated background
    └── utils/                    # Data models, LeetCode index, template definitions
```

---

## 2. Complete Component Catalog & Audit

| Component Name | File Path | Lines | Props Accepted | Purpose & Role | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `App.jsx` | `web/src/App.jsx` | 560 | None (Root) | Master state manager, tab router, API loader, celebration triggers. | **COMPLETE** |
| `Header.jsx` | `web/src/components/Header.jsx` | 440 | `activeTab`, `setActiveTab`, `onToggleMenu`, `currentUser` | Top glass header, mobile menu toggle, brand logo, search bar. | **COMPLETE** |
| `Sidebar.jsx` | `web/src/components/Sidebar.jsx` | 507 | `activeTab`, `setActiveTab`, `isOpen`, `onClose` | Desktop & Mobile drawer navigation with official logo & status pill. | **COMPLETE** |
| `HomePage.jsx` | `web/src/components/HomePage.jsx` | 754 | `onNavigate`, `currentUser`, `onTriggerCelebration` | Landing hub, 5-step pipeline, ATS simulator, audience switchers. | **COMPLETE** |
| `OverviewDashboard.jsx` | `web/src/components/OverviewDashboard.jsx`| 1,920 | `profile`, `matches`, `applications`, `metrics`, `onNavigate` | Master dashboard telemetry, top matches, CTC salary calculator. | **COMPLETE** |
| `ResumeAnalyzer.jsx` | `web/src/components/ResumeAnalyzer.jsx` | 2,100 | `profile`, `matches`, `onUpload`, `onUpdateProfile`, `onTailor` | 11-template ATS resume builder with live A4 preview & export. | **COMPLETE** |
| `ResumeUploader.jsx` | `web/src/components/ResumeUploader.jsx` | 320 | `onUpload`, `loading` | Drag-and-drop file upload dropzone with DPDP consent modal. | **COMPLETE** |
| `DragDropResumeEditor.jsx` | `web/src/components/DragDropResumeEditor.jsx` | 240 | `sections`, `onReorder` | Drag-and-drop section reordering (`summary`, `skills`, `experience`). | **COMPLETE** |
| `JobDiscovery.jsx` | `web/src/components/JobDiscovery.jsx` | 881 | `matches`, `onTailor`, `onImportFile`, `onDiscover`, `onSelectJob` | Live verified job feed, domain filtering, direct apply badges. | **COMPLETE** |
| `IndiaInternshipHub.jsx` | `web/src/components/IndiaInternshipHub.jsx` | 850 | `profile`, `onTailor`, `onNavigate` | Indian internship search, stipend filter, PPO conversion monitor. | **COMPLETE** |
| `MncOpportunityHub.jsx` | `web/src/components/MncOpportunityHub.jsx` | 560 | `onTailor`, `loading` | Big-MNC career portal scanner (Google, Microsoft, TCS, Infosys). | **COMPLETE** |
| `TailoringHub.jsx` | `web/src/components/TailoringHub.jsx` | 280 | `applications`, `onUpdateAppStatus`, `onLaunchInterviewPrep` | 1-click tailored resume studio with before/after score diffs. | **COMPLETE** |
| `ApplicationPipeline.jsx` | `web/src/components/ApplicationPipeline.jsx` | 420 | `applications`, `onUpdateAppStatus`, `onLaunchInterviewPrep` | 5-stage Kanban board with click-through tracking. | **COMPLETE** |
| `InterviewPrepStudio.jsx` | `web/src/components/InterviewPrepStudio.jsx` | 2,431 | `applications`, `profile`, `selectedAppId`, `onTriggerCelebration` | AI voice mock interview coach, company brief, 1000+ question bank. | **COMPLETE** |
| `CodingSandboxStudio.jsx` | `web/src/components/CodingSandboxStudio.jsx` | 1,208 | `profile`, `initialProblem`, `onTriggerCelebration` | Sandboxed Python/JS/SQL runner with 17 LeetCode enterprise tracks. | **COMPLETE** |
| `RecruiterOutreachStudio.jsx`| `web/src/components/RecruiterOutreachStudio.jsx`| 440 | `profile` | Recruiter cold email generator and batch dispatch simulator. | **COMPLETE** |
| `LearningRoadmapStudio.jsx` | `web/src/components/LearningRoadmapStudio.jsx`| 340 | `profile`, `onTriggerCelebration` | Curated technical roadmaps and tutorial library. | **COMPLETE** |
| `SavedJobsView.jsx` | `web/src/components/SavedJobsView.jsx` | 310 | `savedJobs`, `onRemoveSavedJob`, `onTailor` | Bookmarked opportunities view with offline localStorage sync. | **COMPLETE** |
| `SettingsPrivacy.jsx` | `web/src/components/SettingsPrivacy.jsx` | 160 | `profile`, `onProfileReset` | DPDP privacy compliance, data export, notification preferences. | **COMPLETE** |
| `AuthView.jsx` | `web/src/components/AuthView.jsx` | 730 | `onAuthSuccess`, `onContinueAsGuest` | Sign in & registration form with DPDP consent confirmation. | **COMPLETE** |
| `UserProfileView.jsx` | `web/src/components/UserProfileView.jsx` | 240 | `profile`, `applications`, `savedJobs`, `onNavigate` | Candidate overview, submitted applications counter, reset profile. | **COMPLETE** |
| `JobDetailsModal.jsx` | `web/src/components/JobDetailsModal.jsx` | 390 | `job`, `isOpen`, `onClose`, `onApply`, `onTailor` | Full-screen modal with job description, requirements, and direct link. | **COMPLETE** |
| `ApplicationFlowModal.jsx` | `web/src/components/ApplicationFlowModal.jsx` | 520 | `job`, `match`, `profile`, `isOpen`, `onClose`, `onSubmitSuccess` | 3-step application wizard (Contact, Experience, Resume Preview). | **COMPLETE** |
| `SearchFiltersModal.jsx` | `web/src/components/SearchFiltersModal.jsx` | 260 | `isOpen`, `onClose`, `filters`, `onApplyFilters` | Advanced job filter modal (Salary, Remote, Experience, Domain). | **COMPLETE** |
| `CompanyProfileModal.jsx` | `web/src/components/CompanyProfileModal.jsx` | 280 | `company`, `isOpen`, `onClose` | Company deep dive modal (Culture, Interview process, Salary range). | **COMPLETE** |
| `DataErasureControl.jsx` | `web/src/components/DataErasureControl.jsx` | 210 | `isOpen`, `onClose`, `onConfirmDelete` | Red confirmation modal for DPDP hard cascade account purge. | **COMPLETE** |
| `NotificationPreferences.jsx`| `web/src/components/NotificationPreferences.jsx`| 180 | None (embedded in Settings) | Daily/weekly email digest and in-app alert preference manager. | **COMPLETE** |
| `NotificationCenter.jsx` | `web/src/components/NotificationCenter.jsx` | 150 | `isOpen`, `onClose`, `notifications` | Dropdown notification bell drawer with unread badges. | **COMPLETE** |
| `OutcomeDiagnosisCard.jsx` | `web/src/components/OutcomeDiagnosisCard.jsx` | 190 | `diagnoses`, `onRefresh` | AI diagnosis card displaying application bottleneck recommendations. | **COMPLETE** |
| `SkillGapActionPlanModal.jsx`| `web/src/components/SkillGapActionPlanModal.jsx`| 130 | `isOpen`, `onClose`, `gapSkills` | 2-week actionable skill-closing roadmap modal. | **COMPLETE** |
| `ShaderBackground.jsx` | `web/src/components/ShaderBackground.jsx` | 310 | `color` | High-performance WebGL/Canvas animated gradient background. | **COMPLETE** |
| `SoundEffects.js` | `web/src/components/characters/SoundEffects.js` | 140 | Audio Context Singleton | Web Audio API sound synthesis (Clicks, Pops, Chimes, Fanfares). | **COMPLETE** |
| `ConfettiEffect.jsx` | `web/src/components/characters/ConfettiEffect.jsx`| 80 | `active`, `onComplete` | Celebration particle cannon on high ATS scores and job applications. | **COMPLETE** |
| `GamificationBar.jsx` | `web/src/components/characters/GamificationBar.jsx`| 50 | None | Tactile Audio FX toggle button. | **COMPLETE** |
| `MobileBottomNav.jsx` | `web/src/components/MobileBottomNav.jsx` | 80 | `activeTab`, `setActiveTab`, `onOpenMenu` | Fixed bottom navigation bar for mobile viewports $< 768\text{ px}$. | **COMPLETE** |
| `ErrorBoundary.jsx` | `web/src/components/ErrorBoundary.jsx` | 110 | `children` | React class Error Boundary capturing runtime exceptions. | **COMPLETE** |

---

## 3. Design System & CSS Utility Tokens

* **Glassmorphism Base**:
  ```css
  .glass-panel {
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
  }
  ```
* **Tactile Interactive Buttons**:
  * `.btn-tactile-primary`: Indigo gradient with active depression (`transform: translateY(2px)`).
  * `.btn-tactile-emerald`: Success emerald with glowing drop-shadow.
  * `.btn-tactile-ghost`: Semi-transparent bordered button with smooth hover glow.
* **Typography Palette**:
  * Headings: `Outfit`, `Plus Jakarta Sans` (Font weight 700 to 900).
  * Code & Metrics: `JetBrains Mono`.
  * Body Text: `Inter`, system fallback.

---

## 4. Frontend Performance & Bundle Findings

* **Current Production Build Output (`dist/`)**:
  * `index.html`: $4.34\text{ kB}$
  * `index-d0abb0bf.css`: $32.51\text{ kB}$ (gzip: $6.89\text{ kB}$)
  * `vendor-react`: $141.01\text{ kB}$ (gzip: $45.32\text{ kB}$)
  * `vendor-ui`: $151.31\text{ kB}$ (gzip: $50.52\text{ kB}$)
  * `vendor-charts`: $384.94\text{ kB}$ (gzip: $105.60\text{ kB}$)
  * `index.js`: $4,492.79\text{ kB}$ (gzip: $493.36\text{ kB}$) — *Contains 4.8MB static LeetCode problem index.*
* **Optimization Recommendation**: Wrap heavy sub-studios (`InterviewPrepStudio`, `CodingSandboxStudio`, `ResumeAnalyzer`) in `React.lazy()` with `Suspense` and fallback to `BrandedLoadingState.jsx`.
