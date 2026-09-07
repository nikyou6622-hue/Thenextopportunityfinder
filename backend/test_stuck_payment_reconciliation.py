import pytest
import datetime
from fastapi.testclient import TestClient
from backend.app.main import app, _ensure_default_admin_account
from backend.app.db.database import SessionLocal
from backend.app.db.models import (
    UserModel, ProfileModel, SubscriptionModel, PaymentOrderModel, AdminAuditLogModel
)

@pytest.fixture(scope="module")
def client():
    _ensure_default_admin_account()
    with TestClient(app) as c:
        yield c

def get_token(client, email, password):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return {"Authorization": f"Bearer {res.json()['token']}"}

def test_manual_grant_pro_audit_trail(client):
    """VERIFICATION: Manual grant-pro endpoint logs explicit audit trail in AdminAuditLogModel."""
    db = SessionLocal()
    try:
        # Create a test candidate profile
        test_email = "stuck_customer_audit_test@example.com"
        user = db.query(UserModel).filter(UserModel.email == test_email).first()
        if not user:
            user = UserModel(email=test_email, full_name="Stuck Customer", password_hash="pass123", is_active=True)
            db.add(user)
            db.commit()

        headers = get_token(client, "admin@thenextopportunityfinder.com", "AdminCommander2026!")

        res = client.post(f"/api/admin/users/{user.id}/grant-pro", headers=headers)
        assert res.status_code == 200, f"Grant failed: {res.text}"
        assert res.json()["success"] is True

        # Verify audit log entry
        audit = db.query(AdminAuditLogModel).filter(
            AdminAuditLogModel.target_user_email == test_email,
            AdminAuditLogModel.action == "upgrade_pro"
        ).order_by(AdminAuditLogModel.id.desc()).first()

        assert audit is not None, "Audit log entry missing for manual grant!"
        assert audit.admin_email == "admin@thenextopportunityfinder.com"
        assert "manually granted" in audit.details.lower() or "upgrade" in audit.details.lower()
    finally:
        db.close()

def test_webhook_exception_resilience(client):
    """VERIFICATION: Webhook grants Pro access safely even if secondary notifications fail."""
    db = SessionLocal()
    try:
        import uuid
        test_email = f"webhook_resilience_{uuid.uuid4().hex[:6]}@example.com"
        p = db.query(ProfileModel).filter(ProfileModel.email == test_email).first()
        if not p:
            p = ProfileModel(name="Resilience Test Candidate", email=test_email)
            db.add(p)
            db.commit()

        order_id = f"order_resilience_{uuid.uuid4().hex[:8]}"
        po = PaymentOrderModel(
            order_id=order_id,
            profile_id=p.id,
            amount=99.0,
            currency="INR",
            status="created"
        )
        db.add(po)
        db.commit()

        # Trigger PAYMENT_SUCCESS_WEBHOOK
        payload = {
            "type": "PAYMENT_SUCCESS_WEBHOOK",
            "event_time": "2026-09-07T10:00:00Z",
            "data": {
                "order": {"order_id": order_id, "order_amount": 99.0, "order_currency": "INR"},
                "payment": {"cf_payment_id": f"cf_resilience_{uuid.uuid4().hex[:6]}", "payment_status": "SUCCESS"},
                "customer_details": {"customer_email": test_email}
            }
        }

        res = client.post("/api/payments/webhook", json=payload)
        assert res.status_code == 200, f"Webhook failed: {res.text}"
        assert res.json()["status"] == "success"

        # Verify subscription was granted
        sub = db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == p.id).first()
        assert sub is not None
        assert sub.plan_tier == "pro"
    finally:
        db.close()

def test_tier3_reconciliation_stuck_payment_detection(client):
    """VERIFICATION: Tier 3 Reconciliation Engine flags payment orders >30m old on 'free' profiles."""
    db = SessionLocal()
    try:
        import uuid
        test_email = f"stuck_order_{uuid.uuid4().hex[:6]}@example.com"
        p = db.query(ProfileModel).filter(ProfileModel.email == test_email).first()
        if not p:
            p = ProfileModel(name="Stuck Candidate", email=test_email, subscription_tier="free")
            db.add(p)
            db.commit()

        # Provision order created 45 minutes ago
        past_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=45)
        stuck_order_id = f"order_stuck_{uuid.uuid4().hex[:8]}"
        po = PaymentOrderModel(
            order_id=stuck_order_id,
            profile_id=p.id,
            amount=99.0,
            currency="INR",
            status="created",
            created_at=past_time
        )
        db.add(po)
        db.commit()

        # Query Tier 3 Master Admin Reconciliation Endpoint
        headers = get_token(client, "master.admin@thenextopportunityfinder.com", "MasterAdminPass2026!")
        res = client.get("/api/admin/tier3/reconciliation", headers=headers)
        assert res.status_code == 200, f"Reconciliation API failed: {res.text}"
        data = res.json()

        assert "stuck_payments_count" in data
        assert "stuck_payments_flagged" in data
        assert data["stuck_payments_count"] >= 1

        flagged_order_ids = [s["order_id"] for s in data["stuck_payments_flagged"]]
        assert stuck_order_id in flagged_order_ids
    finally:
        db.close()
