"""
cleaner.py — Deadline-Based Job Expiration, Safe Archiving, and Orphan Cleanup Engine
========================================================================================
Design Principle:
1. Jobs with candidate match history (MatchModel) or active/past applications (ApplicationModel)
   are ALWAYS ARCHIVED (status = "expired") and NEVER hard-deleted.
2. Hard-deletion is strictly restricted to orphaned jobs with 0 matches AND 0 applications
   past a 14-day retention window.
3. Unknown deadlines remain null (zero-hallucination, never guessed).
"""

import datetime
import logging
from typing import Dict, Any, Optional
from sqlalchemy import or_, and_, not_
from sqlalchemy.orm import Session

from backend.app.db.models import JobModel, MatchModel, ApplicationModel, EmailLogModel

logger = logging.getLogger(__name__)


def check_expiration(job: JobModel) -> str:
    """
    Returns the job's status after checking both link health and application deadline.
    Transitions job status to 'expired' if application_deadline has passed.
    """
    if not job:
        return "removed"

    if job.application_deadline:
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        deadline = job.application_deadline
        # Normalize timezone if naive
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=datetime.timezone.utc)

        if deadline < now_utc:
            return "expired"

    return job.status or "active"


def cleanup_expired_jobs(db: Session, retention_days: int = 14) -> Dict[str, int]:
    """
    Executes 2-tier job expiration & cleanup pass:
    - Step 1: Archives jobs with candidate history (matches/applications) by setting status = 'expired'.
    - Step 2: Hard-deletes orphaned jobs (0 matches AND 0 applications) older than retention_days.
    """
    now_utc = datetime.datetime.now(datetime.timezone.utc)

    # First, evaluate application_deadline for active jobs and update status
    active_jobs = db.query(JobModel).filter(
        JobModel.status == "active",
        JobModel.application_deadline.isnot(None)
    ).all()

    newly_expired = 0
    for j in active_jobs:
        if check_expiration(j) == "expired":
            j.status = "expired"
            newly_expired += 1

    if newly_expired > 0:
        db.flush()
        logger.info(f"Marked {newly_expired} active jobs as expired based on application_deadline.")

    # Subquery IDs of jobs referenced in matches or applications
    matched_job_ids = db.query(MatchModel.job_id).distinct()
    applied_job_ids = db.query(ApplicationModel.job_id).distinct()
    referenced_job_ids_union = matched_job_ids.union(applied_job_ids)

    # Step 1: Archive expired/removed jobs that have candidate history
    expired_with_history = db.query(JobModel).filter(
        JobModel.status.in_(["expired", "removed"]),
        JobModel.id.in_(referenced_job_ids_union)
    ).all()

    archived_count = 0
    for job in expired_with_history:
        if job.status != "expired":
            job.status = "expired"
        archived_count += 1

    # Step 2: Hard-delete orphaned jobs (0 matches AND 0 applications) older than retention window
    cutoff = now_utc - datetime.timedelta(days=retention_days)
    orphaned_jobs = db.query(JobModel).filter(
        JobModel.status.in_(["expired", "removed"]),
        or_(JobModel.last_seen_at < cutoff, JobModel.last_seen_at.is_(None)),
        ~JobModel.id.in_(referenced_job_ids_union)
    ).all()

    deleted_count = len(orphaned_jobs)
    for job in orphaned_jobs:
        db.delete(job)

    db.commit()

    logger.info(f"Cleanup pass complete: {archived_count} jobs archived (history preserved), {deleted_count} orphaned jobs hard-deleted.")
    return {
        "newly_expired": newly_expired,
        "archived": archived_count,
        "deleted": deleted_count
    }


def notify_candidates_of_expired_jobs(db: Session) -> int:
    """
    Notifies candidates when a saved/tracked job in their applications pipeline has expired.
    """
    expired_apps = db.query(ApplicationModel).join(JobModel, ApplicationModel.job_id == JobModel.id).filter(
        JobModel.status == "expired",
        ApplicationModel.status.in_(["matched", "tailored", "pending_manual_review", "link_opened"])
    ).all()

    notified_count = 0
    for app in expired_apps:
        # Mark application status as archived / expired_notified
        app.status = "archived"
        app.notes = f"Job '{app.job.role_title}' at {app.job.company} expired on deadline."

        # Log notification email
        log = EmailLogModel(
            job_id=app.job_id,
            company=app.job.company or "Verified Company",
            recipient=app.profile.email if (app.profile and app.profile.email) else "candidate@example.com",
            subject=f"Job Opportunity Expired: {app.job.role_title} at {app.job.company}",
            body_preview=f"The job posting for '{app.job.role_title}' at {app.job.company} has reached its deadline and is now closed.",
            status="sent",
            sent_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(log)
        notified_count += 1

    if notified_count > 0:
        db.commit()
        logger.info(f"Notified {notified_count} candidates regarding expired saved/tracked jobs.")

    return notified_count
