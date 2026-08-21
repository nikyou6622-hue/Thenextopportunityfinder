import React, { useState, useEffect } from 'react';
import BrandedLoadingState from './characters/BrandedLoadingState';
import apiFetch from '../lib/apiClient';

/**
 * ProtectedRoute (AuthGuard) Component
 * =====================================
 * Wraps protected studio tabs. Performs real-time backend session check via
 * GET /api/auth/me without flashing protected content before redirecting unauthenticated visitors to /auth.
 */
export default function ProtectedRoute({
  targetTab,
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  children
}) {
  const getInitialAuthState = () => {
    if (currentUser) return true;
    try {
      const saved = localStorage.getItem('nof_user');
      const token = localStorage.getItem('nof_auth_token');
      return !!(saved || token);
    } catch {
      return false;
    }
  };

  const initialAuth = getInitialAuthState();
  const [checking, setChecking] = useState(!initialAuth);
  const [authenticated, setAuthenticated] = useState(initialAuth);

  useEffect(() => {
    let isMounted = true;

    if (currentUser) {
      setAuthenticated(true);
      setChecking(false);
      return;
    }

    const verifySession = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (isMounted) {
              setAuthenticated(true);
              setChecking(false);
              if (setCurrentUser) setCurrentUser(data.user);
              try {
                localStorage.setItem('nof_user', JSON.stringify(data.user));
              } catch {}
            }
            return;
          }
        }
      } catch (err) {
        console.warn("[AuthGuard] Backend verification failed:", err);
      }

      // If unauthenticated or failure:
      if (isMounted) {
        const token = localStorage.getItem('nof_auth_token');
        const savedUser = localStorage.getItem('nof_user');
        
        // If neither token nor saved user exists, redirect to auth
        if (!token && !savedUser && !currentUser) {
          setAuthenticated(false);
          setChecking(false);
          if (setCurrentUser) setCurrentUser(null);
          try {
            localStorage.removeItem('nof_auth_token');
            localStorage.removeItem('nof_user');
          } catch {}

          const redirectPath = targetTab && targetTab !== 'auth' ? targetTab : 'overview';
          const targetUrl = `/auth?redirect=${encodeURIComponent(redirectPath)}`;
          window.history.replaceState(null, '', targetUrl);
          setActiveTab('auth', true);
        } else {
          // Keep existing local auth if token/saved session exists
          setAuthenticated(true);
          setChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [targetTab, currentUser]);

  if (checking) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <BrandedLoadingState title="Verifying Candidate Session..." />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
