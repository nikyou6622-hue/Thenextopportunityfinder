import os
import sys
import logging

sys.path.insert(0, os.path.abspath('.'))

from backend.app.agents.agent2_discovery import fetch_remoteok_live_jobs
from backend.app.agents.agent2d_global_jobs_scraper import search_linkedin_guest_jobs, search_freehire_jobs
from backend.app.agents.agent2b_mnc_scanner import MNC_TARGET_CONFIG

logging.basicConfig(level=logging.INFO)

def test_live_counts():
    print("\n=======================================================")
    print("      LIVE SCRAPER COUNT RUN (ACTUAL RETURNED DATA)     ")
    print("=======================================================")

    # 1. RemoteOK Live API
    remoteok_jobs = fetch_remoteok_live_jobs(max_results=100)
    print(f"RemoteOK Live API Returned:       {len(remoteok_jobs)} jobs")

    # 2. LinkedIn Guest API
    linkedin_jobs = search_linkedin_guest_jobs(query="Software Engineer", location="India", limit=100)
    print(f"LinkedIn Guest API Returned:      {len(linkedin_jobs)} jobs")

    # 3. FreeHire API
    freehire_jobs = search_freehire_jobs(query="Software", limit=100)
    print(f"FreeHire Aggregator Returned:     {len(freehire_jobs)} jobs")

    # 4. MNC Portal Config Classification
    js_rendered_targets = [c for c in MNC_TARGET_CONFIG if c.get("requires_js")]
    print(f"MNC Portals Configured (JS Req):  {len(js_rendered_targets)} companies ({', '.join([c['company'] for c in js_rendered_targets])})")
    print("=======================================================\n")

if __name__ == "__main__":
    test_live_counts()
