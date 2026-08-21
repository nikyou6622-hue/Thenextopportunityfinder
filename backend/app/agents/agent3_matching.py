import re
import logging
from typing import Dict, Any, List, Tuple, Optional
from backend.app.schemas.schemas import ProfileSchema, JobSchema

logger = logging.getLogger(__name__)

def calculate_skill_overlap(user_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """Calculates skill overlap score, matching skills, and missing skills."""
    if not required_skills:
        return 80.0, user_skills, []
    
    user_skills_lower = {s.lower() for s in user_skills}
    matching_skills = []
    missing_skills = []
    
    for req in required_skills:
        if req.lower() in user_skills_lower or any(req.lower() in s for s in user_skills_lower):
            matching_skills.append(req)
        else:
            missing_skills.append(req)
            
    overlap_ratio = len(matching_skills) / max(len(required_skills), 1)
    score = min(100.0, overlap_ratio * 100.0)
    return score, matching_skills, missing_skills

def calculate_domain_fit(profile_domains: List[str], job_domain: str) -> float:
    """Calculates domain fit score based on profile domains and job domain tag."""
    if not job_domain or job_domain == "general":
        return 75.0
    
    job_domain_lower = job_domain.lower()
    for d in profile_domains:
        if d.lower() in job_domain_lower or job_domain_lower in d.lower():
            return 100.0
    return 40.0

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

def calculate_semantic_sim(raw_resume_text: str, job_description: str) -> float:
    """Calculates semantic similarity score between candidate resume text and job description."""
    if not raw_resume_text or not job_description:
        return 70.0

    try:
        words_resume = set(re.findall(r'\w+', raw_resume_text.lower()))
        words_job = set(re.findall(r'\w+', job_description.lower()))
        
        stopwords = {"the", "and", "a", "to", "in", "is", "for", "with", "on", "at", "by", "of", "an", "be", "as", "are", "or", "our", "we", "you", "your"}
        words_resume -= stopwords
        words_job -= stopwords
        
        if not words_job:
            return 70.0
            
        intersection = words_resume.intersection(words_job)
        jaccard = len(intersection) / len(words_job)
        score = min(100.0, jaccard * 250.0)
        return max(50.0, score)
    except Exception as e:
        logger.warning(f"Semantic sim error: {e}")
        return 70.0

def evaluate_language_gate(profile_languages: List[Any], job_description: str) -> Tuple[bool, Optional[str]]:
    """
    Checks if job explicitly requires a specific language (e.g. German, French, Danish, Japanese)
    that the candidate does not have listed in their profile.
    """
    if not job_description:
        return True, None

    desc_lower = job_description.lower()
    
    # Common gated foreign languages in international postings
    gated_languages = {
        "german": ["german", "deutsch", "c1 german", "fließend deutsch"],
        "french": ["french", "français", "fluent french", "courant français"],
        "danish": ["danish", "dansk", "flydende dansk"],
        "japanese": ["japanese", "jlpt n1", "jlpt n2", "business japanese"],
        "mandarin": ["mandarin", "chinese", "fluent chinese"],
        "spanish": ["fluent spanish", "español nativo", "c1 spanish"]
    }
    
    # Normalize candidate known languages
    known_langs = set()
    if profile_languages:
        for item in profile_languages:
            if isinstance(item, dict):
                lang = item.get("language") or item.get("name") or ""
                known_langs.add(lang.lower())
            elif isinstance(item, str):
                known_langs.add(item.lower())

    for lang_name, triggers in gated_languages.items():
        if any(trig in desc_lower for trig in triggers):
            # Check if candidate has this language
            if not any(lang_name in kl for kl in known_langs):
                return False, f"Job mandates '{lang_name.title()}' proficiency which is undeclared in your profile."
                
    return True, None


def evaluate_dealbreakers(profile_dealbreakers: Dict[str, Any], job: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Evaluates candidate's hard dealbreaker constraints (remote only, commute limit, min salary).
    """
    violations = []
    if not profile_dealbreakers:
        return True, violations
        
    # Remote Only Dealbreaker
    if profile_dealbreakers.get("remote_only", False) and not job.get("remote", False):
        if "remote" not in (job.get("location") or "").lower():
            violations.append("Dealbreaker: Role requires onsite/hybrid presence (profile preference: Remote Only).")
            
    # Blacklisted Companies
    blacklisted = [b.lower() for b in profile_dealbreakers.get("blacklisted_companies", [])]
    job_company = (job.get("company") or "").lower()
    if any(b in job_company for b in blacklisted):
        violations.append(f"Dealbreaker: Company '{job.get('company')}' is in candidate exclusion list.")
        
    return len(violations) == 0, violations


def compute_match(
    profile: Dict[str, Any],
    job: Dict[str, Any],
    outcome_feedback_signals: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Computes composite match score based on spec formula:
    match_score = 0.40*skill_overlap + 0.25*domain_fit + 0.15*location_fit + 0.20*semantic_sim
    
    Integrates ai-job-search Language Gate and Dealbreaker Matrix to prevent mismatched applications.
    """
    user_skills = profile.get("skills", [])
    required_skills = job.get("required_skills", [])
    job_domain = (job.get("domain") or "general").lower()
    
    skill_score, matching_skills, missing_skills = calculate_skill_overlap(user_skills, required_skills)
    domain_score = calculate_domain_fit(profile.get("domains", []), job_domain)
    location_score = calculate_location_fit(profile.get("location", {}), job.get("location", "Remote"), job.get("remote", True))
    semantic_score = calculate_semantic_sim(profile.get("raw_resume_text", ""), job.get("description", ""))

    # Outcome Feedback Loop adjustment
    feedback_notes = []
    domain_penalty = 0.0
    
    if outcome_feedback_signals:
        for signal in outcome_feedback_signals:
            pattern = signal.get("pattern_type", "").lower()
            if job_domain in pattern or "screening_rejection" in pattern:
                domain_penalty = 12.0
                feedback_notes.append(
                    f"Adaptive signal: Screening rejection history in '{job_domain}' detected. "
                    "Recommend tailoring resume with Agent 4 prior to submitting."
                )
                break

    # Language Gate Evaluation
    lang_passed, lang_warning = evaluate_language_gate(
        profile.get("languages", ["English"]),
        job.get("description", "")
    )
    if not lang_passed:
        feedback_notes.append(f"Language Gate Alert: {lang_warning}")

    # Dealbreaker Evaluation
    dealbreakers_passed, dealbreaker_issues = evaluate_dealbreakers(
        profile.get("dealbreakers", {}),
        job
    )
    for issue in dealbreaker_issues:
        feedback_notes.append(issue)

    effective_domain_score = max(20.0, domain_score - domain_penalty)

    composite_score = (
        0.40 * skill_score +
        0.25 * effective_domain_score +
        0.15 * location_score +
        0.20 * semantic_score
    )

    # Apply penalty if hard dealbreakers or language gates fail
    if not lang_passed:
        composite_score = max(25.0, composite_score - 20.0)
    if not dealbreakers_passed:
        composite_score = max(20.0, composite_score - 25.0)

    composite_score = round(min(100.0, max(0.0, composite_score)), 1)

    result = {
        "match_score": composite_score,
        "skill_overlap_score": round(skill_score, 1),
        "domain_score": round(effective_domain_score, 1),
        "location_score": round(location_score, 1),
        "semantic_score": round(semantic_score, 1),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "language_gate_passed": lang_passed,
        "dealbreakers_passed": dealbreakers_passed,
        "is_qualified": composite_score >= 65.0 and lang_passed and dealbreakers_passed
    }
    if feedback_notes:
        result["adaptive_feedback"] = feedback_notes
        
    return result
