"""
Script to create a clean Free-tier test user account and profile in the database.
"""
import sys
import os
import datetime
import hashlib
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app.main import Base, engine, _hash_password
from backend.app.db.database import SessionLocal
from backend.app.db.models import UserModel, ProfileModel, SubscriptionModel, MatchModel, JobModel
from backend.app.security.subscriptions import revoke_pro_access

def create_free_test_user():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    email = "freeuser@test.com"
    password = "TestPassword123!"
    full_name = "Free Tier Test User"

    # Clean existing user/profile/subscription records for clean setup
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    existing_profile = db.query(ProfileModel).filter(ProfileModel.email == email).first()

    if existing_profile:
        db.query(MatchModel).filter(MatchModel.profile_id == existing_profile.id).delete()
        db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == existing_profile.id).delete()
        db.query(ProfileModel).filter(ProfileModel.id == existing_profile.id).delete()

    if existing_user:
        db.query(UserModel).filter(UserModel.id == existing_user.id).delete()

    db.commit()

    # Create new User Model
    pwd_hash = _hash_password(password)
    avatar_seed = full_name.replace(" ", "+")
    avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={avatar_seed}"

    user = UserModel(
        full_name=full_name,
        email=email,
        password_hash=pwd_hash,
        target_role="Software Development Engineer",
        experience_level="Entry Level / Student",
        avatar_url=avatar_url,
        is_active=True,
        is_email_verified=True,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create new Profile Model
    profile = ProfileModel(
        name=full_name,
        email=email,
        phone="+91 9876543210",
        location={"city": "Bengaluru", "country": "India", "open_to_remote": True},
        skills=["Python", "JavaScript", "React", "FastAPI", "PostgreSQL", "Node.js", "Docker", "Git"],
        experience_years=1.5,
        domains=["sde", "full stack", "backend"],
        summary="Aspiring Software Engineer skilled in Python, React, FastAPI, PostgreSQL, and scalable web architectures.",
        consent_given=True,
        consent_timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Ensure profile is strictly Free tier (revoke any existing Pro access)
    revoke_pro_access(profile.id, db)
    db.commit()

    print("=========================================================")
    print("      FREE TIER TEST ACCOUNT CREATED SUCCESSFULLY       ")
    print("=========================================================")
    print(f"  Full Name:      {user.full_name}")
    print(f"  Email:          {user.email}")
    print(f"  Password:       {password}")
    print(f"  User ID:        {user.id}")
    print(f"  Profile ID:     {profile.id}")
    print(f"  Access Level:   free")
    print("=========================================================")

    db.close()

if __name__ == "__main__":
    create_free_test_user()
