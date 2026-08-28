"""
P0.5 Job Deduplication Unit & Integration Test
===============================================
Verifies that no duplicate job appears twice in a single /api/matches response for any profile.
"""

import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append('.')
from backend.app.main import app, UserModel, ProfileModel, _hash_password
from backend.app.db.database import SessionLocal

class TestJobDeduplication(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.email = "dedupe_test_user@dev.io"
        
        self.db.query(ProfileModel).filter(ProfileModel.email == self.email).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email == self.email).delete(synchronize_session=False)
        self.db.commit()

        # Create active test user & profile
        self.user = UserModel(
            email=self.email,
            password_hash=_hash_password("Password123!"),
            full_name="Dedupe Test User",
            target_role="Software Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(self.user)
        self.db.commit()

        self.profile = ProfileModel(
            name="Dedupe Test User",
            email=self.email,
            skills=["Python", "FastAPI", "React", "PostgreSQL"],
            summary="Full stack candidate for dedupe verification."
        )
        self.db.add(self.profile)
        self.db.commit()

    def tearDown(self):
        self.db.query(ProfileModel).filter(ProfileModel.email == self.email).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email == self.email).delete(synchronize_session=False)
        self.db.commit()
        self.db.close()

    def test_no_duplicate_jobs_in_matches_feed(self):
        print("\n--- Running P0.5 Job Deduplication Test ---")
        login_res = self.client.post("/api/auth/login", json={"email": self.email, "password": "Password123!"})
        token = login_res.json().get("token")
        self.assertIsNotNone(token)

        res = self.client.get("/api/matches", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200, f"GET /api/matches failed: {res.text}")

        matches = res.json()
        seen_job_ids = set()
        seen_urls = set()
        seen_role_keys = set()

        duplicate_found = False
        duplicate_details = []

        for m in matches:
            job = m.get("job") or m
            job_id = job.get("id") or m.get("job_id")
            apply_url = (job.get("apply_url_resolved") or job.get("apply_url") or "").strip().lower()
            role_key = f"{(job.get('company') or '').strip().lower()}::{(job.get('role_title') or '').strip().lower()}"

            if job_id in seen_job_ids:
                duplicate_found = True
                duplicate_details.append(f"Duplicate Job ID: {job_id}")
            seen_job_ids.add(job_id)

            if apply_url and apply_url != "#":
                if apply_url in seen_urls:
                    duplicate_found = True
                    duplicate_details.append(f"Duplicate Apply URL: {apply_url}")
                seen_urls.add(apply_url)

            if role_key and role_key != "::":
                if role_key in seen_role_keys:
                    duplicate_found = True
                    duplicate_details.append(f"Duplicate Role Key: {role_key}")
                seen_role_keys.add(role_key)

        self.assertFalse(duplicate_found, f"Duplicate jobs found in /api/matches response: {duplicate_details}")
        print(f"[OK] P0.5 Deduplication Test Passed! Evaluated {len(matches)} match items, 0 duplicates.")

if __name__ == "__main__":
    unittest.main()
