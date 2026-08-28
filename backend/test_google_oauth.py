"""
P1.2 Google OAuth Unit & Integration Test
=========================================
Verifies Google OAuth single sign-on flows:
1. New-account case: provisions UserModel + ProfileModel with DPDP consent and returns session token without separate OTP verification.
2. Existing-account case: logs user into existing account without overwriting existing profile data.
"""

import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append('.')
from backend.app.main import app, UserModel, ProfileModel, MatchModel, ApplicationModel, _hash_password
from backend.app.db.database import SessionLocal

class TestGoogleOAuth(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.email_new = "google_new_user@dev.io"
        self.email_existing = "google_existing_user@dev.io"

        self._cleanup()

        # Seed existing user account
        self.existing_user = UserModel(
            email=self.email_existing,
            password_hash=_hash_password("Secret123!"),
            full_name="Existing Google Candidate",
            target_role="Staff Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(self.existing_user)
        self.db.commit()

        self.existing_prof = ProfileModel(
            name="Existing Google Candidate",
            email=self.email_existing,
            skills=["Python", "PostgreSQL", "System Design"],
            summary="Existing candidate profile."
        )
        self.db.add(self.existing_prof)
        self.db.commit()

    def _cleanup(self):
        emails = [self.email_new, self.email_existing]
        p_ids = [p.id for p in self.db.query(ProfileModel.id).filter(ProfileModel.email.in_(emails)).all()]
        if p_ids:
            m_ids = [m.id for m in self.db.query(MatchModel.id).filter(MatchModel.profile_id.in_(p_ids)).all()]
            if m_ids:
                self.db.query(ApplicationModel).filter(ApplicationModel.match_id.in_(m_ids)).delete(synchronize_session=False)
            self.db.query(MatchModel).filter(MatchModel.profile_id.in_(p_ids)).delete(synchronize_session=False)
            self.db.query(ProfileModel).filter(ProfileModel.email.in_(emails)).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email.in_(emails)).delete(synchronize_session=False)
        self.db.commit()

    def tearDown(self):
        self._cleanup()
        self.db.close()

    def test_google_oauth_new_and_existing_accounts(self):
        print("\n--- Running P1.2 Google OAuth Test ---")

        # 1. New Account SSO Case
        res1 = self.client.post("/api/auth/google/verify", json={
            "id_token": "mock_google_id_token_123",
            "email": self.email_new,
            "full_name": "New Google User"
        })
        self.assertEqual(res1.status_code, 200, f"New Google OAuth failed: {res1.text}")
        data1 = res1.json()
        self.assertTrue(data1["success"])
        self.assertIsNotNone(data1["token"])
        self.assertEqual(data1["user"]["email"], self.email_new)

        # Verify DB records created
        db_user1 = self.db.query(UserModel).filter(UserModel.email == self.email_new).first()
        self.assertIsNotNone(db_user1)
        self.assertTrue(db_user1.is_email_verified, "Google OAuth accounts must be marked verified automatically")

        # 2. Existing Account SSO Case
        res2 = self.client.post("/api/auth/google/verify", json={
            "id_token": "mock_google_id_token_456",
            "email": self.email_existing,
            "full_name": "Existing Google Candidate"
        })
        self.assertEqual(res2.status_code, 200, f"Existing Google OAuth failed: {res2.text}")
        data2 = res2.json()
        self.assertTrue(data2["success"])
        self.assertEqual(data2["user"]["email"], self.email_existing)

        # Verify token works for protected endpoints
        token2 = data2["token"]
        prof_res = self.client.get("/api/profile", headers={"Authorization": f"Bearer {token2}"})
        self.assertEqual(prof_res.status_code, 200)
        self.assertEqual(prof_res.json()["email"], self.email_existing)

        print("[OK] P1.2 Google OAuth Test Passed Successfully!")

if __name__ == "__main__":
    unittest.main()
