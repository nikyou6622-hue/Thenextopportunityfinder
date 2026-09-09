import sys
import json
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, ".")

from backend.app.main import app
from backend.app.db.database import SessionLocal
from backend.app.db.models import MatchSessionModel, JobModel, UserModel, ProfileModel

def test_match_sessions_pipeline_and_staleness():
    client = TestClient(app)
    db = SessionLocal()

    # Seed test jobs and internships to ensure non-zero match counts
    print("\n--- 0. Seeding Test Jobs & Internships ---")
    j1 = JobModel(
        company="TechCorp AI",
        role_title="Python FastAPI Backend Engineer",
        location="Remote",
        remote=True,
        required_skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
        domain="backend",
        role_type="full-time",
        source_category="startup",
        status="active",
        link_status="live",
        apply_url="https://techcorp.ai/careers/1"
    )
    j2 = JobModel(
        company="CloudScale Systems",
        role_title="React Frontend Developer",
        location="Bengaluru",
        remote=True,
        required_skills=["React", "TypeScript", "TailwindCSS"],
        domain="frontend",
        role_type="full-time",
        source_category="startup",
        status="active",
        link_status="live",
        apply_url="https://cloudscale.io/careers/2"
    )
    j3 = JobModel(
        company="IndiaTech Interns",
        role_title="Backend Engineering Intern",
        location="Remote",
        remote=True,
        required_skills=["Python", "FastAPI", "React"],
        domain="backend",
        role_type="internship",
        source_category="internship_india",
        status="active",
        link_status="live",
        apply_url="https://internshala.com/internship/detail/3"
    )
    db.add_all([j1, j2, j3])
    db.commit()
    db.refresh(j1)
    db.refresh(j2)
    db.refresh(j3)

    print(f"Seeded jobs IDs: j1={j1.id}, j2={j2.id}, j3(internship)={j3.id}")

    print("\n--- 1. Testing Resume Upload & Match Session Creation ---")
    profile_payload_1 = {
        "name": "Match Session Candidate Test 1",
        "email": f"candidate_{j1.id}@dev.io",
        "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
        "experience_years": 2.0,
        "summary": "Full Stack Software Engineer building FastAPI microservices and React web apps."
    }

    res1 = client.post("/api/profile/upload", json=profile_payload_1)
    assert res1.status_code == 200, f"Upload 1 failed: {res1.text}"
    data1 = res1.json()
    
    session_id_1 = data1.get("match_session_id")
    total_jobs_1 = data1.get("total_jobs", 0)
    total_internships_1 = data1.get("total_internships", 0)

    print(f"Upload 1 Success! Match Session ID: {session_id_1} | Jobs: {total_jobs_1} | Internships: {total_internships_1}")
    assert session_id_1 is not None, "match_session_id must not be None"
    assert total_jobs_1 >= 1, "Must match at least 1 job"
    assert total_internships_1 >= 1, "Must match at least 1 internship"

    # Verify session row exists in DB
    sess_row_1 = db.query(MatchSessionModel).filter(MatchSessionModel.id == session_id_1).first()
    assert sess_row_1 is not None, "MatchSessionModel row must exist in DB"
    assert len(sess_row_1.matched_job_ids) == total_jobs_1
    assert len(sess_row_1.matched_internship_ids) == total_internships_1

    print("\n--- 2. Testing Match Session Endpoint GET /api/match-session/{id} ---")
    res_get_sess = client.get(f"/api/match-session/{session_id_1}")
    assert res_get_sess.status_code == 200
    sess_data = res_get_sess.json()
    assert sess_data["id"] == session_id_1
    assert sess_data["total_jobs"] == total_jobs_1
    assert sess_data["total_internships"] == total_internships_1

    print("\n--- 3. Testing Re-Upload & Immutable Match Session History ---")
    profile_payload_2 = {
        "name": "Match Session Candidate Test 1",
        "email": f"candidate_{j1.id}@dev.io",
        "skills": ["Java", "Spring Boot", "Kafka"],
        "experience_years": 4.0,
        "summary": "Senior Backend Systems Engineer working with Java Spring Boot microservices."
    }

    res2 = client.post("/api/profile/upload", json=profile_payload_2)
    assert res2.status_code == 200
    data2 = res2.json()

    session_id_2 = data2.get("match_session_id")
    total_jobs_2 = data2.get("total_jobs", 0)
    total_internships_2 = data2.get("total_internships", 0)

    print(f"Upload 2 Success! New Match Session ID: {session_id_2} | Jobs: {total_jobs_2} | Internships: {total_internships_2}")
    assert session_id_2 is not None and session_id_2 != session_id_1, "Re-upload must create a NEW distinct session ID"

    # Verify session 1 still exists unchanged in DB
    old_sess_row = db.query(MatchSessionModel).filter(MatchSessionModel.id == session_id_1).first()
    assert old_sess_row is not None, "Original match session must remain intact"
    assert old_sess_row.total_jobs == total_jobs_1, "Original match session count must not be corrupted"

    print("\n--- 4. Testing Filtered Jobs Discovery API GET /api/jobs?match_session_id={id} ---")
    res_filtered_jobs = client.get(f"/api/jobs?match_session_id={session_id_1}&limit=500")
    assert res_filtered_jobs.status_code == 200
    filtered_jobs = res_filtered_jobs.json()
    print(f"Returned {len(filtered_jobs)} filtered jobs for session {session_id_1}")

    assert len(filtered_jobs) > 0, "Filtered jobs endpoint should return jobs for session 1"
    allowed_ids_1 = set(sess_row_1.matched_job_ids)
    for job in filtered_jobs:
        assert job["id"] in allowed_ids_1, f"Job ID {job['id']} must be in match session 1 allowed set"

    print("\n--- 5. Testing Live Link Staleness Handling ---")
    target_job_id = sess_row_1.matched_job_ids[0]
    job_to_mark = db.query(JobModel).filter(JobModel.id == target_job_id).first()
    if job_to_mark:
        original_status = job_to_mark.link_status
        job_to_mark.link_status = "dead"
        db.commit()

        # Query filtered jobs endpoint again
        res_after_dead = client.get(f"/api/jobs?match_session_id={session_id_1}&limit=500")
        assert res_after_dead.status_code == 200
        jobs_after_dead = res_after_dead.json()
        job_ids_after_dead = set(j["id"] for j in jobs_after_dead)

        assert target_job_id not in job_ids_after_dead, f"Dead job {target_job_id} must be excluded from live filtered view"
        assert len(jobs_after_dead) == len(filtered_jobs) - 1, f"Filtered count must adjust from {len(filtered_jobs)} to {len(filtered_jobs) - 1}"
        print(f"Staleness test passed! Dead job {target_job_id} correctly omitted and filtered count adjusted naturally from {len(filtered_jobs)} to {len(jobs_after_dead)}.")

        # Restore original link status
        job_to_mark.link_status = original_status
        db.commit()

    db.close()
    print("\n=== ALL MATCH SESSION & STALENESS TESTS PASSED 100%! ===")

if __name__ == "__main__":
    test_match_sessions_pipeline_and_staleness()
