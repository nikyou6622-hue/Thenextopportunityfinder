import os
import sys
import pytest
from fastapi.testclient import TestClient

os.environ['USE_SQLITE_TEST'] = '1'
sys.path.insert(0, '.')

from backend.app.main import app, _hash_password, _store_otp_supabase
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import UserModel, ProfileModel

client = TestClient(app)

def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Create test user
    db = SessionLocal()
    u = UserModel(
        full_name="Nikremix Candidate",
        email="nikremix2266@gmail.com",
        password_hash=_hash_password("753951"),
        is_active=True,
        is_email_verified=True
    )
    db.add(u)
    db.commit()
    db.close()

def test_1_valid_login():
    """Verify standard email & password login returns 200 OK and token."""
    res = client.post("/api/auth/login", json={
        "email": "nikremix2266@gmail.com",
        "password": "753951"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "token" in data and data["token"].startswith("nof_tok_")
    assert data["user"]["email"] == "nikremix2266@gmail.com"

def test_2_case_insensitive_and_whitespace_email_login():
    """Verify uppercase/whitespace emails resolve cleanly."""
    res = client.post("/api/auth/login", json={
        "email": "  NIKREMIX2266@GMAIL.COM  ",
        "password": "753951"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True

def test_3_pending_signup_auto_provisioning():
    """Verify candidate who registered but did not enter 6-digit OTP can still log in with their password."""
    pending_email = "unverified_candidate@dev.io"
    pwd = "MySecretPassword123!"
    
    _store_otp_supabase(pending_email, "999888", purpose="email_verification", payload={
        "full_name": "Unverified Candidate",
        "email": pending_email,
        "password_hash": _hash_password(pwd),
        "target_role": "Full Stack Engineer",
        "experience_level": "Entry Level",
        "consent_given": True
    })

    # Candidate logs in with their password
    res = client.post("/api/auth/login", json={
        "email": pending_email,
        "password": pwd
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["email"] == pending_email

def test_4_invalid_password_returns_401():
    """Verify incorrect password returns 401 Unauthorized."""
    res = client.post("/api/auth/login", json={
        "email": "nikremix2266@gmail.com",
        "password": "wrong_password_xyz"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

if __name__ == "__main__":
    setup_module()
    test_1_valid_login()
    print("PASS: Test 1 - Valid email & password login")
    test_2_case_insensitive_and_whitespace_email_login()
    print("PASS: Test 2 - Case-insensitive & whitespace email login")
    test_3_pending_signup_auto_provisioning()
    print("PASS: Test 3 - Pending signup auto-provisioning login")
    test_4_invalid_password_returns_401()
    print("PASS: Test 4 - Invalid password returns 401")
    print("ALL AUTHENTICATION TESTS PASSED!")
