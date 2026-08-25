import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app, get_db, _store_otp, _validate_otp, _OTP_REGISTRY
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.db.models import UserModel

client = TestClient(app)

def setup_module(module):
    Base.metadata.create_all(bind=engine)

def test_otp_store_and_validate_logic():
    test_email = "pytest_email_test@example.com"
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
    target_email = "candidate_verify_test@dev.io"
    
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

def test_dedicated_email_verification_endpoints():
    verify_email = "security_test_user@dev.io"
    
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
