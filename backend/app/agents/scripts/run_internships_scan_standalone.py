"""
run_internships_scan_standalone.py — Standalone entrypoint for India Internship Scraper
Executed via GitHub Actions scheduled workflow or manual dispatch.
Connects directly to Supabase Postgres (DATABASE_URL) without Vercel HTTP timeouts.
"""

import os
import sys
import logging
import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")))

import time
from backend.app.db.database import engine, SessionLocal, Base
from backend.app.db.models import ScraperRunModel
from backend.app.services.error_notifier import capture_and_alert_error
from backend.app.agents.agent2c_india_internships_scraper import run_india_internship_scan

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("run_internships_scan_standalone")

def main():
    logger.info("Starting Standalone India Internship Scan via GitHub Actions...")
    start_time = datetime.datetime.now(datetime.timezone.utc)
    t0 = time.time()
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    scraper_run = ScraperRunModel(
        scraper_name="India Internship Scraper",
        start_time=start_time,
        status="running"
    )
    db.add(scraper_run)
    db.commit()
    db.refresh(scraper_run)
    
    try:
        logger.info(f"Database session established successfully against host: {engine.url.host}")
        results = run_india_internship_scan(db, force_scan=True)
        t1 = time.time()
        duration = round(t1 - t0, 2)
        
        scraper_run.status = "success"
        scraper_run.end_time = datetime.datetime.now(datetime.timezone.utc)
        scraper_run.duration_seconds = duration
        scraper_run.jobs_added = results.get("new_jobs_added", 0)
        scraper_run.jobs_updated = results.get("stale_jobs_flagged", 0)
        db.commit()
        
        logger.info(f"India Internship Scan Completed Successfully in {duration}s!")
        logger.info(f"Summary: Total Portals={results.get('total_portals')}, Successful={results.get('successful_scans')}, Failed={results.get('failed_scans')}, New Jobs Added={results.get('new_jobs_added')}")
        sys.exit(0)

    except Exception as e:
        t1 = time.time()
        duration = round(t1 - t0, 2)
        scraper_run.status = "failed"
        scraper_run.end_time = datetime.datetime.now(datetime.timezone.utc)
        scraper_run.duration_seconds = duration
        scraper_run.error_message = str(e)
        db.commit()
        
        logger.critical(f"FATAL: Internship Scanner Execution Failed with Exception: {e}", exc_info=True)
        try:
            capture_and_alert_error(source="India Internship Scraper", error=e, db=db)
        except Exception as alert_ex:
            logger.error(f"Failed to dispatch error alert: {alert_ex}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
