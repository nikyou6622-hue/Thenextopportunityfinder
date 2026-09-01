import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, User, Key, RefreshCw, Mail, AlertCircle, Sparkles } from 'lucide-react';
import apiFetch from '../lib/apiClient';
import DataErasureControl from './DataErasureControl';
import NotificationPreferences from './NotificationPreferences';

export default function SettingsPrivacy({ profile, onProfileReset, onOpenPaywall }) {
  const [consentData, setConsentData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email Verification state
  const [userState, setUserState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nof_user')) || {};
    } catch {
      return {};
    }
  });

  const isPro = (profile?.subscription_tier === 'pro') || (userState?.access_level === 'pro') || (userState?.subscription_tier === 'pro');
  const validUntilRaw = profile?.valid_until || userState?.valid_until;
  const validUntilDate = validUntilRaw ? new Date(validUntilRaw) : null;
  const daysRemaining = validUntilDate ? Math.max(0, Math.ceil((validUntilDate - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const isExpiringSoon = isPro && daysRemaining <= 14;

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState('');
  const [verificationStatusMsg, setVerificationStatusMsg] = useState('');
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    fetchConsentRecord();
  }, [profile?.id]);

  const fetchConsentRecord = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/profile/consent`, {
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

  const handleSendVerificationCode = async () => {
    setVerifyingEmail(true);
    setVerificationError('');
    setVerificationStatusMsg('');
    const emailToVerify = profile?.email || userState?.email || 'candidate@dev.io';

    try {
      const res = await apiFetch('/api/auth/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify, type: 'email_verification' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send verification email.');

      setOtpSent(true);
      if (data.demo_otp) {
        setDemoCodeHint(data.demo_otp);
      }
      setVerificationStatusMsg(`6-digit verification code generated and sent to ${emailToVerify}`);
    } catch (err) {
      setVerificationError(err.message || 'Error requesting verification code.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleConfirmVerificationCode = async (e) => {
    if (e) e.preventDefault();
    if (!otpToken || otpToken.trim().length !== 6) {
      setVerificationError('Please enter a valid 6-digit verification code.');
      return;
    }

    setVerifyingEmail(true);
    setVerificationError('');
    setVerificationStatusMsg('');
    const emailToVerify = profile?.email || userState?.email || 'candidate@dev.io';

    try {
      const res = await apiFetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToVerify,
          token: otpToken.trim(),
          type: 'email_verification'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid or expired verification code.');

      const updatedUser = {
        ...(userState || {}),
        is_email_verified: true
      };
      setUserState(updatedUser);
      try {
        localStorage.setItem('nof_user', JSON.stringify(updatedUser));
      } catch {}

      setOtpSent(false);
      setOtpToken('');
      setDemoCodeHint('');
      setVerificationStatusMsg('🎉 Email verified successfully! Your account now has full verified security status.');
    } catch (err) {
      setVerificationError(err.message || 'Verification failed. Please check your 6-digit code.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const isVerified = userState?.is_email_verified || profile?.is_email_verified;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
          Settings, Security & Privacy
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Manage your subscription plan, DPDP Act data protection consent, notification cadence, email verification, and right to erasure.
        </p>
      </div>

      {/* My Subscription Section */}
      <div className="glass-card" style={{ padding: '24px', borderLeft: isPro ? '4px solid #10b981' : '4px solid #6366f1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color={isPro ? "#34d399" : "#818cf8"} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                My Subscription
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                ₹99 / 6 Months Full Platform Access
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={isPro ? "badge badge-emerald" : "badge"} style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '12px', fontWeight: 800 }}>
              {isPro ? '★ PRO ACTIVE' : 'FREE TIER'}
            </span>

            {(!isPro || isExpiringSoon) && onOpenPaywall && (
              <button
                onClick={onOpenPaywall}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: '10px', fontWeight: 800 }}
              >
                {isPro ? 'Renew Subscription (₹99)' : 'Upgrade to Pro — ₹99 →'}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Current Plan</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isPro ? '#34d399' : '#818cf8', marginTop: '2px' }}>
              {isPro ? 'Pro (₹99 / 6 Months)' : 'Free Tier'}
            </div>
          </div>

          <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Valid Until</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc', marginTop: '2px' }}>
              {isPro && validUntilDate ? validUntilDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </div>
          </div>

          <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Status / Expiry</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isExpiringSoon ? '#fbbf24' : (isPro ? '#34d399' : '#94a3b8'), marginTop: '2px' }}>
              {isPro ? `Expires in ${daysRemaining} days` : '3 Unlocked Match Cards'}
            </div>
          </div>
        </div>
      </div>

      {/* 0. Email Verification Status & Security Hub */}
      <div className="glass-card" style={{ padding: '24px', border: isVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={22} color={isVerified ? "#10b981" : "#f59e0b"} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Account Email Verification
            </h3>
          </div>
          {isVerified ? (
            <span className="badge badge-emerald" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
              <CheckCircle2 size={14} style={{ marginRight: '6px' }} /> Email Verified
            </span>
          ) : (
            <span className="badge badge-amber" style={{ fontSize: '0.82rem', padding: '6px 12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <AlertCircle size={14} style={{ marginRight: '6px' }} /> Verification Required
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
          Registered Account Email: <strong style={{ color: '#6366f1' }}>{profile?.email || userState?.email || 'candidate@dev.io'}</strong>
        </p>

        {verificationError && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.84rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{verificationError}</span>
          </div>
        )}

        {verificationStatusMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.84rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{verificationStatusMsg}</span>
          </div>
        )}

        {!isVerified && !otpSent && (
          <button
            onClick={handleSendVerificationCode}
            disabled={verifyingEmail}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.88rem' }}
          >
            {verifyingEmail ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
            Send 6-Digit Verification Code
          </button>
        )}

        {otpSent && !isVerified && (
          <form onSubmit={handleConfirmVerificationCode} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit code"
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid #6366f1',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  letterSpacing: '0.25em',
                  fontFamily: 'monospace',
                  width: '200px',
                  textAlign: 'center'
                }}
              />
              <button
                type="submit"
                disabled={verifyingEmail || otpToken.length !== 6}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                {verifyingEmail ? <RefreshCw size={16} className="animate-spin" /> : 'Confirm Code'}
              </button>
            </div>
          </form>
        )}
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
