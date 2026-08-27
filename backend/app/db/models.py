import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    target_role = Column(String, default="Software Engineer")
    experience_level = Column(String, default="Entry Level / Student")
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class ProfileModel(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(JSON, default=dict) # {"city": "", "country": "", "open_to_remote": True}
    skills = Column(JSON, default=list) # ["Python", "React", ...]
    experience_years = Column(Float, default=0.0)
    past_roles = Column(JSON, default=list) # [{"title": "", "company": "", "duration_months": 0}]
    domains = Column(JSON, default=list) # ["fintech", "edtech"]
    education = Column(JSON, default=list) # [{"degree": "", "field": ""}]
    summary = Column(Text, nullable=True)
    experience_list = Column(JSON, default=list)
    education_list = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    key_strengths = Column(JSON, default=list)
    section_order = Column(JSON, default=list) # ["summary", "skills", "experience", "projects", "education"]
    raw_resume_text = Column(Text, nullable=True)
    raw_extracted_content = Column(JSON, default=dict) # Untouched parsed import
    working_content = Column(JSON, default=dict) # Live editable state
    applied_template_id = Column(String, nullable=True)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, nullable=True)
    last_analyzed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True)
    role_title = Column(String, index=True)
    location = Column(String, default="Remote")
    location_type = Column(String, default="Remote") # Remote, Hybrid, On-site: Bengaluru, etc.
    remote = Column(Boolean, default=True)
    required_skills = Column(JSON, default=list)
    domain = Column(String, index=True, default="general")
    role_type = Column(String, default="full-time") # full-time, internship, contract
    description = Column(Text, default="")
    apply_url = Column(String, default="")
    apply_url_raw = Column(String, default="", nullable=True)
    apply_url_resolved = Column(String, default="", nullable=True)
    link_status = Column(String, default="live", index=True) # "live", "dead", "redirected", "unchecked"
    link_checked_at = Column(DateTime, nullable=True)
    source_platform = Column(String, default="unknown", index=True) # greenhouse, lever, ashby, company_direct, email_only, internshala_discovery_only, etc.
    apply_email = Column(String, default="", nullable=True) # Direct recruiter email for email outreach
    posted_date = Column(String, default="")
    source = Column(String, index=True, default="manual") # internshala, naukri, instahyre, cutshort, wellfound, linkedin, etc.
    source_category = Column(String, index=True, default="startup") # startup vs mnc
    source_trust_tier = Column(String, index=True, default="tier1_verified") # tier1_verified, tier2_curated, tier3_aggregator
    is_technical = Column(Boolean, index=True, default=True) # Technical role sanity flag
    company_tier = Column(String, index=True, default="startup_ecosystem") # large_it_services, consulting, product_unicorn, etc.
    external_id = Column(String, unique=True, index=True, nullable=True)
    source_posted_at = Column(String, nullable=True)
    job_fingerprint = Column(String, unique=True, index=True, nullable=True)
    authenticity_flags = Column(JSON, default=list, nullable=True)
    first_seen_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_seen_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    status = Column(String, default="active", index=True) # active, stale, removed
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    matches = relationship("MatchModel", back_populates="job", cascade="all, delete-orphan")

