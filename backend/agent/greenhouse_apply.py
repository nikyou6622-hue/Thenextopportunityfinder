"""
greenhouse_apply.py — [RETIRED / ARCHIVED per Skill 1 Pivot]

Pivot Decision:
Automated Playwright form submission and auto-filling paths have been retired across
NextOpportunityFind in favor of Agent 5's Classify & Link-Out flow (source_router.py).
All applications are classified by platform and presented with verified direct apply URLs.
"""

from dataclasses import dataclass

@dataclass
class ApplyResult:
    success: bool
    submitted: bool
    message: str
    screenshot_path: str = ""

def apply_to_greenhouse(*args, **kwargs) -> ApplyResult:
    """Deprecated: Replaced by classify-and-link-out architecture in source_router.py."""
    return ApplyResult(
        success=True,
        submitted=False,
        message="Auto-apply retired. Please use direct link-out via resolved application URL."
    )
