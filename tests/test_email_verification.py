import pytest
import os
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app, get_db, _store_otp, _validate_otp, _OTP_REGISTRY, _PENDING_REGISTRATIONS
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.db.models import UserModel

client = TestClient(app)

def setup_module(module):
    Base.metadata.create_all(bind=engine)

def test_otp_store_and_validate_logic():
    test_email = f"pytest_{uuid.uuid4().hex[:6]}@example.com"
    otp_code = "852963"
    
    _store_otp(test_email, otp_code, purpose="email_verification")
    assert test_email in _OTP_REGISTRY
    assert _OTP_REGISTRY[test_email]["otp"] == otp_code
    
    # Invalid token check
    assert _validate_otp(test_email, "000000") is False
    
    # Valid token check
    assert _validate_otp(test_email, otp_code) is True
    
    # Assert pop on validation success
    assert test_email not in _OTP_REGISTRY

def test_send_and_verify_otp_api_flow():
    target_email = f"candidate_{uuid.uuid4().hex[:6]}@dev.io"
    
    # 1. Send OTP
    response_send = client.post("/api/auth/send-otp", json={"email": target_email, "type": "login"})
    assert response_send.status_code == 200
    data_send = response_send.json()
    assert data_send["success"] is True
    assert data_send["demo_otp"] is None  # Code is hidden from API response
    
    # Retrieve real OTP from in-memory registry (simulating user reading email inbox)
    obtained_code = _OTP_REGISTRY[target_email]["otp"]
    
    # 2. Verify OTP
    response_verify = client.post("/api/auth/verify-otp", json={
        "email": target_email,
        "token": obtained_code,
        "full_name": "Verified Candidate User"
    })
    assert response_verify.status_code == 200
    data_verify = response_verify.json()
    assert data_verify["success"] is True
    assert data_verify["user"]["is_email_verified"] is True
    assert data_verify["user"]["email"] == target_email

def test_signup_deferred_account_creation_until_otp():
    signup_email = f"deferred_{uuid.uuid4().hex[:6]}@dev.io"
    
    # 1. Submit signup request
    res_signup = client.post("/api/auth/signup", json={
        "full_name": "Deferred Signup User",
        "email": signup_email,
        "password": "Password123!",
        "target_role": "Backend Engineer"
    })
    assert res_signup.status_code == 200
    data_signup = res_signup.json()
    assert data_signup["success"] is True
    assert data_signup["user"] is None  # User account NOT created in DB yet!
    
    # Verify user does not exist in DB yet
    db: Session = SessionLocal()
    user_before = db.query(UserModel).filter(UserModel.email == signup_email).first()
    db.close()
    assert user_before is None
    
    # Retrieve OTP from pending registrations cache
    assert signup_email in _PENDING_REGISTRATIONS
    otp_code = _PENDING_REGISTRATIONS[signup_email]["otp"]
    
    # 2. Verify OTP code to trigger account creation
    res_verify = client.post("/api/auth/verify-otp", json={
        "email": signup_email,
        "token": otp_code
    })
    assert res_verify.status_code == 200
    data_verify = res_verify.json()
    assert data_verify["success"] is True
    assert data_verify["user"]["email"] == signup_email
    assert data_verify["user"]["is_email_verified"] is True
    
    # Verify user NOW exists in DB and is verified
    db = SessionLocal()
    user_after = db.query(UserModel).filter(UserModel.email == signup_email).first()
    db.close()
    assert user_after is not None
    assert user_after.is_email_verified is True

def test_forgot_password_flow():
    forgot_email = f"forgot_{uuid.uuid4().hex[:6]}@dev.io"
    
    # Create an initial account via signup & OTP verification
    client.post("/api/auth/signup", json={
        "full_name": "Forgot Pass Candidate",
        "email": forgot_email,
        "password": "OldPassword123!"
    })
    otp_signup = _PENDING_REGISTRATIONS[forgot_email]["otp"]
    client.post("/api/auth/verify-otp", json={"email": forgot_email, "token": otp_signup})
    
    # 1. Request password reset OTP code
    res_req = client.post("/api/auth/forgot-password/request", json={"email": forgot_email})
    assert res_req.status_code == 200
    data_req = res_req.json()
    assert data_req["success"] is True
    
    assert forgot_email in _OTP_REGISTRY
    otp_reset = _OTP_REGISTRY[forgot_email]["otp"]
    
    # 2. Reset password with valid OTP
    res_reset = client.post("/api/auth/forgot-password/reset", json={
        "email": forgot_email,
        "token": otp_reset,
        "new_password": "NewUpdatedPassword123!"
    })
    assert res_reset.status_code == 200
    data_reset = res_reset.json()
    assert data_reset["success"] is True
    
    # 3. Verify logging in with OLD password fails and NEW password succeeds
    res_login_old = client.post("/api/auth/login", json={"email": forgot_email, "password": "OldPassword123!"})
    assert res_login_old.status_code == 401
    
    res_login_new = client.post("/api/auth/login", json={"email": forgot_email, "password": "NewUpdatedPassword123!"})
    assert res_login_new.status_code == 200
    assert res_login_new.json()["success"] is True

def test_dedicated_email_verification_endpoints():
    verify_email = f"security_{uuid.uuid4().hex[:6]}@dev.io"
    
    # 1. Request email verification code
    res_req = client.post("/api/auth/send-email-verification", json={"email": verify_email})
    assert res_req.status_code == 200
    data_req = res_req.json()
    assert data_req["success"] is True
    assert data_req["demo_otp"] is None
    
    # Retrieve real OTP sent to email inbox
    otp = _OTP_REGISTRY[verify_email]["otp"]
    
    # 2. Confirm email verification code
    res_confirm = client.post("/api/auth/verify-email", json={
        "email": verify_email,
        "token": otp
    })
    assert res_confirm.status_code == 200
    data_confirm = res_confirm.json()
    assert data_confirm["success"] is True
    assert data_confirm["user"]["is_email_verified"] is True

def test_admin_account_email_verified_default():
    from backend.app.main import _ensure_default_admin_account
    _ensure_default_admin_account()
    db: Session = SessionLocal()
    try:
        admin_user = db.query(UserModel).filter(UserModel.email == "adityanikt@gmail.com").first()
        if admin_user:
            assert admin_user.is_email_verified is True
    finally:
        db.close()
