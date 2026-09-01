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
