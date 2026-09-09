import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

HAS_PSYCOPG2 = False
try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    pass

driver_prefix = "postgresql+psycopg2://" if HAS_PSYCOPG2 else "postgresql+pg8000://"

DEFAULT_SUPABASE_URL = f"{driver_prefix}postgres.hoobggdrjghfqxgjfoqf:a%23NIK789532@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

def is_cloud_environment():
    return bool(
        os.getenv("VERCEL") or
        os.getenv("VERCEL_ENV") or
        os.getenv("VERCEL_REGION") or
        os.getenv("AWS_LAMBDA_FUNCTION_NAME") or
        os.getenv("RENDER") or
        not os.access(".", os.W_OK)
    )

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if os.getenv("USE_SQLITE_TEST") == "1":
    SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./test.db"
elif not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DEFAULT_SUPABASE_URL

if ":6543/" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(":6543/", ":5432/", 1)

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", driver_prefix, 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and not SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", driver_prefix, 1)
elif HAS_PSYCOPG2 and "postgresql+pg8000://" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql+pg8000://", driver_prefix, 1)
elif not HAS_PSYCOPG2 and "postgresql+psycopg2://" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql+psycopg2://", driver_prefix, 1)

if not SQLALCHEMY_DATABASE_URL.startswith("sqlite") and HAS_PSYCOPG2 and "sslmode=" not in SQLALCHEMY_DATABASE_URL:
    delimiter = "&" if "?" in SQLALCHEMY_DATABASE_URL else "?"
    SQLALCHEMY_DATABASE_URL = f"{SQLALCHEMY_DATABASE_URL}{delimiter}sslmode=require"

engine_kwargs = {"pool_pre_ping": True}
if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    if not HAS_PSYCOPG2:
        import ssl
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        engine_kwargs["connect_args"] = {"ssl_context": ssl_ctx}

    if is_cloud_environment():
        engine_kwargs["poolclass"] = NullPool
    else:
        engine_kwargs["pool_size"] = 10
        engine_kwargs["max_overflow"] = 20
        engine_kwargs["pool_recycle"] = 1800
else:
    engine_kwargs["connect_args"] = {"check_same_thread": False, "timeout": 30.0}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
