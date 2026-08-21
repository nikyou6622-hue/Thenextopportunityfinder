# 09 — DATABASE SCHEMA, MODELS & PERSISTENCE AUDIT
**Engine**: SQLAlchemy 2.0 ORM  
**Default Backend**: SQLite 3 (`nextoppr.db`) with Write-Ahead Logging (`PRAGMA journal_mode=WAL`)  
**PostgreSQL Readiness**: Full compatibility (Standard data types: Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON).  
**Model Source File**: `backend/app/db/models.py` (335 lines)

---

## 1. Database Entity-Relationship Architecture

```mermaid
erDiagram
    USERS ||--o{ PROFILES : "has"
    PROFILES ||--o{ MATCHES : "receives"
    JOBS ||--o{ MATCHES : "evaluated in"
    MATCHES ||--|| APPLICATIONS : "creates"
    JOBS ||--o{ APPLICATIONS : "associated with"
    APPLICATIONS ||--o{ APPLICATION_EVENTS : "logs transitions"
    APPLICATIONS ||--|| INTERVIEW_PREP : "contains"
    MATCHES ||--o{ RESUMES_TAILORED : "tailors"
    PROFILES ||--o{ OUTCOME_DIAGNOSIS : "diagnoses"
    PROFILES ||--o{ NOTIFICATION_EVENTS : "notifies"
    PROFILES ||--|| NOTIFICATION_PREFERENCES : "configures"
    PROFILES ||--o{ CODING_ATTEMPTS : "submits"
    JOBS ||--o{ EMAIL_LOG : "reaches out"

    USERS {
        int id PK
        string email UK
        string full_name
        string password_hash
        string target_role
        string experience_level
        boolean is_active
        datetime created_at
    }

    PROFILES {
        int id PK
        string name
        string email
        string phone
        json location
        json skills
        float experience_years
        text summary
        json experience_list
        json education_list
        json projects
        json section_order
        text raw_resume_text "AES-256 Encrypted"
        json raw_extracted_content
        json working_content
        boolean consent_given
        datetime consent_timestamp
        datetime last_analyzed_at
        datetime created_at
    }

    JOBS {
        int id PK
        string company
        string role_title
        string location
        string location_type
        boolean remote
        json required_skills
        string domain
        string role_type
        text description
        string apply_url
        string apply_url_resolved
        string link_status
        datetime link_checked_at
        string source_platform
        string apply_email
        string source_category
        string external_id UK
        string status
        datetime created_at
    }

    MATCHES {
        int id PK
        int job_id FK
        int profile_id FK
        float match_score
        float skill_overlap_score
        float semantic_score
        json matching_skills
        json missing_skills
        datetime created_at
    }

    APPLICATIONS {
        int id PK
        int match_id FK
        int job_id FK
        int profile_id FK
        string status
        string source_platform
        text apply_url_resolved
        datetime link_opened_at
        string link_status
        text tailored_summary
        json tailored_skills
        text notes
        datetime updated_at
    }
```

---

## 2. Table-by-Table Technical Specifications

