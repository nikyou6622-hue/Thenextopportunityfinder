import os
import sys

# Ensure project root directory is in Python path for Vercel Serverless environment
sys_path_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if sys_path_root not in sys.path:
    sys.path.insert(0, sys_path_root)

# Force Vercel cloud environment configuration
os.environ["VERCEL"] = "1"
os.environ["VERCEL_ENV"] = "production"

# Load environment secrets into runtime if available
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(sys_path_root, ".env"), override=True)
    load_dotenv(os.path.join(sys_path_root, "backend", ".env"), override=True)
except ImportError:
    pass

import traceback
from fastapi.responses import JSONResponse

# Export main FastAPI app for Vercel Serverless Function execution
from backend.app.main import app

@app.exception_handler(Exception)
async def vercel_global_exception_handler(request, exc):
    print(f"[VERCEL SERVERLESS EXCEPTION] {request.method} {request.url.path}: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "error_type": type(exc).__name__}
    )
