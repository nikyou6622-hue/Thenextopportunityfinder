"""
Discovery Scrapers Package (backend.agent.scrapers)
Public search result scrapers and multi-source aggregators for discovery-only indexing.
"""

from backend.agent.scrapers.linkedin_scraper import (
    LinkedInJob,
    search_linkedin_jobs,
    to_job_records as linkedin_to_job_records
)

from backend.agent.scrapers.indeed_scraper import (
    IndeedJob,
    search_indeed_jobs,
    to_job_records as indeed_to_job_records
)

from backend.agent.scrapers.internshala_scraper import (
    InternshalaListing,
    search_internshala,
    to_job_records as internshala_to_job_records
)

from backend.agent.scrapers.unstop_scraper import (
    UnstopInternship,
    search_unstop_internships,
    to_job_records as unstop_to_job_records
)

from backend.agent.scrapers.cuvette_scraper import (
    CuvetteInternship,
    search_cuvette_internships,
    to_job_records as cuvette_to_job_records
)

from backend.agent.scrapers.wellfound_scraper import (
    WellfoundInternship,
    search_wellfound_internships,
    to_job_records as wellfound_to_job_records
)

from backend.agent.scrapers.github_internships_scraper import (
    GitHubInternship,
    fetch_github_internships,
    to_job_records as github_to_job_records
)

from backend.agent.scrapers.internship_aggregator import (
    scrape_all_internships,
    run_single_scraper
)

__all__ = [
    "LinkedInJob",
    "search_linkedin_jobs",
    "linkedin_to_job_records",
    "IndeedJob",
    "search_indeed_jobs",
    "indeed_to_job_records",
    "InternshalaListing",
    "search_internshala",
    "internshala_to_job_records",
    "UnstopInternship",
    "search_unstop_internships",
    "unstop_to_job_records",
    "CuvetteInternship",
    "search_cuvette_internships",
    "cuvette_to_job_records",
    "WellfoundInternship",
    "search_wellfound_internships",
    "wellfound_to_job_records",
    "GitHubInternship",
    "fetch_github_internships",
    "github_to_job_records",
    "scrape_all_internships",
    "run_single_scraper",
]
