import os
import sys
import datetime
import pytest

os.environ['USE_SQLITE_TEST'] = '1'
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import JobModel, MatchModel, ApplicationModel, ProfileModel
from backend.app.agents.cleaner import check_expiration, cleanup_expired_jobs, notify_candidates_of_expired_jobs
from backend.app.main import get_india_internships_endpoint

def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_1_passed_deadline_transitions_to_expired():
    now = datetime.datetime.now(datetime.timezone.utc)
    passed_deadline = now - datetime.timedelta(days=2)

    job = JobModel(
        company="DeadlineCorp",
        role_title="Expired Backend Engineer",
        application_deadline=passed_deadline,
        status="active"
    )
    status = check_expiration(job)
    assert status == "expired", f"Job with passed deadline should transition to 'expired', got {status}"

def test_2_null_deadline_never_triggers_expiration():
    job = JobModel(
        company="NoDeadlineCorp",
        role_title="Active Frontend Engineer",
        application_deadline=None,
        status="active"
    )
    status = check_expiration(job)
    assert status == "active", f"Job with null deadline should remain 'active', got {status}"

def test_3_jobs_with_matches_or_applications_are_archived_never_hard_deleted():
    db: Session = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        old_date = now - datetime.timedelta(days=30)

        # Create job referenced by MatchModel
        job_with_match = JobModel(
            company="MatchedCorp",
            role_title="Matched AI Engineer",
            application_deadline=old_date,
            last_seen_at=old_date,
            status="expired",
            job_fingerprint="fp_matched_01"
        )
        db.add(job_with_match)
        db.flush()

        match = MatchModel(job_id=job_with_match.id, profile_id=None, match_score=85.0)
        db.add(match)

        # Create job referenced by ApplicationModel
        job_with_app = JobModel(
            company="AppliedCorp",
            role_title="Applied Systems Engineer",
            application_deadline=old_date,
            last_seen_at=old_date,
            status="expired",
            job_fingerprint="fp_applied_01"
        )
        db.add(job_with_app)
        db.flush()

        app_rec = ApplicationModel(job_id=job_with_app.id, match_id=match.id, status="matched")
        db.add(app_rec)
        db.commit()

        # Run cleanup pass with 14-day retention window
        res = cleanup_expired_jobs(db, retention_days=14)

        # Verify NEITHER job was deleted
        j_match_after = db.query(JobModel).filter(JobModel.job_fingerprint == "fp_matched_01").first()
        j_app_after = db.query(JobModel).filter(JobModel.job_fingerprint == "fp_applied_01").first()

        assert j_match_after is not None, "Job with MatchModel reference MUST NOT be hard-deleted!"
        assert j_match_after.status == "expired", "Job with MatchModel reference must be archived with status='expired'"

        assert j_app_after is not None, "Job with ApplicationModel reference MUST NOT be hard-deleted!"
        assert j_app_after.status == "expired", "Job with ApplicationModel reference must be archived with status='expired'"

    finally:
        db.close()

def test_4_orphaned_jobs_past_retention_window_are_hard_deleted():
    db: Session = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        old_date = now - datetime.timedelta(days=30)

        # Job with 0 matches and 0 applications older than 14 days
        orphaned_job = JobModel(
            company="OrphanCorp",
            role_title="Orphaned Intern",
            application_deadline=old_date,
            last_seen_at=old_date,
            status="expired",
            job_fingerprint="fp_orphan_01"
        )
        db.add(orphaned_job)
        db.commit()

        # Run cleanup pass
        res = cleanup_expired_jobs(db, retention_days=14)
        assert res["deleted"] >= 1, "Orphaned job older than 14 days should be hard-deleted"

        orphaned_after = db.query(JobModel).filter(JobModel.job_fingerprint == "fp_orphan_01").first()
        assert orphaned_after is None, "Orphaned job past retention window must be removed from DB"

    finally:
        db.close()

def test_5_expired_jobs_excluded_from_api_feed():
    db: Session = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        old_date = now - datetime.timedelta(days=5)

        expired_job = JobModel(
            company="ExpiredFeedCorp",
            role_title="Expired Python Engineer Intern",
            location="Bengaluru, India",
            application_deadline=old_date,
            status="expired",
            link_status="live",
            job_fingerprint="fp_expired_feed"
        )
        db.add(expired_job)
        db.commit()

        res = get_india_internships_endpoint(city="all", domain="all", source="all", db=db)
        expired_in_res = any(item.get("job_id") == expired_job.id or item.get("id") == f"int-db-{expired_job.id}" for item in res)
        assert not expired_in_res, "Expired job must be excluded from endpoint response"

    finally:
        db.query(JobModel).filter(JobModel.job_fingerprint == "fp_expired_feed").delete()
        db.commit()
        db.close()

def test_6_candidate_notifications_for_expired_jobs():
    db: Session = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        prof = ProfileModel(name="Alice Candidate", email="alice@example.com")
        db.add(prof)
        db.flush()

        exp_job = JobModel(
            company="NotifCorp",
            role_title="Saved Engineer Role",
            status="expired",
            job_fingerprint="fp_notif_exp"
        )
        db.add(exp_job)
        db.flush()

        match = MatchModel(job_id=exp_job.id, profile_id=prof.id, match_score=90.0)
        db.add(match)
        db.flush()

        app = ApplicationModel(job_id=exp_job.id, match_id=match.id, profile_id=prof.id, status="matched")
        db.add(app)
        db.commit()

        notified_count = notify_candidates_of_expired_jobs(db)
        assert notified_count >= 1, "Candidate with tracked expired job should be notified"

        app_after = db.query(ApplicationModel).filter(ApplicationModel.id == app.id).first()
        assert app_after.status == "archived"
        assert "expired" in app_after.notes.lower()

    finally:
        db.close()

if __name__ == '__main__':
    setup_module()
    test_1_passed_deadline_transitions_to_expired()
    print("PASS: Test 1 - Passed deadline transitions to expired")
    test_2_null_deadline_never_triggers_expiration()
    print("PASS: Test 2 - Null deadline never triggers expiration")
    test_3_jobs_with_matches_or_applications_are_archived_never_hard_deleted()
    print("PASS: Test 3 - Jobs with matches/applications are archived (never hard deleted)")
    test_4_orphaned_jobs_past_retention_window_are_hard_deleted()
    print("PASS: Test 4 - Orphaned jobs past retention window are hard deleted")
    test_5_expired_jobs_excluded_from_api_feed()
    print("PASS: Test 5 - Expired jobs excluded from API feed")
    test_6_candidate_notifications_for_expired_jobs()
    print("PASS: Test 6 - Candidate notifications for expired jobs")
    print("ALL CLEANER TESTS PASSED!")


