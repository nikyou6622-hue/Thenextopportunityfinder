import datetime
import logging
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from standalone_email_agent.db_models import EmailConsentModel, EmailSendModel, EmailSuppressionModel
from standalone_email_agent.consent_manager import can_send_email, get_user_consent_summary
from standalone_email_agent.gmail_esp_client import EmailTransportClient
from standalone_email_agent.templates import render_job_digest, render_re_engagement, render_product_announcement

logger = logging.getLogger("standalone_email_agent.agent6")

class Agent6EmailMarketing:
    """
    Agent 6: Batch Marketing Email Agent.
    Handles compliant batch email delivery for NextOpportunityFinder.
    - Zero-hallucination job match digests (verified live link_status == 'live')
    - Re-engagement nudges for dormant users (capped once per 30 days)
    - Manual admin product announcement campaigns (preview & confirmation step)
    - Strict consent checking and suppression list enforcement
    - Full email_sends audit trail logging
    """

    def __init__(self, provider: str = None, api_key: str = None):
        self.transport = EmailTransportClient(provider=provider, api_key=api_key)

    def log_send_attempt(
        self,
        db: Session,
        user_id: int,
        email: str,
        template: str,
        status: str,
        esp_message_id: str = None,
        error_detail: str = None
    ) -> EmailSendModel:
        """Records send execution outcome in the email_sends audit trail."""
        log_entry = EmailSendModel(
            user_id=user_id,
            email=email.lower().strip(),
            template=template,
            sent_at=datetime.datetime.now(datetime.timezone.utc),
            status=status,
            esp_message_id=esp_message_id,
            error_detail=error_detail
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    def run_job_digest_batch(
        self,
        db: Session,
        user_jobs_provider_func,
        max_users: int = 100,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Executes a job digest batch send for users with active 'job_alerts' consent.
        `user_jobs_provider_func(db, email)` returns dict: {"name": str, "user_id": int, "matches": [job_dicts]}
        """
        logger.info("Starting Batch Marketing Job Digest run...")
        
        # Verify sending domain before batch
        if not dry_run and not self.transport.verify_domain_compliance():
            raise RuntimeError("Sending domain verification failed. Aborting batch job digest.")

        # Query all granted consents for job_alerts
        consents = db.query(EmailConsentModel).filter(
            EmailConsentModel.consent_type == "job_alerts",
            EmailConsentModel.revoked_at.is_(None)
        ).limit(max_users).all()

        eligible_messages = []
        suppressed_count = 0
        no_consent_count = 0
        dead_links_excluded = 0

        for consent in consents:
            email = consent.email
            can_send, reason = can_send_email(db, email, "job_alerts")
            
            if not can_send:
                if "suppression" in reason:
                    suppressed_count += 1
                    self.log_send_attempt(db, consent.user_id, email, "job_digest", "suppressed", error_detail=reason)
                else:
                    no_consent_count += 1
                continue

            # Fetch candidate matches from provider function
            candidate_data = user_jobs_provider_func(db, email)
            user_name = candidate_data.get("name", email.split("@")[0].capitalize())
            user_id = candidate_data.get("user_id", consent.user_id)
            raw_matches = candidate_data.get("matches", [])

            # Filter ONLY live jobs (Zero Hallucination Standard)
            live_matches = [j for j in raw_matches if j.get("link_status") == "live"]
            dead_links_excluded += (len(raw_matches) - len(live_matches))

            if not live_matches:
                logger.info(f"Skipping digest for {email}: 0 live verified matches available.")
                continue

            rendered = render_job_digest(user_name, email, live_matches)

            eligible_messages.append({
                "to_email": email,
                "user_id": user_id,
                "template": "job_digest",
                "subject": rendered["subject"],
                "html_body": rendered["html_body"],
                "text_body": rendered["text_body"],
                "unsubscribe_url": rendered["unsubscribe_url"]
            })

        if dry_run:
            logger.info(f"[DRY-RUN] Prepared {len(eligible_messages)} digest emails (Suppressed: {suppressed_count})")
            return {
                "dry_run": True,
                "total_eligible": len(eligible_messages),
                "suppressed_blocked": suppressed_count,
                "dead_links_excluded": dead_links_excluded,
                "staged_messages": eligible_messages
            }

        # Execute batch transport
        results = self.transport.send_batch_emails(eligible_messages)
        sent_count = 0
        failed_count = 0

        for res in results:
            status = "sent" if res["success"] else "failed"
            if res["success"]:
                sent_count += 1
            else:
                failed_count += 1

            self.log_send_attempt(
                db,
                user_id=res["user_id"],
                email=res["to_email"],
                template="job_digest",
                status=status,
                esp_message_id=res.get("esp_message_id"),
                error_detail=res.get("error_detail")
            )

        return {
            "dry_run": False,
            "total_processed": len(eligible_messages),
            "sent_success": sent_count,
            "failed": failed_count,
            "suppressed_blocked": suppressed_count,
            "dead_links_excluded": dead_links_excluded
        }

    def run_re_engagement_batch(
        self,
        db: Session,
        dormant_users_provider_func,
        max_frequency_days: int = 30,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Sends re-engagement emails to dormant users inactive for N days.
        Prevents nagging by enforcing max 1 re-engagement send per 30 days per user.
        """
        logger.info("Starting Re-Engagement campaign batch...")
        dormant_users = dormant_users_provider_func(db) # List of dicts: {"user_id": int, "email": str, "name": str, "last_seen_days": int, "skills": []}

        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=max_frequency_days)
        eligible_messages = []
        nag_prevented_count = 0

        for user in dormant_users:
            email = user["email"]
            can_send, reason = can_send_email(db, email, "re_engagement")
            if not can_send:
                continue

            # Throttle check: Check if email_sends already has a re_engagement entry in last 30 days
            recent_send = db.query(EmailSendModel).filter(
                EmailSendModel.email == email.lower().strip(),
                EmailSendModel.template == "re_engagement",
                EmailSendModel.sent_at >= cutoff_date
            ).first()

            if recent_send:
                nag_prevented_count += 1
                logger.info(f"Skipping re-engagement for {email}: Already sent within past {max_frequency_days} days.")
                continue

            rendered = render_re_engagement(
                user_name=user.get("name", "Engineer"),
                user_email=email,
                top_skills=user.get("skills", []),
                last_seen_days=user.get("last_seen_days", 14)
            )

            eligible_messages.append({
                "to_email": email,
                "user_id": user.get("user_id"),
                "template": "re_engagement",
                "subject": rendered["subject"],
                "html_body": rendered["html_body"],
                "text_body": rendered["text_body"],
                "unsubscribe_url": rendered["unsubscribe_url"]
            })

        if dry_run:
            return {
                "dry_run": True,
                "total_eligible": len(eligible_messages),
                "throttled_nag_prevented": nag_prevented_count,
                "messages": eligible_messages
            }

        results = self.transport.send_batch_emails(eligible_messages)
        for res in results:
            status = "sent" if res["success"] else "failed"
            self.log_send_attempt(
                db,
                user_id=res["user_id"],
                email=res["to_email"],
                template="re_engagement",
                status=status,
                esp_message_id=res.get("esp_message_id"),
                error_detail=res.get("error_detail")
            )

        return {
            "dry_run": False,
            "total_sent": len([r for r in results if r["success"]]),
            "throttled_nag_prevented": nag_prevented_count
        }

    def preview_product_announcement(
        self,
        db: Session,
        announcement_title: str,
        announcement_body: str,
        consent_type: str = "product_updates"
    ) -> Dict[str, Any]:
        """
        Prepares a safe preview + recipient count calculation before confirming an announcement send.
        """
        consents = db.query(EmailConsentModel).filter(
            EmailConsentModel.consent_type == consent_type,
            EmailConsentModel.revoked_at.is_(None)
        ).all()

        eligible_count = 0
        suppressed_count = 0

        for c in consents:
            can_send, _ = can_send_email(db, c.email, consent_type)
            if can_send:
                eligible_count += 1
            else:
                suppressed_count += 1

        sample_preview = render_product_announcement(
            user_name="Candidate",
            user_email="sample@example.com",
            title=announcement_title,
            announcement_body=announcement_body
        )

        return {
            "title": announcement_title,
            "consent_type": consent_type,
            "eligible_recipient_count": eligible_count,
            "suppressed_blocked_count": suppressed_count,
            "subject_preview": sample_preview["subject"],
            "html_preview": sample_preview["html_body"],
            "requires_admin_confirmation": True
        }

    def execute_product_announcement(
        self,
        db: Session,
        announcement_title: str,
        announcement_body: str,
        cta_url: str = "https://nextopportunityfinder.com",
        admin_confirmed: bool = False
    ) -> Dict[str, Any]:
        """
        Executes a manual admin product announcement campaign after explicit confirmation.
        """
        if not admin_confirmed:
            raise PermissionError("Admin confirmation required before executing batch announcement!")

        consents = db.query(EmailConsentModel).filter(
            EmailConsentModel.consent_type == "product_updates",
            EmailConsentModel.revoked_at.is_(None)
        ).all()

        eligible_messages = []
        for c in consents:
            email = c.email
            can_send, _ = can_send_email(db, email, "product_updates")
            if not can_send:
                continue

            rendered = render_product_announcement(
                user_name=email.split("@")[0].capitalize(),
                user_email=email,
                title=announcement_title,
                announcement_body=announcement_body,
                cta_url=cta_url
            )

            eligible_messages.append({
                "to_email": email,
                "user_id": c.user_id,
                "template": "product_announcement",
                "subject": rendered["subject"],
                "html_body": rendered["html_body"],
                "text_body": rendered["text_body"],
                "unsubscribe_url": rendered["unsubscribe_url"]
            })

        results = self.transport.send_batch_emails(eligible_messages)
        for res in results:
            status = "sent" if res["success"] else "failed"
            self.log_send_attempt(
                db,
                user_id=res["user_id"],
                email=res["to_email"],
                template="product_announcement",
                status=status,
                esp_message_id=res.get("esp_message_id"),
                error_detail=res.get("error_detail")
            )

        return {
            "title": announcement_title,
            "total_sent": len([r for r in results if r["success"]]),
            "total_failed": len([r for r in results if not r["success"]])
        }
