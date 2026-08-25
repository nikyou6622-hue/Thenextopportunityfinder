import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LocationInfo(BaseModel):
    city: Optional[str] = ""
    country: Optional[str] = ""
    open_to_remote: Optional[bool] = True

class ProfileSchema(BaseModel):
    id: Optional[int] = None
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: LocationInfo = Field(default_factory=LocationInfo)
    skills: List[str] = []
    experience_years: float = 0.0
    past_roles: List[Dict[str, Any]] = []
    domains: List[str] = []
    education: List[Dict[str, Any]] = []
    education_list: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    summary: Optional[str] = None
    experience_list: List[Dict[str, Any]] = []
    key_strengths: List[str] = []
    section_order: List[str] = ["summary", "skills", "experience", "projects", "education"]
    consent_given: bool = False
    consent_timestamp: Optional[str] = None
    quality_score: Optional[float] = None
    quality_score_breakdown: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
    ats_score_breakdown: Optional[Dict[str, Any]] = None
    disclaimer: Optional[str] = "NextOpportunityFind Resume Quality Score is an internal algorithmic benchmark and does not guarantee specific ATS behavior across proprietary systems like Workday, Taleo, or iCIMS."
    raw_resume_text: Optional[str] = None

class JobSchema(BaseModel):
    id: Optional[int] = None
    company: str
    role_title: str
    location: str = "Remote"
    location_type: Optional[str] = "Remote"
    remote: bool = True
    required_skills: List[str] = []
    domain: str = "general"
    role_type: str = "full-time"
    description: str = ""
    apply_url: str = ""
    apply_url_raw: Optional[str] = ""
    apply_url_resolved: Optional[str] = ""
    link_status: Optional[str] = "live"
    link_checked_at: Optional[Any] = None
    source_platform: Optional[str] = "unknown"
    apply_email: Optional[str] = ""
    posted_date: str = ""
    source: str = "manual"
    source_category: str = "startup"
    company_tier: str = "startup_ecosystem"
    external_id: Optional[str] = None

class LinkRevalidationResponse(BaseModel):
    message: str
    total_evaluated: int
    live_count: int
    dead_count: int
    redirected_count: int
    unchecked_count: int
    revalidated_at: str

class LinkHealthSummary(BaseModel):
    total_jobs: int
    live_links: int
    dead_links: int
    redirected_links: int
    unchecked_links: int
    health_percentage: float

class MatchSchema(BaseModel):
    id: Optional[int] = None
    job_id: int
    job: Optional[JobSchema] = None
    profile_id: Optional[int] = None
    match_score: float
    skill_overlap_score: float
    domain_score: float
    location_score: float
    semantic_score: float
    matching_skills: List[str] = []
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    matched_count: int = 0
    required_count: int = 0
    skill_match_percentage: float = 0.0

class TailoredResumeSchema(BaseModel):
    id: Optional[int] = None
    match_id: int
    job_id: int
    profile_id: Optional[int] = None
    tailored_resume_path: Optional[str] = None
    ats_score_before: float = 0.0
    ats_score_after: float = 0.0
    diff_summary: List[Dict[str, Any]] = []
    section_order: List[str] = ["summary", "skills", "experience", "projects", "education"]
    pattern_template_used: str = "Standard Impact Pattern"

class EmailLogSchema(BaseModel):
    id: Optional[int] = None
    job_id: Optional[int] = None
    company: str
    recipient: str
    subject: str
    body_preview: Optional[str] = None
    message_id: Optional[str] = None
    batch_id: Optional[str] = None
    status: str = "queued"
    sent_at: Optional[str] = None

class ApplicationSchema(BaseModel):
    id: Optional[int] = None
    match_id: int
    job_id: int
    profile_id: Optional[int] = None
    status: str = "matched"
    apply_mode: str = "company_direct"
    source_platform: Optional[str] = "unknown"
    apply_url_resolved: Optional[str] = None
    link_opened_at: Optional[str] = None
    link_status: Optional[str] = "unchecked"
    tailored_summary: Optional[str] = None
    tailored_skills: List[str] = []
    form_autofill_data: Dict[str, Any] = {}
    notes: Optional[str] = None
    job: Optional[JobSchema] = None
    match: Optional[MatchSchema] = None

class ApplicationUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    apply_mode: Optional[str] = None
    source_platform: Optional[str] = None
    apply_url_resolved: Optional[str] = None
    link_status: Optional[str] = None

class DashboardMetrics(BaseModel):
    total_matched_jobs: int
    applications_sent: int
    pending_review_count: int
    high_match_count: int
    emails_sent_count: int = 0
    avg_match_score: float
    domain_breakdown: Dict[str, int]
    match_distribution: Dict[str, int]

# --- AGENT 8, OUTCOME INTELLIGENCE, METRICS, & BILLING STUB SCHEMAS ---

class CompanyBriefSchema(BaseModel):
    funding_stage: str = "Series A / Early Growth"
    product: str = ""
    recent_news: str = ""
    team_structure: str = ""

class QuestionItem(BaseModel):
    id: str
    question: str
    category: str  # technical, behavioral
    context_hint: Optional[str] = None
    target_competency: Optional[str] = None

class QuestionBankSchema(BaseModel):
    technical_questions: List[QuestionItem] = []
    behavioral_questions: List[QuestionItem] = []

