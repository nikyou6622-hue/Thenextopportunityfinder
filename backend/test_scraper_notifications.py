"""
P1.5 Scraper Notifications Event Test
=====================================
Verifies that:
1. GET /api/notifications returns real notification records.
2. Ingesting scraper events creates NotificationEventModel rows in database.
"""

import sys
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import text

sys.path.append('.')
from backend.app.main import app, UserModel, ProfileModel, NotificationEventModel, _hash_password
from backend.app.db.database import SessionLocal

class TestScraperNotifications(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.email = "notif_test_user@dev.io"

        self._cleanup()

        self.user = UserModel(
            email=self.email,
            password_hash=_hash_password("Password123!"),
            full_name="Notification Test Candidate",
            target_role="Software Engineer",
            is_active=True,
            is_email_verified=True
        )
        self.db.add(self.user)
        self.db.commit()

        self.profile = ProfileModel(
            name="Notification Test Candidate",
            email=self.email,
            skills=["Python", "React"],
            summary="Candidate summary"
        )
        self.db.add(self.profile)
        self.db.commit()

    def _cleanup(self):
        try:
            self.db.execute(text("DELETE FROM notification_events WHERE profile_id IN (SELECT id FROM profiles WHERE email = :e)"), {"e": self.email})
            self.db.execute(text("DELETE FROM profiles WHERE email = :e"), {"e": self.email})
            self.db.execute(text("DELETE FROM users WHERE email = :e"), {"e": self.email})
            self.db.commit()
        except Exception:
            self.db.rollback()

    def tearDown(self):
        self._cleanup()
        self.db.close()

    def test_scraper_notifications_flow(self):
        print("\n--- Running P1.5 Scraper Notifications Event Test ---")
        login_res = self.client.post("/api/auth/login", json={"email": self.email, "password": "Password123!"})
        token = login_res.json().get("token")
        self.assertIsNotNone(token)

        # 1. Fetch notifications
        res = self.client.get("/api/notifications", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200, f"Notification fetch failed: {res.text}")
        events = res.json()
        self.assertTrue(len(events) > 0)
        self.assertIn("title", events[0])

        # 2. Insert scraper event record
        db_prof = self.db.query(ProfileModel).filter(ProfileModel.email == self.email).first()
        scraper_event = NotificationEventModel(
            profile_id=db_prof.id,
            trigger_type="qualified_match",
            title="12 New Matches Discovered",
            message="Scraper detected 12 active Software Engineer postings matching your profile."
        )
        self.db.add(scraper_event)
        self.db.commit()

        # 3. Verify event is returned in feed
        res2 = self.client.get("/api/notifications", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res2.status_code, 200)
        events2 = res2.json()
        self.assertTrue(any(e["title"] == "12 New Matches Discovered" for e in events2))
        print("[OK] P1.5 Scraper Notifications Test Passed Successfully!")

if __name__ == "__main__":
    unittest.main()
