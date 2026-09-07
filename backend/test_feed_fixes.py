import os
import pytest
from sqlalchemy.orm import Session
from backend.app.agents.source_router import is_technical_role
from backend.app.db.models import JobModel
from backend.app.main import get_india_internships_endpoint

def test_classifier_non_technical_roles():
    non_tech_titles = [
        "Recruitment Consultant", "Graphic Design", "Customer Service", "Customer Support",
        "Campus Ambassador Internship", "Campus Ambassador Programme", "HR", "Human Resources",
        "Visual Designer", "Event Management", "Influencer Marketing", "Fundraising",
        "Business Development (Sales)", "Reel Editor", "LinkedIn Outreach", "Marketing",
        "Retail Operations & Social Media Manager", "Social Media Marketing", "Sales and Marketing",
        "Brand Management", "Content Writing", "Business Administration & Compliance", "Inside Sales & Growth"
    ]
    for title in non_tech_titles:
        assert is_technical_role(title, "") is False, f"Title '{title}' should be classified as False"

def test_classifier_technical_roles():
    tech_titles = [
        "Software Development Engineer", "Backend Developer", "Frontend Engineer",
        "Fullstack Developer", "AI Engineer", "Data Scientist", "DevOps Engineer"
    ]
    for title in tech_titles:
        assert is_technical_role(title, "Python React PostgreSQL") is True, f"Title '{title}' should be classified as True"

def test_match_score_proportionality_and_dead_link_exclusion():
    from backend.app.db.database import SessionLocal, engine, Base
    db: Session = SessionLocal()

    try:
        # Create test jobs
        job_0_skill = JobModel(
            company="Acme Tech",
            role_title="Backend Software Engineer",
            location="Bengaluru, India",
            required_skills=["Rust", "Zig", "Elixir"],
            description="High performance systems engineering.",
            source="unstop",
            status="active",
            link_status="live",
            job_fingerprint="test_fp_0_skill"
        )
        job_100_skill = JobModel(
            company="Beta Corp",
            role_title="Python Developer Intern",
            location="Bengaluru, India",
            required_skills=["Python"],
            description="Python development intern role.",
            source="unstop",
            status="active",
            link_status="live",
            job_fingerprint="test_fp_100_skill"
        )
        job_dead = JobModel(
            company="Dead Corp",
            role_title="Software Intern",
            location="Bengaluru, India",
            required_skills=["Python"],
            description="Role with expired link.",
            source="unstop",
            status="active",
            link_status="dead",
            job_fingerprint="test_fp_dead"
        )

        db.add_all([job_0_skill, job_100_skill, job_dead])
        db.commit()

        # Query endpoint
        res = get_india_internships_endpoint(city="all", domain="all", source="all", db=db)
        
        # Verify dead link is excluded
        dead_ids = [item["job_id"] for item in res if item["job_id"] == job_dead.id]
        assert len(dead_ids) == 0, "Dead link job must be excluded from endpoint response"

        # Verify score gap
        item_0 = next((item for item in res if item["job_id"] == job_0_skill.id), None)
        item_100 = next((item for item in res if item["job_id"] == job_100_skill.id), None)

        assert item_0 is not None, "0-skill job should be present"
        assert item_100 is not None, "100-skill job should be present"

        score_0 = item_0["match_score"]
        score_100 = item_100["match_score"]
        score_gap = score_100 - score_0

        print(f"0-Skill Score: {score_0}%, 100-Skill Score: {score_100}%, Gap: {score_gap} points")
        assert score_gap >= 30.0, f"Score gap between 0% and 100% skill match should be >= 30 points, got {score_gap}"

    finally:
        # Cleanup test rows
        db.query(JobModel).filter(JobModel.job_fingerprint.in_(["test_fp_0_skill", "test_fp_100_skill", "test_fp_dead"])).delete(synchronize_session=False)
        db.commit()
        db.close()
