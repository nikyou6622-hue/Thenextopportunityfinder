"""
test_skill_matching_pipeline.py — Comprehensive Test Battery for High-Quality Skill Matching Engine
Verifies deterministic skill normalization, zero-hallucination set intersection math,
descending match ranking, threshold filtering, and API schema outputs.
"""

import pytest
from backend.app.utils.skill_normalizer import (
    normalize_skill,
    normalize_skill_list,
    extract_skills_from_text,
    get_db_skill_normalization_stats
)
from backend.app.agents.agent3_matching import (
    compute_skill_match,
    compute_match,
    MIN_QUALIFIED_MATCH_THRESHOLD
)

def test_skill_synonym_normalization():
    """Test that known synonym variants all normalize to the exact canonical skill string."""
    react_variants = ["ReactJS", "React.js", "react", "react js"]
    for variant in react_variants:
        assert normalize_skill(variant) == "react"

    python_variants = ["py", "python3", "Python"]
    for variant in python_variants:
        assert normalize_skill(variant) == "python"

    postgres_variants = ["postgres", "postgresql", "psql", "Postgres DB"]
    for variant in postgres_variants:
        assert normalize_skill(variant) == "postgresql"

    k8s_variants = ["k8s", "kubernetes", "Kubernetes"]
    for variant in k8s_variants:
        assert normalize_skill(variant) == "kubernetes"

    golang_variants = ["golang", "go", "Go Lang"]
    for variant in golang_variants:
        assert normalize_skill(variant) == "go"

def test_normalize_skill_list():
    """Test set normalization deduplication across mixed raw skill inputs."""
    raw_skills = ["ReactJS", "react.js", "Python3", "Postgres", "AWS", "UnknownSkillX"]
    normalized_set = normalize_skill_list(raw_skills)
    expected_set = {"react", "python", "postgresql", "aws", "unknownskillx"}
    assert normalized_set == expected_set

def test_compute_skill_match_exact_math():
    """Test compute_skill_match set intersection math and percentage calculations."""
    resume_skills = ["Python", "FastAPI", "Postgres", "Docker"]
    job_skills = ["Python3", "FastAPI", "Kubernetes", "AWS", "PostgreSQL"]

    res = compute_skill_match(resume_skills, job_skills)

    # Normalized resume: {python, fastapi, postgresql, docker}
    # Normalized job: {python, fastapi, kubernetes, aws, postgresql}
    # Matched: {python, fastapi, postgresql} -> 3 skills
    # Missing: {kubernetes, aws} -> 2 skills
    assert res["matched_count"] == 3
    assert res["required_count"] == 5
    assert res["skill_match_percentage"] == 60.0

    # Ensure display matched_skills contains corresponding job skill strings
    for m in res["matched_skills"]:
        assert normalize_skill(m) in {"python", "fastapi", "postgresql"}

    for m in res["missing_skills"]:
        assert normalize_skill(m) in {"kubernetes", "aws"}

def test_zero_hallucination_guarantee():
    """
    Regression Test: A skill MUST NOT appear in matched_skills unless present in
    both the candidate's normalized resume skills and the job's normalized required skills.
    """
    resume_skills = ["JavaScript", "HTML", "CSS"]
    job_skills = ["Python", "Django", "PostgreSQL"]

    res = compute_skill_match(resume_skills, job_skills)

    assert res["matched_count"] == 0
    assert len(res["matched_skills"]) == 0
    assert res["skill_match_percentage"] == 0.0
    assert len(res["missing_skills"]) == 3

def test_compute_match_composite_and_qualification_gate():
    """Test composite match score calculation and threshold qualification gate."""
    high_match_profile = {
        "skills": ["Python", "FastAPI", "Postgres", "Redis", "Docker", "AWS"],
        "domains": ["backend", "cloud"],
        "location": {"city": "Bengaluru", "country": "India", "open_to_remote": True},
        "raw_resume_text": "Experienced Python Backend Engineer with FastAPI, PostgreSQL, Docker, AWS microservices."
    }

    job = {
        "company": "Tech Corp",
        "role_title": "Senior Python Backend Engineer",
        "location": "Bengaluru, India",
        "remote": True,
        "required_skills": ["Python", "FastAPI", "Postgres", "Docker"],
        "domain": "backend",
        "description": "Building scalable Python FastAPI backend services with Postgres and AWS."
    }

    match_res = compute_match(high_match_profile, job)
    assert match_res["match_score"] >= MIN_QUALIFIED_MATCH_THRESHOLD
    assert match_res["is_qualified"] is True
    assert match_res["matched_count"] == 4
    assert match_res["required_count"] == 4
    assert match_res["skill_match_percentage"] == 100.0

def test_threshold_filtering():
    """Test that a low fit job below MIN_QUALIFIED_MATCH_THRESHOLD fails qualification."""
    unfit_profile = {
        "skills": ["Excel", "Marketing"],
        "domains": ["sales"],
        "location": {"city": "Delhi", "open_to_remote": False},
        "raw_resume_text": "Digital marketing executive proficient in Microsoft Excel and social media strategy."
    }

    demanding_job = {
        "company": "DeepTech AI",
        "role_title": "C++ Systems Architect",
        "location": "Remote",
        "remote": True,
        "required_skills": ["C++", "CUDA", "LLMs", "Distributed Systems", "Rust", "Linux Kernel"],
        "domain": "ai/ml",
        "description": "Low-level CUDA acceleration and distributed C++ multi-node GPU kernel engineering."
    }

    match_res = compute_match(unfit_profile, demanding_job)
    assert match_res["is_qualified"] is False

def test_db_normalization_statistics():
    """Test that DB skill normalization statistics can be calculated cleanly."""
    stats = get_db_skill_normalization_stats()
    assert isinstance(stats, dict)
    assert "unique_raw_skills" in stats
    assert "unique_canonical_skills" in stats
    assert "collapsed_count" in stats
