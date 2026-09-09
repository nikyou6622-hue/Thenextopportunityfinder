import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, UniqueConstraint, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class EmailConsentModel(Base):
    __tablename__ = "email_consent"
    __table_args__ = (
        UniqueConstraint('email', 'consent_type', name='uq_email_consent_type'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    email = Column(String, index=True, nullable=False)
    consent_type = Column(String, index=True, nullable=False) # job_alerts, product_updates, re_engagement, marketing
    granted_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    source = Column(String, default="signup_checkbox") # signup_checkbox, settings_page, onboarding
    revoked_at = Column(DateTime, nullable=True)

class EmailSuppressionModel(Base):
    __tablename__ = "email_suppression"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    reason = Column(String, index=True, nullable=False) # unsubscribed, bounced, complained, admin_block
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class EmailSendModel(Base):
    __tablename__ = "email_sends"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    email = Column(String, index=True, nullable=False)
    template = Column(String, index=True, nullable=False) # job_digest, re_engagement, product_announcement
    sent_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    status = Column(String, index=True, nullable=False) # sent, bounced, failed, suppressed, dry_run
    esp_message_id = Column(String, nullable=True)
    error_detail = Column(Text, nullable=True)

class EmailFrequencyModel(Base):
    __tablename__ = "email_frequency"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    email = Column(String, index=True, nullable=False)
    frequency = Column(String, default="daily") # daily, weekly, never
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

def init_email_db(engine):
    """Initializes tables for email marketing consent, suppression, sends, and preferences."""
    Base.metadata.create_all(bind=engine)
