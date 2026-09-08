import os
import sys
import time
import pytest

os.environ['USE_SQLITE_TEST'] = '1'
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import JobModel
from backend.app.agents.source_router import is_india_relevant, classify_india_relevance
from backend.app.agents.agent2b_mnc_scanner import MNC_TARGET_CONFIG, run_mnc_scan, fetch_direct_ats_api

def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_1_is_india_relevant_and_remote_global_classification():
    """Verify exact location classification rules for India vs Foreign vs Remote-Global."""
    # Direct India locations
    is_rel, is_rg = classify_india_relevance("Bangalore, India")
    assert is_rel is True and is_rg is False
    
    is_rel, is_rg = classify_india_relevance("Remote - India")
    assert is_rel is True and is_rg is False

    is_rel, is_rg = classify_india_relevance("Noida, Uttar Pradesh")
    assert is_rel is True and is_rg is False

    # Remote-Global candidate locations
    is_rel, is_rg = classify_india_relevance("Home based - Worldwide")
    assert is_rel is True and is_rg is True

    is_rel, is_rg = classify_india_relevance("Remote - Global")
    assert is_rel is True and is_rg is True

    # Foreign specific locations (must return False)
    is_rel, is_rg = classify_india_relevance("Remote - USA")
    assert is_rel is False

    is_rel, is_rg = classify_india_relevance("San Francisco, CA")
    assert is_rel is False

    is_rel, is_rg = classify_india_relevance("Tokyo, Japan")
    assert is_rel is False

    is_rel, is_rg = classify_india_relevance("London, UK")
    assert is_rel is False

def test_2_target_location_profiles_and_api_allocation():
    """Verify MNC_TARGET_CONFIG has location_profile and fast API allocation."""
    for cfg in MNC_TARGET_CONFIG:
        assert "location_profile" in cfg, f"Target {cfg['company']} missing location_profile"
        assert cfg["location_profile"] in ["india_heavy", "global_tech"]

    # Confirm API-backed targets use direct API method (not playwright)
    greenhouse_targets = [c for c in MNC_TARGET_CONFIG if "greenhouse.io" in (c.get("api_endpoint") or "")]
    for g_target in greenhouse_targets:
        assert g_target["data_access_method"] == "api", f"Greenhouse target {g_target['company']} must use 'api' method"

def test_3_parallel_scan_throughput_and_ingestion_filtering():
    """Verify parallel scanning executes quickly and filters out non-India listings at ingestion time."""
    db: Session = SessionLocal()
    try:
        start_time = time.time()
        summary = run_mnc_scan(db, force_scan=True)
        duration = time.time() - start_time
        
        assert duration < 60.0, f"Parallel scan took {duration:.2f}s, expected < 60s"
        assert summary["total_companies"] > 0
        
        # Verify ingested active jobs are all India-relevant
        active_jobs = db.query(JobModel).filter(JobModel.status == "active").all()
        for j in active_jobs:
            is_rel, _ = classify_india_relevance(j.location, j.description)
            assert is_rel is True, f"Non-India job slipped through ingestion: {j.company} - {j.location}"
    finally:
        db.close()

if __name__ == '__main__':
    setup_module()
    test_1_is_india_relevant_and_remote_global_classification()
    print("PASS: Test 1 - Location relevance & Remote-Global classification")
    test_2_target_location_profiles_and_api_allocation()
    print("PASS: Test 2 - Target location profiles & fast API allocation")
    test_3_parallel_scan_throughput_and_ingestion_filtering()
    print("PASS: Test 3 - Parallel scan throughput & ingestion-time filtering")
    print("ALL INDIA LOCATION & THROUGHPUT TESTS PASSED!")
