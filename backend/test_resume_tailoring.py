"""
P1.1 Resume Tailoring Feature Test
===================================
Verifies that:
1. Tailoring by match_id or job_id succeeds and produces real output.
2. Zero errors or 404s occur when requesting tailoring for valid opportunities.
"""

import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append('.')
from backend.app.main import app, UserModel, ProfileModel, JobModel, MatchModel, ApplicationModel, _hash_password
from backend.app.db.database import SessionLocal

class TestResumeTailoring(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.email = "tailor_test_user@dev.io"
        
        # FK-safe cleanup
        p_ids = [p.id for p in self.db.query(ProfileModel.id).filter(ProfileModel.email == self.email).all()]
        if p_ids:
            m_ids = [m.id for m in self.db.query(MatchModel.id).filter(MatchModel.profile_id.in_(p_ids)).all()]
            if m_ids:
                self.db.query(ApplicationModel).filter(ApplicationModel.match_id.in_(m_ids)).delete(synchronize_session=False)
            self.db.query(MatchModel).filter(MatchModel.profile_id.in_(p_ids)).delete(synchronize_session=False)
            self.db.query(ProfileModel).filter(ProfileModel.email == self.email).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email == self.email).delete(synchronize_session=False)
        self.db.commit()

        self.user = UserModel(
            email=self.email,
            password_hash=_hash_password("Password123!"),
            full_name="Tailor Test User",
            target_role="Software Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(self.user)
        self.db.commit()

        self.profile = ProfileModel(
            name="Tailor Test User",
            email=self.email,
            skills=["Python", "FastAPI", "React", "PostgreSQL"],
            summary="Experienced developer."
        )
        self.db.add(self.profile)
        self.db.commit()

        self.job = self.db.query(JobModel).first()
        if not self.job:
            self.job = JobModel(
                company="Test Corp",
                role_title="Backend Developer",
                required_skills=["Python", "FastAPI"],
                description="Engineering role."
            )
            self.db.add(self.job)
            self.db.commit()

    def tearDown(self):
        p_ids = [p.id for p in self.db.query(ProfileModel.id).filter(ProfileModel.email == self.email).all()]
        if p_ids:
            m_ids = [m.id for m in self.db.query(MatchModel.id).filter(MatchModel.profile_id.in_(p_ids)).all()]
            if m_ids:
                self.db.query(ApplicationModel).filter(ApplicationModel.match_id.in_(m_ids)).delete(synchronize_session=False)
            self.db.query(MatchModel).filter(MatchModel.profile_id.in_(p_ids)).delete(synchronize_session=False)
            self.db.query(ProfileModel).filter(ProfileModel.email == self.email).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email == self.email).delete(synchronize_session=False)
        self.db.commit()
        self.db.close()

    def test_resume_tailoring_flow(self):
        print("\n--- Running P1.1 Resume Tailoring Test ---")
        login_res = self.client.post("/api/auth/login", json={"email": self.email, "password": "Password123!"})
        token = login_res.json().get("token")
        self.assertIsNotNone(token)

        res = self.client.post(f"/api/applications/tailor/{self.job.id}", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200, f"Tailoring by job_id failed: {res.text}")
        data = res.json()
        self.assertIn("application_id", data)
        self.assertEqual(data.get("message"), "Application tailored successfully")
        print("[OK] P1.1 Resume Tailoring Test Passed Successfully!")

if __name__ == "__main__":
    unittest.main()
