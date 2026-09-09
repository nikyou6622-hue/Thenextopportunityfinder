import pytest
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from standalone_email_agent.db_models import Base, EmailConsentModel, EmailSuppressionModel, EmailSendModel
from standalone_email_agent.consent_manager import grant_consent, revoke_consent, add_suppression, can_send_email
from standalone_email_agent.webhook_handler import process_esp_webhook_event
from standalone_email_agent.agent6_email_marketing import Agent6EmailMarketing
from standalone_email_agent.templates import render_job_digest

@pytest.fixture
def db_session():
    """Creates a temporary in-memory SQLite DB for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_consent_filtering(db_session):
    """
    Consent test: An address with no email_consent row for a given type
    never receives that type of email.
    """
    user_email = "no_consent_user@example.com"
    
    # Check consent for job_alerts without adding consent row
    can_send, reason = can_send_email(db_session, user_email, "job_alerts")
    assert can_send is False
    assert "No active, granted consent" in reason

    # Now grant product_updates consent but NOT job_alerts
    grant_consent(db_session, user_email, consent_type="product_updates")
    
    # Still blocked for job_alerts
    can_send_alerts, _ = can_send_email(db_session, user_email, "job_alerts")
    assert can_send_alerts is False

    # Approved for product_updates
    can_send_updates, _ = can_send_email(db_session, user_email, "product_updates")
    assert can_send_updates is True

def test_suppression_override(db_session):
    """
    Suppression test: An address in email_suppression NEVER receives any email,
    even with valid consent recorded (Suppression wins!).
    """
    user_email = "suppressed_user@example.com"
    
    # Grant active consent
    grant_consent(db_session, user_email, consent_type="job_alerts")
    can_send_before, _ = can_send_email(db_session, user_email, "job_alerts")
    assert can_send_before is True

    # Now add to suppression list
    add_suppression(db_session, user_email, reason="unsubscribed")

    # Consent still exists in table, but suppression OVERRIDES it
    can_send_after, reason = can_send_email(db_session, user_email, "job_alerts")
    assert can_send_after is False
    assert "present in email_suppression" in reason

def test_dead_link_filtering(db_session):
    """
    Dead-link test: A digest never includes a job whose link_status isn't 'live'.
    Zero-hallucination standard.
    """
    user_email = "candidate@example.com"
    matched_jobs = [
        {
            "company": "Live Corp",
            "role_title": "Backend Engineer",
            "link_status": "live",
            "apply_url": "https://livecorp.com/careers/1"
        },
        {
            "company": "Dead Link Inc",
            "role_title": "Frontend Engineer",
            "link_status": "dead",
            "apply_url": "https://deadlink.com/careers/2"
        },
        {
            "company": "Expired LLC",
            "role_title": "DevOps Engineer",
            "link_status": "redirected",
            "apply_url": "https://expired.com/careers/3"
        }
    ]

    rendered = render_job_digest("Candidate", user_email, matched_jobs)

    # Only "Live Corp" must appear in text & html bodies
    assert "Live Corp" in rendered["text_body"]
    assert "Dead Link Inc" not in rendered["text_body"]
    assert "Expired LLC" not in rendered["text_body"]
    assert "1 Verified Job Matches" in rendered["subject"]

def test_rate_limiting_and_batching(db_session):
    """
    Rate-limit test: Batch send executes smoothly with configured provider rate limit.
    """
    agent = Agent6EmailMarketing(provider="mock")
    messages = [
        {"to_email": f"user{i}@example.com", "subject": f"Test {i}", "html_body": "<p>Test</p>"}
        for i in range(5)
    ]
    
    results = agent.transport.send_batch_emails(messages, rate_per_min=600) # fast rate for test
    assert len(results) == 5
    assert all(r["success"] is True for r in results)

def test_unsubscribe_webhook_flow(db_session):
    """
    Unsubscribe test: Webhook event for unsubscribe creates suppression row
    and blocks subsequent send attempt.
    """
    user_email = "optout_user@example.com"
    grant_consent(db_session, user_email, consent_type="job_alerts")
    assert can_send_email(db_session, user_email, "job_alerts")[0] is True

    # Webhook triggers unsubscribe event
    webhook_payload = {
        "type": "unsubscribe",
        "email": user_email,
        "consent_type": "job_alerts"
    }

    res = process_esp_webhook_event(db_session, webhook_payload)
    assert res["status"] == "processed"
    assert res["action"] in ["suppression_added", "suppressed_and_revoked"]

    # Second send attempt to this address MUST be blocked!
    can_send_second, reason = can_send_email(db_session, user_email, "job_alerts")
    assert can_send_second is False
    assert "email_suppression" in reason or "No active" in reason
