import sys
import json
import os
from collections import Counter

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.database import SessionLocal
from backend.app.db.models import JobModel, MatchModel, ProfileModel

def generate_report():
    db = SessionLocal()
    jobs = db.query(JobModel).order_by(JobModel.id.asc()).all()
    matches = db.query(MatchModel).order_by(MatchModel.match_score.desc()).all()
    profile = db.query(ProfileModel).order_by(ProfileModel.id.desc()).first()

    total_jobs = len(jobs)
    domain_counts = Counter([j.domain for j in jobs])
    source_counts = Counter([j.source for j in jobs])

    report_lines = []
    report_lines.append("# 💼 Imported Opportunities Overview\n")
    report_lines.append(f"**Total Opportunities Loaded:** `{total_jobs}`\n")
    if profile:
        report_lines.append(f"**Matched Candidate Profile:** {profile.name} ({', '.join(profile.skills or [])})\n")
    
    report_lines.append("## 📊 Breakdown by Domain / Industry\n")
    report_lines.append("| Domain / Industry | Opportunity Count | Share % |")
    report_lines.append("| :--- | :---: | :---: |")
    for dom, cnt in domain_counts.most_common(15):
        pct = round((cnt / total_jobs) * 100, 1)
        report_lines.append(f"| **{dom.title()}** | {cnt} | {pct}% |")

    report_lines.append("\n## 🎯 Top High-Match Opportunities\n")
    report_lines.append("| Rank | Company | Role / Opportunity Title | Location | Domain | Skills Needed | Match Score | Link |")
    report_lines.append("| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: |")

    match_map = {m.job_id: m for m in matches}
    sorted_jobs = sorted(jobs, key=lambda j: match_map.get(j.id).match_score if match_map.get(j.id) else 0, reverse=True)

    for idx, j in enumerate(sorted_jobs[:50], 1):
        m = match_map.get(j.id)
        score = f"{m.match_score:.1f}%" if m else "N/A"
        skills = ", ".join(j.required_skills[:3]) if j.required_skills else "General"
        url = f"[View]({j.apply_url})" if j.apply_url and j.apply_url.startswith("http") else "N/A"
        report_lines.append(f"| #{idx} | **{j.company}** | {j.role_title} | {j.location} | {j.domain} | {skills} | `{score}` | {url} |")

    report_lines.append("\n## 📁 All Opportunities Catalog (Sample Breakdown by Industry)\n")
    
    # Group by domain
    domain_groups = {}
    for j in jobs:
        d = j.domain.title()
        if d not in domain_groups:
            domain_groups[d] = []
        domain_groups[d].append(j)

    for d_name, d_jobs in list(domain_groups.items())[:10]:
        report_lines.append(f"### 🏢 Industry: {d_name} ({len(d_jobs)} opportunities)")
        report_lines.append("| Company | Opportunity Title | Location | Recommended Services / Tech | Link |")
        report_lines.append("| :--- | :--- | :--- | :--- | :---: |")
        for j in d_jobs[:8]:
            tech = j.description[:60] + "..." if len(j.description) > 60 else j.description
            url = f"[Link]({j.apply_url})" if j.apply_url and j.apply_url.startswith("http") else "-"
            report_lines.append(f"| **{j.company}** | {j.role_title} | {j.location} | {tech} | {url} |")
        report_lines.append("")

    report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "opportunities_catalog.md"))
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"Report written successfully to {report_path}")

if __name__ == "__main__":
    generate_report()
