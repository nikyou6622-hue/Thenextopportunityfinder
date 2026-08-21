# 24 — MISSING FEATURES & FUTURE ROADMAP
**Analysis**: Features required before enterprise scaling vs high-value future enhancements.

---

## 1. Missing Features Classification

### MUST BUILD (Required for Enterprise Scale)
1. **OAuth 2.0 Social Logins**:
   * *Description*: One-click "Sign in with Google" and "Sign in with GitHub" on `AuthView.jsx`.
   * *Why Required*: Lowers friction for developers and engineering students who prefer single-click GitHub auth.
2. **Background Scraper Task Queue & Progress Bar**:
   * *Description*: Offload live scraper runs (`/api/jobs/mnc/scan`) to an asynchronous background worker and provide a real-time progress bar in the UI.
   * *Why Required*: Prevents HTTP connection drops when searching 10+ career portals concurrently.
3. **HTTP-Only Secure Cookie Session Layer**:
   * *Description*: Store JWT access/refresh tokens in signed, HttpOnly cookies instead of browser `localStorage`.

---

### SHOULD BUILD (High-Value Polish)
1. **Progressive Web App (PWA) Offline Manifest**:
   * *Description*: Configure `web/public/manifest.json` and a service worker to enable "Install Thenextopportunity App" on iOS and Android homescreens.
2. **Global Command Palette (`Cmd+K` / `Ctrl+K`)**:
   * *Description*: Keyboard shortcut modal allowing instant navigation, resume template switching, and LeetCode problem search.
3. **High-Contrast / Light Mode Palette**:
   * *Description*: Accessible color theme switcher for candidates who prefer reading resumes in standard daylight contrast.

---

### NICE TO HAVE (Post-Launch Expansion)
1. **Live Peer-to-Peer Mock Interviews**: WebRTC video/audio peer matching between candidate job seekers.
2. **Direct Recruiter Portal (B2B)**: Recruiter view to search anonymized ATS 90+ verified talent profiles without revealing candidate contact info without candidate approval.
3. **Automated GitHub Portfolio Sync**: One-click import of public repositories, star counts, and commit frequency directly into the Projects section of the resume AST.
