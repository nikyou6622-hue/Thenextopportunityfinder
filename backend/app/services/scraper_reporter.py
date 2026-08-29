import os
import sys
import datetime
import sqlite3
import logging
import json
from typing import Dict, Any, List

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

DEFAULT_OWNER_EMAIL = "thenextopportunityfinder@gmail.com"

def get_db_connection():
    db_path = os.getenv("DATABASE_URL", "f:/Thenextopportunityfinder/nextoppr.db")
    if db_path.startswith("sqlite:///"):
        db_path = db_path.replace("sqlite:///", "")
    if not os.path.exists(db_path) and os.path.exists("nextoppr.db"):
        db_path = "nextoppr.db"
    return sqlite3.connect(db_path)

def generate_scraper_report(workflow_name: str = "Scraper Workflow Run", window_minutes: int = 360) -> Dict[str, Any]:
    """
    Analyzes recent scraper activity, newly ingested jobs, per-source breakdown,
    anomalies/failures, and active job totals.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    cutoff = now - datetime.timedelta(minutes=window_minutes)
    cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Total jobs in DB
    cursor.execute("SELECT COUNT(*) FROM jobs;")
    total_jobs = cursor.fetchone()[0]

    # 2. Jobs ingested within the time window
    cursor.execute(
        "SELECT id, company, role_title, source, source_category, company_tier, created_at "
        "FROM jobs WHERE created_at >= ? OR first_seen_at >= ?;",
        (cutoff_str, cutoff_str)
    )
    recent_jobs = cursor.fetchall()
    new_jobs_count = len(recent_jobs)

    # 3. Per-source breakdown for recent jobs
    source_counts = {}
    tier_counts = {"Tier 1 (FAANG/MNC)": 0, "Tier 2 (Growth/Mid)": 0, "Tier 3 (General/Startup)": 0}
    for job in recent_jobs:
        src = job[3] or "Unknown"
        tier = job[5] or "Tier 3"
        source_counts[src] = source_counts.get(src, 0) + 1
        if "1" in str(tier):
            tier_counts["Tier 1 (FAANG/MNC)"] += 1
        elif "2" in str(tier):
            tier_counts["Tier 2 (Growth/Mid)"] += 1
        else:
            tier_counts["Tier 3 (General/Startup)"] += 1

    # 4. Check scan logs for anomalies or failures
    anomalies = []
    try:
        cursor.execute(
            "SELECT company, status, listings_found, error_message, created_at "
            "FROM mnc_scan_log WHERE created_at >= ?;",
            (cutoff_str,)
        )
        scan_logs = cursor.fetchall()
        for log_entry in scan_logs:
            company, status, found, err, log_time = log_entry
            if status != "success" or err or found == 0:
                anomalies.append({
                    "company": company,
                    "status": status,
                    "listings_found": found,
                    "error": err or "Zero listings returned"
                })
    except Exception as e:
        logger.warning(f"Notice inspecting scan logs: {e}")

    # 5. Overall trust-tier breakdown across entire database
    cursor.execute("SELECT company_tier, COUNT(*) FROM jobs GROUP BY company_tier;")
    overall_tiers = dict(cursor.fetchall())

    conn.close()

    report = {
        "workflow_name": workflow_name,
        "run_time": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "window_minutes": window_minutes,
        "new_jobs_count": new_jobs_count,
        "total_active_jobs": total_jobs,
        "source_breakdown": source_counts,
        "recent_tier_breakdown": tier_counts,
        "overall_tier_breakdown": overall_tiers,
        "anomalies": anomalies
    }

    return report

def build_report_html(report: Dict[str, Any]) -> str:
    """Builds a rich HTML email report matching standard platform aesthetics."""
    workflow = report["workflow_name"]
    run_time = report["run_time"]
    new_jobs = report["new_jobs_count"]
    total_jobs = report["total_active_jobs"]
    sources = report["source_breakdown"]
    anomalies = report["anomalies"]
    recent_tiers = report["recent_tier_breakdown"]

    source_rows = ""
    if sources:
        for src, count in sources.items():
            source_rows += f"""
            <tr>
              <td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); color:#f8fafc; font-weight:600;">{src}</td>
              <td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); color:#818cf8; font-weight:800; text-align:right;">+{count}</td>
            </tr>
            """
    else:
        source_rows = """
        <tr>
          <td colspan="2" style="padding: 14px 16px; color:#94a3b8; font-size:0.88rem; text-align:center;">
            No new jobs added during this execution window.
          </td>
        </tr>
        """

    anomaly_html = ""
    if anomalies:
        anomaly_items = ""
        for a in anomalies:
            anomaly_items += f"<li><strong style='color:#f87171;'>{a['company']}</strong>: {a['status']} ({a['error']})</li>"
        anomaly_html = f"""
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <div style="color: #f87171; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            ⚠️ Anomaly / Scraper Health Alerts ({len(anomalies)})
          </div>
          <ul style="margin: 0; padding-left: 18px; color: #fca5a5; font-size: 0.88rem; line-height: 1.6;">
            {anomaly_items}
          </ul>
        </div>
        """
    else:
        anomaly_html = """
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <div style="color: #34d399; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
            ✅ All Scraper Modules Operating Normally (Zero Anomalies)
          </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0f19; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:620px; background:#131b2e; border-radius:16px; border:1px solid rgba(255,255,255,0.1); overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- BANNER HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding:28px 32px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1);">
              <div style="display:inline-block; background:rgba(255,255,255,0.12); backdrop-filter:blur(8px); padding:5px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.2);">
                <span style="color:#c7d2fe; font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;">NextOpportunityFinder System Monitor</span>
              </div>
              <h1 style="color:#ffffff; font-size:1.45rem; font-weight:900; margin:12px 0 4px 0; letter-spacing:-0.02em;">
                🤖 {workflow} Report
              </h1>
              <p style="color:#a5b4fc; font-size:0.88rem; margin:0;">Executed at {run_time}</p>
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding:32px;">
              
              <!-- STATS GRID -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <div style="background:#0f172a; border:1px solid rgba(99,102,241,0.25); border-radius:12px; padding:18px; text-align:center;">
                      <div style="font-size:0.75rem; font-weight:800; color:#818cf8; text-transform:uppercase; letter-spacing:0.06em;">New Jobs Added</div>
                      <div style="font-size:2rem; font-weight:900; color:#ffffff; margin-top:4px;">+{new_jobs}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:18px; text-align:center;">
                      <div style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em;">Total Active Jobs</div>
                      <div style="font-size:2rem; font-weight:900; color:#ffffff; margin-top:4px;">{total_jobs}</div>
                    </div>
                  </td>
                </tr>
              </table>

              {anomaly_html}

              <!-- PER SOURCE BREAKDOWN TABLE -->
              <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; overflow:hidden; margin-bottom:24px;">
                <div style="padding:14px 16px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.08); font-size:0.8rem; font-weight:800; color:#818cf8; text-transform:uppercase; letter-spacing:0.06em;">
                  Per-Source Ingestion Breakdown
                </div>
                <table width="100%" cellspacing="0" cellpadding="0" style="font-size:0.9rem;">
                  {source_rows}
                </table>
              </div>

              <!-- TIER BREAKDOWN SUMMARY -->
              <div style="background:rgba(30,41,59,0.5); border-radius:12px; padding:18px; border:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:0.8rem; font-weight:800; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px;">
                  Trust Tier Breakdown (Recent Ingestion)
                </div>
                <div style="font-size:0.88rem; color:#94a3b8; line-height:1.7;">
                  • 🥇 <strong>FAANG/MNC Tier 1</strong>: +{recent_tiers['Tier 1 (FAANG/MNC)']}<br>
                  • 🥈 <strong>Growth/Mid-Tier 2</strong>: +{recent_tiers['Tier 2 (Growth/Mid)']}<br>
                  • 🥉 <strong>General/Startup Tier 3</strong>: +{recent_tiers['Tier 3 (General/Startup)']}
                </div>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#090d16; padding:16px 32px; text-align:center; border-top:1px solid rgba(255,255,255,0.05);">
              <p style="font-size:0.75rem; color:#475569; margin:0;">
                Automated Owner Report &bull; NextOpportunityFinder AI Scraper Engine
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
    return html

