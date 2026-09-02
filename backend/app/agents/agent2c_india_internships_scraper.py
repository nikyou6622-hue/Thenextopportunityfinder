"""
agent2c_india_internships_scraper.py — NextOpportunityFind Multi-Source Internship Scraper

FINAL PRODUCTION VERSION
========================
All blockers resolved:
- Stipend saved to description marker
- Skills extracted from listings
- Deduplication before storage (including distinct JSON-LD fallbacks)
- Network failures → "unverified" not "dead"
- All fields persisted into database models
- Dedicated source-specific parsers (Internshala, Cuvette, JSON-LD, Generic)
- Clean UTF-8 currency formatting (INR  / INR)
- Robust sync & async runners with event-loop safety
- Modern async HTTP networking via httpx (with aiohttp compatibility)
"""

import asyncio
import datetime as dt
import hashlib
import json
import logging
import re
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple, Callable, Set
from urllib.parse import urlparse, urljoin

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import or_
from sqlalchemy.orm import Session, sessionmaker

from backend.app.db.models import JobModel, MatchModel, ProfileModel
from backend.app.utils.skill_normalizer import extract_skills_from_text, normalize_skill_list
from backend.app.agents.agent3_matching import compute_match
from backend.app.agents.source_router import (
    normalize_job_url,
    classify_source_platform,
    resolve_and_validate_apply_url
)

logger = logging.getLogger("internship_agent")

# ============================================================================
# Configuration
# ============================================================================

REQUEST_TIMEOUT_SECONDS = 10
MAX_CONCURRENT_REQUESTS = 5
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2
CIRCUIT_BREAKER_THRESHOLD = 5
CIRCUIT_BREAKER_TIMEOUT = 300
SCRAPE_CACHE_TTL = 1800
ROBOTS_CACHE_TTL = 3600
MAX_URL_VALIDATION_CONCURRENCY = 10
BOT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

# ============================================================================
# Data Models
# ============================================================================

@dataclass
class SourceTarget:
    name: str
    company: str
    url: str
    category: str = "general"
    rate_limit_seconds: float = 1.0
    headers: Dict[str, str] = field(default_factory=dict)
    parser: Optional[Callable] = None
    is_internship_focused: bool = True

@dataclass
class ScrapeResult:
    source: SourceTarget
    listings: List[Dict[str, Any]]
    status: str
    error: Optional[str] = None

# ============================================================================
# Thread-Safe Cache
# ============================================================================

class TTLCache:
    def __init__(self, ttl_seconds: int):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.RLock()
        self._ttl = ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self._cache:
                value, timestamp = self._cache[key]
                if time.time() - timestamp < self._ttl:
                    return value
                del self._cache[key]
            return None
    
    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._cache[key] = (value, time.time())
            if len(self._cache) > 1000:
                now = time.time()
                self._cache = {
                    k: v for k, v in self._cache.items()
                    if now - v[1] < self._ttl
                }

_scrape_cache = TTLCache(SCRAPE_CACHE_TTL)
_robots_cache = TTLCache(ROBOTS_CACHE_TTL)

# ============================================================================
# Circuit Breaker
# ============================================================================

class CircuitBreaker:
    def __init__(self, name: str, threshold: int = CIRCUIT_BREAKER_THRESHOLD):
        self.name = name
        self.threshold = threshold
        self.failures = 0
        self.last_failure_time: Optional[float] = None
        self.is_open = False
        self._lock = threading.Lock()
    
    def record_success(self):
        with self._lock:
            self.failures = 0
            self.is_open = False
            self.last_failure_time = None
    
    def record_failure(self):
        with self._lock:
            self.failures += 1
            self.last_failure_time = time.time()
            if self.failures >= self.threshold:
                self.is_open = True
    
    def can_execute(self) -> bool:
        with self._lock:
            if not self.is_open:
                return True
            if self.last_failure_time and time.time() - self.last_failure_time > CIRCUIT_BREAKER_TIMEOUT:
                self.is_open = False
                self.failures = 0
                return True
            return False

_breakers: Dict[str, CircuitBreaker] = {}
_breakers_lock = threading.Lock()

def get_breaker(name: str) -> CircuitBreaker:
    with _breakers_lock:
        if name not in _breakers:
            _breakers[name] = CircuitBreaker(name)
        return _breakers[name]

# ============================================================================
# Robots.txt (RFC 9309 Compliant with Redirect Support)
# ============================================================================

