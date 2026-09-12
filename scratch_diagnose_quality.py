import sys, os, datetime
sys.path.insert(0, os.getcwd())
from backend.app.db.database import SessionLocal
from backend.app.db.models import JobModel

db = SessionLocal()
try:
    now = datetime.datetime.now(datetime.timezone.utc)
    thirty_days_ago = now - datetime.timedelta(days=30)
    
    jobs = db.query(JobModel).filter(JobModel.created_at >= thirty_days_ago).all()
    print(f"Total jobs in last 30 days: {len(jobs)}")
    
    sources = {}
    total_active_48h = 0
    total_career_page_48h = 0

    for j in jobs:
        src = j.source_platform or j.source or "unknown"
        if src not in sources:
            sources[src] = {
                "total": 0,
                "high_value": 0,
                "senior_staff": 0,
                "remote": 0,
                "total_age_days": 0.0,
                "link_active_48h": 0,
                "link_total_48h": 0
            }
        
        s = sources[src]
        s["total"] += 1
        
        text = f"{j.role_title} {j.description}".lower()
        if any(kw in text for kw in ["ai/ml", "ai", "ml", "golang", "rust", "kubernetes", "distributed systems", "staff", "principal", "remote", "equity"]):
            s["high_value"] += 1
            
        if any(kw in (j.role_title or "").lower() for kw in ["staff", "principal", "lead", "senior", "sr"]):
            s["senior_staff"] += 1
            
        if j.remote or "remote" in (j.location or "").lower():
            s["remote"] += 1
            
        created = j.created_at.replace(tzinfo=datetime.timezone.utc) if j.created_at.tzinfo is None else j.created_at
        age_days = (now - created).total_seconds() / 86400.0
        s["total_age_days"] += age_days

        if age_days >= 2.0:
            s["link_total_48h"] += 1
            if j.link_status == "live" or j.status == "active":
                s["link_active_48h"] += 1

    print("\n--- PHASE 1.1 QUALITY BOTTLENECK DIAGNOSIS ---")
    print(f"{'Source':<20} | {'Total Jobs':<10} | {'High-Value':<10} | {'Senior/Staff':<12} | {'Remote':<8} | {'48h Active %':<12} | {'Avg Age (days)':<14}")
    print("-" * 100)
    
    for src, s in sources.items():
        avg_age = round(s["total_age_days"] / s["total"], 1) if s["total"] else 0.0
        active_pct = round((s["link_active_48h"] / s["link_total_48h"]) * 100.0, 1) if s["link_total_48h"] else 100.0
        print(f"{src:<20} | {s['total']:<10} | {s['high_value']:<10} | {s['senior_staff']:<12} | {s['remote']:<8} | {active_pct:<11}% | {avg_age:<14}")

finally:
    db.close()