class TailoredResumeModel(Base):
    __tablename__ = "resumes_tailored"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    tailored_resume_path = Column(String, nullable=True)
    ats_score_before = Column(Float, default=0.0)
    ats_score_after = Column(Float, default=0.0)
    diff_summary = Column(JSON, default=list) # List of changes made (summary, bullets, skills)
    section_order = Column(JSON, default=list)
    pattern_template_used = Column(String, default="Standard Impact Pattern")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class EmailLogModel(Base):
    __tablename__ = "email_log"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    company = Column(String, index=True)
    recipient = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body_preview = Column(Text, nullable=True)
    message_id = Column(String, nullable=True)
    batch_id = Column(String, index=True, nullable=True)
    status = Column(String, default="queued") # queued, sent, bounced, failed
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class MatchModel(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    match_score = Column(Float, default=0.0) # 0.0 to 100.0
    skill_overlap_score = Column(Float, default=0.0)
    domain_score = Column(Float, default=0.0)
    location_score = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    matching_skills = Column(JSON, default=list)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    matched_count = Column(Integer, default=0)
    required_count = Column(Integer, default=0)
    skill_match_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    job = relationship("JobModel", back_populates="matches")
    application = relationship("ApplicationModel", back_populates="match", uselist=False)

class ApplicationModel(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    status = Column(String, default="matched") # matched, tailored, pending_manual_review, link_opened, emailed, interview_scheduled, offer_received, hired, rejected, archived
    apply_mode = Column(String, default="company_direct") # legacy mode tag
    source_platform = Column(String, default="unknown") # greenhouse, lever, ashby, company_direct, email_only, etc.
    apply_url_resolved = Column(Text, nullable=True)
    link_opened_at = Column(DateTime, nullable=True)
    link_status = Column(String, default="unchecked") # live, dead, unchecked
    tailored_summary = Column(Text, nullable=True)
    tailored_skills = Column(JSON, default=list)
    form_autofill_data = Column(JSON, default=dict) # repurposed for routing metadata
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    match = relationship("MatchModel", back_populates="application")
    events = relationship("ApplicationEventModel", back_populates="application", cascade="all, delete-orphan")

class ApplicationEventModel(Base):
    __tablename__ = "application_events"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    event_type = Column(String, nullable=False) # status_changed, note_added, review_confirmed, apply_attempted, email_sent
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    application = relationship("ApplicationModel", back_populates="events")

class InterviewPrepModel(Base):
    __tablename__ = "interview_prep"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, unique=True)
    company_brief = Column(JSON, default=dict) # {"funding_stage": "", "product": "", "recent_news": "", "team_structure": ""}
    question_bank = Column(JSON, default=dict) # {"technical_questions": [...], "behavioral_questions": [...]}
    mock_session_log = Column(JSON, default=list) # [{"question": "", "user_answer": "", "feedback": {}, "timestamp": ""}]
    generated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class OutcomeDiagnosisModel(Base):
    __tablename__ = "outcome_diagnosis"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    pattern_type = Column(String, index=True) # e.g. "rejection_at_screening", "missing_domain_keywords"
    evidence_summary = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class OutcomeEventModel(Base):
    __tablename__ = "outcome_events"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    event_type = Column(String, index=True, nullable=False) # application_sent, interview_scheduled, offer_received, hired
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class SubscriptionModel(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False, unique=True)
    tier = Column(String, default="free") # free, pro
    status = Column(String, default="active")
    credits_remaining = Column(Integer, default=5)
    scrapes_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

# --- NEW MODELS FOR CS/TECH EXTENSIONS ---

class LearningResourceModel(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True)
    field = Column(String, index=True) # sde, ml_ai, devops, qa, data, frontend, backend
    category_topic = Column(String, index=True) # pitch, behavioral, system_design, technical
    resource_type = Column(String) # youtube_video, youtube_playlist, doc_guide
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    topic_tags = Column(JSON, default=list)
    difficulty_level = Column(String, default="entry") # entry, mid, senior
    added_reason = Column(Text, nullable=True)
    verified_date = Column(String, default="2026-08-04")

class InterviewQuestionBankModel(Base):
    __tablename__ = "interview_questions_bank"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String, unique=True, index=True)
    field = Column(String, index=True) # sde, ml_ai, devops, qa, data, etc.
    question_type = Column(String, index=True) # behavioral, technical_conceptual, coding
    question_text = Column(Text, nullable=False)
    difficulty_level = Column(String, default="mid") # entry, mid, senior
    topic_tags = Column(JSON, default=list)
    suggested_answer_approach = Column(Text, nullable=False)

class CodingQuestionModel(Base):
    __tablename__ = "coding_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String, unique=True, index=True)
    field = Column(String, index=True) # sde, ml_ai, devops, qa, data
    difficulty = Column(String, index=True) # easy, medium, hard
    topic_tags = Column(JSON, default=list) # ["arrays", "dp", "sql", "system_design"]
    title = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)
    example_input_output = Column(JSON, default=list) # [{"input": "", "output": "", "explanation": ""}]
    hint_progression = Column(JSON, default=list) # ["Hint 1 text", "Hint 2 text", "Hint 3 text"]
    explanation_of_approach = Column(Text, nullable=False)

class CodingAttemptModel(Base):
    __tablename__ = "coding_attempts"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    question_id = Column(String, index=True, nullable=False)
    code_snippet = Column(Text, nullable=True)
    status = Column(String, default="attempted") # attempted, solved, skipped
    hints_viewed = Column(Integer, default=0)
    attempted_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class ResumeTemplateModel(Base):
    __tablename__ = "resume_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, index=True, default="mnc_pattern") # mnc_pattern, startup_impact, executive
    target_role = Column(String, default="SDE") # SDE, ML, DevOps, QA, Data
    template_source_pattern = Column(Text, nullable=False) # "reverse-chronological, single-column, action-verb-led bullets..."
    structure_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class MNCScanLogModel(Base):
    __tablename__ = "mnc_scan_log"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True, nullable=False)
    run_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    status = Column(String, default="success") # success, failed, skipped_robots
    listings_found = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    extra_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

# --- SKILL 5: RETENTION & RE-ENGAGEMENT NOTIFICATION MODELS ---

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
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

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
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

# --- AGENT 8: PRODUCTION INTERVIEW PREP & STUDY MATERIAL MODELS ---

class LLMUsageLog(Base):
    __tablename__ = "llm_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False, index=True)
    action = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

class StudyMaterialCache(Base):
    __tablename__ = "study_material_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True, nullable=False)
    payload_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)