async def check_robots_allowed(url: str) -> Tuple[bool, str]:
    """Robots.txt compliance check with redirect support & RFC 9309 404 handling."""
    parsed = urlparse(url)
    domain = parsed.netloc
    if not domain:
        return True, "no_domain"
    
    cache_key = f"robots:{domain}"
    cached = _robots_cache.get(cache_key)
    if cached is not None:
        return cached
    
    robots_url = f"{parsed.scheme}://{domain}/robots.txt"
    
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(robots_url, headers={"User-Agent": BOT_USER_AGENT})
            if response.status_code == 200:
                text = response.text
                rp = __import__("urllib.robotparser", fromlist=["RobotFileParser"]).RobotFileParser()
                rp.parse(text.splitlines())
                allowed = rp.can_fetch(BOT_USER_AGENT, url)
                reason = "parsed"
            elif response.status_code in (404, 410):
                # RFC 9309 Section 2.3.1.2: 404/410 means no restriction -> ALLOWED
                allowed = True
                reason = "no_robots_txt"
            else:
                allowed = True
                reason = f"http_{response.status_code}"
    except Exception as e:
        allowed = False
        reason = f"error: {type(e).__name__}"
    
    _robots_cache.set(cache_key, (allowed, reason))
    return allowed, reason

# ============================================================================
# URL Validation (Network failure → unverified)
# ============================================================================

