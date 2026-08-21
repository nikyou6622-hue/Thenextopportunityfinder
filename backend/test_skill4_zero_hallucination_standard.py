"""
test_skill4_zero_hallucination_standard.py — Verification Test Suite for Skill 4 Standard
Verifies:
1. Handling of explicit None values (vs missing keys) without crashing.
2. Neutral placeholder enforcement (no fabricated companies, degrees, dates, or bullet points).
3. Operator precedence in quality analysis corpus builder (non-list achievements preservation).
4. PDF generator integrity (ReportLab density-aware output with %PDF- magic bytes).
5. Type mismatch resilience (string skills, string experience_years).
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.agents.agent4_export_generator import (
    generate_md_resume,
    generate_docx_resume,
    generate_pdf_resume,
    analyze_content_quality,
    get_missing_fields,
    NEUTRAL_PLACEHOLDERS
)
from backend.app.agents.agent4_tailor import tailor_resume_for_job

def test_explicit_none_handling():
    print("[TEST 1] Explicit None vs Missing-Key Handling across all export formats...")
    
    # Profile with explicit None in all nullable fields
    none_profile = {
        "name": None,
        "email": None,
        "phone": None,
        "location": None,
        "summary": None,
        "skills": None,
        "experience_years": None,
        "past_roles": None,
        "experience_list": [
            {
                "title": None,
                "company": None,
                "start_date": None,
                "end_date": None,
                "description": None,
                "achievements": None,
                "technologies": None
            }
        ],
        "education": None,
        "education_list": [
            {
                "institution": None,
                "degree": None,
                "field_of_study": None,
                "graduation_date": None,
                "gpa": None
            }
        ],
        "projects": [
            {
                "title": None,
                "description": None,
                "technologies": None
            }
        ]
    }

    # 1. Markdown Export with None fields
    md_output = generate_md_resume(none_profile)
    assert md_output is not None
    assert NEUTRAL_PLACEHOLDERS["name"] in md_output
    assert NEUTRAL_PLACEHOLDERS["company"] in md_output
    print("  -> Markdown export with all None fields: PASS [OK]")

    # 2. DOCX Export with None fields
    docx_bytes = generate_docx_resume(none_profile)
    assert docx_bytes is not None and len(docx_bytes) > 500
    print("  -> DOCX export with all None fields: PASS [OK]")

    # 3. PDF Export with None fields
    pdf_bytes = generate_pdf_resume(none_profile)
    assert pdf_bytes is not None and pdf_bytes.startswith(b"%PDF-")
    print("  -> PDF export with all None fields (magic bytes verified): PASS [OK]")

    # 4. Quality Analysis with None fields
    quality = analyze_content_quality(none_profile)
    assert quality is not None
    assert "quality_score" in quality
    print("  -> Quality analysis with all None fields: PASS [OK]")

    print("  [PASS] Explicit None handling verified without crashes.\n")


def test_neutral_placeholders_and_zero_fabrication():
    print("[TEST 2] Neutral Placeholders & Zero Fabrication Check...")
    
    empty_profile = {}
    
    # Generate exports
    md_text = generate_md_resume(empty_profile)
    missing = get_missing_fields(empty_profile)
    
    # Must identify missing fields accurately
    assert "name" in missing
    assert "summary" in missing
    assert "skills" in missing
    assert "experience" in missing
    assert "education" in missing

    # Must contain ONLY neutral placeholders, NEVER fabricated facts
    assert "[Your Name]" in md_text
    assert "[Add skills]" in md_text
    
    # Check that fabricated strings NEVER appear
    forbidden_fabrications = [
        "Built scalable backend services",
        "Bachelor of Science",
        "Stanford University",
        "Google Inc",
        "increased efficiency by",
        "managed a team of"
    ]
    for forbidden in forbidden_fabrications:
        assert forbidden.lower() not in md_text.lower(), f"Fabricated string '{forbidden}' detected in output!"

    print("  -> Zero fabrication verified against forbidden string catalog: PASS [OK]")
    print("  [PASS] Neutral placeholder standard strictly enforced.\n")


def test_operator_precedence_in_skill_substantiation():
    print("[TEST 3] Operator Precedence in Quality Analysis Corpus Builder...")
    
    # Profile where achievements is None, but title and description mention "FastAPI" and "PostgreSQL"
    profile = {
        "skills": ["FastAPI", "PostgreSQL", "Docker", "UnusedSkillXYZ"],
        "experience_list": [
            {
                "title": "FastAPI Backend Specialist",
                "company": "API Works",
                "description": "Architected high-throughput services using PostgreSQL.",
                "achievements": None  # Non-list test case to verify ternary parenthesization!
            }
        ],
        "projects": [
            {
                "title": "Docker Container Project",
                "description": "Deployed microservices using Docker containers."
            }
        ]
    }

    quality = analyze_content_quality(profile)
    suggestions = quality["suggestions"]
    
    # FastAPI, PostgreSQL, and Docker MUST be recognized as substantiated
    unsubstantiated = [s["detail"] for s in suggestions if s["issue"] == "unsubstantiated_skill"]
    
    assert any("UnusedSkillXYZ" in u for u in unsubstantiated), "UnusedSkillXYZ should be flagged as unsubstantiated"
    assert not any("FastAPI" in u for u in unsubstantiated), "FastAPI was in title, must NOT be flagged as unsubstantiated!"
    assert not any("PostgreSQL" in u for u in unsubstantiated), "PostgreSQL was in description, must NOT be flagged!"
    assert not any("Docker" in u for u in unsubstantiated), "Docker was in projects, must NOT be flagged!"

    print("  -> Title, description, and project skills correctly substantiated despite achievements=None: PASS [OK]")
    print("  [PASS] Operator precedence bug verified as fixed.\n")


def test_pdf_magic_bytes_and_reportlab_integrity():
    print("[TEST 4] PDF Generator Integrity (%PDF- magic bytes check)...")
    
    profile = {
        "name": "Aditya Tamta",
        "summary": "Experienced Full Stack Engineer with expertise in FastAPI and React.",
        "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
        "experience_list": [
            {
                "title": "Software Engineer",
                "company": "Tech Corp",
                "start_date": "2023",
                "end_date": "Present",
                "description": "Built resilient backend microservices with 99.9% uptime.",
                "achievements": ["Reduced latency by 40ms", "Engineered real-time notification engine"]
            }
        ],
        "education_list": [
            {
                "institution": "Tech Institute",
                "degree": "B.Tech",
                "field_of_study": "Computer Science",
                "graduation_date": "2023"
            }
        ]
    }

    pdf_bytes = generate_pdf_resume(profile)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-"), "Generated PDF must start with %PDF- binary header!"
    assert len(pdf_bytes) > 1000, "PDF payload must be substantial"
    
    print(f"  -> Generated PDF size: {len(pdf_bytes)} bytes with valid magic header [OK]")
    print("  [PASS] PDF generator integrity verified.\n")


def test_type_mismatch_resilience():
    print("[TEST 5] Type Mismatch Resilience (string skills, string exp_years)...")
    
    mismatched_profile = {
        "name": "Type Test Candidate",
        "experience_years": "3.5", # string instead of float
        "skills": "Python, SQL, AWS", # string instead of list
        "experience_list": "Single role string instead of list",
        "education_list": "B.Tech in CS"
    }

    # Should normalize gracefully without crash
    md_output = generate_md_resume(mismatched_profile)
    assert md_output is not None
    assert "Type Test Candidate" in md_output

    # Tailoring function with mismatched types
    job = {"role_title": "Backend Dev", "company": "TypeSafe", "description": "Need Python and SQL"}
    match = {"matching_skills": ["Python", "SQL"], "missing_skills": []}
    tailored = tailor_resume_for_job(mismatched_profile, job, match)
    
    assert tailored is not None
    assert "tailored_summary" in tailored
    assert "TypeSafe" in tailored["tailored_summary"]
    
    print("  -> Handled string skills, string experience_years, string experience_list gracefully: PASS [OK]")
    print("  [PASS] Type mismatch resilience verified.\n")


def main():
    print("=" * 70)
    print("       NEXTOPPORTUNITYFIND — SKILL 4 VERIFICATION TEST SUITE")
    print("=" * 70 + "\n")

    test_explicit_none_handling()
    test_neutral_placeholders_and_zero_fabrication()
    test_operator_precedence_in_skill_substantiation()
    test_pdf_magic_bytes_and_reportlab_integrity()
    test_type_mismatch_resilience()

    print("=" * 70)
    print(" [ALL TESTS PASSED] Skill 4 (Zero-Hallucination) Standard Verified!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