def send_report_email(report: Dict[str, Any], recipient: str = DEFAULT_OWNER_EMAIL) -> bool:
    """Delivers report email via Resend API or SMTP transactional provider."""
    subject = f"🤖 [{report['workflow_name']}] +{report['new_jobs_count']} New Jobs | {report['total_active_jobs']} Total Active"
    html_content = build_report_html(report)
    plain_content = (
        f"[{report['workflow_name']}] Executed at {report['run_time']}\n"
        f"New Jobs Added: +{report['new_jobs_count']}\n"
        f"Total Active Jobs: {report['total_active_jobs']}\n"
        f"Sources: {json.dumps(report['source_breakdown'])}\n"
        f"Anomalies: {len(report['anomalies'])}\n"
    )

    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    if resend_api_key:
        try:
            import urllib.request
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                data=json.dumps({
                    "from": "NextOpportunityFinder Bot <reports@thenextopportunityfind.io>",
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content,
                    "text": plain_content
                }).encode("utf-8")
            )
            with urllib.request.urlopen(req) as resp:
                logger.info(f"Resend API email report sent successfully to {recipient}. Status: {resp.status}")
                return True
        except Exception as re_err:
            logger.error(f"Resend API email report delivery failed: {re_err}")

    # Fallback to SMTP transport
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_user = os.getenv("SMTP_USER", recipient).strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    if smtp_pass:
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"NextOpportunityFinder Monitor <{smtp_user}>"
            msg["To"] = recipient

            msg.attach(MIMEText(plain_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [recipient], msg.as_string())
            server.quit()
            logger.info(f"SMTP report email sent successfully to {recipient}")
            return True
        except Exception as smtp_err:
            logger.error(f"SMTP report delivery failed: {smtp_err}")

    logger.warning(f"No active email provider credentials configured. Report generated cleanly for {recipient}:\n{plain_content}")
    return False

def main():
    workflow_name = sys.argv[1] if len(sys.argv) > 1 else "Scraper Workflow Run"
    window_minutes = int(sys.argv[2]) if len(sys.argv) > 2 else 360

    logger.info(f"Generating scraper report for '{workflow_name}' (Window: {window_minutes} mins)...")
    report = generate_scraper_report(workflow_name, window_minutes)
    logger.info(f"Report Summary: +{report['new_jobs_count']} new jobs | {report['total_active_jobs']} total jobs")

    # Smart Send Rule: Send per-run email if new jobs were added or if anomalies occurred, or if forced
    force_send = "--force" in sys.argv or os.getenv("FORCE_EMAIL_REPORT") == "true"
    if report['new_jobs_count'] > 0 or len(report['anomalies']) > 0 or force_send:
        sent = send_report_email(report)
        print(f"Report Email Dispatch Result: {sent}")
    else:
        logger.info("Zero new jobs and zero anomalies detected. Skipping notification email per smart alert policy.")

if __name__ == "__main__":
    main()
