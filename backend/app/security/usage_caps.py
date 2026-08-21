import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple, Union
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Soft Weekly Usage Caps Configuration
WEEKLY_CAPS_CONFIG = {
    "resume_tailor": {"max_per_week": 5, "label": "Resume Tailorings"},
    "mock_interview": {"max_per_week": 10, "label": "Mock Interview Turns"},
    "email_batch": {"max_per_week": 1, "label": "Cold Email Batches"}
}

SEVEN_DAYS_SECONDS = 7 * 24 * 3600

class WeeklyUsageTracker:
    def __init__(self):
        # (profile_id, action) -> list of timestamps
        self.usage_history: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    def record_and_check_cap(self, profile_id: Union[int, str], action: str):
        """
        Enforces soft weekly usage caps per profile per 7-day sliding window.
        Raises HTTP 429 if cap is reached.
        """
        config = WEEKLY_CAPS_CONFIG.get(action)
        if not config:
            return
            
        max_limit = config["max_per_week"]
        label = config["label"]
        key = (str(profile_id), action)
        
        now = time.time()
        window_start = now - SEVEN_DAYS_SECONDS
        
        # Filter valid timestamps within 7 days
        history = [ts for ts in self.usage_history[key] if ts > window_start]
        self.usage_history[key] = history
        
        if len(history) >= max_limit:
            oldest_ts = history[0]
            days_remaining = round(((oldest_ts + SEVEN_DAYS_SECONDS) - now) / 86400, 1)
            error_msg = (
                f"Weekly usage cap reached: You have utilized {len(history)}/{max_limit} {label} "
                f"for this 7-day period. Your usage cap will reset in {max(0.1, days_remaining)} days."
            )
            logger.warning(f"Profile {profile_id} hit weekly cap for {action}: {error_msg}")
            raise HTTPException(status_code=429, detail=error_msg)
            
        # Record usage
        history.append(now)


# Global weekly usage tracker instance
weekly_usage_tracker = WeeklyUsageTracker()
