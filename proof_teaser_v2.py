"""
Proof script for Addendum v2 Teaser Pattern (5 Unlocked + Masked Teasers Beyond 5th)
"""
import sys
import os
import json
import hashlib
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app.main import app, get_db, UserModel, ProfileModel, JobModel, MatchModel, SubscriptionModel, _hash_password
from backend.app.db.database import SessionLocal, Base, engine
from backend.app.security.subscriptions import grant_pro_access, revoke_pro_access

def run_proof():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Setup Free User & 12 matches
    free_email = "proof.free@test.com"
    free_user = db.query(UserModel).filter(UserModel.email == free_email).first()
    if free_user:
        free_prof = db.query(ProfileModel).filter(ProfileModel.email == free_email).first()
        if free_prof:
            db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == free_prof.id).delete()
            db.query(MatchModel).filter(MatchModel.profile_id == free_prof.id).delete()
            db.query(ProfileModel).filter(ProfileModel.id == free_prof.id).delete()
        db.query(UserModel).filter(UserModel.id == free_user.id).delete()
        db.commit()

    free_user = UserModel(full_name="Proof Free User", email=free_email, password_hash=_hash_password("pass"))
    free_prof = ProfileModel(name="Proof Free User", email=free_email, skills=["Python", "FastAPI"])
    db.add(free_user)
    db.add(free_prof)
    db.commit()
    revoke_pro_access(free_prof.id, db)

    # 2. Setup Pro User & 12 matches
    pro_email = "proof.pro@test.com"
    pro_user = db.query(UserModel).filter(UserModel.email == pro_email).first()
    if pro_user:
        pro_prof = db.query(ProfileModel).filter(ProfileModel.email == pro_email).first()
        if pro_prof:
            db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == pro_prof.id).delete()
            db.query(MatchModel).filter(MatchModel.profile_id == pro_prof.id).delete()
            db.query(ProfileModel).filter(ProfileModel.id == pro_prof.id).delete()
        db.query(UserModel).filter(UserModel.id == pro_user.id).delete()
        db.commit()

    pro_user = UserModel(full_name="Proof Pro User", email=pro_email, password_hash=_hash_password("pass"))
    pro_prof = ProfileModel(name="Proof Pro User", email=pro_email, skills=["Python", "FastAPI"])
    db.add(pro_user)
    db.add(pro_prof)
    db.commit()
    grant_pro_access(pro_prof.id, db, payment_id="pay_proof_pro", amount_paid=99.0, months=6)

    # Populate 12 jobs & matches
    for i in range(1, 13):
        job = JobModel(
            company=f"TechCorp {i}",
            role_title=f"Senior Software Engineer {i}",
            apply_url=f"https://techcorp{i}.com/apply",
            description=f"Full detailed engineering description for role {i}",
            required_skills=["Python", "FastAPI", "PostgreSQL"],
            status="active"
        )
        db.add(job)
        db.flush()
        
        m_free = MatchModel(job_id=job.id, profile_id=free_prof.id, match_score=98.0 - i)
        m_pro = MatchModel(job_id=job.id, profile_id=pro_prof.id, match_score=98.0 - i)
        db.add(m_free)
        db.add(m_pro)
    db.commit()

    client = TestClient(app)

    # Free Tier Request
    free_token = f"nof_tok_{hashlib.md5(free_email.encode()).hexdigest()[:8]}_test"
    res_free = client.get("/api/matches", headers={"Authorization": f"Bearer {free_token}"})
    free_data = res_free.json()

    # Pro Tier Request
    pro_token = f"nof_tok_{hashlib.md5(pro_email.encode()).hexdigest()[:8]}_test"
    res_pro = client.get("/api/matches", headers={"Authorization": f"Bearer {pro_token}"})
    pro_data = res_pro.json()

    print("================================================================")
    print("      ADDENDUM V2: REAL API PROOF (FREE vs PRO TIER)           ")
    print("================================================================")
    print("\n--- 1. FREE-TIER API RESPONSE SUMMARY ---")
    print(f"Status Code: {res_free.status_code}")
    print(f"Total Matches Returned in Array: {len(free_data.get('matches', []))}")
    print(f"Locked Count (Remaining Teasers): {free_data.get('locked_count')}")
    
    print("\n--- SAMPLE ITEM #1 (TOP 5 UNLOCKED) ---")
    item_1 = free_data['matches'][0]
    print(f"  * is_locked: {item_1.get('is_locked')}")
    print(f"  * role_title: {item_1['job'].get('role_title')}")
    print(f"  * company: {item_1['job'].get('company')}")
    print(f"  * apply_url: {item_1['job'].get('apply_url')}")
    print(f"  * match_score: {item_1.get('match_score')}")

    print("\n--- SAMPLE ITEM #6 (MASKED TEASER BEYOND 5TH) ---")
    item_6 = free_data['matches'][5]
    print(f"  * is_locked: {item_6.get('is_locked')}")
    print(f"  * role_title: {item_6['job'].get('role_title')} (VISIBLE TEASER TITLE)")
    print(f"  * company: {item_6['job'].get('company')} (MASKED NULL)")
    print(f"  * apply_url: {item_6['job'].get('apply_url')} (MASKED NULL)")
    print(f"  * description: {item_6['job'].get('description')} (MASKED NULL)")
    print(f"  * match_score: {item_6.get('match_score')} (VISIBLE TEASER SCORE)")
    print(f"  * matched_skills: {item_6.get('matched_skills')} (VISIBLE TEASER SKILLS)")

    print("\n--- 2. PRO-TIER REGRESSION CHECK ---")
    print(f"Status Code: {res_pro.status_code}")
    print(f"Total Matches Returned: {len(pro_data.get('matches', []))}")
    print(f"Locked Count: {pro_data.get('locked_count')}")
    pro_locked_flags = [m.get("is_locked", False) for m in pro_data.get("matches", [])]
    print(f"Any Pro Match Locked? {any(pro_locked_flags)} (Must be False)")
    print("================================================================")

    db.close()

if __name__ == "__main__":
    run_proof()
