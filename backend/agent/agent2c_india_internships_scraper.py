"""
agent2c_india_internships_scraper.py — NextOpportunityFind Multi-Source Internship Scraper (Mirror)
"""

from backend.app.agents.agent2c_india_internships_scraper import (
    SourceTarget,
    ScrapeResult,
    TTLCache,
    CircuitBreaker,
    get_breaker,
    check_robots_allowed,
    validate_urls_concurrent,
    parse_numeric_stipend,
    build_description_with_details,
    extract_skills_from_listing,
    parse_internshala,
    parse_cuvette,
    parse_json_ld,
    parse_generic_html,
    deduplicate_listings,
    store_jobs_batch,
    fetch_source,
    get_default_sources,
    run_india_internship_scan_async,
    run_india_internship_scan,
    get_india_internships,
    get_internship_market_stats
)

__all__ = [
    "SourceTarget",
    "ScrapeResult",
    "TTLCache",
    "CircuitBreaker",
    "get_breaker",
    "check_robots_allowed",
    "validate_urls_concurrent",
    "parse_numeric_stipend",
    "build_description_with_details",
    "extract_skills_from_listing",
    "parse_internshala",
    "parse_cuvette",
    "parse_json_ld",
    "parse_generic_html",
    "deduplicate_listings",
    "store_jobs_batch",
    "fetch_source",
    "get_default_sources",
    "run_india_internship_scan_async",
    "run_india_internship_scan",
    "get_india_internships",
    "get_internship_market_stats"
]
