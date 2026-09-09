"""
scorer.py — Quality scoring engine for Agent 7
Component scores each independently clamped to [0.0, 1.0].
Renormalizes component weights when optional fields (e.g. competition_score) are null.
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from backend.app.agents.agent7_quality.weights import DEFAULT_QUALITY_WEIGHTS

logger = logging.getLogger(__name__)

# High-value tech signal keywords
AI_ML_KEYWORDS = {"ai", "ml", "llm", "gpt", "pytorch", "tensorflow", "huggingface", "langchain", "deep learning", "nlp", "computer vision", "neural network"}
CLOUD_NATIVE_KEYWORDS = {"kubernetes", "k8s", "docker", "terraform", "aws", "gcp", "azure", "microservices", "serverless", "distributed systems", "helm"}
MODERN_BACKEND_KEYWORDS = {"python", "fastapi", "django", "golang", "go", "rust", "node", "nodejs", "typescript", "react", "postgresql", "postgres", "redis", "kafka", "graphql", "nextjs"}
LEGACY_KEYWORDS = {"cobol", "fortran", "vb6", "struts", "perl", "jquery"}

def calculate_tech_stack_score(required_skills: List[str], description: str = "") -> Tuple[float, List[str]]:
    """
    Computes tech stack score: sum matched signals (AI/ML +0.3, cloud-native +0.25, modern backend +0.2, legacy -0.1).
    Clamped strictly to [0.0, 1.0].
    """
    all_text = f"{' '.join(required_skills or [])} {description or ''}".lower()
    words = set(re.findall(r'\b[a-z0-9+#\.-]+\b', all_text))
    
    score = 0.35 if (required_skills or words) else 0.20
    tags = []
    
    # Check AI/ML
    if words & AI_ML_KEYWORDS or any(kw in all_text for kw in AI_ML_KEYWORDS):
        score += 0.30
        tags.append("AI/ML Stack")
        
    # Check Cloud-Native
    if words & CLOUD_NATIVE_KEYWORDS or any(kw in all_text for kw in CLOUD_NATIVE_KEYWORDS):
        score += 0.25
        tags.append("Cloud Native")
        
    # Check Modern Backend
    if words & MODERN_BACKEND_KEYWORDS or any(kw in all_text for kw in MODERN_BACKEND_KEYWORDS):
        score += 0.20
        tags.append("Modern Stack")
        
    # Check Legacy
    if words & LEGACY_KEYWORDS:
        score -= 0.10
        tags.append("Legacy Stack")
        
    clamped_score = max(0.0, min(1.0, round(score, 4)))
    return clamped_score, tags

def calculate_seniority_score(role_title: str) -> Tuple[float, Optional[str]]:
    """
    Computes seniority score:
    - Staff/Principal/Lead/Senior -> 0.8
    - Unspecified/Mid-level -> 0.5
    - Fresher/Trainee/Intern -> 0.2
    Clamped strictly to [0.0, 1.0].
    """
    title_lower = (role_title or "").lower().strip()
    
    if any(kw in title_lower for kw in ["staff", "principal", "lead", "architect", "senior", "sr."]):
        return 0.80, "Senior Tier"
    elif any(kw in title_lower for kw in ["intern", "internship", "trainee", "fresher", "junior", "jr."]):
        return 0.20, "Early Career"
    else:
        return 0.50, "Mid Level"

def calculate_remote_score(location_type: str = "", location: str = "", is_remote: bool = True) -> Tuple[float, Optional[str]]:
    """
    Computes remote score:
    - Remote/Hybrid/Flexible -> 0.8
    - Unspecified -> 0.4
    - On-site only -> 0.1
    Clamped strictly to [0.0, 1.0].
    """
    loc_text = f"{location_type or ''} {location or ''}".lower()
    
    if is_remote or any(kw in loc_text for kw in ["remote", "hybrid", "flexible"]):
        return 0.80, "Remote-Friendly"
    elif not location or location.lower() == "unspecified":
        return 0.40, None
    else:
        return 0.10, "On-Site"

def calculate_perks_score(perks_dict: Dict[str, bool]) -> Tuple[float, List[str]]:
    """
    Computes perks score: 0.2 per confirmed perk, clamped to max 1.0.
    """
    confirmed_count = sum(1 for v in perks_dict.values() if v is True)
    score = min(1.0, round(0.20 * confirmed_count, 4))
    
    tags = []
    if perks_dict.get("offers_equity"): tags.append("Equity Offered")
    if perks_dict.get("offers_visa_sponsorship"): tags.append("Visa Sponsorship")
    if perks_dict.get("offers_relocation"): tags.append("Relocation Package")
    if perks_dict.get("offers_bonus"): tags.append("Signing Bonus")
    if perks_dict.get("offers_education_stipend"): tags.append("Learning Stipend")
    if perks_dict.get("offers_flexible_timing"): tags.append("Flexible Hours")
    
    return max(0.0, min(1.0, score)), tags

def calculate_competition_score(applicant_count: Optional[int]) -> Tuple[Optional[float], Optional[str]]:
    """
    Computes competition score: max(0.0, 1.0 - (applicant_count / 500.0)) when applicant_count is present, else None.
    Mandatory clamp: max(0.0, min(1.0, ...))
    """
    if applicant_count is None:
        return None, None
        
    score = max(0.0, min(1.0, round(1.0 - (applicant_count / 500.0), 4)))
    tag = "Low Competition" if score >= 0.70 else ("High Competition" if score <= 0.30 else "Moderate Competition")
    return score, tag

def compute_job_quality(job_dict: Dict[str, Any], custom_weights: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """
    Computes overall composite quality_score as a weighted average over non-null components only.
    Renormalizes component weights dynamically when optional components (competition_score) are null.
    """
    weights = custom_weights or DEFAULT_QUALITY_WEIGHTS
    
    # 1. Component calculations
    tech_score, tech_tags = calculate_tech_stack_score(
        job_dict.get("required_skills", []), 
        job_dict.get("description", "")
    )
    
    seniority_score, sen_tag = calculate_seniority_score(job_dict.get("role_title", ""))
    remote_score, rem_tag = calculate_remote_score(
        job_dict.get("location_type", ""), 
        job_dict.get("location", ""), 
        job_dict.get("remote", True)
    )
    
    perks_dict = {
        "offers_equity": bool(job_dict.get("offers_equity")),
        "offers_visa_sponsorship": bool(job_dict.get("offers_visa_sponsorship")),
        "offers_relocation": bool(job_dict.get("offers_relocation")),
        "offers_bonus": bool(job_dict.get("offers_bonus")),
        "offers_education_stipend": bool(job_dict.get("offers_education_stipend")),
        "offers_flexible_timing": bool(job_dict.get("offers_flexible_timing"))
    }
    perks_score, perk_tags = calculate_perks_score(perks_dict)
    
    comp_score, comp_tag = calculate_competition_score(job_dict.get("applicant_count"))
    
    # 2. Weighted average renormalization over non-null components
    component_scores = {
        "tech_stack": tech_score,
        "seniority": seniority_score,
        "remote": remote_score,
        "perks": perks_score,
        "competition": comp_score
    }
    
    valid_components = {k: v for k, v in component_scores.items() if v is not None}
    
    total_valid_weight = sum(weights.get(k, 0.0) for k in valid_components.keys())
    
    if total_valid_weight > 0:
        weighted_sum = sum((weights.get(k, 0.0) * v) for k, v in valid_components.items())
        composite_quality_score = weighted_sum / total_valid_weight
    else:
        composite_quality_score = 0.50
        
    final_quality_score = max(0.0, min(1.0, round(composite_quality_score, 4)))
    
    # 3. Aggregate tags
    all_tags = []
    all_tags.extend(tech_tags)
    if sen_tag: all_tags.append(sen_tag)
    if rem_tag: all_tags.append(rem_tag)
    all_tags.extend(perk_tags)
    if comp_tag: all_tags.append(comp_tag)
    
    # Deduplicate tags preserving order
    seen_t = set()
    quality_tags = [t for t in all_tags if not (t in seen_t or seen_t.add(t))]
    
    return {
        "quality_score": final_quality_score,
        "tech_stack_score": tech_score,
        "seniority_score": seniority_score,
        "remote_score": remote_score,
        "perks_score": perks_score,
        "competition_score": comp_score,
        "quality_tags": quality_tags
    }
