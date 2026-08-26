import time
import os
import sys
import logging

# Ensure root dir is in path
sys.path.insert(0, os.path.abspath('.'))

from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import JobModel, ProfileModel, MatchModel
from backend.app.agents.agent3_matching import compute_match
from backend.app.main import run_matching_pipeline, get_active_profile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("benchmark")

def run_benchmark():
    db = SessionLocal()
    try:
        profile = get_active_profile(db)
        if not profile:
            profile = ProfileModel(
                name="Test Benchmark Candidate",
                email="benchmark@test.com",
                skills=["Python", "FastAPI", "React", "PostgreSQL", "Docker", "AWS"],
                raw_resume_text="Senior Full Stack Software Engineer with 5 years experience in Python, FastAPI, React, Node.js, PostgreSQL, Docker, AWS, and system design.",
                location={"city": "Bengaluru", "country": "India"}
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # 1. Benchmark against current DB volume
        total_current_jobs = db.query(JobModel).count()
        t0 = time.perf_counter()
        run_matching_pipeline(db, profile, max_jobs_to_match=200)
        t1 = time.perf_counter()
        fast_sync_time_ms = round((t1 - t0) * 1000, 2)

        t0_full = time.perf_counter()
        run_matching_pipeline(db, profile, max_jobs_to_match=None)
        t1_full = time.perf_counter()
        current_full_time_ms = round((t1_full - t0_full) * 1000, 2)

        # 2. Benchmark against simulated 1,000+ job dataset
        if total_current_jobs < 1000:
            logger.info(f"Seeding simulated jobs to test 1,000+ volume (current DB: {total_current_jobs})...")
            simulated_jobs = []
            for i in range(total_current_jobs, 1050):
                simulated_jobs.append(JobModel(
                    company=f"SimTech {i}",
                    role_title=f"Senior Software Engineer #{i}",
                    location="Bengaluru, India",
                    location_type="Hybrid",
                    remote=(i % 2 == 0),
                    required_skills=["Python", "FastAPI", "React", "PostgreSQL", "Kafka"] if i % 3 == 0 else ["Java", "Spring Boot", "AWS"],
                    domain="fintech" if i % 2 == 0 else "backend",
                    role_type="full-time",
                    description=f"Simulated benchmark job description #{i} for testing large-scale matching performance.",
                    apply_url=f"https://careers.simtech{i}.com/job/{i}",
                    link_status="live",
                    status="active",
                    source="Benchmark Test Harness"
                ))
            db.bulk_save_objects(simulated_jobs)
            db.commit()

        total_sim_jobs = db.query(JobModel).count()

        # Fast Sync Match timing at 1,000+ volume
        t0_sim_fast = time.perf_counter()
        run_matching_pipeline(db, profile, max_jobs_to_match=200)
        t1_sim_fast = time.perf_counter()
        sim_fast_time_ms = round((t1_sim_fast - t0_sim_fast) * 1000, 2)

        # Full Match timing at 1,000+ volume
        t0_sim_full = time.perf_counter()
        run_matching_pipeline(db, profile, max_jobs_to_match=None)
        t1_sim_full = time.perf_counter()
        sim_full_time_ms = round((t1_sim_full - t0_sim_full) * 1000, 2)

        print("\n=======================================================")
        print("    NEXTOPPORTUNITYFIND MATCHING PIPELINE BENCHMARK    ")
        print("=======================================================")
        print(f"Current DB Jobs Count:           {total_current_jobs}")
        print(f"Simulated DB Jobs Count:         {total_sim_jobs}")
        print(f"Fast Sync Match (200 Jobs Limit):{sim_fast_time_ms} ms")
        print(f"Full Catalog Match (1,050 Jobs):  {sim_full_time_ms} ms")
        print("=======================================================\n")

    finally:
        db.close()

if __name__ == "__main__":
    run_benchmark()
