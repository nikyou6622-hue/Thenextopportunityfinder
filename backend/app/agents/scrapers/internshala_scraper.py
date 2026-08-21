"""
Internshala Discovery Module — DISCOVERY ONLY.
"""

from backend.agent.scrapers.internshala_scraper import (
    InternshalaListing,
    search_internshala,
    to_job_records
)

__all__ = ["InternshalaListing", "search_internshala", "to_job_records"]
