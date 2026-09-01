import os
import pytest
import datetime
import hmac
import hashlib
from fastapi.testclient import TestClient

from backend.app.main import app, get_db, _hash_password
from backend.app.db.models import (
    Base, UserModel, ProfileModel, SubscriptionModel, JobModel, MatchModel, AdminAuditLogModel
)
from backend.app.security.subscriptions import get_access_level, grant_pro_access, revoke_pro_access
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import backend.app.main as main_module

# Create in-memory SQLite test database with StaticPool so all threads/sessions share the schema
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override main module's SessionLocal as well as get_db dependency
main_module.SessionLocal = TestingSessionLocal

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.query(AdminAuditLogModel).delete()
    db.query(MatchModel).delete()
    db.query(JobModel).delete()
    db.query(SubscriptionModel).delete()
    db.query(ProfileModel).delete()
    db.query(UserModel).delete()
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_get_access_level_returns_correct_tier(setup_db):
    db = setup_db
    
    # 1. Non-existent profile
    assert get_access_level(999, db) == "free"

    # 2. Active profile without subscription
    profile = ProfileModel(name="Free User", email="free@example.com")
    db.add(profile)
    db.commit()
    db.refresh(profile)
    assert get_access_level(profile.id, db) == "free"

    # 3. Active Pro subscription
    sub = grant_pro_access(profile.id, db, payment_id="pay_test_123", amount_paid=99.0, months=6)
    assert get_access_level(profile.id, db) == "pro"

    # 4. Expired subscription
    sub.valid_until = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    db.commit()
    assert get_access_level(profile.id, db) == "free"


def test_pro_user_uncapped_results_regression(setup_db):
    """REGRESSION TEST: Confirm Pro users are NEVER capped and locked_count is always 0."""
    db = setup_db

    email = "pro.candidate@test.com"
    user = UserModel(full_name="Pro Candidate", email=email, password_hash=_hash_password("password"))
    profile = ProfileModel(name="Pro Candidate", email=email, skills=["Python", "FastAPI"])
    db.add(user)
    db.add(profile)
    db.commit()

    # Grant Pro Access
    grant_pro_access(profile.id, db, payment_id="pay_pro_test", amount_paid=99.0, months=6)

    # Create 12 jobs & matches
    for i in range(1, 13):
        job = JobModel(id=i, company=f"Company {i}", role_title=f"Engineer {i}", apply_url=f"https://company{i}.com/apply", description=f"Full description {i}")
        match = MatchModel(id=i, job_id=i, profile_id=profile.id, match_score=95.0 - i)
        db.add(job)
        db.add(match)
    db.commit()

    token = f"nof_tok_{hashlib.md5(email.encode()).hexdigest()[:8]}_test"
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/matches", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "matches" in data
    assert "locked_count" in data
    assert data["locked_count"] == 0
    assert len(data["matches"]) == 12

    # Verify all 12 items have real data
    for idx, item in enumerate(data["matches"]):
        assert item["job"]["company"] == f"Company {idx + 1}"
        assert item["job"]["apply_url"] == f"https://company{idx + 1}.com/apply"


def test_free_user_5_job_limit_and_locked_count(setup_db):
    """Test Free-tier user receives exactly 5 real matches and accurate locked_count."""
    db = setup_db

    email = "free.candidate@test.com"
    user = UserModel(full_name="Free Candidate", email=email, password_hash=_hash_password("password"))
    profile = ProfileModel(name="Free Candidate", email=email, skills=["Python", "FastAPI"])
    db.add(user)
    db.add(profile)
    db.commit()

    # Create 12 jobs & matches
    for i in range(1, 13):
        job = JobModel(id=i, company=f"Company {i}", role_title=f"Engineer {i}", apply_url=f"https://company{i}.com/apply", description=f"Full description {i}")
        match = MatchModel(id=i, job_id=i, profile_id=profile.id, match_score=95.0 - i)
        db.add(job)
        db.add(match)
    db.commit()

    token = f"nof_tok_{hashlib.md5(email.encode()).hexdigest()[:8]}_test"
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/matches", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "matches" in data
    assert "locked_count" in data
    assert len(data["matches"]) == 5
    assert data["locked_count"] == 7  # 12 total - 5 visible = 7 locked

    # All 5 returned matches must be real unlocked data (no masked/truncated data)
    for idx, item in enumerate(data["matches"]):
        assert item["job"]["company"] == f"Company {idx + 1}"
        assert item["job"]["apply_url"] == f"https://company{idx + 1}.com/apply"
        assert item["job"]["description"] == f"Full description {idx + 1}"


