# 08 — COMPLETE REST API SPECIFICATION & DOCUMENTATION
**Total Endpoints**: 48 Active Routes  
**Server Base URL**: `http://127.0.0.1:8000` (Dev) / `http://0.0.0.0:8000` (Prod)  
**Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`  
**OpenAPI JSON**: `http://127.0.0.1:8000/openapi.json`

---

## 1. System Health & Diagnostics Endpoints

| Method | Endpoint | Purpose | Auth | Request Body | Response Format | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/healthz` | Kubernetes Liveness Probe | None | None | `{"status": "ok"}` | **COMPLETE** |
| `GET` | `/readyz` | Kubernetes Readiness Probe | None | None | `{"status": "ready", "database": "connected"}` | **COMPLETE** |
| `GET` | `/health` | Application Health & Telemetry | None | None | `{"status": "healthy", "version": "2.14.0"}` | **COMPLETE** |
| `GET` | `/api/health` | API Subsystem Health | None | None | `{"status": "healthy", "agents_active": 8}` | **COMPLETE** |
| `GET` | `/api/telemetry/cost` | LLM Token & Cost Summary | None | None | `{"total_tokens": 1420, "estimated_usd": 0.0028}` | **COMPLETE** |
| `GET` | `/api/compliance/registry`| Data Source Terms & Compliance | None | None | `{"sources": [...], "dpdp_compliant": true}` | **COMPLETE** |

---

## 2. Authentication & User Profile Endpoints

| Method | Endpoint | Purpose | Auth | Request Body | Response Schema | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Candidate registration | None | `SignUpRequest` | `AuthResponse` | **COMPLETE** |
| `POST` | `/api/auth/login` | Candidate login | None | `LoginRequest` | `AuthResponse` | **COMPLETE** |
| `GET` | `/api/auth/me` | Current authenticated user | Bearer / API Key | None | `UserModel` JSON | **COMPLETE** |
| `POST` | `/api/auth/logout` | Invalidate session | None | None | `{"message": "Logged out"}` | **COMPLETE** |
| `POST` | `/api/profile/upload` | Upload & parse resume | Bearer / API Key | `multipart/form-data` | `ProfileSchema` | **COMPLETE** |
| `GET` | `/api/profile` | Get active candidate profile | None | None | `Optional[ProfileSchema]` | **COMPLETE** |
| `POST` | `/api/profile` | Create / update candidate profile | None | `ProfileSchema` JSON | `ProfileSchema` | **COMPLETE** |
| `POST` | `/api/profile/reset` | DPDP Hard Delete / Cascade Purge | None | None | `{"message": "Profile reset"}` | **COMPLETE** |
| `DELETE`| `/api/profile/{id}` | Hard delete profile by ID | None | None | `{"message": "Deleted"}` | **COMPLETE** |
| `GET` | `/api/profile/{id}/consent`| Verify candidate DPDP consent | None | None | `{"consent_given": true}` | **COMPLETE** |
| `POST` | `/api/profile/reorder` | Reorder resume sections | None | `ReorderRequest` | `{"section_order": [...]}` | **COMPLETE** |
| `POST` | `/api/profile/ats-score` | Re-evaluate ATS score on demand | None | `ProfileSchema` | `{"ats_score": 88, ...}` | **COMPLETE** |

---

## 3. Opportunity Discovery & Scraper Endpoints

| Method | Endpoint | Purpose | Query / Path Params | Response Format | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/jobs/discover` | Trigger opportunity discovery | None | `{"discovered": 45, "matched": 38}` | **COMPLETE** |
| `GET` | `/api/jobs` | List active job catalog | `limit: int = 50` | `List[JobSchema]` | **COMPLETE** |
| `GET` | `/api/matches` | List computed candidate matches | None | `List[MatchSchema]` | **COMPLETE** |
| `POST` | `/api/jobs/import-file` | Import jobs via CSV / JSON | UploadFile `file` | `{"imported": 12, ...}` | **COMPLETE** |
| `POST` | `/api/jobs/purge-dead` | Clean stale or dead listings | None | `{"purged_count": 4}` | **COMPLETE** |
| `POST` | `/api/jobs/revalidate-links`| Revalidate live ATS links | `max_age_hours: int = 24` | `LinkRevalidationResponse` | **COMPLETE** |
| `GET` | `/api/jobs/link-health` | Link health summary report | None | `LinkHealthSummary` | **COMPLETE** |
| `GET` | `/api/jobs/global` | Global tech feed (FreeHire/LinkedIn)| `query: str, location: str` | `{"jobs": [...], "count": 20}` | **COMPLETE** |
| `GET` | `/api/jobs/mnc` | List Big-MNC matched listings | `company: Optional[str]` | `List[MatchSchema]` | **COMPLETE** |
| `POST` | `/api/jobs/mnc/scan` | Trigger live MNC career scan | None | `{"summary": {...}}` | **COMPLETE** |
| `GET` | `/api/jobs/mnc/scan-status` | Get last MNC scan status | None | `MNCScanStatusResponse` | **COMPLETE** |
| `GET` | `/api/internships/india` | List verified India internships | `location, domain, min_stipend, ppo_only` | `List[InternshipSchema]` | **COMPLETE** |
| `POST` | `/api/internships/india/scan`| Trigger live India internship scan | None | `{"summary": {...}}` | **COMPLETE** |
| `GET` | `/api/internships/market-stats`| Internship market intelligence | None | `{"avg_stipend": 28500, ...}`| **COMPLETE** |
| `GET` | `/api/salary/benchmark` | Salary benchmark lookup by role | `company: str, role: str, location: str` | `{"median_inr": "18.5 LPA", ...}`| **COMPLETE** |

