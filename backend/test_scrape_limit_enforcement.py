"""
test_scrape_limit_enforcement.py — Regression test suite for free scrape usage limit, atomic concurrency, Pro bypass, and audit logging.

Verifies:
1. Free user 5-scrape lifetime limit enforcement (6th request returns HTTP 402 Payment Required).
2. Atomic Concurrency / Race Condition safety: 10 parallel threads firing simultaneously on a fresh free user result in exactly 5 allowed requests and 5 blocked requests (HTTP 402), with final scrapes_used == 5.
3. Pro user bypass: Pro users can trigger >5 scrape requests without count decrement or HTTP 402 errors.
4. Audit log completeness: ScrapeUsageLogModel receives log entries for allowed and blocked attempts.
"""

import unittest
import time
import concurrent.futures
from fastapi import HTTPException
from backend.app.db.database import SessionLocal
from backend.app.db.models import ProfileModel, SubscriptionModel, ScrapeUsageLogModel
from backend.app.security.subscriptions import grant_pro_access
from backend.app.main import record_scrape_action, FREE_SCRAPE_LIMIT


class DummyRequest:
    class Client:
        host = "127.0.0.1"
    client = Client()


class TestScrapeLimitEnforcement(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        ts = int(time.time() * 1000)
        self.test_email = f"test_scrape_user_{ts}@example.com"
        self.profile = ProfileModel(
            name="Scrape Limit Test User",
            email=self.test_email
        )
        self.db.add(self.profile)
        self.db.commit()
        self.db.refresh(self.profile)

        # Create initial free subscription
        self.sub = SubscriptionModel(
            profile_id=self.profile.id,
            plan_tier="free",
            is_active=True,
            scrapes_used=0,
            credits_remaining=5
        )
        self.db.add(self.sub)
        self.db.commit()
        self.db.refresh(self.sub)

    def tearDown(self):
        try:
            self.db.query(ScrapeUsageLogModel).filter(ScrapeUsageLogModel.profile_id == self.profile.id).delete()
            self.db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == self.profile.id).delete()
            self.db.query(ProfileModel).filter(ProfileModel.id == self.profile.id).delete()
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def test_01_free_user_limit_enforcement(self):
        """Verify free user can execute exactly 5 scrapes before receiving HTTP 402."""
        dummy_req = DummyRequest()
        
        # Execute 5 scrapes successfully
        for i in range(1, FREE_SCRAPE_LIMIT + 1):
            res = record_scrape_action(
                request=dummy_req,
                payload={"action_type": "manual_scrape", "profile_id": self.profile.id},
                profile_id=self.profile.id,
                db=self.db
            )
            self.assertTrue(res["allowed"])
            self.assertFalse(res["is_pro"])
            self.assertEqual(res["scrapes_used"], i)
            self.assertEqual(res["scrapes_remaining"], FREE_SCRAPE_LIMIT - i)

        # 6th attempt MUST raise HTTPException 402
        with self.assertRaises(HTTPException) as cm:
            record_scrape_action(
                request=dummy_req,
                payload={"action_type": "manual_scrape", "profile_id": self.profile.id},
                profile_id=self.profile.id,
                db=self.db
            )
        
        self.assertEqual(cm.exception.status_code, 402)
        self.assertIn("used all 5 free discovery searches total", cm.exception.detail)

    def test_02_atomic_concurrency_race_condition(self):
        """Verify 10 parallel threads firing concurrently result in exactly 5 allowed and 5 blocked."""
        profile_id = self.profile.id

        def worker(_):
            db = SessionLocal()
            try:
                res = record_scrape_action(
                    request=DummyRequest(),
                    payload={"action_type": "concurrent_test", "profile_id": profile_id},
                    profile_id=profile_id,
                    db=db
                )
                return ("allowed", res)
            except HTTPException as e:
                return ("blocked", e.status_code)
            except Exception as ex:
                return ("error", str(ex))
            finally:
                db.close()

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(worker, i) for i in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        allowed_count = sum(1 for status, _ in results if status == "allowed")
        blocked_count = sum(1 for status, code in results if status == "blocked" and code == 402)

        self.assertEqual(allowed_count, 5, f"Expected exactly 5 allowed requests, got {allowed_count}")
        self.assertEqual(blocked_count, 5, f"Expected exactly 5 blocked requests, got {blocked_count}")

        # Check DB state with fresh session / refreshed instance
        sub = self.db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile_id).first()
        self.db.refresh(sub)
        self.assertEqual(sub.scrapes_used, 5)
        self.assertEqual(sub.credits_remaining, 0)

    def test_03_pro_user_bypass(self):
        """Verify Pro users can perform >5 scrapes without limits or count increments."""
        grant_pro_access(self.profile.id, self.db, payment_id="pay_pro_test", amount_paid=99.0, months=6)
        dummy_req = DummyRequest()

        for _ in range(10):
            res = record_scrape_action(
                request=dummy_req,
                payload={"action_type": "pro_scrape", "profile_id": self.profile.id},
                profile_id=self.profile.id,
                db=self.db
            )
            self.assertTrue(res["allowed"])
            self.assertTrue(res["is_pro"])
            self.assertEqual(res["scrapes_remaining"], 999999)

    def test_04_audit_log_verification(self):
        """Verify audit log entries are generated for allowed and blocked requests."""
        dummy_req = DummyRequest()

        # Run 5 allowed
        for _ in range(FREE_SCRAPE_LIMIT):
            record_scrape_action(
                request=dummy_req,
                payload={"action_type": "audit_test", "profile_id": self.profile.id},
                profile_id=self.profile.id,
                db=self.db
            )

        # Run 1 blocked
        try:
            record_scrape_action(
                request=dummy_req,
                payload={"action_type": "audit_test", "profile_id": self.profile.id},
                profile_id=self.profile.id,
                db=self.db
            )
        except HTTPException:
            pass

        logs = self.db.query(ScrapeUsageLogModel).filter(ScrapeUsageLogModel.profile_id == self.profile.id).all()
        self.assertGreaterEqual(len(logs), 6)

        allowed_logs = [l for l in logs if l.status == "allowed"]
        blocked_logs = [l for l in logs if l.status == "blocked_limit_reached"]

        self.assertEqual(len(allowed_logs), 5)
        self.assertEqual(len(blocked_logs), 1)


if __name__ == "__main__":
    unittest.main()
