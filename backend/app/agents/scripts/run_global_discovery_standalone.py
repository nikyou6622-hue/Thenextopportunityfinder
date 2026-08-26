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

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.models import JobModel
from backend.app.agents.agent2d_global_jobs_scraper import get_combined_global_feed

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("run_global_discovery_standalone")

def main():
    logger.info("Starting Standalone Global Job Discovery Scan via GitHub Actions...")
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        from backend.app.db.database import DEFAULT_SUPABASE_URL
        db_url = DEFAULT_SUPABASE_URL
        logger.info("DATABASE_URL environment variable not explicitly set; defaulting to production Supabase PostgreSQL.")

    try:
        from backend.app.db.database import Base
        engine = create_engine(db_url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
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
        db.close()
        
        logger.info(f"Global Job Discovery Scan Completed Successfully! Total Processed: {len(jobs_feed)}, New Saved: {saved_count}")
        sys.exit(0)

    except Exception as e:
        logger.critical(f"FATAL: Global Job Discovery Execution Failed with Exception: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
