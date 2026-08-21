import sys
import os
import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.db.models import (
    ProfileModel, JobModel, MatchModel, ApplicationModel, ApplicationEventModel,
    TailoredResumeModel, EmailLogModel, InterviewPrepModel, OutcomeDiagnosisModel,
    OutcomeEventModel, CodingAttemptModel, SubscriptionModel
)
from backend.app.agents.agent1_parser import (
    validate_resume_upload, compute_resume_quality_score, parse_resume_content,
    MAX_RESUME_SIZE_BYTES
)
from backend.app.agents.agent2_discovery import normalize_role_title, discover_all_jobs
from backend.app.agents.agent3_matching import compute_match
from backend.app.agents.agent6_batch_email import validate_smtp_provider, simulate_send_email_batch
from backend.app.security.encryption import encrypt_field, decrypt_field
from backend.app.security.rate_limiter import SlidingWindowRateLimiter
from backend.app.security.usage_caps import WeeklyUsageTracker
from backend.app.security.cost_telemetry import log_llm_cost_telemetry, get_telemetry_summary
from backend.app.data_source_registry import is_source_compliant
from backend.app.main import cascade_delete_profile, purge_expired_profiles, auto_migrate_sqlite

def test_hardening_and_trust():
    print("================================================================================")
    print("       NEXTOPPORTUNITYFIND — HARDENING & TRUST TEST SUITE")
    print("================================================================================")
    
    auto_migrate_sqlite()
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # ----------------------------------------------------------------------
        # TEST 1: Legal / ToS Compliance & Data Source Registry
        # ----------------------------------------------------------------------
        print("\n[TEST 1] Data Source Compliance & Consumer SMTP Blocking...")
        comp_ok, msg_ok = is_source_compliant("internshala", strict_mode=True)
        assert comp_ok is True, f"Internshala should be compliant: {msg_ok}"

        comp_bad, msg_bad = is_source_compliant("unregistered_shady_job_board", strict_mode=True)
        assert comp_bad is False, f"Unregistered source should be blocked: {msg_bad}"

        # Test consumer SMTP blocking
        gmail_ok, gmail_msg = validate_smtp_provider("smtp.gmail.com")
        assert gmail_ok is False, "Consumer Gmail SMTP must be blocked"
        
        ses_ok, ses_msg = validate_smtp_provider("email-smtp.us-east-1.amazonaws.com")
        assert ses_ok is True, "Amazon SES transactional SMTP must be permitted"
        print("  -> Data Source Registry & Transactional SMTP validation: PASS [OK]")

        # ----------------------------------------------------------------------
        # TEST 2: DPDP Act Encryption at Rest
        # ----------------------------------------------------------------------
        print("\n[TEST 2] DPDP Act Field-Level Encryption at Rest...")
        sample_pii = "Candidate John Doe, Email: john@privacy.org, Phone: +91 99999 88888"
        encrypted = encrypt_field(sample_pii)
        assert encrypted.startswith("enc::"), "Encrypted text must have 'enc::' prefix"
        assert encrypted != sample_pii, "Encrypted text must not match plaintext"

        decrypted = decrypt_field(encrypted)
        assert decrypted == sample_pii, "Decrypted text must match original PII"
        print("  -> Field encryption & decryption at rest: PASS [OK]")

        # ----------------------------------------------------------------------
        # TEST 3: File Upload Validation & Safe Parsing
        # ----------------------------------------------------------------------
        print("\n[TEST 3] Upload Size, MIME & Format Validation...")
        valid_pdf_bytes = b"%PDF-1.4 sample resume content with Python and React skills"
        ok, msg = validate_resume_upload(valid_pdf_bytes, "my_resume.pdf", "application/pdf")
        assert ok is True, f"Valid PDF should pass: {msg}"

        # Oversized file
        huge_bytes = b"0" * (MAX_RESUME_SIZE_BYTES + 1024)
        huge_ok, huge_msg = validate_resume_upload(huge_bytes, "huge.pdf", "application/pdf")
        assert huge_ok is False, "Files over 10MB must be rejected"

        # Disallowed extension
        exe_ok, exe_msg = validate_resume_upload(b"malicious content", "resume.exe", "application/x-msdownload")
        assert exe_ok is False, "Executable extensions must be rejected"
        print("  -> File upload validation: PASS [OK]")

        # ----------------------------------------------------------------------
        # TEST 4: Quality Score Relabeling & Disclaimer
        # ----------------------------------------------------------------------
        print("\n[TEST 4] Quality Score Relabeling & Official Disclaimer...")
        sample_profile = {
            "name": "Jane Developer",
            "skills": ["Python", "FastAPI", "React", "Postgres", "Docker"],
            "summary": "Experienced backend software engineer specializing in scalable APIs.",
            "past_roles": [{"title": "Senior Engineer", "company": "Acme", "description": "Scaled microservices reducing latency by 45%."}]
        }
        quality_eval = compute_resume_quality_score(sample_profile)
        assert "quality_score" in quality_eval, "Quality score must be present"
        assert "disclaimer" in quality_eval, "Benchmark disclaimer must be present"
        assert "NextOpportunityFind Resume Quality Score" in quality_eval["disclaimer"]
        print(f"  -> Resume Quality Score: {quality_eval['quality_score']}/100 | Tier: {quality_eval['tier']} [OK]")

        # ----------------------------------------------------------------------
        # TEST 5: Rate Limiting & Soft Weekly Usage Caps
        # ----------------------------------------------------------------------
        print("\n[TEST 5] Rate Limiter & Weekly Usage Caps...")
        limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
        client = "test_candidate_123"
        assert limiter.is_allowed(client)[0] is True
        assert limiter.is_allowed(client)[0] is True
        assert limiter.is_allowed(client)[0] is True
        # 4th request must be blocked
        is_allowed, rem, retry_after = limiter.is_allowed(client)
        assert is_allowed is False, "4th request within 3-request window must be rate limited"
        assert retry_after > 0, "Retry-After must be positive"

        # Weekly caps
        tracker = WeeklyUsageTracker()
        for _ in range(5):
            tracker.record_and_check_cap("user_abc", action="resume_tailor")
        
        # 6th should raise HTTPException 429
        hit_cap = False
        try:
            tracker.record_and_check_cap("user_abc", action="resume_tailor")
        except Exception:
            hit_cap = True
        assert hit_cap is True, "6th resume tailor in a week must trigger weekly cap"
        print("  -> Rate Limiting & Weekly Usage Caps: PASS [OK]")

        # ----------------------------------------------------------------------
        # TEST 6: Canonical Title Normalization & Outcome Feedback Loop
        # ----------------------------------------------------------------------
        print("\n[TEST 6] Canonical Role Normalization & Outcome Feedback...")
        assert normalize_role_title("Sr. SDE") == "Senior Software Engineer"
        assert normalize_role_title("Senior Software Engineer") == "Senior Software Engineer"
        assert normalize_role_title("Backend Developer") == "Software Engineer"
        assert normalize_role_title("React UI Developer") == "Frontend Engineer"

        # Feedback signal test
        job = {"company": "TestCorp", "role_title": "Python Dev", "domain": "fintech", "required_skills": ["Python"]}
        prof = {"name": "Test", "skills": ["Python"], "domains": ["fintech"], "raw_resume_text": "Python"}
        
        # Normal match
        m_normal = compute_match(prof, job)
        # Match with past rejection signal in fintech
        signals = [{"pattern_type": "rejection_cluster_fintech", "recommendation": "Elevate keywords"}]
        m_feedback = compute_match(prof, job, outcome_feedback_signals=signals)
        assert m_feedback["domain_score"] < m_normal["domain_score"], "Outcome feedback should adjust domain score"
        assert "adaptive_feedback" in m_feedback, "Adaptive feedback message must be present"
        print("  -> Canonical normalization & Feedback matching: PASS [OK]")

        # ----------------------------------------------------------------------
        # TEST 7: DPDP Act Right to Erasure Cascade Delete
        # ----------------------------------------------------------------------
        print("\n[TEST 7] DPDP Act Right to Erasure Full Cascade Delete...")
        
        # Create a test profile with linked records in all tables
        test_prof = ProfileModel(
            name="Delete Candidate",
            email="delete_me@privacy.in",
            skills=["Python", "FastAPI"],
            raw_resume_text=encrypt_field("Delete Candidate Resume Text"),
            consent_given=True,
            consent_timestamp=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(test_prof)
        db.commit()
        db.refresh(test_prof)
        prof_id = test_prof.id

        # Linked Job & Match
        test_job = JobModel(company="ErasureCorp", role_title="Dev", required_skills=["Python"])
        db.add(test_job)
        db.commit()
        db.refresh(test_job)

        test_match = MatchModel(job_id=test_job.id, profile_id=prof_id, match_score=80.0)
        db.add(test_match)
        db.commit()
        db.refresh(test_match)

        # Linked Application
        test_app = ApplicationModel(job_id=test_job.id, match_id=test_match.id, profile_id=prof_id, status="matched")
        db.add(test_app)
        db.commit()
        db.refresh(test_app)

        # Linked Tailored Resume
        test_tailored = TailoredResumeModel(match_id=test_match.id, job_id=test_job.id, profile_id=prof_id)
        db.add(test_tailored)

        # Linked Outcome Diagnosis
        test_diag = OutcomeDiagnosisModel(profile_id=prof_id, pattern_type="test_pattern", evidence_summary="Test", recommendation="Test")
        db.add(test_diag)

        # Linked Coding Attempt
        test_code = CodingAttemptModel(profile_id=prof_id, question_id="two-sum", code_snippet="pass")
        db.add(test_code)

        # Linked Subscription
        test_sub = SubscriptionModel(profile_id=prof_id, tier="free")
        db.add(test_sub)
        db.commit()

        # Execute Cascade Delete
        deleted_summary = cascade_delete_profile(db, prof_id)
        assert deleted_summary["profile"] == 1, "Profile record must be deleted"
        assert deleted_summary["matches"] >= 1, "Matches must be cascaded"
        assert deleted_summary["applications"] >= 1, "Applications must be cascaded"
        assert deleted_summary["outcome_diagnosis"] >= 1, "Diagnoses must be cascaded"
        assert deleted_summary["coding_attempts"] >= 1, "Coding attempts must be cascaded"
        assert deleted_summary["subscriptions"] >= 1, "Subscriptions must be cascaded"

        # Verify no orphaned records exist
        assert db.query(ProfileModel).filter(ProfileModel.id == prof_id).first() is None
        assert db.query(MatchModel).filter(MatchModel.profile_id == prof_id).first() is None
        assert db.query(ApplicationModel).filter(ApplicationModel.profile_id == prof_id).first() is None
        print("  -> Full right-to-erasure cascade delete: PASS [OK]")

        # ----------------------------------------------------------------------
        # TEST 8: Cost Telemetry Logging
        # ----------------------------------------------------------------------
        print("\n[TEST 8] Cost Telemetry Logging...")
        telemetry = log_llm_cost_telemetry(prof_id, "mock_turn", "Question prompt...", "Generated completion...")
        assert telemetry["total_tokens"] > 0
        assert telemetry["cost_usd"] >= 0
        summary = get_telemetry_summary()
        assert summary["total_calls"] >= 1
        print(f"  -> Logged LLM Telemetry: {summary['total_tokens']} tokens, ${summary['total_cost_usd']:.6f} [OK]")

        print("\n================================================================================")
        print(" [ALL TESTS PASSED] NextOpportunityFind Hardening & Trust Verification Successful!")
        print("================================================================================\n")

    finally:
        db.close()

if __name__ == "__main__":
    test_hardening_and_trust()
