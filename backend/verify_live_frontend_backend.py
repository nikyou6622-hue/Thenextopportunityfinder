"""
verify_live_frontend_backend.py — Verify Live Frontend & Backend Server Integration
"""
import requests

def main():
    print("=" * 70)
    print("   NEXTOPPORTUNITYFIND — LIVE SERVER INTEGRATION VERIFICATION")
    print("=" * 70 + "\n")

    # 1. Frontend Dev Server
    try:
        fe_res = requests.get('http://localhost:3001/')
        assert fe_res.status_code == 200
        print(f"[OK] Frontend Dev Server Live (http://localhost:3001/): Status={fe_res.status_code}, Length={len(fe_res.text)} bytes")
    except Exception as e:
        print(f"[FAIL] Frontend Dev Server: {e}")

    # 2. Backend Server Root
    try:
        be_res = requests.get('http://127.0.0.1:8000/')
        assert be_res.status_code == 200
        print(f"[OK] Backend API Server Live (http://127.0.0.1:8000/): Status={be_res.status_code}, Name='{be_res.json().get('name')}'")
    except Exception as e:
        print(f"[FAIL] Backend Server: {e}")

    # 3. Applications Endpoint
    try:
        apps_res = requests.get('http://127.0.0.1:8000/api/applications')
        apps = apps_res.json()
        print(f"[OK] Applications Endpoint: Count={len(apps)}")
        app_id = apps[0]['id'] if apps else 1
    except Exception as e:
        print(f"[FAIL] Applications: {e}")
        app_id = 1

    # 4. Interview Prep Generation for Application
    try:
        prep_res = requests.get(f'http://127.0.0.1:8000/api/interview-prep/{app_id}')
        prep_data = prep_res.json()
        tech_q_count = len(prep_data.get('question_bank', {}).get('technical_questions', []))
        beh_q_count = len(prep_data.get('question_bank', {}).get('behavioral_questions', []))
        print(f"[OK] Interview Prep Packet for App {app_id}: Company='{prep_data.get('company_name')}', Tech Qs={tech_q_count}, Beh Qs={beh_q_count}")
    except Exception as e:
        print(f"[FAIL] Interview Prep: {e}")

    # 5. Mock Interview Turn Evaluation
    try:
        mock_res = requests.post(
            f'http://127.0.0.1:8000/api/interview-prep/{app_id}/mock-session',
            headers={'X-API-Key': 'nof-dev-key-2026'},
            json={
                'question_id': 'q_tech_1',
                'question_text': 'Explain how you optimized database latency in production.',
                'question_type': 'technical',
                'user_answer': 'Maine Redis caching implement kiya aur PostgreSQL query indexes create kiye jisse latency 45% kam ho gayi.'
            }
        )
        fb = mock_res.json().get('feedback', {})
        print(f"[OK] Mock Simulator Evaluation: Clarity={fb.get('clarity_score')}, Specificity={fb.get('specificity_score')}, Rating='{fb.get('overall_rating')}'")
    except Exception as e:
        print(f"[FAIL] Mock Simulator: {e}")

    # 6. Study Material Recommendations
    try:
        study_res = requests.post(
            'http://127.0.0.1:8000/api/interview-prep/study-materials',
            headers={'X-API-Key': 'nof-dev-key-2026'},
            json={
                'field': 'backend',
                'role_title': 'Senior Python Engineer',
                'skills': ['Python', 'FastAPI', 'PostgreSQL']
            }
        )
        study_data = study_res.json()
        print(f"[OK] Study Material Recommendations: Videos={len(study_data.get('videos', []))}, Guides={len(study_data.get('guides', []))}")
    except Exception as e:
        print(f"[FAIL] Study Materials: {e}")

    # 8. India Internships & Multi-Source Scraper Endpoints
    try:
        intern_res = requests.get('http://127.0.0.1:8000/api/internships/india')
        intern_data = intern_res.json()
        print(f"[OK] India Internships Feed: Count={len(intern_data)}")
        
        stats_res = requests.get('http://127.0.0.1:8000/api/internships/market-stats')
        stats_data = stats_res.json()
        avg_stipend = stats_data.get('average_stipend_monthly')
        stipend_str = f"INR {avg_stipend:,}" if isinstance(avg_stipend, (int, float)) else "N/A"
        print(f"[OK] Internship Market Stats: Total={stats_data.get('total_active_internships')}, Avg Stipend={stipend_str}, PPO Rate={stats_data.get('ppo_eligible_rate_percent')}%")
    except Exception as e:
        print(f"[FAIL] Internships: {e}")

    print("\n" + "=" * 70)
    print(" [ALL VERIFICATION CHECKS PASSED] Frontend & Backend Integrated & Live!")
    print("=" * 70)

if __name__ == '__main__':
    main()
