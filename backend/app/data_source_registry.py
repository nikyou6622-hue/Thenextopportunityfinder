import datetime
import logging
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Data Source Compliance Registry
# Tracks legal, terms of service, robots.txt, link quality standard, and access method compliance for every ingested source.
DATA_SOURCE_REGISTRY: Dict[str, Dict[str, Any]] = {
    "internshala": {
        "name": "Internshala",
        "domain": "internshala.com",
        "access_method": "manual", # Enforced as discovery / manual review only
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://internshala.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "aggregated",
        "direct_url_pattern": "https://internshala.com/job/detail/{posting_id}",
        "compliance_notes": "Public search listings indexed for discovery; direct automation strictly routed to manual review queue."
    },
    "cutshort": {
        "name": "CutShort",
        "domain": "cutshort.io",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://cutshort.io/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://cutshort.io/job/{posting_id}",
        "compliance_notes": "Startup jobs indexed for matching; application requires recruiter portal confirmation."
    },
    "instahyre": {
        "name": "Instahyre",
        "domain": "instahyre.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.instahyre.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.instahyre.com/job/{posting_id}",
        "compliance_notes": "Curated tech listings indexed for matching with candidate permission."
    },
    "wellfound": {
        "name": "Wellfound",
        "domain": "wellfound.com",
        "access_method": "rss",
        "has_official_api": True,
        "api_docs_url": "https://wellfound.com/api",
        "robots_txt_url": "https://wellfound.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://wellfound.com/jobs/{posting_id}",
        "compliance_notes": "Prefers official RSS / API feed where available."
    },
    "naukri": {
        "name": "Naukri",
        "domain": "naukri.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.naukri.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.5,
        "allow_auto_apply": False,
        "link_quality": "aggregated",
        "direct_url_pattern": "https://www.naukri.com/job-listings-{posting_id}",
        "compliance_notes": "Discovery search only. No automated logins or Easy Apply allowed."
    },
    "foundit": {
        "name": "Foundit",
        "domain": "foundit.in",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.foundit.in/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "aggregated",
        "direct_url_pattern": "https://www.foundit.in/job/{posting_id}",
        "compliance_notes": "Discovery indexing only."
    },
    "yourstory": {
        "name": "YourStory Jobs",
        "domain": "yourstory.com",
        "access_method": "rss",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://yourstory.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://yourstory.com/jobs/{posting_id}",
        "compliance_notes": "Public startup news and internship feed aggregation."
    },
    "hirist": {
        "name": "Hirist",
        "domain": "hirist.tech",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.hirist.tech/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.hirist.tech/j/{posting_id}",
        "compliance_notes": "Tech job board discovery."
    },
    "remoteok": {
        "name": "RemoteOK",
        "domain": "remoteok.com",
        "access_method": "api",
        "has_official_api": True,
        "api_docs_url": "https://remoteok.com/api",
        "robots_txt_url": "https://remoteok.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://remoteok.com/remote-jobs/{posting_id}",
        "compliance_notes": "Official public JSON API endpoint utilized."
    },
    "linkedin": {
        "name": "LinkedIn",
        "domain": "linkedin.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.linkedin.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 5.0,
        "allow_auto_apply": False,
        "link_quality": "aggregated",
        "direct_url_pattern": "https://www.linkedin.com/jobs/view/{posting_id}",
        "compliance_notes": "DISCOVERY ONLY — zero automated logins or Easy Apply triggers permitted."
    },
    "yc": {
        "name": "YC Work at a Startup",
        "domain": "workatastartup.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.workatastartup.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.workatastartup.com/companies/{company}/jobs/{posting_id}",
        "compliance_notes": "Early-stage startup discovery. Link-out direct apply only."
    },
    "greenhouse": {
        "name": "Greenhouse ATS",
        "domain": "boards.greenhouse.io",
        "access_method": "api",
        "has_official_api": True,
        "api_docs_url": "https://developers.greenhouse.io/job-board.html",
        "robots_txt_url": "https://boards.greenhouse.io/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 1.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://boards.greenhouse.io/{company}/jobs/{posting_id}",
        "compliance_notes": "Standard ATS employer portal; candidate direct link-out enforced."
    },
    "lever": {
        "name": "Lever ATS",
        "domain": "jobs.lever.co",
        "access_method": "api",
        "has_official_api": True,
        "api_docs_url": "https://hire.lever.co/developer/documentation",
        "robots_txt_url": "https://jobs.lever.co/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 1.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://jobs.lever.co/{company}/{posting_id}",
        "compliance_notes": "Standard ATS employer portal; candidate direct link-out enforced."
    },
    "ashby": {
        "name": "Ashby ATS",
        "domain": "jobs.ashbyhq.com",
        "access_method": "api",
        "has_official_api": True,
        "api_docs_url": "https://developers.ashbyhq.com",
        "robots_txt_url": "https://jobs.ashbyhq.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 1.5,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://jobs.ashbyhq.com/{company}/{posting_id}",
        "compliance_notes": "Modern ATS employer portal; direct link-out enforced."
    },
    # Big MNC Career Portals (Agent 2b Scanner)
    "google": {
        "name": "Google Careers",
        "domain": "careers.google.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://careers.google.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://careers.google.com/jobs/results/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "microsoft": {
        "name": "Microsoft Careers",
        "domain": "careers.microsoft.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://careers.microsoft.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://careers.microsoft.com/us/en/job/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "amazon": {
        "name": "Amazon Jobs",
        "domain": "amazon.jobs",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.amazon.jobs/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.amazon.jobs/en/jobs/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "meta": {
        "name": "Meta Careers",
        "domain": "metacareers.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.metacareers.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.metacareers.com/jobs/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "apple": {
        "name": "Apple Jobs",
        "domain": "jobs.apple.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://jobs.apple.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://jobs.apple.com/en-in/details/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "uber": {
        "name": "Uber Careers",
        "domain": "uber.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.uber.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.uber.com/careers/list/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "netflix": {
        "name": "Netflix Jobs",
        "domain": "jobs.netflix.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://jobs.netflix.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://jobs.netflix.com/jobs/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "salesforce": {
        "name": "Salesforce Careers",
        "domain": "salesforce.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.salesforce.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://salesforce.wd1.myworkdayjobs.com/External_Career_Site/job/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "adobe": {
        "name": "Adobe Careers",
        "domain": "careers.adobe.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://careers.adobe.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://careers.adobe.com/us/en/job/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "oracle": {
        "name": "Oracle Careers",
        "domain": "oracle.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.oracle.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 3.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://eeho.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/{posting_id}",
        "compliance_notes": "Direct employer career portal. Discovery and link-out only."
    },
    "infosys": {
        "name": "Infosys Careers",
        "domain": "infosys.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.infosys.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.infosys.com/careers/openings/{posting_id}.html",
        "compliance_notes": "Direct employer IT services portal. Link-out direct apply only."
    },
    "deloitte": {
        "name": "Deloitte Careers",
        "domain": "deloitte.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www2.deloitte.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www2.deloitte.com/in/en/careers/{posting_id}.html",
        "compliance_notes": "Direct employer consulting portal. Link-out direct apply only."
    },
    "hcltech": {
        "name": "HCLTech Careers",
        "domain": "hcltech.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.hcltech.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.hcltech.com/careers/{posting_id}",
        "compliance_notes": "Direct employer IT services portal. Link-out direct apply only."
    },
    "tcs": {
        "name": "TCS Careers",
        "domain": "tcs.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.tcs.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.tcs.com/careers/india/{posting_id}",
        "compliance_notes": "Direct employer IT services portal. Link-out direct apply only."
    },
    "wipro": {
        "name": "Wipro Careers",
        "domain": "wipro.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://careers.wipro.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://careers.wipro.com/careers-home/jobs/{posting_id}",
        "compliance_notes": "Direct employer IT services portal. Link-out direct apply only."
    },
    "accenture": {
        "name": "Accenture Careers",
        "domain": "accenture.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://www.accenture.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://www.accenture.com/in-en/careers/jobdetails?id={posting_id}",
        "compliance_notes": "Direct employer portal. Link-out direct apply only."
    },
    "cognizant": {
        "name": "Cognizant Careers",
        "domain": "cognizant.com",
        "access_method": "manual",
        "has_official_api": False,
        "api_docs_url": None,
        "robots_txt_url": "https://careers.cognizant.com/robots.txt",
        "robots_txt_checked_at": "2026-08-01T00:00:00Z",
        "terms_reviewed": True,
        "last_compliance_review": "2026-08-04",
        "rate_limit_delay_seconds": 2.0,
        "allow_auto_apply": False,
        "link_quality": "direct",
        "direct_url_pattern": "https://careers.cognizant.com/global/en/job/{posting_id}",
        "compliance_notes": "Direct employer portal. Link-out direct apply only."
    }
}

def get_source_config(source_name: str) -> Optional[Dict[str, Any]]:
    """Retrieve compliance configuration for a given source key."""
    key = source_name.lower().strip()
    return DATA_SOURCE_REGISTRY.get(key)

def get_source_link_quality(source_name: str) -> str:
    """Returns 'direct', 'aggregated', or 'unreliable' for a given source."""
    config = get_source_config(source_name)
    if not config:
        return "unreliable"
    return config.get("link_quality", "direct")

def is_source_link_reliable(source_name: str) -> bool:
    """Returns True if the source is not marked 'unreliable'."""
    return get_source_link_quality(source_name) != "unreliable"

def is_source_compliant(source_name: str, strict_mode: bool = True) -> Tuple[bool, str]:
    """
    Evaluates whether a data source is permitted to run under legal / ToS policy.
    Blocks any source with terms_reviewed=False from running in strict production mode.
    """
    key = source_name.lower().strip()
    config = DATA_SOURCE_REGISTRY.get(key)
    
    if not config:
        if strict_mode:
            return False, f"Source '{source_name}' is not registered in data_source_registry.py. Execution blocked."
        return True, f"Source '{source_name}' is unverified but permitted in development mode."
        
    if not config.get("terms_reviewed", False):
        return False, f"Source '{source_name}' has not completed mandatory Terms of Service compliance review. Blocked."
        
    return True, f"Source '{source_name}' is compliant ({config.get('access_method')})."

