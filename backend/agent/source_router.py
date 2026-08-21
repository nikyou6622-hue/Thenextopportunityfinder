"""
source_router.py — Agent 5: Smart ATS Application Classifier & Link Resolver
Pivoted per Skill 1: Classify source platform + validate, normalize, and resolve live direct apply URLs.
No auto-filling or automated form submission.
"""

import logging
import re
import socket
import datetime
from dataclasses import dataclass
from enum import Enum
from typing import Tuple, Optional, Dict, Any, List, Union
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
import requests
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

logger = logging.getLogger(__name__)

class SourcePlatform(str, Enum):
    GREENHOUSE = "greenhouse"
    LEVER = "lever"
    ASHBY = "ashby"
    WORKDAY = "workday"
    TALEO = "taleo"
    COMPANY_DIRECT = "company_direct"
    EMAIL_ONLY = "email_only"
    LINKEDIN_DISCOVERY_ONLY = "linkedin_discovery_only"
    NAUKRI_DISCOVERY_ONLY = "naukri_discovery_only"
    INTERNSHALA_DISCOVERY_ONLY = "internshala_discovery_only"
    UNKNOWN = "unknown"

# Backwards-compatibility alias for legacy code
ApplyRoute = SourcePlatform

PLATFORM_DOMAIN_MAPPING = {
    "boards.greenhouse.io": SourcePlatform.GREENHOUSE,
    "greenhouse.io": SourcePlatform.GREENHOUSE,
    "jobs.lever.co": SourcePlatform.LEVER,
    "lever.co": SourcePlatform.LEVER,
    "jobs.ashbyhq.com": SourcePlatform.ASHBY,
    "ashbyhq.com": SourcePlatform.ASHBY,
    "myworkdayjobs.com": SourcePlatform.WORKDAY,
    "taleo.net": SourcePlatform.TALEO,
    "oraclecloud.com": SourcePlatform.TALEO,
    "linkedin.com": SourcePlatform.LINKEDIN_DISCOVERY_ONLY,
    "www.linkedin.com": SourcePlatform.LINKEDIN_DISCOVERY_ONLY,
    "internshala.com": SourcePlatform.INTERNSHALA_DISCOVERY_ONLY,
    "www.internshala.com": SourcePlatform.INTERNSHALA_DISCOVERY_ONLY,
    "naukri.com": SourcePlatform.NAUKRI_DISCOVERY_ONLY,
    "www.naukri.com": SourcePlatform.NAUKRI_DISCOVERY_ONLY,
}

DISCOVERY_ONLY_DOMAINS = {
    "linkedin.com", "www.linkedin.com",
    "internshala.com", "www.internshala.com",
    "naukri.com", "www.naukri.com",
    "indeed.com", "www.indeed.com",
    "foundit.in", "monsterindia.com"
}
PROTECTED_DOMAINS = DISCOVERY_ONLY_DOMAINS
NEVER_AUTOMATE_DOMAINS = DISCOVERY_ONLY_DOMAINS

# Tracking query parameters to strip during normalization
TRACKING_QUERY_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
    "ref", "refid", "ref_id", "gh_src", "fbclid", "gclid", "dclid", "msclkid",
    "trk", "lever-source", "lever-origin", "mode", "sub_source", "origin", "source",
    "trackingid", "tracking_id", "sid", "spm", "_ga", "_gl", "src", "affiliate", "campaign"
}

# Known expired / dead listing URL patterns
EXPIRED_URL_PATTERNS = [
    r"/job[-_]?expired",
    r"/job[-_]?not[-_]?found",
    r"/job[-_]?closed",
    r"/position[-_]?closed",
    r"/position[-_]?filled",
    r"/inactive[-_]?job",
    r"/404(\.html?)?$",
    r"/error/job",
    r"/no[-_]?longer[-_]?available",
    r"/job[-_]?removed",
    r"/closed"
]

EXPIRED_BODY_KEYWORDS = [
    "job is no longer available",
    "this job has expired",
    "this opening has been closed",
    "this opening is closed",
    "no longer accepting applications",
    "not accepting applications",
    "position has been filled",
    "job posting has expired",
    "job has expired",
    "page not found",
    "404 - page not found",
    "404 not found",
    "job not found",
    "job is closed",
    "position is closed",
    "job has been removed",
    "this listing is closed",
    "this listing has expired",
    "we are no longer accepting",
    "requisition has been closed",
    "sorry, this job is no longer available",
    "sorry, this position has been filled",
    "career opportunity is no longer available"
]


