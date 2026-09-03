import datetime
import logging
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.db.models import SubscriptionModel, ProfileModel, UserModel

logger = logging.getLogger(__name__)

def get_access_level(profile_id: int, db: Session) -> str:
    """
    Single source of truth for user access level.
    Returns 'pro' if profile has an active subscription where valid_until > current UTC time.
    Otherwise returns 'free'.
    """
    if not profile_id:
        return "free"
    
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Query subscription record for this profile
    sub = db.query(SubscriptionModel).filter(
        SubscriptionModel.profile_id == profile_id
    ).first()
    
    if sub and sub.is_active and sub.valid_until:
        # Handle both timezone-aware and naive datetime objects safely
        valid_until_utc = sub.valid_until
        if valid_until_utc.tzinfo is None:
            valid_until_utc = valid_until_utc.replace(tzinfo=datetime.timezone.utc)
            
        if valid_until_utc > now:
            return "pro"
            
    # Fallback check on ProfileModel subscription_tier if no subscription model exists
    if not sub:
        profile = db.query(ProfileModel).filter(ProfileModel.id == profile_id).first()
        if profile and profile.subscription_tier == "pro":
            return "pro"

    return "free"


def grant_pro_access(profile_id: int, db: Session, payment_id: str = "manual_grant", amount_paid: float = 99.0, months: int = 6) -> SubscriptionModel:
    """
    Grants or updates pro subscription for profile_id for specified duration (default 6 months).
    Updates SubscriptionModel, UserModel, and ProfileModel.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    valid_until = now + datetime.timedelta(days=30 * months) # 6 months = 180 days
    
    sub = db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile_id).first()
    if not sub:
        sub = SubscriptionModel(
            profile_id=profile_id,
            tier="pro",
            plan_tier="pro",
            status="active",
            is_active=True,
            credits_remaining=999,
            started_at=now,
            valid_until=valid_until,
            payment_id=payment_id,
            amount_paid=amount_paid
        )
        db.add(sub)
    else:
        sub.tier = "pro"
        sub.plan_tier = "pro"
        sub.status = "active"
        sub.is_active = True
        sub.started_at = now
        sub.valid_until = valid_until
        sub.payment_id = payment_id
        sub.amount_paid = amount_paid

    profile = db.query(ProfileModel).filter(ProfileModel.id == profile_id).first()
    if profile:
        profile.subscription_tier = "pro"
        if profile.email:
            user = db.query(UserModel).filter(UserModel.email == profile.email).first()
            if user:
                user.subscription_tier = "pro"
                
    db.commit()
    db.refresh(sub)
    return sub

def revoke_pro_access(profile_id: int, db: Session) -> Optional[SubscriptionModel]:
    """
    Revokes pro subscription for profile_id. Updates SubscriptionModel, UserModel, ProfileModel.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    sub = db.query(SubscriptionModel).filter(SubscriptionModel.profile_id == profile_id).first()
    if sub:
        sub.tier = "free"
        sub.plan_tier = "free"
        sub.is_active = False
        sub.valid_until = now
        
    profile = db.query(ProfileModel).filter(ProfileModel.id == profile_id).first()
    if profile:
        profile.subscription_tier = "free"
        if profile.email:
            user = db.query(UserModel).filter(UserModel.email == profile.email).first()
            if user:
                user.subscription_tier = "free"
                
    db.commit()
    if sub:
        db.refresh(sub)
    return sub


def audit_and_cleanup_unauthorized_pro_accounts(db: Session) -> int:
    """
    Security Audit Guard (Bug 1 Fix):
    Cross-checks all accounts showing 'pro' or 'lifetime' status against verified Cashfree payment orders
    (PaymentOrderModel status == 'paid') and manual admin grants (AdminAuditLogModel).
    Any account marked paid/pro without a matching verified payment order or admin grant is downgraded to 'free',
    and the action is logged in AdminAuditLogModel. Returns count of downgraded accounts.
    """
    from backend.app.db.models import PaymentOrderModel, AdminAuditLogModel
    
    # 1. Gather all profile_ids with verified paid orders
    paid_profile_ids = set(
        row[0] for row in db.query(PaymentOrderModel.profile_id).filter(PaymentOrderModel.status == "paid").all()
    )
    
    # 2. Gather profile_ids with admin manual grants from audit log
    admin_granted_emails = set(
        row[0] for row in db.query(AdminAuditLogModel.target_user_email).filter(
            AdminAuditLogModel.action.in_(["upgrade_pro", "manual_grant"])
        ).all() if row[0]
    )
    
    # Query all active subscriptions or profiles marked pro/lifetime
    pro_subs = db.query(SubscriptionModel).filter(
        SubscriptionModel.tier.in_(["pro", "lifetime"]) | SubscriptionModel.plan_tier.in_(["pro", "lifetime"])
    ).all()
    
    downgraded_count = 0
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for sub in pro_subs:
        profile = db.query(ProfileModel).filter(ProfileModel.id == sub.profile_id).first()
        prof_email = profile.email if profile else None
        
        # Check if legitimately paid or admin granted
        is_paid = sub.profile_id in paid_profile_ids or (sub.payment_id and sub.payment_id not in ["manual_grant", "test_mock", None] and sub.amount_paid > 0)
        is_admin_granted = (prof_email and prof_email in admin_granted_emails) or sub.payment_id == "admin_manual_grant"
        
        if not is_paid and not is_admin_granted:
            prev_tier = sub.tier or sub.plan_tier or "pro"
            logger.warning(f"[SECURITY AUDIT] Downgrading unauthorized pro account: Profile ID {sub.profile_id} ({prof_email})")
            
            # Downgrade subscription model
            sub.tier = "free"
            sub.plan_tier = "free"
            sub.is_active = False
            sub.valid_until = now
            
            # Downgrade profile model
            if profile:
                profile.subscription_tier = "free"
                
            # Downgrade user model
            if prof_email:
                user = db.query(UserModel).filter(UserModel.email == prof_email).first()
                if user:
                    user.subscription_tier = "free"
                    
            # Log audit entry
            audit_log = AdminAuditLogModel(
                admin_email="system_security_auditor@local",
                action="security_downgrade_unauthorized_pro",
                target_user_id=profile.id if profile else None,
                target_user_email=prof_email or "unknown",
                details=f"Security audit auto-downgraded account from '{prev_tier}' to 'free' (no verified Cashfree payment record found).",
                timestamp=now
            )
            db.add(audit_log)
            downgraded_count += 1

    # Extra check: Profiles marked pro directly on ProfileModel or UserModel without subscription object
    pro_profiles = db.query(ProfileModel).filter(ProfileModel.subscription_tier.in_(["pro", "lifetime"])).all()
    for prof in pro_profiles:
        if prof.id not in paid_profile_ids and prof.email not in admin_granted_emails:
            prof.subscription_tier = "free"
            user = db.query(UserModel).filter(UserModel.email == prof.email).first() if prof.email else None
            if user:
                user.subscription_tier = "free"
            downgraded_count += 1
            
    if downgraded_count > 0:
        db.commit()
        logger.info(f"[SECURITY AUDIT] Successfully downgraded {downgraded_count} unauthorized pro accounts to free tier.")
        
    return downgraded_count

