"""
LinkedIn Discovery Module — DISCOVERY ONLY.
"""

from backend.agent.scrapers.linkedin_scraper import (
    LinkedInJob,
    search_linkedin_jobs,
    to_job_records
)

__all__ = ["LinkedInJob", "search_linkedin_jobs", "to_job_records"]
