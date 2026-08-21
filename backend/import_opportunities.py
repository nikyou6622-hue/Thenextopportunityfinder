import sys
import os
import csv
import glob
import logging
from typing import List, Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session

from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import JobModel, ProfileModel
from backend.app.main import run_matching_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_skills_and_tags(text: str) -> List[str]:
    if not text or not isinstance(text, str):
        return []
    # Split by commas, slashes, or pipe
    delimiters = [',', '|', '/', ';']
    tokens = [text]
    for d in delimiters:
        new_tokens = []
        for t in tokens:
            new_tokens.extend(t.split(d))
        tokens = new_tokens
    
    cleaned = [t.strip() for t in tokens if t.strip() and len(t.strip()) > 1]
    return list(set(cleaned[:10]))

def import_csv_or_excel(file_path: str, db: Session) -> int:
    """Import opportunities from CSV or Excel file into JobModel database."""
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return 0

    added_count = 0
    updated_count = 0

    logger.info(f"Loading opportunities from file: {file_path}")

    # If pandas is available, it handles both csv and excel (.xlsx, .xls) seamlessly
    try:
        import pandas as pd
        if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
            df = pd.read_excel(file_path)
        else:
            df = pd.read_csv(file_path)
        
        records = df.fillna("").to_dict(orient="records")
    except Exception as e:
        logger.warning(f"Pandas read failed or not installed, falling back to csv.DictReader: {e}")
        records = []
        if file_path.endswith('.csv'):
            with open(file_path, mode='r', encoding='utf-8-sig', errors='ignore') as f:
                reader = csv.DictReader(f)
                records = list(reader)

    file_basename = os.path.basename(file_path)

    for idx, row in enumerate(records):
        # Flexible key lookup
        company = row.get("Business Name") or row.get("Company") or row.get("company") or f"Company-{idx+1}"
        industry = row.get("Industry") or row.get("domain") or "General"
        website = row.get("Website URL") or row.get("apply_url") or row.get("Website") or ""
        address = row.get("Address") or row.get("location") or "Remote"
        
        rec_services = str(row.get("Recommended Services") or "")
        role_title = row.get("role_title") or row.get("Title") or (f"Lead Opportunity ({rec_services[:30]})" if rec_services else f"{industry} Partner / Role")
        
        tech_stack = str(row.get("Tech Stack") or "")
        skills = parse_skills_and_tags(tech_stack or rec_services or industry)
        if not skills:
            skills = [industry, "Business Outreach"]

        # Rich description compilation
        desc_parts = []
        if row.get("Lead Quality Index"):
            desc_parts.append(f"Quality Index: {row.get('Lead Quality Index')}")
        if row.get("Qualification Tier"):
            desc_parts.append(f"Tier: {row.get('Qualification Tier')}")
        if row.get("Opportunity Score"):
            desc_parts.append(f"Opportunity Score: {row.get('Opportunity Score')}")
        if row.get("Key Website Flaws"):
            desc_parts.append(f"Website Flaws: {row.get('Key Website Flaws')}")
        if row.get("Recommended Services"):
            desc_parts.append(f"Recommended Services: {row.get('Recommended Services')}")
        if row.get("Tech Stack"):
            desc_parts.append(f"Tech Stack: {row.get('Tech Stack')}")
        if row.get("Primary Contact Email"):
            desc_parts.append(f"Contact Email: {row.get('Primary Contact Email')}")
        if row.get("Phone"):
            desc_parts.append(f"Phone: {row.get('Phone')}")
        if row.get("Listing Notes"):
            desc_parts.append(f"Notes: {row.get('Listing Notes')}")

        description = " | ".join(desc_parts) if desc_parts else str(row)

        rank = row.get("Rank") or idx + 1
        ext_id = f"import-{file_basename}-{rank}"

        from backend.app.agents.source_router import normalize_job_url, classify_source_platform, resolve_and_validate_apply_url
        import datetime
        raw_url = str(website).strip()
        url_norm = normalize_job_url(raw_url)
        platform = classify_source_platform(url_norm, str(row.get("Primary Contact Email") or ""))
        resolved_url, link_status = resolve_and_validate_apply_url(url_norm, check_live=False)

        existing = db.query(JobModel).filter(JobModel.external_id == ext_id).first()
        if not existing:
            job_obj = JobModel(
                company=str(company),
                role_title=str(role_title),
                location=str(address),
                remote=True if "remote" in str(address).lower() else False,
                required_skills=skills,
                domain=str(industry).lower(),
                description=description,
                apply_url=url_norm,
                apply_url_raw=raw_url,
                apply_url_resolved=resolved_url or url_norm,
                link_status=link_status,
                link_checked_at=datetime.datetime.now(datetime.timezone.utc),
                source_platform=platform.value,
                posted_date="Imported",
                source=f"Import ({file_basename})",
                external_id=ext_id
            )
            db.add(job_obj)
            added_count += 1
        else:
            existing.company = str(company)
            existing.role_title = str(role_title)
            existing.location = str(address)
            existing.required_skills = skills
            existing.domain = str(industry).lower()
            existing.description = description
            existing.apply_url = url_norm
            existing.apply_url_raw = raw_url
            existing.apply_url_resolved = resolved_url or url_norm
            existing.link_status = link_status
            existing.link_checked_at = datetime.datetime.now(datetime.timezone.utc)
            existing.source_platform = platform.value
            updated_count += 1

        db.commit()
    logger.info(f"Import finished: {added_count} new opportunities added, {updated_count} updated.")

    # Trigger matching against active profile
    profile = db.query(ProfileModel).order_by(ProfileModel.id.desc()).first()
    if profile:
        logger.info(f"Running matching pipeline for active profile ID: {profile.id}")
        run_matching_pipeline(db, profile)

    return added_count

if __name__ == "__main__":
    db = SessionLocal()
    # Target files to import
    files_to_check = [
        r"f:\Agents\output\leads.csv",
        r"f:\Agents\output\leads_filtered_genuine.csv",
        r"f:\Agents\output\leads_with_website.csv"
    ]
    total_added = 0
    for fpath in files_to_check:
        if os.path.exists(fpath):
            count = import_csv_or_excel(fpath, db)
            total_added += count
            
    total_jobs = db.query(JobModel).count()
    print(f"DONE! Imported opportunities. Total jobs now in DB: {total_jobs}")