@dataclass
class ClassificationResult:
    source_platform: SourcePlatform
    display_badge: str
    is_discovery_only: bool
    apply_url: str
    apply_url_resolved: str
    link_status: str  # "live", "dead", "redirected", "unchecked"
    notes: str


def normalize_job_url(url: str) -> str:
    """
    Normalizes URLs for robust deduplication:
    - Lowercases scheme and domain
    - Normalizes mobile subdomains (e.g. m.naukri.com -> naukri.com)
    - Strips default ports (:80, :443)
    - Strips UTM and marketing tracking query parameters
    - Normalizes trailing slashes on non-root paths
    - Strips URL fragments (#...)
    """
    if not url or not isinstance(url, str):
        return ""

    url_str = url.strip()
    if not url_str.lower().startswith(("http://", "https://", "mailto:")):
        return url_str

    if url_str.lower().startswith("mailto:"):
        return url_str.lower()

    try:
        parsed = urlparse(url_str)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()

        # Strip standard ports
        if netloc.endswith(":80"):
            netloc = netloc[:-3]
        elif netloc.endswith(":443"):
            netloc = netloc[:-4]

        # Normalize mobile subdomains
        if netloc.startswith("m."):
            netloc = netloc[2:]
        elif netloc.startswith("mobile."):
            netloc = netloc[7:]

        # Normalize path
        path = parsed.path or "/"
        # Collapse multiple slashes
        path = re.sub(r"/+", "/", path)
        if len(path) > 1 and path.endswith("/"):
            path = path[:-1]

        # Strip tracking query params
        query_params = parse_qs(parsed.query, keep_blank_values=False)
        cleaned_params = {
            k: v for k, v in query_params.items() 
            if k.lower() not in TRACKING_QUERY_PARAMS
        }

        # Re-encode query params deterministically
        query_str = urlencode(cleaned_params, doseq=True)

        normalized = urlunparse((scheme, netloc, path, parsed.params, query_str, ""))
        return normalized
    except Exception as e:
        logger.debug(f"Error normalizing url '{url}': {e}")
        return url_str


def extract_canonical_apply_url(html_content: str, source: str = "", fallback_url: str = "") -> str:
    """
    Extracts canonical direct apply URL from raw HTML page:
    1. <link rel="canonical" href="...">
    2. <meta property="og:url" content="...">
    3. Source-specific link fallback patterns (Greenhouse, Lever, Ashby, Naukri)
    """
    if not html_content or not isinstance(html_content, str):
        return normalize_job_url(fallback_url)

    try:
        soup = BeautifulSoup(html_content, "html.parser")

        # 1. <link rel="canonical" href="...">
        canonical_tag = soup.find("link", rel="canonical")
        if canonical_tag and canonical_tag.get("href"):
            href = canonical_tag["href"].strip()
            if href.startswith(("http://", "https://")):
                return normalize_job_url(href)

        # 2. <meta property="og:url" content="...">
        og_url_tag = soup.find("meta", property="og:url") or soup.find("meta", attrs={"name": "og:url"})
        if og_url_tag and og_url_tag.get("content"):
            content = og_url_tag["content"].strip()
            if content.startswith(("http://", "https://")):
                return normalize_job_url(content)
    except Exception as e:
        logger.debug(f"Error extracting canonical URL from HTML: {e}")

    # 3. Source-specific fallback pattern matching in HTML body or source string
    source_lower = (source or "").lower()
    if "greenhouse" in source_lower or "boards.greenhouse.io" in fallback_url:
        m = re.search(r'https?://boards\.greenhouse\.io/[\w\-]+/jobs/\d+', html_content)
        if m:
            return normalize_job_url(m.group(0))

    if "lever" in source_lower or "jobs.lever.co" in fallback_url:
        m = re.search(r'https?://jobs\.lever\.co/[\w\-]+/[\w\-]+', html_content)
        if m:
            return normalize_job_url(m.group(0))

    if "ashby" in source_lower or "jobs.ashbyhq.com" in fallback_url:
        m = re.search(r'https?://jobs\.ashbyhq\.com/[\w\-]+/[\w\-]+', html_content)
        if m:
            return normalize_job_url(m.group(0))

    if "internshala" in source_lower:
        m = re.search(r'/job/detail/[a-zA-Z0-9\-]+', fallback_url)
        if m:
            return normalize_job_url(f"https://internshala.com{m.group(0)}")
    elif "naukri" in source_lower or "naukri.com" in fallback_url:
        m = re.search(r'/job-listings-[\w\-]+', html_content)
        if m:
            return normalize_job_url(f"https://www.naukri.com{m.group(0)}")

    return normalize_job_url(fallback_url)


