"""
test_skills_integration.py — Comprehensive Integration Tests for Imported ai-job-search Skills
Tests Salary Intelligence, Multi-ATS & LinkedIn Ingestion, Language Gate,
Zero-Hallucination Fact Verification, and LaTeX ModernCV / Cover Letter Generation.
"""

import unittest
from backend.app.agents.salary_intelligence import normalize_company_name, lookup_salary_benchmark
from backend.app.agents.agent2d_global_jobs_scraper import search_freehire_jobs, search_linkedin_guest_jobs, get_combined_global_feed
from backend.app.agents.agent3_matching import evaluate_language_gate, evaluate_dealbreakers, compute_match
from backend.app.agents.agent4_tailor import verify_tailored_claims, tailor_resume_for_job
from backend.app.agents.agent4_export_generator import generate_tex_resume, generate_tex_cover_letter, generate_resume


class TestSkillsTransferIntegration(unittest.TestCase):

    def test_01_salary_normalization(self):
        """Tests that legal noise and entity suffixes are stripped cleanly."""
        self.assertEqual(normalize_company_name("Google India Pvt Ltd"), "google")
        self.assertEqual(normalize_company_name("Novo Nordisk A/S"), "novo nordisk")
        self.assertEqual(normalize_company_name("Stripe, Inc."), "stripe")
        self.assertEqual(normalize_company_name("Accenture Services Group"), "accenture")
        self.assertEqual(normalize_company_name("Hasura Technologies LLC"), "hasura")

    def test_02_salary_benchmark_lookup(self):
        """Tests salary range computation, tier detection, and negotiation advice."""
        # Tier 1 Product (Google)
        bench_g = lookup_salary_benchmark("Google India Pvt Ltd", "Senior Software Engineer", "Bengaluru")
        self.assertIn("Tier 1", bench_g["tier_rating"])
        self.assertGreater(bench_g["min_inr_raw"], 3000000)
        self.assertIn("negotiate", bench_g["negotiation_tip"].lower())

        # Tier 2 Unicorn (Stripe)
        bench_s = lookup_salary_benchmark("Stripe", "Software Engineer", "Remote")
        self.assertIn("Tier 2", bench_s["tier_rating"])
        self.assertIn("$", bench_s["annual_usd_range"])

        # Tier 3 MNC Consulting (Accenture)
        bench_a = lookup_salary_benchmark("Accenture", "Software Developer", "India")
        self.assertIn("Tier 3", bench_a["tier_rating"])

        # Internship calculation
        bench_i = lookup_salary_benchmark("Google", "Software Engineering Intern", "Hyderabad")
        self.assertTrue(bench_i["is_internship"])
        self.assertIn("month", bench_i["monthly_stipend_inr_range"])

    def test_03_global_jobs_ingestion(self):
        """Tests FreeHire and LinkedIn public job feeds with attached salary data."""
        freehire_jobs = search_freehire_jobs(query="Python", limit=5)
        self.assertGreater(len(freehire_jobs), 0)
        first_job = freehire_jobs[0]
        self.assertIn("title", first_job)
        self.assertIn("company", first_job)
        self.assertIn("salary_benchmark", first_job)

        linkedin_jobs = search_linkedin_guest_jobs(query="Software Engineer", location="India", limit=5)
        self.assertGreater(len(linkedin_jobs), 0)

        combined = get_combined_global_feed(query="", limit=10)
        self.assertGreater(len(combined), 0)

    def test_04_language_gate(self):
        """Tests language gating for international jobs requiring undeclared languages."""
        profile_langs = [{"language": "English", "level": "Native"}, {"language": "Hindi", "level": "Native"}]
        
        # Job requiring German C1
        german_jd = "Senior Backend Engineer. Must have C1 German or fließend Deutsch proficiency for Munich office."
        passed_de, alert_de = evaluate_language_gate(profile_langs, german_jd)
        self.assertFalse(passed_de)
        self.assertIn("German", alert_de)

        # Job in English
        eng_jd = "Senior Python Engineer. Strong communication skills in English."
        passed_en, alert_en = evaluate_language_gate(profile_langs, eng_jd)
        self.assertTrue(passed_en)
        self.assertIsNone(alert_en)

    def test_05_dealbreaker_evaluation(self):
        """Tests candidate dealbreaker enforcement."""
        profile_dealbreakers = {
            "remote_only": True,
            "blacklisted_companies": ["Acme Corp"]
        }
        
        onsite_job = {"company": "Tech Innovations", "location": "Onsite Mumbai", "remote": False}
        passed_os, issues_os = evaluate_dealbreakers(profile_dealbreakers, onsite_job)
        self.assertFalse(passed_os)
        self.assertIn("Remote Only", issues_os[0])

        blacklisted_job = {"company": "Acme Corp Ltd", "location": "Remote", "remote": True}
        passed_bl, issues_bl = evaluate_dealbreakers(profile_dealbreakers, blacklisted_job)
        self.assertFalse(passed_bl)
        self.assertIn("Acme Corp", issues_bl[0])

    def test_06_matching_engine_with_gates(self):
        """Tests compute_match integrating Language Gate and Dealbreakers."""
        profile = {
            "name": "Jane Doe",
            "skills": ["Python", "FastAPI", "PostgreSQL"],
            "domains": ["backend"],
            "languages": ["English"],
            "dealbreakers": {"remote_only": True},
            "location": {"city": "Bengaluru", "country": "India", "open_to_remote": True},
            "raw_resume_text": "Experienced Python and FastAPI backend engineer."
        }
        
        # Job requiring French and Onsite
        gated_job = {
            "role_title": "Backend Developer",
            "company": "Paris Tech",
            "required_skills": ["Python", "FastAPI"],
            "domain": "backend",
            "location": "Paris, France (Onsite)",
            "remote": False,
            "description": "Looking for fluent French Python developer for on-site Paris headquarters."
        }
        
        match_res = compute_match(profile, gated_job)
        self.assertFalse(match_res["language_gate_passed"])
        self.assertFalse(match_res["dealbreakers_passed"])
        self.assertFalse(match_res["is_qualified"])
        self.assertGreater(len(match_res.get("adaptive_feedback", [])), 0)

    def test_07_zero_hallucination_verification_pass(self):
        """Tests fact verification audit on generated tailored text."""
        profile = {
            "name": "John Smith",
            "skills": ["Python", "FastAPI", "PostgreSQL"],
            "raw_resume_text": "Built REST APIs with Python, FastAPI, and PostgreSQL."
        }

        # Safe summary (only mentions verified skills)
        safe_summary = "Software Engineer with deep expertise in Python, FastAPI, and PostgreSQL optimization."
        audit_safe = verify_tailored_claims(safe_summary, profile)
        self.assertEqual(audit_safe["fact_verification_status"], "VERIFIED_SAFE")
        self.assertEqual(audit_safe["hallucination_risk_score"], 0.0)

        # Hallucinated summary (claims Rust and Kubernetes unverified)
        hallucinated_summary = "Expert engineer specialized in Rust, Kubernetes, Solidity, and PyTorch."
        audit_bad = verify_tailored_claims(hallucinated_summary, profile)
        self.assertNotEqual(audit_bad["fact_verification_status"], "VERIFIED_SAFE")
        self.assertGreater(audit_bad["hallucination_risk_score"], 0.0)
        self.assertGreater(len(audit_bad["unsupported_claims"]), 0)

    def test_08_latex_moderncv_generation(self):
        """Tests LaTeX ModernCV (.tex) code synthesis."""
        profile = {
            "name": "Alex Johnson",
            "email": "alex@example.com",
            "phone": "+91 9988776655",
            "skills": ["Python", "Go", "Kubernetes", "PostgreSQL"],
            "summary": "Distributed systems engineer passionate about resilient backend architectures.",
            "experience": [{"title": "Senior Backend Engineer", "company": "Stripe", "period": "2024 -- Present", "description": "Led payment gateway scaling."}],
            "education": [{"degree": "B.Tech in CS", "institution": "IIT", "year": "2024"}],
            "location": {"city": "Bengaluru", "country": "India"}
        }

        tex_output = generate_tex_resume(profile)
        self.assertIn("\\documentclass[11pt,a4paper,sans]{moderncv}", tex_output)
        self.assertIn("\\moderncvstyle{banking}", tex_output)
        self.assertIn("Alex", tex_output)
        self.assertIn("Stripe", tex_output)
        self.assertIn("\\end{document}", tex_output)

        # Test generate_resume with format='tex'
        gen_res = generate_resume(profile, format="tex")
        self.assertIn("moderncv", gen_res.content)

        # Test LaTeX Cover Letter
        job = {"company": "Google", "role_title": "Staff Software Engineer"}
        cl_output = generate_tex_cover_letter(profile, job)
        self.assertIn("\\documentclass", cl_output)
        self.assertIn("Google", cl_output)
        self.assertIn("Staff Software Engineer", cl_output)


if __name__ == '__main__':
    unittest.main()
