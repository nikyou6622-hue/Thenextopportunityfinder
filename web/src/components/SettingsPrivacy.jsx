import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, User, Key, RefreshCw } from 'lucide-react';
import DataErasureControl from './DataErasureControl';
import NotificationPreferences from './NotificationPreferences';

export default function SettingsPrivacy({ profile, onProfileReset }) {
  const [consentData, setConsentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConsentRecord();
  }, [profile?.id]);

  const fetchConsentRecord = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/consent`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setConsentData(data);
      }
    } catch (e) {
      console.error("Failed to load consent record:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
          Settings, Security & Privacy
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Manage your DPDP Act data protection consent, notification cadence, encryption keys, and right to erasure.
        </p>
      </div>

      {/* 1. DPDP Act Active Consent Record */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              DPDP Act Active Consent Record
            </h3>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.78rem' }}>
            <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Consent Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Data Principal</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{profile?.name || 'Alex Mercer'}</div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Encryption Standard</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc', marginTop: '2px' }}>AES-GCM-256 (Field-Level at Rest)</div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Retention Window</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>90 Days Rolling Purge</div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Terms Specification</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>v1.2-2026-DPDP Verified</div>
          </div>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
            Consented Data Processing Purposes:
          </div>
          <ul style={{ fontSize: '0.78rem', color: '#cbd5e1', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <li>Extract candidate skills, work history, and contact coordinates for 5-pillar ATS scoring.</li>
            <li>Match profile against verified employer direct links without selling data to third parties.</li>
            <li>Generate tailored zero-hallucination PDF/DOCX resumes locally on candidate request.</li>
          </ul>
        </div>
      </div>

      {/* 2. Candidate Retention & Notification Cadence */}
      <NotificationPreferences profileId={profile?.id} />

      {/* 3. Irreversible Data Erasure Control */}
      <DataErasureControl 
        profileId={profile?.id} 
        onErasureSuccess={onProfileReset} 
      />

    </div>
  );
}
