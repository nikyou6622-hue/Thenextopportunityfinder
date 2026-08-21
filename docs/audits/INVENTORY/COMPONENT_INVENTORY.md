# INVENTORY — COMPLETE COMPONENT CATALOG

| Component Name | File Path | Props Received | State / Hook Dependencies | Role & Implementation Summary | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `App` | `web/src/App.jsx` | None | `useState`, `useEffect` | Root orchestrator, tab switching, global celebration triggers. | **COMPLETE** |
| `Header` | `web/src/components/Header.jsx` | `activeTab`, `setActiveTab`, `onToggleMenu`, `currentUser` | `useState` | Top glass header, mobile menu toggle, brand logo, search bar. | **COMPLETE** |
| `Sidebar` | `web/src/components/Sidebar.jsx` | `activeTab`, `setActiveTab`, `isOpen`, `onClose` | `motion.div` | Desktop & Mobile drawer navigation with official logo & status pill. | **COMPLETE** |
| `HomePage` | `web/src/components/HomePage.jsx` | `onNavigate`, `currentUser`, `onTriggerCelebration` | `useState` | Landing hub, 5-step pipeline, ATS simulator, audience switchers. | **COMPLETE** |
| `OverviewDashboard` | `web/src/components/OverviewDashboard.jsx`| `profile`, `matches`, `applications`, `metrics`, `onNavigate` | `useState`, `useMemo` | Master dashboard telemetry, top matches, CTC salary calculator. | **COMPLETE** |
| `ResumeAnalyzer` | `web/src/components/ResumeAnalyzer.jsx` | `profile`, `matches`, `onUpload`, `onUpdateProfile`, `onTailor` | `useState`, `useMemo` | 11-template ATS resume builder with live A4 preview & export. | **COMPLETE** |
| `ResumeUploader` | `web/src/components/ResumeUploader.jsx` | `onUpload`, `loading` | `useState` | Drag-and-drop file upload dropzone with DPDP consent modal. | **COMPLETE** |
| `DragDropResumeEditor` | `web/src/components/DragDropResumeEditor.jsx` | `sections`, `onReorder` | `useState` | Drag-and-drop section reordering (`summary`, `skills`, `experience`). | **COMPLETE** |
| `JobDiscovery` | `web/src/components/JobDiscovery.jsx` | `matches`, `onTailor`, `onImportFile`, `onDiscover`, `onSelectJob` | `useState` | Live verified job feed, domain filtering, direct apply badges. | **COMPLETE** |
| `IndiaInternshipHub` | `web/src/components/IndiaInternshipHub.jsx` | `profile`, `onTailor`, `onNavigate` | `useState`, `useEffect` | Indian internship search, stipend filter, PPO conversion monitor. | **COMPLETE** |
| `MncOpportunityHub` | `web/src/components/MncOpportunityHub.jsx` | `onTailor`, `loading` | `useState`, `useEffect` | Big-MNC career portal scanner (Google, Microsoft, TCS, Infosys). | **COMPLETE** |
| `TailoringHub` | `web/src/components/TailoringHub.jsx` | `applications`, `onUpdateAppStatus`, `onLaunchInterviewPrep` | `useState` | 1-click tailored resume studio with before/after score diffs. | **COMPLETE** |
| `ApplicationPipeline` | `web/src/components/ApplicationPipeline.jsx` | `applications`, `onUpdateAppStatus`, `onLaunchInterviewPrep` | `useState` | 5-stage Kanban board with click-through tracking. | **COMPLETE** |
| `InterviewPrepStudio` | `web/src/components/InterviewPrepStudio.jsx` | `applications`, `profile`, `selectedAppId`, `onTriggerCelebration` | `useState`, `useEffect`, Audio | AI voice mock interview coach, company brief, 1000+ question bank. | **COMPLETE** |
| `CodingSandboxStudio` | `web/src/components/CodingSandboxStudio.jsx` | `profile`, `initialProblem`, `onTriggerCelebration` | `useState` | Sandboxed Python/JS/SQL runner with 17 LeetCode enterprise tracks. | **COMPLETE** |
| `RecruiterOutreachStudio`| `web/src/components/RecruiterOutreachStudio.jsx`| `profile` | `useState` | Recruiter cold email generator and batch dispatch simulator. | **COMPLETE** |
| `LearningRoadmapStudio` | `web/src/components/LearningRoadmapStudio.jsx`| `profile`, `onTriggerCelebration` | `useState`, `useEffect` | Curated technical roadmaps and tutorial library. | **COMPLETE** |
| `SavedJobsView` | `web/src/components/SavedJobsView.jsx` | `savedJobs`, `onRemoveSavedJob`, `onTailor` | `useState` | Bookmarked opportunities view with offline localStorage sync. | **COMPLETE** |
| `SettingsPrivacy` | `web/src/components/SettingsPrivacy.jsx` | `profile`, `onProfileReset` | `useState` | DPDP privacy compliance, data export, notification preferences. | **COMPLETE** |
| `AuthView` | `web/src/components/AuthView.jsx` | `onAuthSuccess`, `onContinueAsGuest` | `useState`, `useMemo` | Sign in & registration form with DPDP consent confirmation. | **COMPLETE** |
| `UserProfileView` | `web/src/components/UserProfileView.jsx` | `profile`, `applications`, `savedJobs`, `onNavigate` | `useState` | Candidate overview, submitted applications counter, reset profile. | **COMPLETE** |
| `JobDetailsModal` | `web/src/components/JobDetailsModal.jsx` | `job`, `isOpen`, `onClose`, `onApply`, `onTailor` | `useState` | Full-screen modal with job description, requirements, and direct link. | **COMPLETE** |
| `ApplicationFlowModal` | `web/src/components/ApplicationFlowModal.jsx` | `job`, `match`, `profile`, `isOpen`, `onClose`, `onSubmitSuccess` | `useState` | 3-step application wizard (Contact, Experience, Resume Preview). | **COMPLETE** |
| `SearchFiltersModal` | `web/src/components/SearchFiltersModal.jsx` | `isOpen`, `onClose`, `filters`, `onApplyFilters` | `useState` | Advanced job filter modal (Salary, Remote, Experience, Domain). | **COMPLETE** |
| `CompanyProfileModal` | `web/src/components/CompanyProfileModal.jsx` | `company`, `isOpen`, `onClose` | `useState` | Company deep dive modal (Culture, Interview process, Salary range). | **COMPLETE** |
| `DataErasureControl` | `web/src/components/DataErasureControl.jsx` | `isOpen`, `onClose`, `onConfirmDelete` | `useState` | Red confirmation modal for DPDP hard cascade account purge. | **COMPLETE** |
| `NotificationPreferences`| `web/src/components/NotificationPreferences.jsx`| None (embedded in Settings) | `useState`, `useEffect` | Daily/weekly email digest and in-app alert preference manager. | **COMPLETE** |
| `NotificationCenter` | `web/src/components/NotificationCenter.jsx` | `isOpen`, `onClose`, `notifications` | `useState` | Dropdown notification bell drawer with unread badges. | **COMPLETE** |
| `OutcomeDiagnosisCard` | `web/src/components/OutcomeDiagnosisCard.jsx` | `diagnoses`, `onRefresh` | None | AI diagnosis card displaying application bottleneck recommendations. | **COMPLETE** |
| `SkillGapActionPlanModal`| `web/src/components/SkillGapActionPlanModal.jsx`| `isOpen`, `onClose`, `gapSkills` | `useState`, `useEffect` | 2-week actionable skill-closing roadmap modal. | **COMPLETE** |
| `ShaderBackground` | `web/src/components/ShaderBackground.jsx` | `color` | Canvas `useRef` | High-performance WebGL/Canvas animated gradient background. | **COMPLETE** |
| `SoundEffects` | `web/src/components/characters/SoundEffects.js` | Singleton | Web Audio API | Web Audio API sound synthesis (Clicks, Pops, Chimes, Fanfares). | **COMPLETE** |
| `ConfettiEffect` | `web/src/components/characters/ConfettiEffect.jsx`| `active`, `onComplete` | `useEffect` | Celebration particle cannon on high ATS scores and job applications. | **COMPLETE** |
| `GamificationBar` | `web/src/components/characters/GamificationBar.jsx`| None | None | Tactile Audio FX toggle button. | **COMPLETE** |
| `MobileBottomNav` | `web/src/components/MobileBottomNav.jsx` | `activeTab`, `setActiveTab`, `onOpenMenu` | None | Fixed bottom navigation bar for mobile viewports $< 768\text{ px}$. | **COMPLETE** |
| `ErrorBoundary` | `web/src/components/ErrorBoundary.jsx` | `children` | Class Lifecycle | React class Error Boundary capturing runtime exceptions. | **COMPLETE** |
