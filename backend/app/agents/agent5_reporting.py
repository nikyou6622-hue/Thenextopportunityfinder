from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.models import JobModel, MatchModel, ApplicationModel, ProfileModel, EmailLogModel
from backend.app.schemas.schemas import DashboardMetrics

def generate_dashboard_metrics(db: Session) -> DashboardMetrics:
    """Aggregates platform metric statistics for Agent 5 dashboard."""
    total_matched = db.query(MatchModel).count()
    
    # Applications link-opened or submitted
    apps_sent = db.query(ApplicationModel).filter(ApplicationModel.status.in_(["link_opened", "submitted", "emailed", "interview_scheduled", "offer_received", "hired"])).count()
    
    # Email outreach sent
    emails_sent = db.query(EmailLogModel).filter(EmailLogModel.status == "sent").count()
    
    # Pending manual review count
    pending_review = db.query(ApplicationModel).filter(ApplicationModel.status == "pending_manual_review").count()
    
    # High match count (>75%)
    high_match = db.query(MatchModel).filter(MatchModel.match_score >= 75.0).count()
    
    # Average match score
    avg_score_res = db.query(func.avg(MatchModel.match_score)).scalar()
    avg_match_score = round(float(avg_score_res), 1) if avg_score_res else 0.0

    # Domain breakdown
    domain_query = db.query(JobModel.domain, func.count(JobModel.id)).group_by(JobModel.domain).all()
    domain_breakdown = {dom or "other": count for dom, count in domain_query}

    # Match distribution (ranges: 90-100, 80-89, 70-79, <70)
    match_90_100 = db.query(MatchModel).filter(MatchModel.match_score >= 90.0).count()
    match_80_89 = db.query(MatchModel).filter(MatchModel.match_score >= 80.0, MatchModel.match_score < 90.0).count()
    match_70_79 = db.query(MatchModel).filter(MatchModel.match_score >= 70.0, MatchModel.match_score < 80.0).count()
    match_below_70 = db.query(MatchModel).filter(MatchModel.match_score < 70.0).count()

    match_distribution = {
        "90-100%": match_90_100,
        "80-89%": match_80_89,
        "70-79%": match_70_79,
        "<70%": match_below_70
    }

    return DashboardMetrics(
        total_matched_jobs=total_matched,
        applications_sent=apps_sent,
        pending_review_count=pending_review,
        high_match_count=high_match,
        emails_sent_count=emails_sent,
        avg_match_score=avg_match_score,
        domain_breakdown=domain_breakdown,
        match_distribution=match_distribution
    )
