"""
Wellfound (AngelList Talent) Discovery Module — DISCOVERY ONLY.
"""

from backend.agent.scrapers.wellfound_scraper import (
    WellfoundInternship,
    search_wellfound_internships,
    parse_numeric_stipend,
    to_job_records
)

__all__ = ["WellfoundInternship", "search_wellfound_internships", "parse_numeric_stipend", "to_job_records"]
