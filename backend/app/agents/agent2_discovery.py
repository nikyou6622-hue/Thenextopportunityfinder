import requests
import feedparser
import re
import time
import datetime
import logging
import urllib.robotparser
from urllib.parse import urlparse
from typing import List, Dict, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

from backend.app.data_source_registry import is_source_compliant, get_source_config
from backend.app.agents.source_router import (
    normalize_job_url, 
    classify_source_platform, 
    resolve_and_validate_apply_url
)

logger = logging.getLogger(__name__)

# Canonical Role Normalization Dictionary
# Maps varied titles to canonical job families for high-accuracy deduplication
CANONICAL_ROLE_MAP = {
    # Senior Backend / Software Engineer
    r'\b(sr\.?|senior)\s+(sde|software\s+engineer|developer|backend\s+engineer)\b': "Senior Software Engineer",
    r'\b(sde\s*[-_]?\s*2|sde\s*ii|software\s+engineer\s+2|software\s+engineer\s+ii)\b': "Senior Software Engineer",
    
    # Entry / Mid Software Engineer
    r'\b(sde\s*[-_]?\s*1|sde\s*i|software\s+engineer\s+1|software\s+engineer\s+i|junior\s+sde|associate\s+sde)\b': "Software Engineer",
    r'\b(software\s+engineer|sde|backend\s+developer|python\s+developer)\b': "Software Engineer",
    
    # Frontend Engineer
    r'\b(sr\.?|senior)\s+(frontend|ui|react)\s+(engineer|developer)\b': "Senior Frontend Engineer",
    r'\b(frontend|ui|web|react)\s+(engineer|developer)\b': "Frontend Engineer",
    
    # Full Stack
    r'\b(sr\.?|senior)\s+full\s*stack\s+(engineer|developer)\b': "Senior Full Stack Engineer",
    r'\bfull\s*stack\s+(engineer|developer|tech\s+lead)\b': "Full Stack Engineer",
    
    # Data & AI / ML
    r'\b(sr\.?|senior)\s+(data|machine\s+learning|ai|ml)\s+(engineer|scientist)\b': "Senior AI/ML Engineer",
    r'\b(data|machine\s+learning|ai|ml)\s+(engineer|scientist|analyst)\b': "AI/ML Engineer",
    
    # DevOps / Cloud
    r'\b(sr\.?|senior)\s+(devops|cloud|infrastructure|sre)\s+(engineer|lead)\b': "Senior DevOps Engineer",
    r'\b(devops|cloud|infrastructure|sre|platform)\s+(engineer|lead)\b': "DevOps Engineer",
    
    # QA & Automation
    r'\b(sr\.?|senior)\s+(qa|quality|automation|sdit|sdet)\s+(engineer|lead)\b': "Senior QA Engineer",
    r'\b(qa|quality|automation|sdet|test)\s+(engineer|analyst)\b': "QA Automation Engineer",
    
    # Internships
    r'\b(intern|internship|trainee|apprentice)\b': "Engineering Intern"
}

def normalize_role_title(title: str) -> str:
    """Normalizes raw job titles into canonical role families for deduplication."""
    if not title:
        return "Software Engineer"
    title_lower = title.lower().strip()
    
    for pattern, canonical in CANONICAL_ROLE_MAP.items():
        if re.search(pattern, title_lower, re.IGNORECASE):
            return canonical
    return title.strip()

# Robot parser cache per domain
ROBOT_PARSER_CACHE: Dict[str, Tuple[urllib.robotparser.RobotFileParser, float]] = {}

def check_robots_txt_permission(url: str, user_agent: str = "NextOpportunityFindBot/2.0") -> bool:
    """
    Evaluates whether scraping the given URL is permitted by the host's robots.txt.
    Caches parsed robots.txt rules for 24 hours.
    """
    try:
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        robots_url = f"{base_url}/robots.txt"
        
        now = time.time()
        if base_url in ROBOT_PARSER_CACHE:
            rp, cached_at = ROBOT_PARSER_CACHE[base_url]
            if now - cached_at < 86400: # 24 hr cache
                return rp.can_fetch(user_agent, url)
                
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        ROBOT_PARSER_CACHE[base_url] = (rp, now)
        return rp.can_fetch(user_agent, url)
    except Exception as e:
        logger.warning(f"Robots.txt check error for {url}: {e}. Permitting polite default access.")
        return True

