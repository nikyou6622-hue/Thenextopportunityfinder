"""
agent5_interview_prep.py - Zero-Hallucination Interview Preparation Agent (Alias for Agent 8)
Re-exports all Zero-Hallucination Interview Preparation capabilities.
"""

from backend.app.agents.agent8_interview_prep import (
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