---

## 4. Tailoring, Export & Document Generation Endpoints

| Method | Endpoint | Purpose | Request / Query | Response Media Type | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/applications/tailor/{match_id}` | 1-Click Zero-Hallucination Tailor | Path `match_id` | `ApplicationSchema` JSON | **COMPLETE** |
| `POST` | `/api/resume/tailor/{match_id}` | Alias for resume tailoring | Path `match_id` | `ApplicationSchema` JSON | **COMPLETE** |
| `GET` | `/api/resume/export/{profile_id}` | Export resume (PDF/DOCX/TeX/MD) | `format: str, template: str` | `application/pdf`, `.docx`, `.tex`, `.md` | **COMPLETE** |
| `GET` | `/api/resume/quality-analysis` | Detailed content suggestions | None | `{"quality_score": 85, "suggestions": [...]}` | **COMPLETE** |
| `GET` | `/api/cover-letter/export/{app_id}` | Export tailored cover letter | `format: str = "tex"` | `text/x-tex`, `text/markdown` | **COMPLETE** |
| `GET` | `/api/resume-templates` | List available resume templates | `category: str = "mnc_pattern"` | `List[ResumeTemplateSchema]` | **COMPLETE** |

---

## 5. Application Pipeline & Outcome Analytics Endpoints

| Method | Endpoint | Purpose | Request Body | Response Schema | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/applications` | List Kanban applications | None | `List[ApplicationSchema]` | **COMPLETE** |
| `POST` | `/api/applications/{id}/track-click`| Log click & resolve direct URL | None | `{"apply_url_resolved": "...", "status": "link_opened"}` | **COMPLETE** |
| `PUT` | `/api/applications/{id}` | Update application status / notes | `ApplicationUpdateRequest` | `{"new_status": "interview_scheduled"}` | **COMPLETE** |
| `GET` | `/api/diagnosis/{profile_id}` | Get candidate bottleneck diagnosis | None | `List[OutcomeDiagnosisSchema]` | **COMPLETE** |
| `POST` | `/api/diagnosis/{profile_id}/analyze`| Trigger outcome analysis | None | `{"diagnoses": [...]}` | **COMPLETE** |
| `GET` | `/api/metrics/outcomes` | Funnel metrics & conversion rates | None | `OutcomeMetricsSchema` | **COMPLETE** |
| `GET` | `/api/dashboard/metrics` | Dashboard top-level statistics | None | `DashboardMetrics` | **COMPLETE** |
| `POST` | `/api/seed` | Seed demo data with compliance | None | `{"message": "Demo data seeded"}` | **COMPLETE** |

---

## 6. AI Mock Interview & Study Studio Endpoints

| Method | Endpoint | Purpose | Request Body | Response Schema | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/interview-prep/{app_id}` | Generate interview prep pack | None | `InterviewPrepSchema` | **COMPLETE** |
| `GET` | `/api/interview-prep/{app_id}` | Get interview prep session | None | `InterviewPrepSchema` | **COMPLETE** |
| `POST` | `/api/interview-prep/{app_id}/mock-session`| Evaluate candidate answer | `MockSessionRequest` | `MockSessionResponse` | **COMPLETE** |
| `POST` | `/api/interview-prep/study-materials`| Generate study recommendations | `StudyMaterialRequest` | `StudyMaterialResponse` | **COMPLETE** |
| `GET` | `/api/learning-resources` | List curated learning roadmaps | `field, level` | `List[LearningResourceSchema]` | **COMPLETE** |
| `GET` | `/api/interview-questions` | Question bank search | `field, type` | `List[InterviewQuestionBankSchema]` | **COMPLETE** |
| `GET` | `/api/coding-questions` | DSA & SQL challenges | `field, difficulty` | `List[CodingQuestionSchema]` | **COMPLETE** |
| `POST` | `/api/coding-questions/{id}/attempt`| Submit coding attempt | `CodingAttemptRequest` | `CodingAttemptResponse` | **COMPLETE** |
| `GET` | `/api/skills/action-plan` | 2-Week skill-closing plan | `skills: str, match_id: int` | `{"action_plan": [...], ...}` | **COMPLETE** |

---

## 7. Recruiter Outreach & Notification Endpoints

| Method | Endpoint | Purpose | Request Body | Response Format | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/emails/batch/prepare` | Prepare recruiter outreach | JSON payload | `{"batch_id": "...", "emails": [...]}` | **COMPLETE** |
| `POST` | `/api/emails/batch/send/{batch_id}`| Dispatch recruiter batch | None | `{"sent_count": 5, "status": "simulated"}` | **COMPLETE** |
| `GET` | `/api/notifications` | Get in-app notifications | None | `List[NotificationEventSchema]` | **COMPLETE** |
| `POST` | `/api/notifications/{id}/read` | Mark notification read | None | `{"status": "read"}` | **COMPLETE** |
| `POST` | `/api/notifications/mark-all-read`| Mark all notifications read | None | `{"status": "all_read"}` | **COMPLETE** |
| `GET` | `/api/notifications/preferences` | Get notification preferences | None | `NotificationPreferenceModel` | **COMPLETE** |
| `PUT` | `/api/notifications/preferences` | Update digest preferences | JSON | `{"message": "Preferences updated"}` | **COMPLETE** |
| `POST` | `/api/notifications/digest/preview`| Generate email digest preview | None | `{"subject": "...", "body_markdown": "..."}` | **COMPLETE** |
| `POST` | `/api/admin/purge-retention` | Retention purge execution | None | `{"purged_logs": 24}` | **COMPLETE** |
