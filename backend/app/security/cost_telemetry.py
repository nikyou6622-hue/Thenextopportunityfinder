import datetime
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("cost_telemetry")

# Standard token pricing benchmark ($ / 1k tokens)
PROMPT_COST_PER_1K = 0.0015
COMPLETION_COST_PER_1K = 0.0020

# In-memory telemetry store
TELEMETRY_LOGS: List[Dict[str, Any]] = []

def estimate_token_count(text: str) -> int:
    """Rough estimation of token count (~4 chars per token)."""
    if not text:
        return 0
    return max(1, len(text) // 4)

def log_llm_cost_telemetry(
    profile_id: Optional[int],
    endpoint_action: str,
    prompt_text: str,
    completion_text: str,
    model_name: str = "gemini-flash-1.5"
) -> Dict[str, Any]:
    """
    Logs token counts and estimated USD cost for an LLM interaction tagged by profile_id.
    """
    prompt_tokens = estimate_token_count(prompt_text)
    completion_tokens = estimate_token_count(completion_text)
    total_tokens = prompt_tokens + completion_tokens
    
    prompt_cost = (prompt_tokens / 1000.0) * PROMPT_COST_PER_1K
    completion_cost = (completion_tokens / 1000.0) * COMPLETION_COST_PER_1K
    total_cost_usd = round(prompt_cost + completion_cost, 6)
    
    record = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "profile_id": profile_id,
        "endpoint_action": endpoint_action,
        "model_name": model_name,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
        "cost_usd": total_cost_usd
    }
    
    TELEMETRY_LOGS.append(record)
    logger.info(
        f"[COST_TELEMETRY] Profile {profile_id} | Action: {endpoint_action} | "
        f"Tokens: {total_tokens} ({prompt_tokens}p + {completion_tokens}c) | Cost: ${total_cost_usd:.6f}"
    )
    return record

def get_telemetry_summary() -> Dict[str, Any]:
    """Returns aggregated token usage and cost metrics across all profiles."""
    total_calls = len(TELEMETRY_LOGS)
    total_tokens = sum(r["total_tokens"] for r in TELEMETRY_LOGS)
    total_cost = sum(r["cost_usd"] for r in TELEMETRY_LOGS)
    
    by_action: Dict[str, Dict[str, Any]] = {}
    for r in TELEMETRY_LOGS:
        act = r["endpoint_action"]
        if act not in by_action:
            by_action[act] = {"calls": 0, "tokens": 0, "cost_usd": 0.0}
        by_action[act]["calls"] += 1
        by_action[act]["tokens"] += r["total_tokens"]
        by_action[act]["cost_usd"] += r["cost_usd"]
        
    return {
        "total_calls": total_calls,
        "total_tokens": total_tokens,
        "total_cost_usd": round(total_cost, 4),
        "breakdown_by_action": by_action,
        "recent_logs": TELEMETRY_LOGS[-10:]
    }
