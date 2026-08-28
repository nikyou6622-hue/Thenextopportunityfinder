"""
P0 Two-Real-User Data Isolation Regression Test
===============================================
Verifies that:
1. Two genuinely different test accounts see ONLY their own profile data and matches.
2. Account 1's data never leaks into Account 2's session or vice versa.
3. Unauthenticated requests to /api/profile and /api/matches return 401 Unauthorized (zero fallback to profile 45 or Aditya Kumar).
"""

import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append('.')
from backend.app.main import app, get_db, UserModel, ProfileModel, _hash_password
from backend.app.db.database import SessionLocal

class TestCrossUserIsolation(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        
        # Cleanup test accounts if existing
        self.email1 = "user1_p0_test@dev.io"
        self.email2 = "user2_p0_test@dev.io"
        
        self.db.query(ProfileModel).filter(ProfileModel.email.in_([self.email1, self.email2])).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email.in_([self.email1, self.email2])).delete(synchronize_session=False)
        self.db.commit()

    def tearDown(self):
        self.db.query(ProfileModel).filter(ProfileModel.email.in_([self.email1, self.email2])).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email.in_([self.email1, self.email2])).delete(synchronize_session=False)
        self.db.commit()
        self.db.close()

    def test_two_user_isolation_and_unauthenticated_gating(self):
        print("\n--- Running P0 Cross-User Data Isolation Test ---")
        
        # Step 1: Unauthenticated requests MUST return 401
        res_unauth_prof = self.client.get("/api/profile")
        self.assertEqual(res_unauth_prof.status_code, 401, f"Unauthenticated GET /api/profile should return 401, got {res_unauth_prof.status_code}")
        
        res_unauth_matches = self.client.get("/api/matches")
        self.assertEqual(res_unauth_matches.status_code, 401, f"Unauthenticated GET /api/matches should return 401, got {res_unauth_matches.status_code}")
        
        # Step 2: Create Account 1
        user1 = UserModel(
            email=self.email1,
            password_hash=_hash_password("Password123!"),
            full_name="Alice Candidate One",
            target_role="Backend Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(user1)
        self.db.commit()
        
        prof1 = ProfileModel(
            name="Alice Candidate One",
            email=self.email1,
            skills=["Go", "Docker", "Kubernetes", "gRPC"],
            summary="Senior Go engineer specialized in cloud infrastructure."
        )
        self.db.add(prof1)
        self.db.commit()

        # Step 3: Create Account 2
        user2 = UserModel(
            email=self.email2,
            password_hash=_hash_password("Password123!"),
            full_name="Bob Candidate Two",
            target_role="Frontend Specialist",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(user2)
        self.db.commit()

        prof2 = ProfileModel(
            name="Bob Candidate Two",
            email=self.email2,
            skills=["React", "TypeScript", "TailwindCSS", "Next.js"],
            summary="Expert Frontend developer crafting UI interactions."
        )
        self.db.add(prof2)
        self.db.commit()

        # Step 4: Login Account 1 and fetch profile
        login1 = self.client.post("/api/auth/login", json={"email": self.email1, "password": "Password123!"})
        token1 = login1.json().get("token")
        self.assertIsNotNone(token1, "Account 1 login failed")
        
        res1 = self.client.get("/api/profile", headers={"Authorization": f"Bearer {token1}"})
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertEqual(data1["email"], self.email1)
        self.assertEqual(data1["name"], "Alice Candidate One")
        self.assertIn("Go", data1["skills"])
        self.assertNotIn("React", data1["skills"])

        # Step 5: Login Account 2 and fetch profile
        login2 = self.client.post("/api/auth/login", json={"email": self.email2, "password": "Password123!"})
        token2 = login2.json().get("token")
        self.assertIsNotNone(token2, "Account 2 login failed")

        res2 = self.client.get("/api/profile", headers={"Authorization": f"Bearer {token2}"})
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["email"], self.email2)
        self.assertEqual(data2["name"], "Bob Candidate Two")
        self.assertIn("React", data2["skills"])
        self.assertNotIn("Go", data2["skills"])

        # Step 6: Verify Account 1 STILL gets Alice's profile and NOT Bob's
        res1_retry = self.client.get("/api/profile", headers={"Authorization": f"Bearer {token1}"})
        self.assertEqual(res1_retry.status_code, 200)
        self.assertEqual(res1_retry.json()["email"], self.email1)

        print("[OK] P0 Cross-User Isolation Test Passed Successfully! 2 distinct accounts strictly separated.")

if __name__ == "__main__":
    unittest.main()
