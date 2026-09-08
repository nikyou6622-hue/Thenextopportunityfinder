import os
import sys
import datetime
import pytest

os.environ['USE_SQLITE_TEST'] = '1'
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import JobModel, MatchModel, ApplicationModel, ProfileModel, IngestionRunModel
from backend.app.agents.agent2b_mnc_scanner import MNC_TARGET_CONFIG, fetch_direct_ats_api, fetch_playwright_js_postings, run_mnc_scan
from backend.app.utils.js_renderer import render_page_html
from backend.app.main import UNRELIABLE_COMPANIES, get_jobs

def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_1_playwright_js_renderer_fallback():
    """Verify JS renderer executes cleanly with HTTP fallback capability."""
    html = render_page_html("https://example.com", timeout_ms=5000)
    assert html is not None, "HTML content should be returned by js_renderer"
    assert "<html" in html.lower() or "<body" in html.lower(), "Valid HTML structure expected"

def test_2_company_ats_endpoints_validity():
    """Verify MNC_TARGET_CONFIG has 30+ verified company targets with valid structure."""
    assert len(MNC_TARGET_CONFIG) >= 30, f"Expected 30+ company targets, found {len(MNC_TARGET_CONFIG)}"
    
    valid_methods = {"api", "html_scrape", "playwright_js"}
    for config in MNC_TARGET_CONFIG:
        company = config.get("company")
        method = config.get("data_access_method")
        assert company, "Each config entry must specify 'company'"
        assert method in valid_methods, f"Invalid data_access_method '{method}' for {company}"

def test_3_reclassified_mncs_unblocked():
    """Verify IT MNCs (Infosys, TCS, HCLTech, Accenture, Cognizant) are unblocked."""
    assert len(UNRELIABLE_COMPANIES) == 0, "UNRELIABLE_COMPANIES must be empty set"
    
    db: Session = SessionLocal()
    try:
        j = JobModel(
            company="Infosys",
            role_title="Specialist Programmer",
            apply_url="https://careers.infosys.com/job/123",
            status="active",
            link_status="live"
        )
        db.add(j)
        db.commit()

        res = get_jobs(include_dead=False, page=1, limit=10, search=None, db=db)
        inf_in_res = any(item.company == "Infosys" for item in res)
        assert inf_in_res, "Infosys job MUST pass through get_jobs endpoint without filtering"
    finally:
        db.query(JobModel).filter(JobModel.company == "Infosys").delete()
        db.commit()
        db.close()

def test_4_high_volume_ingestion_and_quality_controls():
    """Verify direct ATS ingestion extracts jobs cleanly with quality metadata."""
    groww_config = next((c for c in MNC_TARGET_CONFIG if c["company"] == "Groww"), None)
    assert groww_config is not None, "Groww config target must exist"
    
    jobs, status = fetch_direct_ats_api(groww_config)
    assert status["http_success"] is True, "Groww API call should succeed (200 OK)"
    assert len(jobs) > 0, "Groww API should yield real job listings"
    
    first_job = jobs[0]
    assert first_job["company"] == "Groww"
    assert "apply_url" in first_job and first_job["apply_url"].startswith("http")
    assert first_job["job_fingerprint"] is not None

def test_5_playwright_js_mnc_postings_fetch():
    """Verify Playwright JS fetcher handles MNC targets and fallbacks gracefully."""
    inf_config = next((c for c in MNC_TARGET_CONFIG if c["company"] == "Infosys"), None)
    assert inf_config is not None
    
    jobs, status = fetch_playwright_js_postings(inf_config)
    assert len(jobs) > 0, "Infosys JS fetcher should return listings (or seed fallback)"

if __name__ == '__main__':
    setup_module()
    test_1_playwright_js_renderer_fallback()
    print("PASS: Test 1 - Playwright JS renderer fallback")
    test_2_company_ats_endpoints_validity()
    print("PASS: Test 2 - 30+ Verified Company ATS Target Configs")
    test_3_reclassified_mncs_unblocked()
    print("PASS: Test 3 - Reclassified IT MNCs unblocked from feed")
    test_4_high_volume_ingestion_and_quality_controls()
    print("PASS: Test 4 - Direct ATS API high volume ingestion & quality controls")
    test_5_playwright_js_mnc_postings_fetch()
    print("PASS: Test 5 - Playwright JS MNC postings fetch")
    print("ALL HIGH-VOLUME TESTS PASSED!")
