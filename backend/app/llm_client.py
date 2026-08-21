import os
import json
import logging
from typing import Optional, Dict, Any
import requests
from dotenv import load_dotenv

from backend.app.security.cost_telemetry import log_llm_cost_telemetry

load_dotenv()
logger = logging.getLogger("llm_client")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()


def call_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    profile_id: Optional[int] = None,
    action: str = "llm_completion"
) -> Optional[str]:
    """
    Executes a direct REST call to Google Gemini 1.5 Flash API.
    Returns response text if successful, or None on failure.
    """
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY).strip()
    if not api_key:
        return None

    # Google Generative Language API endpoint (Header auth prevents key leakage in access logs)
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }
    
    contents = []
    if system_instruction:
        contents.append({
            "role": "user",
            "parts": [{"text": f"System Guidelines: {system_instruction}"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Understood. I will strictly follow these guidelines."}]
        })

    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }
    }

    try:
        resp = requests.post(endpoint, json=payload, headers=headers, timeout=20)
        if resp.status_code != 200:
            logger.warning(f"Gemini API error ({resp.status_code}): {resp.text[:200]}")
            return None

        data = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return None

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            return None

        text = parts[0].get("text", "").strip()
        if text:
            log_llm_cost_telemetry(
                profile_id=profile_id,
                endpoint_action=action,
                prompt_text=prompt,
                completion_text=text,
                model_name="gemini-1.5-flash"
            )
        return text

    except Exception as e:
        logger.warning(f"Gemini API invocation failed: {e}")
        return None


def call_groq(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    profile_id: Optional[int] = None,
    action: str = "llm_completion"
) -> Optional[str]:
    """
    Executes a direct REST call to Groq Cloud API.
    Returns response text if successful, or None on failure.
    """
    api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY).strip()
    if not api_key:
        return None

    endpoint = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    try:
        resp = requests.post(endpoint, json=payload, headers=headers, timeout=20)
        if resp.status_code != 200:
            logger.warning(f"Groq API error ({resp.status_code}): {resp.text[:200]}")
            return None

        data = resp.json()
        choices = data.get("choices", [])
        if not choices:
            return None

        text = choices[0].get("message", {}).get("content", "").strip()
        if text:
            log_llm_cost_telemetry(
                profile_id=profile_id,
                endpoint_action=action,
                prompt_text=prompt,
                completion_text=text,
                model_name="groq-llama-3.1-8b"
            )
        return text

    except Exception as e:
        logger.warning(f"Groq API invocation failed: {e}")
        return None


def generate_llm_text(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    profile_id: Optional[int] = None,
    action: str = "llm_completion"
) -> Optional[str]:
    """
    Tries Gemini first if key available, then Groq, or returns None if neither configured/active.
    """
    # 1. Try Gemini
    result = call_gemini(
        prompt=prompt,
        system_instruction=system_instruction,
        temperature=temperature,
        max_tokens=max_tokens,
        profile_id=profile_id,
        action=action
    )
    if result:
        return result

    # 2. Try Groq
    result = call_groq(
        prompt=prompt,
        system_instruction=system_instruction,
        temperature=temperature,
        max_tokens=max_tokens,
        profile_id=profile_id,
        action=action
    )
    return result
