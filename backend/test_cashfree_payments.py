import os
import sys
import uuid
import time
import json
import hmac
import hashlib
import base64
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app, CASHFREE_APP_ID, CASHFREE_SECRET_KEY
from backend.app.db.database import get_db
from backend.app.db.models import ProfileModel, SubscriptionModel, PaymentOrderModel, NotificationEventModel
from sqlalchemy.orm import Session

client = TestClient(app)

def test_zero_secret_leak_in_frontend():
    """
    Static code audit assertion:
    Verifies that CASHFREE_SECRET_KEY is never hardcoded or referenced anywhere in web/src.
    """
    web_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "src"))
    assert os.path.exists(web_src), "web/src directory must exist"

    found_secret_occurrences = []
    for root, _, files in os.walk(web_src):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.html', '.css')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if "CASHFREE_SECRET_KEY" in content or "cfsk_" in content:
                        found_secret_occurrences.append(file_path)

    assert len(found_secret_occurrences) == 0, f"SECURITY AUDIT VIOLATION: Cashfree secret key found in frontend files: {found_secret_occurrences}"

def test_create_cashfree_order_endpoint():
    """
    Verifies POST /api/payments/create-order:
    Generates Cashfree order, returns payment_session_id, and records PaymentOrderModel row in 'created' status.
    """
    db: Session = next(get_db())

    # Create test candidate profile
    test_email = f"cashfree_cand_{uuid.uuid4().hex[:8]}@example.com"
    profile = ProfileModel(name="Cashfree Tester", email=test_email)
    db.add(profile)
    db.commit()

    response = client.post("/api/payments/create-order", json={
        "amount": 99.0,
        "currency": "INR",
        "profile_id": profile.id
    })

    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}: {response.text}"
    data = response.json()

    assert data["success"] is True
    assert "order_id" in data
    assert "payment_session_id" in data
    assert data["amount"] == 99.0

    # Verify DB state
    order_record = db.query(PaymentOrderModel).filter(PaymentOrderModel.order_id == data["order_id"]).first()
    assert order_record is not None, "PaymentOrderModel row must be saved in DB"
    assert order_record.status == "created"
    assert order_record.profile_id == profile.id
    assert order_record.amount == 99.0

def test_webhook_forged_signature_rejection():
    """
    Verifies POST /api/payments/webhook:
    Rejects unsigned or forged signature requests with HTTP 400 Bad Request.
    """
    payload = {
        "type": "PAYMENT_SUCCESS_WEBHOOK",
        "event_time": "2026-09-03T12:00:00Z",
        "data": {
            "order": {"order_id": "forged_order_123", "order_amount": 99.0},
            "payment": {"cf_payment_id": "forged_pay_123", "payment_status": "SUCCESS"}
        }
    }

    # Request with invalid forged signature header
    headers = {
        "x-webhook-signature": "invalid_forged_signature_base64==",
        "x-webhook-timestamp": str(int(time.time()))
    }

    response = client.post("/api/payments/webhook", json=payload, headers=headers)
    assert response.status_code == 400, "Forged signature must be rejected with 400 Bad Request"
    assert "Invalid" in response.json()["detail"]

def test_webhook_successful_payment_grants_6_month_pro():
    """
    Verifies POST /api/payments/webhook on PAYMENT_SUCCESS:
    1. Updates PaymentOrderModel to 'paid'.
    2. Grants 6-Month Pro Access (valid_until ~ 180 days from now).
    """
    db: Session = next(get_db())

    test_email = f"cashfree_pro_{uuid.uuid4().hex[:8]}@example.com"
    profile = ProfileModel(name="Pro Subscriber", email=test_email)
    db.add(profile)
    db.commit()

    order_id = f"order_prof{profile.id}_{int(time.time()*1000)}"
    order_record = PaymentOrderModel(
        order_id=order_id,
        profile_id=profile.id,
        amount=99.0,
        currency="INR",
        status="created"
    )
    db.add(order_record)
    db.commit()

    # Construct valid Cashfree webhook payload
    payload_data = {
        "type": "PAYMENT_SUCCESS_WEBHOOK",
        "event_time": "2026-09-03T12:00:00Z",
        "data": {
            "order": {
                "order_id": order_id,
                "order_amount": 99.0,
                "order_currency": "INR"
            },
            "payment": {
                "cf_payment_id": "cf_pay_test_998877",
                "payment_status": "SUCCESS",
                "payment_amount": 99.0
            },
            "customer_details": {
                "customer_email": test_email
            }
        }
    }

    raw_body = json.dumps(payload_data).encode('utf-8')
    ts = str(int(time.time()))

    # Compute valid signature if secret key configured
    key_bytes = CASHFREE_SECRET_KEY.encode('utf-8')
    signed_payload = ts.encode('utf-8') + raw_body
    valid_sig = base64.b64encode(hmac.new(key_bytes, signed_payload, hashlib.sha256).digest()).decode('utf-8')

    headers = {
        "x-webhook-signature": valid_sig,
        "x-webhook-timestamp": ts,
        "Content-Type": "application/json"
    }

    response = client.post("/api/payments/webhook", content=raw_body, headers=headers)
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}: {response.text}"
    res_json = response.json()
    assert res_json["status"] == "success"

    # Verify DB payment order state
    db.refresh(order_record)
    assert order_record.status == "paid"
    assert order_record.cf_payment_id == "cf_pay_test_998877"

    # Verify Subscription grant: 6 months
    sub = db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile.id).first()
    assert sub is not None, "SubscriptionModel record must be created"
    assert sub.plan_tier == "pro"
    assert sub.is_active is True
    assert sub.valid_until is not None

    # Check 6-month window (~180 days)
    days_granted = (sub.valid_until - sub.started_at).days
    assert 178 <= days_granted <= 183, f"Expected ~180 days for 6-month pro tier, got {days_granted} days"

