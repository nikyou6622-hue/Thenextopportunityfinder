"""
agent3_matching.py — High-Quality Skill Matching, Ranking, and Filtering Engine
Integrates deterministic skill normalization and zero-hallucination set intersection.
"""

import re
import logging
from typing import Dict, Any, List, Tuple, Optional, Set, Union
from backend.app.utils.skill_normalizer import normalize_skill, normalize_skill_list

logger = logging.getLogger(__name__)

# Configurable minimum relevance threshold constants
MIN_QUALIFIED_MATCH_THRESHOLD = 50.0
TIER3_MIN_QUALIFIED_MATCH_THRESHOLD = 65.0

def compute_skill_match(resume_skills: List[str], job_required_skills: List[str]) -> Dict[str, Any]:
    """
    Computes exact deterministic set intersection after skill normalization.
    Zero-hallucination guarantee: a matched skill MUST be present in both sets.
    """
    norm_resume = normalize_skill_list(resume_skills)
    norm_job = normalize_skill_list(job_required_skills)

    matched_norm = norm_resume & norm_job
    missing_norm = norm_job - norm_resume

    # Map matched_norm back to display strings from original job skills
    matched_display = []
    for s in job_required_skills:
        if normalize_skill(s) in matched_norm:
            matched_display.append(s)
            
    seen = set()
    matched_skills = []
    for s in matched_display:
        if s.lower() not in seen:
            seen.add(s.lower())
            matched_skills.append(s)

    missing_display = []
    for s in job_required_skills:
        if normalize_skill(s) in missing_norm:
            missing_display.append(s)
            
    seen_m = set()
    missing_skills = []
    for s in missing_display:
        if s.lower() not in seen_m:
            seen_m.add(s.lower())
            missing_skills.append(s)

    raw_match_pct = (len(matched_norm) / len(norm_job) * 100.0) if norm_job else 0.0
    required_count = len(norm_job)
    
    # Requirement completeness factor: sparse 1-skill requirement lists carry a weaker confidence signal
    # than complete 4+-skill requirement lists.
    completeness_factor = min(1.0, 0.80 + 0.05 * required_count) if required_count > 0 else 1.0
    effective_match_pct = round(raw_match_pct * completeness_factor, 1)

    return {
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "matched_count": len(matched_norm),
        "required_count": required_count,
        "raw_skill_match_percentage": round(raw_match_pct, 1),
        "skill_match_percentage": effective_match_pct,
    }

def calculate_domain_fit(profile_domains: List[str], job_domain: str) -> float:
    """Calculates domain fit score based on profile domains and job domain tag."""
    if not job_domain or job_domain == "general" or not profile_domains:
        return 75.0
    
    job_domain_lower = job_domain.lower()
    for d in profile_domains:
        if d.lower() in job_domain_lower or job_domain_lower in d.lower():
            return 100.0
    return 50.0

def calculate_location_fit(profile_location: Dict[str, Any], job_location: str, job_remote: bool) -> float:
    """Calculates location fit score based on remote flags and location string."""
    if not profile_location or not isinstance(profile_location, dict):
        return 100.0 if job_remote else 70.0

    open_to_remote = profile_location.get("open_to_remote", True)
    if job_remote and open_to_remote:
        return 100.0
    
    city = (profile_location.get("city") or "").lower()
    country = (profile_location.get("country") or "").lower()
    job_loc_lower = (job_location or "").lower()

    if city and city in job_loc_lower:
        return 100.0
    if country and country in job_loc_lower:
        return 80.0
        
    return 60.0

def calculate_semantic_sim(raw_resume_text: Union[str, Set[str]], job_description: str) -> float:
    """Calculates semantic similarity score between candidate resume text and job description."""
    if not raw_resume_text or not job_description:
        return 70.0

    try:
        stopwords = {"the", "and", "a", "to", "in", "is", "for", "with", "on", "at", "by", "of", "an", "be", "as", "are", "or", "our", "we", "you", "your"}
        if isinstance(raw_resume_text, set):
            words_resume = raw_resume_text
        else:
            words_resume = set(re.findall(r'\w+', str(raw_resume_text).lower())) - stopwords
        
        words_job = set(re.findall(r'\w+', str(job_description).lower())) - stopwords
        
        if not words_job:
            return 70.0
            
        intersection = words_resume.intersection(words_job)
        jaccard = len(intersection) / len(words_job)
        score = min(100.0, jaccard * 250.0)
        return max(50.0, score)
    except Exception as e:
        logger.warning(f"Semantic sim error: {e}")
        return 70.0

