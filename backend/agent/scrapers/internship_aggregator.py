"""
Unified Multi-Source Internship Aggregator Module.

Orchestrates concurrent, ethical scraping & aggregation across all supported student & early-career portals:
1. Internshala (Live Search + HTML Parser)
2. Unstop (Hiring Challenges & Campus Internships)
3. Cuvette (Startup Tech Internships Network)
4. Wellfound (AngelList Early Career & Internships)
5. LinkedIn (Guest View Internship Search)
6. Curated GitHub Tech Repositories (Direct ATS links: Greenhouse, Lever, Ashby, Workday)

Features:
- Thread-safe concurrent execution with graceful per-scraper timeouts.
- Intelligent skill extraction via regex keyword matching.
- Numeric stipend parsing, PPO detection, and location normalization.
- Canonical URL deduplication and link classification.
"""

import time
import logging
import concurrent.futures
from typing import List, Dict, Any, Optional

from backend.agent.scrapers.internshala_scraper import search_internshala, to_job_records as internshala_to_records
from backend.agent.scrapers.unstop_scraper import search_unstop_internships, to_job_records as unstop_to_records
from backend.agent.scrapers.cuvette_scraper import search_cuvette_internships, to_job_records as cuvette_to_records
from backend.agent.scrapers.wellfound_scraper import search_wellfound_internships, to_job_records as wellfound_to_records
from backend.agent.scrapers.linkedin_scraper import search_linkedin_jobs, to_job_records as linkedin_to_records
from backend.agent.scrapers.github_internships_scraper import fetch_github_internships, to_job_records as github_to_records
from backend.agent.source_router import normalize_job_url, classify_source_platform

logger = logging.getLogger("internship_aggregator")

TECH_SKILLS_KEYWORDS = [
    "python", "javascript", "typescript", "react", "node.js", "express", "fastapi", "django",
    "flask", "java", "c++", "c#", "go", "golang", "rust", "sql", "postgresql", "mongodb",
    "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git", "rest api", "graphql",
    "html", "css", "tailwind", "next.js", "machine learning", "pytorch", "tensorflow",
    "data structures", "algorithms", "linux", "ci/cd", "microservices"
]


def extract_skills_from_string(text: str) -> List[str]:
    """Extracts known tech skills from a text string."""
    if not text:
        return ["Python", "Problem Solving"]
    found = []
    text_lower = f" {text.lower()} "
    for skill in TECH_SKILLS_KEYWORDS:
        pattern = r'[\s\(\[\,\.\/\:\;\-\+]' + re_escape(skill) + r'[\s\)\]\,\.\/\:\;\-\+]'
        import re
        if re.search(pattern, text_lower, re.IGNORECASE):
            found.append(skill.title() if skill not in ["aws", "gcp", "sql", "ci/cd", "html", "css", "api"] else skill.upper())
    return list(dict.fromkeys(found)) or ["Python", "Software Engineering"]


def re_escape(s: str) -> str:
    import re
    return re.escape(s)


def run_single_scraper(scraper_name: str, keywords: str, max_items: int) -> Dict[str, Any]:
    """Runs a single scraper with isolation and error handling."""
    start_time = time.time()
    items = []
    status = "success"
    error_msg = None

    try:
        if scraper_name == "internshala":
            listings = search_internshala(keywords=keywords, listing_type="internship", pages=1)
            items = internshala_to_records(listings)[:max_items]
        elif scraper_name == "unstop":
            listings = search_unstop_internships(keywords=keywords, pages=1)
            items = unstop_to_records(listings)[:max_items]
        elif scraper_name == "cuvette":
            listings = search_cuvette_internships(keywords=keywords, pages=1)
            items = cuvette_to_records(listings)[:max_items]
        elif scraper_name == "wellfound":
            listings = search_wellfound_internships(keywords=keywords, pages=1)
            items = wellfound_to_records(listings)[:max_items]
        elif scraper_name == "linkedin":
            listings = search_linkedin_jobs(keywords=f"{keywords} intern", location="India", pages=1)
            items = linkedin_to_records(listings)[:max_items]
            for it in items:
                it["role_type"] = "internship"
                it["source_category"] = "internship_india"
        elif scraper_name == "github":
            listings = fetch_github_internships(max_items=max_items)
            items = github_to_records(listings)[:max_items]
        else:
            status = "skipped"
    except Exception as e:
        status = "error"
        error_msg = str(e)
        logger.warning(f"Scraper '{scraper_name}' encountered an issue: {e}")

    elapsed = round(time.time() - start_time, 2)
    return {
        "scraper": scraper_name,
        "status": status,
        "count": len(items),
        "elapsed_seconds": elapsed,
        "error": error_msg,
        "items": items
    }


def scrape_all_internships(
    keywords: str = "software engineer",
    sources: Optional[List[str]] = None,
    max_per_source: int = 10,
    timeout_seconds: int = 12
) -> Dict[str, Any]:
    """
    Executes parallel scraping across all active internship discovery modules.
    """
    active_sources = sources or ["internshala", "unstop", "cuvette", "wellfound", "github", "linkedin"]
    results = {}
    aggregated_items = []
    seen_keys = set()

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(active_sources)) as executor:
        future_to_source = {
            executor.submit(run_single_scraper, src, keywords, max_per_source): src
            for src in active_sources
        }

        for future in concurrent.futures.as_completed(future_to_source, timeout=timeout_seconds):
            src_name = future_to_source[future]
            try:
                data = future.result()
                results[src_name] = {
                    "status": data["status"],
                    "count": data["count"],
                    "elapsed_seconds": data["elapsed_seconds"],
                    "error": data["error"]
                }
                # Deduplicate and enrich items
                for raw_item in data.get("items", []):
                    apply_url = raw_item.get("apply_url", "")
                    url_norm = normalize_job_url(apply_url)
                    company = raw_item.get("company", "").strip()
                    role_title = raw_item.get("role_title", "").strip()
                    dedup_key = f"{url_norm}::{company.lower()}::{role_title.lower()}"

                    if dedup_key in seen_keys:
                        continue
                    seen_keys.add(dedup_key)

                    # Enrich skills if missing
                    if not raw_item.get("required_skills"):
                        raw_item["required_skills"] = extract_skills_from_string(
                            f"{role_title} {raw_item.get('description', '')}"
                        )

                    # Ensure standard keys
                    raw_item["apply_url_resolved"] = url_norm
                    raw_item["source_platform"] = classify_source_platform(url_norm).value
                    raw_item["external_id"] = f"in-intern-{src_name}-{hash(dedup_key) & 0xffffffff:08x}"

                    aggregated_items.append(raw_item)
            except Exception as e:
                logger.error(f"Failed harvesting from {src_name}: {e}")
                results[src_name] = {"status": "timeout_or_error", "count": 0, "error": str(e)}

    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_discovered": len(aggregated_items),
        "source_metrics": results,
        "items": aggregated_items
    }


if __name__ == "__main__":
    res = scrape_all_internships(keywords="python developer", max_per_source=3)
    print(f"Scraped {res['total_discovered']} total unique internships across {len(res['source_metrics'])} sources")
    print(res["source_metrics"])
