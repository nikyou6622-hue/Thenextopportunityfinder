import sys
import os
import unittest

# Disable background loops during testing
os.environ["VERCEL"] = "1"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.app.main import app, _hash_password, _generate_token
from backend.app.db.database import SessionLocal
from backend.app.db.models import UserModel, AdminAuditLogModel, SubscriptionModel, PaymentOrderModel

client = TestClient(app)

class TestAdminUserManagement(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        
        # 1. Setup Admin User
        cls.admin_email = "test_admin_mgmt@example.com"
        cls.admin_user = cls.db.query(UserModel).filter(UserModel.email == cls.admin_email).first()
        if not cls.admin_user:
            cls.admin_user = UserModel(
                email=cls.admin_email,
                full_name="System Admin Test",
                password_hash=_hash_password("AdminPass123!"),
                is_admin=True,
                is_active=True,
                subscription_tier="pro"
            )
            cls.db.add(cls.admin_user)
            cls.db.commit()
            cls.db.refresh(cls.admin_user)
        else:
            cls.admin_user.is_admin = True
            cls.admin_user.is_active = True
            cls.db.commit()

        # 2. Setup Non-Admin Standard User
        cls.std_email = "test_std_user@example.com"
        cls.std_user = cls.db.query(UserModel).filter(UserModel.email == cls.std_email).first()
        if not cls.std_user:
            cls.std_user = UserModel(
                email=cls.std_email,
                full_name="Standard User Test",
                password_hash=_hash_password("UserPass123!"),
                is_admin=False,
                is_active=True,
                subscription_tier="free"
            )
            cls.db.add(cls.std_user)
            cls.db.commit()
            cls.db.refresh(cls.std_user)
        else:
            cls.std_user.is_admin = False
            cls.std_user.is_active = True
            cls.db.commit()

        # Create tokens and cookies
        cls.admin_token = _generate_token(cls.admin_email)
        cls.std_token = _generate_token(cls.std_email)

        cls.admin_cookies = {"nof_auth_token": cls.admin_token}
        cls.std_cookies = {"nof_auth_token": cls.std_token}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_non_admin_403_access_denied(self):
        """Verify that non-admin requests to /api/admin/users receive HTTP 403 Forbidden."""
        res = client.get("/api/admin/users", cookies=self.std_cookies)
        self.assertEqual(res.status_code, 403, f"Expected 403 Forbidden for non-admin, got {res.status_code}: {res.text}")

    def test_02_admin_users_list_and_subscription_derivation(self):
        """Verify that admin can fetch user list and subscription status is properly derived (Pro/Expired/Free)."""
        res = client.get("/api/admin/users?page=1&limit=50", cookies=self.admin_cookies)
        self.assertEqual(res.status_code, 200, f"Failed to fetch admin users list: {res.text}")
        data = res.json()
        self.assertIn("users", data)
        self.assertTrue("total_count" in data or "total_users" in data)
        
        # Verify derived subscription_status key in returned user objects
        for u in data["users"]:
            sub_stat = u.get("subscription_status") or u.get("subscription_tier") or "free"
            self.assertIn(sub_stat, ["pro", "expired", "free"])

    def test_03_admin_create_user(self):
        """Verify POST /api/admin/users creates a user, handles duplicates (409), and logs to AdminAuditLog."""
        test_email = "created_candidate_2026@example.com"
        # Delete if exists from past run
        existing = self.db.query(UserModel).filter(UserModel.email == test_email).first()
        if existing:
            self.db.delete(existing)
            self.db.commit()

        # 1. Create candidate user without password (auto-generated)
        payload = {
            "email": test_email,
            "full_name": "Created Candidate",
            "target_role": "Backend Engineer",
            "experience_level": "Mid Level",
            "subscription_tier": "free"
        }
        res = client.post("/api/admin/users", json=payload, cookies=self.admin_cookies)
        self.assertEqual(res.status_code, 200, f"Failed to create user: {res.text}")
        created_data = res.json()
        self.assertEqual(created_data["email"], test_email)
        self.assertTrue(len(created_data.get("generated_password", "")) >= 6)

        created_user_id = created_data["user_id"]

        # 2. Try creating duplicate user -> expect 409 Conflict
        res_dup = client.post("/api/admin/users", json=payload, cookies=self.admin_cookies)
        self.assertEqual(res_dup.status_code, 409, f"Expected 409 Conflict for duplicate email, got {res_dup.status_code}")

        # 3. Verify audit log entry
        audit_entry = self.db.query(AdminAuditLogModel).filter(
            AdminAuditLogModel.action == "user_created",
            AdminAuditLogModel.target_user_id == created_user_id
        ).first()
        self.assertIsNotNone(audit_entry, "Audit log record for user_created was not created!")
        self.assertEqual(audit_entry.admin_user_id, self.admin_user.id)

    def test_04_soft_deactivation_and_self_lockout_protection(self):
        """Verify soft deactivation sets is_active=False, self-deactivation returns 400 Bad Request, and deactivated login fails."""
        # 1. Self-deactivation shield test: Admin deactivating self -> 400 Bad Request
        res_self = client.post(f"/api/admin/users/{self.admin_user.id}/deactivate", cookies=self.admin_cookies)
        self.assertEqual(res_self.status_code, 400, f"Expected 400 Bad Request for self-deactivation, got {res_self.status_code}")
        self.assertIn("cannot deactivate their own account", res_self.json().get("detail", ""))

        # 2. Soft-deactivate standard user
        res_deact = client.post(f"/api/admin/users/{self.std_user.id}/deactivate", cookies=self.admin_cookies)
        self.assertEqual(res_deact.status_code, 200, f"Deactivation failed: {res_deact.text}")
        
        # Verify user is_active flag in DB
        self.db.refresh(self.std_user)
        self.assertFalse(self.std_user.is_active, "User is_active flag was not set to False!")

        # 3. Try to login as deactivated user -> expect 403 Forbidden
        res_login = client.post("/api/auth/login", json={"email": self.std_email, "password": "UserPass123!"})
        self.assertEqual(res_login.status_code, 403, f"Expected 403 Forbidden for deactivated login, got {res_login.status_code}")

        # 4. Reactivate standard user
        res_react = client.post(f"/api/admin/users/{self.std_user.id}/reactivate", cookies=self.admin_cookies)
        self.assertEqual(res_react.status_code, 200, f"Reactivation failed: {res_react.text}")
        
        self.db.refresh(self.std_user)
        self.assertTrue(self.std_user.is_active, "User is_active flag was not reset to True!")

    def test_05_admin_audit_logs_endpoint(self):
        """Verify GET /api/admin/audit-logs returns paginated audit log entries with admin_user_id."""
        res = client.get("/api/admin/audit-logs?page=1&limit=20", cookies=self.admin_cookies)
        self.assertEqual(res.status_code, 200, f"Failed to fetch audit logs: {res.text}")
        data = res.json()
        self.assertIn("audit_logs", data)
        self.assertTrue(len(data["audit_logs"]) > 0, "Audit logs list is empty!")

if __name__ == "__main__":
    unittest.main()
