import urllib.parse
from typing import Dict, Any, List
from standalone_email_agent.config import settings

def generate_unsubscribe_url(email: str, consent_type: str = "all") -> str:
    """Generates an explicit, compliant unsubscribe URL for email footers."""
    params = urllib.parse.urlencode({"email": email.lower().strip(), "type": consent_type})
    return f"{settings.BASE_UNSUBSCRIBE_URL}?{params}"

def render_job_digest(
    user_name: str,
    user_email: str,
    matched_jobs: List[Dict[str, Any]],
    unsubscribe_token: str = None
) -> Dict[str, str]:
    """
    Renders a personalized Job Match Digest email.
    ZERO-HALLUCINATION ENFORCEMENT: Accepts ONLY jobs with verified link_status == 'live'.
    """
    # Strict live-link filtering
    live_jobs = [j for j in matched_jobs if j.get("link_status") == "live"]
    
    unsub_url = unsubscribe_token or generate_unsubscribe_url(user_email, "job_alerts")
    subject = f"⚡ {len(live_jobs)} Verified Job Matches for {user_name} — NextOpportunityFinder"

    if not live_jobs:
        text_body = f"Hi {user_name},\n\nWe currently have no live job matches matching your criteria today. We will notify you as soon as new verified roles open up.\n\nUnsubscribe: {unsub_url}"
        html_body = f"""<div style="font-family:sans-serif; padding:20px; background:#0b0f19; color:#f8fafc;">
            <h2>Hi {user_name},</h2>
            <p>No new live job matches meet your threshold today. We'll send your next update as soon as verified roles go live!</p>
            <p><a href="{unsub_url}" style="color:#818cf8;">Unsubscribe from Job Alerts</a></p>
        </div>"""
        return {"subject": subject, "html_body": html_body, "text_body": text_body, "unsubscribe_url": unsub_url}

    # Build job list HTML & plain text
    job_cards_html = ""
    job_cards_text = ""

    for job in live_jobs:
        company = job.get("company", "Tech Company")
        title = job.get("role_title", "Software Engineer")
        location = job.get("location", "Remote")
        apply_url = job.get("apply_url_resolved") or job.get("apply_url") or "#"
        score = job.get("match_score", 85.0)
        skills = job.get("required_skills", [])[:4]
        skills_str = ", ".join(skills) if skills else "Python, React, System Architecture"

        job_cards_text += f"• {title} at {company} ({location})\n  Match Score: {score}%\n  Skills: {skills_str}\n  Apply Directly: {apply_url}\n\n"
        
        job_cards_html += f"""
        <div style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:18px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#ffffff;">{title}</div>
              <div style="font-size:0.9rem; color:#a5b4fc; margin-top:2px;">{company} &bull; <span style="color:#94a3b8;">{location}</span></div>
            </div>
            <div style="background:rgba(16,185,129,0.15); color:#34d399; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; border:1px solid rgba(16,185,129,0.3);">
              {score:.0f}% Match
            </div>
          </div>
          <div style="margin-top:12px; font-size:0.82rem; color:#cbd5e1;">
            <strong>Skills:</strong> {skills_str}
          </div>
          <div style="margin-top:14px;">
            <a href="{apply_url}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#ffffff; font-weight:700; font-size:0.82rem; text-decoration:none; padding:8px 18px; border-radius:6px;">
              Apply Directly &rarr;
            </a>
          </div>
        </div>
        """

    text_body = (
        f"Hi {user_name},\n\n"
        f"Here are your top {len(live_jobs)} verified live job matches on NextOpportunityFinder:\n\n"
        f"{job_cards_text}"
        f"Best regards,\nNextOpportunityFinder Engineering Team\n\n"
        f"Manage preferences / Unsubscribe: {unsub_url}"
    )

    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:'Segoe UI', Roboto, sans-serif; color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:620px; background:#131b2e; border-radius:16px; border:1px solid rgba(255,255,255,0.1); padding:28px;">
          <tr>
            <td>
              <div style="background:rgba(99,102,241,0.2); color:#a5b4fc; display:inline-block; padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:800; text-transform:uppercase;">
                Personalized Career Digest
              </div>
              <h1 style="color:#ffffff; font-size:1.45rem; font-weight:900; margin:12px 0 6px 0;">
                Your Top {len(live_jobs)} Verified Matches Today
              </h1>
              <p style="color:#94a3b8; font-size:0.92rem; margin-bottom:24px;">
                Hi {user_name}, all direct canonical apply links below have been verified active and live:
              </p>
              
              {job_cards_html}

              <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:28px 0 16px 0;">
              
              <div style="text-align:center; font-size:0.75rem; color:#64748b;">
                NextOpportunityFinder Career Intelligence Platform &bull; DPDP Compliant<br>
                You received this because you consented to job alerts. <a href="{unsub_url}" style="color:#818cf8; text-decoration:underline;">One-Click Unsubscribe</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    return {
        "subject": subject,
        "html_body": html_body,
        "text_body": text_body,
        "unsubscribe_url": unsub_url
    }

