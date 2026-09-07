import time
import logging
from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal
from backend.app.db.models import ProfileModel, JobModel, MatchModel
from backend.app.main import run_matching_pipeline, bulk_upsert_matches

import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_benchmarks():
    db: Session = SessionLocal()
    try:
        total_jobs = db.query(JobModel).filter(JobModel.status == "active", JobModel.link_status != "dead").count()
        print(f"=== Total Active Jobs in DB: {total_jobs} ===")
        sys.stdout.flush()

        # Scenario 1: Small Resume
        p_small = db.query(ProfileModel).filter(ProfileModel.email == "bench_small@test.com").first()
        if not p_small:
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

        print("\n--- Running Scenario 1: Small Resume ---")
        sys.stdout.flush()
        t0 = time.time()
        run_matching_pipeline(db, p_small, max_jobs_to_match=None)
        dt_small = time.time() - t0
        print(f"Scenario 1 Total Wall Time: {dt_small:.4f}s")
        sys.stdout.flush()

        # Scenario 2: Dense Resume
        p_dense = db.query(ProfileModel).filter(ProfileModel.email == "bench_dense@test.com").first()
        if not p_dense:
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

        print("\n--- Running Scenario 2: Dense Resume ---")
        sys.stdout.flush()
        t0 = time.time()
        run_matching_pipeline(db, p_dense, max_jobs_to_match=None)
        dt_dense = time.time() - t0
        print(f"Scenario 2 Total Wall Time: {dt_dense:.4f}s")
        sys.stdout.flush()

        # Scenario 3: Full Job Catalog
        p_catalog = db.query(ProfileModel).filter(ProfileModel.email == "bench_catalog@test.com").first()
        if not p_catalog:
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

        print("\n--- Running Scenario 3: Full Catalog Run ---")
        sys.stdout.flush()
        t0 = time.time()
        run_matching_pipeline(db, p_catalog, max_jobs_to_match=None)
        dt_catalog = time.time() - t0
        print(f"Scenario 3 Total Wall Time: {dt_catalog:.4f}s")
        sys.stdout.flush()

    finally:
        db.close()

if __name__ == "__main__":
    run_benchmarks()
