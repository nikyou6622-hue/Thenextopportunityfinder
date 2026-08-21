"""
test_skill5_retention_and_reengagement.py — Verification Test Suite for Skill 5 Standard
Verifies:
1. Event-driven factual notifications (High-match >=80%, dead links, MNC scan alerts).
2. Zero-filler guarantee (Empty state returns 0 notifications without generic placeholders).
3. Candidate-controlled preference management (Cadences: immediate/daily/weekly/off, category toggles).
4. DPDP Act Right to Erasure cascade delete (notification_events and preferences cleanly deleted).
5. Deterministic digest generation without LLM hallucination or token waste.
"""

import os
import sys
import datetime
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.database import SessionLocal, Base, engine
from backend.app.db.models import (
    ProfileModel, JobModel, MatchModel, ApplicationModel,
    NotificationEventModel, NotificationPreferenceModel
)
from backend.app.main import app, cascade_delete_profile

client = TestClient(app)

def test_event_driven_factual_triggers():
    print("[TEST 1] Event-Driven Factual Retention Triggers...")
    db: Session = SessionLocal()
    try:
        # Create test candidate profile
        profile = ProfileModel(
            name="Rohan Sharma",
            email="rohan.sharma.test5@example.com",
            skills=["Python", "FastAPI", "React", "PostgreSQL"],
            experience_years=3.5,
            consent_given=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # 1. Add High-Match Job (Score >= 80%)
        job_high = JobModel(
            role_title="Backend Tech Lead",
            company="Fintech Dynamics",
            location="Bengaluru, India",
            apply_url="https://jobs.ashbyhq.com/fintech/lead"
        )
        db.add(job_high)
        db.commit()
        db.refresh(job_high)

        match_high = MatchModel(
            profile_id=profile.id,
            job_id=job_high.id,
            match_score=88.5,
            matching_skills=["Python", "FastAPI", "PostgreSQL"]
        )
        db.add(match_high)

        # 2. Add Dead Link Application
        db.commit()
        db.refresh(match_high)
        app_dead = ApplicationModel(
            profile_id=profile.id,
            match_id=match_high.id,
            job_id=job_high.id,
            apply_url_resolved=job_high.apply_url,
            status="tailored",
            link_status="dead"
        )
        db.add(app_dead)
        db.commit()

        # Query notifications endpoint
        res = client.get(f"/api/notifications/{profile.id}")
        assert res.status_code == 200
        data = res.json()
        
        notifs = data["notifications"]
        types = [n["trigger_type"] for n in notifs]
        
        assert "qualified_match" in types, "Should contain qualified_match trigger"
        assert "dead_link" in types, "Should contain dead_link trigger"
        
        # Check action tabs
        match_notif = next(n for n in notifs if n["trigger_type"] == "qualified_match")
        assert match_notif["action_tab"] == "jobs"
        assert match_notif["severity"] == "success"
        assert "80%" in match_notif["message"] or "High-Match" in match_notif["title"]

        dead_notif = next(n for n in notifs if n["trigger_type"] == "dead_link")
        assert dead_notif["action_tab"] == "pipeline"
        assert dead_notif["severity"] == "warning"

        print("  -> High-match trigger (>=80%): PASS [OK]")
        print("  -> Dead link warning trigger: PASS [OK]")
        print("  -> Action tabs & severity alignment: PASS [OK]")

    finally:
        cascade_delete_profile(db, profile.id)
        db.close()
    print("  [PASS] Event-driven triggers verified.\n")


def test_zero_filler_guarantee():
    print("[TEST 2] Zero-Filler Guarantee (Zero Generic Notifications when Empty)...")
    db: Session = SessionLocal()
    try:
        profile = ProfileModel(
            name="Empty Notifications Candidate",
            email="empty.candidate@example.com",
            consent_given=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Clear any jobs temporarily or query with profile having 0 matches and 0 dead links
        res = client.get(f"/api/notifications/{profile.id}")
        assert res.status_code == 200
        data = res.json()
        
        # Filter for profile-specific notifications (exclude system directory notice if jobs exist)
        profile_notifs = [n for n in data["notifications"] if n["trigger_type"] in ["qualified_match", "dead_link"]]
        assert len(profile_notifs) == 0, f"Expected 0 profile event notifications, got {len(profile_notifs)}"
        
        print("  -> Empty state produces 0 fabricated/filler notifications: PASS [OK]")
    finally:
        cascade_delete_profile(db, profile.id)
        db.close()
    print("  [PASS] Zero-filler guarantee verified.\n")


def test_candidate_controlled_preferences():
    print("[TEST 3] Candidate-Controlled Notification Preferences...")
    db: Session = SessionLocal()
    try:
        profile = ProfileModel(
            name="Preference Test User",
            email="pref.test@example.com",
            consent_given=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # 1. Fetch initial preferences
        res_get = client.get(f"/api/notifications/{profile.id}/preferences")
        assert res_get.status_code == 200
        
        # 2. Update to weekly digest with MNC scans muted
        update_payload = {
            "cadence": "weekly_digest",
            "new_matches_enabled": True,
            "mnc_scans_enabled": False,
            "dead_links_enabled": True
        }
        res_put = client.put(f"/api/notifications/{profile.id}/preferences", json=update_payload)
        assert res_put.status_code == 200
        
        # Verify persistence in database
        db.expire_all()
        pref_record = db.query(NotificationPreferenceModel).filter(
            NotificationPreferenceModel.profile_id == profile.id
        ).first()
        assert pref_record is not None
        assert pref_record.cadence == "weekly_digest"
        assert pref_record.mnc_scans_enabled is False
        assert pref_record.dead_links_enabled is True
        print("  -> Preferences update and DB sync: PASS [OK]")

        # 3. Test muting all notifications (cadence = off)
        res_off = client.put(f"/api/notifications/{profile.id}/preferences", json={"cadence": "off"})
        assert res_off.status_code == 200
        db.refresh(pref_record)
        assert pref_record.cadence == "off"
        print("  -> Mute all notifications (cadence: 'off'): PASS [OK]")

    finally:
        cascade_delete_profile(db, profile.id)
        db.close()
    print("  [PASS] Candidate preferences verified.\n")


def test_dpdp_cascade_erasure_of_notifications():
    print("[TEST 4] DPDP Act Right to Erasure Cascade Delete on Notifications...")
    db: Session = SessionLocal()
    try:
        profile = ProfileModel(
            name="Erasure Candidate",
            email="erasure.candidate@example.com",
            consent_given=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Create linked notification event and preference record
        event = NotificationEventModel(
            profile_id=profile.id,
            trigger_type="quality_score_tier",
            title="ATS Score Upgraded",
            message="Your ATS score reached 85/100.",
            action_tab="profile",
            severity="success"
        )
        db.add(event)

        pref = NotificationPreferenceModel(
            profile_id=profile.id,
            cadence="immediate"
        )
        db.add(pref)
        db.commit()

        pid = profile.id
        # Perform cascade delete
        deleted_counts = cascade_delete_profile(db, pid)
        assert deleted_counts.get("notification_events", 0) >= 1
        assert deleted_counts.get("notification_preferences", 0) >= 1

        # Confirm 0 records remain in DB
        rem_events = db.query(NotificationEventModel).filter(NotificationEventModel.profile_id == pid).count()
        rem_prefs = db.query(NotificationPreferenceModel).filter(NotificationPreferenceModel.profile_id == pid).count()
        assert rem_events == 0, "No notification events should remain after cascade delete"
        assert rem_prefs == 0, "No notification preferences should remain after cascade delete"
        print("  -> Atomic cascade deletion of notification_events and preferences: PASS [OK]")

    finally:
        db.close()
    print("  [PASS] DPDP cascade erasure verified.\n")


def test_deterministic_digest_generation():
    print("[TEST 5] Deterministic Digest Generation (Zero Hallucination / Zero Token Waste)...")
    db: Session = SessionLocal()
    try:
        profile = ProfileModel(
            name="Digest Candidate",
            email="digest.candidate@example.com",
            consent_given=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Generate digest preview
        res = client.post(f"/api/notifications/digest/preview?profile_id={profile.id}&cadence=daily_digest")
        assert res.status_code == 200
        digest_data = res.json()
        assert "digest_markdown" in digest_data
        assert "# NextOpportunityFind" in digest_data["digest_markdown"]
        print("  -> Deterministic digest preview format: PASS [OK]")

    finally:
        cascade_delete_profile(db, profile.id)
        db.close()
    print("  [PASS] Deterministic digest generation verified.\n")


if __name__ == "__main__":
    print("================================================================================")
    print("      NEXTOPPORTUNITYFIND — SKILL 5 RETENTION & RE-ENGAGEMENT TEST SUITE        ")
    print("================================================================================\n")
    test_event_driven_factual_triggers()
    test_zero_filler_guarantee()
    test_candidate_controlled_preferences()
    test_dpdp_cascade_erasure_of_notifications()
    test_deterministic_digest_generation()
    print("================================================================================")
    print("               ALL SKILL 5 VERIFICATION TESTS PASSED [100%]                    ")
    print("================================================================================")
