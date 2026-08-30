import os
import sys
import datetime
import traceback
import logging
import json
from typing import Optional, Dict, Any

_service_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.abspath(os.path.join(_service_dir, "..", "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_project_root, ".env"), override=True)
    load_dotenv(os.path.join(_project_root, "backend", ".env"), override=True)
except ImportError:
    pass

from sqlalchemy.orm import Session
from backend.app.db.database import engine, SessionLocal
from backend.app.db.models import ErrorLogModel

logger = logging.getLogger("error_notifier")
ALERT_DESTINATION_EMAIL = "adityanikt622@gmail.com"
RATE_LIMIT_WINDOW_MINUTES = 15

def _ensure_aware(dt: Optional[datetime.datetime]) -> Optional[datetime.datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt

def capture_and_alert_error(
    source: str,
    error: Exception,
    stack_trace: Optional[str] = None,
    request_context: Optional[str] = None,
    db: Optional[Session] = None
) -> ErrorLogModel:
    """
    Logs an unhandled route error or scraper crash to ErrorLogModel.
    Checks the 15-minute rate-limiting window per error source/type.
    Delivers a scannable alert email to adityanikt622@gmail.com via the transactional provider.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    error_type = error.__class__.__name__
    error_message = str(error) or "Unhandled System Error"
    
    if not stack_trace:
        stack_trace = "".join(traceback.format_exception(type(error), error, error.__traceback__))

    close_db = False
    if not db:
        db = SessionLocal()
        close_db = True

    try:
        cutoff_window = now - datetime.timedelta(minutes=RATE_LIMIT_WINDOW_MINUTES)
        
        # Query for recent existing unresolved error record of same source & error_type
        logs = db.query(ErrorLogModel).filter(
            ErrorLogModel.source == source,
            ErrorLogModel.error_type == error_type,
            ErrorLogModel.resolved == False
        ).order_by(ErrorLogModel.id.desc()).limit(10).all()

        existing_log = None
        for l in logs:
            if _ensure_aware(l.occurred_at) and _ensure_aware(l.occurred_at) >= cutoff_window:
                existing_log = l
                break

        should_send_email = False
        
        if existing_log:
            existing_log.occurred_count += 1
            existing_log.occurred_at = now
            existing_log.error_message = error_message
            existing_log.stack_trace = stack_trace
            log_record = existing_log
            
            # Check if last alert was > 15 minutes ago
            last_alert = _ensure_aware(existing_log.last_alert_sent_at)
            if not last_alert or last_alert < cutoff_window:
                should_send_email = True
                existing_log.last_alert_sent_at = now
        else:
            log_record = ErrorLogModel(
                source=source,
                error_type=error_type,
                error_message=error_message,
                stack_trace=stack_trace,
                request_context=request_context,
                occurred_at=now,
                occurred_count=1,
                last_alert_sent_at=now,
                resolved=False
            )
            db.add(log_record)
            should_send_email = True

        db.commit()
        db.refresh(log_record)

        if should_send_email:
            _dispatch_error_alert_email(log_record)

        return log_record

    except Exception as ex:
        logger.error(f"Failed to record error log: {ex}")
        if db:
            db.rollback()
        raise ex
    finally:
        if close_db and db:
            db.close()

def _dispatch_error_alert_email(log_record: ErrorLogModel) -> bool:
    """Dispatches batched HTML + plain text alert email to adityanikt622@gmail.com."""
    recipient = os.getenv("ADMIN_EMAIL", os.getenv("DEFAULT_EMAIL", ALERT_DESTINATION_EMAIL))
    
    # Excerpt stack trace (first 12 lines for scannability)
    trace_lines = (log_record.stack_trace or "").strip().splitlines()
    excerpt_lines = trace_lines[:12]
    if len(trace_lines) > 12:
        excerpt_lines.append(f"... (+{len(trace_lines) - 12} more lines)")
    stack_trace_excerpt = "\n".join(excerpt_lines)

    subject = f"🚨 [CRITICAL ALERT] {log_record.error_type} in {log_record.source}"
    if log_record.occurred_count > 1:
        subject += f" ({log_record.occurred_count}x in {RATE_LIMIT_WINDOW_MINUTES}m)"

    run_time = log_record.occurred_at.strftime("%Y-%m-%d %H:%M:%S UTC")

    plain_content = (
        f"🚨 CRITICAL SYSTEM ERROR ALERT\n"
        f"Source: {log_record.source}\n"
        f"Error Type: {log_record.error_type}\n"
        f"Message: {log_record.error_message}\n"
        f"Occurrences (15m window): {log_record.occurred_count}\n"
        f"Time: {run_time}\n\n"
        f"Stack Trace Excerpt:\n{stack_trace_excerpt}\n"
    )

    html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:'Segoe UI', Roboto, sans-serif; color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f19; padding:24px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:620px; background:#131b2e; border-radius:14px; border:1px solid rgba(239,68,68,0.4); overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding:20px 24px;">
              <div style="color:#fca5a5; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;">
                ⚠️ Immediate Error Alert ({log_record.occurred_count}x event)
              </div>
              <h2 style="color:#ffffff; margin:8px 0 0 0; font-size:1.3rem;">
                {log_record.error_type} in {log_record.source}
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <table width="100%" style="margin-bottom:16px; font-size:0.88rem;">
                <tr><td style="color:#94a3b8; width:120px;">Source:</td><td style="color:#ffffff; font-weight:700;">{log_record.source}</td></tr>
                <tr><td style="color:#94a3b8;">Occurred At:</td><td style="color:#f8fafc;">{run_time}</td></tr>
                <tr><td style="color:#94a3b8;">15m Window Count:</td><td style="color:#f87171; font-weight:800;">{log_record.occurred_count} times</td></tr>
                <tr><td style="color:#94a3b8;">Error Message:</td><td style="color:#fca5a5; font-weight:600;">{log_record.error_message}</td></tr>
              </table>

              <div style="background:#090d16; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:14px; margin-top:16px;">
                <div style="font-size:0.75rem; color:#94a3b8; font-weight:700; text-transform:uppercase; margin-bottom:8px;">Stack Trace Excerpt</div>
                <pre style="color:#f87171; font-family:Consolas, monospace; font-size:0.78rem; margin:0; white-space:pre-wrap; word-break:break-word;">{stack_trace_excerpt}</pre>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    # Deliver via Resend API or SMTP
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
                    "from": "NextOpportunityFinder System Alert <alerts@thenextopportunityfind.io>",
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content,
                    "text": plain_content
                }).encode("utf-8")
            )
            with urllib.request.urlopen(req) as resp:
                logger.info(f"Resend error alert email delivered to {recipient}. Status: {resp.status}")
                return True
        except Exception as ex:
            logger.warning(f"Resend email error alert failed: {ex}")

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
            msg["From"] = f"NextOpportunityFinder System Alert <{smtp_user}>"
            msg["To"] = recipient

            msg.attach(MIMEText(plain_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [recipient], msg.as_string())
            server.quit()
            logger.info(f"SMTP error alert email sent successfully to {recipient}")
            return True
        except Exception as smtp_err:
            logger.error(f"SMTP error alert delivery failed: {smtp_err}")

    logger.warning(f"No transactional email credentials available to send alert to {recipient}.")
    return False
