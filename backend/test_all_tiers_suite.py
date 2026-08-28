"""
All Tiers Full Regression & Compliance Test Suite
=================================================
Runs all tier verification tests sequentially:
- P0: Cross-user data isolation
- P0.5: Job catalog deduplication
- P1.1: Resume tailoring feature & offline summary fallback
- P1.2: Google OAuth backend sign-in
- P1.3: Dynamic dashboard reports & database stats matching
- P1.4: Profile review-and-save persistence
- P1.5: Scraper event notifications feed
"""

import unittest
import sys

sys.path.append('.')

from backend.test_cross_user_isolation import TestCrossUserIsolation
from backend.test_job_deduplication import TestJobDeduplication
from backend.test_resume_tailoring import TestResumeTailoring
from backend.test_google_oauth import TestGoogleOAuth
from backend.test_dashboard_stats import TestDashboardStats
from backend.test_resume_save_persistence import TestResumeSavePersistence
from backend.test_scraper_notifications import TestScraperNotifications

def run_full_suite():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTest(loader.loadTestsFromTestCase(TestCrossUserIsolation))
    suite.addTest(loader.loadTestsFromTestCase(TestJobDeduplication))
    suite.addTest(loader.loadTestsFromTestCase(TestResumeTailoring))
    suite.addTest(loader.loadTestsFromTestCase(TestGoogleOAuth))
    suite.addTest(loader.loadTestsFromTestCase(TestDashboardStats))
    suite.addTest(loader.loadTestsFromTestCase(TestResumeSavePersistence))
    suite.addTest(loader.loadTestsFromTestCase(TestScraperNotifications))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_full_suite()
    if not success:
        sys.exit(1)
