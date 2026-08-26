import os
import sys
import traceback

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

os.environ["VERCEL"] = "1"
os.environ["VERCEL_ENV"] = "production"

from backend.app.main import app
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def vercel_global_exception_handler(request, exc):
    tb = traceback.format_exc()
    print(f"[VERCEL EXCEPTION] {request.method} {request.url.path}: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Vercel Serverless Internal Exception",
            "detail": str(exc),
            "error_type": type(exc).__name__,
            "traceback": tb
        }
    )

handler = app
