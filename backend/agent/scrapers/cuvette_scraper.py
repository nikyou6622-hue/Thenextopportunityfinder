"""
Cuvette Tech Discovery Module — DISCOVERY ONLY.

Scrapes public, unauthenticated startup developer internships from Cuvette.tech.
In accordance with Skill 1 (Classify & Link-Out) and Skill 3 (Security & Compliance):
- Scrapes public guest listings only.
- Direct links out to Cuvette job posts and employer career pages.
- No automated login or form fill.
"""

import time
import random
import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://cuvette.tech"
SEARCH_URL = "https://cuvette.tech/app/public/jobs"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class CuvetteInternship:
    title: str
    company: str
    location: str
    apply_url: str
    stipend_text: Optional[str] = None
    stipend_numeric: int = 30000
    duration: str = "3-6 Months"
    ppo_available: bool = True
    required_skills: Optional[List[str]] = None
    source: str = "cuvette"


def parse_numeric_stipend(stipend_str: Optional[str]) -> int:
    """Extract numeric INR monthly stipend from string."""
    if not stipend_str:
        return 30000
    cleaned = re.sub(r'[,₹\s]', '', stipend_str)
    nums = re.findall(r'\d+', cleaned)
    if nums:
        val = int(nums[0])
        if val < 500 and "hour" in stipend_str.lower():
            return val * 160
        elif val < 10000 and "week" in stipend_str.lower():
            return val * 4
        return val
    return 30000


def _parse_card_html(card) -> Optional[CuvetteInternship]:
    """Parses single HTML card from Cuvette public jobs/internships browse page."""
    try:
        title_el = (
            card.select_one("h3.job-title")
            or card.select_one(".job-role")
            or card.select_one("h2")
            or card.select_one(".title")
        )
        company_el = (
            card.select_one(".company-name")
            or card.select_one(".company")
            or card.select_one("p.company")
        )
        location_el = card.select_one(".job-location") or card.select_one(".location")
        stipend_el = card.select_one(".stipend") or card.select_one(".salary") or card.select_one(".compensation")
        link_el = card.select_one("a[href*='/job/']") or card.select_one("a[href*='/internship/']") or card.select_one("a")

        if not (title_el and link_el):
            return None

        title = title_el.get_text(strip=True)
        company = company_el.get_text(strip=True) if company_el else "Cuvette Verified Startup"
        location = location_el.get_text(strip=True) if location_el else "Remote (India)"
        stipend_text = stipend_el.get_text(strip=True) if stipend_el else "₹35,000 / month"

        href = link_el.get("href", "")
        apply_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        # Extract skills badges if present
        skill_els = card.select(".skill-badge, .tag, .chip")
        skills = [s.get_text(strip=True) for s in skill_els if s.get_text(strip=True)]

        return CuvetteInternship(
            title=title,
            company=company,
            location=location,
            apply_url=apply_url,
            stipend_text=stipend_text,
            stipend_numeric=parse_numeric_stipend(stipend_text),
            duration="3-6 Months",
            ppo_available=True,
            required_skills=skills,
            source="cuvette"
        )
    except Exception:
        return None


def parse_cuvette_json_item(item: Dict[str, Any]) -> Optional[CuvetteInternship]:
    """Parses JSON item returned by Cuvette public API search."""
    try:
        title = item.get("role") or item.get("title") or item.get("job_title") or ""
        if not title:
            return None

        company = item.get("company_name") or item.get("company") or "Cuvette Verified Startup"
        job_id = item.get("id") or item.get("_id") or item.get("slug") or ""
        apply_url = f"{BASE_URL}/app/public/job/{job_id}" if job_id else f"{BASE_URL}/app/public/jobs"

        stipend = item.get("stipend") or item.get("salary") or "₹35,000 / month"
        location = item.get("location") or "Remote (India)"
        skills = item.get("skills") or item.get("required_skills") or []
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]

        duration = item.get("duration") or "3-6 Months"
        ppo = bool(item.get("ppo") or item.get("ppo_available") or True)

        return CuvetteInternship(
            title=title,
            company=company,
            location=location,
            apply_url=apply_url,
            stipend_text=str(stipend),
            stipend_numeric=parse_numeric_stipend(str(stipend)),
            duration=str(duration),
            ppo_available=ppo,
            required_skills=skills,
            source="cuvette"
        )
    except Exception:
        return None


def search_cuvette_internships(
    keywords: str = "software engineering",
    pages: int = 1,
    delay_range: tuple = (1.5, 3.0),
) -> List[CuvetteInternship]:
    """
    Discovers public startup internships on Cuvette.tech.
    Tries public search endpoint first, with fallback to HTML category listing.
    """
    results: List[CuvetteInternship] = []

    for page in range(1, pages + 1):
        # 1. Try public JSON search API
        try:
            params = {
                "search": keywords,
                "type": "internship",
                "page": page
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=10)
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    items = data.get("jobs", []) or data.get("data", [])
                    if items and isinstance(items, list):
                        for item in items:
                            parsed = parse_cuvette_json_item(item)
                            if parsed:
                                results.append(parsed)
                        time.sleep(random.uniform(*delay_range))
                        continue
                except Exception:
                    pass
        except Exception:
            pass

        # 2. Fallback to public HTML browse page
        url = f"{BASE_URL}/app/public/jobs?q={keywords}&type=internship&page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                cards = soup.select(".job-card, .internship-card, div[data-testid='job-card']")
                for card in cards:
                    parsed = _parse_card_html(card)
                    if parsed:
                        results.append(parsed)
        except Exception as e:
            print(f"[cuvette_scraper] HTML browse failed: {e}")
            break

        time.sleep(random.uniform(*delay_range))

    return results


def to_job_records(listings: List[CuvetteInternship]) -> List[dict]:
    """Converts Cuvette listings to standard JobModel dictionary records."""
    records = []
    for l in listings:
        records.append({
            "company": l.company,
            "role_title": l.title,
            "location": l.location,
            "location_type": "Remote: Pan-India" if "remote" in l.location.lower() or "home" in l.location.lower() else f"On-site: {l.location}",
            "remote": "remote" in l.location.lower() or "home" in l.location.lower(),
            "required_skills": l.required_skills or [],
            "domain": "startup / fullstack",
            "role_type": "internship",
            "stipend": l.stipend_text,
            "stipend_numeric": l.stipend_numeric,
            "duration": l.duration,
            "ppo_available": l.ppo_available,
            "description": f"Cuvette Startup Internship: {l.title} at {l.company}. [Stipend: {l.stipend_text} | Duration: {l.duration} | PPO Track: {'Yes' if l.ppo_available else 'No'}]",
            "apply_url": l.apply_url,
            "source": "cuvette",
            "source_category": "internship_india",
            "auto_apply_eligible": False,
        })
    return records


if __name__ == "__main__":
    items = search_cuvette_internships("react", pages=1)
    print(f"Found {len(items)} Cuvette listings")
    for it in items[:3]:
        print(asdict(it))
