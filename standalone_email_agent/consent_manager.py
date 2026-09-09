import datetime
import logging
from typing import Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from standalone_email_agent.db_models import EmailConsentModel, EmailSuppressionModel

logger = logging.getLogger("standalone_email_agent.consent")

def grant_consent(
    db: Session,
    email: str,
    consent_type: str,
    user_id: int = None,
    source: str = "signup_checkbox"
) -> EmailConsentModel:
    """
    Grants or updates explicit user consent for a specific email communication type.
    """
    clean_email = email.lower().strip()
    existing = db.query(EmailConsentModel).filter(
        EmailConsentModel.email == clean_email,
        EmailConsentModel.consent_type == consent_type
    ).first()

    now = datetime.datetime.now(datetime.timezone.utc)
    if existing:
        existing.granted_at = now
        existing.revoked_at = None
        existing.source = source
        if user_id:
            existing.user_id = user_id
        db.commit()
        db.refresh(existing)
        logger.info(f"Updated consent for {clean_email} -> {consent_type}")
        return existing

    consent = EmailConsentModel(
        user_id=user_id,
        email=clean_email,
        consent_type=consent_type,
        granted_at=now,
        source=source,
        revoked_at=None
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    logger.info(f"Granted new consent for {clean_email} -> {consent_type}")
    return consent

def revoke_consent(db: Session, email: str, consent_type: str = None) -> bool:
    """
    Revokes user consent for a specific consent_type or ALL consent types.
    """
    clean_email = email.lower().strip()
    query = db.query(EmailConsentModel).filter(EmailConsentModel.email == clean_email)
    if consent_type:
        query = query.filter(EmailConsentModel.consent_type == consent_type)

    rows = query.all()
    if not rows:
        return False

    now = datetime.datetime.now(datetime.timezone.utc)
    for row in rows:
        row.revoked_at = now
    db.commit()
    logger.info(f"Revoked consent for {clean_email} (type: {consent_type or 'all'})")
    return True

def add_suppression(db: Session, email: str, reason: str = "unsubscribed") -> EmailSuppressionModel:
    """
    Adds an email address to the global suppression list.
    Suppression entries ALWAYS override any consent rows!
    """
    clean_email = email.lower().strip()
    existing = db.query(EmailSuppressionModel).filter(EmailSuppressionModel.email == clean_email).first()
    if existing:
        existing.reason = reason
        existing.created_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(existing)
        logger.warning(f"Suppression reason updated for {clean_email}: {reason}")
        return existing

    suppression = EmailSuppressionModel(
        email=clean_email,
        reason=reason,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(suppression)
    db.commit()
    db.refresh(suppression)
    logger.warning(f"Added {clean_email} to suppression list (reason: {reason})")
    return suppression

def is_suppressed(db: Session, email: str) -> bool:
    """Checks if an email address is listed in the email_suppression table."""
    clean_email = email.lower().strip()
    suppressed = db.query(EmailSuppressionModel).filter(EmailSuppressionModel.email == clean_email).first()
    return suppressed is not None

def has_active_consent(db: Session, email: str, consent_type: str) -> bool:
    """Checks if active, non-revoked consent exists for a specific consent type."""
    clean_email = email.lower().strip()
    consent = db.query(EmailConsentModel).filter(
        EmailConsentModel.email == clean_email,
        EmailConsentModel.consent_type == consent_type,
        EmailConsentModel.revoked_at.is_(None)
    ).first()
    return consent is not None

def can_send_email(db: Session, email: str, consent_type: str) -> Tuple[bool, str]:
    """
    Strict compliance evaluator:
    1. Checks suppression list FIRST. (Suppression always wins)
    2. Checks active non-revoked consent row for the specific consent_type.
    Returns (True, "APPROVED") or (False, reason).
    """
    clean_email = email.lower().strip()

    # Rule 1: Suppression Check
    if is_suppressed(db, clean_email):
        reason = f"Blocked: Email '{clean_email}' is present in email_suppression table."
        logger.info(reason)
        return False, reason

    # Rule 2: Consent Check
    if not has_active_consent(db, clean_email, consent_type):
        reason = f"Blocked: No active, granted consent found for '{clean_email}' and consent_type '{consent_type}'."
        logger.info(reason)
        return False, reason

    return True, "Approved for delivery"

def get_user_consent_summary(db: Session, email: str) -> Dict[str, Any]:
    """Returns a full summary of user consent states and suppression status for settings pages."""
    clean_email = email.lower().strip()
    consents = db.query(EmailConsentModel).filter(EmailConsentModel.email == clean_email).all()
    suppressed = is_suppressed(db, clean_email)

    consent_dict = {}
    for c in consents:
        consent_dict[c.consent_type] = {
            "granted": c.revoked_at is None,
            "granted_at": c.granted_at.isoformat() if c.granted_at else None,
            "revoked_at": c.revoked_at.isoformat() if c.revoked_at else None,
            "source": c.source
        }

    return {
        "email": clean_email,
        "is_suppressed": suppressed,
        "consents": consent_dict
    }