def test_mnc_and_internship_5_job_limit_free_vs_pro(setup_db):
    """Test MNC Hub and Internship Hub apply individual 5-job free-tier limit and uncapped pro tier."""
    db = setup_db

    # Free User
    free_email = "free.mnc@test.com"
    free_user = UserModel(full_name="Free MNC User", email=free_email, password_hash=_hash_password("password"))
    free_prof = ProfileModel(name="Free MNC User", email=free_email, skills=["Python", "React"])
    db.add(free_user)
    db.add(free_prof)

    # Pro User
    pro_email = "pro.mnc@test.com"
    pro_user = UserModel(full_name="Pro MNC User", email=pro_email, password_hash=_hash_password("password"))
    pro_prof = ProfileModel(name="Pro MNC User", email=pro_email, skills=["Python", "React"])
    db.add(pro_user)
    db.add(pro_prof)
    db.commit()

    grant_pro_access(pro_prof.id, db, payment_id="pay_mnc_pro", amount_paid=99.0, months=6)

    # Populate 10 MNC jobs & matches
    for i in range(100, 110):
        mnc_job = JobModel(
            id=i, 
            company=f"MNC Corp {i}", 
            role_title=f"MNC Architect {i}", 
            apply_url=f"https://mnc{i}.com/careers", 
            description=f"MNC job desc {i}",
            source_category="mnc",
            status="active"
        )
        db.add(mnc_job)
        m_free = MatchModel(id=i * 10, job_id=i, profile_id=free_prof.id, match_score=90.0)
        m_pro = MatchModel(id=i * 10 + 1, job_id=i, profile_id=pro_prof.id, match_score=90.0)
        db.add(m_free)
        db.add(m_pro)
    db.commit()

    free_token = f"nof_tok_{hashlib.md5(free_email.encode()).hexdigest()[:8]}_test"
    pro_token = f"nof_tok_{hashlib.md5(pro_email.encode()).hexdigest()[:8]}_test"

    # 1. MNC Hub - Free User (Capped at 5, locked_count accurate)
    res_free = client.get("/api/jobs/mnc", headers={"Authorization": f"Bearer {free_token}"})
    assert res_free.status_code == 200
    data_free = res_free.json()
    assert len(data_free["matches"]) == 5
    assert data_free["locked_count"] == 5  # 10 total - 5 visible = 5

    # 2. MNC Hub - Pro User (Uncapped 10, locked_count 0)
    res_pro = client.get("/api/jobs/mnc", headers={"Authorization": f"Bearer {pro_token}"})
    assert res_pro.status_code == 200
    data_pro = res_pro.json()
    assert len(data_pro["matches"]) == 10
    assert data_pro["locked_count"] == 0

    # 3. India Internships - Free User
    res_int_free = client.get("/api/internships/india", headers={"Authorization": f"Bearer {free_token}"})
    assert res_int_free.status_code == 200
    int_free_data = res_int_free.json()
    assert "internships" in int_free_data
    assert len(int_free_data["internships"]) <= 5
    assert int_free_data["locked_count"] >= 0

    # 4. India Internships - Pro User
    res_int_pro = client.get("/api/internships/india", headers={"Authorization": f"Bearer {pro_token}"})
    assert res_int_pro.status_code == 200
    int_pro_data = res_int_pro.json()
    assert int_pro_data["locked_count"] == 0





