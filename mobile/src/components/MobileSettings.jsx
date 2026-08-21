import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, Bell, AlertTriangle, CheckCircle2, Lock, X } from 'lucide-react';

export default function MobileSettings({ profile, onReset }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [preferences, setPreferences] = useState({ cadence: 'daily_digest' });
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(res => res.json())
      .then(data => setPreferences(prev => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const handleCadenceChange = async (cadence) => {
    setPreferences(p => ({ ...p, cadence }));
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preferences, cadence })
      });
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCascadeDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/profile${profile?.id ? `/${profile.id}` : ''}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': 'nof-dev-key-2026' }
      });
      if (res.ok) {
        localStorage.clear();
        sessionStorage.clear();
        setShowDeleteModal(false);
        if (onReset) onReset();
        else window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Settings & Privacy
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
          DPDP Act privacy controls, notifications, and right to erasure.
        </p>
      </div>

      {/* DPDP Consent */}
      <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>DPDP Act Compliance</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          Encryption: AES-GCM-256 (At Rest)<br />
          Data Principal: {profile?.name || 'Active Candidate'}<br />
          Retention: 90 Days Rolling Purge
        </div>
      </div>

      {/* Notification Frequency */}
      <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#818cf8" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>Alert Cadence</span>
          </div>
          {saveNotice && <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>Saved</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['immediate', 'daily_digest', 'weekly_digest', 'off'].map(opt => (
            <button
              key={opt}
              onClick={() => handleCadenceChange(opt)}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: preferences.cadence === opt ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                background: preferences.cadence === opt ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                color: preferences.cadence === opt ? '#fff' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {opt.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Erasure Action */}
      <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.06)', borderRadius: '14px', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <AlertTriangle size={18} color="#f43f5e" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>Delete All Data</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#fda4af', marginBottom: '12px' }}>
          Irreversibly delete resume, matches, and application history per DPDP Act Section 12.
        </p>
        <button
          onClick={() => {
            setConfirmText('');
            setShowDeleteModal(true);
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid #f43f5e',
            color: '#f43f5e',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Trash2 size={16} /> Delete Account & All Data
        </button>
      </div>

      {/* Bottom Sheet Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 9999
        }}>
          <div style={{
            width: '100%',
            background: '#0f172a',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '24px 20px',
            borderTop: '1px solid rgba(244, 63, 94, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Confirm Irreversible Erasure</span>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '14px' }}>
              Type <strong style={{ color: '#f43f5e' }}>DELETE</strong> to permanently erase your profile and records:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#000',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                marginBottom: '16px'
              }}
            />

            <button
              onClick={handleCascadeDelete}
              disabled={isDeleting || confirmText.trim().toUpperCase() !== 'DELETE'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: confirmText.trim().toUpperCase() === 'DELETE' ? '#f43f5e' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: confirmText.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed'
              }}
            >
              {isDeleting ? 'Erasing...' : 'Confirm Cascade Delete'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
