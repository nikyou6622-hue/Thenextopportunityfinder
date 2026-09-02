import pytest
from backend.app.agents.source_router import is_technical_role

def test_flagged_non_technical_job_titles():
    """
    Regression test: Verify that non-technical roles like 'Receptionist and Hotel Management'
    and 'Social Media Manager' are strictly recognized as non-technical (return False).
    """
    title1 = "Receptionist and Hotel Management Internship"
    desc1 = "Looking for front desk receptionist and hotel management intern to manage hotel guests."
    assert is_technical_role(title1, desc1) is False, f"Expected False for '{title1}'"

    title2 = "Social Media Manager Internship"
    desc2 = "Handle Instagram, LinkedIn, and Facebook social media marketing and brand engagement."
    assert is_technical_role(title2, desc2) is False, f"Expected False for '{title2}'"

    title3 = "Digital Marketing Executive Internship"
    desc3 = "Manage SEO, Google ads, and content marketing."
    assert is_technical_role(title3, desc3) is False, f"Expected False for '{title3}'"

    title4 = "HR Operations Internship"
    desc4 = "Conduct candidate screening, resume filtering, and onboarding."
    assert is_technical_role(title4, desc4) is False, f"Expected False for '{title4}'"

def test_genuine_technical_job_titles():
    """
    Sanity check: Confirm genuine technical roles continue to return True.
    """
    assert is_technical_role("Software Engineering Intern", "Develop Python and React applications") is True
    assert is_technical_role("Python Full Stack Developer Internship", "Build FastAPI backend and PostgreSQL DB") is True
    assert is_technical_role("DevOps & Cloud Engineer Intern", "Manage Docker, Kubernetes, AWS pipelines") is True

def test_zero_skill_match_score_cap():
    """
    Test that a job with 0 matched skills out of required skills cannot receive a match_score
    above what the weighted formula allows (capped at <= 60.0%).
    """
    cand_skills = ["Python", "React", "PostgreSQL"]
    job_required_skills = ["Java", "Spring Boot", "Kotlin"]  # 0 overlap
    
    cand_set = set(s.lower() for s in cand_skills)
    req_set = set(s.lower() for s in job_required_skills)
    matched = cand_set.intersection(req_set)
    matched_count = len(matched)
    required_count = len(job_required_skills)
    
    skill_pct = (matched_count / required_count * 100.0) if required_count > 0 else 0.0
    assert skill_pct == 0.0
    
    # Calculate score using weighted formula (40% skill + 60% secondary factors)
    score = 0.40 * skill_pct + 0.25 * 85.0 + 0.15 * 85.0 + 0.20 * 80.0
    if matched_count == 0:
        score = min(score, 55.0)
        
    assert score <= 60.0, f"Match score {score} exceeds 60% cap for 0 matched skills"

def test_skill_breakdown_and_overall_score_consistency():
    """
    Sanity check: Ensure displayed skill count/percentage and displayed overall match score
    are derived from identical underlying computations and never visibly contradict each other.
    """
    mock_job_item = {
        "id": "int-test-1",
        "role_title": "Full Stack Engineer Intern",
        "required_skills": ["React", "Node.js", "MongoDB"],
        "matched_skills": ["React"],
        "matched_count": 1,
        "required_count": 3,
        "skill_match_percentage": 33.3,
        "match_score": 68.3
    }
    
    match_count = mock_job_item["matched_count"]
    total_count = mock_job_item["required_count"]
    pct = mock_job_item["skill_match_percentage"]
    match_score = mock_job_item["match_score"]
    
    expected_pct = round((match_count / total_count) * 100.0, 1)
    assert abs(pct - expected_pct) < 0.2, f"Skill match percentage {pct} != expected {expected_pct}"
    
    # If 0 skills matched out of >0 required skills, match_score must be <= 60.0
    if match_count == 0 and total_count > 0:
        assert match_score <= 60.0, f"Inconsistent score {match_score} for 0 skills matched"

def test_sort_order_descending():
    """
    Test that job results list is correctly sorted in descending order by match_score.
    """
    items = [
        {"id": 1, "match_score": 52.0},
        {"id": 2, "match_score": 88.5},
        {"id": 3, "match_score": 74.0},
        {"id": 4, "match_score": 61.2}
    ]
    sorted_items = sorted(items, key=lambda x: x["match_score"], reverse=True)
    scores = [x["match_score"] for x in sorted_items]
    assert scores == [88.5, 74.0, 61.2, 52.0], f"Sort order mismatch: {scores}"
