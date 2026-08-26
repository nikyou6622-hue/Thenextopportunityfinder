import os
import sys
import traceback

# Ensure project root directory is in Python path for Vercel Serverless environment
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Force Vercel cloud environment configuration
os.environ["VERCEL"] = "1"
os.environ["VERCEL_ENV"] = "production"

from backend.app.main import app as app

handler = app
