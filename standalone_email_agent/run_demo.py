import json
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from standalone_email_agent.config import settings, verify_sending_domain
from standalone_email_agent.db_models import Base, EmailSendModel, EmailSuppressionModel
from standalone_email_agent.consent_manager import grant_consent, add_suppression, get_user_consent_summary
from standalone_email_agent.webhook_handler import process_esp_webhook_event
from standalone_email_agent.agent6_email_marketing import Agent6EmailMarketing

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("run_demo")

def mock_user_jobs_provider(db, email: str):
    """Mock job provider supplying candidates' live & dead match data."""
    if "alice" in email:
        return {
            "name": "Alice Sharma",
            "user_id": 101,
            "matches": [
                {
                    "company": "Swiggy",
                    "role_title": "Senior Backend Engineer",
                    "location": "Bengaluru (Hybrid)",
                    "match_score": 94.0,
                    "link_status": "live",
                    "apply_url_resolved": "https://swiggy.careers/jobs/101",
                    "required_skills": ["Python", "FastAPI", "Redis", "Distributed Systems"]
                },
                {
                    "company": "Razorpay",
                    "role_title": "Staff AI Engineer",
                    "location": "Bengaluru / Remote",
                    "match_score": 91.0,
                    "link_status": "live",
                    "apply_url_resolved": "https://razorpay.com/careers/202",
                    "required_skills": ["Python", "LLMs", "Vector DB", "System Design"]
                },
                {
                    "company": "Stale Startup",
                    "role_title": "SDE-1",
                    "location": "Remote",
                    "match_score": 88.0,
                    "link_status": "dead", # Excluded per Zero-Hallucination rule!
                    "apply_url_resolved": "https://stalestartup.com/deadlink"
                }
            ]
        }
    elif "bob" in email:
        return {
            "name": "Bob Verma",
            "user_id": 102,
            "matches": [
                {
                    "company": "Cred",
                    "role_title": "Frontend Architect",
                    "location": "Bengaluru",
                    "match_score": 96.0,
                    "link_status": "live",
                    "apply_url_resolved": "https://cred.club/careers/303",
                    "required_skills": ["React", "TypeScript", "Vite", "Performance"]
                }
            ]
        }
    else:
        return {"name": "Candidate", "user_id": 999, "matches": []}

def run_proof_demonstration():
    print("\n==========================================================================")
    print(" [AGENT 6: BATCH MARKETING EMAIL AGENT -- DEMONSTRATION & PROOF RUN]")
    print("==========================================================================\n")

    # 1. Initialize DB
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # 2. Check SPF / DKIM / DMARC Domain Authentication Status
    print("1. DOMAIN AUTHENTICATION VERIFICATION (SPF / DKIM / DMARC):")
    domain_status = verify_sending_domain()
    print(json.dumps(domain_status, indent=2))
    print()

    # 3. Seed Users & Consents
    print("2. SEEDING USER CONSENTS & SUPPRESSION:")
    user_alice = "alice@example.com"
    user_bob = "bob@example.com"
    user_charlie = "charlie_unsubscribed@example.com"
    user_no_consent = "dave_no_consent@example.com"

    grant_consent(db, user_alice, consent_type="job_alerts", user_id=101, source="signup_checkbox")
    grant_consent(db, user_bob, consent_type="job_alerts", user_id=102, source="settings_page")
    grant_consent(db, user_charlie, consent_type="job_alerts", user_id=103, source="signup_checkbox")

    # Add Charlie to suppression list upfront
    add_suppression(db, user_charlie, reason="unsubscribed")

    print(f"  * Granted 'job_alerts' consent to: {user_alice}")
    print(f"  * Granted 'job_alerts' consent to: {user_bob}")
    print(f"  * Granted 'job_alerts' consent to: {user_charlie} (BUT Suppressed in email_suppression!)")
    print(f"  * No consent record for: {user_no_consent}")
    print()

    # 4. Run Agent 6 Job Digest Batch Send
    print("3. RUNNING AGENT 6 JOB DIGEST BATCH PROCESS:")
    agent = Agent6EmailMarketing(provider="mock")
    digest_report = agent.run_job_digest_batch(db, user_jobs_provider_func=mock_user_jobs_provider, max_users=50, dry_run=False)
    print(json.dumps(digest_report, indent=2))
    print()

    # 5. Process ESP Webhook Event (Bounces / Complaints / Unsubscribes)
    print("4. PROCESSING ESP WEBHOOK EVENT (Near-Real-Time Bounce/Unsubscribe Auto-Suppression):")
    bounce_payload = {
        "event": "bounce",
        "email": "bob@example.com",
        "reason": "550 5.1.1 User Unknown"
    }
    webhook_res = process_esp_webhook_event(db, bounce_payload)
    print(f"  * Webhook payload processed: {json.dumps(bounce_payload)}")
    print(f"  * Webhook output: {json.dumps(webhook_res)}")
    print()

    # 6. Verify Second Send Blocked for Newly Suppressed User
    print("5. VERIFYING SECOND SEND ATTEMPT IS BLOCKED FOR RECENTLY SUPPRESSED USER:")
    digest_report_2 = agent.run_job_digest_batch(db, user_jobs_provider_func=mock_user_jobs_provider, max_users=50, dry_run=False)
    print(f"  * Second Run Suppressed Blocked Count: {digest_report_2['suppressed_blocked']}")
    print()

    # 7. Query email_sends Audit Trail
    print("6. AUDIT TRAIL LOGS (email_sends TABLE):")
    sends = db.query(EmailSendModel).all()
    for s in sends:
        print(f"  * [ID: {s.id}] User {s.user_id} ({s.email}) | Template: {s.template} | Status: {s.status} | MsgID: {s.esp_message_id} | Detail: {s.error_detail}")
    print()

    print("==========================================================================")
    print(" SUCCESS: ALL DEMONSTRATION STEPS COMPLETED!")
    print("==========================================================================\n")

if __name__ == "__main__":
    run_proof_demonstration()
