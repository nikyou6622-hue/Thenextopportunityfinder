# INVENTORY — COMPLETE WEB PAGE & VIEW SPECIFICATION

| # | View Name | Route / State | File Location | User Persona | Auth Required | Primary API Calls | Current Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | Landing & Hero Hub | `'home'` | `web/src/components/HomePage.jsx` | Public / Guest | No | `/api/profile`, `/api/dashboard/metrics` | **COMPLETE** |
| **02** | Master Overview Dashboard | `'overview'` | `web/src/components/OverviewDashboard.jsx` | All Users | Optional | `/api/dashboard/metrics`, `/api/matches` | **COMPLETE** |
| **03** | ATS Live Resume Studio | `'profile'` | `web/src/components/ResumeAnalyzer.jsx` | All Users | Optional | `/api/profile`, `/api/profile/upload`, `/api/resume/export/{id}` | **COMPLETE** |
| **04** | Live Job Discovery Feed | `'jobs'` | `web/src/components/JobDiscovery.jsx` | All Users | Optional | `/api/matches`, `/api/jobs/discover`, `/api/jobs/global` | **COMPLETE** |
| **05** | India Internships Hub | `'internships'` | `web/src/components/IndiaInternshipHub.jsx` | Students / Interns | Optional | `/api/internships/india`, `/api/internships/market-stats` | **COMPLETE** |
| **06** | Big-MNC Career Portal Hub | `'mnc'` | `web/src/components/MncOpportunityHub.jsx` | All Users | Optional | `/api/jobs/mnc`, `/api/jobs/mnc/scan` | **COMPLETE** |
| **07** | 1-Click Tailoring Studio | `'tailor'` | `web/src/components/TailoringHub.jsx` | All Users | Optional | `/api/applications/tailor/{match_id}` | **COMPLETE** |
| **08** | Application Lifecycle Kanban | `'pipeline'` | `web/src/components/ApplicationPipeline.jsx` | All Users | Optional | `/api/applications`, `/api/applications/{id}` | **COMPLETE** |
| **09** | AI Voice Mock Interview Coach | `'interview-prep'` | `web/src/components/InterviewPrepStudio.jsx` | All Users | Optional | `/api/interview-prep/{id}`, `/api/interview-prep/{id}/mock-session` | **COMPLETE** |
| **10** | In-Browser DSA Code Sandbox | `'coding'` | `web/src/components/CodingSandboxStudio.jsx` | Engineers / Students | Optional | `/api/coding-questions`, `/api/coding-questions/{id}/attempt` | **COMPLETE** |
| **11** | Recruiter Cold Email Studio | `'outreach'` | `web/src/components/RecruiterOutreachStudio.jsx` | All Users | Optional | `/api/emails/batch/prepare`, `/api/emails/batch/send/{id}` | **COMPLETE** |
| **12** | Career Roadmaps & Study Hub | `'roadmaps'` | `web/src/components/LearningRoadmapStudio.jsx` | Students / Juniors | Optional | `/api/learning-resources`, `/api/interview-questions` | **COMPLETE** |
| **13** | Saved Opportunities View | `'saved'` | `web/src/components/SavedJobsView.jsx` | All Users | Optional | `localStorage` + `/api/matches` | **COMPLETE** |
| **14** | Settings & Privacy Hub | `'settings'` | `web/src/components/SettingsPrivacy.jsx` | All Users | Optional | `/api/profile/reset`, `/api/notifications/preferences` | **COMPLETE** |
| **15** | Candidate Auth View | `'auth'` | `web/src/components/AuthView.jsx` | Candidates | No | `/api/auth/signup`, `/api/auth/login` | **COMPLETE** |
| **16** | User Profile Management View | `'user-profile'` | `web/src/components/UserProfileView.jsx` | Authenticated | Optional | `/api/profile`, `/api/auth/me` | **COMPLETE** |