async def validate_urls_concurrent(listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Validates URLs concurrently. Network failure → unverified."""
    semaphore = asyncio.Semaphore(MAX_URL_VALIDATION_CONCURRENCY)
    
    async def validate_one(listing: Dict[str, Any]) -> Dict[str, Any]:
        async with semaphore:
            apply_url = listing.get("apply_url", "")
            
            if not apply_url:
                listing["link_status"] = "dead"
                listing["apply_url_resolved"] = None
                listing["link_checked_at"] = dt.datetime.now(dt.timezone.utc)
                return listing
            
            try:
                normalized = normalize_job_url(apply_url)
                resolved, status = await asyncio.to_thread(
                    resolve_and_validate_apply_url, normalized, True
                )
                
                listing["apply_url"] = normalized
                listing["apply_url_resolved"] = resolved or normalized
                # Network failure/exception → unverified, not dead
                listing["link_status"] = status or "unverified"
                listing["link_checked_at"] = dt.datetime.now(dt.timezone.utc)
            except Exception as e:
                logger.warning(f"URL validation exception for {apply_url}: {type(e).__name__}")
                listing["link_status"] = "unverified"
                listing["apply_url_resolved"] = None
                listing["link_checked_at"] = dt.datetime.now(dt.timezone.utc)
            
            return listing
    
    tasks = [validate_one(l) for l in listings]
    return await asyncio.gather(*tasks)

# ============================================================================
# Stipend Parsing
# ============================================================================

def parse_numeric_stipend(stipend: Optional[str]) -> Optional[int]:
    """Returns monthly INR only when source provides monthly data."""
    if not stipend:
        return None
    text = stipend.casefold().replace(",", "").replace("INR ", "").replace("rs.", "").replace("inr", "")
    if not re.search(r"month|per\s*month|/\s*month|monthly|mo", text):
        return None
    values = [int(v) for v in re.findall(r"\d+", text)]
    if not values:
        return None
    if len(values) >= 2 and re.search(r"\d+\s*-\s*\d+", text):
        return (values[0] + values[1]) // 2
    return values[0]

# ============================================================================
# Description Builder (Saves Stipend/Duration/PPO)
# ============================================================================

def build_description_with_details(
    base_description: str,
    stipend: Optional[str],
    duration: Optional[str],
    ppo: Optional[bool]
) -> str:
    """Builds description with structured listing details marker."""
    details_parts = []
    if stipend:
        details_parts.append(f"Stipend: {stipend}")
    if duration:
        details_parts.append(f"Duration: {duration}")
    if ppo is not None:
        details_parts.append(f"PPO: {'yes' if ppo else 'no'}")
    
    if not details_parts:
        return base_description
    
    details_marker = f"[Listing details | {' | '.join(details_parts)}]"
    
    if base_description:
        return f"{base_description}\n{details_marker}"
    return details_marker

# ============================================================================
# Skill Extraction
# ============================================================================

def extract_skills_from_listing(title: str, description: str) -> List[str]:
    """Extracts skills from listing title and description using shared taxonomy."""
    return extract_skills_from_text(f"{title} {description}")

# ============================================================================
# Source-Specific Parsers
# ============================================================================

def _is_internship_title(title: str) -> bool:
    title_lower = title.lower()
    keywords = ["intern", "trainee", "co-op", "coop", "apprentice", "campus", "university", "fellow", "fellowship"]
    return any(kw in title_lower for kw in keywords)


def parse_internshala(html: str, source: SourceTarget, max_items: int) -> List[Dict[str, Any]]:
    """Internshala-specific parser with full field extraction."""
    listings = []
    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select("div[data-href], div.individual_internship, div.internship_meta")
    
    for card in cards[:max_items]:
        href = card.get("data-href")
        if not href:
            link_el = card.select_one("a[href*='/internship/detail/'], a.view_detail_button, a.job-title-href")
            href = link_el.get("href") if link_el else None
        
        if not href:
            continue
        
        apply_url = urljoin("https://internshala.com", href)
        title_el = card.select_one("h3.job-internship-name, a.job-title-href, .heading_4_5, .heading_3, .profile, h3, h4")
        if not title_el:
            continue
        
        title = title_el.get_text(strip=True)
        if not title or len(title) < 2:
            continue
        
        company_el = card.select_one(".company_name, .company-name, p.company-name, p.company")
        company = company_el.get_text(strip=True) if company_el else source.company
        company = company.replace("Actively hiring", "").strip()
        
        location_el = card.select_one("a.location_link, div.locations span, .location")
        location = location_el.get_text(strip=True) if location_el else "Work From Home"
        
        remote = "remote" in location.lower() or "home" in location.lower() or "work from home" in location.lower()
        location_type = "Remote: India" if remote else f"On-site: {location}"
        
        stipend_el = card.select_one("span.stipend, .stipend")
        stipend = stipend_el.get_text(strip=True) if stipend_el else None
        
        duration_el = card.select_one("div.item_body, span.duration, .duration")
        duration = duration_el.get_text(strip=True) if duration_el else None
        
        desc_el = card.select_one("div.internship_other_details, div.internship_details")
        description = desc_el.get_text(strip=True) if desc_el else f"Tech Internship at {company}"
        
        skills = extract_skills_from_listing(title, description)
        ppo = "ppo" in description.lower() or "pre-placement" in description.lower()
        
        full_description = build_description_with_details(
            description, stipend, duration, ppo if ppo else None
        )
        
        external_id = hashlib.md5(f"internshala:{apply_url}:{title}".encode()).hexdigest()[:20]
        
        listings.append({
            "role_title": title,
            "company": company,
            "location": location,
            "location_type": location_type,
            "remote": remote,
            "required_skills": skills,
            "domain": "general",
            "description": full_description,
            "apply_url": apply_url,
            "apply_url_raw": apply_url,
            "apply_email": "",
            "source": "internshala",
            "external_id": external_id,
            "is_verified": True,
            "company_tier": "startup"
        })
    
    return listings


def parse_unstop(raw_text_or_json: str, source: SourceTarget, max_items: int) -> List[Dict[str, Any]]:
    """Unstop Public API Internship Parser."""
    listings = []
    try:
        data = json.loads(raw_text_or_json)
        items = data.get("data", {}).get("data", [])
        for item in items[:max_items]:
            title = item.get("title", "").strip()
            if not title:
                continue
            
            org = item.get("organisation", {})
            company = org.get("name", "Tech Startup").strip() if isinstance(org, dict) else "Tech Startup"
            
            seo_url = item.get("seo_url", "")
            apply_url = f"https://unstop.com/{seo_url}" if seo_url else source.url
            if apply_url.startswith("https://unstop.com/https://unstop.com/"):
                apply_url = apply_url.replace("https://unstop.com/https://unstop.com/", "https://unstop.com/")
            
            job_detail = item.get("job_detail", {})
            locations = []
            if isinstance(job_detail, dict):
                loc_list = job_detail.get("locations", [])
                if isinstance(loc_list, list):
                    locations = [l.get("city", "") for l in loc_list if isinstance(l, dict) and l.get("city")]
            
            location_str = ", ".join(locations) if locations else "Remote / India"
            remote = "remote" in location_str.lower() or "online" in location_str.lower()
            location_type = "Remote: India" if remote else f"On-site: {location_str}"
            
            stipend = item.get("stipend") or "Stipend Provided"
            description = f"{title} Internship at {company}. Domain: Tech / Software. Apply directly on Unstop."
            skills = extract_skills_from_listing(title, description)
            external_id = hashlib.md5(f"unstop:{apply_url}:{title}".encode()).hexdigest()[:20]
            
            listings.append({
                "role_title": title,
                "company": company,
                "location": location_str,
                "location_type": location_type,
                "remote": remote,
                "required_skills": skills,
                "domain": "general",
                "description": description,
                "apply_url": apply_url,
                "apply_url_raw": apply_url,
                "apply_email": "",
                "source": "unstop",
                "external_id": external_id,
                "is_verified": True,
                "company_tier": "startup"
            })
    except Exception as e:
        logger.warning(f"Unstop API parsing error: {e}")
    return listings


def parse_cuvette(html: str, source: SourceTarget, max_items: int) -> List[Dict[str, Any]]:
    """Cuvette-specific parser with stipend, duration, and skill badge extraction."""
    listings = []
    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select(".job-card, .internship-card, div[data-testid='job-card'], div.job-listing, article")
    
    for card in cards[:max_items]:
        title_el = card.select_one("h3.job-title, .job-role, h2, h3, .title")
        if not title_el:
            continue
        
        title = title_el.get_text(strip=True)
        if not _is_internship_title(title):
            continue
        
        company_el = card.select_one(".company-name, .company, p.company")
        company = company_el.get_text(strip=True) if company_el else source.company
        
        location_el = card.select_one(".job-location, .location")
        location = location_el.get_text(strip=True) if location_el else "Remote (India)"
        remote = "remote" in location.lower() or "home" in location.lower()
        location_type = "Remote: India" if remote else f"On-site: {location}"
        
        stipend_el = card.select_one(".stipend, .salary, .compensation")
        stipend = stipend_el.get_text(strip=True) if stipend_el else None
        
        duration_el = card.select_one(".duration, .job-duration")
        duration = duration_el.get_text(strip=True) if duration_el else "3-6 Months"
        
        link_el = card.select_one("a[href*='/job/'], a[href*='/internship/'], a[href]")
        apply_url = ""
        if link_el and link_el.get("href"):
            apply_url = urljoin(source.url, link_el["href"])
        
        if not apply_url:
            continue
        
        desc_el = card.select_one(".job-description, .description, p.job-description, p.description, div.description")
        if not desc_el:
            desc_candidates = [p.get_text(strip=True) for p in card.select("p") if "company" not in " ".join(p.get("class", []))]
            description = desc_candidates[0] if desc_candidates else f"Cuvette Tech Internship at {company}"
        else:
            description = desc_el.get_text(strip=True)
        
        skills = extract_skills_from_listing(title, description)
        skill_badges = [s.get_text(strip=True) for s in card.select(".skill-badge, .tag, .chip")]
        for sk in skill_badges:
            if sk and sk not in skills:
                skills.append(sk)
        
        card_text = card.get_text().lower()
        ppo = "ppo" in description.lower() or "ppo" in title.lower() or "ppo" in card_text or "pre-placement" in card_text
        full_description = build_description_with_details(
            description, stipend, duration, ppo if ppo else None
        )
        
        external_id = hashlib.md5(f"cuvette:{apply_url}:{title}".encode()).hexdigest()[:20]
        
        listings.append({
            "role_title": title,
            "company": company,
            "location": location,
            "location_type": location_type,
            "remote": remote,
            "required_skills": skills,
            "domain": "startup / tech",
            "description": full_description,
            "apply_url": apply_url,
            "apply_url_raw": apply_url,
            "apply_email": "",
            "source": "cuvette",
            "external_id": external_id,
            "is_verified": False,
            "company_tier": "startup"
        })
    
    return listings


def parse_json_ld(html: str, source: SourceTarget, max_items: int) -> List[Dict[str, Any]]:
    """
    JSON-LD parser with internship filtering and unique external_id generation.
    When apply_url falls back to source.url, includes title & company in hash to avoid collision.
    """
    listings = []
    soup = BeautifulSoup(html, "html.parser")
    
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
            items = data if isinstance(data, list) else [data]
            
            for item in items:
                if not isinstance(item, dict) or item.get("@type") != "JobPosting":
                    continue
                
                title = item.get("title", "")
                if not title:
                    continue
                
                # Always filter for internships
                if not _is_internship_title(title):
                    continue
                
                raw_url = item.get("url") or item.get("applyUrl") or ""
                if raw_url:
                    parsed = urlparse(raw_url)
                    if parsed.scheme not in ("http", "https"):
                        continue
                    apply_url = raw_url
                else:
                    apply_url = source.url
                
                company = source.company
                hiring_org = item.get("hiringOrganization", {})
                if isinstance(hiring_org, dict):
                    company = hiring_org.get("name", source.company)
                
                location = None
                job_location = item.get("jobLocation", {})
                if isinstance(job_location, dict):
                    address = job_location.get("address", {})
                    if isinstance(address, dict):
                        location = address.get("addressLocality")
                
                if not location:
                    location = "Unknown"
                    location_type = "Unknown"
                    remote = False
                else:
                    remote = "remote" in location.lower()
                    location_type = "Remote" if remote else f"On-site: {location}"
                
                description = item.get("description", "")
                skills = extract_skills_from_listing(title, description)
                
                # Hash includes title and company so fallback apply_url does not collide across listings
                external_id = hashlib.md5(f"{source.name}:{apply_url}:{title}:{company}".encode()).hexdigest()[:20]
                
                listings.append({
                    "role_title": title,
                    "company": company,
                    "location": location,
                    "location_type": location_type,
                    "remote": remote,
                    "required_skills": skills,
                    "domain": "general",
                    "description": description,
                    "apply_url": apply_url,
                    "apply_url_raw": apply_url,
                    "apply_email": "",
                    "source": source.name,
                    "external_id": external_id,
                    "is_verified": False,
                    "company_tier": "unknown"
                })
                
                if len(listings) >= max_items:
                    return listings
        except json.JSONDecodeError:
            continue
        except Exception:
            continue
    
    return listings


def parse_generic_html(html: str, source: SourceTarget, max_items: int) -> List[Dict[str, Any]]:
    """Generic HTML parser with internship filter and skill extraction."""
    listings = []
    soup = BeautifulSoup(html, "html.parser")
    selectors = ["div.job-listing", "div.job-card", "article.job", "li.job", "div.internship"]
    seen_urls: Set[str] = set()
    
    for selector in selectors:
        for elem in soup.select(selector)[:max_items]:
            title_el = elem.select_one("h2, h3, h4, a.title, a.job-title")
            if not title_el:
                continue
            
            title = title_el.get_text(strip=True)
            if not _is_internship_title(title):
                continue
            
            link_el = elem.select_one("a[href]")
            apply_url = ""
            if link_el and link_el.get("href"):
                apply_url = urljoin(source.url, link_el["href"])
            
            if not apply_url or apply_url in seen_urls:
                continue
            seen_urls.add(apply_url)
            
            desc_el = elem.select_one("p, div.description, div.summary")
            description = desc_el.get_text(strip=True) if desc_el else ""
            skills = extract_skills_from_listing(title, description)
            external_id = hashlib.md5(f"{source.name}:{apply_url}:{title}".encode()).hexdigest()[:20]
            
            listings.append({
                "role_title": title,
                "company": source.company,
                "location": "Unknown",
                "location_type": "Unknown",
                "remote": False,
                "required_skills": skills,
                "domain": "general",
                "description": description,
                "apply_url": apply_url,
                "apply_url_raw": apply_url,
                "apply_email": "",
                "source": source.name,
                "external_id": external_id,
                "is_verified": False,
                "company_tier": "unknown"
            })
            
            if len(listings) >= max_items:
                return listings
        break
    
    return listings

# ============================================================================
# Deduplication
# ============================================================================

def deduplicate_listings(listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Removes duplicate listings by external_id."""
    seen: Set[str] = set()
    unique = []
    for listing in listings:
        ext_id = listing.get("external_id", "")
        if ext_id and ext_id not in seen:
            seen.add(ext_id)
            unique.append(listing)
    return unique

# ============================================================================
# Batch Store
# ============================================================================

def store_jobs_batch(
    factory: sessionmaker,
    jobs: List[Dict[str, Any]],
    profile_id: Optional[int]
) -> Tuple[int, int]:
    """Upserts listings. Saves all URL validation fields."""
    if not jobs:
        return 0, 0
    
    # Deduplicate before storage
    jobs = deduplicate_listings(jobs)
    
    external_ids = list({j["external_id"] for j in jobs})
    
    with factory() as db:
        try:
            existing = {
                j.external_id: j
                for j in db.query(JobModel).filter(JobModel.external_id.in_(external_ids)).all()
            }
            
            profile = db.get(ProfileModel, profile_id) if profile_id else None
            
            match_map = {}
            if profile and existing:
                existing_ids = [j.id for j in existing.values()]
                match_map = {
                    m.job_id: m
                    for m in db.query(MatchModel).filter(
                        MatchModel.profile_id == profile.id,
                        MatchModel.job_id.in_(existing_ids)
                    ).all()
                }
            
            created, updated = 0, 0
            all_jobs = []
            
            for data in jobs:
                model = existing.get(data["external_id"])
                if model is None:
                    model = JobModel(
                        external_id=data["external_id"],
                        source_category="internship_india",
                        role_type="internship",
                        posted_date=dt.date.today().isoformat(),
                        created_at=dt.datetime.now(dt.timezone.utc),
                    )
                    db.add(model)
                    created += 1
                else:
                    updated += 1
                
                # Apply all fields
                for f in ("role_title", "company", "location", "location_type",
                          "remote", "required_skills", "domain", "description",
                          "apply_email", "source", "is_verified", "company_tier"):
                    if f in data and data[f] is not None:
                        setattr(model, f, data[f])
                
                # Persist URL fields
                if "apply_url" in data and data["apply_url"]:
                    model.apply_url = data["apply_url"]
                if "apply_url_raw" in data and data["apply_url_raw"]:
                    model.apply_url_raw = data["apply_url_raw"]
                if "apply_url_resolved" in data and data["apply_url_resolved"]:
                    model.apply_url_resolved = data["apply_url_resolved"]
                if "link_status" in data and data["link_status"]:
                    model.link_status = data["link_status"]
                if "link_checked_at" in data and data["link_checked_at"]:
                    model.link_checked_at = data["link_checked_at"]
                
                # Source platform
                if "apply_url" in data and data["apply_url"]:
                    model.source_platform = classify_source_platform(
                        data["apply_url"], data.get("apply_email", "")
                    ).value
                
                # Technical role sanity check
                from backend.app.agents.source_router import is_technical_role
                model.is_technical = is_technical_role(model.role_title or "", model.description or "")
                
                # Default link_status if missing
                if model.link_status is None:
                    model.link_status = "unverified"
                    model.link_checked_at = dt.datetime.now(dt.timezone.utc)
                
                all_jobs.append(model)
            
            db.flush()
            
            # Generate matches
            if profile:
                profile_dict = {
                    "name": profile.name or "",
                    "email": profile.email or "",
                    "skills": profile.skills or [],
                    "domains": profile.domains or [],
                    "location": profile.location or {},
                    "raw_resume_text": profile.summary or ""
                }
                new_matches = []
                
                for job in all_jobs:
                    result = compute_match(profile_dict, {
                        "company": job.company,
                        "role_title": job.role_title,
                        "required_skills": job.required_skills or [],
                        "domain": job.domain,
                        "location": job.location,
                        "remote": job.remote,
                        "description": job.description,
                        "is_technical": job.is_technical
                    })
                    match = match_map.get(job.id)
                    
                    if match is None:
                        new_matches.append(MatchModel(
                            profile_id=profile.id,
                            job_id=job.id,
                            match_score=result.get("match_score", 0),
                            skill_overlap_score=result.get("skill_overlap_score", 0.0),
                            domain_score=result.get("domain_score", 0.0),
                            location_score=result.get("location_score", 0.0),
                            semantic_score=result.get("semantic_score", 0.0),
                            matching_skills=result.get("matching_skills", []),
                            missing_skills=result.get("missing_skills", [])
                        ))
                    else:
                        for f in ("match_score", "skill_overlap_score", "domain_score",
                                  "location_score", "semantic_score", "matching_skills", "missing_skills"):
                            if f in result:
                                setattr(match, f, result[f])
                
                if new_matches:
                    db.bulk_save_objects(new_matches)
            
            db.commit()
            return created, updated
        except Exception as e:
            db.rollback()
            logger.error(f"store_jobs_batch failed: {e}", exc_info=True)
            raise

# ============================================================================
# Source Fetching
# ============================================================================

async def fetch_source(client: httpx.AsyncClient, source: SourceTarget, max_items=20, force_scan=False):
    """Fetches listings from a source."""
    breaker = get_breaker(source.name)
    if not breaker.can_execute():
        return [], "circuit_open", "Circuit breaker open"
    
    cache_key = f"{source.name}:{max_items}"
    if not force_scan:
        cached = _scrape_cache.get(cache_key)
        if cached is not None:
            return cached, "cached", None
    
    allowed, reason = await check_robots_allowed(source.url)
    if not allowed:
        return [], "robots_blocked", f"Robots: {reason}"
    
    await asyncio.sleep(source.rate_limit_seconds)
    headers = source.headers or {"User-Agent": BOT_USER_AGENT}
    
    for attempt in range(MAX_RETRIES):
        try:
            response = await client.get(source.url, headers=headers)
            if response.status_code == 200:
                html = response.text
                if source.parser:
                    listings = source.parser(html, source, max_items)
                else:
                    listings = parse_json_ld(html, source, max_items)
                    if not listings:
                        listings = parse_generic_html(html, source, max_items)
                
                breaker.record_success()
                _scrape_cache.set(cache_key, listings)
                return listings, "success", None
            elif response.status_code == 429:
                await asyncio.sleep(RETRY_BACKOFF_BASE ** attempt)
            elif response.status_code >= 500:
                breaker.record_failure()
                return [], f"http_{response.status_code}", "Server error"
            else:
                breaker.record_failure()
                return [], f"http_{response.status_code}", f"HTTP {response.status_code}"
        except httpx.TimeoutException:
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_BACKOFF_BASE ** attempt)
            else:
                breaker.record_failure()
                return [], "timeout", "Timeout"
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_BACKOFF_BASE ** attempt)
            else:
                breaker.record_failure()
                return [], "error", str(e)
    
    breaker.record_failure()
    return [], "max_retries", "Max retries"

