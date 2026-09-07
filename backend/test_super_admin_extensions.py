import pytest
import datetime
from fastapi.testclient import TestClient
from backend.app.main import app, _ensure_default_admin_account
from backend.app.db.database import SessionLocal
from backend.app.db.models import (
    UserModel, ProfileModel, SubscriptionModel, PaymentOrderModel,
    AdminPermissionModel, AdminLoginLogModel, AdminLockdownModel, AdminAuditLogModel
)

@pytest.fixture(scope="module")
def client():
    _ensure_default_admin_account()
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def reset_lockdown_state():
    db = SessionLocal()
    try:
        db.query(AdminLockdownModel).filter(AdminLockdownModel.is_active == True).update({"is_active": False})
        db.query(AdminPermissionModel).delete()
        db.commit()
    finally:
        db.close()

def get_token(client, email, password):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return {"Authorization": f"Bearer {res.json()['token']}"}

def test_deep_job_audit_view(client):
    """VERIFICATION: Super Admin / Tier 3+ GET /api/admin/super/jobs deep audit catalog."""
    headers = get_token(client, "master.admin@thenextopportunityfinder.com", "MasterAdminPass2026!")
    res = client.get("/api/admin/super/jobs?detailed=true", headers=headers)
    assert res.status_code == 200, f"Failed: {res.text}"
    data = res.json()
    assert "total_jobs" in data
    assert "jobs" in data
    assert data["detailed"] is True
    if len(data["jobs"]) > 0:
        j0 = data["jobs"][0]
        assert "source_platform" in j0
        assert "apply_url_raw" in j0
        assert "job_fingerprint" in j0

def test_granular_permission_delegation_and_override(client):
    """VERIFICATION: Granular permission grant allows Commander to run Tier 2 cleanup without full promotion."""
    super_headers = get_token(client, "admin@thenextopportunityfinder.com", "AdminCommander2026!")
    super_headers_reauth = {**super_headers, "X-Admin-Reauth-Code": "SUPER_REAUTH_2026"}
    
    commander_email = "commander.admin@thenextopportunityfinder.com"
    commander_headers = get_token(client, commander_email, "CommanderPass2026!")

    # 1. Commander attempts Tier 2 action -> Expect 403 Forbidden
    fail_res = client.post("/api/admin/tier2/jobs/cleanup-expired", headers=commander_headers)
    assert fail_res.status_code == 403

    # 2. Super Admin grants 'cleanup_expired_jobs' permission to Commander
    grant_res = client.post("/api/admin/super/permissions/grant", json={
        "target_admin_email": commander_email,
        "permission_key": "cleanup_expired_jobs"
    }, headers=super_headers_reauth)
    assert grant_res.status_code == 200, f"Grant failed: {grant_res.text}"

    # 3. Commander attempts Tier 2 action AGAIN -> Expect 200 OK (Surgical Override Success!)
    ok_res = client.post("/api/admin/tier2/jobs/cleanup-expired", headers=commander_headers)
    assert ok_res.status_code == 200, f"Permission override failed: {ok_res.text}"
    assert "expired_jobs_removed" in ok_res.json()

    # 4. Super Admin revokes permission
    revoke_res = client.post("/api/admin/super/permissions/revoke", json={
        "target_admin_email": commander_email,
        "permission_key": "cleanup_expired_jobs"
    }, headers=super_headers_reauth)
    assert revoke_res.status_code == 200

def test_forced_reauth_on_destructive_actions(client):
    """VERIFICATION: Destructive endpoints fail without X-Admin-Reauth-Code header."""
    super_headers = get_token(client, "admin@thenextopportunityfinder.com", "AdminCommander2026!")

    # Missing reauth header -> 401 Unauthorized
    res = client.post("/api/admin/super/role-change", json={
        "target_user_email": "righthand.admin@thenextopportunityfinder.com",
        "new_admin_level": "commander"
    }, headers=super_headers)
    assert res.status_code == 401
    assert "Re-Authentication Required" in res.json()["detail"]

    # Valid reauth header -> 200 OK
    headers_with_reauth = {**super_headers, "X-Admin-Reauth-Code": "SUPER_REAUTH_2026"}
    res_ok = client.post("/api/admin/super/role-change", json={
        "target_user_email": "righthand.admin@thenextopportunityfinder.com",
        "new_admin_level": "righthand"
    }, headers=headers_with_reauth)
    assert res_ok.status_code == 200

def test_unified_activity_feed_and_login_logs(client):
    """VERIFICATION: Unified chronological activity feed & admin login IP logs."""
    super_headers = get_token(client, "admin@thenextopportunityfinder.com", "AdminCommander2026!")

    # Activity Feed
    feed_res = client.get("/api/admin/super/activity-feed", headers=super_headers)
    assert feed_res.status_code == 200
    assert "activity_feed" in feed_res.json()

    # Login Logs
    logs_res = client.get("/api/admin/super/login-logs", headers=super_headers)
    assert logs_res.status_code == 200
    assert "login_logs" in logs_res.json()

def test_emergency_admin_lockdown_switch(client):
    """VERIFICATION: Super Admin Emergency Lockdown revokes all non-super admin sessions."""
    super_headers = get_token(client, "admin@thenextopportunityfinder.com", "AdminCommander2026!")
    super_headers_reauth = {**super_headers, "X-Admin-Reauth-Code": "SUPER_REAUTH_2026"}
    commander_headers = get_token(client, "commander.admin@thenextopportunityfinder.com", "CommanderPass2026!")

    # 1. Activate Lockdown
    lock_res = client.post("/api/admin/super/lockdown", json={"reason": "Audit Test Emergency Trigger"}, headers=super_headers_reauth)
    assert lock_res.status_code == 200
    assert "ACTIVATED" in lock_res.json()["message"]

    # 2. Commander attempts admin call during lockdown -> Expect 403 Lockdown Block
    cmd_res = client.get("/api/admin/tier1/commander-summary", headers=commander_headers)
    assert cmd_res.status_code == 403
    assert "Emergency Admin Access Lockdown Active" in cmd_res.json()["detail"]

    # 3. Super Admin lifts lockdown
    unlock_res = client.post("/api/admin/super/unlockdown", headers=super_headers_reauth)
    assert unlock_res.status_code == 200

    # 4. Commander call succeeds after unlock
    cmd_ok = client.get("/api/admin/tier1/commander-summary", headers=commander_headers)
    assert cmd_ok.status_code == 200
