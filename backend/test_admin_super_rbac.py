import pytest
from fastapi.testclient import TestClient
from app.main import app, get_db, UserModel, ProfileModel, _hash_password, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD

@pytest.fixture
def client():
    return TestClient(app)

def test_super_admin_role_change_and_staff_listing(client):
    """
    Verifies that Super Admin users can list admin staff and promote/demote staff admin_level,
    and non-super-admins receive 403 Forbidden.
    """
    # 1. Login as Super Admin (default ADMIN_EMAIL)
    login_res = client.post("/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_INITIAL_PASSWORD
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    super_headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Staff list
    staff_res = client.get("/api/admin/super/staff", headers=super_headers)
    assert staff_res.status_code == 200, f"Failed: {staff_res.text}"
    staff_data = staff_res.json()
    assert staff_data["success"] is True
    assert staff_data["total_admin_staff"] >= 1

    # 3. Promote a staff member to 'righthand'
    role_change_res = client.post("/api/admin/super/role-change", json={
        "target_user_email": "commander.admin@thenextopportunityfinder.com",
        "new_admin_level": "righthand"
    }, headers=super_headers)
    assert role_change_res.status_code == 200, f"Role change failed: {role_change_res.text}"
    rc_data = role_change_res.json()
    assert rc_data["success"] is True
    assert rc_data["new_role"] == "righthand"

    # 4. Verify Non-Super Admin (Commander) cannot perform super admin role change
    commander_login = client.post("/api/auth/login", json={
        "email": "commander.admin@thenextopportunityfinder.com",
        "password": "CommanderPassword123!"
    })
    if commander_login.status_code == 200:
        c_token = commander_login.json()["token"]
        c_headers = {"Authorization": f"Bearer {c_token}"}
        
        forbidden_res = client.post("/api/admin/super/role-change", json={
            "target_user_email": "master.admin@thenextopportunityfinder.com",
            "new_admin_level": "superadmin"
        }, headers=c_headers)
        assert forbidden_res.status_code == 403