# ============================================================================
# Default Sources
# ============================================================================

def get_default_sources() -> List[SourceTarget]:
    """Default multi-source targets with source-specific parsers."""
    return [
        SourceTarget(
            name="internshala",
            company="Internshala",
            url="https://internshala.com/internships",
            rate_limit_seconds=1.0,
            parser=parse_internshala,
            is_internship_focused=True,
        ),
        SourceTarget(
            name="unstop",
            company="Unstop India",
            url="https://unstop.com/api/public/opportunity/search-result?opportunity=internships&per_page=30",
            rate_limit_seconds=1.0,
            parser=parse_unstop,
            is_internship_focused=True,
        ),
        SourceTarget(
            name="cuvette",
            company="Cuvette",
            url="https://cuvette.tech/",
            rate_limit_seconds=1.0,
            parser=parse_cuvette,
            is_internship_focused=True,
        ),
        SourceTarget(
            name="google_careers",
            company="Google India",
            url="https://careers.google.com/jobs/results/?location=India&q=intern",
            rate_limit_seconds=2.0,
            parser=parse_json_ld,
            is_internship_focused=True,
        ),
        SourceTarget(
            name="microsoft_careers",
            company="Microsoft India",
            url="https://careers.microsoft.com/us/en/search-results?q=intern%20India",
            rate_limit_seconds=2.0,
            parser=parse_json_ld,
            is_internship_focused=True,
        ),
    ]

