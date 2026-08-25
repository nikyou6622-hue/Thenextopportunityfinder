import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

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
    if is_cloud_environment():
        SQLALCHEMY_DATABASE_URL = DEFAULT_SUPABASE_URL
    else:
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL or "sqlite:///./nextoppr.db"

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and not SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False, "timeout": 30.0} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True
)

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
            else:
                # PostgreSQL auto-migrations for Supabase Cloud
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        print(f"Auto-migration notice: {e}")

run_auto_migrations()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

