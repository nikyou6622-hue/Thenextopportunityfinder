import sys
from fastapi.testclient import TestClient
from backend.app.main import app

def test_auth_pipeline():
    client = TestClient(app)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health check OK")

    # 2. Signup
    test_email = "test_developer_2026@nof.io"
    signup_data = {
        "full_name": "Aditya Dev",
        "email": test_email,
        "password": "Password123!",
        "target_role": "Backend Engineer",
        "experience_level": "1-3 years exp"
    }
    res = client.post("/api/auth/signup", json=signup_data)
    # 200 or 409 if already exists
    if res.status_code == 200:
        data = res.json()
        assert data["success"] is True
        assert data["user"]["email"] == test_email
        print(f"[PASS] Signup OK: {data['message']}")
    elif res.status_code == 409:
        print("[INFO] User already registered, proceeding to login test")
    else:
        assert False, f"Unexpected signup status: {res.status_code}, {res.text}"

    # 3. Login with correct credentials
    login_data = {
        "email": test_email,
        "password": "Password123!"
    }
    res = client.post("/api/auth/login", json=login_data)
    assert res.status_code == 200, f"Login failed: {res.text}"
    login_res = res.json()
    assert login_res["success"] is True
    assert "token" in login_res
    print(f"[PASS] Login OK: Token {login_res['token'][:16]}...")

    # 4. Login with incorrect password
    bad_login = {
        "email": test_email,
        "password": "WrongPassword!"
    }
    res = client.post("/api/auth/login", json=bad_login)
    assert res.status_code == 401, f"Bad login should return 401: {res.status_code}"
    print("[PASS] Bad login rejected with 401")

    # 5. Get current user
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    me_data = res.json()
    assert me_data["authenticated"] is True
    print(f"[PASS] Auth Me OK: {me_data['user']['full_name']}")

    # 6. Supabase-style 6-Digit OTP Token Generation
    otp_email = "otp_candidate_2026@nof.io"
    otp_req = {
        "email": otp_email,
        "type": "login"
    }
    otp_res = client.post("/api/auth/send-otp", json=otp_req)
    assert otp_res.status_code == 200, f"Send OTP failed: {otp_res.text}"
    otp_data = otp_res.json()
    assert otp_data["success"] is True
    assert "demo_otp" in otp_data
    assert len(otp_data["demo_otp"]) == 6
    print(f"[PASS] Send OTP OK: Code {otp_data['demo_otp']} generated for {otp_email}")

    # 7. Verify OTP Token with wrong code
    verify_bad = {
        "email": otp_email,
        "token": "000000"
    }
    verify_bad_res = client.post("/api/auth/verify-otp", json=verify_bad)
    assert verify_bad_res.status_code == 400
    print("[PASS] Invalid OTP token rejected with 400")

    # 8. Verify OTP Token with valid code
    verify_good = {
        "email": otp_email,
        "token": otp_data["demo_otp"],
        "full_name": "Priya Sharma",
        "target_role": "AI Research Engineer"
    }
    verify_good_res = client.post("/api/auth/verify-otp", json=verify_good)
    assert verify_good_res.status_code == 200
    verify_good_data = verify_good_res.json()
    assert verify_good_data["success"] is True
    assert verify_good_data["user"]["email"] == otp_email
    assert "token" in verify_good_data
    print(f"[PASS] Verify OTP OK: User {verify_good_data['user']['full_name']} authenticated with token")

    # 9. Logout
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    print("[PASS] Logout OK")

    print("\n==========================================")
    print("ALL AUTHENTICATION & OTP TESTS PASSED WITH 100%!")
    print("==========================================")

if __name__ == "__main__":
    test_auth_pipeline()
