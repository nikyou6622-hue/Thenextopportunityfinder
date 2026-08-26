import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

os.environ["VERCEL"] = "1"
os.environ["VERCEL_ENV"] = "production"

from backend.app.main import app

class VercelPathRestorerMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            headers = dict(scope.get("headers", []))
            # Recover original raw path from Vercel edge headers
            raw_path = headers.get(b"x-matched-path", b"").decode("utf-8") or \
                       headers.get(b"x-forwarded-uri", b"").decode("utf-8") or \
                       headers.get(b"x-original-uri", b"").decode("utf-8")
            if raw_path and raw_path.startswith("/api"):
                scope["path"] = raw_path
        await self.app(scope, receive, send)

handler = VercelPathRestorerMiddleware(app)
