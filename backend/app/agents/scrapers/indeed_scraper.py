"""
Indeed Discovery Module — DISCOVERY ONLY.
"""

from backend.agent.scrapers.indeed_scraper import (
    IndeedJob,
    search_indeed_jobs,
    to_job_records
)

__all__ = ["IndeedJob", "search_indeed_jobs", "to_job_records"]
