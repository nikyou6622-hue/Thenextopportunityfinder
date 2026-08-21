import logging
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.app.db.models import ApplicationModel, JobModel, ProfileModel, OutcomeDiagnosisModel

logger = logging.getLogger(__name__)

def analyze_outcome_patterns(db: Session, profile_id: int) -> List[Dict[str, Any]]:
    """
    Evaluates candidate applications. When 3+ applications in the same domain or role_type
    reach 'rejected' status, generates actionable outcome diagnosis entries.
    """
    apps = db.query(ApplicationModel).filter(
        ApplicationModel.profile_id == profile_id,
        ApplicationModel.status == "rejected"
    ).all()

    if not apps:
        return []

    # Group rejected apps by domain and role_type
    domain_groups: Dict[str, List[ApplicationModel]] = {}
    for app in apps:
        job = db.query(JobModel).filter(JobModel.id == app.job_id).first()
        domain = (job.domain if job and job.domain else "general").lower()
        if domain not in domain_groups:
            domain_groups[domain] = []
        domain_groups[domain].append(app)

    diagnoses = []
    
    for domain, rejected_apps in domain_groups.items():
        if len(rejected_apps) >= 3:
            # Check if diagnosis already exists for this domain pattern recently
            pattern_key = f"rejection_cluster_{domain}"
            existing = db.query(OutcomeDiagnosisModel).filter(
                OutcomeDiagnosisModel.profile_id == profile_id,
                OutcomeDiagnosisModel.pattern_type == pattern_key
            ).first()

            evidence_summary = (
                f"Detected {len(rejected_apps)} consecutive application rejections in the '{domain.upper()}' sector. "
                f"Submissions failed to pass initial ATS/screening stages across target roles."
            )

            recommendation = (
                f"For '{domain.upper()}' roles: 1) Elevate domain-specific keywords (e.g. system design, high-concurrency, "
                f"domain-tailored metrics) in your resume summary. 2) Use Agent 4 Tailoring to re-align your top 5 technical bullet points "
                f"against target JDs before submitting."
            )

            if existing:
                existing.evidence_summary = evidence_summary
                existing.recommendation = recommendation
                existing.detected_at = datetime.datetime.now(datetime.timezone.utc)
                db.commit()
                diagnoses.append({
                    "id": existing.id,
                    "profile_id": existing.profile_id,
                    "pattern_type": existing.pattern_type,
                    "evidence_summary": existing.evidence_summary,
                    "recommendation": existing.recommendation,
                    "detected_at": existing.detected_at.isoformat()
                })
            else:
                diag = OutcomeDiagnosisModel(
                    profile_id=profile_id,
                    pattern_type=pattern_key,
                    evidence_summary=evidence_summary,
                    recommendation=recommendation,
                    detected_at=datetime.datetime.now(datetime.timezone.utc)
                )
                db.add(diag)
                db.commit()
                db.refresh(diag)
                diagnoses.append({
                    "id": diag.id,
                    "profile_id": diag.profile_id,
                    "pattern_type": diag.pattern_type,
                    "evidence_summary": diag.evidence_summary,
                    "recommendation": diag.recommendation,
                    "detected_at": diag.detected_at.isoformat()
                })

    # Fallback default diagnosis if total rejected >= 3 across all domains but not 3 in a single domain
    if not diagnoses and len(apps) >= 3:
        pattern_key = "general_screening_rejection"
        existing = db.query(OutcomeDiagnosisModel).filter(
            OutcomeDiagnosisModel.profile_id == profile_id,
            OutcomeDiagnosisModel.pattern_type == pattern_key
        ).first()

        evidence_summary = f"Identified {len(apps)} rejected applications across multiple tech domains during initial resume review."
        recommendation = "Run ATS Optimization in Live Resume & ATS Studio tab to bring overall resume ATS score above 85%."

        if existing:
            existing.evidence_summary = evidence_summary
            existing.recommendation = recommendation
            db.commit()
            diagnoses.append({
                "id": existing.id,
                "profile_id": existing.profile_id,
                "pattern_type": existing.pattern_type,
                "evidence_summary": existing.evidence_summary,
                "recommendation": existing.recommendation,
                "detected_at": existing.detected_at.isoformat()
            })
        else:
            diag = OutcomeDiagnosisModel(
                profile_id=profile_id,
                pattern_type=pattern_key,
                evidence_summary=evidence_summary,
                recommendation=recommendation,
                detected_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(diag)
            db.commit()
            db.refresh(diag)
            diagnoses.append({
                "id": diag.id,
                "profile_id": diag.profile_id,
                "pattern_type": diag.pattern_type,
                "evidence_summary": diag.evidence_summary,
                "recommendation": diag.recommendation,
                "detected_at": diag.detected_at.isoformat()
            })

    return diagnoses


def get_outcome_diagnoses(db: Session, profile_id: int) -> List[Dict[str, Any]]:
    """
    Returns stored outcome diagnoses for a profile. Runs pattern evaluation if empty.
    """
    diagnoses = db.query(OutcomeDiagnosisModel).filter(OutcomeDiagnosisModel.profile_id == profile_id).order_by(OutcomeDiagnosisModel.detected_at.desc()).all()
    if not diagnoses:
        return analyze_outcome_patterns(db, profile_id)
        
    return [{
        "id": d.id,
        "profile_id": d.profile_id,
        "pattern_type": d.pattern_type,
        "evidence_summary": d.evidence_summary,
        "recommendation": d.recommendation,
        "detected_at": d.detected_at.isoformat() if d.detected_at else datetime.datetime.now(datetime.timezone.utc).isoformat()
    } for d in diagnoses]
