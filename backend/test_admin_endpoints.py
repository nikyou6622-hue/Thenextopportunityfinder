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

def test_admin_account_provision_and_login(client):
    """Verifies default admin account credentials and role tagging."""
    # 1. Login with adityanikt@gmail.com and password 753951
    login_res = client.post("/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_INITIAL_PASSWORD
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    data = login_res.json()
    assert data["success"] is True
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["is_admin"] is True
    assert data["user"]["role"] == "admin"
    assert "token" in data

def test_admin_get_system_stats(client):
    """Verifies GET /api/admin/stats returns KPIs and 8-agent health telemetry."""
    res = client.get("/api/admin/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["admin_email"] == ADMIN_EMAIL
    assert "kpis" in data
    assert data["kpis"]["total_registered_users"] >= 1
    assert "agents_telemetry" in data
    assert len(data["agents_telemetry"]) == 8

def test_admin_get_all_users(client):
    """Verifies GET /api/admin/users returns registered candidates."""
    res = client.get("/api/admin/users")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "users" in data
    assert len(data["users"]) >= 1
    admin_user = next((u for u in data["users"] if u["email"] == ADMIN_EMAIL), None)
    assert admin_user is not None
    assert admin_user["is_admin"] is True

def test_admin_broadcast_announcement(client):
    """Verifies POST /api/admin/broadcast-announcement."""
    res = client.post("/api/admin/broadcast-announcement", json={
        "title": "500+ New Openings Verified",
        "message": "Swiggy & Microsoft internships are now live."
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["title"] == "500+ New Openings Verified"

def test_admin_trigger_scan_endpoint(client):
    """Verifies POST /api/admin/trigger-scan returns on-demand scraper metrics."""
    res = client.post("/api/admin/trigger-scan")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "message" in data
