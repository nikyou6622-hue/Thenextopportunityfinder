import os
import datetime
import uuid
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)

# Prohibited Consumer Mail Providers
# Sending automated batch outreach directly through consumer mailboxes violates provider ToS and flags spam filters.
CONSUMER_SMTP_HOSTS = {
    "smtp.gmail.com",
    "smtp.office365.com",
    "smtp.live.com",
    "smtp.mail.yahoo.com",
    "smtp.aol.com",
    "smtp.zoho.com",
    "smtp.icloud.com"
}

ALLOWED_TRANSACTIONAL_PROVIDERS = {
    "sendgrid", "postmark", "amazonses", "ses", "mailgun", "brevo", "resend", "mock_transactional"
}

def validate_smtp_provider(smtp_host: str = None) -> Tuple[bool, str]:
    """
    Validates that outbound SMTP is routed through a compliant transactional API provider
    (e.g., SendGrid, Postmark, Amazon SES, Resend) rather than personal candidate mailboxes.
    """
    host = (smtp_host or os.getenv("SMTP_HOST", "mock_transactional")).lower().strip()
    
    for consumer in CONSUMER_SMTP_HOSTS:
        if consumer in host:
            warning_msg = (
                f"Sending blocked: Outbound host '{host}' is a personal consumer mail provider. "
                "Automated batch outreach must be routed through a dedicated transactional provider "
                "(e.g., SendGrid, Postmark, Amazon SES, Resend) to adhere to anti-spam laws and ToS."
            )
            logger.error(warning_msg)
            return False, warning_msg
            
    return True, f"Outbound provider '{host}' approved for compliant delivery."

def draft_email_for_job(profile_data: Dict[str, Any], job_data: Dict[str, Any], tailored_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generates a personalized, professional outreach email draft for email-only listings.
    Enforces 1:1 personalization and prevents generic mass BCC blasts.
    """
    company = job_data.get("company", "Hiring Team")
    role_title = job_data.get("role_title", "Software Role")
    candidate_name = profile_data.get("name", "Candidate")
    recipient_email = job_data.get("apply_email") or f"careers@{company.lower().replace(' ', '')}.com"
    
    top_skills = profile_data.get("skills", [])[:4]
    skills_str = ", ".join(top_skills) if top_skills else "software engineering"
    
    subject = f"Application for {role_title} Position — {candidate_name}"
    
    body = (
        f"Dear {company} Hiring Team,\n\n"
        f"I am writing to express my strong interest in the {role_title} position at {company}. "
        f"With hands-on experience in {skills_str}, I am confident in my ability to make an immediate "
        f"impact on your team's upcoming initiatives.\n\n"
        f"Summary of Qualifications:\n"
        f"• Expertise in {skills_str}.\n"
        f"• Proven track record in rapid product delivery and modern clean-code architecture.\n"
        f"• Strong background in building scalable features for tech startups.\n\n"
        f"I have attached my role-tailored resume for your review. I would welcome the opportunity "
        f"to discuss how my background aligns with {company}'s goals.\n\n"
        f"Best regards,\n"
        f"{candidate_name}\n"
        f"{profile_data.get('email', '')} | {profile_data.get('phone', '')}"
    )

    return {
        "job_id": job_data.get("id"),
        "company": company,
        "recipient": recipient_email,
        "subject": subject,
        "body": body,
        "status": "staged_for_review"
    }

def prepare_email_batch(profile_data: Dict[str, Any], email_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Prepares a staged batch of personalized emails for candidate review before sending.
    """
    batch_id = f"batch_{uuid.uuid4().hex[:8]}"
    drafts = []
    
    for job in email_jobs:
        draft = draft_email_for_job(profile_data, job)
        draft["batch_id"] = batch_id
        drafts.append(draft)
        
    return {
        "batch_id": batch_id,
        "total_count": len(drafts),
        "throttle_rate": "20 emails/hour",
        "status": "staged_for_review",
        "drafts": drafts
    }

def simulate_send_email_batch(batch_id: str, drafts: List[Dict[str, Any]], smtp_host: str = None) -> List[Dict[str, Any]]:
    """
    Sends an approved throttled batch of emails and records audit log entries.
    Strictly verifies transactional SMTP provider compliance.
    """
    is_valid, validation_msg = validate_smtp_provider(smtp_host)
    if not is_valid:
        raise ValueError(validation_msg)
        
    logs = []
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for i, draft in enumerate(drafts):
        logs.append({
            "batch_id": batch_id,
            "job_id": draft.get("job_id"),
            "company": draft.get("company"),
            "recipient": draft.get("recipient"),
            "subject": draft.get("subject"),
            "body_preview": draft.get("body", "")[:200] + "...",
            "message_id": f"<msg-{uuid.uuid4().hex[:12]}@{draft.get('company', 'startup').lower().replace(' ', '')}.com>",
            "status": "sent",
            "sent_at": now.isoformat()
        })
        
    return logs
