"""
Indeed Discovery Module — DISCOVERY ONLY, same rules as linkedin_scraper.py.

Scrapes Indeed's public search results (no login). Indeed's own "Apply"
flow (native, on indeed.com) also gets bot-detected and is against their
ToS to automate — so like LinkedIn, jobs found here go to manual review
UNLESS the listing's apply link redirects out to the company's own ATS
(Greenhouse/Lever/etc.), which the router already handles.
"""

import time
import random
from dataclasses import dataclass
from typing import List, Optional
import requests
from bs4 import BeautifulSoup

SEARCH_URL = "https://www.indeed.com/jobs"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class IndeedJob:
    title: str
    company: str
    location: str
    apply_url: str
    summary: Optional[str]
    source: str = "indeed"


def _parse_card(card) -> Optional[IndeedJob]:
    try:
        title_el = card.select_one("h2.jobTitle span")
        company_el = card.select_one("span.companyName")
        location_el = card.select_one("div.companyLocation")
        link_el = card.select_one("h2.jobTitle a")
        summary_el = card.select_one("div.job-snippet")

        if not (title_el and link_el):
            return None

        href = link_el.get("href", "")
        apply_url = f"https://www.indeed.com{href}" if href.startswith("/") else href

        return IndeedJob(
            title=title_el.get_text(strip=True),
            company=company_el.get_text(strip=True) if company_el else "",
            location=location_el.get_text(strip=True) if location_el else "",
            apply_url=apply_url,
            summary=summary_el.get_text(strip=True) if summary_el else None,
        )
    except Exception:
        return None


def search_indeed_jobs(
    keywords: str,
    location: str = "",
    pages: int = 1,
    delay_range: tuple = (2.5, 4.5),
) -> List[IndeedJob]:
    results: List[IndeedJob] = []

    for page in range(pages):
        params = {"q": keywords, "l": location, "start": page * 10}
        try:
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=15)
        except requests.RequestException as e:
            print(f"[indeed_scraper] request failed page {page}: {e}")
            break

        if resp.status_code != 200:
            print(f"[indeed_scraper] status {resp.status_code}, stopping (Indeed rate-limits aggressively — slow down or use fewer pages)")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.job_seen_beacon") or soup.select("td.resultContent")

        page_jobs = [j for j in (_parse_card(c) for c in cards) if j]
        if not page_jobs:
            break

        results.extend(page_jobs)
        time.sleep(random.uniform(*delay_range))

    return results


def to_job_records(jobs: List[IndeedJob]) -> List[dict]:
    records = []
    for j in jobs:
        records.append({
            "company": j.company,
            "role_title": j.title,
            "location": j.location,
            "remote": "remote" in (j.location or "").lower(),
            "required_skills": [],
            "domain": "",
            "description": j.summary or "",
            "apply_url": j.apply_url,
            "posted_date": None,
            "source": "indeed",
            "auto_apply_eligible": False,  # enforced again in the router
        })
    return records


if __name__ == "__main__":
    jobs = search_indeed_jobs("backend developer", location="Delhi", pages=1)
    for j in jobs[:5]:
        print(j)
