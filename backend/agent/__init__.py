"""
NextOpportunityFind — Multi-Agent Package (backend.agent)
Centralized repository of all system agents, scrapers, analyzers, and planners.
"""

# Agent 1: Parser & Benchmark Analyzer
from backend.agent.agent1_parser import (
    parse_resume_content,
    compute_ats_score,
    compute_resume_quality_score,
    validate_resume_upload,
    BENCHMARK_DISCLAIMER
)

# Agent 2: Discovery Engine
from backend.agent.agent2_discovery import (
    discover_all_jobs,
    extract_skills_from_text,
    normalize_role_title,
    check_robots_txt_permission
)

# Agent 2b: Big-MNC Opportunity Scanner
from backend.agent.agent2b_mnc_scanner import (
    run_mnc_scan,
    get_mnc_scan_status
)

# Agent 3: Multi-Dimensional Matching Engine
from backend.agent.agent3_matching import (
    compute_match
)

# Agent 4: Tailoring, Professional Rewriter & Multi-Format Exporters
from backend.agent.agent4_tailor import (
    tailor_resume_for_job
)
from backend.agent.agent4_resume_professional import (
    rewrite_resume_against_pattern
)
from backend.agent.agent4_export_generator import (
    generate_pdf_resume,
    generate_docx_resume,
    generate_md_resume,
    generate_resume,
    analyze_content_quality,
    get_missing_fields,
    get_export_metadata_headers,
    GenerationResult,
    QualitySuggestion,
    ResumeGenerationError
)

# Agent 5: Reporting & Metrics
from backend.agent.agent5_reporting import (
    generate_dashboard_metrics
)

# Agent 6: Batch Outreach & Email Sender
from backend.agent.agent6_batch_email import (
    prepare_email_batch,
    simulate_send_email_batch,
    validate_smtp_provider
)

# Agent 7: Outcome Intelligence & Diagnostics
from backend.agent.agent7_outcome_intelligence import (
    get_outcome_diagnoses,
    analyze_outcome_patterns
)
from backend.agent.outcome_tracker import (
    check_and_log_status_transition,
    compute_outcome_metrics
)

# Agent 8 (Interview Prep Agent): CS/Tech Interview Prep Studio & Seed Data
from backend.agent.agent8_interview_prep import (
    CompanyBrief,
    QuestionBank,
    InterviewEvaluation,
    StudyMaterial,
    InterviewPrepError,
    CompanyBriefError,
    QuestionBankError,
    StudyMaterialError,
    OwnershipError,
    infer_company_brief,
    generate_question_bank,
    evaluate_mock_answer,
    generate_interview_prep_for_application,
    record_mock_session_turn,
    generate_study_material_recommendations,
    purge_expired_study_material_cache,
    get_learning_resources,
    get_interview_questions,
    get_coding_questions,
    record_coding_attempt
)
from backend.agent.learning_and_questions_seed import (
    seed_learning_resources_and_questions
)

# Agent 5: Smart ATS Application Classifier & Link Resolver (Routing & Scrapers)
from backend.agent.source_router import (
    SourcePlatform,
    ApplyRoute,
    ClassificationResult,
    classify_source_platform,
    resolve_and_validate_apply_url,
    classify_apply_url,
    PROTECTED_DOMAINS
)
from backend.agent.scrapers import (
    search_linkedin_jobs,
    search_indeed_jobs,
    search_internshala,
    LinkedInJob,
    IndeedJob,
    InternshalaListing
)

