import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from standalone_email_agent.consent_manager import add_suppression, revoke_consent

logger = logging.getLogger("standalone_email_agent.webhook")

def process_esp_webhook_event(db: Session, event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes near-real-time webhook notifications from ESPs (SendGrid, Resend, Postmark, SES, Mailgun).
    Handles:
    - Bounces (`bounce`, `hard_bounce`) -> Adds to email_suppression (reason="bounced")
    - Spam Complaints (`complaint`, `spam`, `spamreport`) -> Adds to email_suppression (reason="complained")
    - Unsubscribes (`unsubscribe`, `group_unsubscribe`) -> Adds to email_suppression (reason="unsubscribed") & revokes consent.
    """
    event_type = (event_data.get("event") or event_data.get("type") or event_data.get("record_type") or "").lower().strip()
    email = (event_data.get("email") or event_data.get("recipient") or "").lower().strip()

    if not email:
        return {"status": "ignored", "reason": "Missing email field in payload"}

    # Bounces
    if any(k in event_type for k in ["bounce", "dropped", "hard_bounce"]):
        suppression = add_suppression(db, email, reason="bounced")
        logger.warning(f"[WEBHOOK EVENT] Auto-suppressed hard bounce for {email}")
        return {"status": "processed", "action": "suppression_added", "reason": "bounced", "email": email}

    # Spam Complaints
    elif any(k in event_type for k in ["complaint", "spam", "spamreport"]):
        suppression = add_suppression(db, email, reason="complained")
        revoke_consent(db, email)
        logger.warning(f"[WEBHOOK EVENT] Auto-suppressed spam complaint for {email}")
        return {"status": "processed", "action": "suppression_added", "reason": "complained", "email": email}

    # Unsubscribes
    elif any(k in event_type for k in ["unsubscribe", "group_unsubscribe"]):
        suppression = add_suppression(db, email, reason="unsubscribed")
        consent_type = event_data.get("consent_type")
        revoke_consent(db, email, consent_type=consent_type)
        logger.info(f"[WEBHOOK EVENT] Processed one-click unsubscribe for {email}")
        return {"status": "processed", "action": "suppressed_and_revoked", "email": email}

    return {"status": "ignored", "reason": f"Event type '{event_type}' requires no suppression action"}

def process_batch_esp_webhooks(db: Session, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Batch webhook processor for handling arrays of ESP event hooks."""
    results = []
    for evt in events:
        res = process_esp_webhook_event(db, evt)
        results.append(res)
    return results
