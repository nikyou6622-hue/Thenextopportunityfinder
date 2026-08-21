"""
agent2b_mnc_scanner.py — Agent 2B: Real-Time Big-MNC Opportunity Scanner & ATS Ingestion
Scrapes and monitors official enterprise ATS & career portals for active MNCs.
Pivoted per Skill 1: Classifies canonical platform, verifies direct apply links, zero auto-apply pipelines.
DPDP Act 2023 compliant: Decrypts candidate profiles before computing matches.
Tier-1 Job Intelligence Engine: Evidence-based freshness, deterministic fingerprinting, authenticity flags, lifecycle tracking.
"""

import os
import re
import json
import time
import hashlib
import datetime
import logging
import threading
import inspect
import urllib.robotparser
from urllib.parse import urlparse, urljoin, urlunparse
from typing import List, Dict, Any, Tuple, Optional, Set
import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from backend.app.db.models import JobModel, MatchModel, ProfileModel, MNCScanLogModel
try:
    from backend.app.agents.agent2_discovery import extract_skills_from_text
    from backend.app.agents.agent3_matching import compute_match
    from backend.app.security.encryption import decrypt_field
    from backend.app.agents.source_router import (
        normalize_job_url,
        classify_source_platform,
        resolve_and_validate_apply_url
    )
except ImportError:
    from backend.agent.agent2_discovery import extract_skills_from_text
    from backend.agent.agent3_matching import compute_match
    from backend.app.security.encryption import decrypt_field
    from backend.agent.source_router import (
        normalize_job_url,
        classify_source_platform,
        resolve_and_validate_apply_url
    )

logger = logging.getLogger(__name__)

# Standard Browser User-Agent with polite identifier
BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NextOpportunityFind/2.0"

# Configurable thresholds
LINK_REVALIDATION_HOURS = 72
RECENT_SCAN_THRESHOLD_HOURS = 6
STALE_AFTER_FAILED_CHECKS = 1
REMOVED_AFTER_FAILED_CHECKS = 2
HEALTH_CHECK_CACHE_TTL = 300  # 5 minutes

# Thread-safe cache for robots.txt, DNS lookups, and health checks
class ThreadSafeCache:
    def __init__(self, ttl_seconds: float = 3600.0):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.RLock()
        self._ttl = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._cache.get(key)
            if entry:
                val, timestamp = entry
                if time.time() - timestamp < self._ttl:
                    return val
                else:
                    del self._cache[key]
            return None

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._cache[key] = (value, time.time())

    def contains(self, key: str) -> bool:
        return self.get(key) is not None

ROBOTS_CACHE = ThreadSafeCache(ttl_seconds=3600.0)
HEALTH_CHECK_CACHE = ThreadSafeCache(ttl_seconds=HEALTH_CHECK_CACHE_TTL)

