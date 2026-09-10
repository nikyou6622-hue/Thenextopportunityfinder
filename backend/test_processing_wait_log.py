import unittest
import os
import sys

# Ensure backend package import path
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.database import get_db, Base, engine
from backend.app.db.models import ProcessingWaitLogModel

class TestProcessingWaitLogTelemetry(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        Base.metadata.create_all(bind=engine)

    def test_01_log_processing_wait_success(self):
        payload = {
            "action_type": "ats_scoring",
            "duration_ms": 1250,
            "outcome": "success",
            "scope": "inline"
        }
        res = self.client.post("/api/telemetry/processing-wait-log", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertTrue(data.get("logged"))
        self.assertEqual(data.get("action_type"), "ats_scoring")
        self.assertEqual(data.get("duration_ms"), 1250)

    def test_02_log_processing_wait_timeout(self):
        payload = {
            "action_type": "discovery_search",
            "duration_ms": 30050,
            "outcome": "timeout",
            "scope": "fullpage"
        }
        res = self.client.post("/api/telemetry/processing-wait-log", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("outcome"), "timeout")

    def test_03_get_processing_wait_summary(self):
        res = self.client.get("/api/telemetry/processing-wait-summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("metrics", data)
        self.assertIn("recent_logs", data)
        metrics = data.get("metrics", {})
        self.assertIn("ats_scoring", metrics)
        self.assertGreaterEqual(metrics["ats_scoring"]["total_runs"], 1)

if __name__ == "__main__":
    unittest.main()
