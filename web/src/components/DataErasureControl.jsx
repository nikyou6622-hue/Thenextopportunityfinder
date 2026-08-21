import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert, X, Loader2 } from 'lucide-react';

export default function DataErasureControl({ profileId, onErasureSuccess }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeletePermanent = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setErrorMsg("Please type 'DELETE' to confirm irreversible erasure.");
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/profile${profileId ? `/${profileId}` : ''}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        // Clear all client-side cached data & storage per Skill 3 / Frontend Blueprint
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error("Storage clear error:", e);
        }

        setShowConfirmModal(false);
        if (onErasureSuccess) {
          onErasureSuccess();
        } else {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        setErrorMsg(data.detail || "Failed to execute cascade erasure.");
      }
    } catch (err) {
      setErrorMsg("Network error during data erasure: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f43f5e', background: 'rgba(244, 63, 94, 0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldAlert size={20} color="#f43f5e" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              DPDP Act Right to Erasure
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '580px', lineHeight: 1.5 }}>
            Permanently deletes your uploaded resume, extracted PII, 5-pillar ATS scores, job matches, tailored exports, and application events across all database tables. This action is immediate and irreversible.
          </p>
        </div>

        <button
          onClick={() => {
            setConfirmText('');
            setErrorMsg('');
            setShowConfirmModal(true);
          }}
          className="btn-destructive-confirm"
        >
          <Trash2 size={16} /> Delete Account & All Data
        </button>
      </div>

      {/* Irreversible Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '30px', border: '1px solid rgba(244, 63, 94, 0.35)', position: 'relative' }}>
            
            <button
              onClick={() => setShowConfirmModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              disabled={isDeleting}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="#f43f5e" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  Confirm Full Cascade Erasure
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700 }}>
                  WARNING: THIS ACTION CANNOT BE UNDONE
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
              In compliance with DPDP Act Section 12 (Right to Erasure), clicking confirm will execute a true cascade deletion permanently clearing:
            </p>

            <ul style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Encrypted candidate profile & contact details</li>
              <li>Calculated 5-pillar ATS benchmarks & quality suggestions</li>
              <li>All semantic matches & skill-gap records</li>
              <li>Tailored resumes & application click logs</li>
              <li>All client-side cache and authentication sessions</li>
            </ul>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>
                Type <strong style={{ color: '#f43f5e' }}>DELETE</strong> below to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)'
                }}
                disabled={isDeleting}
              />
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af', fontSize: '0.8rem', marginBottom: '16px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDeletePermanent}
                className="btn-destructive-confirm"
                disabled={isDeleting || confirmText.trim().toUpperCase() !== 'DELETE'}
                style={{
                  opacity: confirmText.trim().toUpperCase() === 'DELETE' ? 1 : 0.6,
                  cursor: confirmText.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed'
                }}
              >
                {isDeleting ? (
                  <>
                    <img src="/loading.svg" alt="Erasing" style={{ width: '16px', height: '16px' }} /> Erasing All Data...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Permanently Erase All Data
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