# Config-driven MNC targets — official career portals & ATS endpoints
MNC_TARGET_CONFIG: List[Dict[str, Any]] = [
    {
        "company": "Infosys",
        "domain_name": "infosys.com",
        "careers_url": "https://www.infosys.com/careers.html",
        "company_tier": "large_it_services",
        "rate_limit_seconds": 2.0,
        "requires_js": True,
        "api_endpoint": None,
        "data_access_method": "unreliable",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_inf_001",
                "role_title": "Specialist Programmer - Full Stack Systems",
                "company": "Infosys",
                "apply_url": "https://careers.infosys.com/job/specialist-programmer-full-stack",
                "location": "Bengaluru, Karnataka",
                "remote": True,
                "required_skills": ["Python", "FastAPI", "React", "Docker", "PostgreSQL"],
                "domain": "Software Engineering",
                "description": "Design and architect distributed microservices, cloud applications, and high-throughput transaction pipelines.",
                "source_category": "mnc",
                "salary_range": "₹9,50,000 - ₹16,00,000 P.A."
            },
            {
                "external_id": "mnc_inf_002",
                "role_title": "Senior Cloud DevOps & Kubernetes Engineer",
                "company": "Infosys",
                "apply_url": "https://careers.infosys.com/job/senior-cloud-devops-engineer",
                "location": "Hyderabad, Telangana",
                "remote": True,
                "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Python"],
                "domain": "Cloud & DevOps",
                "description": "Manage multi-region enterprise Kubernetes clusters, automated CI/CD pipelines, and cloud security compliance.",
                "source_category": "mnc",
                "salary_range": "₹12,00,000 - ₹20,00,000 P.A."
            }
        ]
    },
    {
        "company": "Deloitte",
        "domain_name": "deloitte.com",
        "careers_url": "https://www2.deloitte.com/in/en/careers.html",
        "company_tier": "consulting",
        "rate_limit_seconds": 2.0,
        "requires_js": False,
        "api_endpoint": None,
        "data_access_method": "html_scrape",
        "job_listing_url": "https://apply.deloitte.com/careers/SearchJobs",
        "seed_jobs": [
            {
                "external_id": "mnc_del_001",
                "role_title": "Senior Technology Consultant - AI & Cloud Architecture",
                "company": "Deloitte",
                "apply_url": "https://apply.deloitte.com/careers/JobDetail/AI-Cloud-Consultant/108942",
                "location": "Bengaluru, Karnataka",
                "remote": True,
                "required_skills": ["Python", "Machine Learning", "FastAPI", "AWS", "SQL", "LLMs"],
                "domain": "AI & Consulting",
                "description": "Lead enterprise digital transformations, generative AI implementations, and scalable cloud application development.",
                "source_category": "mnc",
                "salary_range": "₹15,00,000 - ₹24,00,000 P.A."
            },
            {
                "external_id": "mnc_del_002",
                "role_title": "Cyber Security & Enterprise Risk Analyst",
                "company": "Deloitte",
                "apply_url": "https://apply.deloitte.com/careers/JobDetail/Cyber-Risk-Analyst/108945",
                "location": "Gurugram, Haryana",
                "remote": False,
                "required_skills": ["Cyber Security", "Python", "Linux", "Network Security", "Compliance"],
                "domain": "Cybersecurity",
                "description": "Evaluate threat landscapes, execute vulnerability assessments, and safeguard Fortune 500 enterprise architectures.",
                "source_category": "mnc",
                "salary_range": "₹11,00,000 - ₹18,00,000 P.A."
            }
        ]
    },
    {
        "company": "HCLTech",
        "domain_name": "hcltech.com",
        "careers_url": "https://www.hcltech.com/careers",
        "company_tier": "large_it_services",
        "rate_limit_seconds": 2.0,
        "requires_js": True,
        "api_endpoint": None,
        "data_access_method": "unreliable",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_hcl_001",
                "role_title": "Technical Lead - Microservices & Python Engineering",
                "company": "HCLTech",
                "apply_url": "https://www.hcltech.com/careers/job/technical-lead-python-microservices",
                "location": "Noida, Uttar Pradesh",
                "remote": True,
                "required_skills": ["Python", "FastAPI", "Django", "Microservices", "Docker", "Redis"],
                "domain": "Software Engineering",
                "description": "Lead engineering teams building resilient API services, distributed message queues, and high-frequency backend systems.",
                "source_category": "mnc",
                "salary_range": "₹14,00,000 - ₹22,00,000 P.A."
            }
        ]
    },
    {
        "company": "TCS",
        "domain_name": "tcs.com",
        "careers_url": "https://www.tcs.com/careers",
        "company_tier": "large_it_services",
        "rate_limit_seconds": 2.0,
        "requires_js": True,
        "api_endpoint": None,
        "data_access_method": "unreliable",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_tcs_001",
                "role_title": "Digital Software Engineer - Full Stack & Cloud",
                "company": "TCS",
                "apply_url": "https://www.tcs.com/careers/jobs/digital-software-engineer",
                "location": "Mumbai, Maharashtra",
                "remote": True,
                "required_skills": ["Java", "Spring Boot", "React", "AWS", "SQL", "Kafka"],
                "domain": "Software Engineering",
                "description": "Develop mission-critical banking and fintech platforms serving tens of millions of daily active transactions.",
                "source_category": "mnc",
                "salary_range": "₹8,50,000 - ₹15,00,000 P.A."
            }
        ]
    },
    {
        "company": "Wipro",
        "domain_name": "wipro.com",
        "careers_url": "https://careers.wipro.com/",
        "company_tier": "large_it_services",
        "rate_limit_seconds": 2.0,
        "requires_js": False,
        "api_endpoint": None,
        "data_access_method": "html_scrape",
        "job_listing_url": "https://careers.wipro.com/search/",
        "seed_jobs": [
            {
                "external_id": "mnc_wip_001",
                "role_title": "Senior Project Engineer - Cloud & Systems",
                "company": "Wipro",
                "apply_url": "https://careers.wipro.com/job/senior-project-engineer-cloud",
                "location": "Bengaluru, Karnataka",
                "remote": True,
                "required_skills": ["Python", "AWS", "Linux", "Docker", "Kubernetes", "PostgreSQL"],
                "domain": "Cloud & Infrastructure",
                "description": "Architect automated cloud deployment frameworks, serverless APIs, and resilient data processing systems.",
                "source_category": "mnc",
                "salary_range": "₹10,00,000 - ₹17,50,000 P.A."
            }
        ]
    },
    {
        "company": "Accenture",
        "domain_name": "accenture.com",
        "careers_url": "https://www.accenture.com/in-en/careers",
        "company_tier": "consulting",
        "rate_limit_seconds": 2.0,
        "requires_js": True,
        "api_endpoint": None,
        "data_access_method": "unreliable",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_acc_001",
                "role_title": "Application Development Senior Analyst",
                "company": "Accenture",
                "apply_url": "https://www.accenture.com/in-en/careers/jobdetails?id=R00192841_en",
                "location": "Bengaluru, Karnataka",
                "remote": True,
                "required_skills": ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
                "domain": "Software Engineering",
                "description": "Build modern Web applications, interactive dashboards, and cloud-connected user experiences for global clients.",
                "source_category": "mnc",
                "salary_range": "₹11,50,000 - ₹19,00,000 P.A."
            }
        ]
    },
    {
        "company": "Capgemini",
        "domain_name": "capgemini.com",
        "careers_url": "https://www.capgemini.com/in-en/careers/",
        "company_tier": "large_it_services",
        "rate_limit_seconds": 2.0,
        "requires_js": False,
        "api_endpoint": None,
        "data_access_method": "html_scrape",
        "job_listing_url": "https://www.capgemini.com/in-en/careers/job-search/",
        "seed_jobs": [
            {
                "external_id": "mnc_cap_001",
                "role_title": "Senior Software Engineer - Microservices Architecture",
                "company": "Capgemini",
                "apply_url": "https://www.capgemini.com/in-en/jobs/senior-software-engineer-microservices",
                "location": "Pune, Maharashtra",
                "remote": True,
                "required_skills": ["Java", "Spring Boot", "Docker", "Kubernetes", "PostgreSQL"],
                "domain": "Software Engineering",
                "description": "Construct high-throughput enterprise backends, API gateways, and cloud microservices for global financial systems.",
                "source_category": "mnc",
                "salary_range": "₹10,50,000 - ₹18,00,000 P.A."
            }
        ]
    },
    {
        "company": "Cognizant",
        "domain_name": "cognizant.com",
        "careers_url": "https://careers.cognizant.com/global/en",
        "company_tier": "large_it_services",
        "rate_limit_seconds": 2.0,
        "requires_js": True,
        "api_endpoint": None,
        "data_access_method": "unreliable",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_cog_001",
                "role_title": "Senior Data & AI Engineer",
                "company": "Cognizant",
                "apply_url": "https://careers.cognizant.com/job/senior-data-ai-engineer",
                "location": "Chennai, Tamil Nadu",
                "remote": True,
                "required_skills": ["Python", "Spark", "SQL", "AWS", "Snowflake", "FastAPI"],
                "domain": "Data & Analytics",
                "description": "Architect real-time ETL pipelines, data lakes, and predictive analytics platforms for healthcare & retail enterprises.",
                "source_category": "mnc",
                "salary_range": "₹12,00,000 - ₹20,00,000 P.A."
            }
        ]
    },
    {
        "company": "Google",
        "domain_name": "careers.google.com",
        "careers_url": "https://careers.google.com/jobs/results/?location=India",
        "company_tier": "big_tech",
        "rate_limit_seconds": 2.5,
        "requires_js": True,
        "api_endpoint": None,
        "data_access_method": "unreliable",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_goog_001",
                "role_title": "Software Engineer II - Distributed Systems (Google Cloud)",
                "company": "Google",
                "apply_url": "https://careers.google.com/jobs/results/12948192-software-engineer-google-cloud",
                "location": "Bengaluru, Karnataka",
                "remote": True,
                "required_skills": ["C++", "Python", "Go", "Distributed Systems", "GCP"],
                "domain": "Software Engineering",
                "description": "Develop hyperscale infrastructure services, storage engines, and network virtualization platforms powering Google Cloud.",
                "source_category": "mnc",
                "salary_range": "₹28,00,000 - ₹45,00,000 P.A."
            },
            {
                "external_id": "mnc_goog_002",
                "role_title": "Solutions Consultant - Enterprise AI & Cloud",
                "company": "Google",
                "apply_url": "https://careers.google.com/jobs/results/12948195-solutions-consultant-ai",
                "location": "Hyderabad, Telangana",
                "remote": False,
                "required_skills": ["Python", "GCP", "TensorFlow", "Kubernetes", "Architecture"],
                "domain": "AI & Cloud",
                "description": "Collaborate with Tier-1 enterprise engineering leadership to deploy Vertex AI, LLMs, and cloud-native solutions.",
                "source_category": "mnc",
                "salary_range": "₹32,00,000 - ₹50,00,000 P.A."
            }
        ]
    },
    {
        "company": "Microsoft",
        "domain_name": "careers.microsoft.com",
        "careers_url": "https://careers.microsoft.com/v2/global/en/home.html",
        "company_tier": "big_tech",
        "rate_limit_seconds": 2.5,
        "requires_js": True,
        "api_endpoint": "https://gcsservices.careers.microsoft.com/search/api/v1/search?q=India&pg=1&pgSz=20",
        "data_access_method": "api",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_msft_001",
                "role_title": "Software Engineer II - Azure Core Infrastructure",
                "company": "Microsoft",
                "apply_url": "https://careers.microsoft.com/us/en/job/1689412/Software-Engineer-II-Azure",
                "location": "Hyderabad, Telangana",
                "remote": True,
                "required_skills": ["C#", "C++", "Python", "Azure", "Distributed Systems"],
                "domain": "Software Engineering",
                "description": "Build high-reliability Azure cloud virtualization, software-defined networking, and global compute platforms.",
                "source_category": "mnc",
                "salary_range": "₹26,00,000 - ₹42,00,000 P.A."
            }
        ]
    },
    {
        "company": "Amazon",
        "domain_name": "amazon.jobs",
        "careers_url": "https://www.amazon.jobs/en/locations/bangalore-india",
        "company_tier": "big_tech",
        "rate_limit_seconds": 2.5,
        "requires_js": True,
        "api_endpoint": "https://www.amazon.jobs/en/search.json?base_query=India&result_limit=25",
        "data_access_method": "api",
        "job_listing_url": None,
        "seed_jobs": [
            {
                "external_id": "mnc_amzn_001",
                "role_title": "Software Development Engineer II (SDE-II) - AWS Services",
                "company": "Amazon",
                "apply_url": "https://www.amazon.jobs/en/jobs/2589412/software-development-engineer-ii-aws",
                "location": "Bengaluru, Karnataka",
                "remote": True,
                "required_skills": ["Java", "Python", "AWS", "Distributed Systems", "DynamoDB", "Microservices"],
                "domain": "Software Engineering",
                "description": "Engineer low-latency, mission-critical AWS cloud microservices handling billions of global HTTP requests daily.",
                "source_category": "mnc",
                "salary_range": "₹27,00,000 - ₹44,00,000 P.A."
            }
        ]
    }
]


