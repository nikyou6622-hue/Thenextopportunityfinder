import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

DEFAULT_SUPABASE_URL = "postgresql+pg8000://postgres.hoobggdrjghfqxgjfoqf:a%23NIK789532@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

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
if not SQLALCHEMY_DATABASE_URL or SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # Default to production Supabase PostgreSQL connection target
    SQLALCHEMY_DATABASE_URL = DEFAULT_SUPABASE_URL

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and not SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

# Configure NullPool for Vercel/serverless environments connecting to Supabase PgBouncer.
# NullPool forces SQLAlchemy to release sockets immediately back to PgBouncer, preventing socket exhaustion.
engine_kwargs = {"pool_pre_ping": True}
if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    if is_cloud_environment():
        engine_kwargs["poolclass"] = NullPool
    else:
        engine_kwargs["pool_size"] = 10
        engine_kwargs["max_overflow"] = 20
        engine_kwargs["pool_recycle"] = 1800
else:
    engine_kwargs["connect_args"] = {"check_same_thread": False, "timeout": 30.0}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
print(f"DATABASE ENGINE POOL CLASS: {engine.pool.__class__.__name__}")

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
            else:
                # PostgreSQL auto-migrations for Supabase Cloud
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free';"))
                    conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
                    conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;"))
                    conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free';"))
                    conn.execute(text("ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_skills JSON DEFAULT '[]'::json;"))
                    conn.execute(text("ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_count INTEGER DEFAULT 0;"))
                    conn.execute(text("ALTER TABLE matches ADD COLUMN IF NOT EXISTS required_count INTEGER DEFAULT 0;"))
                    conn.execute(text("ALTER TABLE matches ADD COLUMN IF NOT EXISTS skill_match_percentage DOUBLE PRECISION DEFAULT 0.0;"))
                    conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_tier VARCHAR DEFAULT 'free';"))
                    conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
                    conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;"))
                    conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;"))
                    conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_id VARCHAR;"))
                    conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount_paid DOUBLE PRECISION DEFAULT 0.0;"))
                    conn.commit()
                except Exception as ex:
                    print(f"PostgreSQL migration warning: {ex}")
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