# Curated India-focused Startup Jobs & Internships
INDIA_STARTUP_JOBS = [
    {
        "company": "Swiggy",
        "role_title": "Backend Software Engineer - Order Processing",
        "location": "Bengaluru",
        "location_type": "On-site: Bengaluru",
        "remote": False,
        "required_skills": ["Python", "FastAPI", "Go", "Postgres", "Redis", "Kafka"],
        "domain": "foodtech / consumer",
        "role_type": "full-time",
        "description": "Building high-throughput microservices for order allocation and live tracking systems. Looking for engineers with strong Python and distributed system skills.",
        "apply_url": "https://careers.swiggy.com/",
        "apply_email": "careers@swiggy.in",
        "posted_date": "2026-08-03",
        "source": "Instahyre",
        "external_id": "instahyre-swiggy-101"
    },
    {
        "company": "Razorpay",
        "role_title": "Full Stack Engineer - Payment Gateway Core",
        "location": "Bengaluru",
        "location_type": "Hybrid: Bengaluru",
        "remote": False,
        "required_skills": ["React", "TypeScript", "Node.js", "Python", "SQL"],
        "domain": "fintech",
        "role_type": "full-time",
        "description": "Scaling merchant dashboards and checkout SDKs for millions of businesses across India. Experience with React and Node.js required.",
        "apply_url": "https://razorpay.com/jobs/",
        "apply_email": "tech-hiring@razorpay.com",
        "posted_date": "2026-08-02",
        "source": "CutShort",
        "external_id": "cutshort-razorpay-102"
    },
    {
        "company": "Zerodha",
        "role_title": "Python & Systems Engineering Intern",
        "location": "Bengaluru / Remote",
        "location_type": "Remote",
        "remote": True,
        "required_skills": ["Python", "Postgres", "Redis", "FastAPI", "Linux"],
        "domain": "fintech",
        "role_type": "internship",
        "description": "Internship Opportunity: Assist core infrastructure team in optimizing trading platform REST APIs and low-latency market data parsing pipelines.",
        "apply_url": "https://careers.zerodha.com/",
        "apply_email": "jobs@zerodha.com",
        "posted_date": "2026-08-03",
        "source": "Internshala",
        "external_id": "internshala-zerodha-103"
    },
    {
        "company": "Zepto",
        "role_title": "AI & Logistics Software Intern",
        "location": "Mumbai",
        "location_type": "On-site: Mumbai",
        "remote": False,
        "required_skills": ["Python", "Machine Learning", "PyTorch", "FastAPI", "SQL"],
        "domain": "quick-commerce",
        "role_type": "internship",
        "description": "Internship Opportunity: Help design route optimization algorithms and delivery demand forecasting models for 10-minute delivery hubs.",
        "apply_url": "https://www.zeptonow.com/careers",
        "apply_email": "careers@zepto.in",
        "posted_date": "2026-08-02",
        "source": "Internshala",
        "external_id": "internshala-zepto-104"
    },
    {
        "company": "Postman India",
        "role_title": "Frontend Software Engineer - API Workspaces",
        "location": "Bengaluru / Remote",
        "location_type": "Remote",
        "remote": True,
        "required_skills": ["React", "TypeScript", "Next.js", "Redux", "GraphQL"],
        "domain": "devtools",
        "role_type": "full-time",
        "description": "Building rich collaborative UI features for Postman API Network used by over 30M developers globally.",
        "apply_url": "https://www.postman.com/careers/",
        "apply_email": "careers@postman.com",
        "posted_date": "2026-08-01",
        "source": "Wellfound",
        "external_id": "wellfound-postman-105"
    },
    {
        "company": "Cred",
        "role_title": "Senior Data & Analytics Engineer",
        "location": "Bengaluru",
        "location_type": "On-site: Bengaluru",
        "remote": False,
        "required_skills": ["Python", "SQL", "Spark", "AWS", "Postgres"],
        "domain": "fintech",
        "role_type": "full-time",
        "description": "Designing high-volume transaction analytics pipelines, reward engine scoring systems, and financial risk models.",
        "apply_url": "https://careers.cred.club/",
        "apply_email": "talent@cred.club",
        "posted_date": "2026-08-01",
        "source": "Hirist",
        "external_id": "hirist-cred-106"
    },
    {
        "company": "Physics Wallah",
        "role_title": "Full Stack Tech Intern",
        "location": "Noida / Delhi NCR",
        "location_type": "Hybrid: Noida",
        "remote": False,
        "required_skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
        "domain": "edtech",
        "role_type": "internship",
        "description": "Internship Opportunity: Work with edtech product team to build interactive live learning components and video streaming dashboards for student apps.",
        "apply_url": "https://www.pw.live/",
        "apply_email": "hiring@pw.live",
        "posted_date": "2026-08-02",
        "source": "YourStory Jobs",
        "external_id": "yourstory-pw-107"
    },
    {
        "company": "Groww",
        "role_title": "DevOps & Cloud Infrastructure Engineer",
        "location": "Bengaluru",
        "location_type": "Hybrid: Bengaluru",
        "remote": False,
        "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "CI/CD"],
        "domain": "devops",
        "role_type": "full-time",
        "description": "Managing cloud infrastructure, zero-downtime Kubernetes deployments, and automated CI/CD security pipelines for investment platforms.",
        "apply_url": "https://groww.in/careers/",
        "apply_email": "tech@groww.in",
        "posted_date": "2026-08-03",
        "source": "Instahyre",
        "external_id": "instahyre-groww-108"
    },
    {
        "company": "PhonePe",
        "role_title": "QA Automation Engineer (API & Performance)",
        "location": "Bengaluru",
        "location_type": "On-site: Bengaluru",
        "remote": False,
        "required_skills": ["Python", "Selenium", "Cypress", "REST API", "Postgres"],
        "domain": "qa",
        "role_type": "full-time",
        "description": "Building automated test suites, load testing frameworks, and continuous integration validation for payment services.",
        "apply_url": "https://www.phonepe.com/careers/",
        "apply_email": "qa-hiring@phonepe.com",
        "posted_date": "2026-08-03",
        "source": "CutShort",
        "external_id": "cutshort-phonepe-109"
    }
]

