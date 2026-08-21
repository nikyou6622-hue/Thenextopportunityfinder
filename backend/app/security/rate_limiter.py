import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)

# In-Memory Sliding Window Rate Limiter
class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 20, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # key -> list of timestamps
        self.request_history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_key: str) -> Tuple[bool, int, int]:
        """
        Determines whether client request is within the rate window.
        Returns (is_allowed, remaining_requests, retry_after_seconds).
        """
        now = time.time()
        window_start = now - self.window_seconds
        
        # Purge timestamps outside current window
        history = self.request_history[client_key]
        valid_history = [ts for ts in history if ts > window_start]
        self.request_history[client_key] = valid_history
        
        if len(valid_history) >= self.max_requests:
            oldest_timestamp = valid_history[0]
            retry_after = int((oldest_timestamp + self.window_seconds) - now) + 1
            return False, 0, max(1, retry_after)
            
        # Record current request
        valid_history.append(now)
        remaining = self.max_requests - len(valid_history)
        return True, remaining, 0

    def check_rate_limit(self, client_key: str, endpoint_name: str = "LLM Service"):
        """Checks rate limit and raises HTTP 429 if exceeded."""
        allowed, remaining, retry_after = self.is_allowed(client_key)
        if not allowed:
            logger.warning(f"Rate limit exceeded for client '{client_key}' on '{endpoint_name}'. Retry in {retry_after}s.")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded: Maximum {self.max_requests} requests per hour allowed for {endpoint_name}. Please retry in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )

# Global rate limiter instance for LLM-cost endpoints (20 requests/hour default)
llm_rate_limiter = SlidingWindowRateLimiter(max_requests=20, window_seconds=3600)
