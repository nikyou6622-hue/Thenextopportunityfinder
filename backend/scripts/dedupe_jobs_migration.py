"""
Job Deduplication Migration Script (Batched & Fast)
===================================================
Identifies and merges duplicate job listings in small batches to avoid lock contention.
"""

import sys
sys.path.append('.')
from backend.app.db.database import SessionLocal
from sqlalchemy import text

def run_deduplication():
    db = SessionLocal()
    print("--- Running Job Database Deduplication Migration (Batched) ---")
    
    # Fetch duplicate apply_urls (limit to 100 per run for safety)
    url_dupes = db.execute(text("""
        SELECT apply_url 
        FROM jobs 
        WHERE apply_url IS NOT NULL AND apply_url != '' AND apply_url != '#' 
        GROUP BY apply_url 
        HAVING COUNT(id) > 1
        LIMIT 100
    """)).fetchall()

    total_urls = 0
    for row in url_dupes:
        url = row[0]
        job_rows = db.execute(text("SELECT id FROM jobs WHERE apply_url = :u ORDER BY id ASC"), {"u": url}).fetchall()
        if len(job_rows) <= 1:
            continue
        
        dup_ids = [r[0] for r in job_rows[1:]]
        for dup_id in dup_ids:
            db.execute(text("DELETE FROM application_events WHERE application_id IN (SELECT id FROM applications WHERE job_id = :jid)"), {"jid": dup_id})
            db.execute(text("DELETE FROM applications WHERE job_id = :jid"), {"jid": dup_id})
            db.execute(text("DELETE FROM matches WHERE job_id = :jid"), {"jid": dup_id})
            db.execute(text("DELETE FROM jobs WHERE id = :jid"), {"jid": dup_id})
            total_urls += 1
        db.commit()

    # Fetch duplicate (company, role_title)
    role_dupes = db.execute(text("""
        SELECT company, role_title 
        FROM jobs 
        WHERE company IS NOT NULL AND role_title IS NOT NULL 
        GROUP BY company, role_title 
        HAVING COUNT(id) > 1
        LIMIT 100
    """)).fetchall()

    total_roles = 0
    for row in role_dupes:
        comp, title = row[0], row[1]
        job_rows = db.execute(text("SELECT id FROM jobs WHERE company = :c AND role_title = :t ORDER BY id ASC"), {"c": comp, "t": title}).fetchall()
        if len(job_rows) <= 1:
            continue
        
        dup_ids = [r[0] for r in job_rows[1:]]
        for dup_id in dup_ids:
            db.execute(text("DELETE FROM application_events WHERE application_id IN (SELECT id FROM applications WHERE job_id = :jid)"), {"jid": dup_id})
            db.execute(text("DELETE FROM applications WHERE job_id = :jid"), {"jid": dup_id})
            db.execute(text("DELETE FROM matches WHERE job_id = :jid"), {"jid": dup_id})
            db.execute(text("DELETE FROM jobs WHERE id = :jid"), {"jid": dup_id})
            total_roles += 1
        db.commit()

    db.close()
    print(f"[SUCCESS] Database Deduplication Complete! Pruned {total_urls} URL dupes and {total_roles} role title dupes.")

if __name__ == "__main__":
    run_deduplication()
