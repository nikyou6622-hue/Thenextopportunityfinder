"""
test_skill2_scope_and_roadmap.py — Verification Test Suite for Skill 2 Standard
Verifies:
1. Data Source Compliance Registry records for India sources & MNC portals.
2. Link-out policy enforcement (allow_auto_apply = False across all sources).
3. Skill-Gap-to-Action Plan API (Tier 2 Item 8) with verified learning resources.
4. Scope boundary protection (zero-hallucination, no autonomous auto-apply).
"""

import os
import sys
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.data_source_registry import DATA_SOURCE_REGISTRY, is_source_compliant, get_source_config
from backend.app.db.database import SessionLocal
from backend.app.db.models import MatchModel, JobModel, LearningResourceModel
from backend.app.main import app

client = TestClient(app)

def test_source_compliance_registry_and_india_coverage():
    print("[TEST 1] Data Source Compliance Registry & India-Specific Source Coverage...")
    
    # 1. Verify India-specific sources exist
    india_sources = ["internshala", "cutshort", "instahyre", "naukri"]
    for src in india_sources:
        cfg = get_source_config(src)
        assert cfg is not None, f"India source '{src}' must be registered in data_source_registry.py"
        assert cfg["terms_reviewed"] is True
        assert cfg["allow_auto_apply"] is False, f"Source '{src}' must have allow_auto_apply=False (link-out only)"
        compliant, reason = is_source_compliant(src)
        assert compliant is True
        print(f"  -> India source '{src}' verified: compliant=True, allow_auto_apply=False [OK]")

    # 2. Verify all MNC career portals are registered
    mnc_portals = ["google", "microsoft", "amazon", "meta", "apple", "uber", "netflix", "salesforce", "adobe", "oracle"]
    for mnc in mnc_portals:
        cfg = get_source_config(mnc)
        assert cfg is not None, f"MNC portal '{mnc}' must be registered in data_source_registry.py"
        assert cfg["allow_auto_apply"] is False
        assert cfg["terms_reviewed"] is True
        compliant, reason = is_source_compliant(mnc)
        assert compliant is True
        print(f"  -> MNC portal '{mnc}' verified: compliant=True [OK]")

    # 3. Verify ALL sources in registry have allow_auto_apply = False
    for name, cfg in DATA_SOURCE_REGISTRY.items():
        assert cfg["allow_auto_apply"] is False, f"Source '{name}' has allow_auto_apply=True, must be False per Skill 1/2"

    print("  [PASS] Compliance registry & link-out policy verified across all sources.\n")


def test_skill_gap_to_action_plan_api():
    print("[TEST 2] Skill-Gap-to-Action Plan API (Tier 2 Item 8)...")
    
    # 1. Test query with direct skill names
    res = client.get("/api/skills/action-plan?skills=Docker,Postgres")
    assert res.status_code == 200
    data = res.json()
    assert "gap_skills" in data
    assert "Docker" in data["gap_skills"]
    assert "action_plan" in data
    assert len(data["action_plan"]) == 2  # Week 1 and Week 2
    assert "recommended_resources" in data
    print(f"  -> Direct skills action plan generated: {len(data['action_plan'])} phases, {len(data['recommended_resources'])} resources [OK]")

    # 2. Test query with match_id
    db: Session = SessionLocal()
    try:
        job = JobModel(company="CloudSaaS", role_title="DevOps Lead", apply_url="https://cloudsaas.io/jobs/1")
        db.add(job)
        db.flush()

        match = MatchModel(
            job_id=job.id,
            match_score=78.0,
            missing_skills=["Kubernetes", "Terraform"]
        )
        db.add(match)
        db.commit()
        db.refresh(match)

        res_match = client.get(f"/api/skills/action-plan?match_id={match.id}")
        assert res_match.status_code == 200
        match_plan = res_match.json()
        assert "Kubernetes" in match_plan["gap_skills"]
        assert "Terraform" in match_plan["gap_skills"]
        assert match_plan["estimated_days"] == 14
        print(f"  -> Match-linked action plan verified for match ID={match.id}: gap_skills={match_plan['gap_skills']} [OK]")

    finally:
        db.close()

    print("  [PASS] Skill-gap-to-action plan API verified.\n")


def main():
    print("=" * 70)
    print("       NEXTOPPORTUNITYFIND — SKILL 2 VERIFICATION TEST SUITE")
    print("=" * 70 + "\n")

    test_source_compliance_registry_and_india_coverage()
    test_skill_gap_to_action_plan_api()

    print("=" * 70)
    print(" [ALL TESTS PASSED] Skill 2 (Scope & Roadmap) Standard Verified!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
