import pytest
from fastapi.testclient import TestClient
from backend.app.main import app, _ensure_default_admin_account
from backend.app.db.database import SessionLocal
from backend.app.db.models import UserModel, ProfileModel, SubscriptionModel, PaymentOrderModel

@pytest.fixture(scope="module")
def client():
    _ensure_default_admin_account()
    with TestClient(app) as c:
        yield c

def get_token_for_user(client, email, password):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return {"Authorization": f"Bearer {res.json()['token']}"}

def test_three_tier_admin_accounts_created(client):
    """VERIFICATION PROOF: Ensures default 3-tier admin accounts exist with proper roles."""
    db = SessionLocal()
    commander = db.query(UserModel).filter(UserModel.email == "commander.admin@thenextopportunityfinder.com").first()
    righthand = db.query(UserModel).filter(UserModel.email == "righthand.admin@thenextopportunityfinder.com").first()
    master = db.query(UserModel).filter(UserModel.email == "master.admin@thenextopportunityfinder.com").first()
    db.close()

    assert commander is not None and commander.is_admin is True
    assert commander.admin_level == "commander"
    assert righthand is not None and righthand.is_admin is True
    assert righthand.admin_level == "righthand"
    assert master is not None and master.is_admin is True
    assert master.admin_level == "master"

def test_tier1_commander_summary_endpoint(client):
    """VERIFICATION PROOF: Tier 1 Commander summary returns Cashfree revenue, live error feed, and support inbox."""
    headers = get_token_for_user(client, "commander.admin@thenextopportunityfinder.com", "CommanderPass2026!")
    res = client.get("/api/admin/tier1/commander-summary", headers=headers)
    assert res.status_code == 200, f"Commander summary failed: {res.text}"
    data = res.json()
    assert "total_revenue_collected" in data
    assert "payment_records" in data
    assert "live_error_feed" in data
    assert "support_inbox" in data
    assert "scrapers_status" in data

def test_support_query_submission_and_resolution(client):
    """VERIFICATION PROOF: Support ticket inbox submission & Commander resolution."""
    # 1. Candidate submits support query
    sub_res = client.post("/api/support/queries", json={
        "user_email": "candidate.test.support@dev.io",
        "user_name": "Test Candidate",
        "subject": "Payment Receipt Inquiry",
        "message": "Can I get an invoice for my Cashfree Pro subscription?"
    })
    assert sub_res.status_code == 200
    q_id = sub_res.json()["query_id"]

    # 2. Commander responds and resolves
    headers = get_token_for_user(client, "commander.admin@thenextopportunityfinder.com", "CommanderPass2026!")
    resp_res = client.post(f"/api/admin/tier1/support/{q_id}/respond", headers=headers, json={
        "response": "Invoice sent to your registered email address."
    })
    assert resp_res.status_code == 200
    assert resp_res.json()["success"] is True

def test_tier2_righthand_user_creation_and_email_announcement(client):
    """VERIFICATION PROOF: Tier 2 Right Hand manual support user provisioning and announcement email queue."""
    import uuid
    headers = get_token_for_user(client, "righthand.admin@thenextopportunityfinder.com", "RightHandPass2026!")
    
    unique_email = f"tier2.user.{uuid.uuid4().hex[:6]}@example.com"
    # 1. Create support user
    create_res = client.post("/api/admin/tier2/users/create", headers=headers, json={
        "email": unique_email,
        "full_name": "Tier2 Provisioned User"
    })
    assert create_res.status_code == 200
    assert create_res.json()["subscription_tier"] == "free"

    # 2. Send platform announcement with unsubscribe footer
    ann_res = client.post("/api/admin/tier2/email/announcement", headers=headers, json={
        "subject": "Platform Maintenance & Update",
        "body": "We have updated the job matching engine."
    })
    assert ann_res.status_code == 200
    assert ann_res.json()["recipient_count"] >= 1

def test_tier2_jobs_explorer_and_expired_cleanup(client):
    """VERIFICATION PROOF: Tier 2 deep database job catalog view and expired-job cleanup pass."""
    headers = get_token_for_user(client, "righthand.admin@thenextopportunityfinder.com", "RightHandPass2026!")
    jobs_res = client.get("/api/admin/tier2/jobs", headers=headers)
    assert jobs_res.status_code == 200
    assert "jobs" in jobs_res.json()

    cleanup_res = client.post("/api/admin/tier2/jobs/cleanup-expired", headers=headers)
    assert cleanup_res.status_code == 200
    assert "expired_jobs_removed" in cleanup_res.json()

def test_tier3_master_admin_reconciliation(client):
    """VERIFICATION PROOF: Tier 3 Master Admin ongoing reconciliation engine continuous Bug 1 cross-check."""
    headers = get_token_for_user(client, "master.admin@thenextopportunityfinder.com", "MasterAdminPass2026!")
    res = client.get("/api/admin/tier3/reconciliation", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "reconciliation_status" in data
    assert "illegitimate_accounts_count" in data
    assert "data_freshness" in data
    assert "scraper_fleet_health" in data
    assert data["illegitimate_accounts_count"] == 0, f"Expected 0 illegitimate accounts after Bug 1 audit, got: {data['discrepancies']}"

def test_role_scoped_forbidden_enforcement(client):
    """VERIFICATION PROOF: Strict role-based 403 Forbidden enforcement across 3 tiers."""
    righthand_headers = get_token_for_user(client, "righthand.admin@thenextopportunityfinder.com", "RightHandPass2026!")
    commander_headers = get_token_for_user(client, "commander.admin@thenextopportunityfinder.com", "CommanderPass2026!")

    # Right Hand (Tier 2) trying to access Master Admin (Tier 3) reconciliation -> 403
    res1 = client.get("/api/admin/tier3/reconciliation", headers=righthand_headers)
    assert res1.status_code == 403

    # Commander (Tier 1) trying to access Right Hand (Tier 2) user creation -> 403
    res2 = client.post("/api/admin/tier2/users/create", headers=commander_headers, json={"email": "forbidden@test.com"})
    assert res2.status_code == 403