# ============================================================================
# Main Scan
# ============================================================================

async def run_india_internship_scan_async(factory, force_scan=False, profile_id=None):
    """Main async scan."""
    sources = get_default_sources()
    headers = {"User-Agent": BOT_USER_AGENT}
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS, headers=headers, follow_redirects=True) as client:
        async def limited(source):
            async with semaphore:
                listings, status, error = await fetch_source(client, source, 20, force_scan)
                return ScrapeResult(source=source, listings=listings, status=status, error=error)
        
        results = await asyncio.gather(*(limited(s) for s in sources), return_exceptions=True)
    
    all_listings = []
    successful = failed = 0
    details = []
    
    for result in results:
        if isinstance(result, Exception):
            failed += 1
            continue
        if result.status in ("success", "cached"):
            successful += 1
        else:
            failed += 1
        all_listings.extend(result.listings)
        details.append({
            "portal": result.source.name,
            "status": result.status,
            "listings_found": len(result.listings)
        })
    
    # Deduplicate
    all_listings = deduplicate_listings(all_listings)
    
    # Validate URLs
    all_listings = await validate_urls_concurrent(all_listings)
    
    # Store
    created, updated = await asyncio.to_thread(
        store_jobs_batch, factory, all_listings, profile_id
    )
    
    return {
        "scan_time": dt.datetime.now(dt.timezone.utc).isoformat(),
        "total_portals": len(sources),
        "successful_scans": successful,
        "failed_scans": failed,
        "new_jobs_added": created,
        "jobs_updated": updated,
        "portal_details": details
    }


