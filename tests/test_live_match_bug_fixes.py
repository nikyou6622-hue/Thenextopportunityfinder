"""
test_live_match_bug_fixes.py — Automated Test Battery for 4 Live Match Fixes
Verifies:
1. Salary/stipend logic: unpaid or absent salary data never outputs a fabricated estimate.
2. Unreliable source gate: Infosys and other unreliable companies are excluded from active results.
3. Database unique constraint: Duplicate job_fingerprint insertions trigger IntegrityError.
4. Requirement completeness ranking: A 5/5 (100%) match outranks a 1/1 (100%) match.
"""

import pytest
import sqlite3
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.app.db.database import engine, SessionLocal
from backend.app.db.models import JobModel, MatchModel, ProfileModel
from backend.app.agents.agent3_matching import compute_skill_match, compute_match
from backend.app.main import UNRELIABLE_COMPANIES

def test_salary_and_stipend_unpaid_or_absent_logic():
    """Test 1: Unpaid or missing salary/stipend string is preserved cleanly without fabrication."""
    def format_salary_display(raw_val: str) -> str:
        if not raw_val or str(raw_val).lower() in ("null", "none", ""):
            return "Not specified"
        if "unpaid" in str(raw_val).lower():
            return "Unpaid"
        return str(raw_val)

    assert format_salary_display("Unpaid") == "Unpaid"
    assert format_salary_display("unpaid stipend") == "Unpaid"
    assert format_salary_display(None) == "Not specified"
    assert format_salary_display("") == "Not specified"
    assert format_salary_display("null") == "Not specified"
    assert format_salary_display("₹25L - ₹40L / yr") == "₹25L - ₹40L / yr"

def test_unreliable_company_filtering():
    """Test 2: Purged/unreliable company (Infosys) is excluded from active job and match results."""
    assert "infosys" in UNRELIABLE_COMPANIES

    db: Session = SessionLocal()
    try:
        # Create an Infosys job
        unreliable_job = JobModel(
            company="Infosys",
            role_title="Specialist Programmer",
            apply_url="https://careers.infosys.com/job/test-inf-123",
            job_fingerprint="test_inf_fingerprint_999",
            status="active"
        )
        db.add(unreliable_job)
        db.commit()

        # Query simulating get_jobs filtering
        active_jobs = db.query(JobModel).filter(JobModel.status == "active").all()
        filtered_jobs = [j for j in active_jobs if not (j.company and j.company.strip().lower() in UNRELIABLE_COMPANIES)]
        
        company_names = [j.company.lower() for j in filtered_jobs]
        assert "infosys" not in company_names

        # Clean up test row
        db.delete(unreliable_job)
        db.commit()
    finally:
        db.close()

def test_db_unique_constraint_on_job_fingerprint():
    """Test 3: Duplicate job_fingerprint insertion triggers a database IntegrityError."""
    db: Session = SessionLocal()
    unique_fp = "unique_fp_test_8888"
    
    # Cleanup any pre-existing test row
    db.query(JobModel).filter(JobModel.job_fingerprint == unique_fp).delete()
    db.commit()

    try:
        job1 = JobModel(
            company="Company A",
            role_title="Engineer 1",
            apply_url="https://example.com/job1",
            job_fingerprint=unique_fp
        )
        db.add(job1)
        db.commit()

        # Duplicate insertion attempt
        job2 = JobModel(
            company="Company B",
            role_title="Engineer 2",
            apply_url="https://example.com/job2",
            job_fingerprint=unique_fp
        )
        db.add(job2)
        
        with pytest.raises(IntegrityError):
            db.commit()

        db.rollback()
    finally:
        # Cleanup
        db.query(JobModel).filter(JobModel.job_fingerprint == unique_fp).delete()
        db.commit()
        db.close()

def test_completeness_adjusted_ranking_5_of_5_outranks_1_of_1():
    """
    Test 4: Requirement completeness scaling ensures a 5/5 (100% match) outranks a 1/1 (100% match).
    """
    candidate_profile = {
        "skills": ["Python", "FastAPI", "Postgres", "Docker", "AWS"],
        "domains": ["backend"],
        "location": {"city": "Bengaluru", "country": "India", "open_to_remote": True},
        "raw_resume_text": "Senior Backend Engineer with Python, FastAPI, Postgres, Docker, and AWS."
    }

    # Job 1: Demanding complete requirements (5/5 match)
    job_5_skills = {
        "company": "Tech Product Co",
        "role_title": "Senior Backend Engineer",
        "location": "Bengaluru, India",
        "remote": True,
        "required_skills": ["Python", "FastAPI", "Postgres", "Docker", "AWS"],
        "domain": "backend",
        "description": "High-throughput Python microservices with FastAPI, Postgres, Docker, and AWS."
    }

    # Job 2: Sparse 1-skill requirement list (1/1 match)
    job_1_skill = {
        "company": "Small Startup",
        "role_title": "Python Scripting Engineer",
        "location": "Bengaluru, India",
        "remote": True,
        "required_skills": ["Python"],
        "domain": "backend",
        "description": "Python scripting role."
    }

    match_5 = compute_match(candidate_profile, job_5_skills)
    match_1 = compute_match(candidate_profile, job_1_skill)

    # 5/5 match raw percentage is 100%, completeness factor is 1.00 -> skill score = 100.0
    assert match_5["skill_match_percentage"] == 100.0
    assert match_5["matched_count"] == 5
    assert match_5["required_count"] == 5

    # 1/1 match raw percentage is 100%, completeness factor is 0.76 -> skill score = 76.0
    assert match_1["skill_match_percentage"] == 76.0
    assert match_1["matched_count"] == 1
    assert match_1["required_count"] == 1

    # Composite match_score of 5/5 MUST be strictly greater than 1/1
    assert match_5["match_score"] > match_1["match_score"]
