"""
js_renderer.py — Headless Playwright JS Rendering Engine
Renders dynamic single-page applications (SPAs) and JS-heavy career portals.
Compliant with Skill 1: Reads rendered page content only without automated form interaction.
"""

import logging
import time
from typing import Optional
import requests

logger = logging.getLogger(__name__)

# Standard Browser User-Agent
BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NextOpportunityFind/2.0"

def render_page_html(
    url: str, 
    timeout_ms: int = 20000, 
    wait_selector: Optional[str] = None,
    scroll_pages: int = 2
) -> Optional[str]:
    """
    Renders a JavaScript-heavy web page using Playwright Headless Chromium.
    Falls back to requests.get if Playwright is unavailable or fails.
    """
    try:
        from playwright.sync_api import sync_playwright
        
        logger.info(f"Rendering JS page via Playwright: {url}")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=BROWSER_USER_AGENT,
                viewport={"width": 1280, "height": 800}
            )
            page = context.new_page()
            
            # Navigate to target page
            page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
            
            # Wait for specific selector if provided
            if wait_selector:
                try:
                    page.wait_for_selector(wait_selector, timeout=8000)
                except Exception as se:
                    logger.warning(f"Selector '{wait_selector}' not found within timeout on {url}: {se}")
            
            # Scroll down to trigger lazy loading
            for i in range(scroll_pages):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(1.0)
            
            html = page.content()
            browser.close()
            return html
            
    except ImportError:
        logger.warning(f"Playwright module not installed. Falling back to HTTP requests for {url}")
        return _fallback_http_get(url)
    except Exception as e:
        logger.warning(f"Playwright rendering failed for {url}: {e}. Trying fallback HTTP GET.")
        return _fallback_http_get(url)

def _fallback_http_get(url: str) -> Optional[str]:
    try:
        headers = {"User-Agent": BROWSER_USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.text
    except Exception as ex:
        logger.error(f"Fallback HTTP GET failed for {url}: {ex}")
    return None
