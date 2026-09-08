import os
import sys
import datetime
import pytest

os.environ['USE_SQLITE_TEST'] = '1'
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import JobModel, IngestionRunModel
from backend.app.utils.date_parser import parse_relative_date_to_iso, compute_content_hash
from backend.app.agents.agent2c_india_internships_scraper import store_jobs_batch, compute_job_fingerprint
from backend.app.main import get_scraper_health_endpoint, get_adaptive_schedules_endpoint

def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_1_freshness_date_parsing_and_null_handling():
    iso_3h = parse_relative_date_to_iso("Posted 3 hours ago")
    assert iso_3h is not None and "T" in iso_3h, "Should parse 'Posted 3 hours ago' to ISO string"

    iso_2d = parse_relative_date_to_iso("2 days ago")
    assert iso_2d is not None, "Should parse '2 days ago'"

    iso_yesterday = parse_relative_date_to_iso("Yesterday")
    assert iso_yesterday is not None, "Should parse 'Yesterday'"

    # Null / unparseable handling — must return None, NEVER substitute discovered_at
    assert parse_relative_date_to_iso(None) is None
    assert parse_relative_date_to_iso("Unspecified") is None

def test_2_change_detection_and_content_hash_update():
    db: Session = SessionLocal()
    try:
        data_orig = [{
            "role_title": "Fullstack Software Engineer Intern",
            "company": "TechScale Inc",
            "location": "Bengaluru, India",
            "description": "Initial job description v1.",
            "stipend": "₹40,000 / month",
            "duration": "3 Months",
            "ppo_offered": False,
            "external_id": "ext_change_det_01",
            "source": "unstop",
            "source_posted_at": parse_relative_date_to_iso("Posted 1 hour ago")
        }]

        created, updated = store_jobs_batch(lambda: db, data_orig, profile_id=None)
        assert created == 1, "First ingestion should create 1 job"

        job = db.query(JobModel).filter(JobModel.external_id == "ext_change_det_01").first()
        assert job is not None
        orig_hash = job.content_hash

        # Mutate description and stipend for same job (same job_fingerprint)
        data_updated = [{
            "role_title": "Fullstack Software Engineer Intern",
            "company": "TechScale Inc",
            "location": "Bengaluru, India",
            "description": "Updated job description v2 with higher stipend.",
            "stipend": "₹60,000 / month",
            "duration": "6 Months",
            "ppo_offered": True,
            "external_id": "ext_change_det_01",
            "source": "unstop",
            "source_posted_at": parse_relative_date_to_iso("Posted 1 hour ago")
        }]

        created_2, updated_2 = store_jobs_batch(lambda: db, data_updated, profile_id=None)
        assert created_2 == 0, "Second ingestion of same job must NOT insert duplicate row"
        assert updated_2 >= 1, "Second ingestion must update existing row when content_hash changes"

        job_updated = db.query(JobModel).filter(JobModel.external_id == "ext_change_det_01").first()
        assert job_updated.content_hash != orig_hash, "content_hash must be updated"
        assert "v2 with higher stipend" in job_updated.description, "Description should reflect edit"

    finally:
        db.query(JobModel).filter(JobModel.external_id == "ext_change_det_01").delete()
        db.commit()
        db.close()

def test_3_incremental_scraping_early_stopping():
    db: Session = SessionLocal()
    try:
        # Create 12 known jobs
        items = []
        for i in range(12):
            items.append({
                "role_title": f"Known Role {i}",
                "company": "StableCorp",
                "location": "Bengaluru, India",
                "description": f"Stable description {i}",
                "external_id": f"ext_incremental_{i}",
                "source": "unstop"
            })

        c1, u1 = store_jobs_batch(lambda: db, items, profile_id=None)
        assert c1 == 12, "Should insert 12 initial jobs"

        # Re-run store_jobs_batch with exact same items
        c2, u2 = store_jobs_batch(lambda: db, items, profile_id=None)
        assert c2 == 0, "No new jobs should be inserted on duplicate batch run"

    finally:
        db.query(JobModel).filter(JobModel.company == "StableCorp").delete()
        db.commit()
        db.close()

def test_4_failure_visibility_and_ingestion_runs_table():
    db: Session = SessionLocal()
    try:
        run = IngestionRunModel(
            source="test_unstop_scraper",
            started_at=datetime.datetime.now(datetime.timezone.utc),
            finished_at=datetime.datetime.now(datetime.timezone.utc),
            status="failed",
            jobs_seen=5,
            jobs_new=0,
            jobs_updated=0,
            error_detail="Simulated HTTP 504 Gateway Timeout during pagination"
        )
        db.add(run)
        db.commit()

        logged = db.query(IngestionRunModel).filter(IngestionRunModel.source == "test_unstop_scraper").first()
        assert logged is not None
        assert logged.status == "failed"
        assert "Timeout" in logged.error_detail

    finally:
        db.query(IngestionRunModel).filter(IngestionRunModel.source == "test_unstop_scraper").delete()
        db.commit()
        db.close()

def test_5_scraper_health_check_and_adaptive_schedules():
    db: Session = SessionLocal()
    try:
        # Insert 3 consecutive failed runs for bad_source
        now = datetime.datetime.now(datetime.timezone.utc)
        for i in range(3):
            r = IngestionRunModel(
                source="unhealthy_source",
                started_at=now - datetime.timedelta(minutes=10 * (3 - i)),
                finished_at=now - datetime.timedelta(minutes=10 * (3 - i) - 1),
                status="failed",
                error_detail=f"Consecutive error {i+1}"
            )
            db.add(r)
        
        # Insert 1 healthy run for good_source
        good = IngestionRunModel(
            source="healthy_source",
            started_at=now,
            finished_at=now,
            status="success",
            jobs_new=15
        )
        db.add(good)
        db.commit()

        health = get_scraper_health_endpoint(db)
        assert health["overall_status"] == "unhealthy"
        assert "unhealthy_source" in health["flagged_sources"]
        assert "healthy_source" not in health["flagged_sources"]

        schedules = get_adaptive_schedules_endpoint(high_churn_threshold=10.0, db=db)
        h_sched = next(s for s in schedules["schedules"] if s["source"] == "healthy_source")
        assert h_sched["category"] == "high_churn"
        assert h_sched["recommended_interval_hours"] == 4

    finally:
        db.query(IngestionRunModel).filter(IngestionRunModel.source.in_(["unhealthy_source", "healthy_source"])).delete()
        db.commit()
        db.close()
