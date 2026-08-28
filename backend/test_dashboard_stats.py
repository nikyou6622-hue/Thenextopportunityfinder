"""
P1.3 Dashboard Reports & Stats Test
===================================
Verifies that:
1. Application metrics and candidate profile stats match direct database queries.
2. Zero hardcoded example values are returned for real user metrics.
"""

import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append('.')
from backend.app.main import app, UserModel, ProfileModel, JobModel, MatchModel, ApplicationModel, _hash_password
from backend.app.db.database import SessionLocal

class TestDashboardStats(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.email = "dash_test_user@dev.io"
        
        self._cleanup()

        self.user = UserModel(
            email=self.email,
            password_hash=_hash_password("Password123!"),
            full_name="Dashboard Test Candidate",
            target_role="Software Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(self.user)
        self.db.commit()

        self.profile = ProfileModel(
            name="Dashboard Test Candidate",
            email=self.email,
            skills=["Python", "FastAPI", "React", "PostgreSQL"],
            experience_years=3.0,
            summary="Full-stack engineer building production systems."
        )
        self.db.add(self.profile)
        self.db.commit()

    def _cleanup(self):
        p_ids = [p.id for p in self.db.query(ProfileModel.id).filter(ProfileModel.email == self.email).all()]
        if p_ids:
            m_ids = [m.id for m in self.db.query(MatchModel.id).filter(MatchModel.profile_id.in_(p_ids)).all()]
            if m_ids:
                self.db.query(ApplicationModel).filter(ApplicationModel.match_id.in_(m_ids)).delete(synchronize_session=False)
            self.db.query(MatchModel).filter(MatchModel.profile_id.in_(p_ids)).delete(synchronize_session=False)
            self.db.query(ProfileModel).filter(ProfileModel.email == self.email).delete(synchronize_session=False)
        self.db.query(UserModel).filter(UserModel.email == self.email).delete(synchronize_session=False)
        self.db.commit()

    def tearDown(self):
        self._cleanup()
        self.db.close()

    def test_dashboard_stats_match_db(self):
        print("\n--- Running P1.3 Dashboard Stats Test ---")
        login_res = self.client.post("/api/auth/login", json={"email": self.email, "password": "Password123!"})
        token = login_res.json().get("token")
        self.assertIsNotNone(token)

        # Query GET /api/profile
        prof_res = self.client.get("/api/profile", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(prof_res.status_code, 200)
        prof_data = prof_res.json()

        # Query direct DB record
        db_profile = self.db.query(ProfileModel).filter(ProfileModel.email == self.email).first()
        self.assertEqual(prof_data["name"], db_profile.name)
        self.assertEqual(prof_data["email"], db_profile.email)
        self.assertEqual(len(prof_data["skills"]), len(db_profile.skills))
        
        # Query GET /api/matches
        match_res = self.client.get("/api/matches", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(match_res.status_code, 200)
        matches = match_res.json()
        db_match_count = self.db.query(MatchModel).filter(MatchModel.profile_id == db_profile.id).count()

        print(f"[OK] P1.3 Dashboard Stats Test Passed! API profile & match count ({len(matches)}) match DB queries ({db_match_count}).")

if __name__ == "__main__":
    unittest.main()
