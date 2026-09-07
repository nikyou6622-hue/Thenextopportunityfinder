import pytest
from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal
from backend.app.db.models import ProfileModel, JobModel, MatchModel
from backend.app.main import bulk_upsert_matches, run_matching_pipeline
from backend.app.agents.agent3_matching import compute_match

def test_bulk_upsert_matches_inserts_and_updates():
    """
    Tests that bulk_upsert_matches correctly inserts new match rows
    and updates existing match rows on conflict in a single call.
    """
    db: Session = SessionLocal()
    try:
        # Pre-cleanup
        existing_p = db.query(ProfileModel).filter(ProfileModel.email == "upsert_test_candidate@test.com").first()
        if existing_p:
            db.query(MatchModel).filter(MatchModel.profile_id == existing_p.id).delete()
            db.query(ProfileModel).filter(ProfileModel.id == existing_p.id).delete()
            db.commit()

        # Create test profile
        profile = ProfileModel(
            name="Upsert Test Candidate",
            email="upsert_test_candidate@test.com",
            skills=["Python", "FastAPI"],
            experience_years=3.0,
            domains=["backend"]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Create 2 test jobs
        job1 = JobModel(company="Test Co 1", role_title="Backend Dev", required_skills=["Python"], status="active", link_status="live")
        job2 = JobModel(company="Test Co 2", role_title="Python Lead", required_skills=["Python", "FastAPI"], status="active", link_status="live")
        db.add_all([job1, job2])
        db.commit()
        db.refresh(job1)
        db.refresh(job2)

        # 1. Test Initial INSERT via bulk_upsert_matches
        rows_v1 = [
            {
                "job_id": job1.id,
                "profile_id": profile.id,
                "match_score": 75.0,
                "skill_overlap_score": 80.0,
                "domain_score": 70.0,
                "location_score": 100.0,
                "semantic_score": 50.0,
                "matching_skills": ["Python"],
                "matched_skills": ["Python"],
                "missing_skills": [],
                "matched_count": 1,
                "required_count": 1,
                "skill_match_percentage": 100.0
            },
            {
                "job_id": job2.id,
                "profile_id": profile.id,
                "match_score": 90.0,
                "skill_overlap_score": 95.0,
                "domain_score": 85.0,
                "location_score": 100.0,
                "semantic_score": 80.0,
                "matching_skills": ["Python", "FastAPI"],
                "matched_skills": ["Python", "FastAPI"],
                "missing_skills": [],
                "matched_count": 2,
                "required_count": 2,
                "skill_match_percentage": 100.0
            }
        ]

        bulk_upsert_matches(db, rows_v1)

        m1 = db.query(MatchModel).filter(MatchModel.profile_id == profile.id, MatchModel.job_id == job1.id).first()
        m2 = db.query(MatchModel).filter(MatchModel.profile_id == profile.id, MatchModel.job_id == job2.id).first()

        assert m1 is not None
        assert m1.match_score == 75.0
        assert m2 is not None
        assert m2.match_score == 90.0

        # 2. Test UPDATE via bulk_upsert_matches (same job_id, profile_id pairs with updated scores)
        rows_v2 = [
            {
                "job_id": job1.id,
                "profile_id": profile.id,
                "match_score": 88.5,
                "skill_overlap_score": 90.0,
                "domain_score": 85.0,
                "location_score": 100.0,
                "semantic_score": 75.0,
                "matching_skills": ["Python"],
                "matched_skills": ["Python"],
                "missing_skills": [],
                "matched_count": 1,
                "required_count": 1,
                "skill_match_percentage": 100.0
            },
            {
                "job_id": job2.id,
                "profile_id": profile.id,
                "match_score": 95.0,
                "skill_overlap_score": 100.0,
                "domain_score": 90.0,
                "location_score": 100.0,
                "semantic_score": 90.0,
                "matching_skills": ["Python", "FastAPI"],
                "matched_skills": ["Python", "FastAPI"],
                "missing_skills": [],
                "matched_count": 2,
                "required_count": 2,
                "skill_match_percentage": 100.0
            }
        ]

        bulk_upsert_matches(db, rows_v2)

        # Verify rows updated, not duplicated
        total_matches = db.query(MatchModel).filter(MatchModel.profile_id == profile.id).count()
        assert total_matches == 2

        m1_updated = db.query(MatchModel).filter(MatchModel.profile_id == profile.id, MatchModel.job_id == job1.id).first()
        assert m1_updated.match_score == 88.5

        # Cleanup
        db.query(MatchModel).filter(MatchModel.profile_id == profile.id).delete()
        db.query(JobModel).filter(JobModel.id.in_([job1.id, job2.id])).delete()
        db.query(ProfileModel).filter(ProfileModel.id == profile.id).delete()
        db.commit()
    finally:
        db.close()


def test_column_limited_fetch_scoring_parity():
    """
    Verifies that the column-limited JobModel query yields identical compute_match results
    compared to full ORM object fetch.
    """
    db: Session = SessionLocal()
    try:
        # Pre-cleanup
        existing_p = db.query(ProfileModel).filter(ProfileModel.email == "parity_test_candidate@test.com").first()
        if existing_p:
            db.query(MatchModel).filter(MatchModel.profile_id == existing_p.id).delete()
            db.query(ProfileModel).filter(ProfileModel.id == existing_p.id).delete()
            db.commit()

        import re
        from backend.app.security.encryption import encrypt_field
        raw_text = "Senior Backend Engineer proficient in Python, SQL databases, and Docker containerization."
        stopwords = {"the", "and", "a", "to", "in", "is", "for", "with", "on", "at", "by", "of", "an", "be", "as", "are", "or", "our", "we", "you", "your"}
        prof_words = set(re.findall(r'\w+', raw_text.lower())) - stopwords

        profile = ProfileModel(
            name="Parity Candidate",
            email="parity_test_candidate@test.com",
            skills=["Python", "SQL", "Docker"],
            experience_years=4.0,
            domains=["backend"],
            raw_resume_text=encrypt_field(raw_text)
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        job = JobModel(
            company="Acme Cloud Systems",
            role_title="Senior Python Engineer",
            location="Bengaluru",
            remote=True,
            required_skills=["Python", "SQL", "Docker"],
            domain="backend",
            description="Looking for an experienced Python developer with SQL knowledge and Docker skills.",
            is_technical=True,
            source_trust_tier="tier1_verified",
            apply_url="https://acme.com/apply/123",
            apply_url_raw="https://acme.com/raw/123",
            apply_url_resolved="https://acme.com/resolved/123",
            authenticity_flags=["verified_company_domain"],
            status="active",
            link_status="live"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        profile_dict = {
            "name": profile.name,
            "email": profile.email,
            "location": profile.location or {},
            "skills": profile.skills,
            "experience_years": profile.experience_years,
            "domains": profile.domains,
            "raw_resume_text": prof_words
        }

        # 1. Score with column-limited job dict
        column_limited_job_dict = {
            "company": job.company,
            "role_title": job.role_title,
            "location": job.location,
            "remote": job.remote,
            "required_skills": job.required_skills,
            "domain": job.domain,
            "description": job.description,
            "is_technical": job.is_technical,
            "source_trust_tier": job.source_trust_tier
        }
        res_expected = compute_match(profile_dict, column_limited_job_dict)

        # 2. Execute matching pipeline which uses load_only column reduction
        run_matching_pipeline(db, profile, max_jobs_to_match=None)

        match_in_db = db.query(MatchModel).filter(MatchModel.profile_id == profile.id, MatchModel.job_id == job.id).first()
        assert match_in_db is not None
        print(f"DEBUG EXPECTED: {res_expected}")
        print(f"DEBUG IN DB: match_score={match_in_db.match_score}, skill_overlap={match_in_db.skill_overlap_score}, domain={match_in_db.domain_score}, location={match_in_db.location_score}, semantic={match_in_db.semantic_score}")
        assert match_in_db.match_score == res_expected["match_score"]
        assert match_in_db.skill_overlap_score == res_expected["skill_overlap_score"]
        assert match_in_db.domain_score == res_expected["domain_score"]
        assert match_in_db.matched_skills == res_expected["matched_skills"]

        # Cleanup
        db.query(MatchModel).filter(MatchModel.profile_id == profile.id).delete()
        db.query(JobModel).filter(JobModel.id == job.id).delete()
        db.query(ProfileModel).filter(ProfileModel.id == profile.id).delete()
        db.commit()
    finally:
        db.close()
