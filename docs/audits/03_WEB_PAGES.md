# 03 — COMPLETE WEB PAGE INVENTORY & AUDIT
**Total Views / Pages Audited**: 14 distinct functional views + 5 core application modals  
**Routing Architecture**: State-Driven Dynamic View Switcher with Persistent URL Query Sync (`App.jsx` + `Header.jsx` + `Sidebar.jsx`)

---

## 1. Master Page Inventory Table

| # | Page / View Name | Tab Identifier | Component File | User Type | Auth Required | API Endpoints Called | Current Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | Landing & Hero Hub | `'home'` | `HomePage.jsx` | Public / Guest | No | `/api/profile`, `/api/dashboard/metrics` | **COMPLETE** |
| **02** | Master Overview Dashboard | `'overview'` | `OverviewDashboard.jsx` | All Users | Optional | `/api/dashboard/metrics`, `/api/matches`, `/api/applications` | **COMPLETE** |
| **03** | ATS Live Resume Studio | `'profile'` | `ResumeAnalyzer.jsx` | All Users | Optional | `/api/profile`, `/api/profile/upload`, `/api/profile/reorder`, `/api/resume/export/{id}` | **COMPLETE** |
| **04** | Live Job Discovery Feed | `'jobs'` | `JobDiscovery.jsx` | All Users | Optional | `/api/matches`, `/api/jobs/discover`, `/api/jobs/global` | **COMPLETE** |
| **05** | India & Campus Internship Hub | `'internships'` | `IndiaInternshipHub.jsx` | Students / Interns | Optional | `/api/internships/india`, `/api/internships/india/scan`, `/api/internships/market-stats` | **COMPLETE** |
| **06** | Big-MNC Career Portal Hub | `'mnc'` | `MncOpportunityHub.jsx` | All Users | Optional | `/api/jobs/mnc`, `/api/jobs/mnc/scan`, `/api/jobs/mnc/scan-status` | **COMPLETE** |
| **07** | 1-Click Tailoring Studio | `'tailor'` | `TailoringHub.jsx` | All Users | Optional | `/api/applications/tailor/{match_id}`, `/api/applications` | **COMPLETE** |
| **08** | Application Lifecycle Kanban | `'pipeline'` | `ApplicationPipeline.jsx` | All Users | Optional | `/api/applications`, `/api/applications/{id}`, `/api/applications/{id}/track-click` | **COMPLETE** |
| **09** | AI Voice Mock Interview Coach | `'interview-prep'` | `InterviewPrepStudio.jsx` | All Users | Optional | `/api/interview-prep/{id}`, `/api/interview-prep/{id}/mock-session`, `/api/interview-prep/study-materials` | **COMPLETE** |
| **10** | In-Browser DSA & SQL Sandbox | `'coding'` | `CodingSandboxStudio.jsx` | Engineers / Students | Optional | `/api/coding-questions`, `/api/coding-questions/{id}/attempt` | **COMPLETE** |
| **11** | Recruiter Cold Email Studio | `'outreach'` | `RecruiterOutreachStudio.jsx` | All Users | Optional | `/api/emails/batch/prepare`, `/api/emails/batch/send/{id}` | **COMPLETE** |
| **12** | Career Roadmaps & Study Hub | `'roadmaps'` | `LearningRoadmapStudio.jsx` | Students / Juniors | Optional | `/api/learning-resources`, `/api/interview-questions` | **COMPLETE** |
| **13** | Saved Opportunities View | `'saved'` | `SavedJobsView.jsx` | All Users | Optional | `localStorage` + `/api/matches` | **COMPLETE** |
| **14** | Settings & Privacy Hub (DPDP) | `'settings'` | `SettingsPrivacy.jsx` | All Users | Optional | `/api/profile/reset`, `/api/notifications/preferences` | **COMPLETE** |
| **15** | Auth & Account Creation View | `'auth'` | `AuthView.jsx` | Candidates | No | `/api/auth/signup`, `/api/auth/login`, `/api/auth/me` | **COMPLETE** |
| **16** | User Profile Management View | `'user-profile'` | `UserProfileView.jsx` | Authenticated | Optional | `/api/profile`, `/api/auth/me` | **COMPLETE** |