class InterviewPrepSchema(BaseModel):
    id: Optional[int] = None
    application_id: int
    company_name: Optional[str] = ""
    role_title: Optional[str] = ""
    company_brief: CompanyBriefSchema
    question_bank: QuestionBankSchema
    mock_session_log: List[Dict[str, Any]] = []
    generated_at: Optional[str] = None

class MockSessionRequest(BaseModel):
    question_id: str
    question_text: str
    question_type: str = "technical"
    user_answer: str

class MockFeedbackSchema(BaseModel):
    clarity_score: float
    specificity_score: float
    star_method_score: Optional[float] = None
    overall_rating: str
    strengths: List[str] = []
    areas_for_improvement: List[str] = []
    sample_improved_response: str = ""

class MockSessionResponse(BaseModel):
    application_id: int
    question_id: str
    feedback: MockFeedbackSchema
    session_log_length: int

class OutcomeDiagnosisSchema(BaseModel):
    id: Optional[int] = None
    profile_id: int
    pattern_type: str
    evidence_summary: str
    recommendation: str
    detected_at: Optional[str] = None

class OutcomeMetricsSchema(BaseModel):
    total_applications_sent: int = 0
    total_interviews_scheduled: int = 0
    total_offers_received: int = 0
    total_hired: int = 0
    interview_rate_pct: float = 0.0
    offer_rate_pct: float = 0.0
    avg_days_to_interview: float = 0.0
    lifecycle_funnel: Dict[str, int] = {}

class SubscriptionSchema(BaseModel):
    profile_id: int
    tier: str = "free"
    status: str = "active"
    credits_remaining: int = 5
    scrapes_used: int = 0
    scrapes_remaining: int = 5
    free_limit: int = 5
    is_pro: bool = False
    price_inr: int = 99
    monetization_enabled: bool = True
    is_gated: bool = False

# --- NEW SCHEMAS FOR CS/TECH EXTENSIONS ---

class LearningResourceSchema(BaseModel):
    id: Optional[int] = None
    resource_id: str
    field: str
    category_topic: str
    resource_type: str
    title: str
    url: str
    topic_tags: List[str] = []
    difficulty_level: str = "entry"
    added_reason: Optional[str] = None
    verified_date: str = "2026-08-04"

class InterviewQuestionBankSchema(BaseModel):
    id: Optional[int] = None
    question_id: str
    field: str
    question_type: str
    question_text: str
    difficulty_level: str = "mid"
    topic_tags: List[str] = []
    suggested_answer_approach: str

class ExampleIO(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = ""

class CodingQuestionSchema(BaseModel):
    id: Optional[int] = None
    question_id: str
    field: str
    difficulty: str
    title: str
    topic_tags: List[str] = []
    question_text: str
    constraints: Optional[str] = None
    example_input_output: List[ExampleIO] = []
    hint_progression: List[str] = []
    explanation_of_approach: str

class CodingAttemptRequest(BaseModel):
    code_snippet: str
    status: str = "attempted" # attempted, solved, skipped
    hints_viewed: int = 0

class CodingAttemptResponse(BaseModel):
    message: str
    question_id: str
    status: str
    hints_viewed: int
    explanation_of_approach: str

class ResumeTemplateSchema(BaseModel):
    id: Optional[int] = None
    template_id: str
    name: str
    category: str = "mnc_pattern"
    target_role: str = "SDE"
    template_source_pattern: str
    structure_json: Dict[str, Any] = {}

class ReorderRequest(BaseModel):
    section_order: Optional[List[str]] = None
    experience_list: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None

class MNCScanLogSchema(BaseModel):
    id: Optional[int] = None
    company: str
    run_at: Optional[str] = None
    status: str = "success"
    listings_found: int = 0
    error_message: Optional[str] = None
    extra_data: Optional[str] = None

class MNCScanStatusResponse(BaseModel):
    last_scan_run: Optional[str] = None
    total_companies_monitored: int
    total_companies_configured: Optional[int] = None
    unavailable_companies: Optional[List[str]] = None
    company_statuses: Dict[str, Dict[str, Any]]

# --- STUDY MATERIAL SCHEMAS ---

class StudyMaterialVideoItem(BaseModel):
    title: str
    url: str
    channel: Optional[str] = "YouTube Search"
    relevance: str

class StudyMaterialGuideItem(BaseModel):
    title: str
    url: str
    type: Optional[str] = "article"
    relevance: str

class StudyMaterialRequest(BaseModel):
    field: str
    role_title: str
    skills: List[str] = []

class StudyMaterialResponse(BaseModel):
    videos: List[StudyMaterialVideoItem] = []
    guides: List[StudyMaterialGuideItem] = []
    note: str
    generated_at: str

# --- AUTHENTICATION SCHEMAS ---

class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str
    target_role: Optional[str] = "Software Engineer"
    experience_level: Optional[str] = "Entry Level / Student"
    consent_given: Optional[bool] = True
    consent_timestamp: Optional[datetime.datetime] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SendOtpRequest(BaseModel):
    email: str
    type: Optional[str] = "login"

class VerifyOtpRequest(BaseModel):
    email: str
    token: str
    type: Optional[str] = "login"
    full_name: Optional[str] = None
    target_role: Optional[str] = "Software Engineer"
    experience_level: Optional[str] = "Entry Level / Student"
    consent_given: Optional[bool] = True

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    email: str
    expires_in: int
    demo_otp: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    google_id: Optional[str] = None