print(f"DATABASE ENGINE DRIVER: {'psycopg2' if HAS_PSYCOPG2 else 'pg8000'} | POOL: {engine.pool.__class__.__name__}")

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA busy_timeout=30000;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_auto_migrations():
    """Applies schema migrations for new columns without losing existing data."""
    try:
        from backend.app.db.models import Base
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import text
        with engine.connect() as conn:

            if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                tables = [row[0] for row in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()]
                if "users" in tables:
                    columns = [row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()]
                    if "is_email_verified" not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0"))
                        conn.commit()
                if "matches" in tables:
                    columns = [row[1] for row in conn.execute(text("PRAGMA table_info(matches)")).fetchall()]
                    if "matched_skills" not in columns:
                        conn.execute(text("ALTER TABLE matches ADD COLUMN matched_skills JSON DEFAULT '[]'"))
                    if "matched_count" not in columns:
                        conn.execute(text("ALTER TABLE matches ADD COLUMN matched_count INTEGER DEFAULT 0"))
                    if "required_count" not in columns:
                        conn.execute(text("ALTER TABLE matches ADD COLUMN required_count INTEGER DEFAULT 0"))
                    if "skill_match_percentage" not in columns:
                        conn.execute(text("ALTER TABLE matches ADD COLUMN skill_match_percentage FLOAT DEFAULT 0.0"))
                    conn.commit()
                if "subscriptions" in tables:
                    columns = [row[1] for row in conn.execute(text("PRAGMA table_info(subscriptions)")).fetchall()]
                    sub_cols = [
                        ("plan_tier", "VARCHAR DEFAULT 'free'"),
                        ("is_active", "BOOLEAN DEFAULT 1"),
                        ("started_at", "DATETIME"),
                        ("valid_until", "DATETIME"),
                        ("payment_id", "VARCHAR"),
                        ("amount_paid", "FLOAT DEFAULT 0.0")
                    ]
                    for c_name, c_type in sub_cols:
                        if c_name not in columns:
                            conn.execute(text(f"ALTER TABLE subscriptions ADD COLUMN {c_name} {c_type}"))
                    conn.commit()
                if "jobs" in tables:
                    columns = [row[1] for row in conn.execute(text("PRAGMA table_info(jobs)")).fetchall()]
                    agent7_cols = [
                        ("apply_url_raw", "VARCHAR"),
                        ("apply_url_resolved", "VARCHAR"),
                        ("link_status", "VARCHAR DEFAULT 'live'"),
                        ("link_checked_at", "DATETIME"),
                        ("source_platform", "VARCHAR DEFAULT 'unknown'"),
                        ("apply_email", "VARCHAR"),
                        ("posted_date", "VARCHAR"),
                        ("expires_at", "DATETIME"),
                        ("application_deadline", "DATETIME"),
                        ("source", "VARCHAR DEFAULT 'manual'"),
                        ("source_category", "VARCHAR DEFAULT 'startup'"),
                        ("source_trust_tier", "VARCHAR DEFAULT 'tier1_verified'"),
                        ("is_technical", "BOOLEAN DEFAULT 1"),
                        ("is_remote_global", "BOOLEAN DEFAULT 0"),
                        ("company_tier", "VARCHAR DEFAULT 'startup_ecosystem'"),
                        ("external_id", "VARCHAR"),
                        ("source_posted_at", "VARCHAR"),
                        ("job_fingerprint", "VARCHAR"),
                        ("content_hash", "VARCHAR"),
                        ("authenticity_flags", "JSON DEFAULT '[]'"),
                        ("first_seen_at", "DATETIME"),
                        ("quality_score", "FLOAT"),
                        ("tech_stack_score", "FLOAT"),
                        ("seniority_score", "FLOAT"),
                        ("remote_score", "FLOAT"),
                        ("perks_score", "FLOAT"),
                        ("competition_score", "FLOAT"),
                        ("quality_tags", "JSON DEFAULT '[]'"),
                        ("cluster_id", "VARCHAR"),
                        ("offers_equity", "BOOLEAN DEFAULT 0"),
                        ("offers_visa_sponsorship", "BOOLEAN DEFAULT 0"),
                        ("offers_relocation", "BOOLEAN DEFAULT 0"),
                        ("offers_bonus", "BOOLEAN DEFAULT 0"),
                        ("offers_education_stipend", "BOOLEAN DEFAULT 0"),
                        ("offers_flexible_timing", "BOOLEAN DEFAULT 0"),
                        ("perks_raw", "JSON DEFAULT '[]'"),
                        ("applicant_count", "INTEGER"),
                        ("days_since_posting", "INTEGER"),
                        ("competition_index", "FLOAT")
                    ]
                    for c_name, c_type in agent7_cols:
                        if c_name not in columns:
                            try:
                                conn.execute(text(f"ALTER TABLE jobs ADD COLUMN {c_name} {c_type}"))
                            except Exception:
                                pass
                    conn.commit()
            else:
                # PostgreSQL auto-migrations for Supabase Cloud with isolated statement protection
                ddl_statements = [
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free';",
                    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free';",
                    "ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_skills JSON DEFAULT '[]'::json;",
                    "ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_count INTEGER DEFAULT 0;",
                    "ALTER TABLE matches ADD COLUMN IF NOT EXISTS required_count INTEGER DEFAULT 0;",
                    "ALTER TABLE matches ADD COLUMN IF NOT EXISTS skill_match_percentage DOUBLE PRECISION DEFAULT 0.0;",
                    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_tier VARCHAR DEFAULT 'free';",
                    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
                    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;",
                    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;",
                    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_id VARCHAR;",
                    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount_paid DOUBLE PRECISION DEFAULT 0.0;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quality_score DOUBLE PRECISION;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tech_stack_score DOUBLE PRECISION;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seniority_score DOUBLE PRECISION;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS remote_score DOUBLE PRECISION;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS perks_score DOUBLE PRECISION;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS competition_score DOUBLE PRECISION;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quality_tags JSONB DEFAULT '[]'::jsonb;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cluster_id VARCHAR;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS offers_equity BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS offers_visa_sponsorship BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS offers_relocation BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS offers_bonus BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS offers_education_stipend BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS offers_flexible_timing BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS perks_raw JSONB DEFAULT '[]'::jsonb;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applicant_count INTEGER;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS days_since_posting INTEGER;",
                    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS competition_index DOUBLE PRECISION;"
                ]
                for stmt in ddl_statements:
                    try:
                        conn.execute(text(stmt))
                        conn.commit()
                    except Exception as ex:
                        pass
    except Exception as e:
        print(f"Auto-migration notice: {e}")

# Run DDL auto-migrations locally only (Skip during Vercel cold-starts)
if not os.getenv("VERCEL") and not os.getenv("VERCEL_ENV"):
    run_auto_migrations()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

