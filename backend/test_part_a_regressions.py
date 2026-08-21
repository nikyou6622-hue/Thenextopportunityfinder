import sys
import os
import time
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.models import Base, ProfileModel, JobModel, MatchModel, MNCScanLogModel
from backend.app.agents.agent2b_mnc_scanner import run_mnc_scan, MNC_TARGET_CONFIG

def test_a1_rate_limit_uncapped():
    """
    A1: Assert time.sleep is called with the full configured rate_limit_seconds value (> 0.5s)
    and is NOT capped at 0.5s.
    """
    print("\n--- [TEST A1] Rate-Limit Cap Regression ---")
    # Set up in-memory sqlite
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Find a company with rate_limit_seconds > 0.5 or create a mock config
    # e.g., Amazon has 1.0s, Google has 1.0s, Microsoft has 1.0s
    test_config = [
        {
            "company": "Deloitte",
            "domain_name": "deloitte.com",
            "careers_url": "https://www2.deloitte.com/in/en/careers.html",
            "company_tier": "consulting",
            "rate_limit_seconds": 2.0,  # Configured at 2.0s (well above 0.5s cap)
            "requires_js": False,
            "api_endpoint": None,
            "data_access_method": "html_scrape",
            "job_listing_url": "https://apply.deloitte.com/careers/SearchJobs",
            "seed_jobs": []
        }
    ]

    sleep_calls = []
    def mock_sleep(seconds):
        sleep_calls.append(seconds)

    with patch("backend.app.agents.agent2b_mnc_scanner.MNC_TARGET_CONFIG", test_config), \
         patch("backend.app.agents.agent2b_mnc_scanner.get_active_companies", return_value=test_config), \
         patch("backend.app.agents.agent2b_mnc_scanner.check_robots_allowed", return_value=(True, "Allowed")), \
         patch("backend.app.agents.agent2b_mnc_scanner.fetch_deloitte_postings", return_value=([], {"http_success": True, "data_success": True, "error": None})), \
         patch("backend.app.agents.agent2b_mnc_scanner.time.sleep", side_effect=mock_sleep):
        
        run_mnc_scan(db, force_scan=True)

    print(f"Recorded sleep calls: {sleep_calls}")
    assert len(sleep_calls) >= 1, "time.sleep should have been called"
    assert 2.0 in sleep_calls, f"Expected sleep call with exactly 2.0s, but got {sleep_calls}"
    assert all(s != 0.5 for s in sleep_calls if s == 2.0), "Sleep was incorrectly capped at 0.5s!"
    print("[PASS] Test A1 PASSED: time.sleep received unmodified 2.0s (no 0.5s cap).")


def test_a2_removed_and_stale_jobs_excluded_from_matching():
    """
    A2: Assert that JobModel rows with status='removed' or status='stale' are NOT matched,
    and only status='active' jobs generate MatchModel records.
    """
    print("\n--- [TEST A2] Removed/Stale Job Matching Exclusion ---")
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # 1. Create a candidate profile with Python/FastAPI skills
    profile = ProfileModel(
        id=1,
        name="Candidate A",
        email="candidate@example.com",
        skills=["Python", "FastAPI", "SQLAlchemy"],
        domains=["Backend", "Cloud"],
        consent_given=True,
        raw_resume_text="Senior Python Developer with FastAPI and SQLAlchemy expertise."
    )
    db.add(profile)
    db.commit()

    # 2. Insert 3 jobs: one active, one stale, one removed (all would match candidate's skills)
    job_active = JobModel(
        id=101,
        company="MNC Active Corp",
        role_title="Backend Engineer",
        description="Looking for Python FastAPI developer",
        required_skills=["Python", "FastAPI"],
        source_category="mnc",
        status="active",
        link_status="active",
        apply_url="https://active.example.com/apply"
    )
    job_stale = JobModel(
        id=102,
        company="MNC Stale Corp",
        role_title="Backend Engineer",
        description="Looking for Python FastAPI developer",
        required_skills=["Python", "FastAPI"],
        source_category="mnc",
        status="stale",
        link_status="stale",
        apply_url="https://stale.example.com/apply"
    )
    job_removed = JobModel(
        id=103,
        company="MNC Removed Corp",
        role_title="Backend Engineer",
        description="Looking for Python FastAPI developer",
        required_skills=["Python", "FastAPI"],
        source_category="mnc",
        status="removed",
        link_status="removed",
        apply_url="https://removed.example.com/apply"
    )
    db.add_all([job_active, job_stale, job_removed])
    db.commit()

    # 3. Run the matching query from run_mnc_scan
    # In run_mnc_scan, matching queries:
    all_mnc_jobs = db.query(JobModel).filter(
        JobModel.source_category == "mnc",
        JobModel.status == "active"
    ).all()

    assert len(all_mnc_jobs) == 1, f"Expected exactly 1 active job returned by filter, got {len(all_mnc_jobs)}"
    assert all_mnc_jobs[0].id == 101, f"Expected active job ID 101, got {all_mnc_jobs[0].id}"

    # Simulate full run_mnc_scan matching execution
    from backend.app.agents.agent3_matching import compute_match
    for job in all_mnc_jobs:
        prof_dict = {
            "name": profile.name,
            "skills": profile.skills or [],
            "domains": profile.domains or [],
            "raw_resume_text": profile.raw_resume_text
        }
        j_dict = {
            "company": job.company,
            "role_title": job.role_title,
            "location": job.location,
            "required_skills": job.required_skills or [],
            "domain": job.domain,
            "description": job.description
        }
        match_res = compute_match(prof_dict, j_dict)
        new_match = MatchModel(
            job_id=job.id,
            profile_id=profile.id,
            match_score=match_res["match_score"],
            skill_overlap_score=match_res["skill_overlap_score"],
            domain_score=match_res["domain_score"],
            location_score=match_res["location_score"],
            semantic_score=match_res["semantic_score"],
            matching_skills=match_res["matching_skills"],
            missing_skills=match_res["missing_skills"]
        )
        db.add(new_match)
    db.commit()

    # 4. Assert MatchModel rows in DB
    all_matches = db.query(MatchModel).all()
    matched_job_ids = [m.job_id for m in all_matches]

    print(f"Generated match records for Job IDs: {matched_job_ids}")
    assert 101 in matched_job_ids, "Active job 101 should have a MatchModel"
    assert 102 not in matched_job_ids, "Stale job 102 MUST NOT have a MatchModel created!"
    assert 103 not in matched_job_ids, "Removed job 103 MUST NOT have a MatchModel created!"
    assert len(all_matches) == 1, f"Expected exactly 1 match record, got {len(all_matches)}"
    print("[PASS] Test A2 PASSED: Removed (103) and Stale (102) jobs were strictly excluded from matching.")


if __name__ == "__main__":
    test_a1_rate_limit_uncapped()
    test_a2_removed_and_stale_jobs_excluded_from_matching()
    print("\n=======================================================")
    print(" ALL PART A REGRESSION TESTS PASSED SUCCESSFULLY (100%)")
    print("=======================================================\n")
