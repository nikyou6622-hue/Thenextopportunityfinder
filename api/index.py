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

failed_mod = None
err_tb = None

try:
    import pdfminer
    import pdfplumber
    import reportlab
    import docx
    import cryptography
    import feedparser
    import pg8000
    import sqlalchemy
    import fastapi
    from backend.app.main import app
    handler = app
except Exception as e:
    failed_mod = str(e)
    err_tb = traceback.format_exc()

if failed_mod:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    def err_route(request):
        return JSONResponse(status_code=500, content={"error": failed_mod, "traceback": err_tb})
    handler = app
