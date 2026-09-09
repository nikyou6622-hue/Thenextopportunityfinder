"""
run_agent7.py — Standalone entrypoint for Agent 7: Job Quality & Enrichment Agent
Executes scorer -> clusterer -> enricher -> competition parser in sequence.
Writes run details to agent7_runs database log table.
"""

import os
import sys
import time
import datetime
import logging
from typing import Dict, Any

# Ensure project root is in sys.path
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
sys.path.insert(0, _root_dir)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_root_dir, ".env"), override=False)
    load_dotenv(os.path.join(_root_dir, "backend", ".env"), override=False)
except ImportError:
    pass

from backend.app.db.database import engine, SessionLocal, Base
from backend.app.db.models import JobModel, Agent7RunModel
from backend.app.agents.agent7_quality.scorer import compute_job_quality
from backend.app.agents.agent7_quality.clusterer import cluster_jobs
from backend.app.agents.agent7_quality.jd_enricher import extract_perks_from_description
from backend.app.agents.agent7_quality.competition_parser import calculate_competition_metrics

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("run_agent7")

def run_quality_enrichment(db_session=None, force_reprocess: bool = False) -> Dict[str, Any]:
    """
    Main execution pipeline for Agent 7:
    1. Scans active/recent jobs in DB
    2. Runs Perk Enrichment (jd_enricher)
    3. Runs Competition Parsing (competition_parser)
    4. Runs Quality Scoring (scorer)
    5. Runs Near-Duplicate Clustering (clusterer)
    6. Updates Agent 7 owned columns on JobModel
    7. Logs run summary to Agent7RunModel
    """
    db = db_session or SessionLocal()
    start_time = datetime.datetime.now(datetime.timezone.utc)
    t0 = time.time()
    
    # 1. Create run log entry
    run_log = Agent7RunModel(
        started_at=start_time,
        status="running"
    )
    db.add(run_log)
    db.commit()
    db.refresh(run_log)
    
    jobs_scored_count = 0
    jobs_enriched_count = 0
    
    try:
        # Fetch target jobs: un-scored jobs or all active jobs if force_reprocess=True
        query = db.query(JobModel).filter(JobModel.status == "active")
        if not force_reprocess:
            query = query.filter(JobModel.quality_score.is_(None))
            
        jobs = query.all()
        logger.info(f"Agent 7 Pipeline Target Jobs: {len(jobs)} rows to process.")
        
        job_dicts_for_clustering = []
        
        for j in jobs:
            # 2. Perk Enrichment (jd_enricher)
            perk_bools, perks_raw = extract_perks_from_description(j.description or "")
            j.offers_equity = perk_bools["offers_equity"]
            j.offers_visa_sponsorship = perk_bools["offers_visa_sponsorship"]
            j.offers_relocation = perk_bools["offers_relocation"]
            j.offers_bonus = perk_bools["offers_bonus"]
            j.offers_education_stipend = perk_bools["offers_education_stipend"]
            j.offers_flexible_timing = perk_bools["offers_flexible_timing"]
            j.perks_raw = perks_raw
            
            if any(perk_bools.values()):
                jobs_enriched_count += 1
                
            # 3. Competition Parser (competition_parser)
            app_cnt, days_posted, comp_idx = calculate_competition_metrics(
                created_at=j.created_at,
                source_posted_at=j.source_posted_at,
                description=j.description or "",
                metadata=j.authenticity_flags if isinstance(j.authenticity_flags, dict) else None
            )
            j.applicant_count = app_cnt
            j.days_since_posting = days_posted
            j.competition_index = comp_idx
            
            # 4. Quality Scoring (scorer)
            job_dict_for_scoring = {
                "required_skills": j.required_skills or [],
                "description": j.description or "",
                "role_title": j.role_title or "",
                "location_type": j.location_type or "",
                "location": j.location or "",
                "remote": j.remote if j.remote is not None else True,
                "offers_equity": j.offers_equity,
                "offers_visa_sponsorship": j.offers_visa_sponsorship,
                "offers_relocation": j.offers_relocation,
                "offers_bonus": j.offers_bonus,
                "offers_education_stipend": j.offers_education_stipend,
                "offers_flexible_timing": j.offers_flexible_timing,
                "applicant_count": j.applicant_count
            }
            
            quality_res = compute_job_quality(job_dict_for_scoring)
            
            j.quality_score = quality_res["quality_score"]
            j.tech_stack_score = quality_res["tech_stack_score"]
            j.seniority_score = quality_res["seniority_score"]
            j.remote_score = quality_res["remote_score"]
            j.perks_score = quality_res["perks_score"]
            j.competition_score = quality_res["competition_score"]
            j.quality_tags = quality_res["quality_tags"]
            
            jobs_scored_count += 1
            
            job_dicts_for_clustering.append({
                "id": j.id,
                "company": j.company or "",
                "role_title": j.role_title or "",
                "cluster_id": j.cluster_id
            })
            
        # Commit enrichment and scoring updates
        db.commit()
        
        # 5. Near-Duplicate Clustering (clusterer)
        if job_dicts_for_clustering:
            logger.info("Executing Agent 7 Near-Duplicate Clustering...")
            cluster_map = cluster_jobs(job_dicts_for_clustering, similarity_threshold=0.75)
            
            for j in jobs:
                if j.id in cluster_map:
                    j.cluster_id = cluster_map[j.id]
                    
            db.commit()
            
        duration = round(time.time() - t0, 2)
        run_log.status = "success"
        run_log.finished_at = datetime.datetime.now(datetime.timezone.utc)
        run_log.jobs_scored = jobs_scored_count
        run_log.jobs_enriched = jobs_enriched_count
        db.commit()
        
        logger.info(f"Agent 7 Run Completed Successfully in {duration}s! Scored: {jobs_scored_count}, Enriched: {jobs_enriched_count}.")
        return {
            "status": "success",
            "duration_seconds": duration,
            "jobs_scored": jobs_scored_count,
            "jobs_enriched": jobs_enriched_count
        }
        
    except Exception as ex:
        db.rollback()
        logger.error(f"Agent 7 Run Failed: {ex}", exc_info=True)
        run_log.status = "failed"
        run_log.finished_at = datetime.datetime.now(datetime.timezone.utc)
        run_log.error_detail = str(ex)
        db.commit()
        return {
            "status": "failed",
            "error": str(ex)
        }
    finally:
        if db_session is None:
            db.close()

if __name__ == "__main__":
    res = run_quality_enrichment(force_reprocess=True)
    print("Agent 7 Execution Summary:", res)
