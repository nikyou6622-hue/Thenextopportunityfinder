"""
Unified Multi-Source Internship Aggregator Module.
"""

from backend.agent.scrapers.internship_aggregator import (
    scrape_all_internships,
    run_single_scraper,
    extract_skills_from_string
)

__all__ = [
    "scrape_all_internships",
    "run_single_scraper",
    "extract_skills_from_string"
]