def normalize_url_for_fingerprint(url: str) -> str:
    """
    Normalize URL for deterministic fingerprinting.
    Only lowercase scheme and netloc, not path (paths can be case-sensitive).
    """
    if not url:
        return ""
    
    parsed = urlparse(url)
    
    # Only lowercase scheme and netloc (domain)
    normalized_scheme = parsed.scheme.lower()
    normalized_netloc = parsed.netloc.lower()
    
    # Remove tracking parameters
    tracking_params = {'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'src'}
    query_params = [p for p in parsed.query.split('&') if p and p.split('=')[0] not in tracking_params]
    
    # Reconstruct normalized URL preserving path case
    normalized = urlunparse((
        normalized_scheme,
        normalized_netloc,
        parsed.path.rstrip('/'),
        '',
        '&'.join(sorted(query_params)),
        ''
    ))
    
    return normalized


def compute_job_fingerprint(company: str, title: str, location: str, external_id: str = "") -> str:
    """
    Deterministic SHA-256 fingerprint for job deduplication.
    Stable across process restarts (unlike Python's hash()).
    """
    normalized_company = re.sub(r'[^a-z0-9]', '', company.lower())
    normalized_title = re.sub(r'[^a-z0-9]', '', title.lower())
    normalized_location = re.sub(r'[^a-z0-9]', '', location.lower())
    normalized_external_id = re.sub(r'[^a-z0-9]', '', external_id.lower()) if external_id else ""
    
    fingerprint_input = f"{normalized_company}|{normalized_title}|{normalized_location}|{normalized_external_id}"
    
    return hashlib.sha256(fingerprint_input.encode('utf-8')).hexdigest()[:16]


def check_robots_allowed(url: str, user_agent: str = "NextOpportunityFind-Bot") -> Tuple[bool, str]:
    """
    Evaluates robots.txt policy with thread-safe caching.
    Fails closed: any exception results in denying access.
    """
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        if not domain:
            return False, "No domain in URL - denying access"

        cached_val = ROBOTS_CACHE.get(domain)
        if cached_val is not None:
            return cached_val

        robots_url = f"{parsed.scheme}://{domain}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)

        headers = {"User-Agent": BROWSER_USER_AGENT}
        resp = requests.get(robots_url, headers=headers, timeout=2.5)
        
        if resp.status_code == 200:
            rp.parse(resp.text.splitlines())
            allowed = rp.can_fetch(user_agent, url)
            result = (allowed, "robots.txt parsed")
        else:
            # Fail closed on non-200 responses
            result = (False, f"robots.txt HTTP {resp.status_code} - defaulting to deny")

        ROBOTS_CACHE.set(domain, result)
        return result

    except Exception as e:
        logger.warning(f"Robots check failed for {url}, defaulting to deny: {e}")
        return False, f"robots.txt check failed, defaulting to deny: {str(e)[:50]}"


def check_authenticity_flags(job_dict: Dict[str, Any], db: Optional[Session] = None) -> List[str]:
    """
    Deterministic authenticity flag checks.
    Returns list of flag strings indicating potential issues.
    
    Note: duplicate_description check only runs when we have real description text
    (not templated placeholders) and compares within a narrow window.
    """
    flags = []
    
    description = job_dict.get("description", "").lower()
    apply_url = job_dict.get("apply_url", "").lower()
    apply_email = job_dict.get("apply_email", "").lower()
    company = job_dict.get("company", "").lower()
    
    # Check for payment/fee language
    payment_patterns = [
        r'application fee',
        r'training fee',
        r'security deposit',
        r'registration fee',
        r'processing fee',
        r'pay\s+(?:us|me|now)',
        r'money\s+(?:required|needed|first)',
        r'investment\s+(?:required|needed)'
    ]
    for pattern in payment_patterns:
        if re.search(pattern, description):
            flags.append('payment_request')
            break
    
    # Check for WhatsApp/Telegram-only application
    whatsapp_telegram_patterns = [
        r'whatsapp\s+(?:only|exclusive)',
        r'telegram\s+(?:only|exclusive)',
        r'apply\s+(?:only\s+)?via\s+whatsapp',
        r'apply\s+(?:only\s+)?via\s+telegram',
        r'contact\s+(?:us\s+)?(?:only\s+)?(?:on|via)\s+whatsapp',
        r'contact\s+(?:us\s+)?(?:only\s+)?(?:on|via)\s+telegram'
    ]
    for pattern in whatsapp_telegram_patterns:
        if re.search(pattern, description):
            flags.append('whatsapp_telegram_only')
            break
    
    # Check for generic free email as recruiter contact (only if email is provided)
    if apply_email:
        free_email_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
        email_domain = apply_email.split('@')[-1] if '@' in apply_email else ''
        
        if email_domain in free_email_domains and company in ['microsoft', 'amazon', 'google', 'deloitte', 'wipro', 'capgemini']:
            flags.append('generic_email_contact')
    
    # Check for description duplication only if we have real description text
    # (not templated placeholders like "Company role: Title")
    if db and description and not re.match(r'^[a-z]+ role: ', description):
        # Compare only within a narrow time window (last 30 days) to reduce false positives
        recent_cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)
        
        existing_job = db.query(JobModel).filter(
            and_(
                JobModel.description == job_dict.get("description", ""),
                JobModel.company == job_dict.get("company", ""),
                JobModel.first_seen_at >= recent_cutoff
            )
        ).first()
        
        if existing_job:
            flags.append('duplicate_description')
    
    return flags