| Table Name | Model Class | Primary Key | Foreign Keys & Cascades | Indexed Columns | Sensitive Fields | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | `UserModel` | `id` (Integer) | None | `id`, `email`, `full_name` | `password_hash` (bcrypt) | **COMPLETE** |
| `profiles` | `ProfileModel` | `id` (Integer) | None | `id`, `name` | `raw_resume_text` (Fernet encrypted) | **COMPLETE** |
| `jobs` | `JobModel` | `id` (Integer) | None | `id`, `company`, `role_title`, `domain`, `source_platform`, `link_status`, `external_id`, `status` | None | **COMPLETE** |
| `matches` | `MatchModel` | `id` (Integer) | `job_id -> jobs.id`, `profile_id -> profiles.id` | `id` | None | **COMPLETE** |
| `applications` | `ApplicationModel` | `id` (Integer) | `match_id -> matches.id`, `job_id -> jobs.id`, `profile_id -> profiles.id` | `id` | None | **COMPLETE** |
| `application_events` | `ApplicationEventModel` | `id` (Integer) | `application_id -> applications.id` (Cascade Delete) | `id` | None | **COMPLETE** |
| `resumes_tailored` | `TailoredResumeModel` | `id` (Integer) | `match_id -> matches.id`, `job_id -> jobs.id`, `profile_id -> profiles.id` | `id` | None | **COMPLETE** |
| `email_log` | `EmailLogModel` | `id` (Integer) | `job_id -> jobs.id` | `id`, `company`, `batch_id` | `recipient`, `body_preview` | **COMPLETE** |
| `interview_prep` | `InterviewPrepModel` | `id` (Integer) | `application_id -> applications.id` (Unique FK) | `id` | `mock_session_log` (transcripts) | **COMPLETE** |
| `outcome_diagnosis` | `OutcomeDiagnosisModel` | `id` (Integer) | `profile_id -> profiles.id` | `id`, `pattern_type` | None | **COMPLETE** |
| `outcome_events` | `OutcomeEventModel` | `id` (Integer) | `profile_id -> profiles.id`, `job_id -> jobs.id`, `application_id -> applications.id` | `id`, `event_type` | None | **COMPLETE** |
| `subscriptions` | `SubscriptionModel` | `id` (Integer) | `profile_id -> profiles.id` (Unique FK) | `id` | None | **COMPLETE** |
| `learning_resources` | `LearningResourceModel` | `id` (Integer) | None | `id`, `resource_id`, `field`, `category_topic` | None | **COMPLETE** |
| `interview_questions_bank`| `InterviewQuestionBankModel`| `id` (Integer)| None | `id`, `question_id`, `field`, `question_type` | None | **COMPLETE** |
| `coding_questions` | `CodingQuestionModel` | `id` (Integer) | None | `id`, `question_id`, `field`, `difficulty` | None | **COMPLETE** |
| `coding_attempts` | `CodingAttemptModel` | `id` (Integer) | `profile_id -> profiles.id` | `id`, `question_id` | `code_snippet` | **COMPLETE** |
| `resume_templates` | `ResumeTemplateModel` | `id` (Integer) | None | `id`, `template_id`, `category` | None | **COMPLETE** |
| `mnc_scan_log` | `MNCScanLogModel` | `id` (Integer) | None | `id`, `company` | None | **COMPLETE** |
| `notification_events` | `NotificationEventModel` | `id` (Integer) | `profile_id -> profiles.id` | `id`, `profile_id`, `trigger_type` | None | **COMPLETE** |
| `notification_preferences`| `NotificationPreferenceModel`| `id` (Integer)| `profile_id -> profiles.id` (Unique FK) | `id`, `profile_id` | None | **COMPLETE** |
| `llm_usage_logs` | `LLMUsageLog` | `id` (Integer) | `profile_id -> profiles.id` | `id`, `profile_id`, `action` | None | **COMPLETE** |
| `study_material_cache` | `StudyMaterialCache` | `id` (Integer) | None | `id`, `cache_key` | None | **COMPLETE** |

---

## 3. Database Migration Engine (`auto_migrate_sqlite()`)

To ensure smooth zero-downtime upgrades without requiring heavyweight Alembic setups during local development, `main.py` contains `auto_migrate_sqlite()`:
* Executes `PRAGMA table_info()` on startup.
* Inspects column names for `profiles`, `jobs`, `applications`, and `resumes_tailored`.
* Proactively executes `ALTER TABLE ADD COLUMN` for newly introduced schema properties (e.g. `location_type`, `apply_url_resolved`, `link_status`, `consent_given`, `working_content`).
* Does not drop tables or delete candidate data.

---

## 4. SQLite vs PostgreSQL Compatibility Assessment

* **Current Implementation**: Fully self-contained SQLite in WAL mode.
* **Production PostgreSQL Migration**:
  * All JSON columns use SQLAlchemy generic `JSON` type (maps to `JSONB` in Postgres, `TEXT` in SQLite).
  * Timestamps use standard `DateTime` (maps to `TIMESTAMP WITH TIME ZONE` in Postgres).
  * Primary keys use standard `Integer` with `primary_key=True` (maps to `SERIAL`/`BIGSERIAL` in Postgres).
  * Changing `DATABASE_URL=postgresql://user:pass@host:5432/thenextoppr` requires **zero ORM code modifications**.
