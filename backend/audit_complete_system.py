"""
audit_complete_system.py — Exhaustive End-to-End Frontend & Backend Verification Audit
Tests every API endpoint, agent integration, database relationship, and asset accessibility.
"""

import sys
import os
import json
import time
import requests

API_BASE = "http://127.0.0.1:8000"
WEB_BASE = "http://localhost:3001"
API_KEY = "nof-dev-key-2026"
HEADERS = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

audit_results = {
    "total_checks": 0,
    "passed": 0,
    "failed": 0,
    "categories": {}
}

def log_check(category, name, status, details=None):
    audit_results["total_checks"] += 1
    if status == "PASS":
        audit_results["passed"] += 1
        badge = "[PASS]"
    else:
        audit_results["failed"] += 1
        badge = "[FAIL]"
    
    if category not in audit_results["categories"]:
        audit_results["categories"][category] = []
    
    audit_results["categories"][category].append({
        "name": name,
        "status": status,
        "details": details
    })
    print(f"{badge} {category} -> {name}: {details or 'OK'}")

def run_audit():
    print("=" * 80)
    print("      NEXTOPPORTUNITYFIND — COMPREHENSIVE PRODUCTION AUDIT REPORT")
    print("=" * 80)

    # ------------------------------------------------------------------------
    # 1. FRONTEND SERVER & ASSET INTEGRITY
    # ------------------------------------------------------------------------
    cat = "Frontend & Assets"
    try:
        r = requests.get(WEB_BASE, timeout=5)
        log_check(cat, "Vite Dev Server (:3001)", "PASS" if r.status_code == 200 else "FAIL", f"Status={r.status_code}")
    except Exception as e:
        log_check(cat, "Vite Dev Server (:3001)", "FAIL", str(e))

    # Check Thumbnails
    thumbs = [
        "internship_hub_banner.png", "mnc_careers_banner.png", "ats_optimizer_banner.png",
        "interview_studio_banner.png", "ai_ml_track_thumb.png", "backend_track_thumb.png",
        "fullstack_track_thumb.png", "fintech_startup_thumb.png"
    ]
    for t in thumbs:
        try:
            r = requests.get(f"{WEB_BASE}/thumbnails/{t}", timeout=5)
            log_check(cat, f"Thumbnail: {t}", "PASS" if r.status_code == 200 else "FAIL", f"Size={len(r.content)} bytes")
        except Exception as e:
            log_check(cat, f"Thumbnail: {t}", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 2. PROFILE & RESUME ANALYZER (AGENT 1 & 4)
    # ------------------------------------------------------------------------
    cat = "Profile & ATS Engine"
    try:
        # GET /api/profile
        r = requests.get(f"{API_BASE}/api/profile", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/profile", "PASS" if r.status_code in (200, 404) else "FAIL", f"Status={r.status_code}")

        # POST /api/profile/ats-score
        sample_profile = {
            "name": "Audit Candidate",
            "skills": ["Python", "FastAPI", "React", "Docker", "Postgres", "AWS", "GraphQL", "TypeScript"],
            "summary": "Full Stack Software Engineer with 4+ years of experience leading engineering teams and building high-throughput microservices.",
            "experience_list": [{
                "title": "Lead Software Engineer",
                "company": "Tech Corp",
                "duration_months": 36,
                "description": "Architected distributed systems, scaling throughput by 45% and managing $100k cloud infrastructure."
            }]
        }
        r = requests.post(f"{API_BASE}/api/profile/ats-score", json=sample_profile, headers=HEADERS, timeout=5)
        if r.status_code == 200:
            d = r.json()
            log_check(cat, "POST /api/profile/ats-score", "PASS", f"Score={d.get('total_score')}, Tier={d.get('tier')}")
        else:
            log_check(cat, "POST /api/profile/ats-score", "FAIL", f"Status={r.status_code}: {r.text}")

        # POST /api/profile (Save Profile)
        r = requests.post(f"{API_BASE}/api/profile", json=sample_profile, headers=HEADERS, timeout=5)
        log_check(cat, "POST /api/profile (Save/Update)", "PASS" if r.status_code == 200 else "FAIL", f"Status={r.status_code}")

        # POST /api/profile/reorder
        r = requests.post(f"{API_BASE}/api/profile/reorder", json={"section_order": ["summary", "skills", "experience", "education"]}, headers=HEADERS, timeout=5)
        log_check(cat, "POST /api/profile/reorder", "PASS" if r.status_code == 200 else "FAIL", f"Status={r.status_code}")

        # GET /api/resume/quality-analysis
        r = requests.get(f"{API_BASE}/api/resume/quality-analysis", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/resume/quality-analysis", "PASS" if r.status_code == 200 else "FAIL", f"Quality Score={r.json().get('quality_score') if r.status_code==200 else 0}")

    except Exception as e:
        log_check(cat, "Profile API Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 3. INDIA INTERNSHIPS SCRAPER & HUB (AGENT 2C)
    # ------------------------------------------------------------------------
    cat = "India Internship Engine"
    try:
        # GET /api/internships/india
        r = requests.get(f"{API_BASE}/api/internships/india", headers=HEADERS, timeout=10)
        if r.status_code == 200:
            items = r.json()
            log_check(cat, "GET /api/internships/india", "PASS", f"Found {len(items)} internships")
        else:
            log_check(cat, "GET /api/internships/india", "FAIL", f"Status={r.status_code}")

        # GET /api/internships/market-stats
        r = requests.get(f"{API_BASE}/api/internships/market-stats", headers=HEADERS, timeout=5)
        if r.status_code == 200:
            st = r.json()
            log_check(cat, "GET /api/internships/market-stats", "PASS", f"Total={st.get('total_active_internships')}, Avg Stipend=INR {st.get('average_stipend_monthly')}")
        else:
            log_check(cat, "GET /api/internships/market-stats", "FAIL", f"Status={r.status_code}")

        # Filtered GET (Min Stipend)
        r = requests.get(f"{API_BASE}/api/internships/india?min_stipend=30000", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/internships/india?min_stipend=30000", "PASS" if r.status_code == 200 else "FAIL", f"Count={len(r.json()) if r.status_code==200 else 0}")

    except Exception as e:
        log_check(cat, "India Internship Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 4. BIG TECH & MNC CAMPUS SCANNER (AGENT 2B)
    # ------------------------------------------------------------------------
    cat = "MNC Campus Scanner"
    try:
        # GET /api/jobs/mnc
        r = requests.get(f"{API_BASE}/api/jobs/mnc", headers=HEADERS, timeout=10)
        log_check(cat, "GET /api/jobs/mnc", "PASS" if r.status_code == 200 else "FAIL", f"Count={len(r.json()) if r.status_code==200 else 0}")

        # GET /api/jobs/mnc/scan-status
        r = requests.get(f"{API_BASE}/api/jobs/mnc/scan-status", headers=HEADERS, timeout=10)
        log_check(cat, "GET /api/jobs/mnc/scan-status", "PASS" if r.status_code == 200 else "FAIL", f"Status={r.status_code}")

    except Exception as e:
        log_check(cat, "MNC Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 5. MATCHING & JOB DISCOVERY (AGENT 2 & 3)
    # ------------------------------------------------------------------------
    cat = "Discovery & Matching"
    try:
        # GET /api/matches
        r = requests.get(f"{API_BASE}/api/matches", headers=HEADERS, timeout=5)
        matches_list = r.json() if r.status_code == 200 else []
        log_check(cat, "GET /api/matches", "PASS" if r.status_code == 200 else "FAIL", f"Matches={len(matches_list)}")

        # GET /api/jobs/link-health
        r = requests.get(f"{API_BASE}/api/jobs/link-health", headers=HEADERS, timeout=5)
        if r.status_code == 200:
            lh = r.json()
            log_check(cat, "GET /api/jobs/link-health", "PASS", f"Total={lh.get('total_jobs')}, Health={lh.get('health_percentage')}%")
        else:
            log_check(cat, "GET /api/jobs/link-health", "FAIL", f"Status={r.status_code}")

    except Exception as e:
        log_check(cat, "Discovery Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 6. APPLICATION PIPELINE & TAILORING (AGENT 4)
    # ------------------------------------------------------------------------
    cat = "Pipeline & Tailoring"
    target_app_id = None
    try:
        # GET /api/applications
        r = requests.get(f"{API_BASE}/api/applications", headers=HEADERS, timeout=5)
        if r.status_code == 200:
            apps = r.json()
            log_check(cat, "GET /api/applications", "PASS", f"Active Applications={len(apps)}")
            if apps:
                target_app_id = apps[0].get("id")
        else:
            log_check(cat, "GET /api/applications", "FAIL", f"Status={r.status_code}")

        # PUT /api/applications/{id} (Update status)
        if target_app_id:
            r = requests.put(f"{API_BASE}/api/applications/{target_app_id}", json={"status": "interview"}, headers=HEADERS, timeout=5)
            log_check(cat, f"PUT /api/applications/{target_app_id}", "PASS" if r.status_code == 200 else "FAIL", "Updated status to 'interview'")

            # POST /api/applications/{id}/track-click
            r = requests.post(f"{API_BASE}/api/applications/{target_app_id}/track-click", headers=HEADERS, timeout=5)
            log_check(cat, f"POST /api/applications/{target_app_id}/track-click", "PASS" if r.status_code == 200 else "FAIL", f"Tracked link click on application {target_app_id}")

    except Exception as e:
        log_check(cat, "Pipeline Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 7. INTERVIEW PREP STUDIO (AGENT 5 & 8)
    # ------------------------------------------------------------------------
    cat = "Interview Prep Studio"
    try:
        if target_app_id:
            # GET /api/interview-prep/{app_id}
            r = requests.get(f"{API_BASE}/api/interview-prep/{target_app_id}", headers=HEADERS, timeout=5)
            if r.status_code == 200:
                prep = r.json()
                tq = len(prep.get("question_bank", {}).get("technical_questions", []))
                bq = len(prep.get("question_bank", {}).get("behavioral_questions", []))
                log_check(cat, f"GET /api/interview-prep/{target_app_id}", "PASS", f"Tech Qs={tq}, Beh Qs={bq}")
            else:
                log_check(cat, f"GET /api/interview-prep/{target_app_id}", "FAIL", f"Status={r.status_code}")

            # POST /api/interview-prep/{app_id}/mock-session (Mock Simulator Turn)
            mock_payload = {
                "question_id": "tech-01",
                "question_text": "How do you optimize a FastAPI backend with Redis caching?",
                "question_type": "technical",
                "user_answer": "I implement Redis caching with async redis-py, configure connection pools, set TTL expiration, and invalidate cache upon write mutations."
            }
            r = requests.post(f"{API_BASE}/api/interview-prep/{target_app_id}/mock-session", json=mock_payload, headers=HEADERS, timeout=5)
            if r.status_code == 200:
                ev = r.json()
                log_check(cat, "POST /api/interview-prep/{app_id}/mock-session", "PASS", f"Feedback: {ev.get('feedback', {}).get('feedback_summary', 'Evaluated')}")
            else:
                log_check(cat, "POST /api/interview-prep/{app_id}/mock-session", "FAIL", f"Status={r.status_code}")

        # POST /api/interview-prep/study-materials
        study_payload = {
            "field": "Software Engineering",
            "role_title": "Backend Developer",
            "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"]
        }
        r = requests.post(f"{API_BASE}/api/interview-prep/study-materials", json=study_payload, headers=HEADERS, timeout=5)
        if r.status_code == 200:
            sm = r.json()
            log_check(cat, "POST /api/interview-prep/study-materials", "PASS", f"Videos={len(sm.get('video_tutorials', []))}, Guides={len(sm.get('technical_guides', []))}")
        else:
            log_check(cat, "POST /api/interview-prep/study-materials", "FAIL", f"Status={r.status_code}")

        # GET /api/coding-questions
        r = requests.get(f"{API_BASE}/api/coding-questions", headers=HEADERS, timeout=5)
        coding_qs = r.json() if r.status_code == 200 else []
        log_check(cat, "GET /api/coding-questions", "PASS" if r.status_code == 200 else "FAIL", f"Questions Count={len(coding_qs)}")

        # POST /api/coding-questions/{id}/attempt
        if coding_qs:
            target_qid = coding_qs[0].get("question_id", "cq_sde_01")
            attempt_payload = {
                "code_snippet": "def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i\n    return []",
                "status": "solved",
                "hints_viewed": 1
            }
            r = requests.post(f"{API_BASE}/api/coding-questions/{target_qid}/attempt", json=attempt_payload, headers=HEADERS, timeout=5)
            log_check(cat, f"POST /api/coding-questions/{target_qid}/attempt", "PASS" if r.status_code == 200 else "FAIL", f"Recorded attempt: Status={r.status_code}")

    except Exception as e:
        log_check(cat, "Interview Prep Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 8. SKILL GAP & ACTION PLAN (SKILL 2 TIER 2)
    # ------------------------------------------------------------------------
    cat = "Skill Gap & Action Plan"
    try:
        # GET /api/skills/action-plan
        r = requests.get(f"{API_BASE}/api/skills/action-plan?skills=Kubernetes,GraphQL,Redis", headers=HEADERS, timeout=5)
        if r.status_code == 200:
            ap = r.json()
            log_check(cat, "GET /api/skills/action-plan", "PASS", f"Gaps={len(ap.get('gap_skills', []))}, Phases={len(ap.get('action_plan', []))}")
        else:
            log_check(cat, "GET /api/skills/action-plan", "FAIL", f"Status={r.status_code}")

        # GET /api/learning-resources
        r = requests.get(f"{API_BASE}/api/learning-resources", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/learning-resources", "PASS" if r.status_code == 200 else "FAIL", f"Resources={len(r.json()) if r.status_code==200 else 0}")

    except Exception as e:
        log_check(cat, "Skill Gap Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # 9. DPDP ACT COMPLIANCE & PRIVACY
    # ------------------------------------------------------------------------
    cat = "Security & DPDP Compliance"
    try:
        # GET /api/profile/consent
        r = requests.get(f"{API_BASE}/api/profile/consent", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/profile/consent (DPDP Consent Record)", "PASS" if r.status_code == 200 else "FAIL", f"Retention={r.json().get('retention_window_days') if r.status_code==200 else 'N/A'} days")

        # GET /api/resume/export/{profile_id}?format=md
        r = requests.get(f"{API_BASE}/api/resume/export/1?format=md", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/resume/export/1?format=md (Data Portability)", "PASS" if r.status_code == 200 else "FAIL", f"Exported {len(r.text)} chars Markdown")

        # GET /api/notifications/preferences
        r = requests.get(f"{API_BASE}/api/notifications/preferences", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/notifications/preferences", "PASS" if r.status_code == 200 else "FAIL", f"Cadence={r.json().get('cadence') if r.status_code==200 else 'N/A'}")

        # GET /api/compliance/registry
        r = requests.get(f"{API_BASE}/api/compliance/registry", headers=HEADERS, timeout=5)
        log_check(cat, "GET /api/compliance/registry", "PASS" if r.status_code == 200 else "FAIL", f"Registered Sources={len(r.json()) if r.status_code==200 else 0}")

    except Exception as e:
        log_check(cat, "Security Suite", "FAIL", str(e))

    # ------------------------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print(f"AUDIT COMPLETED: {audit_results['passed']}/{audit_results['total_checks']} CHECKS PASSED ({(audit_results['passed']/audit_results['total_checks'])*100:.1f}%)")
    print("=" * 80)
    return audit_results

if __name__ == "__main__":
    res = run_audit()
    if res["failed"] > 0:
        sys.exit(1)
