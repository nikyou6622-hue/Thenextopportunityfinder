import os
import sys
import traceback

# Ensure project root directory is in Python path for Vercel Serverless environment
sys_path_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if sys_path_root not in sys.path:
    sys.path.insert(0, sys_path_root)

# Force Vercel cloud environment configuration
os.environ["VERCEL"] = "1"
os.environ["VERCEL_ENV"] = "production"

try:
    from backend.app.main import app
    handler = app
except Exception as err:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def global_error_fallback(request):
        tb = traceback.format_exc()
        print(f"[VERCEL STARTUP FATAL ERROR]: {err}\n{tb}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Vercel Serverless Function Startup Failed",
                "detail": str(err),
                "error_type": type(err).__name__,
                "traceback": tb
            }
        )
    handler = app
