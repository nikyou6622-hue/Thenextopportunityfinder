import pytest
import datetime
from sqlalchemy.orm import Session
from backend.app.db.models import (
    UserModel, ProfileModel, JobModel, MatchModel, ApplicationModel, ApplicationEventModel,
    TailoredResumeModel, EmailLogModel, InterviewPrepModel, OutcomeDiagnosisModel,
    OutcomeEventModel, SubscriptionModel, CodingAttemptModel, CodingQuestionModel,
    InterviewQuestionBankModel, LearningResourceModel, ResumeTemplateModel, MNCScanLogModel,
    NotificationEventModel, NotificationPreferenceModel, LLMUsageLog, StudyMaterialCache
)
from backend.app.main import cascade_delete_profile, purge_expired_profiles
from backend.app.security.encryption import encrypt_field

def test_full_dpdp_cascade_purge_across_all_tables(db: Session):
    """
    Forensic verification: Confirms DPDP Right to Erasure cascade delete purges
    candidate PII and associated records across all relational tables without orphaned rows.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # 1. Create Profile
    profile = ProfileModel(
        name="Cascade Test User",
        email="cascade_test@dev.io",
        phone="+91 9999988888",
        location={"city": "Hyderabad", "country": "India"},
        skills=["Python", "PostgreSQL", "FastAPI"],
        raw_resume_text=encrypt_field("Confidential Candidate Resume"),
        consent_given=True,
        consent_timestamp=now,
        last_analyzed_at=now
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    profile_id = profile.id

    # 2. Create Job
    job = JobModel(
        company="Cascade Corp",
        role_title="Senior Platform Engineer",
        location="Bengaluru",
        remote=True,
        required_skills=["Python", "FastAPI"],
        domain="backend",
        description="Core infra engineering role.",
        apply_url="https://jobs.lever.co/cascadecorp/123",
        apply_url_resolved="https://jobs.lever.co/cascadecorp/123",
        link_status="live",
        source_platform="lever",
        external_id=f"cascade-job-{profile_id}"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # 3. Create Match
    match = MatchModel(
        job_id=job.id,
        profile_id=profile.id,
        match_score=92.0,
        skill_overlap_score=90.0,
        semantic_score=94.0,
        matching_skills=["Python", "FastAPI"],
        missing_skills=[]
    )
    db.add(match)
    db.commit()
    db.refresh(match)

    # 4. Create Application
    app_entry = ApplicationModel(
        match_id=match.id,
        job_id=job.id,
        profile_id=profile.id,
        status="interview_scheduled",
        tailored_summary="Tailored summary for Cascade Corp",
        tailored_skills=["Python", "FastAPI"]
    )
    db.add(app_entry)
    db.commit()
    db.refresh(app_entry)

    # 5. Create Application Event
    app_event = ApplicationEventModel(
        application_id=app_entry.id,
        event_type="status_changed",
        details="Moved to interview"
    )
    db.add(app_event)

    # 6. Create Tailored Resume
    tailored_cv = TailoredResumeModel(
        match_id=match.id,
        job_id=job.id,
        profile_id=profile.id,
        ats_score_before=75.0,
        ats_score_after=92.0,
        diff_summary=[{"type": "keyword_boost", "skill": "FastAPI"}]
    )
    db.add(tailored_cv)

    # 7. Create Interview Prep
    prep = InterviewPrepModel(
        application_id=app_entry.id,
        company_brief={"tech_stack": ["Python", "AWS"]},
        question_bank={"technical_questions": [{"question": "Explain concurrency", "type": "technical"}]},
        mock_session_log=[{"turn": 1, "score": 88}]
    )
    db.add(prep)

    # 8. Create Outcome Diagnosis
    diagnosis = OutcomeDiagnosisModel(
        profile_id=profile.id,
        pattern_type="keyword_mismatch",
        evidence_summary="Missing Distributed Systems Keywords",
        recommendation="Add Kafka experience"
    )
    db.add(diagnosis)

    # 9. Create Outcome Event
    outcome_ev = OutcomeEventModel(
        profile_id=profile.id,
        job_id=job.id,
        application_id=app_entry.id,
        event_type="interview_scheduled"
    )
    db.add(outcome_ev)

    # 10. Create Subscription
    sub = SubscriptionModel(
        profile_id=profile.id,
        tier="pro",
        status="active"
    )
    db.add(sub)

    # 11. Create Coding Attempt
    coding_attempt = CodingAttemptModel(
        profile_id=profile.id,
        question_id="two-sum",
        code_snippet="def twoSum(): pass",
        status="solved",
        hints_viewed=1
    )
    db.add(coding_attempt)

    # 12. Create Notification Event
    notif = NotificationEventModel(
        profile_id=profile.id,
        trigger_type="qualified_match",
        title="92% Match at Cascade Corp",
        message="Your profile matches Cascade Corp.",
        action_tab="jobs",
        severity="success"
    )
    db.add(notif)

    # 13. Create Notification Preferences
    notif_pref = NotificationPreferenceModel(
        profile_id=profile.id,
        cadence="weekly_digest",
        new_matches_enabled=True
    )
    db.add(notif_pref)

    # 14. Create LLM Usage Log
    llm_log = LLMUsageLog(
        profile_id=profile.id,
        action="resume_tailor"
    )
    db.add(llm_log)

    db.commit()

    app_entry_id = app_entry.id
    job_id = job.id

    # Verify rows exist before purge
    assert db.query(ProfileModel).filter(ProfileModel.id == profile_id).count() == 1
    assert db.query(MatchModel).filter(MatchModel.profile_id == profile_id).count() == 1
    assert db.query(ApplicationModel).filter(ApplicationModel.profile_id == profile_id).count() == 1
    assert db.query(ApplicationEventModel).filter(ApplicationEventModel.application_id == app_entry_id).count() == 1
    assert db.query(TailoredResumeModel).filter(TailoredResumeModel.profile_id == profile_id).count() == 1
    assert db.query(InterviewPrepModel).filter(InterviewPrepModel.application_id == app_entry_id).count() == 1
    assert db.query(OutcomeDiagnosisModel).filter(OutcomeDiagnosisModel.profile_id == profile_id).count() == 1
    assert db.query(OutcomeEventModel).filter(OutcomeEventModel.profile_id == profile_id).count() == 1
    assert db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile_id).count() == 1
    assert db.query(CodingAttemptModel).filter(CodingAttemptModel.profile_id == profile_id).count() == 1
    assert db.query(NotificationEventModel).filter(NotificationEventModel.profile_id == profile_id).count() == 1
    assert db.query(NotificationPreferenceModel).filter(NotificationPreferenceModel.profile_id == profile_id).count() == 1
    assert db.query(LLMUsageLog).filter(LLMUsageLog.profile_id == profile_id).count() == 1

    # Execute DPDP Cascade Purge
    deleted_summary = cascade_delete_profile(db, profile_id)

    # Verify ZERO orphaned rows remain across any candidate table
    assert db.query(ProfileModel).filter(ProfileModel.id == profile_id).count() == 0
    assert db.query(MatchModel).filter(MatchModel.profile_id == profile_id).count() == 0
    assert db.query(ApplicationModel).filter(ApplicationModel.profile_id == profile_id).count() == 0
    assert db.query(ApplicationEventModel).filter(ApplicationEventModel.application_id == app_entry_id).count() == 0
    assert db.query(TailoredResumeModel).filter(TailoredResumeModel.profile_id == profile_id).count() == 0
    assert db.query(InterviewPrepModel).filter(InterviewPrepModel.application_id == app_entry_id).count() == 0
    assert db.query(OutcomeDiagnosisModel).filter(OutcomeDiagnosisModel.profile_id == profile_id).count() == 0
    assert db.query(OutcomeEventModel).filter(OutcomeEventModel.profile_id == profile_id).count() == 0
    assert db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile_id).count() == 0
    assert db.query(CodingAttemptModel).filter(CodingAttemptModel.profile_id == profile_id).count() == 0
    assert db.query(NotificationEventModel).filter(NotificationEventModel.profile_id == profile_id).count() == 0
    assert db.query(NotificationPreferenceModel).filter(NotificationPreferenceModel.profile_id == profile_id).count() == 0
    assert db.query(LLMUsageLog).filter(LLMUsageLog.profile_id == profile_id).count() == 0
    
    # Static catalogs remain intact
    assert db.query(JobModel).filter(JobModel.id == job_id).count() == 1