def test_webhook_failed_payment_no_pro_grant():
    """
    Verifies POST /api/payments/webhook on PAYMENT_FAILED:
    Updates PaymentOrderModel to 'failed' and does NOT grant Pro subscription.
    """
    db: Session = next(get_db())

    test_email = f"cashfree_fail_{uuid.uuid4().hex[:8]}@example.com"
    profile = ProfileModel(name="Failed Candidate", email=test_email)
    db.add(profile)
    db.commit()

    order_id = f"order_prof{profile.id}_{int(time.time()*1000)}"
    order_record = PaymentOrderModel(
        order_id=order_id,
        profile_id=profile.id,
        amount=99.0,
        currency="INR",
        status="created"
    )
    db.add(order_record)
    db.commit()

    payload_data = {
        "type": "PAYMENT_FAILED_WEBHOOK",
        "event_time": "2026-09-03T12:00:00Z",
        "data": {
            "order": {
                "order_id": order_id,
                "order_amount": 99.0
            },
            "payment": {
                "cf_payment_id": "cf_pay_failed_112233",
                "payment_status": "FAILED"
            }
        }
    }

    raw_body = json.dumps(payload_data).encode('utf-8')
    ts = str(int(time.time()))
    key_bytes = CASHFREE_SECRET_KEY.encode('utf-8')
    signed_payload = ts.encode('utf-8') + raw_body
    valid_sig = base64.b64encode(hmac.new(key_bytes, signed_payload, hashlib.sha256).digest()).decode('utf-8')

    headers = {
        "x-webhook-signature": valid_sig,
        "x-webhook-timestamp": ts,
        "Content-Type": "application/json"
    }

    response = client.post("/api/payments/webhook", content=raw_body, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "failed"

    # Verify DB state
    db.refresh(order_record)
    assert order_record.status == "failed"

    # Verify no Pro subscription granted
    sub = db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile.id).first()
    if sub:
        assert sub.plan_tier != "pro" or sub.is_active is False

def test_webhook_idempotency_duplicate_handling():
    """
    Verifies that duplicate webhook payloads return 'already_processed' without duplicate granting.
    """
    db: Session = next(get_db())

    test_email = f"cashfree_idemp_{uuid.uuid4().hex[:8]}@example.com"
    profile = ProfileModel(name="Idempotency Candidate", email=test_email)
    db.add(profile)
    db.commit()

    order_id = f"order_prof{profile.id}_{int(time.time()*1000)}"
    order_record = PaymentOrderModel(
        order_id=order_id,
        profile_id=profile.id,
        amount=99.0,
        status="paid", # Already paid
        cf_payment_id="cf_pay_already_processed"
    )
    db.add(order_record)
    db.commit()

    payload_data = {
        "type": "PAYMENT_SUCCESS_WEBHOOK",
        "data": {
            "order": {"order_id": order_id, "order_amount": 99.0},
            "payment": {"cf_payment_id": "cf_pay_already_processed", "payment_status": "SUCCESS"}
        }
    }

    raw_body = json.dumps(payload_data).encode('utf-8')
    ts = str(int(time.time()))
    key_bytes = CASHFREE_SECRET_KEY.encode('utf-8')
    signed_payload = ts.encode('utf-8') + raw_body
    valid_sig = base64.b64encode(hmac.new(key_bytes, signed_payload, hashlib.sha256).digest()).decode('utf-8')

    headers = {
        "x-webhook-signature": valid_sig,
        "x-webhook-timestamp": ts,
        "Content-Type": "application/json"
    }

    response = client.post("/api/payments/webhook", content=raw_body, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "already_processed"

def test_payment_status_reconciliation_endpoint():
    """
    Verifies GET /api/payments/status/{order_id} returns order status and subscription details.
    """
    db: Session = next(get_db())

    test_email = f"cashfree_status_{uuid.uuid4().hex[:8]}@example.com"
    profile = ProfileModel(name="Status Candidate", email=test_email)
    db.add(profile)
    db.commit()

    order_id = f"order_prof{profile.id}_{int(time.time()*1000)}"
    order_record = PaymentOrderModel(
        order_id=order_id,
        profile_id=profile.id,
        amount=99.0,
        status="paid"
    )
    db.add(order_record)
    db.commit()

    sub = SubscriptionModel(profile_id=profile.id, plan_tier="pro", is_active=True)
    db.add(sub)
    db.commit()

    response = client.get(f"/api/payments/status/{order_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"] == order_id
    assert data["status"] == "paid"
    assert data["is_pro"] is True

if __name__ == "__main__":
    pytest.main([__file__, "-vv"])
