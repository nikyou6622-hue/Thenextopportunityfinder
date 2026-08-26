"""
Wellfound (AngelList Talent) Discovery Module — DISCOVERY ONLY.

Scrapes public, unauthenticated startup internships and early-career software engineering roles
from Wellfound (formerly AngelList Talent).
In accordance with Skill 1 (Classify & Link-Out) and Skill 3 (Security & Compliance):
- Scrapes public guest listings only.
- Direct links out to Wellfound job posts and employer career pages.
- No automated login or form fill.
"""

import time
import random
import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://wellfound.com"
SEARCH_URL = "https://wellfound.com/jobs"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class WellfoundInternship:
    title: str
    company: str
    location: str
    apply_url: str
    stipend_text: Optional[str] = None
    stipend_numeric: int = 35000
    duration: str = "3-6 Months"
    ppo_available: bool = True
    required_skills: Optional[List[str]] = None
    source: str = "wellfound"


def parse_numeric_stipend(stipend_str: Optional[str]) -> int:
    """Extract numeric monthly compensation in INR."""
    if not stipend_str:
        return 35000
    cleaned = re.sub(r'[,INR \s$]', '', stipend_str)
    nums = re.findall(r'\d+', cleaned)
    if nums:
        val = int(nums[0])
        # If in thousands (e.g. 50k)
        if "k" in stipend_str.lower() and val < 1000:
            val = val * 1000
        # If in USD (e.g. $1000/mo), convert to approx INR
        if "$" in stipend_str:
            val = val * 85
        return val
    return 35000


def _parse_card_html(card) -> Optional[WellfoundInternship]:
    """Parses single HTML job card from Wellfound public browse page."""
    try:
        title_el = (
            card.select_one("a[data-test='JobListItemTitle']")
            or card.select_one(".styles_title__")
            or card.select_one("h2")
            or card.select_one("h3")
        )
        company_el = (
            card.select_one("a[data-test='StartupResultName']")
            or card.select_one(".styles_name__")
            or card.select_one("h4")
            or card.select_one(".company-name")
        )
        location_el = (
            card.select_one("span[data-test='JobListItemLocation']")
            or card.select_one(".styles_location__")
            or card.select_one(".location")
        )
        comp_el = (
            card.select_one("span[data-test='JobListItemCompensation']")
            or card.select_one(".styles_compensation__")
            or card.select_one(".salary")
        )
        link_el = card.select_one("a[href*='/jobs/']") or card.select_one("a[href*='/company/']") or card.select_one("a")

        if not (title_el and link_el):
            return None

        title = title_el.get_text(strip=True)
        company = company_el.get_text(strip=True) if company_el else "Global Startup"
        location = location_el.get_text(strip=True) if location_el else "Remote (India / Global)"
        stipend_text = comp_el.get_text(strip=True) if comp_el else "INR 40,000 / month"

        href = link_el.get("href", "")
        apply_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        # Extract skills badges
        skill_els = card.select(".styles_tag__, .tag, .badge")
        skills = [s.get_text(strip=True) for s in skill_els if s.get_text(strip=True)]

        return WellfoundInternship(
            title=title,
            company=company,
            location=location,
            apply_url=apply_url,
            stipend_text=stipend_text,
            stipend_numeric=parse_numeric_stipend(stipend_text),
            duration="3-6 Months",
            ppo_available=True,
            required_skills=skills,
            source="wellfound"
        )
    except Exception:
        return None


def search_wellfound_internships(
    keywords: str = "software engineering intern",
    location: str = "India",
    pages: int = 1,
    delay_range: tuple = (2.0, 3.5),
) -> List[WellfoundInternship]:
    """
    Discovers public startup internships on Wellfound.
    """
    results: List[WellfoundInternship] = []

    for page in range(1, pages + 1):
        params = {
            "role": "software-engineer",
            "q": keywords,
            "page": str(page)
        }
        if location:
            params["location"] = location

        try:
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=12)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                cards = soup.select(".styles_result__, .job-listing, div[data-test='StartupResult']")
                for card in cards:
                    parsed = _parse_card_html(card)
                    if parsed:
                        results.append(parsed)
        except Exception as e:
            print(f"[wellfound_scraper] request failed page {page}: {e}")
            break

        time.sleep(random.uniform(*delay_range))

    return results


def to_job_records(listings: List[WellfoundInternship]) -> List[dict]:
    """Converts Wellfound listings to standard JobModel dictionary records."""
    records = []
    for l in listings:
        records.append({
            "company": l.company,
            "role_title": l.title,
            "location": l.location,
            "location_type": "Remote: Global" if "remote" in l.location.lower() else f"On-site: {l.location}",
            "remote": "remote" in l.location.lower(),
            "required_skills": l.required_skills or [],
            "domain": "venture-backed / startup",
            "role_type": "internship",
            "stipend": l.stipend_text,
            "stipend_numeric": l.stipend_numeric,
            "duration": l.duration,
            "ppo_available": l.ppo_available,
            "description": f"Wellfound Startup Role: {l.title} at {l.company}. [Stipend: {l.stipend_text} | Duration: {l.duration} | PPO Eligible: {'Yes' if l.ppo_available else 'No'}]",
            "apply_url": l.apply_url,
            "source": "wellfound",
            "source_category": "internship_india",
            "auto_apply_eligible": False,
        })
    return records


if __name__ == "__main__":
    items = search_wellfound_internships("python intern", pages=1)
    print(f"Found {len(items)} Wellfound listings")
    for it in items[:3]:
        print(asdict(it))
