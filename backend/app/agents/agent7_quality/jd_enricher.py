"""
jd_enricher.py — Deterministic regex perk extraction from Job Descriptions for Agent 7
Extracts equity, visa sponsorship, relocation, bonus, learning stipend, and flexible timing perks.
Populates offers_* booleans and stores matched regex audit snippets in perks_raw.
"""

import re
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

# Perk extraction regex patterns (with snippet capture context)
PERK_REGEX_PATTERNS = {
    "offers_equity": r'(?i)\b(?:equity|esop|stock options|shares|stock grants|rsus?|rsu|equity grant)\b',
    "offers_visa_sponsorship": r'(?i)\b(?:visa sponsorship|h1b|h-1b|work permit sponsorship|visa support|relocation & visa)\b',
    "offers_relocation": r'(?i)\b(?:relocation assistance|relocation package|relocation bonus|relocation support|relocation allowance)\b',
    "offers_bonus": r'(?i)\b(?:joining bonus|sign-on bonus|signing bonus|performance bonus|annual bonus)\b',
    "offers_education_stipend": r'(?i)\b(?:learning stipend|education stipend|tuition reimbursement|conference budget|books? stipend|learning budget)\b',
    "offers_flexible_timing": r'(?i)\b(?:flexible hours|flexible timing|flexible schedule|work-life balance|flexible working hours)\b'
}

def extract_perks_from_description(description: str) -> Tuple[Dict[str, bool], Dict[str, str]]:
    """
    Scans job description using deterministic regex patterns to detect perks.
    Returns:
      - perk_booleans: Dict[perk_key, bool]
      - perks_raw: Dict[perk_key, snippet_text]
    """
    desc_clean = description or ""
    perk_booleans = {}
    perks_raw = {}
    
    for perk_key, pattern in PERK_REGEX_PATTERNS.items():
        match = re.search(pattern, desc_clean)
        if match:
            perk_booleans[perk_key] = True
            
            # Capture surrounding sentence/snippet (~60 chars) for auditability
            start = max(0, match.start() - 20)
            end = min(len(desc_clean), match.end() + 40)
            snippet = desc_clean[start:end].replace('\n', ' ').strip()
            perks_raw[perk_key.replace("offers_", "")] = f"...{snippet}..."
        else:
            perk_booleans[perk_key] = False
            
    return perk_booleans, perks_raw
