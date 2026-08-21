"""
GitHub Tech Internships Aggregator Module — DISCOVERY ONLY.
"""

from backend.agent.scrapers.github_internships_scraper import (
    GitHubInternship,
    parse_markdown_table_rows,
    fetch_github_internships,
    to_job_records
)

__all__ = [
    "GitHubInternship",
    "parse_markdown_table_rows",
    "fetch_github_internships",
    "to_job_records"
]