---

## 2. Page-by-Page Detailed Audit

### Page 01: Landing & Hero Hub (`HomePage.jsx`)
* **Route / State**: `activeTab === 'home'`
* **File Location**: `web/src/components/HomePage.jsx` (754 lines)
* **Purpose**: Primary entrance page introducing the 5-step career acceleration pipeline, audience persona filters, interactive ATS benchmark simulator, interactive quest roadmap, and platform FAQ.
* **UI Sections**:
  1. Top DPDP Compliance & Status Announcement Bar with official `Thenextopportunity` logo.
  2. Hero Thesis Banner with Nova Mascot, CTA buttons, and quick navigation.
  3. Interactive ATS Live Benchmark Simulator (dynamically recalculates ATS score as user adjusts skills, metrics, and templates).
  4. 5-Step Pipeline Walkthrough Cards with estimated timelines and key outputs.
  5. Audience Persona Switcher (Students, Entry-Level SDE, Mid-Senior, Career Switcher).
  6. Interactive Quest Roadmap Path.
  7. Accordion FAQ Section.
* **Forms & Validation**: Simulator slider inputs, interactive daily action checklist toggle.
* **Responsiveness**: Fully responsive CSS Grid and Flexbox with mobile-friendly stacking.
* **Status**: **COMPLETE**

---

### Page 02: Master Overview Dashboard (`OverviewDashboard.jsx`)
* **Route / State**: `activeTab === 'overview'`
* **File Location**: `web/src/components/OverviewDashboard.jsx` (1,920 lines)
* **Purpose**: Comprehensive telemetry cockpit displaying real-time application funnel stats, top matched jobs, MNC scanner status, salary benchmark lookup, and Nova AI speech bubble.
* **UI Sections**:
  1. Header Stat Cards (Active Applications, ATS Score, Interview Scheduled, Offer Pipeline).
  2. Nova AI Guidance Speech Bubble with dynamic tips.
  3. Top Matched Jobs Carousel with 1-click apply and save buttons.
  4. CTC & Compensation Intelligence Lookup (Salary benchmark calculator by role/company).
  5. MNC Scan Status Monitor with manual refresh trigger.
  6. Recent Application Activity Feed.
* **Forms & Validation**: Salary benchmark query input (role, company name).
* **Status**: **COMPLETE**

---

### Page 03: ATS Live Resume Studio (`ResumeAnalyzer.jsx`)
* **Route / State**: `activeTab === 'profile'`
* **File Location**: `web/src/components/ResumeAnalyzer.jsx` (2,100 lines)
* **Purpose**: Production-grade ATS resume creation and optimization environment.
* **UI Sections**:
  1. File Upload Dropzone supporting PDF and DOCX.
  2. Real-Time 5-Pillar Score Ring (0–100) with detailed pillar score breakdown.
  3. 11-Template Selector with live preview thumbnails.
  4. Live A4 Interactive Document Preview with custom styling tokens.
  5. Drag-and-drop section reordering (`summary`, `skills`, `experience`, `projects`, `education`).
  6. Export Toolbar: 1-click download as PDF, Word (.docx), LaTeX (.tex), or Markdown (.md).
  7. Content Quality & Missing Fields Action Drawer.
* **Status**: **COMPLETE**

---

### Page 04: Live Job Discovery Feed (`JobDiscovery.jsx`)
* **Route / State**: `activeTab === 'jobs'`
* **File Location**: `web/src/components/JobDiscovery.jsx` (880 lines)
* **Purpose**: Search, filter, and discover verified domestic and global tech jobs.
* **UI Sections**:
  1. Dual Tabs: "My Top Matches" vs "Global Tech Live Feed (FreeHire & LinkedIn)".
  2. Search & Filter Bar (Domain, Min Match Score, Remote Only, Experience Level).
  3. Job Cards with Direct ATS Apply Badges (Greenhouse, Lever, Ashby, Workday).
  4. Link Health Indicator (Live vs Revalidating).
  5. 1-Click Tailor CTA and Save Job Bookmark button.
  6. CSV / JSON Job Import Modal.
