import os
import json
import base64
import hashlib
import logging
from typing import Any, Union
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

# Derive a 32-byte url-safe base64 key from secret
RAW_SECRET = os.getenv("DATA_ENCRYPTION_KEY", "NextOpportunityFind-DPDP-Encryption-Secret-Key-2026")
DERIVED_KEY = base64.urlsafe_b64encode(hashlib.sha256(RAW_SECRET.encode()).digest())
_cipher = Fernet(DERIVED_KEY)

def encrypt_field(value: Any) -> str:
    """
    Encrypts sensitive text, dict, or list PII value at rest.
    Prefixes with 'enc::' to distinguish encrypted fields.
    """
    if value is None:
        return None
    try:
        if isinstance(value, (dict, list)):
            raw_str = json.dumps(value)
        else:
            raw_str = str(value)
            
        encrypted_bytes = _cipher.encrypt(raw_str.encode('utf-8'))
        return f"enc::{encrypted_bytes.decode('utf-8')}"
    except Exception as e:
        logger.error(f"Field encryption failed: {e}")
        return str(value)

def decrypt_field(value: Any, is_json: bool = False) -> Any:
    """
    Decrypts encrypted field at rest. If unencrypted, returns original value gracefully.
    """
    if value is None or not isinstance(value, str):
        return value
        
    if not value.startswith("enc::"):
        # Not encrypted, return as is (or parsed JSON if required)
        if is_json:
            try:
                return json.loads(value)
            except Exception:
                return value
        return value
        
    try:
        ciphertext = value[5:] # Strip 'enc::'
        decrypted_bytes = _cipher.decrypt(ciphertext.encode('utf-8'))
        decrypted_str = decrypted_bytes.decode('utf-8')
        
        if is_json:
            try:
                return json.loads(decrypted_str)
            except Exception:
                return decrypted_str
        return decrypted_str
    except Exception as e:
        logger.warning(f"Field decryption error: {e}. Returning raw value.")
        return value

def sanitize_pii_for_logging(text: str) -> str:
    """
    Scrubs sensitive PII (emails, phone numbers, secret API keys) from raw text
    before passing to loggers or error tracebacks.
    """
    if not text or not isinstance(text, str):
        return text
        
    import re
    # 1. Mask Email Addresses
    text = re.sub(
        r'([a-zA-Z0-9._%+-]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]{1,2})[a-zA-Z0-9.-]*(\.[a-zA-Z]{2,})',
        r'\1***@\2***\3',
        text
    )
    # 2. Mask Google API keys (AIzaSy...)
    text = re.sub(r'AIzaSy[a-zA-Z0-9_-]{10,}', r'AIzaSy[REDACTED_KEY]', text)
    # 3. Mask OpenAI / Groq / Standard Secret Tokens (sk-..., gsk_..., GOCSPX-...)
    text = re.sub(r'(sk-|gsk_|GOCSPX-)[a-zA-Z0-9_-]{10,}', r'\1[REDACTED_SECRET]', text)
    # 4. Mask 10+ Digit Phone Numbers
    text = re.sub(r'(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}', r'[REDACTED_PHONE]', text)
    
    return text