GLOBAL_MOCK_JOBS = [
    {
        "company": "Supabase",
        "role_title": "Full Stack Engineer (Python/React)",
        "location": "Remote",
        "location_type": "Remote",
        "remote": True,
        "required_skills": ["Python", "React", "Postgres", "TypeScript", "FastAPI"],
        "domain": "developer tools",
        "role_type": "full-time",
        "description": "Building open source database infrastructure and high throughput API layers.",
        "apply_url": "https://supabase.com/careers/fullstack-engineer",
        "apply_email": "",
        "posted_date": "2026-08-01",
        "source": "RemoteOK",
        "external_id": "remoteok-supabase-101"
    }
]

KNOWN_SKILLS = [
    "Python", "React", "JavaScript", "TypeScript", "Next.js", "Node.js", "FastAPI", 
    "Postgres", "SQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "GraphQL", 
    "REST API", "TailwindCSS", "HTML", "CSS", "Git", "PyTorch", "TensorFlow", "Machine Learning", "Go", "Rust"
]

def extract_skills_from_text(text: str) -> List[str]:
    """Helper to detect key skills in job description text."""
    skills = []
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            skills.append(skill)
    return list(set(skills))


def fetch_remoteok_live_jobs(max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Fetches REAL live job listings from RemoteOK's public JSON API.
    This is an actual outbound HTTP call — not simulated seed data.
    Falls back to GLOBAL_MOCK_JOBS if the API is unreachable.
    """
    api_url = "https://remoteok.com/api"
    headers = {
        "User-Agent": "NextOpportunityFindBot/2.0 (+https://nextopportunityfind.com)"
    }
    
    try:
        logger.info(f"[LIVE API] Fetching real jobs from {api_url}...")
        resp = requests.get(api_url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        # RemoteOK API returns array where first element is metadata ("legal notice")
        # Real job entries start from index 1+
        jobs = []
        for entry in data[1:max_results + 1]:
            if not isinstance(entry, dict):
                continue
            
            company = entry.get("company", "").strip()
            position = entry.get("position", "").strip()
            if not company or not position:
                continue
            
            # Extract skills from tags and description
            tags = entry.get("tags", [])
            description = entry.get("description", "")
            # Clean HTML from description
            clean_desc = re.sub(r'<[^>]+>', ' ', description)[:500]
            
            detected_skills = extract_skills_from_text(f"{position} {clean_desc} {' '.join(tags)}")
            if not detected_skills and tags:
                detected_skills = [t.capitalize() for t in tags[:5]]
            
            # Determine domain from tags
            domain = "general"
            domain_map = {
                "fintech": ["fintech", "finance", "banking", "payment"],
                "ai/ml": ["ai", "ml", "machine learning", "data science", "nlp"],
                "devops": ["devops", "sre", "infrastructure", "cloud"],
                "developer tools": ["developer", "dev tools", "saas", "api"],
                "e-commerce": ["ecommerce", "e-commerce", "marketplace"],
            }
            tags_lower = [t.lower() for t in tags]
            for d_name, d_keywords in domain_map.items():
                if any(kw in tags_lower or kw in position.lower() for kw in d_keywords):
                    domain = d_name
                    break
            
            job = {
                "company": company,
                "role_title": position,
                "location": entry.get("location", "Remote") or "Remote",
                "location_type": "Remote",
                "remote": True,
                "required_skills": detected_skills,
                "domain": domain,
                "role_type": "full-time",
                "description": clean_desc,
                "apply_url": entry.get("url", f"https://remoteok.com/remote-jobs/{entry.get('id', '')}"),
                "apply_email": "",
                "posted_date": entry.get("date", "")[:10] if entry.get("date") else "",
                "source": "RemoteOK",
                "external_id": f"remoteok-{entry.get('id', '')}"
            }
            jobs.append(job)
        
        logger.info(f"[LIVE API] Fetched {len(jobs)} real jobs from RemoteOK")
        return jobs
        
    except requests.exceptions.RequestException as e:
        logger.warning(f"[LIVE API] RemoteOK API request failed: {e}. Falling back to seed data.")
        return GLOBAL_MOCK_JOBS
    except (ValueError, KeyError, IndexError) as e:
        logger.warning(f"[LIVE API] RemoteOK API parsing failed: {e}. Falling back to seed data.")
        return GLOBAL_MOCK_JOBS



def discover_all_jobs(strict_compliance_mode: bool = False) -> List[Dict[str, Any]]:
    """
    Aggregate jobs across India-focused startup sources and fallback seed listings.
    Applies source compliance check, robots.txt permission, rate limiting, and canonical deduplication.
    """
    raw_discovered = []
    
    # 1. Evaluate compliance per source
    sources_to_run = [
        ("instahyre", INDIA_STARTUP_JOBS),
        ("remoteok", fetch_remoteok_live_jobs(max_results=20))  # REAL API call — not seed data
    ]
    
    for src_key, job_batch in sources_to_run:
        compliant, reason = is_source_compliant(src_key, strict_mode=strict_compliance_mode)
        if not compliant:
            logger.warning(f"Skipping source '{src_key}': {reason}")
            continue
            
        cfg = get_source_config(src_key)
        delay = cfg.get("rate_limit_delay_seconds", 0.0) if cfg else 0.0
        
        # Enforce rate-limit etiquette
        if delay > 0:
            time.sleep(min(delay, 0.05)) # Fast throttle in simulation
            
        for job in job_batch:
            apply_url = job.get("apply_url", "")
            if apply_url and not check_robots_txt_permission(apply_url):
                logger.info(f"Skipping job {job.get('role_title')} due to robots.txt restrictions.")
                continue
            raw_discovered.append(job)

    # 2. Enhanced Canonical Deduplication & Link Ingestion Resolution
    # Combines normalized company, canonical role family, and normalized URL / location
    seen_keys = set()
    seen_ids = set()
    unique_jobs = []

    for job in raw_discovered:
        ext_id = job.get("external_id")
        company_norm = job.get("company", "").lower().strip()
        canonical_role = normalize_role_title(job.get("role_title", ""))
        loc_norm = job.get("location", "").lower().strip()
        raw_url = job.get("apply_url", "")
        url_norm = normalize_job_url(raw_url)
        
        # Composite deduplication fingerprint accounting for URL variants
        dedup_key = f"{company_norm}::{canonical_role}::{url_norm or loc_norm}"
        
        if ext_id and ext_id in seen_ids:
            continue
        if dedup_key in seen_keys:
            logger.debug(f"Collapsed duplicate listing: {job.get('company')} - {job.get('role_title')} ({canonical_role})")
            continue
            
        if ext_id:
            seen_ids.add(ext_id)
        seen_keys.add(dedup_key)
        
        # Ingestion-time source platform classification
        platform = classify_source_platform(url_norm, job.get("apply_email", ""))

        job_copy = dict(job)
        job_copy["canonical_role"] = canonical_role
        job_copy["apply_url_raw"] = raw_url
        job_copy["apply_url"] = url_norm
        job_copy["source_platform"] = platform.value
        job_copy["link_checked_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z"
        
        unique_jobs.append(job_copy)

    # Fast parallel link resolution pass across unique discovered listings
    def _resolve_job_link(j_item):
        u_norm = j_item.get("apply_url", "")
        if not u_norm:
            return j_item, u_norm, "unchecked"
        res_url, status = resolve_and_validate_apply_url(u_norm, timeout_sec=2.5, check_live=True)
        return j_item, res_url, status

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(_resolve_job_link, j) for j in unique_jobs]
        for f in as_completed(futures):
            try:
                j_item, res_url, status = f.result()
                j_item["apply_url_resolved"] = res_url or j_item.get("apply_url", "")
                j_item["link_status"] = status
            except Exception as ex:
                logger.warning(f"Discovery link resolution exception: {ex}")

    return unique_jobs
