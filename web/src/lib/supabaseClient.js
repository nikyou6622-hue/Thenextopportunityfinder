/**
 * Next Opportunity Finder — Secure Client Local Cache Utilities
 * =============================================================
 * Local browser storage helpers for candidate profiles and user settings.
 * All cloud profile data operations are strictly gated and routed through 
 * the authenticated FastAPI backend (/api/profile). Direct unauthenticated 
 * REST calls to database tables have been removed for security & compliance.
 */

export function loadProfileFromLocal(userEmail = null) {
  if (!userEmail) return null;
  const emailClean = userEmail.trim().toLowerCase();
  try {
    const raw = localStorage.getItem(`nof_user_profile_${emailClean}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveProfileToLocal(profile, userEmail = null) {
  if (!profile) return null;
  const email = (userEmail || profile.email || '').trim().toLowerCase();
  try {
    if (email) {
      localStorage.setItem(`nof_user_profile_${email}`, JSON.stringify(profile));
    }
  } catch {}
  return profile;
}

// Deprecated direct REST calls: Retained safe local-only wrappers to prevent import breaks
export async function saveProfileToSupabase(profile, userEmail = null) {
  return saveProfileToLocal(profile, userEmail);
}

export async function fetchProfileFromSupabase(userEmail = null) {
  return loadProfileFromLocal(userEmail);
}
