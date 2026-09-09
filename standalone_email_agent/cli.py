import argparse
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from standalone_email_agent.config import settings, verify_sending_domain
from standalone_email_agent.db_models import init_email_db
from standalone_email_agent.consent_manager import grant_consent, revoke_consent, add_suppression, get_user_consent_summary
from standalone_email_agent.agent6_email_marketing import Agent6EmailMarketing

def main():
    parser = argparse.ArgumentParser(description="Agent 6 — Standalone Email Marketing CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # Consent command
    consent_parser = subparsers.add_parser("grant-consent", help="Grant consent for an email")
    consent_parser.add_argument("--email", required=True, help="User email address")
    consent_parser.add_argument("--type", default="job_alerts", choices=["job_alerts", "product_updates", "re_engagement", "marketing"])
    consent_parser.add_argument("--source", default="cli_admin")

    # Revoke command
    revoke_parser = subparsers.add_parser("revoke-consent", help="Revoke consent for an email")
    revoke_parser.add_argument("--email", required=True)
    revoke_parser.add_argument("--type", default=None)

    # Suppress command
    suppress_parser = subparsers.add_parser("suppress", help="Add email to suppression list")
    suppress_parser.add_argument("--email", required=True)
    suppress_parser.add_argument("--reason", default="unsubscribed", choices=["unsubscribed", "bounced", "complained", "admin_block"])

    # Status command
    status_parser = subparsers.add_parser("status", help="Get consent/suppression status for an email")
    status_parser.add_argument("--email", required=True)

    # Verify domain command
    domain_parser = subparsers.add_parser("verify-domain", help="Verify sending domain SPF/DKIM/DMARC compliance")
    domain_parser.add_argument("--domain", default=None)

    args = parser.parse_args()

    engine = create_engine(settings.DATABASE_URL)
    init_email_db(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        if args.command == "grant-consent":
            res = grant_consent(db, args.email, args.type, source=args.source)
            print(f"✅ Granted consent for {res.email} -> {res.consent_type}")
        elif args.command == "revoke-consent":
            ok = revoke_consent(db, args.email, consent_type=args.type)
            print(f"✅ Revoked consent for {args.email}: {ok}")
        elif args.command == "suppress":
            res = add_suppression(db, args.email, reason=args.reason)
            print(f"🚫 Added suppression for {res.email} (reason: {res.reason})")
        elif args.command == "status":
            summary = get_user_consent_summary(db, args.email)
            print("Consent Summary:", summary)
        elif args.command == "verify-domain":
            status = verify_sending_domain(args.domain)
            print("Domain Verification Status:", status)
        else:
            parser.print_help()
    finally:
        db.close()

if __name__ == "__main__":
    main()
