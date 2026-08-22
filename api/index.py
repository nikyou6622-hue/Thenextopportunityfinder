import sys
import os

# Ensure backend package can be imported
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.app.main import app

# Export ASGI app entrypoint for Vercel Serverless Functions
app = app
