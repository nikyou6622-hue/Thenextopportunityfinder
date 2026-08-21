# INVENTORY — COMPLETE API ENDPOINT SPECIFICATION

| # | HTTP Method | Endpoint URL | Handler Function | Auth Required | Request Model | Response Model | Database Models Accessed |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `GET` | `/healthz` | `healthz()` | No | None | `{"status": "ok"}` | None |
| **02** | `GET` | `/readyz` | `readyz()` | No | None | JSON | Database Ping |
| **03** | `GET` | `/health` | `health_check()` | No | None | JSON | None |
| **04** | `GET` | `/api/health` | `api_health()` | No | None | JSON | None |
| **05** | `POST` | `/api/auth/signup` | `auth_signup()` | No | `SignUpRequest` | `AuthResponse` | `UserModel` |
| **06** | `POST` | `/api/auth/login` | `auth_login()` | No | `LoginRequest` | `AuthResponse` | `UserModel` |
| **07** | `GET` | `/api/auth/me` | `auth_me()` | Optional | None | `UserModel` | `UserModel` |
| **08** | `POST` | `/api/auth/logout` | `auth_logout()` | No | None | JSON | None |
| **09** | `POST` | `/api/profile/upload` | `upload_resume_endpoint()` | Bearer / API Key | FormData `file` | `ProfileSchema` | `ProfileModel` |
| **10** | `GET` | `/api/profile` | `get_profile()` | Optional | None | `ProfileSchema` | `ProfileModel` |
| **11** | `POST` | `/api/profile` | `update_profile()` | Optional | `ProfileSchema` | `ProfileSchema` | `ProfileModel` |
| **12** | `POST` | `/api/profile/reset` | `reset_active_profile()` | Optional | None | JSON | Cascade Delete All |
| **13** | `DELETE`| `/api/profile/{id}` | `delete_profile()` | Optional | None | JSON | Cascade Delete All |
| **14** | `GET` | `/api/profile/{id}/consent`| `get_consent_status()` | Optional | None | JSON | `ProfileModel` |
| **15** | `POST` | `/api/profile/reorder` | `reorder_profile_sections()`| Optional | `ReorderRequest` | JSON | `ProfileModel` |
| **16** | `POST` | `/api/profile/ats-score` | `recalculate_ats_score()`| Optional | `ProfileSchema` | JSON | `ProfileModel` |
| **17** | `POST` | `/api/jobs/discover` | `trigger_discovery()` | Optional | None | JSON | `JobModel`, `MatchModel` |
| **18** | `GET` | `/api/jobs` | `list_jobs()` | Optional | None | `List[JobSchema]` | `JobModel` |
| **19** | `GET` | `/api/matches` | `list_matches()` | Optional | None | `List[MatchSchema]`| `MatchModel`, `JobModel` |
| **20** | `POST` | `/api/jobs/import-file` | `import_jobs_file()` | Optional | FormData `file` | JSON | `JobModel`, `MatchModel` |
| **21** | `POST` | `/api/jobs/purge-dead` | `purge_dead_jobs()` | Optional | None | JSON | `JobModel` |
| **22** | `POST` | `/api/jobs/revalidate-links`| `revalidate_links()` | Optional | Query `max_age_hours` | `LinkRevalidationResponse` | `JobModel` |
| **23** | `GET` | `/api/jobs/link-health` | `get_link_health_summary()`| Optional | None | `LinkHealthSummary`| `JobModel` |
| **24** | `GET` | `/api/jobs/global` | `get_global_tech_jobs()` | Optional | Query `query, location` | JSON | In-memory Feed |
| **25** | `GET` | `/api/jobs/mnc` | `get_mnc_jobs()` | Optional | Query `company` | `List[MatchSchema]`| `JobModel`, `MatchModel` |
| **26** | `POST` | `/api/jobs/mnc/scan` | `trigger_mnc_scan()` | Optional | None | JSON | `JobModel`, `MNCScanLogModel` |
| **27** | `GET` | `/api/jobs/mnc/scan-status`| `get_mnc_scan_status()` | Optional | None | `MNCScanStatusResponse` | `MNCScanLogModel` |
| **28** | `GET` | `/api/internships/india` | `list_india_internships()` | Optional | Query filters | `List[InternshipSchema]` | `JobModel` |
| **29** | `POST` | `/api/internships/india/scan`| `trigger_internship_scan()`| Optional | None | JSON | `JobModel` |
| **30** | `GET` | `/api/internships/market-stats`| `get_internship_stats()` | Optional | None | JSON | `JobModel` |
| **31** | `GET` | `/api/salary/benchmark` | `get_salary_benchmark()` | Optional | Query `company, role` | JSON | Benchmark Engine |
| **32** | `POST` | `/api/applications/tailor/{match_id}` | `tailor_application()` | Optional | Path `match_id` | `ApplicationSchema` | `ApplicationModel`, `TailoredResumeModel` |
| **33** | `GET` | `/api/resume/export/{id}`| `export_candidate_resume()`| Bearer / API Key | Query `format, template` | Binary Stream (PDF/Docx) | `ProfileModel` |
| **34** | `GET` | `/api/resume/quality-analysis` | `get_resume_quality()` | Bearer / API Key | None | JSON | `ProfileModel` |
| **35** | `GET` | `/api/cover-letter/export/{id}` | `export_cover_letter()` | Optional | Query `format` | Stream (TeX/MD) | `ApplicationModel` |
| **36** | `GET` | `/api/resume-templates` | `list_resume_templates()` | Optional | Query `category` | `List[ResumeTemplateSchema]` | `ResumeTemplateModel` |
| **37** | `GET` | `/api/applications` | `get_applications()` | Optional | None | `List[ApplicationSchema]` | `ApplicationModel`, `JobModel` |
| **38** | `POST` | `/api/applications/{id}/track-click` | `track_click()` | Optional | Path `id` | JSON | `ApplicationModel`, `ApplicationEventModel` |
| **39** | `PUT` | `/api/applications/{id}`| `update_application()` | Optional | `ApplicationUpdateRequest` | JSON | `ApplicationModel`, `ApplicationEventModel` |
| **40** | `GET` | `/api/diagnosis/{id}` | `get_candidate_diagnoses()`| Optional | Path `id` | `List[OutcomeDiagnosisSchema]` | `OutcomeDiagnosisModel` |
| **41** | `POST` | `/api/diagnosis/{id}/analyze` | `trigger_diagnosis()` | Optional | Path `id` | JSON | `OutcomeDiagnosisModel` |
| **42** | `GET` | `/api/metrics/outcomes` | `get_outcome_metrics()` | Optional | None | `OutcomeMetricsSchema` | `OutcomeEventModel` |
| **43** | `GET` | `/api/dashboard/metrics`| `get_dashboard()` | Optional | None | `DashboardMetrics` | Aggregated Analytics |
| **44** | `POST` | `/api/interview-prep/{id}` | `generate_interview_prep()`| Optional | Path `id` | `InterviewPrepSchema` | `InterviewPrepModel` |
| **45** | `GET` | `/api/interview-prep/{id}` | `get_interview_prep()` | Optional | Path `id` | `InterviewPrepSchema` | `InterviewPrepModel` |
| **46** | `POST` | `/api/interview-prep/{id}/mock-session` | `record_mock_turn()` | Optional | `MockSessionRequest` | `MockSessionResponse` | `InterviewPrepModel` |
| **47** | `GET` | `/api/skills/action-plan`| `get_skill_action_plan()` | Optional | Query `skills, match_id` | JSON | `LearningResourceModel` |
| **48** | `GET` | `/api/notifications` | `get_notifications()` | Optional | None | JSON | `NotificationEventModel` |
