import os
import sys

# Ensure project root directory is in Python path for Vercel Serverless environment
sys_path_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if sys_path_root not in sys.path:
    sys.path.insert(0, sys_path_root)

# Load environment secrets into runtime
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(sys_path_root, ".env"), override=True)
    load_dotenv(os.path.join(sys_path_root, "backend", ".env"), override=True)
except ImportError:
    pass

# Export main FastAPI app for Vercel Serverless Function execution
from backend.app.main import app
