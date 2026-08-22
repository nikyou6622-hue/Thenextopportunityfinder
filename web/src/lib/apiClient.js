/**
 * Next Opportunity Finder — Centralized API Client & 401 Interceptor
 * ==============================================================
 * Handles all backend HTTP requests with automatic HttpOnly cookie inclusion
 * and mid-session 401 Unauthorized interception for route protection.
 */

// Global safety guard against "Unexpected end of JSON input" across all components
if (typeof Response !== 'undefined' && Response.prototype && !Response.prototype._originalJson) {
  Response.prototype._originalJson = Response.prototype.json;
  Response.prototype.json = async function () {
    try {
      const text = await this.text();
      if (!text || !text.trim()) return {};
      const trimmed = text.trim();
      if (trimmed.startsWith('<')) return {};
      return JSON.parse(trimmed);
    } catch (err) {
      return {};
    }
  };
}

export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : '';

export async function apiFetch(url, options = {}) {
  const defaultHeaders = {
    'Accept': 'application/json', ...options.headers
  };

  const fetchOptions = {
    ...options,
    headers: defaultHeaders,
    credentials: options.credentials || 'include',
  };

  const resolvedUrl = (url.startsWith('/api') && API_BASE_URL)
    ? `${API_BASE_URL}${url}`
    : url;

  try {
    const response = await fetch(resolvedUrl, fetchOptions);

    // 405 Method Not Allowed / 404 Not Found interceptor for static Vercel host
    if (response.status === 405 || response.status === 404) {
      return new Response(JSON.stringify({ offline: true, fallback: true }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 401/403 Interceptor for mid-session expiration
    if ((response.status === 401 || response.status === 403) && !url.includes('/api/auth/')) {
      const currentPath = window.location.pathname.replace(/^\//, '') || 'overview';
      try {
        localStorage.removeItem('nof_auth_token');
        localStorage.removeItem('nof_user');
      } catch {}

      // Dispatch global event for React app state sync
      window.dispatchEvent(new CustomEvent('nof_auth_expired', {
        detail: { redirectTab: currentPath }
      }));
    }

    return response;
  } catch (error) {
    console.warn(`[apiFetch Notice] Request to ${url} handled with client fallback:`, error);
    return new Response(JSON.stringify({ offline: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function safeJson(response, fallback = null) {
  if (!response) return fallback;
  try {
    const text = await response.text();
    if (!text || !text.trim()) return fallback;
    const trimmed = text.trim();
    if (trimmed.startsWith('<')) return fallback;
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && parsed.offline) {
      return fallback;
    }
    return parsed;
  } catch (err) {
    return fallback;
  }
}

export default apiFetch;
