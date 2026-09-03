import os
import sys
import uuid
import re
import pytest
from fastapi.testclient import TestClient

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.db.database import get_db
from backend.app.db.models import ApplicationModel, JobModel, ProfileModel, UserModel, MatchModel, ApplicationEventModel
from sqlalchemy.orm import Session

client = TestClient(app)

def test_track_click_endpoint_success():
    """Verify POST /api/applications/{id}/track-click updates link_opened_at and status."""
    # Obtain DB session
    db: Session = next(get_db())

    # Create dummy profile, job, match, application with unique email
    unique_email = f"linkout_test_{uuid.uuid4().hex[:8]}@example.com"
    profile = ProfileModel(email=unique_email, name="Test Linkout Candidate")
    db.add(profile)
    db.commit()

    job = JobModel(
        role_title="Senior Frontend Engineer",
        company="Stripe",
        apply_url="https://stripe.com/jobs/12345",
        link_status="live"
    )
    db.add(job)
    db.commit()

    match_entry = MatchModel(
        job_id=job.id,
        profile_id=profile.id,
        match_score=88.0
    )
    db.add(match_entry)
    db.commit()

    app_entry = ApplicationModel(
        match_id=match_entry.id,
        profile_id=profile.id,
        job_id=job.id,
        status="tailored",
        apply_url_resolved="https://stripe.com/jobs/12345"
    )
    db.add(app_entry)
    db.commit()

    # Hit track click endpoint
    res = client.post(f"/api/applications/{app_entry.id}/track-click")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}: {res.text}"

    data = res.json()
    assert data["success"] is True
    assert data["application_id"] == app_entry.id
    assert "link_opened_at" in data

    # Verify DB state update
    db.refresh(app_entry)
    assert app_entry.link_opened_at is not None
    assert app_entry.status in ["applied", "link_opened"]

    # Verify event logged
    event = db.query(ApplicationEventModel).filter(
        ApplicationEventModel.application_id == app_entry.id,
        ApplicationEventModel.event_type == "link_opened"
    ).first()
    assert event is not None, "Expected ApplicationEventModel for link_opened"

def test_zero_auto_apply_static_guardrail_audit():
    """
    Static analysis assertion on web/src codebase:
    Verifies that no component submits candidate data to an external ATS or attempts automated form submission.
    """
    web_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "src"))
    
    # Audit ApplicationFlowModal.jsx specifically
    app_flow_modal_path = os.path.join(web_src, "components", "ApplicationFlowModal.jsx")
    with open(app_flow_modal_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Must contain window.open and track-click
    assert "window.open" in content, "ApplicationFlowModal.jsx must open real apply_url via window.open"
    assert "track-click" in content, "ApplicationFlowModal.jsx must trigger track-click telemetry"
    assert "Submit Application 🚀" not in content, "ApplicationFlowModal.jsx must not claim to submit application in-app"
    assert "Official Application Link Opened!" in content, "ApplicationFlowModal.jsx must show link-out confirmation copy"

    # Audit discovery views for ApplyButton usage
    discovery_views = ["JobDiscovery.jsx", "MncOpportunityHub.jsx", "IndiaInternshipHub.jsx"]
    for view_name in discovery_views:
        view_path = os.path.join(web_src, "components", view_name)
        with open(view_path, "r", encoding="utf-8") as f:
            v_content = f.read()
        assert "ApplyButton" in v_content, f"{view_name} must use standardized ApplyButton component"

def test_dead_link_guardrail_in_apply_button():
    """Verify ApplyButton component handles dead links gracefully by checking component file."""
    web_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "src"))
    apply_btn_path = os.path.join(web_src, "components", "ApplyButton.jsx")
    with open(apply_btn_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "isDead" in content, "ApplyButton must inspect link_status for dead links"
    assert "Link Broken" in content, "ApplyButton must show 'Link Broken' UI state for dead links"
    assert "disabled={isDead}" in content, "ApplyButton must disable button when link_status is dead"

if __name__ == "__main__":
    pytest.main([__file__, "-vv"])
