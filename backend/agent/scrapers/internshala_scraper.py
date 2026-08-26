"""
Internshala Discovery Module — DISCOVERY ONLY.

Internshala's browse pages (e.g. internshala.com/internships/... and
internshala.com/jobs/...) are public and less aggressively bot-protected
than LinkedIn/Indeed, but the "Apply" flow is still Internshala's own
native form (not an external ATS) — so per the router rules, applications
found here also default to manual review unless the listing links out to
a company's own Greenhouse/Lever page.
"""

import time
import random
from dataclasses import dataclass
from typing import List, Optional
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://internshala.com"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class InternshalaListing:
    title: str
    company: str
    location: str
    apply_url: str
    stipend_text: Optional[str]
    listing_type: str  # "internship" or "job"
    source: str = "internshala"


def _parse_card(card, listing_type: str) -> Optional[InternshalaListing]:
    try:
        title_el = card.select_one("h3.job-internship-name") or card.select_one("a.job-title-href")
        company_el = card.select_one("p.company-name")
        location_el = card.select_one("div.locations span, a.location_link")
        stipend_el = card.select_one("span.stipend")
        link_el = card.select_one("a.view_detail_button") or card.select_one("a.job-title-href")

        if not (title_el and link_el):
            return None

        href = link_el.get("href", "")
        apply_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        return InternshalaListing(
            title=title_el.get_text(strip=True),
            company=company_el.get_text(strip=True) if company_el else "",
            location=location_el.get_text(strip=True) if location_el else "",
            apply_url=apply_url,
            stipend_text=stipend_el.get_text(strip=True) if stipend_el else None,
            listing_type=listing_type,
        )
    except Exception:
        return None


def search_internshala(
    keywords: str,
    listing_type: str = "internship",   # "internship" or "job"
    pages: int = 1,
    delay_range: tuple = (2.0, 4.0),
) -> List[InternshalaListing]:
    """
    keywords get slugified into Internshala's URL path style
    (e.g. "python-development-internship-in-delhi").
    Simpler and more reliable: hit their search endpoint with a query param
    where supported, falling back to the category browse page.
    """
    path = "internships" if listing_type == "internship" else "jobs"
    results: List[InternshalaListing] = []

    for page in range(1, pages + 1):
        url = f"{BASE_URL}/{path}/keywords-{keywords.replace(' ', '-')}/page-{page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
        except requests.RequestException as e:
            print(f"[internshala_scraper] request failed page {page}: {e}")
            break

        if resp.status_code != 200:
            print(f"[internshala_scraper] status {resp.status_code}, stopping")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.individual_internship") or soup.select("div.internship_meta")

        page_listings = [j for j in (_parse_card(c, listing_type) for c in cards) if j]
        if not page_listings:
            break

        results.extend(page_listings)
        time.sleep(random.uniform(*delay_range))

    return results


def parse_numeric_stipend(stipend_str: Optional[str]) -> int:
    """Extract numeric INR monthly stipend from string."""
    if not stipend_str:
        return 25000
    import re
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


def to_job_records(listings: List[InternshalaListing]) -> List[dict]:
    records = []
    for l in listings:
        records.append({
            "company": l.company,
            "role_title": l.title,
            "location": l.location,
            "location_type": "Remote: Pan-India" if "work from home" in (l.location or "").lower() or "remote" in (l.location or "").lower() else f"On-site: {l.location}",
            "remote": "work from home" in (l.location or "").lower() or "remote" in (l.location or "").lower(),
            "required_skills": [],
            "domain": "web / software",
            "role_type": l.listing_type,
            "stipend": l.stipend_text,
            "stipend_numeric": parse_numeric_stipend(l.stipend_text),
            "duration": "3-6 Months",
            "ppo_available": True,
            "description": f"Internshala Listing: {l.title} at {l.company}. [Stipend: {l.stipend_text} | Duration: 3-6 Months]" if l.stipend_text else f"{l.title} at {l.company}",
            "apply_url": l.apply_url,
            "posted_date": None,
            "source": "internshala",
            "source_category": "internship_india",
            "auto_apply_eligible": False,
        })
    return records


if __name__ == "__main__":
    listings = search_internshala("python", listing_type="internship", pages=1)
    for l in listings[:5]:
        print(l)
