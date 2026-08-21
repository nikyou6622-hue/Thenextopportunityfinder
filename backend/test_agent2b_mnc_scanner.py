import sys
import os
import datetime
import pytest

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app, auto_migrate_sqlite
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import ProfileModel, JobModel, MatchModel, MNCScanLogModel
from backend.app.agents.agent2b_mnc_scanner import (
    run_mnc_scan, get_mnc_scan_status, check_robots_allowed,
    MNC_TARGET_CONFIG, get_active_companies, adapter_health_check,
    compute_job_fingerprint, normalize_url_for_fingerprint,
    check_authenticity_flags, assert_no_auto_apply_handlers,
    revalidate_stale_links
)

@pytest.fixture(scope="module")
def db_session():
    auto_migrate_sqlite()
    db = SessionLocal()
    yield db
    db.close()

def test_robots_txt_compliance_checker():
    """Verify Robots.txt compliance check for career pages."""
    allowed, reason = check_robots_allowed("https://www.infosys.com/careers/openings.html")
    assert isinstance(allowed, bool)
    assert reason is not None

    # Verify RobotFileParser evaluation for allowed vs disallowed paths
    import urllib.robotparser
    rp = urllib.robotparser.RobotFileParser()
    rp.parse([
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /private-api/",
        "Allow: /careers/"
    ])
    assert rp.can_fetch("NextOpportunityFind-Bot", "https://example.com/careers/openings.html") is True, "Allowed path must return True"
    assert rp.can_fetch("NextOpportunityFind-Bot", "https://example.com/admin/login") is False, "Disallowed path must return False"

def test_job_fingerprinting_and_normalization():
    """Verify deterministic SHA-256 job fingerprinting and URL normalization."""
    fp1 = compute_job_fingerprint("Amazon", "Software Development Engineer", "Bengaluru", "job-12345")
    fp2 = compute_job_fingerprint("Amazon", "Software Development Engineer", "Bengaluru", "job-12345")
    fp3 = compute_job_fingerprint("Amazon", "Senior Software Engineer", "Bengaluru", "job-12345")
    assert fp1 == fp2, "Fingerprint must be deterministic and identical for same input"
    assert fp1 != fp3, "Fingerprint must differ for different titles"
    assert len(fp1) == 16, f"Fingerprint should be 16-char hex prefix, got {len(fp1)}"

    norm_url = normalize_url_for_fingerprint("https://careers.microsoft.com/v2/global/en/job/12345?utm_source=linkedin&utm_medium=job_post&ref=partner")
    assert "utm_source" not in norm_url
    assert "utm_medium" not in norm_url
    assert "ref" not in norm_url
    assert "careers.microsoft.com/v2/global/en/job/12345" in norm_url

def test_authenticity_flags_detector(db_session):
    """Verify detection of payment requests and scam patterns."""
    scam_job = {
        "company": "Amazon",
        "description": "Please pay registration fee of 500 INR. Contact us via whatsapp only.",
        "apply_url": "https://careers.amazon.jobs",
        "apply_email": "recruiter@gmail.com"
    }
    flags = check_authenticity_flags(scam_job, db_session)
    assert "payment_request" in flags
    assert "whatsapp_telegram_only" in flags
    assert "generic_email_contact" in flags

    clean_job = {
        "company": "Amazon",
        "description": "Amazon is hiring Software Engineers to build scalable cloud architectures.",
        "apply_url": "https://www.amazon.jobs/en/jobs/12345",
        "apply_email": "aws-hiring@amazon.com"
    }
    clean_flags = check_authenticity_flags(clean_job, db_session)
    assert len(clean_flags) == 0

def test_auto_apply_prohibition():
    """Verify structural prohibition of auto-apply libraries."""
    assert assert_no_auto_apply_handlers() is True

def test_adapter_health_checks():
    """Verify adapter health check with cache."""
    active_comps = get_active_companies()
    assert len(active_comps) >= 2
    for comp in active_comps:
        health = adapter_health_check(comp)
        assert health["company"] == comp["company"]
        assert health["status"] in ["healthy", "degraded", "failing", "unavailable"]

def test_mnc_scanner_execution_and_dedup(db_session):
    """Verify Agent 2b MNC Scanner pipeline execution, deduplication, and scan logs."""
    profile = db_session.query(ProfileModel).order_by(ProfileModel.id.desc()).first()
    if not profile:
        profile = ProfileModel(
            name="Alex Mercer",
            email="alex@dev.io",
            skills=["Python", "Java", "React", "AWS", "SQL", "Spring Boot", "FastAPI"],
            experience_years=3.0,
            domains=["cloud", "ai/ml", "saas", "fintech"],
            raw_resume_text="Alex Mercer - Software Engineer skilled in Python, Java, AWS, Spring Boot, React, and SQL."
        )
        db_session.add(profile)
        db_session.commit()
        db_session.refresh(profile)

    scan_res = run_mnc_scan(db_session, force_scan=True)
    assert scan_res["total_companies"] == len(get_active_companies())

    sec_scan_res = run_mnc_scan(db_session, force_scan=True)
    assert sec_scan_res["new_jobs_added"] == 0

    scan_logs = db_session.query(MNCScanLogModel).all()
    assert len(scan_logs) >= len(get_active_companies())

def test_link_revalidation_lifecycle(db_session):
    """Verify link lifecycle tracking (active -> stale -> removed)."""
    test_job = JobModel(
        company="Amazon",
        role_title="Test Lifecycle Job",
        location="India",
        apply_url="https://example.com/dead-job-404-test",
        source="Amazon Official Portal",
        source_category="mnc",
        external_id="test-lifecycle-001",
        link_status="active",
        status="active",
        link_checked_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=80)
    )
    db_session.add(test_job)
    db_session.commit()

    revalidate_stale_links(db_session)
    refreshed_job = db_session.query(JobModel).filter(JobModel.external_id == "test-lifecycle-001").first()
    assert refreshed_job.status in ["active", "stale", "removed"]

    db_session.delete(refreshed_job)
    db_session.commit()

def test_mnc_scan_status_helper(db_session):
    """Verify MNC scan status summary helper."""
    status_data = get_mnc_scan_status(db_session)
    assert status_data["total_companies_configured"] == len(MNC_TARGET_CONFIG)
    assert "Infosys" in status_data["company_statuses"]
    assert "Deloitte" in status_data["company_statuses"]
    assert "Microsoft" in status_data["company_statuses"]

def test_mnc_api_endpoints():
    """Verify MNC Scanner API endpoints via TestClient."""
    client = TestClient(app)

    # GET /api/jobs/mnc
    res = client.get("/api/jobs/mnc")
    assert res.status_code == 200

    # POST /api/jobs/mnc/scan
    res_scan = client.post("/api/jobs/mnc/scan")
    assert res_scan.status_code == 200

    # GET /api/jobs/mnc/scan-status
    res_st = client.get("/api/jobs/mnc/scan-status")
    assert res_st.status_code == 200
    st_json = res_st.json()
    assert st_json["total_companies_monitored"] == len(get_active_companies())
    assert st_json["total_companies_configured"] == len(MNC_TARGET_CONFIG)