* **Status**: **COMPLETE**

---

### Page 05: India & Campus Internship Hub (`IndiaInternshipHub.jsx`)
* **Route / State**: `activeTab === 'internships'`
* **File Location**: `web/src/components/IndiaInternshipHub.jsx` (850 lines)
* **Purpose**: Real-time aggregator for Indian college students and fresh graduates.
* **UI Sections**:
  1. Market Statistics Bar (Average Stipend ₹, PPO Conversion Rate %, Active Postings).
  2. Platform Filter Chips (Unstop, Cuvette, Internshala, Wellfound, GitHub Campus Repo).
  3. Stipend Filter Slider (₹0 to ₹1,50,000/mo) and PPO Only toggle.
  4. Internship Opportunity Cards with verified stipends and application dead-line trackers.
  5. "Live Scan Internships" trigger button.
* **Status**: **COMPLETE**

---

### Page 06: Big-MNC Career Portal Hub (`MncOpportunityHub.jsx`)
* **Route / State**: `activeTab === 'mnc'`
* **File Location**: `web/src/components/MncOpportunityHub.jsx` (560 lines)
* **Purpose**: Direct career portal scraper and requisition monitor for Tier-1 MNCs and Indian IT Giants.
* **UI Sections**:
  1. Company Filter Pills: Google, Microsoft, Amazon, Apple, Meta, TCS, Infosys, Wipro, Accenture.
  2. Tier Categories: "Global Product Big Tech" vs "Indian IT & Consulting Ecosystem".
  3. Live Requisition Grid with direct canonical career URLs.
  4. MNC Scanner Status & Last Run Diagnostics.
* **Status**: **COMPLETE**

---

### Page 07: 1-Click Tailoring Studio (`TailoringHub.jsx`)
* **Route / State**: `activeTab === 'tailor'`
* **File Location**: `web/src/components/TailoringHub.jsx` (280 lines)
* **Purpose**: Tailor candidate resumes for specific job descriptions with zero hallucinations.
* **UI Sections**:
  1. Target Job Selector.
  2. Diff Comparison View: Before ATS Score vs After ATS Score.
  3. Bullet-by-Bullet Rewrite Preview highlighting aligned keywords.
  4. Export Tailored Resume as PDF / LaTeX.
* **Status**: **COMPLETE**

---

### Page 08: Application Lifecycle Kanban (`ApplicationPipeline.jsx`)
* **Route / State**: `activeTab === 'pipeline'`
* **File Location**: `web/src/components/ApplicationPipeline.jsx` (420 lines)
* **Purpose**: Drag-and-drop Kanban board managing applications from discovery to offer.
* **UI Columns**:
  1. Matched / Tailored
  2. Link Opened / Applied
  3. Interview Scheduled (automatically launches interview prep)
  4. Offer Received / Hired
  5. Rejected / Archived (automatically triggers outcome bottleneck diagnosis)
* **Status**: **COMPLETE**

---

### Page 09: AI Voice Mock Interview Coach (`InterviewPrepStudio.jsx`)
* **Route / State**: `activeTab === 'interview-prep'`
* **File Location**: `web/src/components/InterviewPrepStudio.jsx` (2,430 lines)
* **Purpose**: Voice-enabled AI interview coach with company-specific intelligence and automated evaluation.
* **UI Sections**:
  1. Company Briefing Card (Tech stack, funding stage, core challenges).
  2. Audio Recording & Speech Synthesis Console (Microphone Web Audio API).
  3. Multi-Pillar Answer Evaluation (Technical Accuracy, Relevance, Communication, Structure).
  4. Curated Technical & Behavioral Question Bank (1,000+ questions).
  5. 1-Click "Launch in Coding Sandbox" for technical algorithms.