def is_dead_or_expired_url(raw_url: str, resolved_url: str, status_code: int, body_text: Optional[str] = None) -> Tuple[bool, str]:
    """
    Evaluates whether a resolved URL indicates a dead / expired / redirected-to-homepage job listing.
    """
    # 1. HTTP error codes
    if status_code in [404, 410, 500, 502, 503, 504, 400]:
        return True, f"HTTP status {status_code}"

    # 2. Check expired patterns in resolved URL path
    parsed_resolved = urlparse(resolved_url)
    resolved_path = parsed_resolved.path.lower()
    for pattern in EXPIRED_URL_PATTERNS:
        if re.search(pattern, resolved_path):
            return True, f"Expired pattern in URL: '{pattern}'"

    # 3. Detect redirect to generic root homepage when original had a specific job path
    parsed_raw = urlparse(raw_url)
    raw_path = parsed_raw.path.strip("/")
    resolved_path_clean = parsed_resolved.path.strip("/")

    # If raw URL had a deep path (/jobs/123) and resolved URL is root domain ("" or "careers" / "jobs" home)
    if len(raw_path) > 5 and len(resolved_path_clean) == 0:
        return True, "Redirected to root homepage (job listing closed)"
    
    if len(raw_path) > 10 and resolved_path_clean in ["careers", "jobs", "openings", "search", "career", "en/careers", "in-en/careers"]:
        return True, f"Redirected to generic index /{resolved_path_clean} (job listing closed)"

    # 4. Check body text for explicit expired keywords if provided
    if body_text and status_code in [200, 203, 206]:
        body_lower = body_text.lower()
        for kw in EXPIRED_BODY_KEYWORDS:
            if kw in body_lower:
                return True, f"Expired indicator in page text: '{kw}'"

    return False, "Live"


def classify_source_platform(apply_url: str, apply_email: Optional[str] = None) -> SourcePlatform:
    """
    Classifies apply_url into one of the canonical source platforms.
    """
    if not apply_url:
        if apply_email:
            return SourcePlatform.EMAIL_ONLY
        return SourcePlatform.UNKNOWN

    parsed = urlparse(apply_url)
    domain = parsed.netloc.lower()

    # Check known domain mappings
    for mapped_domain, platform in PLATFORM_DOMAIN_MAPPING.items():
        if mapped_domain in domain:
            return platform

    # Check email prefix
    if apply_url.startswith("mailto:") or (not apply_url.startswith("http") and "@" in apply_url):
        return SourcePlatform.EMAIL_ONLY

    # Discovery domains
    for disc_domain in DISCOVERY_ONLY_DOMAINS:
        if disc_domain in domain:
            if "linkedin" in disc_domain:
                return SourcePlatform.LINKEDIN_DISCOVERY_ONLY
            if "internshala" in disc_domain:
                return SourcePlatform.INTERNSHALA_DISCOVERY_ONLY
            if "naukri" in disc_domain:
                return SourcePlatform.NAUKRI_DISCOVERY_ONLY

    # Company direct career pages
    if any(k in domain or k in parsed.path for k in ["career", "careers", "jobs", "apply", "join", "openings"]):
        return SourcePlatform.COMPANY_DIRECT

    return SourcePlatform.COMPANY_DIRECT if (parsed.scheme in ["http", "https"] and domain) else SourcePlatform.UNKNOWN


