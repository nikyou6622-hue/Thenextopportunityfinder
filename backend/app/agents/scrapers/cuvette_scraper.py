"""
Cuvette Tech Discovery Module — DISCOVERY ONLY.
"""

from backend.agent.scrapers.cuvette_scraper import (
    CuvetteInternship,
    search_cuvette_internships,
    parse_cuvette_json_item,
    parse_numeric_stipend,
    to_job_records
)

__all__ = ["CuvetteInternship", "search_cuvette_internships", "parse_cuvette_json_item", "parse_numeric_stipend", "to_job_records"]
