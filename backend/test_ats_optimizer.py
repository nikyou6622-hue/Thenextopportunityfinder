import sys
import os
import json

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.agents.agent1_parser import compute_ats_score

def test_compute_ats_score_logic():
    print("Testing compute_ats_score logic...")
    sample_profile = {
        "name": "Jane Doe",
        "email": "jane@tech.io",
        "phone": "+1 555 123 4567",
        "location": {"city": "New York", "country": "USA"},
        "skills": ["Python", "FastAPI", "React", "TypeScript", "Postgres", "Docker", "AWS", "GraphQL"],
        "summary": "Experienced Full Stack Engineer with 4 years building high performance SaaS applications and REST microservices.",
        "experience_list": [
            {
                "title": "Senior Engineer",
                "company": "Tech Corp",
                "duration_months": 24,
                "description": "Engineered Python FastAPI microservices, scaling backend throughput by 45% and managing $100k cloud infrastructure."
            }
        ],
        "domains": ["saas", "fintech"],
        "education": [{"degree": "B.S.", "field": "Computer Science"}]
    }

    eval_result = compute_ats_score(sample_profile)
    print("ATS Total Score:", eval_result["total_score"])
    print("Tier:", eval_result["tier"])
    print("Breakdown:", eval_result["breakdown"])
    print("Recommendations:", eval_result["recommendations"])

    assert eval_result["total_score"] >= 80, f"Expected high ATS score, got {eval_result['total_score']}"
    assert eval_result["tier"] == "Excellent"
    print("[OK] compute_ats_score logic passed!")

def test_target_job_benchmarking():
    print("Testing target job benchmarking...")
    sample_profile = {
        "name": "Jane Doe",
        "skills": ["Python", "FastAPI", "React"],
        "summary": "Full stack dev"
    }
    target_job = {
        "role_title": "Senior Python Engineer",
        "company": "AI Innovations",
        "required_skills": ["Python", "FastAPI", "Docker", "Kubernetes", "AWS"]
    }

    eval_result = compute_ats_score(sample_profile, target_job=target_job)
    benchmark = eval_result.get("job_benchmark")
    print("Job Benchmark:", benchmark)
    assert benchmark is not None
    assert benchmark["role_title"] == "Senior Python Engineer"
    assert "Docker" in benchmark["missing_skills"]
    assert "Python" in benchmark["matching_skills"]
    print("[OK] Target job benchmarking test passed!")

def test_api_endpoints():
    print("Testing API endpoints...")
    client = TestClient(app)

    # 1. Test POST /api/profile/ats-score
    res = client.post("/api/profile/ats-score", json={
        "name": "Alex Mercer",
        "email": "alex@dev.io",
        "phone": "+1 555 999 8888",
        "skills": ["Python", "React", "Docker", "Postgres", "GraphQL", "TailwindCSS"],
        "summary": "Lead Software Architect with 5+ years of experience leading engineering teams and building cloud platforms."
    })
    assert res.status_code == 200, f"API failed with status {res.status_code}: {res.text}"
    data = res.json()
    assert "total_score" in data
    assert "breakdown" in data
    print("[OK] POST /api/profile/ats-score endpoint passed!")

    # 2. Test POST /api/profile
    post_res = client.post("/api/profile", json={
        "name": "Alex Mercer",
        "email": "alex@dev.io",
        "phone": "+1 555 999 8888",
        "location": {"city": "Austin", "country": "USA", "open_to_remote": True},
        "skills": ["Python", "React", "FastAPI", "Docker", "Postgres", "AWS"],
        "experience_years": 4.0,
        "summary": "Lead Engineer building scalable microservices and user interfaces with FastAPI and React.",
        "experience_list": [
            {
                "title": "Lead Software Engineer",
                "company": "SaaS Platform Inc",
                "duration_months": 36,
                "description": "Architected distributed systems, increasing system uptime to 99.99% and reducing latency by 40%."
            }
        ],
        "education": [{"degree": "Bachelor of Science", "field": "Computer Science"}],
        "domains": ["saas", "developer tools"]
    })
    assert post_res.status_code == 200, f"POST /api/profile failed: {post_res.text}"
    profile_data = post_res.json()
    assert profile_data["name"] == "Alex Mercer"
    assert profile_data["summary"] is not None
    assert profile_data["ats_score"] > 0
    print("[OK] POST /api/profile endpoint passed!")

    # 3. Test GET /api/profile
    get_res = client.get("/api/profile")
    assert get_res.status_code == 200
    fetched_profile = get_res.json()
    assert fetched_profile["name"] == "Alex Mercer"
    assert len(fetched_profile["skills"]) >= 5
    print("[OK] GET /api/profile endpoint passed!")

if __name__ == "__main__":
    test_compute_ats_score_logic()
    test_target_job_benchmarking()
    test_api_endpoints()
    print("\nALL AUTOMATED TESTS PASSED SUCCESSFULLY!")
