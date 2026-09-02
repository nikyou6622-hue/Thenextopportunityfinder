"""
test_internship_scrapers.py — Comprehensive Test Suite for Multi-Source Internship Scrapers & Aggregator Engine

Verifies:
1. Source-Specific Parsers & Helpers:
   - Internshala parser (stipend, location, duration, PPO, skills, description marker).
   - Cuvette dedicated parser (skill badges, stipend, duration, PPO tags).
   - JSON-LD parser (internship filtering, distinct external_id generation on fallback URLs).
   - Generic HTML parser.
   - Numeric stipend parser (monthly INR detection, range midpoint calculation, non-monthly rejection).
   - Description marker builder & skill extractor.
   - Deduplication by external_id.
2. Robots.txt (Fail-Closed Policy):
   - Allowed paths on valid robots.txt.
   - Fail-closed on 404, 500, or network timeouts.
3. Concurrent URL Validation:
   - Network failures / exceptions mapped to 'unverified' (NOT 'dead').
   - Empty apply URLs mapped to 'dead'.
4. Database Upserts & Batch Storage (store_jobs_batch):
   - Inserts and updates JobModel under source_category='internship_india'.
   - Correct persistence of all URL fields and source platform.
   - Candidate profile matching (MatchModel) calculation.
5. Full Scan & Market Stats:
   - Async & sync scan execution (run_india_internship_scan).
   - Retrieval with filters (get_india_internships).
   - Real-time market analytics (get_internship_market_stats).
6. FastAPI Endpoints:
   - GET /api/internships/india
   - POST /api/internships/india/scan
   - GET /api/internships/market-stats
"""

import os
import sys
import asyncio
import unittest
from unittest.mock import patch, MagicMock, AsyncMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from backend.app.db.database import SessionLocal, engine
from backend.app.db.models import JobModel, MatchModel, ProfileModel
from backend.app.main import app

from backend.app.agents.agent2c_india_internships_scraper import (
    SourceTarget,
    parse_internshala,
    parse_cuvette,
    parse_json_ld,
    parse_generic_html,
    parse_numeric_stipend,
    build_description_with_details,
    extract_skills_from_listing,
    deduplicate_listings,
    check_robots_allowed,
    validate_urls_concurrent,
    store_jobs_batch,
    run_india_internship_scan_async,
    run_india_internship_scan,
    get_india_internships,
    get_internship_market_stats,
    _scrape_cache,
    _robots_cache,
    _breakers
)

client = TestClient(app)


