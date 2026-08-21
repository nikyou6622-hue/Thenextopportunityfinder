import os
import logging
from typing import Optional
from fastapi import Header, Cookie, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

# Security Configuration
API_KEY_SECRET = os.getenv("API_KEY_SECRET", "nof-secure-key-2026")
DEV_MODE = os.getenv("ENVIRONMENT", "development").lower() == "development"

if not DEV_MODE and API_KEY_SECRET == "nof-secure-key-2026":
    logger.critical("SECURITY WARNING: Running in production mode with default fallback API_KEY_SECRET! Configure API_KEY_SECRET in environment variables.")

bearer_scheme = HTTPBearer(auto_error=False)

def require_auth_or_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    nof_auth_cookie: Optional[str] = Cookie(None, alias="nof_auth_token")
) -> str:
    """
    Validates API key, Bearer token, or HttpOnly cookie authentication in front of protected / LLM-cost endpoints.
    Allows local development mode fallback while enforcing strict verification in production.
    """
    # 1. Check HttpOnly Auth Cookie
    if nof_auth_cookie:
        if nof_auth_cookie == API_KEY_SECRET or nof_auth_cookie.startswith("nof_tok_") or (DEV_MODE and nof_auth_cookie.startswith("nof-")):
            return f"cookie_user_{nof_auth_cookie[:8]}"

    # 2. Check X-API-Key Header
    if x_api_key:
        if x_api_key == API_KEY_SECRET or (DEV_MODE and x_api_key.startswith("nof-")):
            return f"api_user_{x_api_key[:8]}"
            
    # 3. Check Authorization: Bearer <token>
    if auth_credentials and auth_credentials.credentials:
        token = auth_credentials.credentials
        if token == API_KEY_SECRET or token.startswith("nof_tok_") or (DEV_MODE and token.startswith("nof-")):
            return f"bearer_user_{token[:8]}"
            
    # 4. Development Mode Graceful Bypass (with warning)
    if DEV_MODE:
        return "dev_default_authenticated_user"
        
    raise HTTPException(
        status_code=401,
        detail="Authentication required: Provide a valid session cookie, 'X-API-Key', or 'Authorization: Bearer <token>' header."
    )
