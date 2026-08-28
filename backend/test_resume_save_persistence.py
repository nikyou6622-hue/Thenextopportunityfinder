"""
P1.4 Resume Review-and-Save Flow Test
=====================================
Verifies that:
1. Edits submitted to /api/profile persist in the database.
2. Re-fetching /api/profile returns the saved updates intact.
"""

import sys
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import text

sys.path.append('.')
from backend.app.main import app, UserModel, ProfileModel, _hash_password
from backend.app.db.database import SessionLocal

class TestResumeSavePersistence(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.email = "save_test_user@dev.io"
        
        self._cleanup()

        self.user = UserModel(
            email=self.email,
            password_hash=_hash_password("Password123!"),
            full_name="Original Name",
            target_role="Software Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(self.user)
        self.db.commit()

        self.profile = ProfileModel(
            name="Original Name",
            email=self.email,
            skills=["Python"],
            summary="Original summary"
        )
        self.db.add(self.profile)
        self.db.commit()

    def _cleanup(self):
        try:
            self.db.execute(text("DELETE FROM application_events WHERE application_id IN (SELECT id FROM applications WHERE profile_id IN (SELECT id FROM profiles WHERE email = :e))"), {"e": self.email})
            self.db.execute(text("DELETE FROM applications WHERE profile_id IN (SELECT id FROM profiles WHERE email = :e)"), {"e": self.email})
            self.db.execute(text("DELETE FROM matches WHERE profile_id IN (SELECT id FROM profiles WHERE email = :e)"), {"e": self.email})
            self.db.execute(text("DELETE FROM profiles WHERE email = :e"), {"e": self.email})
            self.db.execute(text("DELETE FROM users WHERE email = :e"), {"e": self.email})
            self.db.commit()
        except Exception:
            self.db.rollback()

    def tearDown(self):
        self._cleanup()
        self.db.close()

    def test_profile_save_and_persistence(self):
        print("\n--- Running P1.4 Resume Review-and-Save Test ---")
        login_res = self.client.post("/api/auth/login", json={"email": self.email, "password": "Password123!"})
        token = login_res.json().get("token")
        self.assertIsNotNone(token)

        # Update profile fields explicitly
        updated_payload = {
            "name": "Updated Verified Name",
            "email": self.email,
            "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            "summary": "Updated verified summary with full hands-on engineering background.",
            "phone": "+91 98765 43210"
        }

        save_res = self.client.post("/api/profile", json=updated_payload, headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(save_res.status_code, 200, f"Profile save failed: {save_res.text}")

        # Re-fetch profile and verify persistence
        fetch_res = self.client.get("/api/profile", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(fetch_res.status_code, 200)
        data = fetch_res.json()

        self.assertEqual(data["name"], "Updated Verified Name")
        self.assertEqual(len(data["skills"]), 5)
        self.assertEqual(data["phone"], "+91 98765 43210")
        print("[OK] P1.4 Profile Review-and-Save Persistence Test Passed!")

if __name__ == "__main__":
    unittest.main()
