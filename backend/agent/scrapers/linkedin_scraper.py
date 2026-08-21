"""
LinkedIn Discovery Module — DISCOVERY ONLY.

IMPORTANT: This module scrapes LinkedIn's PUBLIC, unauthenticated job-search
result pages only (the guest view you get without logging in). It never
logs into an account, never automates "Easy Apply", and never submits
anything on linkedin.com. Jobs found here always get routed to the
manual-review queue (see routing/source_router.py) — never full-auto-apply.

Why this design:
- Logging in + automating LinkedIn's UI violates their ToS and risks a
  permanent account ban (their bot-detection is aggressive).
- The public guest search pages are the same pages Google indexes; scraping
  them is lower-risk, but still rate-limit yourself and expect the markup
  to change over time (LinkedIn updates their frontend often).

Usage:
    from linkedin_scraper import search_linkedin_jobs
    jobs = search_linkedin_jobs("python developer", location="India", pages=2)
"""

import time
import random
import re
from dataclasses import dataclass, asdict
from typing import List, Optional
import requests
from bs4 import BeautifulSoup

GUEST_SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class LinkedInJob:
    title: str
    company: str
    location: str
    apply_url: str
    posted_text: Optional[str]
    source: str = "linkedin"


def _parse_job_card(card) -> Optional[LinkedInJob]:
    try:
        title_el = card.select_one("h3.base-search-card__title")
        company_el = card.select_one("h4.base-search-card__subtitle")
        location_el = card.select_one("span.job-search-card__location")
        link_el = card.select_one("a.base-card__full-link")
        time_el = card.select_one("time")

        if not (title_el and company_el and link_el):
            return None

        return LinkedInJob(
            title=title_el.get_text(strip=True),
            company=company_el.get_text(strip=True),
            location=location_el.get_text(strip=True) if location_el else "",
            apply_url=link_el["href"].split("?")[0],
            posted_text=time_el.get_text(strip=True) if time_el else None,
        )
    except Exception:
        return None


def search_linkedin_jobs(
    keywords: str,
    location: str = "",
    pages: int = 1,
    delay_range: tuple = (2.0, 4.0),
) -> List[LinkedInJob]:
    """
    Scrapes LinkedIn's public guest job-search results.

    pages: number of result pages (each page = 25 results). Keep this low
    (1-3) and always keep delay_range active — this is a courtesy rate
    limit, not optional.
    """
    results: List[LinkedInJob] = []

    for page in range(pages):
        params = {
            "keywords": keywords,
            "location": location,
            "start": page * 25,
        }
        try:
            resp = requests.get(
                GUEST_SEARCH_URL, headers=HEADERS, params=params, timeout=15
            )
        except requests.RequestException as e:
            print(f"[linkedin_scraper] request failed on page {page}: {e}")
            break

        if resp.status_code != 200:
            print(f"[linkedin_scraper] got status {resp.status_code}, stopping")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.base-card") or soup.select("li")

        page_jobs = [j for j in (_parse_job_card(c) for c in cards) if j]
        if not page_jobs:
            break

        results.extend(page_jobs)
        time.sleep(random.uniform(*delay_range))

    return results


def to_job_records(jobs: List[LinkedInJob]) -> List[dict]:
    """Convert to the shared job schema used by Agent 3 (storage/matching)."""
    records = []
    for j in jobs:
        records.append({
            "company": j.company,
            "role_title": j.title,
            "location": j.location,
            "remote": "remote" in (j.location or "").lower(),
            "required_skills": [],   # filled in later by the skill-extraction pass
            "domain": "",
            "description": "",       # LinkedIn guest search doesn't expose full JD; fetch apply_url page separately if needed
            "apply_url": j.apply_url,
            "posted_date": j.posted_text,
            "source": "linkedin",
            "auto_apply_eligible": False,   # ALWAYS false — enforced again in the router
        })
    return records


if __name__ == "__main__":
    jobs = search_linkedin_jobs("backend developer startup", location="India", pages=1)
    for j in jobs[:5]:
        print(asdict(j))
