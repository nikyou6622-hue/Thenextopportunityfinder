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

from backend.app.db.database import engine, SessionLocal, Base
from backend.app.agents.agent2c_india_internships_scraper import run_india_internship_scan

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("run_internships_scan_standalone")

def main():
    logger.info("Starting Standalone India Internship Scan via GitHub Actions...")
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        
        logger.info(f"Database session established successfully against host: {engine.url.host}")
        
        # Execute Internship Scraper
        results = run_india_internship_scan(db, force_scan=True)
        db.close()
        
        logger.info("India Internship Scan Completed Successfully!")
        logger.info(f"Summary: Total Portals={results.get('total_portals')}, Successful={results.get('successful_scans')}, Failed={results.get('failed_scans')}, New Jobs Added={results.get('new_jobs_added')}")
        
        sys.exit(0)

    except Exception as e:
        logger.critical(f"FATAL: Internship Scanner Execution Failed with Exception: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