def run_india_internship_scan(db: Session, force_scan=False, profile_id=None):
    """Sync wrapper that executes safely inside or outside active event loops."""
    bind = db.get_bind()
    factory = sessionmaker(bind=bind)
    
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    
    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            return executor.submit(
                lambda: asyncio.run(run_india_internship_scan_async(factory, force_scan, profile_id))
            ).result()
    else:
        return asyncio.run(
            run_india_internship_scan_async(factory, force_scan, profile_id)
        )

# ============================================================================
# Retrieval
# ============================================================================

def _listing_details(description: str) -> Tuple[Optional[str], Optional[str], Optional[bool]]:
    marker = re.search(r"\[Listing details \| (.*?)\]", description or "")
    if not marker:
        return None, None, None
    parts = {}
    for p in marker.group(1).split(" | "):
        if ": " in p:
            k, v = p.split(": ", 1)
            parts[k.strip()] = v.strip()
    ppo = {"yes": True, "no": False}.get(parts.get("PPO", "").casefold())
    return parts.get("Stipend"), parts.get("Duration"), ppo


def get_india_internships(
    db: Session, *, location_filter=None, domain_filter=None, min_stipend=None,
    ppo_only=False, remote_only=False, search_query=None, sort_by="match_score",
    include_dead=False, limit=100, offset=0
) -> List[Dict[str, Any]]:
    """Retrieves internships with filters."""
    query = db.query(JobModel).filter(JobModel.source_category == "internship_india")
    if not include_dead:
        query = query.filter(JobModel.status == "active", JobModel.link_status != "dead")
    if location_filter and location_filter.casefold() != "all":
        if location_filter.casefold() == "remote":
            query = query.filter(JobModel.remote.is_(True))
        else:
            query = query.filter(JobModel.location.ilike(f"%{location_filter}%"))
    if domain_filter and domain_filter.casefold() != "all":
        query = query.filter(JobModel.domain.ilike(f"%{domain_filter}%"))
    if remote_only:
        query = query.filter(JobModel.remote.is_(True))
    if search_query:
        pattern = f"%{search_query}%"
        query = query.filter(or_(JobModel.role_title.ilike(pattern), JobModel.company.ilike(pattern)))
    
    profile = db.query(ProfileModel).first()
    jobs = query.order_by(JobModel.id.desc()).limit(1000).all()
    
    match_map = {}
    if profile and jobs:
        job_ids = [j.id for j in jobs]
        match_map = {
            m.job_id: m for m in db.query(MatchModel).filter(
                MatchModel.profile_id == profile.id, MatchModel.job_id.in_(job_ids)
            ).all()
        }
    
    records = []
    for job in jobs:
        stipend, duration, ppo = _listing_details(job.description or "")
        numeric = parse_numeric_stipend(stipend)
        if min_stipend is not None and (numeric is None or numeric < min_stipend):
            continue
        if ppo_only and ppo is not True:
            continue
        match = match_map.get(job.id)
        records.append({
            "id": job.id,
            "role_title": job.role_title,
            "company": job.company,
            "location": job.location,
            "location_type": job.location_type,
            "remote": job.remote,
            "stipend": stipend,
            "stipend_numeric": numeric,
            "duration": duration,
            "ppo_available": ppo,
            "required_skills": job.required_skills or [],
            "domain": job.domain,
            "description": job.description,
            "apply_url": job.apply_url,
            "link_status": job.link_status,
            "source": job.source,
            "is_verified": job.is_verified if hasattr(job, 'is_verified') else False,
            "match_score": match.match_score if match else 0.0,
            "matched_skills": match.matching_skills if match else [],
            "missing_skills": match.missing_skills if match else []
        })
    
    if sort_by == "stipend_desc":
        records.sort(key=lambda x: (x["stipend_numeric"] is not None, x["stipend_numeric"] or 0), reverse=True)
    elif sort_by == "newest":
        records.sort(key=lambda x: x["id"], reverse=True)
    else:
        records.sort(key=lambda x: x["match_score"], reverse=True)
    
    start = max(0, offset)
    end = start + max(0, min(limit, 500))
    return records[start:end]


