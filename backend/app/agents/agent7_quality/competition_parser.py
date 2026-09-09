"""
competition_parser.py — Applicant count extraction & competition_index calculator for Agent 7
Extracts applicant_count via regex from source metadata/description text.
Computes competition_index = applicant_count / days_since_posting when both present.
"""

import re
import datetime
import logging
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

# Applicant count regex patterns
APPLICANT_COUNT_PATTERNS = [
    r'(?i)\b(\d+)\s*(?:applicants|people applied|candidates applied|applications submitted|applicants registered)\b',
    r'(?i)\b(?:over|more than|\+)?\s*(\d+)\s*applicants\b',
    r'(?i)\b(\d+)\s*\+\s*applicants\b'
]

def extract_applicant_count(description: str, metadata: Optional[Dict[str, Any]] = None) -> Optional[int]:
    """
    Attempts to extract applicant_count from metadata dict or description text.
    Returns integer applicant count or None if unavailable.
    """
    # 1. Check explicit metadata first
    if metadata and isinstance(metadata, dict):
        cnt = metadata.get("applicant_count") or metadata.get("num_applicants")
        if isinstance(cnt, int) and cnt >= 0:
            return cnt
        if isinstance(cnt, str) and cnt.isdigit():
            return int(cnt)
            
    # 2. Regex fallback on description
    desc_clean = description or ""
    for pattern in APPLICANT_COUNT_PATTERNS:
        match = re.search(pattern, desc_clean)
        if match:
            try:
                count_val = int(match.group(1))
                if 0 <= count_val <= 100000:
                    return count_val
            except (ValueError, IndexError):
                continue
                
    return None

def calculate_competition_metrics(
    created_at: Optional[datetime.datetime],
    source_posted_at: Optional[str],
    description: str = "",
    metadata: Optional[Dict[str, Any]] = None
) -> Tuple[Optional[int], Optional[int], Optional[float]]:
    """
    Computes (applicant_count, days_since_posting, competition_index).
    competition_index = applicant_count / days_since_posting
    """
    app_count = extract_applicant_count(description, metadata)
    
    # Calculate days_since_posting
    now = datetime.datetime.now(datetime.timezone.utc)
    days_since_posting = None
    
    if created_at:
        dt = created_at.replace(tzinfo=datetime.timezone.utc) if created_at.tzinfo is None else created_at
        days_since_posting = max(1, int((now - dt).total_seconds() / 86400.0))
    elif source_posted_at:
        try:
            dt = datetime.datetime.fromisoformat(source_posted_at.replace("Z", "+00:00"))
            days_since_posting = max(1, int((now - dt).total_seconds() / 86400.0))
        except (ValueError, AttributeError):
            days_since_posting = 1
            
    comp_index = None
    if app_count is not None and days_since_posting is not None and days_since_posting > 0:
        comp_index = round(app_count / float(days_since_posting), 2)
        
    return app_count, days_since_posting, comp_index