class TestInternshipScraperSuite(unittest.TestCase):
    def setUp(self):
        self.db: Session = SessionLocal()
        self.factory = sessionmaker(bind=engine)
        # Clear caches & circuit breakers for test isolation
        _scrape_cache._cache.clear()
        _robots_cache._cache.clear()
        _breakers.clear()
        
        # Clean up test records
        self.db.query(MatchModel).filter(
            MatchModel.job_id.in_(
                self.db.query(JobModel.id).filter(JobModel.external_id.like("test-intern-%"))
            )
        ).delete(synchronize_session=False)
        self.db.query(JobModel).filter(JobModel.external_id.like("test-intern-%")).delete(synchronize_session=False)
        self.db.commit()

    def tearDown(self):
        try:
            self.db.query(MatchModel).filter(
                MatchModel.job_id.in_(
                    self.db.query(JobModel.id).filter(JobModel.external_id.like("test-intern-%"))
                )
            ).delete(synchronize_session=False)
            self.db.query(JobModel).filter(JobModel.external_id.like("test-intern-%")).delete(synchronize_session=False)
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    # ------------------------------------------------------------------------
    # 1. Source-Specific Parsers & Helpers
    # ------------------------------------------------------------------------
    def test_parse_internshala(self):
        print("\n[TEST 1A] Testing Internshala Dedicated Parser...")
        html = """
        <div class="internship_meta">
            <h3 class="job-internship-name">Software Engineering Intern</h3>
            <p class="company-name">Razorpay</p>
            <div class="locations"><span>Remote</span></div>
            <span class="stipend">INR 35,000 / month</span>
            <span class="duration">3-6 Months</span>
            <a class="view_detail_button" href="/internship/razorpay-swe-01">Apply</a>
            <div class="internship_details">Build Python FastAPI backend services with PPO offer track.</div>
        </div>
        """
        source = SourceTarget(name="internshala", company="Internshala", url="https://internshala.com")
        listings = parse_internshala(html, source, max_items=10)

        self.assertEqual(len(listings), 1)
        item = listings[0]
        self.assertEqual(item["role_title"], "Software Engineering Intern")
        self.assertEqual(item["company"], "Razorpay")
        self.assertTrue(item["remote"])
        self.assertEqual(item["location_type"], "Remote: India")
        self.assertEqual(item["apply_url"], "https://internshala.com/internship/razorpay-swe-01")
        self.assertIn("Python", item["required_skills"])
        self.assertTrue(any(s.lower() == "fastapi" for s in item["required_skills"]))
        self.assertIn("[Listing details | Stipend: INR 35,000 / month | Duration: 3-6 Months | PPO: yes]", item["description"])
        self.assertEqual(item["source"], "internshala")

    def test_parse_cuvette(self):
        print("\n[TEST 1B] Testing Cuvette Dedicated Parser...")
        html = """
        <div class="job-card">
            <h3 class="job-title">React Native Mobile Intern</h3>
            <p class="company-name">Zepto</p>
            <span class="location">Mumbai / Remote</span>
            <span class="stipend">INR 40,000 / month</span>
            <span class="duration">6 Months</span>
            <div class="skill-badge">React Native</div>
            <div class="skill-badge">TypeScript</div>
            <a href="/job/zepto-rn-01">View Details</a>
            <p class="job-description">Cross-platform mobile apps development with PPO track.</p>
        </div>
        """
        source = SourceTarget(name="cuvette", company="Cuvette", url="https://cuvette.tech")
        listings = parse_cuvette(html, source, max_items=10)

        self.assertEqual(len(listings), 1)
        item = listings[0]
        self.assertEqual(item["role_title"], "React Native Mobile Intern")
        self.assertEqual(item["company"], "Zepto")
        self.assertTrue(item["remote"])
        self.assertIn("React", item["required_skills"])
        self.assertIn("React Native", item["required_skills"])
        self.assertIn("TypeScript", item["required_skills"])
        self.assertIn("Stipend: INR 40,000 / month", item["description"])
        self.assertIn("PPO: yes", item["description"])

    def test_parse_json_ld_unique_external_ids_and_filtering(self):
        print("\n[TEST 1C] Testing JSON-LD Parser Unique IDs & Internship Filtering...")
        # Two distinct postings that lack their own URL and fall back to source.url,
        # plus one full-time senior role that MUST be filtered out.
        html = """
        <script type="application/ld+json">
        [
            {
                "@type": "JobPosting",
                "title": "Software Engineering Intern - Cloud",
                "hiringOrganization": {"name": "Google India"},
                "jobLocation": {"address": {"addressLocality": "Bengaluru"}},
                "description": "Work on Google Cloud distributed systems."
            },
            {
                "@type": "JobPosting",
                "title": "Silicon Design Intern - TPU",
                "hiringOrganization": {"name": "Google India"},
                "jobLocation": {"address": {"addressLocality": "Hyderabad"}},
                "description": "Work on Google TPU chip architectures."
            },
            {
                "@type": "JobPosting",
                "title": "Staff Principal Engineer",
                "hiringOrganization": {"name": "Google India"},
                "description": "Lead engineering across APAC."
            }
        ]
        </script>
        """
        source = SourceTarget(name="google_careers", company="Google India", url="https://careers.google.com/jobs")
        listings = parse_json_ld(html, source, max_items=10)

        # 1. Staff role is filtered out
        self.assertEqual(len(listings), 2)
        
        # 2. Distinct IDs generated despite sharing the same fallback apply_url
        id1 = listings[0]["external_id"]
        id2 = listings[1]["external_id"]
        self.assertNotEqual(id1, id2, "Fallback URLs must not collide external_id across different job titles")

        # 3. Deduplication preserves both distinct listings
        deduped = deduplicate_listings(listings)
        self.assertEqual(len(deduped), 2)

    def test_stipend_and_details_helpers(self):
        print("\n[TEST 1D] Testing Stipend Parsing & Description Details Builder...")
        # Stipend parsing tests
        self.assertEqual(parse_numeric_stipend("INR 30,000 / month"), 30000)
        self.assertEqual(parse_numeric_stipend("INR 20,000 - INR 40,000 per month"), 30000)
        self.assertEqual(parse_numeric_stipend("INR 45000 monthly"), 45000)
        self.assertIsNone(parse_numeric_stipend("$25 per hour"))  # Non-monthly rejected
        self.assertIsNone(parse_numeric_stipend(None))

        # Description builder
        desc = build_description_with_details("Core role overview", "INR 30,000 / month", "3 Months", True)
        self.assertIn("Core role overview", desc)
        self.assertIn("[Listing details | Stipend: INR 30,000 / month | Duration: 3 Months | PPO: yes]", desc)

        # Skill extractor
        skills = extract_skills_from_listing("Python Developer", "Hands-on experience with Docker, AWS, and PostgreSQL.")
        self.assertIn("Python", skills)
        self.assertIn("Docker", skills)
        self.assertIn("AWS", skills)
        self.assertTrue(any(s.lower() in ("postgres", "postgresql") for s in skills))

    # ------------------------------------------------------------------------
    # 2. Robots.txt Fail-Closed Behavior
    # ------------------------------------------------------------------------
    def test_robots_txt_fail_closed(self):
        print("\n[TEST 2] Testing Robots.txt Fail-Closed Policy...")
        
        # Scenario A: Network error or 404 -> Returns False (Fail-Closed)
        with patch("httpx.AsyncClient.get", side_effect=Exception("Connection refused")):
            allowed, reason = asyncio.run(check_robots_allowed("https://unreachable-domain-test.com/internships"))
            self.assertFalse(allowed)
            self.assertIn("error", reason)

        # Scenario B: Valid robots.txt allowing fetch
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "User-agent: *\nAllow: /"

        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            _robots_cache._cache.clear()
            allowed, reason = asyncio.run(check_robots_allowed("https://permissive-test-site.com/internships"))
            self.assertTrue(allowed)
            self.assertEqual(reason, "parsed")

    # ------------------------------------------------------------------------
    # 3. Concurrent URL Validation & Error Mapping
    # ------------------------------------------------------------------------
    def test_concurrent_url_validation_error_handling(self):
        print("\n[TEST 3] Testing URL Validation Error Mapping (Network Exception -> 'unverified')...")
        sample_listings = [
            {"apply_url": "https://example.com/job-1"},
            {"apply_url": ""},  # Missing URL -> dead
            {"apply_url": "https://error-trigger.com/job-2"}
        ]

        def mock_resolve(url, check_live=True):
            if "error-trigger" in url:
                raise Exception("DNS resolution timeout")
            return url, "live"

        with patch("backend.app.agents.agent2c_india_internships_scraper.resolve_and_validate_apply_url", side_effect=mock_resolve):
            validated = asyncio.run(validate_urls_concurrent(sample_listings))

            self.assertEqual(validated[0]["link_status"], "live")
            self.assertEqual(validated[1]["link_status"], "dead")
            self.assertEqual(validated[2]["link_status"], "unverified", "Network failure must yield 'unverified', never 'dead'")

    # ------------------------------------------------------------------------
    # 4. Database Upserts & Field Persistence (store_jobs_batch)
    # ------------------------------------------------------------------------
    def test_store_jobs_batch_persistence_and_matching(self):
        print("\n[TEST 4] Testing Database Batch Upserts & URL Field Persistence...")
        # Create test candidate profile
        profile = self.db.query(ProfileModel).filter(ProfileModel.email == "test-candidate@nof.io").first()
        if not profile:
            profile = ProfileModel(
                name="Test Intern Candidate",
                email="test-candidate@nof.io",
                skills=["Python", "FastAPI", "React", "Docker"],
                domains=["Full Stack", "Backend"],
                location={"city": "Bengaluru", "country": "India"}
            )
            self.db.add(profile)
            self.db.commit()

        jobs_data = [
            {
                "external_id": "test-intern-001",
                "role_title": "Backend Engineering Intern",
                "company": "Swiggy",
                "location": "Bengaluru",
                "location_type": "On-site: Bengaluru",
                "remote": False,
                "required_skills": ["Python", "FastAPI", "Docker"],
                "domain": "backend / foodtech",
                "description": "High scale API engineering. [Listing details | Stipend: INR 45,000 / month | Duration: 6 Months | PPO: yes]",
                "apply_url": "https://swiggy.com/careers/intern-1",
                "apply_url_raw": "https://swiggy.com/careers/intern-1?utm=source",
                "apply_url_resolved": "https://swiggy.com/careers/intern-1",
                "link_status": "live",
                "source": "swiggy_direct"
            },
            {
                "external_id": "test-intern-002",
                "role_title": "Frontend React Intern",
                "company": "CRED",
                "location": "Remote",
                "location_type": "Remote: India",
                "remote": True,
                "required_skills": ["React", "TypeScript"],
                "domain": "frontend / fintech",
                "description": "Crafting premium user interfaces. [Listing details | Stipend: INR 50,000 / month | Duration: 3-6 Months | PPO: yes]",
                "apply_url": "https://cred.club/careers/intern-2",
                "apply_url_raw": "https://cred.club/careers/intern-2",
                "apply_url_resolved": "https://cred.club/careers/intern-2",
                "link_status": "unverified",
                "source": "cred_direct"
            }
        ]

        created, updated = store_jobs_batch(self.factory, jobs_data, profile.id)
        self.assertEqual(created, 2)
        self.assertEqual(updated, 0)

        # Verify database records
        job1 = self.db.query(JobModel).filter(JobModel.external_id == "test-intern-001").first()
        self.assertIsNotNone(job1)
        self.assertEqual(job1.role_title, "Backend Engineering Intern")
        self.assertEqual(job1.apply_url_resolved, "https://swiggy.com/careers/intern-1")
        self.assertEqual(job1.link_status, "live")
        self.assertEqual(job1.source_platform, "company_direct")

        # Verify candidate match was created
        match1 = self.db.query(MatchModel).filter(MatchModel.job_id == job1.id, MatchModel.profile_id == profile.id).first()
        self.assertIsNotNone(match1)
        self.assertGreater(match1.match_score, 70.0)
        self.assertIn("Python", match1.matching_skills)

        # Test updating existing records
        jobs_data[0]["role_title"] = "Senior Backend Engineering Intern"
        created_2, updated_2 = store_jobs_batch(self.factory, jobs_data, profile.id)
        self.assertEqual(created_2, 0)
        self.assertEqual(updated_2, 2)

        self.db.refresh(job1)
        self.assertEqual(job1.role_title, "Senior Backend Engineering Intern")

    # ------------------------------------------------------------------------
    # 5. Full Async & Sync Scan Integration + Retrieval
    # ------------------------------------------------------------------------
    def test_full_scan_and_market_stats_retrieval(self):
        print("\n[TEST 5] Testing Full Scan Pipeline & Market Stats Retrieval...")
        mock_listings = [
            {
                "external_id": "test-intern-scan-1",
                "role_title": "AI & ML Research Intern",
                "company": "Google India",
                "location": "Bengaluru",
                "location_type": "On-site: Bengaluru",
                "remote": False,
                "required_skills": ["Python", "Machine Learning"],
                "domain": "ai/ml",
                "description": "Cutting edge ML models. [Listing details | Stipend: INR 1,00,000 / month | Duration: 6 Months | PPO: yes]",
                "apply_url": "https://careers.google.com/jobs/1",
                "apply_url_raw": "https://careers.google.com/jobs/1",
                "source": "google_careers"
            }
        ]

        with patch("backend.app.agents.agent2c_india_internships_scraper.fetch_source", return_value=(mock_listings, "success", None)), \
             patch("backend.app.agents.agent2c_india_internships_scraper.validate_urls_concurrent", return_value=mock_listings):

            scan_result = run_india_internship_scan(self.db, force_scan=True)
            self.assertIn("scan_time", scan_result)
            self.assertGreaterEqual(scan_result["successful_scans"], 1)

            # Test get_india_internships retrieval with filters
            all_internships = get_india_internships(self.db, include_dead=True)
            self.assertGreater(len(all_internships), 0)

            # Test min_stipend filter
            high_stipend = get_india_internships(self.db, min_stipend=80000, include_dead=True)
            for item in high_stipend:
                self.assertGreaterEqual(item["stipend_numeric"], 80000)

            # Test market stats
            stats = get_internship_market_stats(self.db)
            self.assertGreater(stats["total_active_internships"], 0)
            self.assertIsNotNone(stats["average_stipend_monthly"])

    # ------------------------------------------------------------------------
    # 6. FastAPI Endpoints Verification
    # ------------------------------------------------------------------------
    def test_fastapi_endpoints(self):
        print("\n[TEST 6] Testing FastAPI HTTP Endpoints...")
        # 1. GET /api/internships/india
        resp = client.get("/api/internships/india")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(isinstance(resp.json(), (list, dict)))

        # 2. GET /api/internships/market-stats
        resp_stats = client.get("/api/internships/market-stats")
        self.assertEqual(resp_stats.status_code, 200)
        self.assertIn("total_active_internships", resp_stats.json())

        # 3. POST /api/internships/india/scan (background task mode)
        resp_scan = client.post("/api/internships/india/scan")
        self.assertEqual(resp_scan.status_code, 200)
        self.assertIn("status", resp_scan.json())
        self.assertEqual(resp_scan.json()["status"], "accepted")

        # 4. POST /api/internships/india/scan?background=false (synchronous mode)
        resp_sync = client.post("/api/internships/india/scan?background=false")
        self.assertEqual(resp_sync.status_code, 200)
        self.assertIn("summary", resp_sync.json())


if __name__ == "__main__":
    unittest.main()
