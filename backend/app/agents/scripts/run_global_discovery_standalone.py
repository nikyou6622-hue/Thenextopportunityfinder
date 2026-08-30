"""
run_global_discovery_standalone.py — Standalone entrypoint for Global Job Discovery Scraper
Executed via GitHub Actions scheduled workflow or manual dispatch.
Ingests multi-ATS and public guest job listings directly into Supabase Postgres.
"""

import os
import sys
import logging
import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")))

import time
from backend.app.db.database import engine, SessionLocal, Base
from backend.app.db.models import JobModel, ScraperRunModel
from backend.app.services.error_notifier import capture_and_alert_error
from backend.app.agents.agent2d_global_jobs_scraper import get_combined_global_feed

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("run_global_discovery_standalone")

def main():
    logger.info("Starting Standalone Global Job Discovery Scan via GitHub Actions...")
    start_time = datetime.datetime.now(datetime.timezone.utc)
    t0 = time.time()
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    scraper_run = ScraperRunModel(
        scraper_name="Global Job Discovery Scanner",
        start_time=start_time,
        status="running"
    )
    db.add(scraper_run)
    db.commit()
    db.refresh(scraper_run)
    
    try:
        logger.info(f"Database session established successfully against host: {engine.url.host}")
        
        # Fetch multi-ATS and LinkedIn public guest feeds
        jobs_feed = get_combined_global_feed(query="", location="", limit=50)
        logger.info(f"Fetched {len(jobs_feed)} global job postings from multi-ATS aggregator feeds.")
        
        saved_count = 0
        for item in jobs_feed:
            ext_id = item["id"]
            existing = db.query(JobModel).filter(JobModel.external_id == ext_id).first()
            if not existing:
                job = JobModel(
                    external_id=ext_id,
                    role_title=item["title"],
                    company=item["company"],
                    location=item.get("location", "Remote"),
                    source=item.get("source", "FreeHire Aggregator"),
                    source_category="global_tech",
                    apply_url=item["apply_url"],
                    description=item.get("description", ""),
                    required_skills=item.get("skills", []),
                    status="active",
                    link_status="live",
                    posted_date=item.get("posted_date", "Recent")
                )
                db.add(job)
                saved_count += 1
                
        db.commit()
        t1 = time.time()
        duration = round(t1 - t0, 2)
        
        scraper_run.status = "success"
        scraper_run.end_time = datetime.datetime.now(datetime.timezone.utc)
        scraper_run.duration_seconds = duration
        scraper_run.jobs_added = saved_count
        scraper_run.jobs_updated = 0
        scraper_run.jobs_skipped = len(jobs_feed) - saved_count
        db.commit()
        
        logger.info(f"Global Job Discovery Scan Completed Successfully in {duration}s! Total Processed: {len(jobs_feed)}, New Saved: {saved_count}")
        sys.exit(0)

    except Exception as e:
        t1 = time.time()
        duration = round(t1 - t0, 2)
        scraper_run.status = "failed"
        scraper_run.end_time = datetime.datetime.now(datetime.timezone.utc)
        scraper_run.duration_seconds = duration
        scraper_run.error_message = str(e)
        db.commit()
        
        logger.critical(f"FATAL: Global Job Discovery Execution Failed with Exception: {e}", exc_info=True)
        try:
            capture_and_alert_error(source="Global Job Discovery Scanner", error=e, db=db)
        except Exception as alert_ex:
            logger.error(f"Failed to dispatch error alert: {alert_ex}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
