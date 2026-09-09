import os
import sys
import re
import hashlib
import datetime
import logging
from typing import List, Dict, Any

sys.path.insert(0, os.getcwd())
from backend.app.db.database import SessionLocal
from backend.app.db.models import JobModel, MatchModel, ProfileModel
from backend.app.agents.agent3_matching import compute_match
from backend.app.utils.skill_normalizer import extract_skills_from_text
from backend.app.agents.source_router import is_india_relevant, is_technical_role

from jobspy import scrape_jobs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("india_ingest")

SEARCH_TERMS = [
    "Python Developer",
    "FastAPI Developer",
    "Django Developer",
    "Backend Engineer",
    "Full Stack Engineer",
    "React Developer",
    "Software Engineer",
    "Data Engineer",
    "C++ Developer",
    "AI ML Engineer"
]

LOCATIONS = ["India", "Bengaluru"]

def compute_fingerprint(company: str, title: str, location: str) -> str:
    clean_comp = (company or "").strip().lower()
    clean_title = (title or "").strip().lower()
    clean_loc = (location or "").strip().lower()
    key = f"{clean_comp}::{clean_title}::{clean_loc}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]

def main():
    logger.info("Starting live job ingestion sweep via JobSpy...")
    db = SessionLocal()
    
    total_new_jobs = 0
    total_scraped = 0

    try:
        existing_fingerprints = set(
            f[0] for f in db.query(JobModel.job_fingerprint).filter(JobModel.job_fingerprint.isnot(None)).all()
        )
        logger.info(f"Loaded {len(existing_fingerprints)} existing job fingerprints from database.")

        for term in SEARCH_TERMS:
            for loc in LOCATIONS:
                logger.info(f"Scraping '{term}' in '{loc}'...")
                try:
                    df = scrape_jobs(
                        site_name=["indeed", "linkedin"],
                        search_term=term,
                        location=loc,
                        results_wanted=15,
                        hours_old=168,  # last 7 days
                        country_indeed="India"
                    )
                    
                    if df is None or len(df) == 0:
                        continue
                        
                    total_scraped += len(df)
                    
                    for idx, row in df.iterrows():
                        title = str(row.get("title") or "").strip()
                        company = str(row.get("company") or "").strip()
                        location = str(row.get("location") or "India").strip()
                        description = str(row.get("description") or "").strip()
                        apply_url = str(row.get("job_url") or row.get("site_url") or "").strip()
                        source_platform = str(row.get("site") or "jobspy").strip().lower()
                        
                        if not title or not company:
                            continue
                            
                        # Technical & India sanity checks
                        if not is_technical_role(title, description):
                            continue
                            
                        if not is_india_relevant(location, description, company):
                            continue
                            
                        fp = compute_fingerprint(company, title, location)
                        if fp in existing_fingerprints:
                            continue
                            
                        existing_fingerprints.add(fp)
                        
                        req_skills = extract_skills_from_text(description)
                        is_remote = "remote" in location.lower() or "remote" in description.lower() or bool(row.get("is_remote"))
                        
                        role_type = "full-time"
                        if "intern" in title.lower() or "intern" in description.lower():
                            role_type = "internship"
                            
                        job_obj = JobModel(
                            company=company,
                            role_title=title,
                            location=location,
                            location_type="Remote" if is_remote else "On-site",
                            remote=is_remote,
                            required_skills=req_skills,
                            domain="tech",
                            role_type=role_type,
                            description=description,
                            apply_url=apply_url,
                            apply_url_raw=apply_url,
                            apply_url_resolved=apply_url,
                            link_status="live",
                            source_platform=source_platform,
                            source="jobspy",
                            source_category="mnc" if source_platform in ["linkedin", "indeed"] else "startup",
                            source_trust_tier="tier1_verified",
                            is_technical=True,
                            is_remote_global=is_remote,
                            job_fingerprint=fp,
                            status="active"
                        )
                        db.add(job_obj)
                        total_new_jobs += 1
                        
                    db.commit()
                    logger.info(f"Ingested new jobs batch for '{term}'. Total new so far: {total_new_jobs}")
                except Exception as e:
                    logger.warning(f"Failed scraping term '{term}' location '{loc}': {e}")

        logger.info(f"Ingestion sweep completed! Scraped {total_scraped} raw listings, added {total_new_jobs} unique new jobs.")

        # Re-calculate matches for Profile 1 (Aditya Tamta)
        logger.info("Re-calculating stored profile matches for Profile 1...")
        profile_obj = db.query(ProfileModel).filter(ProfileModel.id == 1).first()
        if profile_obj:
            user_skills = profile_obj.skills or []
            loc_dict = profile_obj.location if isinstance(profile_obj.location, dict) else {}
            profile_dict = {
                "skills": user_skills,
                "domains": profile_obj.domains or [],
                "location": {"city": loc_dict.get("city", "Bengaluru"), "country": loc_dict.get("country", "India")},
                "raw_resume_text": profile_obj.summary or profile_obj.raw_resume_text or ""
            }
            
            db.query(MatchModel).filter(MatchModel.profile_id == 1).delete()
            db.commit()
            
            all_active_jobs = db.query(JobModel).filter(JobModel.status == "active").all()
            new_matches = []
            
            for j in all_active_jobs:
                j_skills = j.required_skills or []
                if not j_skills and j.description:
                    j_skills = extract_skills_from_text(j.description)
                    
                j_dict = {
                    "required_skills": j_skills,
                    "title": j.role_title or "",
                    "description": j.description or "",
                    "location": j.location or "",
                    "remote": j.remote if j.remote is not None else True,
                    "domain": j.domain or "tech",
                    "is_technical": j.is_technical,
                    "source_trust_tier": j.source_trust_tier or "tier1_verified"
                }
                
                res = compute_match(profile_dict, j_dict)
                score = res["match_score"]
                
                if score >= 25.0:
                    match_obj = MatchModel(
                        profile_id=1,
                        job_id=j.id,
                        match_score=score,
                        skill_overlap_score=res["skill_overlap_score"],
                        domain_score=res["domain_score"],
                        location_score=res["location_score"],
                        semantic_score=res["semantic_score"],
                        matching_skills=res["matching_skills"],
                        matched_skills=res["matched_skills"],
                        missing_skills=res["missing_skills"],
                        matched_count=res["matched_count"],
                        required_count=res["required_count"],
                        skill_match_percentage=res["skill_match_percentage"]
                    )
                    new_matches.append(match_obj)
                    
            db.bulk_save_objects(new_matches)
            db.commit()
            
            high_matches = [m for m in new_matches if m.match_score >= 50.0]
            logger.info(f"PROFILE 1 UPDATE: Total active jobs in DB: {len(all_active_jobs)}.")
            logger.info(f"PROFILE 1 MATCHES: {len(new_matches)} matches >=25% ({len(high_matches)} strong fits >=50%).")

    finally:
        db.close()

if __name__ == "__main__":
    main()