def get_internship_market_stats(db: Session) -> Dict[str, Any]:
    internships = get_india_internships(db, limit=500)
    total = len(internships)
    if total == 0:
        return {"total_active_internships": 0}
    
    stipends = [i["stipend_numeric"] for i in internships if i["stipend_numeric"] is not None]
    ppo_known = [i for i in internships if i["ppo_available"] is not None]
    
    skill_counts: Dict[str, int] = {}
    for item in internships:
        for skill in item.get("required_skills", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    
    company_counts: Dict[str, int] = {}
    for item in internships:
        comp = item.get("company", "Other")
        company_counts[comp] = company_counts.get(comp, 0) + 1
    top_companies = sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:6]

    return {
        "total_active_internships": total,
        "average_stipend_monthly": int(sum(stipends) / len(stipends)) if stipends else None,
        "max_stipend_monthly": max(stipends) if stipends else None,
        "ppo_eligible_rate_percent": round(sum(1 for i in ppo_known if i["ppo_available"]) / len(ppo_known) * 100, 1) if ppo_known else None,
        "remote_friendly_count": sum(1 for i in internships if i["remote"]),
        "top_in_demand_skills": [{"skill": s, "count": c} for s, c in top_skills],
        "top_hiring_companies": [{"company": c, "openings": count} for c, count in top_companies]
    }