def test_webhook_signature_verification_and_idempotency(setup_db):
    db = setup_db

    profile = ProfileModel(name="Webhook Test Candidate", email="webhook@test.com")
    db.add(profile)
    db.commit()

    # 1. Invalid Webhook Signature when secret configured
    main_module.RAZORPAY_WEBHOOK_SECRET = "secret_key_123"
    try:
        payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook_001",
                        "amount": 9900,
                        "email": "webhook@test.com"
                    }
                }
            }
        }
        res = client.post(
            "/api/payments/razorpay-webhook",
            json=payload,
            headers={"X-Razorpay-Signature": "invalid_sig"}
        )
        assert res.status_code == 400
        assert "Invalid webhook signature" in res.json()["detail"]

        # 2. Valid Webhook Signature
        import json
        raw_body = json.dumps(payload).encode()
        expected_sig = hmac.new(b"secret_key_123", raw_body, hashlib.sha256).hexdigest()

        res_valid = client.post(
            "/api/payments/razorpay-webhook",
            content=raw_body,
            headers={"X-Razorpay-Signature": expected_sig, "Content-Type": "application/json"}
        )
        assert res_valid.status_code == 200
        assert res_valid.json()["status"] == "success"
        assert res_valid.json()["payment_id"] == "pay_webhook_001"

        # Check database: Pro subscription created
        sub = db.query(SubscriptionModel).filter(SubscriptionModel.payment_id == "pay_webhook_001").first()
        assert sub is not None
        assert sub.plan_tier == "pro"
        assert sub.is_active is True

        # 3. Webhook Idempotency Check: Sending same event again
        res_dup = client.post(
            "/api/payments/razorpay-webhook",
            content=raw_body,
            headers={"X-Razorpay-Signature": expected_sig, "Content-Type": "application/json"}
        )
        assert res_dup.status_code == 200
        assert res_dup.json()["status"] == "already_processed"

        # Ensure no duplicate subscription row created
        subs_count = db.query(SubscriptionModel).filter(SubscriptionModel.payment_id == "pay_webhook_001").count()
        assert subs_count == 1
    finally:
        main_module.RAZORPAY_WEBHOOK_SECRET = ""


def test_critical_security_non_admin_rejected_from_admin_endpoints(setup_db):
    """CRITICAL SECURITY TEST: Authenticated non-admin request to /api/admin/* MUST return 403 Forbidden."""
    db = setup_db

    # Create standard candidate user (is_admin = False)
    email = "candidate.regular@test.com"
    non_admin_user = UserModel(
        full_name="Standard Candidate",
        email=email,
        password_hash=_hash_password("password"),
        is_admin=False
    )
    db.add(non_admin_user)
    db.commit()

    token = f"nof_tok_{hashlib.md5(email.encode()).hexdigest()[:8]}_test"
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET /api/admin/users
    res_users = client.get("/api/admin/users", headers=headers)
    assert res_users.status_code == 403
    assert "Forbidden" in res_users.json()["detail"] or "Admin" in res_users.json()["detail"]

    # 2. GET /api/admin/stats
    res_stats = client.get("/api/admin/stats", headers=headers)
    assert res_stats.status_code == 403

    # 3. POST /api/admin/users/{id}/grant-pro
    res_grant = client.post(f"/api/admin/users/{non_admin_user.id}/grant-pro", headers=headers)
    assert res_grant.status_code == 403

    # 4. POST /api/admin/users/{id}/revoke-pro
    res_revoke = client.post(f"/api/admin/users/{non_admin_user.id}/revoke-pro", headers=headers)
    assert res_revoke.status_code == 403


def test_admin_grant_and_revoke_logged_to_audit_trail(setup_db):
    db = setup_db

    # Create Admin User and Candidate User
    admin_email = "adityanikt@gmail.com"
    admin_user = UserModel(full_name="Aditya Admin", email=admin_email, password_hash=_hash_password("pass"), is_admin=True)
    target_user = UserModel(full_name="Target User", email="target@test.com", password_hash=_hash_password("pass"), is_admin=False)
    db.add(admin_user)
    db.add(target_user)
    db.commit()

    admin_token = f"nof_tok_{hashlib.md5(admin_email.encode()).hexdigest()[:8]}_test"
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Admin Grants Pro Access
    res_grant = client.post(f"/api/admin/users/{target_user.id}/grant-pro", headers=admin_headers)
    assert res_grant.status_code == 200
    assert res_grant.json()["success"] is True

    # Audit log check
    audit_grant = db.query(AdminAuditLogModel).filter(AdminAuditLogModel.action == "upgrade_pro").first()
    assert audit_grant is not None
    assert audit_grant.admin_email == "adityanikt@gmail.com"
    assert audit_grant.target_user_email == "target@test.com"

    # Verify Pro status
    profile = db.query(ProfileModel).filter(ProfileModel.email == "target@test.com").first()
    assert get_access_level(profile.id, db) == "pro"

    # 2. Admin Revokes Pro Access
    res_revoke = client.post(f"/api/admin/users/{target_user.id}/revoke-pro", headers=admin_headers)
    assert res_revoke.status_code == 200

    audit_revoke = db.query(AdminAuditLogModel).filter(AdminAuditLogModel.action == "revoke_pro").first()
    assert audit_revoke is not None
    assert audit_revoke.target_user_email == "target@test.com"

    # Verify Free status reverted
    assert get_access_level(profile.id, db) == "free"

    assert audit_revoke.target_user_email == "target@test.com"

    # Verify Free status reverted
    assert get_access_level(profile.id, db) == "free"