def resolve_and_validate_apply_url(
    apply_url: str, 
    timeout_sec: float = 4.0, 
    check_live: bool = True,
    session: Optional[requests.Session] = None,
    return_metadata: bool = False
) -> Union[Tuple[str, str], Tuple[str, str, Dict[str, Any]]]:
    """
    Resolves redirects to canonical direct URL and checks whether the link is live, redirected, or dead.
    If return_metadata=True, returns: (apply_url_resolved, link_status, resolution_metadata)
    If return_metadata=False (default), returns: (apply_url_resolved, link_status)
    """
    meta: Dict[str, Any] = {
        "initial_url": apply_url or "",
        "resolved_url": apply_url or "",
        "status_code": None,
        "is_dead": False,
        "dead_reason": None,
        "redirected": False,
        "link_status": "unchecked",
        "checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z"
    }

    if not apply_url or not apply_url.startswith(("http://", "https://")):
        meta["link_status"] = "unchecked"
        meta["dead_reason"] = "Invalid URL protocol"
        return (apply_url or "", "unchecked", meta) if return_metadata else (apply_url or "", "unchecked")

    raw_norm = normalize_job_url(apply_url)
    meta["initial_url"] = raw_norm
    meta["resolved_url"] = raw_norm

    if not check_live:
        meta["link_status"] = "unchecked"
        return (raw_norm, "unchecked", meta) if return_metadata else (raw_norm, "unchecked")

    # Pre-flight DNS resolution check
    try:
        domain = urlparse(raw_norm).netloc.split(":")[0]
        if domain and not domain.startswith("localhost") and domain != "127.0.0.1":
            socket.gethostbyname(domain)
    except (socket.gaierror, socket.herror, Exception) as dns_err:
        logger.info(f"DNS resolution failed for {apply_url}: {dns_err}")
        meta["link_status"] = "dead"
        meta["is_dead"] = True
        meta["dead_reason"] = f"DNS resolution failed (ERR_NAME_NOT_RESOLVED): {dns_err}"
        return (raw_norm, "dead", meta) if return_metadata else (raw_norm, "dead")

    http_client = session or requests
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NextOpportunityFind/2.0"
    }

    try:
        # First attempt lightweight HEAD request
        resp = http_client.head(raw_norm, headers=headers, allow_redirects=True, timeout=timeout_sec)
        
        # If server returns 405 Method Not Allowed or 403 for HEAD, fallback to GET (streamed)
        body_sample = None
        resp_status = resp.status_code
        resolved_url = normalize_job_url(str(resp.url))

        if resp.status_code in [405, 403, 400]:
            try:
                get_resp = http_client.get(raw_norm, headers=headers, allow_redirects=True, timeout=timeout_sec, stream=True)
                raw_bytes = next(get_resp.iter_content(4096), b"")
                body_sample = raw_bytes.decode("utf-8", errors="ignore")
                resolved_url = normalize_job_url(str(get_resp.url))
                resp_status = get_resp.status_code
            except Exception:
                pass

        is_dead, reason = is_dead_or_expired_url(raw_norm, resolved_url, resp_status, body_sample)

        meta["status_code"] = resp_status
        meta["resolved_url"] = resolved_url
        meta["is_dead"] = is_dead
        meta["dead_reason"] = reason if is_dead else None
        meta["redirected"] = (resolved_url != raw_norm)

        if is_dead:
            logger.info(f"Detected dead link for {apply_url}: {reason}")
            meta["link_status"] = "dead"
            return (resolved_url, "dead", meta) if return_metadata else (resolved_url, "dead")

        if resolved_url != raw_norm:
            meta["link_status"] = "redirected"
            return (resolved_url, "redirected", meta) if return_metadata else (resolved_url, "redirected")

        meta["link_status"] = "live"
        return (resolved_url, "live", meta) if return_metadata else (resolved_url, "live")

    except (requests.RequestException, Exception) as e:
        err_str = str(e)
        logger.debug(f"Link validation network exception for {apply_url}: {err_str}")
        if any(term in err_str.lower() for term in [
            "getaddrinfo failed", "name or service not known", "nameresolutionerror", 
            "nodename nor servname", "failed to resolve", "max retries exceeded with url", 
            "connection refused", "not found", "404", "ssl: certificate"
        ]):
            meta["link_status"] = "dead"
            meta["is_dead"] = True
            meta["dead_reason"] = f"Network / DNS Failure: {err_str}"
            return (raw_norm, "dead", meta) if return_metadata else (raw_norm, "dead")
            
        meta["link_status"] = "unchecked"
        meta["dead_reason"] = f"Network exception: {err_str}"
        return (raw_norm, "unchecked", meta) if return_metadata else (raw_norm, "unchecked")


def resolve_apply_url_with_metadata(
    apply_url: str, 
    timeout_sec: float = 4.0, 
    check_live: bool = True
) -> Tuple[str, str, Dict[str, Any]]:
    """Helper returning 3-tuple (resolved_url, link_status, metadata_dict)."""
    return resolve_and_validate_apply_url(
        apply_url=apply_url, 
        timeout_sec=timeout_sec, 
        check_live=check_live, 
        return_metadata=True
    )


