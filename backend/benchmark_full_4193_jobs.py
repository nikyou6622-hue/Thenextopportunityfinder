import os
import sys
import time
import logging

os.environ["USE_SQLITE_TEST"] = "1"

from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import ProfileModel, JobModel, MatchModel
from backend.app.main import run_matching_pipeline

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_4193_jobs_and_run():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Pre-cleanup
        db.query(MatchModel).delete()
        db.query(JobModel).delete()
        db.query(ProfileModel).delete()
        db.commit()

        print("=== Seeding 4,193 JobModel rows into database for full catalog benchmark ===")
        sys.stdout.flush()

        # Seed 4,193 jobs
        jobs_to_create = []
        domains = ["backend", "frontend", "fullstack", "devops", "data", "mobile", "ai_ml"]
        skills_pool = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL", "Docker", "AWS", "FastAPI", "Kubernetes", "GraphQL", "Redis", "MongoDB", "Go", "Java"]

        for i in range(1, 4194):
            jobs_to_create.append(JobModel(
                company=f"TechCorp {i}",
                role_title=f"Software Engineer {i}",
                location="Bengaluru" if i % 2 == 0 else "Remote",
                remote=(i % 2 == 1),
                required_skills=[skills_pool[i % len(skills_pool)], skills_pool[(i + 3) % len(skills_pool)], skills_pool[(i + 7) % len(skills_pool)]],
                domain=domains[i % len(domains)],
                description=f"Job description text for position {i} containing extensive details about responsibilities, qualifications, and requirements. " * 10,
                is_technical=True,
                source_trust_tier="tier1_verified",
                status="active",
                link_status="live"
            ))

        db.bulk_save_objects(jobs_to_create)
        db.commit()

        job_count = db.query(JobModel).count()
        print(f"=== Database ready with exactly {job_count} active jobs ===")
        sys.stdout.flush()

        # 1. Scenario 1: Small Resume (2 skills)
        p_small = ProfileModel(
            name="Small Resume Candidate",
            email="bench_small@test.com",
            skills=["Python", "SQL"],
            experience_years=1.0,
            domains=["backend"]
        )
        db.add(p_small)
        db.commit()
        db.refresh(p_small)

        print("\n--- Running Scenario 1: Small Resume (4,193 Jobs Scanned) ---")
        sys.stdout.flush()
        t0 = time.time()
        run_matching_pipeline(db, p_small, max_jobs_to_match=None)
        dt_small = time.time() - t0
        print(f"Scenario 1 Total Wall Time: {dt_small:.4f}s")
        sys.stdout.flush()

        # 2. Scenario 2: Dense Resume (15 skills)
        p_dense = ProfileModel(
            name="Dense Resume Candidate",
            email="bench_dense@test.com",
            skills=["Python", "SQL", "Docker", "FastAPI", "PostgreSQL", "Redis", "AWS", "Kubernetes", "GraphQL", "React", "Node.js", "TypeScript", "CI/CD", "Linux", "Git"],
            experience_years=6.0,
            domains=["backend", "cloud", "devops"]
        )
        db.add(p_dense)
        db.commit()
        db.refresh(p_dense)

        print("\n--- Running Scenario 2: Dense Resume (4,193 Jobs Scanned) ---")
        sys.stdout.flush()
        t0 = time.time()
        run_matching_pipeline(db, p_dense, max_jobs_to_match=None)
        dt_dense = time.time() - t0
        print(f"Scenario 2 Total Wall Time: {dt_dense:.4f}s")
        sys.stdout.flush()

        # 3. Scenario 3: Full Catalog Candidate (7 skills)
        p_catalog = ProfileModel(
            name="Full Catalog Candidate",
            email="bench_catalog@test.com",
            skills=["Python", "SQL", "FastAPI", "React", "Docker", "PostgreSQL", "AWS"],
            experience_years=4.0,
            domains=["backend", "frontend", "fullstack"]
        )
        db.add(p_catalog)
        db.commit()
        db.refresh(p_catalog)

        print("\n--- Running Scenario 3: Full 4,193-Job Catalog Run ---")
        sys.stdout.flush()
        t0 = time.time()
        run_matching_pipeline(db, p_catalog, max_jobs_to_match=None)
        dt_catalog = time.time() - t0
        print(f"Scenario 3 Total Wall Time: {dt_catalog:.4f}s")
        sys.stdout.flush()

    finally:
        db.close()

if __name__ == "__main__":
    setup_4193_jobs_and_run()