* **Status**: **COMPLETE**

---

### Page 10: In-Browser DSA & SQL Code Sandbox (`CodingSandboxStudio.jsx`)
* **Route / State**: `activeTab === 'coding'`
* **File Location**: `web/src/components/CodingSandboxStudio.jsx` (1,208 lines)
* **Purpose**: Sandboxed coding environment for data structures, algorithms, and SQL.
* **UI Sections**:
  1. Problem Catalog (17 Enterprise LeetCode challenges + Company Index).
  2. Multi-Language Selector (Python, JavaScript, SQL).
  3. Interactive Code Editor with syntax highlighting.
  4. Test Case Execution Engine & Output Console.
  5. 3-Tier Progressive Hint Reveal System.
* **Status**: **COMPLETE**

---

### Page 11: Recruiter Cold Outreach Studio (`RecruiterOutreachStudio.jsx`)
* **Route / State**: `activeTab === 'outreach'`
* **File Location**: `web/src/components/RecruiterOutreachStudio.jsx` (440 lines)
* **Purpose**: Personalized cold email generator and batch dispatch simulator.
* **UI Sections**:
  1. Recruiter Email Generator (Formal, Casual, Referral Request).
  2. SMTP Provider Health Validator.
  3. Batch Dispatch Queue & Delivery Log.
* **Status**: **COMPLETE**

---

### Page 12: Career Roadmaps & Study Hub (`LearningRoadmapStudio.jsx`)
* **Route / State**: `activeTab === 'roadmaps'`
* **File Location**: `web/src/components/LearningRoadmapStudio.jsx` (340 lines)
* **Purpose**: Structured learning roadmaps and curated tutorials.
* **UI Sections**:
  1. Engineering Tracks: Full Stack, Backend (Python/Go), AI/ML, DevOps, QA.
  2. Curated YouTube Playlists & Official Docs.
  3. Difficulty Filter (Entry, Mid, Senior).
* **Status**: **COMPLETE**

---

### Page 13: Saved Opportunities View (`SavedJobsView.jsx`)
* **Route / State**: `activeTab === 'saved'`
* **File Location**: `web/src/components/SavedJobsView.jsx` (310 lines)
* **Purpose**: Bookmarked dream roles with offline localStorage persistence and batch export.
* **Status**: **COMPLETE**

---

### Page 14: Settings & Privacy Hub (`SettingsPrivacy.jsx`)
* **Route / State**: `activeTab === 'settings'`
* **File Location**: `web/src/components/SettingsPrivacy.jsx` (160 lines)
* **Purpose**: DPDP compliance management, data export, notification preferences, and hard data erasure.
* **UI Sections**:
  1. Data Portability: 1-Click JSON Profile Export.
  2. Right to Erasure: Permanent cascade purge modal (`DataErasureControl.jsx`).
  3. Notification Digest Preferences (`NotificationPreferences.jsx`).
  4. Encryption & Security Key Status.
* **Status**: **COMPLETE**

---

### Page 15: Auth & Candidate Account View (`AuthView.jsx`)
* **Route / State**: `activeTab === 'auth'`
* **File Location**: `web/src/components/AuthView.jsx` (730 lines)
* **Purpose**: Secure sign in and account registration with DPDP consent confirmation.
* **UI Sections**:
  1. Brand Logo Header (`Thenextopportunity — Find Your Next Step`).
  2. Sign In vs Sign Up Tabs.
  3. Candidate Profile Initializer (Target Role, Experience Level).
  4. DPDP Consent Checkbox and Privacy Modal.
  5. Guest Mode Bypass CTA.
* **Status**: **COMPLETE**

---

### Page 16: User Profile Management View (`UserProfileView.jsx`)
* **Route / State**: `activeTab === 'user-profile'`
* **File Location**: `web/src/components/UserProfileView.jsx` (240 lines)
* **Purpose**: Overview of candidate credentials, total applications submitted, saved jobs, and account reset.
* **Status**: **COMPLETE**