def evaluate_language_gate(profile_languages: Optional[List[Dict[str, Any]]], job_description: str) -> Tuple[bool, Optional[str]]:
    """
    Checks if a job description mandates a non-English language that candidate hasn't declared.
    """
    if not job_description:
        return True, None

    desc_lower = job_description.lower()
    candidate_langs = set()
    if profile_languages and isinstance(profile_languages, list):
        for lang_item in profile_languages:
            if isinstance(lang_item, dict) and "language" in lang_item:
                candidate_langs.add(str(lang_item["language"]).lower())
            elif isinstance(lang_item, str):
                candidate_langs.add(lang_item.lower())

    language_triggers = {
        "german": ["german", "deutsch", "fließend deutsch"],
        "french": ["french", "français", "francais"],
        "japanese": ["japanese", "jlpt", "日本語"],
        "spanish": ["spanish", "español", "espanol"],
        "mandarin": ["mandarin", "chinese", "中文"]
    }

    for lang_name, triggers in language_triggers.items():
        if any(trig in desc_lower for trig in triggers):
            if lang_name not in candidate_langs:
                return False, f"Requires {lang_name.title()} language proficiency"

    return True, None

def evaluate_dealbreakers(profile_dealbreakers: Optional[Dict[str, Any]], job: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Evaluates candidate dealbreaker criteria (remote_only, blacklisted_companies).
    """
    if not profile_dealbreakers or not isinstance(profile_dealbreakers, dict):
        return True, []

    issues = []
    if profile_dealbreakers.get("remote_only") and not job.get("remote"):
        issues.append("Remote Only requirement not met")

    blacklisted = profile_dealbreakers.get("blacklisted_companies") or []
    job_company = (job.get("company") or "").lower()
    for b_comp in blacklisted:
        if b_comp.lower() in job_company:
            issues.append(f"Company {job.get('company')} is blacklisted")

    return (len(issues) == 0), issues

def compute_match(
    profile: Dict[str, Any],
    job: Dict[str, Any],
    outcome_feedback_signals: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Computes composite match score based on spec formula:
    match_score = 0.40*skill_overlap + 0.25*domain_fit + 0.15*location_fit + 0.20*semantic_sim
    """
    user_skills = profile.get("skills", [])
    required_skills = job.get("required_skills", [])
    job_domain = (job.get("domain") or "general").lower()
    
    skill_res = compute_skill_match(user_skills, required_skills)
    skill_score = skill_res["skill_match_percentage"]
    
    domain_score = calculate_domain_fit(profile.get("domains", []), job_domain)
    if outcome_feedback_signals:
        for signal in outcome_feedback_signals:
            p_type = str(signal.get("pattern_type", "")).lower()
            if "rejection" in p_type or "ghosting" in p_type:
                if job_domain and (job_domain in p_type or p_type in job_domain):
                    domain_score = max(0.0, domain_score - 20.0)

    location_score = calculate_location_fit(profile.get("location", {}), job.get("location", "Remote"), job.get("remote", True))
    semantic_score = calculate_semantic_sim(profile.get("raw_resume_text", ""), job.get("description", ""))

    composite_score = (
        0.40 * skill_score +
        0.25 * domain_score +
        0.15 * location_score +
        0.20 * semantic_score
    # Sanity check: Non-technical roles (Store Manager, Cleaner, etc.) yield 0 match score
    is_technical = job.get("is_technical", True)
    if not is_technical:
        composite_score = 0.0
        skill_score = 0.0
        skill_res = {"matched_skills": [], "missing_skills": [], "matched_count": 0, "required_count": 0, "skill_match_percentage": 0.0}

    lang_passed, lang_alert = evaluate_language_gate(profile.get("languages", []), job.get("description", ""))
    deal_passed, deal_issues = evaluate_dealbreakers(profile.get("dealbreakers", {}), job)

    adaptive_feedback = []
    if not lang_passed and lang_alert:
        adaptive_feedback.append(lang_alert)
    if not deal_passed:
        adaptive_feedback.extend(deal_issues)

    # Apply Tier-specific minimum qualification thresholds
    source_trust_tier = job.get("source_trust_tier", "tier1_verified")
    required_threshold = TIER3_MIN_QUALIFIED_MATCH_THRESHOLD if source_trust_tier == "tier3_aggregator" else MIN_QUALIFIED_MATCH_THRESHOLD

    is_qualified = (composite_score >= required_threshold) and lang_passed and deal_passed and is_technical

    return {
        "match_score": composite_score,
        "skill_overlap_score": round(skill_score, 1),
        "domain_score": round(domain_score, 1),
        "location_score": round(location_score, 1),
        "semantic_score": round(semantic_score, 1),
        "matched_skills": skill_res["matched_skills"],
        "matching_skills": skill_res["matched_skills"],
        "missing_skills": skill_res["missing_skills"],
        "matched_count": skill_res["matched_count"],
        "required_count": skill_res["required_count"],
        "skill_match_percentage": skill_res["skill_match_percentage"],
        "language_gate_passed": lang_passed,
        "language_gate_alert": lang_alert,
        "dealbreakers_passed": deal_passed,
        "dealbreaker_issues": deal_issues,
        "adaptive_feedback": adaptive_feedback,
        "is_qualified": is_qualified
    }
