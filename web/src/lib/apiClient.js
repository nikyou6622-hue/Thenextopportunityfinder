/**
 * Next Opportunity Finder — Centralized API Client & 401 Interceptor
 * ==============================================================
 * Handles all backend HTTP requests with automatic HttpOnly cookie inclusion
 * and mid-session 401 Unauthorized interception for route protection.
 */

export async function apiFetch(url, options = {}) {
  const defaultHeaders = {
    'Accept': 'application/json', ...options.headers
  };

  const fetchOptions = {
    ...options,
    headers: defaultHeaders,
    credentials: options.credentials || 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);

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
    console.error(`[apiFetch Error] Request to ${url} failed:`, error);
    throw error;
  }
}

export async function safeJson(response, fallback = null) {
  if (!response) return fallback;
  try {
    const text = await response.text();
    if (!text || !text.trim()) return fallback;
    return JSON.parse(text);
  } catch (err) {
    console.warn(`[safeJson Parse Warning] Could not parse JSON response:`, err);
    return fallback;
  }
}

export default apiFetch;
