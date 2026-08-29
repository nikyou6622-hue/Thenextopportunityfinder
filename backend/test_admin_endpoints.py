import pytest
from fastapi.testclient import TestClient
from backend.app.main import app, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD, _ensure_default_admin_account
from backend.app.db.database import SessionLocal
from backend.app.db.models import UserModel

@pytest.fixture(scope="module")
def client():
    _ensure_default_admin_account()
    with TestClient(app) as c:
        yield c

def get_admin_headers(client):
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_INITIAL_PASSWORD})
    token = res.json()["token"]
    return {"Authorization": f"Bearer {token}"}

def get_regular_user_headers(client):
    client.post("/api/auth/register", json={
        "full_name": "Regular Candidate Test",
        "email": "regular_candidate_test@example.com",
        "password": "Password123!",
        "target_role": "Software Engineer",
        "experience_level": "Entry Level"
    })
    res = client.post("/api/auth/login", json={"email": "regular_candidate_test@example.com", "password": "Password123!"})
    token = res.json()["token"]
    return {"Authorization": f"Bearer {token}"}

def test_admin_account_provision_and_login(client):
    """Verifies default admin account credentials and role tagging."""
    login_res = client.post("/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_INITIAL_PASSWORD
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    data = login_res.json()
    assert data["success"] is True
    assert data["user"]["is_admin"] is True
    assert data["user"]["role"] == "admin"

def test_non_admin_token_returns_403(client):
    """VERIFICATION PROOF: Non-admin users are strictly rejected with 403 Forbidden."""
    reg_headers = get_regular_user_headers(client)
    
    res1 = client.get("/api/admin/stats", headers=reg_headers)
    assert res1.status_code == 403, f"Expected 403, got {res1.status_code}: {res1.text}"
    
    res2 = client.get("/api/admin/users", headers=reg_headers)
    assert res2.status_code == 403, f"Expected 403, got {res2.status_code}: {res2.text}"

    res3 = client.get("/api/admin/scraper/status", headers=reg_headers)
    assert res3.status_code == 403, f"Expected 403, got {res3.status_code}: {res3.text}"

def test_admin_get_system_stats(client):
    """Verifies GET /api/admin/stats returns KPIs and telemetry for admin."""
    headers = get_admin_headers(client)
    res = client.get("/api/admin/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "kpis" in data

def test_admin_get_all_users(client):
    """Verifies GET /api/admin/users returns registered candidates."""
    headers = get_admin_headers(client)
    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "users" in data
    assert len(data["users"]) >= 1

def test_admin_scraper_concurrency_lock(client):
    """VERIFICATION PROOF: Scraper concurrency guard prevents overlapping runs with 409 Conflict."""
    headers = get_admin_headers(client)
    from backend.app.main import _SCRAPER_RUN_STATE, _SCRAPER_LOCK
    
    # Simulate active run
    with _SCRAPER_LOCK:
        _SCRAPER_RUN_STATE["in_progress"] = True
        _SCRAPER_RUN_STATE["active_source"] = "mnc"
    
    try:
        res = client.post("/api/admin/scraper/run/mnc", headers=headers)
        assert res.status_code == 409, f"Expected 409 Conflict, got {res.status_code}: {res.text}"
        assert "already in progress" in res.json()["detail"]
    finally:
        with _SCRAPER_LOCK:
            _SCRAPER_RUN_STATE["in_progress"] = False
            _SCRAPER_RUN_STATE["active_source"] = None

def test_admin_user_action_and_audit_log(client):
    """VERIFICATION PROOF: Admin user actions write audit logs to admin_audit_log."""
    headers = get_admin_headers(client)
    db = SessionLocal()
    target_user = db.query(UserModel).filter(UserModel.email == "regular_candidate_test@example.com").first()
    assert target_user is not None
    user_id = target_user.id
    db.close()

    # Action 1: Upgrade to Pro
    res1 = client.post(f"/api/admin/user/{user_id}/action", json={"action": "upgrade_pro"}, headers=headers)
    assert res1.status_code == 200
    assert res1.json()["user"]["subscription_tier"] == "pro"

    # Action 2: Suspend User
    res2 = client.post(f"/api/admin/user/{user_id}/action", json={"action": "suspend"}, headers=headers)
    assert res2.status_code == 200
    assert res2.json()["user"]["is_suspended"] is True

    # Verify Audit Logs
    audit_res = client.get("/api/admin/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()["audit_logs"]
    actions = [l["action"] for l in logs]
    assert "upgrade_pro" in actions
    assert "suspend" in actions

def test_admin_system_health_and_deploy_status(client):
    """Verifies system health and deploy telemetry endpoints."""
    headers = get_admin_headers(client)
    
    health_res = client.get("/api/admin/system/health", headers=headers)
    assert health_res.status_code == 200
    assert "database" in health_res.json()
    assert "llm_engine" in health_res.json()

    deploy_res = client.get("/api/admin/deploy/status", headers=headers)
    assert deploy_res.status_code == 200
    assert "commit_sha" in deploy_res.json()
