import React, { useState, useEffect } from 'react';
import { Bell, Clock, Check, Sparkles, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import apiFetch from '../lib/apiClient';

export default function NotificationPreferences({ profileId }) {
  const [preferences, setPreferences] = useState({
    cadence: 'daily_digest',
    new_matches: true,
    mnc_scans: true,
    dead_links: true,
    quality_tips: true
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [profileId]);

  const fetchPreferences = async () => {
    try {
      const res = await apiFetch(`/api/notifications${profileId ? `/${profileId}` : ''}/preferences`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error("Failed to load notification preferences:", e);
    }
  };

  const handleUpdatePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await apiFetch(`/api/notifications${profileId ? `/${profileId}` : ''}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.error("Failed to save preferences:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="#818cf8" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            Retention & Alert Cadence Preferences
          </h3>
        </div>

        {savedSuccess && (
          <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
        Control when and how Next Opportunity Finder delivers match updates, MNC portal alerts, and application health reports.
      </p>

      {/* Cadence Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
          Delivery Cadence
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { id: 'immediate', label: 'Instant', desc: 'Real-time alerts' },
            { id: 'daily_digest', label: 'Daily Digest', desc: 'Once every 24h' },
            { id: 'weekly_digest', label: 'Weekly Digest', desc: 'Monday summary' },
            { id: 'off', label: 'Muted', desc: 'In-app only' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleUpdatePreference('cadence', opt.id)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: preferences.cadence === opt.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                background: preferences.cadence === opt.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                color: preferences.cadence === opt.id ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{opt.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { key: 'new_matches', label: 'High-Match Opportunity Alerts (≥80%)', icon: <Sparkles size={16} color="#8b5cf6" /> },
          { key: 'mnc_scans', label: 'Big MNC Career Portal Updates', icon: <Building2 size={16} color="#38bdf8" /> },
          { key: 'dead_links', label: 'Dead Application Link Warnings', icon: <AlertTriangle size={16} color="#f43f5e" /> }
        ].map(item => (
          <div
            key={item.key}
            onClick={() => handleUpdatePreference(item.key, !preferences[item.key])}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.icon}
              <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>{item.label}</span>
            </div>

            <div style={{
              width: '36px',
              height: '20px',
              borderRadius: '12px',
              background: preferences[item.key] ? '#6366f1' : 'rgba(255,255,255,0.15)',
              position: 'relative',
              transition: 'background 0.2s ease'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                top: '2px',
                left: preferences[item.key] ? '18px' : '2px',
                transition: 'left 0.2s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
