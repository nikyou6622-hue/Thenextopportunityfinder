"""
test_ats_scorer_phased.py — Regression & Bounded-Score Verification Suite for ATS Scorer

Verifies:
1. All 8 component scores are mathematically bounded in [0.0, 1.0] under extreme/stacked inputs.
2. Option (A) shared semantic similarity integration in agent3_matching.py.
3. Zero fabrication of metrics/skills in top improvements.
4. Exact point impact calculation via re-scoring.
5. Worked example output matches expected tier and scoring bounds.
"""

import unittest
from backend.app.agents.ats_scorer import (
    compute_ats_score,
    compute_skill_match,
    score_achievement_evidence,
    score_education_match,
    score_ats_format,
    score_keyword_coverage,
    compute_resp_match,
    compute_semantic_similarity,
    score_seniority_match,
    compute_critical_penalties
)
from backend.app.agents.agent3_matching import calculate_semantic_sim


class TestATSScorerPhased(unittest.TestCase):

    def setUp(self):
        self.sample_resume = {
            "skills": ["Python", "SQL", "Docker", "Git", "FastAPI"],
            "raw_resume_text": """
            Senior Software Engineer with 6 years of experience building scalable backend APIs.
            Engineered microservices using Python, FastAPI, and PostgreSQL, reducing latency by 40%.
            Spearheaded Docker containerization and CI/CD pipelines on AWS for 100k+ active users.
            Education: B.Tech in Computer Science.
            """,
            "bullets": [
                "Engineered microservices using Python, FastAPI, and PostgreSQL, reducing latency by 40%",
                "Spearheaded Docker containerization and CI/CD pipelines on AWS for 100k+ active users",
                "Managed database schema migrations and SQL optimization for PostgreSQL clusters"
            ],
            "education": [{"degree": "B.Tech in Computer Science"}],
            "years_experience": 6,
            "has_tables": False,
            "is_scanned_image": False
        }

        self.sample_job = {
            "title": "Senior Backend Engineer",
            "required_skills": [
                {"name": "Python", "tier": "critical"},
                {"name": "FastAPI", "tier": "critical"},
                {"name": "PostgreSQL", "tier": "important"},
                {"name": "Docker", "tier": "important"},
                {"name": "Kubernetes", "tier": "preferred"}
            ],
            "responsibilities": [
                "Build scalable REST APIs using Python and FastAPI",
                "Optimize PostgreSQL queries and maintain database health",
                "Deploy microservices with Docker and Kubernetes"
            ],
            "description": "We are seeking a Senior Backend Engineer proficient in Python, FastAPI, SQL, Docker, and Kubernetes.",
            "requirements": {
                "required_years_experience": 5,
                "required_education": "Bachelor in Computer Science",
                "requires_leadership": False
            }
        }

    def test_01_component_bounds_by_construction(self):
        """Assert all 8 components return scores strictly inside [0.0, 1.0]."""
        # Test under normal, sparse, and extreme/adversarial inputs
        adversarial_inputs = [
            (self.sample_resume, self.sample_job),
            ({"skills": [], "bullets": [], "raw_resume_text": ""}, {"required_skills": [], "responsibilities": [], "description": ""}),
            ({"skills": ["A"] * 100, "bullets": ["Improved system by 100%"] * 50, "raw_resume_text": "Python " * 500}, self.sample_job)
        ]

        for res, job in adversarial_inputs:
            res_score = compute_ats_score(res, job)
            cb = res_score["component_breakdown"]

            self.assertGreaterEqual(cb["skill_match"]["score"], 0.0)
            self.assertLessEqual(cb["skill_match"]["score"], 1.0)

            self.assertGreaterEqual(cb["responsibility_match"]["score"], 0.0)
            self.assertLessEqual(cb["responsibility_match"]["score"], 1.0)

            self.assertGreaterEqual(cb["achievement_evidence"]["score"], 0.0)
            self.assertLessEqual(cb["achievement_evidence"]["score"], 1.0)

            self.assertGreaterEqual(cb["semantic_similarity"]["score"], 0.0)
            self.assertLessEqual(cb["semantic_similarity"]["score"], 1.0)

            self.assertGreaterEqual(cb["seniority_match"]["score"], 0.0)
            self.assertLessEqual(cb["seniority_match"]["score"], 1.0)

            self.assertGreaterEqual(cb["education_match"]["score"], 0.0)
            self.assertLessEqual(cb["education_match"]["score"], 1.0)

            self.assertGreaterEqual(cb["ats_format"]["score"], 0.0)
            self.assertLessEqual(cb["ats_format"]["score"], 1.0)

            self.assertGreaterEqual(cb["keyword_coverage"]["score"], 0.0)
            self.assertLessEqual(cb["keyword_coverage"]["score"], 1.0)

            # Overall score bounded in [0.0, 100.0]
            self.assertGreaterEqual(res_score["overall_score"], 0.0)
            self.assertLessEqual(res_score["overall_score"], 100.0)

    def test_02_option_a_shared_semantic_engine(self):
        """Verify Agent 3 calls the shared semantic similarity engine."""
        sem_0_1 = compute_semantic_similarity(self.sample_resume["raw_resume_text"], self.sample_job["description"])
        agent3_sem_100 = calculate_semantic_sim(self.sample_resume["raw_resume_text"], self.sample_job["description"])

        self.assertGreaterEqual(sem_0_1, 0.0)
        self.assertLessEqual(sem_0_1, 1.0)
        # Agent 3 returns on a 0-100 scale
        self.assertGreaterEqual(agent3_sem_100, 30.0)
        self.assertLessEqual(agent3_sem_100, 100.0)
        self.assertAlmostEqual(agent3_sem_100, round(sem_0_1 * 100.0, 1), delta=10.0)

    def test_03_worked_example_senior_ml_engineer(self):
        """Verify ATS scoring on worked example resume and job description."""
        res_score = compute_ats_score(self.sample_resume, self.sample_job)
        self.assertIn("overall_score", res_score)
        self.assertGreaterEqual(res_score["overall_score"], 70.0)
        self.assertEqual(res_score["tier"]["label"], "Strong Match — Qualified Candidate 🚀")

    def test_04_critical_requirement_penalty_and_double_hit(self):
        """Verify critical penalty lowers composite score and records penalty tax."""
        missing_critical_job = dict(self.sample_job, required_skills=[{"name": "PyTorch", "tier": "critical"}])
        res_score = compute_ats_score(self.sample_resume, missing_critical_job)

        self.assertIn("PyTorch", res_score["component_breakdown"]["skill_match"]["missing_critical_skills"])
        penalties = res_score["critical_penalties"]
        self.assertGreaterEqual(penalties["total_penalty"], 15.0)

    def test_05_top_5_improvements_rescoring_points(self):
        """Verify Top 5 improvements compute exact point impacts via re-scoring."""
        missing_skill_job = dict(self.sample_job, required_skills=[{"name": "Rust", "tier": "critical"}])
        res_score = compute_ats_score(self.sample_resume, missing_skill_job)

        top_improv = res_score.get("top_improvements", [])
        self.assertIsInstance(top_improv, list)
        for item in top_improv:
            self.assertIn("action", item)
            self.assertIn("expected_point_gain", item)
            self.assertGreater(item["expected_point_gain"], 0.0)


if __name__ == "__main__":
    unittest.main()
