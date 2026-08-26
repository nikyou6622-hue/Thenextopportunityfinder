"""
Unstop Discovery Module — DISCOVERY ONLY.

Scrapes public, unauthenticated internship listings, hackathons, and hiring challenges
from Unstop (formerly Dare2Compete).
In accordance with Skill 1 (Classify & Link-Out) and Skill 3 (Security & Compliance):
- Scrapes public guest listings only.
- Never automates user authentication or application submissions.
- Applications link out directly to Unstop or the sponsoring employer portal.
"""

import time
import random
import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://unstop.com"
SEARCH_URL = "https://unstop.com/api/public/opportunity/search-result"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class UnstopInternship:
    title: str
    company: str
    location: str
    apply_url: str
    stipend_text: Optional[str] = None
    stipend_numeric: int = 25000
    duration: str = "3-6 Months"
    ppo_available: bool = True
    deadline: Optional[str] = None
    required_skills: Optional[List[str]] = None
    source: str = "unstop"


def parse_numeric_stipend(stipend_str: Optional[str]) -> int:
    """Extract numeric INR monthly stipend from string."""
    if not stipend_str:
        return 25000
    cleaned = re.sub(r'[,INR \s]', '', stipend_str)
    nums = re.findall(r'\d+', cleaned)
    if nums:
        val = int(nums[0])
        if val < 500 and "hour" in stipend_str.lower():
            return val * 160
        elif val < 10000 and "week" in stipend_str.lower():
            return val * 4
        return val
    return 25000


def _parse_card_html(card) -> Optional[UnstopInternship]:
    """Parses single HTML card from Unstop listing page."""
    try:
        title_el = (
            card.select_one("h3.opportunity_title")
            or card.select_one(".title")
            or card.select_one("h2")
            or card.select_one(".competition_name")
        )
        company_el = (
            card.select_one(".organisation_name")
            or card.select_one(".company_name")
            or card.select_one("p.org_title")
        )
        location_el = card.select_one(".location") or card.select_one(".place")
        stipend_el = (
            card.select_one(".stipend_value")
            or card.select_one(".prize_money")
            or card.select_one(".salary")
        )
        link_el = card.select_one("a[href*='/internships/']") or card.select_one("a[href*='/competitions/']") or card.select_one("a")

        if not (title_el and link_el):
            return None

        title = title_el.get_text(strip=True)
        company = company_el.get_text(strip=True) if company_el else "Unstop Partner Employer"
        location = location_el.get_text(strip=True) if location_el else "Remote (India)"
        stipend_text = stipend_el.get_text(strip=True) if stipend_el else "INR 30,000 / month"

        href = link_el.get("href", "")
        apply_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        ppo_available = bool(
            "ppo" in title.lower()
            or "pre-placement" in title.lower()
            or "hiring" in title.lower()
            or "challenge" in title.lower()
        )

        return UnstopInternship(
            title=title,
            company=company,
            location=location,
            apply_url=apply_url,
            stipend_text=stipend_text,
            stipend_numeric=parse_numeric_stipend(stipend_text),
            duration="3-6 Months",
            ppo_available=ppo_available,
            required_skills=[],
            source="unstop"
        )
    except Exception:
        return None


def parse_unstop_json_item(item: Dict[str, Any]) -> Optional[UnstopInternship]:
    """Parses JSON item returned by Unstop public API search endpoint."""
    try:
        title = item.get("title") or item.get("opportunity_title") or ""
        if not title:
            return None

        org = item.get("organisation", {})
        company = org.get("name") if isinstance(org, dict) else (item.get("organisation_name") or "Unstop Partner Employer")

        slug = item.get("public_url") or item.get("slug") or ""
        if slug.startswith("http"):
            apply_url = slug
        elif slug:
            apply_url = f"{BASE_URL}/internships/{slug}"
        else:
            apply_url = f"{BASE_URL}/internships"

        stipend = item.get("stipend") or item.get("salary_detail") or "INR 30,000 / month"
        location = item.get("location") or item.get("region") or "Remote (India)"

        ppo = bool(
            item.get("is_ppo_available")
            or "ppo" in title.lower()
            or "hiring" in title.lower()
        )

        return UnstopInternship(
            title=title,
            company=company,
            location=location,
            apply_url=apply_url,
            stipend_text=str(stipend),
            stipend_numeric=parse_numeric_stipend(str(stipend)),
            duration="3-6 Months",
            ppo_available=ppo,
            deadline=item.get("end_date"),
            source="unstop"
        )
    except Exception:
        return None


def search_unstop_internships(
    keywords: str = "software engineering",
    pages: int = 1,
    delay_range: tuple = (1.5, 3.0),
) -> List[UnstopInternship]:
    """
    Discovers public internships and hiring challenges on Unstop.
    Tries public search endpoint first, with fallback to HTML category listing.
    """
    results: List[UnstopInternship] = []

    for page in range(1, pages + 1):
        # 1. Try public JSON search API
        try:
            params = {
                "opportunity": "internships",
                "searchTerm": keywords,
                "page": page,
                "size": 15
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=10)
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    items = data.get("data", {}).get("data", []) or data.get("data", [])
                    if items and isinstance(items, list):
                        for item in items:
                            parsed = parse_unstop_json_item(item)
                            if parsed:
                                results.append(parsed)
                        time.sleep(random.uniform(*delay_range))
                        continue
                except Exception:
                    pass
        except Exception:
            pass

        # 2. Fallback to public HTML browse page
        slug = keywords.strip().lower().replace(" ", "-")
        url = f"{BASE_URL}/internships/{slug}?page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                cards = soup.select(".opportunity_card, .single_opportunity, .item_card")
                for card in cards:
                    parsed = _parse_card_html(card)
                    if parsed:
                        results.append(parsed)
        except Exception as e:
            print(f"[unstop_scraper] HTML browse failed: {e}")
            break

        time.sleep(random.uniform(*delay_range))

    return results


def to_job_records(listings: List[UnstopInternship]) -> List[dict]:
    """Converts Unstop listings to standard JobModel dictionary records."""
    records = []
    for l in listings:
        records.append({
            "company": l.company,
            "role_title": l.title,
            "location": l.location,
            "location_type": "Remote: Pan-India" if "remote" in l.location.lower() or "home" in l.location.lower() else f"On-site: {l.location}",
            "remote": "remote" in l.location.lower() or "home" in l.location.lower(),
            "required_skills": l.required_skills or [],
            "domain": "web-dev / engineering",
            "role_type": "internship",
            "stipend": l.stipend_text,
            "stipend_numeric": l.stipend_numeric,
            "duration": l.duration,
            "ppo_available": l.ppo_available,
            "description": f"Unstop Opportunity: {l.title} at {l.company}. [Stipend: {l.stipend_text} | Duration: {l.duration} | PPO: {'Yes' if l.ppo_available else 'No'}]",
            "apply_url": l.apply_url,
            "source": "unstop",
            "source_category": "internship_india",
            "auto_apply_eligible": False,
        })
    return records


if __name__ == "__main__":
    items = search_unstop_internships("python", pages=1)
    print(f"Found {len(items)} Unstop listings")
    for it in items[:3]:
        print(asdict(it))
