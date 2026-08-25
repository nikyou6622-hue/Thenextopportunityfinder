import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

try:
    from backend.app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    err_str = traceback.format_exc()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    def error_fallback(path: str):
        return JSONResponse(status_code=500, content={"error": "Vercel function startup exception", "details": str(e), "traceback": err_str})