def classify_apply_url(apply_url: str, apply_email: Optional[str] = None, check_live: bool = False) -> ClassificationResult:
    """
    Full Agent 5 classifier & link resolver pipeline.
    """
    platform = classify_source_platform(apply_url, apply_email)
    resolved_url, link_status = resolve_and_validate_apply_url(apply_url, check_live=check_live)

    badge_map = {
        SourcePlatform.GREENHOUSE: "Greenhouse",
        SourcePlatform.LEVER: "Lever",
        SourcePlatform.ASHBY: "Ashby",
        SourcePlatform.WORKDAY: "Workday",
        SourcePlatform.TALEO: "Taleo",
        SourcePlatform.COMPANY_DIRECT: "Company Direct",
        SourcePlatform.EMAIL_ONLY: "Email Outreach",
        SourcePlatform.LINKEDIN_DISCOVERY_ONLY: "LinkedIn",
        SourcePlatform.NAUKRI_DISCOVERY_ONLY: "Naukri",
        SourcePlatform.INTERNSHALA_DISCOVERY_ONLY: "Internshala",
        SourcePlatform.UNKNOWN: "Direct Link",
    }

    is_discovery = platform in [
        SourcePlatform.LINKEDIN_DISCOVERY_ONLY,
        SourcePlatform.NAUKRI_DISCOVERY_ONLY,
        SourcePlatform.INTERNSHALA_DISCOVERY_ONLY
    ]

    notes = "Apply directly on official portal."
    if is_discovery:
        notes = f"Apply directly on {badge_map.get(platform, 'Discovery Portal')} (discovery-only listing)."
    elif platform == SourcePlatform.EMAIL_ONLY:
        notes = "Send direct cold outreach email using Agent 6."

    return ClassificationResult(
        source_platform=platform,
        display_badge=badge_map.get(platform, "Direct Link"),
        is_discovery_only=is_discovery,
        apply_url=apply_url or "",
        apply_url_resolved=resolved_url or apply_url or "",
        link_status=link_status,
        notes=notes
    )


def revalidate_job_links(db: Any, max_age_hours: int = 72, limit: int = 100) -> Dict[str, Any]:
    """
    Re-validation cadence pass for already-stored jobs:
    Re-evaluates link_status for postings older than max_age_hours or marked unchecked.
    Marks stale/dead ones so candidate feeds automatically filter them out.
    """
    from backend.app.db.models import JobModel

    cutoff_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=max_age_hours)
    
    # Query candidates for re-validation: active/stale jobs not yet marked dead/removed
    stale_jobs = db.query(JobModel).filter(
        JobModel.status.in_(["active", "stale"]),
        JobModel.link_status != "dead",
        (
            (JobModel.link_checked_at.is_(None)) | 
            (JobModel.link_checked_at < cutoff_time) | 
            (JobModel.link_status == "unchecked")
        )
    ).order_by(JobModel.id.desc()).limit(limit).all()

    summary = {
        "total_evaluated": len(stale_jobs),
        "live_count": 0,
        "dead_count": 0,
        "redirected_count": 0,
        "unchecked_count": 0,
        "revalidated_at": datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z"
    }

    session = requests.Session()
    try:
        for job in stale_jobs:
            raw_url = job.apply_url_raw or job.apply_url
            if not raw_url:
                job.link_status = "unchecked"
                summary["unchecked_count"] += 1
                continue

            resolved_url, status = resolve_and_validate_apply_url(
                raw_url, 
                timeout_sec=3.0, 
                check_live=True, 
                session=session
            )
            
            job.apply_url_resolved = resolved_url
            job.link_status = status
            job.link_checked_at = datetime.datetime.now(datetime.timezone.utc)

            if status == "dead":
                summary["dead_count"] += 1
            elif status == "redirected":
                summary["redirected_count"] += 1
                summary["live_count"] += 1
            elif status == "live":
                summary["live_count"] += 1
            else:
                summary["unchecked_count"] += 1

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error during job link re-validation cadence: {e}")
        raise e
    finally:
        session.close()

    return summary


def assert_no_auto_apply_handlers() -> bool:
    """
    Explicit architectural guardrail:
    Asserts that NO form auto-fill, automated submission handlers, or programmatic
    POST endpoints on candidate's behalf exist in this codebase.
    Checks data source compliance registry.
    """
    from backend.app.data_source_registry import DATA_SOURCE_REGISTRY
    for source_name, cfg in DATA_SOURCE_REGISTRY.items():
        if cfg.get("allow_auto_apply", False):
            raise AssertionError(f"Compliance violation: source '{source_name}' has allow_auto_apply=True!")
    return True