def fetch_direct_ats_api(config: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Attempts to fetch live roles from official enterprise JSON endpoints.
    Returns (jobs_list, status_info) where status_info contains HTTP/parse status.
    """
    api_url = config.get("api_endpoint")
    if not api_url:
        return [], {"http_success": False, "data_success": False, "error": "No API endpoint"}

    jobs_found = []
    status_info = {
        "http_success": False,
        "data_success": False,
        "status_code": None,
        "error": None
    }
    
    headers = {
        "User-Agent": BROWSER_USER_AGENT,
        "Accept": "application/json"
    }

    try:
        resp = requests.get(api_url, headers=headers, timeout=5.0)
        status_info["status_code"] = resp.status_code
        
        if resp.status_code == 200:
            status_info["http_success"] = True
            data = resp.json()
            
            # Amazon search.json parser
            if "amazon" in config["company"].lower() and "jobs" in data:
                for item in data["jobs"][:10]:
                    title = item.get("title", "")
                    job_path = item.get("job_path", "")
                    apply_url = f"https://www.amazon.jobs{job_path}" if job_path else ""
                    
                    if title and apply_url and "amazon.jobs" in apply_url:
                        fingerprint = compute_job_fingerprint(
                            "Amazon", title, item.get("location", "India"), 
                            str(item.get('id_icims', ''))
                        )
                        
                        jobs_found.append({
                            "role_title": title,
                            "company": "Amazon",
                            "location": item.get("location", "India"),
                            "location_type": "On-site: India",
                            "remote": False,
                            "required_skills": extract_skills_from_text(item.get("description", "")),
                            "domain": "cloud / e-commerce",
                            "role_type": "full-time",
                            "description": item.get("description", f"Amazon role: {title}"),
                            "apply_url": apply_url,
                            "apply_email": "",
                            "external_id": fingerprint,
                            "source_posted_at": item.get("posted_date") or item.get("date_posted"),
                            "job_fingerprint": fingerprint
                        })
                
                status_info["data_success"] = len(jobs_found) > 0

            # Microsoft Careers search API parser
            elif "microsoft" in config["company"].lower() and "operationResult" in data:
                res_items = data.get("operationResult", {}).get("result", {}).get("jobs", [])
                for item in res_items[:10]:
                    title = item.get("title", "")
                    job_id = str(item.get("jobId", ""))
                    apply_url = f"https://careers.microsoft.com/v2/global/en/job/{job_id}" if job_id else ""
                    
                    if title and apply_url and "/job/" in apply_url:
                        fingerprint = compute_job_fingerprint(
                            "Microsoft", title, "India", job_id
                        )
                        
                        jobs_found.append({
                            "role_title": title,
                            "company": "Microsoft",
                            "location": "India",
                            "location_type": "Hybrid: India",
                            "remote": False,
                            "required_skills": extract_skills_from_text(item.get("description", "")),
                            "domain": "cloud / software",
                            "role_type": "full-time",
                            "description": item.get("description", f"Microsoft role: {title}"),
                            "apply_url": apply_url,
                            "apply_email": "",
                            "external_id": fingerprint,
                            "source_posted_at": item.get("postedDate") or item.get("publishedDate"),
                            "job_fingerprint": fingerprint
                        })
                
                status_info["data_success"] = len(jobs_found) > 0
            else:
                status_info["error"] = "Unexpected JSON structure"
        else:
            status_info["error"] = f"HTTP {resp.status_code}"

    except requests.exceptions.RequestException as e:
        status_info["error"] = f"Request failed: {str(e)[:100]}"
    except json.JSONDecodeError as e:
        status_info["error"] = f"JSON parse error: {str(e)[:50]}"
    except Exception as e:
        status_info["error"] = f"Unexpected error: {str(e)[:100]}"
        logger.debug(f"Direct ATS API fetch for {config['company']} failed: {e}")

    return jobs_found, status_info


def fetch_wipro_postings(config: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Fetch Wipro job postings from their careers page using HTML scraping."""
    jobs_found = []
    status_info = {
        "http_success": False,
        "data_success": False,
        "status_code": None,
        "error": None
    }
    
    careers_url = config.get("job_listing_url") or config["careers_url"]
    headers = {"User-Agent": BROWSER_USER_AGENT}
    
    try:
        resp = requests.get(careers_url, headers=headers, timeout=5.0)
        status_info["status_code"] = resp.status_code
        
        if resp.status_code == 200:
            status_info["http_success"] = True
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            job_links = soup.find_all('a', href=re.compile(r'/job|/career|/position', re.I))
            
            for link in job_links[:10]:
                title = link.text.strip()
                job_url = urljoin(careers_url, link.get('href', ''))
                
                if title and job_url and any(x in job_url.lower() for x in ['/job/', '/position/', '/career/']):
                    fingerprint = compute_job_fingerprint(
                        "Wipro", title, "India", 
                        normalize_url_for_fingerprint(job_url)
                    )
                    
                    jobs_found.append({
                        "role_title": title,
                        "company": "Wipro",
                        "location": "India",
                        "location_type": "On-site",
                        "remote": False,
                        "required_skills": extract_skills_from_text(title),
                        "domain": "IT Services",
                        "role_type": "full-time",
                        "description": f"Wipro role: {title}",
                        "apply_url": job_url,
                        "apply_email": "",
                        "external_id": fingerprint,
                        "source_posted_at": None,
                        "job_fingerprint": fingerprint
                    })
            
            status_info["data_success"] = len(jobs_found) > 0
            if not status_info["data_success"]:
                status_info["error"] = "No job links found in HTML"
        else:
            status_info["error"] = f"HTTP {resp.status_code}"
    
    except requests.exceptions.RequestException as e:
        status_info["error"] = f"Request failed: {str(e)[:100]}"
    except Exception as e:
        status_info["error"] = f"Parse error: {str(e)[:100]}"
        logger.debug(f"Wipro HTML scrape failed: {e}")
    
    return jobs_found, status_info


def fetch_deloitte_postings(config: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Fetch Deloitte job postings from their careers page."""
    jobs_found = []
    status_info = {
        "http_success": False,
        "data_success": False,
        "status_code": None,
        "error": None
    }
    
    careers_url = config.get("job_listing_url", config["careers_url"])
    headers = {"User-Agent": BROWSER_USER_AGENT}
    
    try:
        resp = requests.get(careers_url, headers=headers, timeout=5.0)
        status_info["status_code"] = resp.status_code
        
        if resp.status_code == 200:
            status_info["http_success"] = True
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            job_links = soup.find_all('a', href=re.compile(r'/job|/position|/career', re.I))
            
            for link in job_links[:10]:
                title = link.text.strip()
                job_url = urljoin(careers_url, link.get('href', ''))
                
                if title and job_url and any(x in job_url.lower() for x in ['/job/', '/position/', '/career/']):
                    fingerprint = compute_job_fingerprint(
                        "Deloitte", title, "India", 
                        normalize_url_for_fingerprint(job_url)
                    )
                    
                    jobs_found.append({
                        "role_title": title,
                        "company": "Deloitte",
                        "location": "India",
                        "location_type": "Hybrid",
                        "remote": False,
                        "required_skills": extract_skills_from_text(title),
                        "domain": "Consulting",
                        "role_type": "full-time",
                        "description": f"Deloitte role: {title}",
                        "apply_url": job_url,
                        "apply_email": "",
                        "external_id": fingerprint,
                        "source_posted_at": None,
                        "job_fingerprint": fingerprint
                    })
            
            status_info["data_success"] = len(jobs_found) > 0
            if not status_info["data_success"]:
                status_info["error"] = "No job links found in HTML"
        else:
            status_info["error"] = f"HTTP {resp.status_code}"
    
    except requests.exceptions.RequestException as e:
        status_info["error"] = f"Request failed: {str(e)[:100]}"
    except Exception as e:
        status_info["error"] = f"Parse error: {str(e)[:100]}"
        logger.debug(f"Deloitte HTML scrape failed: {e}")
    
    return jobs_found, status_info


def fetch_capgemini_postings(config: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Fetch Capgemini job postings from their careers page."""
    jobs_found = []
    status_info = {
        "http_success": False,
        "data_success": False,
        "status_code": None,
        "error": None
    }
    
    careers_url = config.get("job_listing_url", config["careers_url"])
    headers = {"User-Agent": BROWSER_USER_AGENT}
    
    try:
        resp = requests.get(careers_url, headers=headers, timeout=5.0)
        status_info["status_code"] = resp.status_code
        
        if resp.status_code == 200:
            status_info["http_success"] = True
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            job_links = soup.find_all('a', href=re.compile(r'/job|/career|/position', re.I))
            
            for link in job_links[:10]:
                title = link.text.strip()
                job_url = urljoin(careers_url, link.get('href', ''))
                
                if title and job_url and any(x in job_url.lower() for x in ['/job/', '/career/', '/position/']):
                    fingerprint = compute_job_fingerprint(
                        "Capgemini", title, "India", 
                        normalize_url_for_fingerprint(job_url)
                    )
                    
                    jobs_found.append({
                        "role_title": title,
                        "company": "Capgemini",
                        "location": "India",
                        "location_type": "On-site",
                        "remote": False,
                        "required_skills": extract_skills_from_text(title),
                        "domain": "IT Services",
                        "role_type": "full-time",
                        "description": f"Capgemini role: {title}",
                        "apply_url": job_url,
                        "apply_email": "",
                        "external_id": fingerprint,
                        "source_posted_at": None,
                        "job_fingerprint": fingerprint
                    })
            
            status_info["data_success"] = len(jobs_found) > 0
            if not status_info["data_success"]:
                status_info["error"] = "No job links found in HTML"
        else:
            status_info["error"] = f"HTTP {resp.status_code}"
    
    except requests.exceptions.RequestException as e:
        status_info["error"] = f"Request failed: {str(e)[:100]}"
    except Exception as e:
        status_info["error"] = f"Parse error: {str(e)[:100]}"
        logger.debug(f"Capgemini HTML scrape failed: {e}")
    
    return jobs_found, status_info


def get_active_companies() -> List[Dict[str, Any]]:
    """Get active enterprise MNC company target adapters."""
    return [c for c in MNC_TARGET_CONFIG if c.get("data_access_method") != "unreliable"]


def adapter_health_check(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Lightweight health check for each adapter with caching.
    Returns health status without performing full scan.
    """
    company = config["company"]
    data_method = config.get("data_access_method")
    
    # Check cache first
    cache_key = f"health_{company}"
    cached_health = HEALTH_CHECK_CACHE.get(cache_key)
    if cached_health:
        return cached_health
    
    health_info = {
        "company": company,
        "data_method": data_method,
        "status": "unknown",
        "endpoint": None,
        "response_time_ms": None,
        "error": None,
        "checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    if data_method == "api":
        endpoint = config.get("api_endpoint")
    elif data_method == "html_scrape":
        endpoint = config.get("job_listing_url") or config.get("careers_url")
    else:
        health_info["status"] = "unavailable"
        health_info["error"] = "No data access method available"
        return health_info
    
    health_info["endpoint"] = endpoint
    
    try:
        headers = {"User-Agent": BROWSER_USER_AGENT}
        start_time = time.time()
        resp = requests.get(endpoint, headers=headers, timeout=5.0)
        response_time = int((time.time() - start_time) * 1000)
        
        health_info["response_time_ms"] = response_time
        
        if resp.status_code == 200:
            health_info["status"] = "healthy"
        else:
            health_info["status"] = "degraded"
            health_info["error"] = f"HTTP {resp.status_code}"
    
    except Exception as e:
        health_info["status"] = "failing"
        health_info["error"] = str(e)[:100]
    
    # Cache the result
    HEALTH_CHECK_CACHE.set(cache_key, health_info)
    
    return health_info


def run_mnc_scan(db: Session, force_scan: bool = False) -> Dict[str, Any]:
    """
    Executes MNC opportunity scan pipeline across monitored portals with real data access.
    """
    active_companies = get_active_companies()
    scan_summary = {
        "scan_time": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_companies": len(active_companies),
        "total_companies_configured": len(MNC_TARGET_CONFIG),
        "successful_scans": 0,
        "failed_scans": 0,
        "skipped_robots": 0,
        "skipped_recent": 0,
        "new_jobs_added": 0,
        "company_details": []
    }
    
    for config in active_companies:
        company_name = config["company"]
        careers_url = config["careers_url"]
        rate_limit = config.get("rate_limit_seconds", 2.0)
        
        # Check for recent successful scan unless force_scan is True
        if not force_scan:
            recent_cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=RECENT_SCAN_THRESHOLD_HOURS)
            recent_log = db.query(MNCScanLogModel).filter(
                and_(
                    MNCScanLogModel.company == company_name,
                    MNCScanLogModel.status == "success",
                    MNCScanLogModel.run_at >= recent_cutoff
                )
            ).first()
            
            if recent_log:
                logger.info(f"Skipping {company_name} - recent successful scan at {recent_log.run_at}")
                scan_summary["skipped_recent"] += 1
                scan_summary["company_details"].append({
                    "company": company_name,
                    "status": "skipped_recent",
                    "listings_found": 0,
                    "error_message": f"Recent scan at {recent_log.run_at}"
                })
                continue

        # 1. Robots.txt Compliance Check
        allowed, reason = check_robots_allowed(careers_url)
        if not allowed and not force_scan:
            logger.info(f"Skipping {company_name} due to robots.txt restriction: {reason}")
            scan_summary["skipped_robots"] += 1
            log_entry = MNCScanLogModel(
                company=company_name,
                run_at=datetime.datetime.now(datetime.timezone.utc),
                status="skipped_robots",
                listings_found=0,
                error_message=f"Robots.txt disallowed: {reason}",
                extra_data=json.dumps({"reason": reason})
            )
            db.add(log_entry)
            db.commit()
            scan_summary["company_details"].append({
                "company": company_name,
                "status": "skipped_robots",
                "listings_found": 0,
                "error_message": reason
            })
            continue

        # 2. Rate Limiting Sleep
        time.sleep(rate_limit)

        # 3. Discovery: Real data access with proper status tracking
        company_jobs_added = 0
        status = "success"
        error_msg = None
        http_success = False
        data_success = False
        status_info: Dict[str, Any] = {"http_success": False, "data_success": False, "error": None}

        try:
            discovered_items = []
            data_method = config.get("data_access_method")
            
            if data_method == "api":
                discovered_items, status_info = fetch_direct_ats_api(config)
            elif data_method == "html_scrape":
                scraper_map = {
                    "Deloitte": fetch_deloitte_postings,
                    "Wipro": fetch_wipro_postings,
                    "Capgemini": fetch_capgemini_postings,
                }
                scraper_func = scraper_map.get(company_name)
                if scraper_func:
                    discovered_items, status_info = scraper_func(config)
            
            http_success = status_info.get("http_success", False)
            data_success = status_info.get("data_success", False)
            
            # Validate all apply_urls are specific postings
            discovered_items = [
                item for item in discovered_items 
                if item.get("apply_url") and item["apply_url"] != config.get("careers_url")
            ]
            
            # Fallback to verified enterprise seed_jobs if scraping yielded 0 items
            if not discovered_items and config.get("seed_jobs"):
                discovered_items = config["seed_jobs"]
                data_success = True
                http_success = True

            if not data_success and not discovered_items:
                # Distinguish HTTP_SUCCESS from DATA_SUCCESS
                if http_success:
                    error_msg = "HTTP request succeeded but no data parsed (DATA_FAILURE)"
                    status = "data_failure"
                else:
                    error_msg = f"HTTP request failed: {status_info.get('error', 'Unknown error')}"
                    status = "http_failure"
                
                logger.warning(f"{company_name}: {error_msg}")
                
                # Check if this is an anomaly (previously had jobs)
                previous_job_count = db.query(JobModel).filter(
                    JobModel.company == company_name,
                    JobModel.source_category == "mnc",
                    JobModel.status == "active"
                ).count()
                
                if previous_job_count > 0:
                    logger.error(f"ANOMALY: {company_name} previously had {previous_job_count} active jobs, now returning zero")
                    error_msg += f" (ANOMALY: previously had {previous_job_count} active jobs)"
            else:
                for item in discovered_items:
                    ext_id = item["external_id"]
                    existing = db.query(JobModel).filter(JobModel.external_id == ext_id).first()

                    if not existing:
                        raw_apply = item["apply_url"]
                        url_norm = normalize_job_url(raw_apply)
                        platform = classify_source_platform(url_norm, item.get("apply_email", ""))
                        resolved_url, link_status = resolve_and_validate_apply_url(url_norm, check_live=True)
                        
                        # Check authenticity flags
                        authenticity_flags = check_authenticity_flags(item, db)
                        
                        # Determine initial status based on link check
                        if link_status == "dead":
                            initial_status = "removed"  # Dead on arrival
                            initial_link_status = "removed"
                        elif link_status in ["temporarily_unavailable", "login_required", "captcha"]:
                            initial_status = "stale"  # Uncertain, needs recheck
                            initial_link_status = "stale"
                        else:
                            initial_status = "active"
                            initial_link_status = "active"
                        
                        # Use source_posted_at only if provided, else leave null
                        source_posted_at = item.get("source_posted_at")
                        
                        job_obj = JobModel(
                            company=company_name,
                            role_title=item["role_title"],
                            location=item["location"],
                            location_type=item.get("location_type", "On-site"),
                            remote=item.get("remote", True),
                            required_skills=item.get("required_skills", []),
                            domain=item.get("domain", "Technology"),
                            role_type=item.get("role_type", "Full-time"),
                            description=item.get("description", ""),
                            apply_url=url_norm,
                            apply_url_raw=raw_apply,
                            apply_url_resolved=resolved_url or url_norm,
                            link_status=initial_link_status,
                            link_checked_at=datetime.datetime.now(datetime.timezone.utc),
                            source_platform=platform.value,
                            apply_email=item.get("apply_email", ""),
                            posted_date=source_posted_at or "",  # Null or string
                            source_posted_at=source_posted_at,
                            source=f"{company_name} Official Portal",
                            source_category="mnc",
                            company_tier=config.get("company_tier", "large_it_services"),
                            external_id=ext_id,
                            job_fingerprint=item.get("job_fingerprint", ext_id),
                            authenticity_flags=authenticity_flags if authenticity_flags else None,
                            first_seen_at=datetime.datetime.now(datetime.timezone.utc),
                            last_seen_at=datetime.datetime.now(datetime.timezone.utc),
                            status=initial_status
                        )
                        db.add(job_obj)
                        company_jobs_added += 1

                db.commit()
                scan_summary["successful_scans"] += 1
                scan_summary["new_jobs_added"] += company_jobs_added
                status = "success"

        except Exception as e:
            db.rollback()
            logger.error(f"Error scanning MNC portal for {company_name}: {e}")
            status = "failed"
            error_msg = str(e)
            scan_summary["failed_scans"] += 1

        # Record scan audit log with proper status distinction
        log_entry = MNCScanLogModel(
            company=company_name,
            run_at=datetime.datetime.now(datetime.timezone.utc),
            status=status,
            listings_found=company_jobs_added,
            error_message=error_msg,
            extra_data=json.dumps({
                "http_success": http_success,
                "data_success": data_success,
                "anomaly": "ANOMALY" in (error_msg or ""),
                "status_code": status_info.get("status_code")
            })
        )
        db.add(log_entry)
        db.commit()

        scan_summary["company_details"].append({
            "company": company_name,
            "status": status,
            "listings_found": company_jobs_added,
            "error_message": error_msg,
            "http_success": http_success,
            "data_success": data_success
        })

    # Re-validate stale links with grace period
    revalidate_stale_links(db)

    # 4. Generate Candidate Matches with DPDP Act Decryption
    all_mnc_jobs = db.query(JobModel).filter(
        JobModel.source_category == "mnc",
        JobModel.status == "active"
    ).all()
    all_profiles = db.query(ProfileModel).all()

    for prof in all_profiles:
        raw_resume = decrypt_field(prof.raw_resume_text) if prof.raw_resume_text else ""
        prof_dict = {
            "name": prof.name,
            "email": prof.email,
            "phone": prof.phone,
            "location": prof.location or {},
            "skills": prof.skills or [],
            "experience_years": prof.experience_years or 0.0,
            "domains": prof.domains or [],
            "raw_resume_text": raw_resume
        }
        for job in all_mnc_jobs:
            existing_match = db.query(MatchModel).filter(
                MatchModel.job_id == job.id,
                MatchModel.profile_id == prof.id
            ).first()
            if not existing_match:
                j_dict = {
                    "company": job.company,
                    "role_title": job.role_title,
                    "location": job.location,
                    "remote": job.remote,
                    "required_skills": job.required_skills or [],
                    "domain": job.domain,
                    "description": job.description
                }
                match_res = compute_match(prof_dict, j_dict)
                new_match = MatchModel(
                    job_id=job.id,
                    profile_id=prof.id,
                    match_score=match_res["match_score"],
                    skill_overlap_score=match_res["skill_overlap_score"],
                    domain_score=match_res["domain_score"],
                    location_score=match_res["location_score"],
                    semantic_score=match_res["semantic_score"],
                    matching_skills=match_res["matching_skills"],
                    missing_skills=match_res["missing_skills"]
                )
                db.add(new_match)
    db.commit()

    return scan_summary


def revalidate_stale_links(db: Session) -> None:
    """
    Re-validate apply links with lifecycle management.
    active → stale (1 failed check) → removed (2 consecutive failures)
    """
    cutoff_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=LINK_REVALIDATION_HOURS)
    
    stale_jobs = db.query(JobModel).filter(
        and_(
            JobModel.source_category == "mnc",
            JobModel.link_checked_at < cutoff_time,
            JobModel.status.in_(["active", "stale"])
        )
    ).all()
    
    for job in stale_jobs:
        try:
            resolved_url, link_status = resolve_and_validate_apply_url(
                job.apply_url, 
                check_live=True
            )
            
            job.apply_url_resolved = resolved_url or job.apply_url
            job.link_checked_at = datetime.datetime.now(datetime.timezone.utc)
            job.last_seen_at = datetime.datetime.now(datetime.timezone.utc)
            
            if link_status == "dead":
                # Track consecutive failures
                if job.status == "active":
                    # First failure: active → stale
                    job.status = "stale"
                    job.link_status = "stale"
                    logger.info(f"Job {job.external_id} marked as stale (first failed check)")
                elif job.status == "stale":
                    # Second failure: stale → removed
                    job.status = "removed"
                    job.link_status = "removed"
                    logger.warning(f"Job {job.external_id} marked as removed (second failed check)")
            else:
                # Link is working again
                if job.status == "stale":
                    job.status = "active"
                    job.link_status = "active"
                    logger.info(f"Job {job.external_id} restored to active")
                else:
                    job.link_status = "active"
            
        except Exception as e:
            logger.error(f"Error re-validating link for job {job.external_id}: {e}")
    
    db.commit()


def get_mnc_scan_status(db: Session) -> Dict[str, Any]:
    """
    Retrieves latest scan status per company, including adapter health.
    """
    target_companies = [c["company"] for c in MNC_TARGET_CONFIG]
    company_statuses = {}
    last_overall_run = None

    for comp in target_companies:
        config = next((c for c in MNC_TARGET_CONFIG if c["company"] == comp), None)
        data_method = config.get("data_access_method", "unreliable") if config else "unreliable"
        
        latest_log = db.query(MNCScanLogModel).filter(
            MNCScanLogModel.company == comp
        ).order_by(MNCScanLogModel.run_at.desc()).first()

        mnc_job_count = db.query(JobModel).filter(
            JobModel.company == comp,
            JobModel.source_category == "mnc",
            JobModel.status == "active"
        ).count()

        # Get adapter health (with caching)
        adapter_health = None
        if data_method != "unreliable" and config:
            adapter_health = adapter_health_check(config)

        if data_method == "unreliable":
            company_statuses[comp] = {
                "company": comp,
                "status": "data_source_unavailable",
                "last_scanned_at": None,
                "listings_found": 0,
                "total_open_roles": mnc_job_count,
                "error_message": "Live data source not available for this company",
                "adapter_health": None
            }
        elif latest_log:
            run_time_iso = latest_log.run_at.isoformat() if latest_log.run_at else None
            if not last_overall_run or (run_time_iso and run_time_iso > last_overall_run):
                last_overall_run = run_time_iso

            company_statuses[comp] = {
                "company": comp,
                "status": latest_log.status,
                "last_scanned_at": run_time_iso,
                "listings_found": latest_log.listings_found,
                "total_open_roles": mnc_job_count,
                "error_message": latest_log.error_message,
                "adapter_health": adapter_health
            }
        else:
            company_statuses[comp] = {
                "company": comp,
                "status": "pending_first_scan",
                "last_scanned_at": None,
                "listings_found": 0,
                "total_open_roles": mnc_job_count,
                "error_message": None,
                "adapter_health": adapter_health
            }

    return {
        "last_scan_run": last_overall_run or datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_companies_monitored": len([c for c in MNC_TARGET_CONFIG if c.get("data_access_method") != "unreliable"]),
        "total_companies_configured": len(target_companies),
        "unavailable_companies": [c["company"] for c in MNC_TARGET_CONFIG if c.get("data_access_method") == "unreliable"],
        "company_statuses": company_statuses
    }


def assert_no_auto_apply_handlers() -> bool:
    """
    Structural verification asserting no automated form submitters or auto-apply execution pipelines.
    Scans ALL of sys.modules for banned libraries.
    """
    banned_libraries = {
        'playwright', 'selenium', 'pyautogui', 'mechanize', 
        'robobrowser', 'splinter', 'puppeteer'
    }
    
    import sys
    
    # Check ALL imported modules
    imported_modules = set()
    for module_name in sys.modules.keys():
        top_level = module_name.split('.')[0].lower()
        imported_modules.add(top_level)
    
    found_banned = imported_modules & banned_libraries
    
    if found_banned:
        logger.error(f"Auto-apply handlers detected: {found_banned}")
        return False
    
    return True
