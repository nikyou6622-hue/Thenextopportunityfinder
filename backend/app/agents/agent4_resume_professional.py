import re
import logging
from typing import Dict, Any, List
from backend.app.agents.agent1_parser import compute_ats_score

logger = logging.getLogger(__name__)

# Curated library of high-selection-rate resume patterns per domain/role
RESUME_PATTERNS = {
    "software": {
        "name": "Impact-Driven Software Engineering Pattern",
        "summary_template": "Results-oriented Software Engineer specializing in {top_skills} with proven expertise in building scalable web applications and distributed systems in {domain} ecosystems.",
        "action_verbs": ["Architected", "Engineered", "Scaled", "Optimized", "Spearheaded", "Deployed", "Reduced"],
        "section_order": ["Summary", "Technical Skills", "Experience", "Projects", "Education"]
    },
    "ai/ml": {
        "name": "AI/ML Innovations & Systems Pattern",
        "summary_template": "Machine Learning Engineer with deep domain knowledge in {top_skills}. Track record of designing high-accuracy models and deploying production ML pipelines in {domain} setups.",
        "action_verbs": ["Trained", "Fine-tuned", "Deployed", "Benchmark-tested", "Optimized", "Integrated"],
        "section_order": ["Summary", "Core Skills", "ML Experience", "Projects & Publications", "Education"]
    },
    "fintech": {
        "name": "High-Reliability Financial Tech Pattern",
        "summary_template": "Full-Stack Software Developer focused on high-concurrency fintech systems, compliance, and secure API integrations across {top_skills}.",
        "action_verbs": ["Secured", "Processed", "Integrated", "Optimized", "Architected", "Automated"],
        "section_order": ["Summary", "Technical Stack", "Professional Experience", "Education"]
    },
    "internship": {
        "name": "Early-Career & High-Potential Startup Pattern",
        "summary_template": "Enthusiastic and agile developer with hands-on project experience in {top_skills}. Passionate about contributing to fast-paced startup environments.",
        "action_verbs": ["Built", "Developed", "Designed", "Contributed", "Implemented", "Automated"],
        "section_order": ["Summary", "Technical Skills", "Projects", "Education", "Extracurriculars"]
    },
    "general": {
        "name": "Standard High-Selection Startup Pattern",
        "summary_template": "Adaptable tech professional with strong foundations in {top_skills}. Experienced in rapid product development and cross-functional team collaboration.",
        "action_verbs": ["Engineered", "Developed", "Collaborated", "Launched", "Streamlined"],
        "section_order": ["Summary", "Skills", "Experience", "Education"]
    }
}

def rewrite_resume_against_pattern(profile_data: Dict[str, Any], job_data: Dict[str, Any], match_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rewrites candidate's resume content against the best-matching high-selection resume pattern.
    Computes ATS score before & after rewrite, generates clear diff summary of changes.
    """
    ats_before = compute_ats_score(profile_data, job_data)
    
    # 1. Select best pattern template based on domain/role_type
    domain = (job_data.get("domain") or "general").lower()
    role_type = (job_data.get("role_type") or "full-time").lower()
    
    if role_type == "internship":
        pattern_key = "internship"
    elif "ai" in domain or "ml" in domain:
        pattern_key = "ai/ml"
    elif "fintech" in domain:
        pattern_key = "fintech"
    elif "software" in domain or "saas" in domain or "devtools" in domain:
        pattern_key = "software"
    else:
        pattern_key = "general"

    pattern = RESUME_PATTERNS[pattern_key]
    
    # 2. Prioritize skills: Matching skills first, then candidate's remaining skills
    candidate_skills = profile_data.get("skills") or []
    required_skills = job_data.get("required_skills") or []
    matching_skills = match_data.get("matching_skills") or [s for s in candidate_skills if s.lower() in [r.lower() for r in required_skills]]
    remaining_skills = [s for s in candidate_skills if s not in matching_skills]
    
    reordered_skills = matching_skills + remaining_skills
    top_skills_str = ", ".join(reordered_skills[:4]) if reordered_skills else "modern software engineering"
    
    # 3. Generate tailored summary
    tailored_summary = pattern["summary_template"].format(
        top_skills=top_skills_str,
        domain=domain.upper() if domain != "general" else "Tech Startup"
    )
    
    # 4. Generate diff summary of improvements made
    diff_summary = [
        {
            "section": "Professional Summary",
            "change_type": "Rewritten against pattern",
            "detail": f"Aligned tone with '{pattern['name']}' emphasizing top matching skills ({top_skills_str})."
        },
        {
            "section": "Skills Prioritization",
            "change_type": "Re-ordered keywords",
            "detail": f"Surfaced {len(matching_skills)} employer-requested keywords at top of section."
        }
    ]
    
    # 5. Build rewritten profile representation & recompute ATS score
    rewritten_profile = dict(profile_data)
    rewritten_profile["summary"] = tailored_summary
    rewritten_profile["skills"] = reordered_skills
    
    ats_after = compute_ats_score(rewritten_profile, job_data)
    
    # Ensure net score improvement
    score_delta = round(ats_after["total_score"] - ats_before["total_score"], 1)
    if score_delta > 0:
        diff_summary.append({
            "section": "ATS Optimizer",
            "change_type": "Score Net Gain",
            "detail": f"ATS Pass-Through Score increased by +{score_delta}% (From {ats_before['total_score']}% to {ats_after['total_score']}%)."
        })

    return {
        "pattern_template_used": pattern["name"],
        "tailored_summary": tailored_summary,
        "tailored_skills": reordered_skills,
        "ats_score_before": ats_before["total_score"],
        "ats_score_after": ats_after["total_score"],
        "ats_breakdown_after": ats_after,
        "diff_summary": diff_summary,
        "form_autofill_data": {
            "full_name": profile_data.get("name", ""),
            "email": profile_data.get("email", ""),
            "phone": profile_data.get("phone", ""),
            "location": profile_data.get("location", {}).get("city", "Remote"),
            "tailored_summary": tailored_summary,
            "top_skills": ", ".join(reordered_skills[:6]),
            "portfolio_url": "",
            "github_url": "",
            "linkedin_url": ""
        }
    }
