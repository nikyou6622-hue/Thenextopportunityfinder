import re
import datetime
import hashlib
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

def parse_relative_date_to_iso(date_str: Optional[str]) -> Optional[str]:
    """
    Parses relative or absolute date strings ("Posted 3 hours ago", "2 days ago", "Yesterday", "2026-08-15")
    into a standardized ISO 8601 string. Returns None if unparseable or empty (never substitutes discovered_at).
    """
    if not date_str or not isinstance(date_str, str):
        return None

    raw = date_str.strip().lower()
    if not raw or raw in ("null", "none", "n/a", "not specified"):
        return None

    now = datetime.datetime.now(datetime.timezone.utc)

    try:
        if "just now" in raw or "today" in raw or "few minutes ago" in raw:
            return now.isoformat()

        if "yesterday" in raw:
            return (now - datetime.timedelta(days=1)).isoformat()

        # Match "X hour(s) ago" / "X hr(s) ago"
        m_hrs = re.search(r"(\d+)\s*(hour|hr|hours|hrs)\s*ago", raw)
        if m_hrs:
            hours = int(m_hrs.group(1))
            return (now - datetime.timedelta(hours=hours)).isoformat()

        # Match "X day(s) ago"
        m_days = re.search(r"(\d+)\s*(day|days)\s*ago", raw)
        if m_days:
            days = int(m_days.group(1))
            return (now - datetime.timedelta(days=days)).isoformat()

        # Match "X week(s) ago" / "X wk(s) ago"
        m_wks = re.search(r"(\d+)\s*(week|weeks|wk|wks)\s*ago", raw)
        if m_wks:
            weeks = int(m_wks.group(1))
            return (now - datetime.timedelta(weeks=weeks)).isoformat()

        # Match ISO format or standard YYYY-MM-DD
        if re.match(r"^\d{4}-\d{2}-\d{2}", date_str.strip()):
            return date_str.strip()

        # Match Unix timestamp in milliseconds or seconds
        if date_str.strip().isdigit():
            val = int(date_str.strip())
            if val > 1e11:  # milliseconds
                return datetime.datetime.fromtimestamp(val / 1000.0, tz=datetime.timezone.utc).isoformat()
            elif val > 1e8:  # seconds
                return datetime.datetime.fromtimestamp(val, tz=datetime.timezone.utc).isoformat()

        # Try parsing ISO 8601 string directly
        dt = datetime.datetime.fromisoformat(date_str.strip().replace("Z", "+00:00"))
        return dt.isoformat()

    except Exception as e:
        logger.debug(f"Could not parse posting date string '{date_str}': {e}")
        return None

def compute_content_hash(description: str = "", stipend: str = "", duration: str = "", ppo_offered: bool = False) -> str:
    """
    Computes a lightweight content hash to detect changes to existing listings (stipend changes, description edits, etc.).
    """
    norm_desc = (description or "").strip()
    norm_stipend = (stipend or "").strip()
    norm_duration = (duration or "").strip()
    ppo_str = "1" if ppo_offered else "0"
    raw_str = f"{norm_desc}::{norm_stipend}::{norm_duration}::{ppo_str}"
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:16]
