/**
 * Next Opportunity Finder — Live Supabase Cloud Client
 * ===================================================
 * Directly connects browser client to Supabase Database & Storage
 * for instant cloud persistence of candidate profiles, resumes, and saved jobs.
 */

export const SUPABASE_URL = 'https://hoobggdrjghfqxgjfoqf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvb2JnZ2RyamdoZnF4Z2pmb3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzQ5MDQsImV4cCI6MjEwMjkxMDkwNH0.2vnfF5PSQPWEk431uqKGVZjBXmMA_Gf8uasGsW3gwQs';

export async function saveProfileToSupabase(profile, userEmail = null) {
  if (!profile) return null;
  const email = (userEmail || profile.email || '').trim().toLowerCase();
  
  // Always persist locally first with user-scoped key
  if (email) {
    try {
      localStorage.setItem(`nof_user_profile_${email}`, JSON.stringify(profile));
    } catch {}
  }

  if (!email) return profile;

  // Push to Supabase Cloud Database scoped to exact email
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/candidate_profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: profile.id || `usr_${Date.now()}`,
        name: profile.name,
        email: email,
        phone: profile.phone,
        city: profile.city || profile.location?.city,
        country: profile.country || profile.location?.country,
        skills: profile.skills,
        summary: profile.summary,
        experience_list: profile.experience_list,
        education: profile.education,
        projects: profile.projects,
        ats_score: profile.ats_score,
        updated_at: new Date().toISOString()
      })
    });
    if (res.ok) {
      console.log('[Supabase Cloud]: Profile synced successfully!');
    }
  } catch (e) {
    console.warn('[Supabase Sync Notice]: Saved locally in browser storage.');
  }

  return profile;
}

export async function fetchProfileFromSupabase(userEmail = null) {
  if (!userEmail) return null;
  const emailClean = userEmail.trim().toLowerCase();

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/candidate_profiles?email=eq.${encodeURIComponent(emailClean)}&order=updated_at.desc&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }
  } catch (e) {
    console.warn('[Supabase Cloud Fetch Notice]:', e);
  }
  return null;
}

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
    localStorage.setItem('nof_user_profile', JSON.stringify(profile));
  } catch {}
  return profile;
}


