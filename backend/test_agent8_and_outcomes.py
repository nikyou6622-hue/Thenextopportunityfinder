import sys
import os
import pytest

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.db.models import ProfileModel, JobModel, MatchModel, ApplicationModel, InterviewPrepModel, OutcomeDiagnosisModel, OutcomeEventModel, SubscriptionModel
from backend.app.agents.agent8_interview_prep import generate_interview_prep_for_application, record_mock_session_turn
from backend.app.agents.agent7_outcome_intelligence import analyze_outcome_patterns, get_outcome_diagnoses
from backend.app.agents.outcome_tracker import compute_outcome_metrics, check_and_log_status_transition
from backend.app.config import MONETIZATION_ENABLED
from backend.app.main import auto_migrate_sqlite

@pytest.fixture(scope="module")
def db_session():
    auto_migrate_sqlite()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_agent8_interview_prep_and_outcomes(db_session: Session):
    """Verify Agent 8 interview prep generation, mock turn evaluation, and outcome tracking."""
    # 1. Create or get test Profile
    profile = db_session.query(ProfileModel).first()
    if not profile:
        profile = ProfileModel(
            name="Test Candidate",
            email="candidate@test.org",
            skills=["Python", "FastAPI", "React", "Postgres"],
            domains=["fintech"],
            raw_resume_text="Experienced Python Developer specializing in FastAPI and Postgres fintech microservices."
        )
        db_session.add(profile)
        db_session.commit()
        db_session.refresh(profile)

    # 2. Create test Job
    job = JobModel(
        company="FintechCorp",
        role_title="Senior Python Backend Engineer",
        domain="fintech",
        required_skills=["Python", "FastAPI", "Postgres", "Redis"],
        description="FintechCorp is building a high-throughput payment processing engine."
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    # 3. Create test Match and Application
    match = MatchModel(
        job_id=job.id,
        profile_id=profile.id,
        match_score=88.5,
        matching_skills=["Python", "FastAPI", "Postgres"]
    )
    db_session.add(match)
    db_session.commit()

    app_entry = ApplicationModel(
        match_id=match.id,
        job_id=job.id,
        profile_id=profile.id,
        status="interview_scheduled",
        tailored_summary="Python Engineer with 3+ years experience in high throughput fintech backend systems."
    )
    db_session.add(app_entry)
    db_session.commit()
    db_session.refresh(app_entry)

    # 4. Test Agent 8 Interview Prep Generation
    prep = generate_interview_prep_for_application(db_session, app_entry.id)
    assert prep["application_id"] == app_entry.id
    assert "company_brief" in prep
    assert len(prep["question_bank"]["technical_questions"]) >= 8
    assert len(prep["question_bank"]["behavioral_questions"]) >= 5

    # 5. Test Agent 8 Mock Session Turn
    turn = record_mock_session_turn(
        db=db_session,
        application_id=app_entry.id,
        question_id=prep["question_bank"]["technical_questions"][0]["id"],
        question_text=prep["question_bank"]["technical_questions"][0]["question"],
        question_type="technical",
        user_answer="I architected an async FastAPI service utilizing Celery and Redis task queues to handle 10,000 requests per minute with 99.9% uptime."
    )
    assert turn["feedback"]["clarity_score"] > 0
    assert turn["feedback"]["specificity_score"] > 0

    # 6. Test Outcome Event Logging & Outcome Metrics
    check_and_log_status_transition(db_session, app_entry.id, "interview_scheduled")
    metrics = compute_outcome_metrics(db_session)
    assert metrics["total_applications_sent"] >= 1

    # 7. Test Agent 7 Outcome Intelligence (3 rejections cluster)
    for i in range(3):
        j_rej = JobModel(company=f"RejCompany{i}", role_title="Backend Dev", domain="fintech")
        db_session.add(j_rej)
        db_session.flush()
        m_rej = MatchModel(job_id=j_rej.id, profile_id=profile.id, match_score=70.0)
        db_session.add(m_rej)
        db_session.flush()
        app_rej = ApplicationModel(match_id=m_rej.id, job_id=j_rej.id, profile_id=profile.id, status="rejected")
        db_session.add(app_rej)
        db_session.flush()

    db_session.commit()

    diagnoses = analyze_outcome_patterns(db_session, profile.id)
    assert len(diagnoses) > 0

    # 8. Check Monetization Flag
    assert isinstance(MONETIZATION_ENABLED, bool)