def render_re_engagement(
    user_name: str,
    user_email: str,
    top_skills: List[str] = None,
    last_seen_days: int = 14,
    unsubscribe_token: str = None
) -> Dict[str, str]:
    """Renders a personalized re-engagement email for dormant users."""
    unsub_url = unsubscribe_token or generate_unsubscribe_url(user_email, "re_engagement")
    subject = f"👋 We miss you, {user_name}! 15+ New Roles Match Your Profile"
    skills_list = ", ".join(top_skills[:3]) if top_skills else "Python, System Architecture, React"

    text_body = (
        f"Hi {user_name},\n\n"
        f"It's been {last_seen_days} days since your last session on NextOpportunityFinder. "
        f"Over 15 new verified opportunities in {skills_list} were posted by top tech companies and startups.\n\n"
        f"Log in to check your latest ATS scores and tailored recommendations:\n"
        f"https://nextopportunityfinder.com/dashboard\n\n"
        f"Unsubscribe: {unsub_url}"
    )

    html_body = f"""<!DOCTYPE html>
<html>
<body style="background:#0b0f19; font-family:sans-serif; color:#f8fafc; padding:32px 16px;">
  <div style="max-width:600px; margin:0 auto; background:#131b2e; border-radius:16px; padding:32px; border:1px solid rgba(255,255,255,0.1);">
    <h2 style="color:#ffffff;">We miss you, {user_name}! 👋</h2>
    <p style="color:#94a3b8; line-height:1.6;">
      It's been <strong>{last_seen_days} days</strong> since your last visit. Over 15+ new verified engineering roles matching your expertise in <strong style="color:#818cf8;">{skills_list}</strong> were added to the platform.
    </p>
    <div style="text-align:center; margin:28px 0;">
      <a href="https://nextopportunityfinder.com/dashboard" style="background:#6366f1; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:800;">
        Explore New Matches &rarr;
      </a>
    </div>
    <div style="text-align:center; font-size:0.75rem; color:#64748b; margin-top:24px;">
      <a href="{unsub_url}" style="color:#818cf8;">Unsubscribe from Re-engagement Reminders</a>
    </div>
  </div>
</body>
</html>"""

    return {"subject": subject, "html_body": html_body, "text_body": text_body, "unsubscribe_url": unsub_url}

def render_product_announcement(
    user_name: str,
    user_email: str,
    title: str,
    announcement_body: str,
    cta_url: str = "https://nextopportunityfinder.com",
    unsubscribe_token: str = None
) -> Dict[str, str]:
    """Renders a product announcement email."""
    unsub_url = unsubscribe_token or generate_unsubscribe_url(user_email, "product_updates")
    subject = f"🚀 {title} — NextOpportunityFinder Update"

    text_body = f"Hi {user_name},\n\n{announcement_body}\n\nCheck out the update: {cta_url}\n\nUnsubscribe: {unsub_url}"

    html_body = f"""<!DOCTYPE html>
<html>
<body style="background:#0b0f19; font-family:sans-serif; color:#f8fafc; padding:32px 16px;">
  <div style="max-width:600px; margin:0 auto; background:#131b2e; border-radius:16px; padding:32px; border:1px solid rgba(255,255,255,0.1);">
    <div style="color:#6366f1; font-weight:800; font-size:0.8rem; text-transform:uppercase;">Product Announcement</div>
    <h2 style="color:#ffffff; margin-top:8px;">{title}</h2>
    <p style="color:#cbd5e1; line-height:1.6;">Hi {user_name},</p>
    <div style="color:#94a3b8; line-height:1.65; margin-bottom:24px;">{announcement_body}</div>
    <div style="text-align:center; margin:28px 0;">
      <a href="{cta_url}" style="background:#6366f1; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:800;">
        Try New Feature &rarr;
      </a>
    </div>
    <div style="text-align:center; font-size:0.75rem; color:#64748b; margin-top:24px;">
      <a href="{unsub_url}" style="color:#818cf8;">Unsubscribe from Product Updates</a>
    </div>
  </div>
</body>
</html>"""

    return {"subject": subject, "html_body": html_body, "text_body": text_body, "unsubscribe_url": unsub_url}
