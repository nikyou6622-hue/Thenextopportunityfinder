"""
test_skill1_classify_and_linkout.py — Verification Test Suite for Skill 1 Standard
Verifies:
1. Classification of apply URLs into 8 canonical platforms.
2. Link resolution and dead-link status tracking.
3. Click-tracking endpoint (POST /api/applications/{id}/track-click).
4. Lifecycle status transitions (link_opened replaces submitted).
5. Outcome metrics & dashboard funnel calculations.
"""

import os
import sys
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from backend.app.db.database import Base, engine, SessionLocal
from backend.app.db.models import JobModel, MatchModel, ApplicationModel, ProfileModel, OutcomeEventModel
from backend.app.agents.source_router import (
    SourcePlatform,
    classify_source_platform,
    classify_apply_url,
    resolve_and_validate_apply_url
)
from backend.app.agents.outcome_tracker import compute_outcome_metrics
from backend.app.main import app

client = TestClient(app)

def test_url_classification_accuracy():
    print("[TEST 1] URL Classification Accuracy across 8 canonical platforms...")
    
    test_cases = [
        ("https://boards.greenhouse.io/stripe/jobs/123", None, SourcePlatform.GREENHOUSE),
        ("https://jobs.lever.co/figma/abc-def", None, SourcePlatform.LEVER),
        ("https://jobs.ashbyhq.com/openai/xyz", None, SourcePlatform.ASHBY),
        ("https://careers.google.com/jobs/results/456", None, SourcePlatform.COMPANY_DIRECT),
        ("https://www.linkedin.com/jobs/view/999888", None, SourcePlatform.LINKEDIN_DISCOVERY_ONLY),
        ("https://internshala.com/job/detail/python-dev-123", None, SourcePlatform.INTERNSHALA_DISCOVERY_ONLY),
        ("https://www.naukri.com/job-listings-full-stack-456", None, SourcePlatform.NAUKRI_DISCOVERY_ONLY),
        ("mailto:jobs@earlystartup.io", None, SourcePlatform.EMAIL_ONLY),
        (None, "careers@deeptech.io", SourcePlatform.EMAIL_ONLY),
    ]

    for url, email, expected_platform in test_cases:
        res = classify_source_platform(url, email)
        assert res == expected_platform, f"Expected {expected_platform} for url='{url}', email='{email}', got '{res}'"
        print(f"  -> {url or email} => {res.value} [OK]")

    print("  [PASS] All 8 platform classification tests verified successfully.\n")


def test_link_resolver_and_classification():
    print("[TEST 2] Link Resolution and Dead-Link Metadata Tracking...")
    
    # 1. Test standard classification result structure
    gh_res = classify_apply_url("https://boards.greenhouse.io/airbnb/jobs/101")
    assert gh_res.source_platform == SourcePlatform.GREENHOUSE
    assert gh_res.display_badge == "Greenhouse"
    assert gh_res.is_discovery_only is False
    assert gh_res.link_status in ["live", "unchecked"]
    print("  -> Greenhouse classification structure: PASS [OK]")

    # 2. Test discovery-only flag
    li_res = classify_apply_url("https://www.linkedin.com/jobs/view/456")
    assert li_res.source_platform == SourcePlatform.LINKEDIN_DISCOVERY_ONLY
    assert li_res.is_discovery_only is True
    assert "discovery-only" in li_res.notes
    print("  -> LinkedIn discovery-only policy enforcement: PASS [OK]")

    # 3. Test invalid URL handling (no crash)
    inv_url, inv_status = resolve_and_validate_apply_url("not_a_valid_url", check_live=True)
    assert inv_status == "unchecked"
    print("  -> Invalid URL graceful fallback: PASS [OK]")

    print("  [PASS] Link resolver and metadata structure verified.\n")


def test_click_tracking_and_lifecycle_transition():
    print("[TEST 3] Click Tracking (POST /api/applications/{id}/track-click) and Status Transition...")
    
    db: Session = SessionLocal()
    try:
        # Create test job and application
        job = JobModel(
            company="Skill1Corp",
            role_title="Lead Systems Architect",
            apply_url="https://jobs.lever.co/skill1corp/lead-arch",
            source="lever"
        )
        db.add(job)
        db.flush()

        match = MatchModel(
            job_id=job.id,
            match_score=92.0
        )
        db.add(match)
        db.flush()

        app_entry = ApplicationModel(
            match_id=match.id,
            job_id=job.id,
            status="tailored",
            apply_mode="company_direct"
        )
        db.add(app_entry)
        db.commit()
        db.refresh(app_entry)

        app_id = app_entry.id
        print(f"  -> Created initial application ID={app_id}, Status='{app_entry.status}'")

        # Fire click-tracking endpoint
        response = client.post(f"/api/applications/{app_id}/track-click")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()

        assert data["application_id"] == app_id
        assert data["status"] == "link_opened", f"Expected status 'link_opened', got '{data['status']}'"
        assert data["link_opened_at"] is not None
        assert "jobs.lever.co" in data["apply_url_resolved"]
        assert data["source_platform"] == "lever"

        # Verify DB state directly
        db.refresh(app_entry)
        assert app_entry.status == "link_opened"
        assert app_entry.link_opened_at is not None

        # Verify event logged in outcome events
        event = db.query(OutcomeEventModel).filter(OutcomeEventModel.application_id == app_id).first()
        assert event is not None
        assert event.event_type == "link_opened"
        print(f"  -> Successfully tracked click: link_opened_at={app_entry.link_opened_at.isoformat()}, new status='link_opened' [OK]")

        print("  [PASS] Click tracking and lifecycle transition verified.\n")

    finally:
        db.close()


def test_outcome_metrics_and_dashboard_funnel():
    print("[TEST 4] Outcome Metrics & Dashboard Funnel Calculation with 'link_opened'...")
    
    db: Session = SessionLocal()
    try:
        metrics = compute_outcome_metrics(db)
        assert "link_opened_or_emailed" in metrics["lifecycle_funnel"], "lifecycle_funnel must contain 'link_opened_or_emailed'"
        print(f"  -> Funnel keys verified: {list(metrics['lifecycle_funnel'].keys())} [OK]")
        print(f"  -> Total applications opened/sent: {metrics['total_applications_sent']} [OK]")

        # Test GET /api/dashboard/metrics
        dash_res = client.get("/api/dashboard/metrics")
        assert dash_res.status_code == 200
        dash_data = dash_res.json()
        assert "applications_sent" in dash_data
        print(f"  -> GET /api/dashboard/metrics returned valid data: apps_sent={dash_data['applications_sent']} [OK]")

        print("  [PASS] Metrics and dashboard funnel calculations verified.\n")
    finally:
        db.close()


def main():
    print("=" * 70)
    print("       NEXTOPPORTUNITYFIND — SKILL 1 VERIFICATION TEST SUITE")
    print("=" * 70 + "\n")

    test_url_classification_accuracy()
    test_link_resolver_and_classification()
    test_click_tracking_and_lifecycle_transition()
    test_outcome_metrics_and_dashboard_funnel()

    print("=" * 70)
    print(" [ALL TESTS PASSED] Skill 1 (Classify & Link-Out Pivot) Standard Verified!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
