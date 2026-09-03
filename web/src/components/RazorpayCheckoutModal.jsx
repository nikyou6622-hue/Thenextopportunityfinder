import React, { useState } from 'react';
import apiFetch from '../lib/apiClient';
import { ShieldCheck, CheckCircle2, Zap, X, CreditCard, Sparkles, Clock, Lock, RefreshCw } from 'lucide-react';

export default function RazorpayCheckoutModal({ isOpen, onClose, user, profile, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Call backend endpoint to create Cashfree Order
      const res = await apiFetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 99.0,
          currency: 'INR',
          profile_id: profile?.id
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create payment order. Please try again.');
      }

      const orderData = await res.json();
      const sessionData = orderData.payment_session_id;

      if (!sessionData) {
        throw new Error('Payment Session ID not returned by server.');
      }

      // 2. Load Cashfree Checkout JS SDK v3
      const sdkLoaded = await loadCashfreeScript();

      if (!sdkLoaded || !window.Cashfree || sessionData.startsWith('session_mock_')) {
        // Test / Sandbox Fallback Simulation Mode
        const mockOrderId = orderData.order_id || `order_mock_${Date.now()}`;
        window.location.href = `/payment/status?order_id=${mockOrderId}`;
        return;
      }

      // 3. Initialize Cashfree SDK & Launch Hosted Checkout Page / Modal
      const mode = orderData.cashfree_env === 'sandbox' ? 'sandbox' : 'production';
      const cashfree = window.Cashfree({ mode });

      const checkoutOptions = {
        paymentSessionId: sessionData,
        redirectTarget: '_self'
      };

      cashfree.checkout(checkoutOptions);
    } catch (err) {
      console.error('Cashfree payment initiation error:', err);
      setError(err.message || 'An unexpected error occurred during checkout.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(5, 8, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '1px solid rgba(129, 140, 248, 0.4)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        position: 'relative',
        animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '28px 28px 24px 28px',
          color: '#fff',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            aria-label="Close checkout modal"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.25)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            <Sparkles size={14} color="#fde047" /> Cashfree Payments · 6 Months Pro
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px 0', lineHeight: 1.2 }}>
            Unlock Pro Access — ₹99
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#c7d2fe', margin: 0, fontWeight: 500 }}>
            6 Months of Unlimited AI Career Acceleration & Direct Apply Access
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px' }}>
          {successData ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                🎉 You're Pro for 6 Months!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '24px' }}>
                Payment verified. All direct apply links, ATS resume exports, and interview studio are now unlocked.
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 800 }}
              >
                Continue to Platform →
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.82rem', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Pro Access (6 Months)</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a7f3d0' }}>₹99</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Direct, canonical employer apply links (100% direct apply)',
                    'Unlimited single-column ATS resume rewrites & exports (PDF, DOCX, TeX)',
                    'Big-MNC direct portal job scanner & freshers internship hub',
                    'Role-specific STAR question banks & CS interview studio',
                    '2-Week skill-gap learning roadmap'
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#818cf8" /> Secure Cashfree Gateway
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#fbbf24" /> Instant 6-Month Activation
                </span>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Connecting to Cashfree...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Pay ₹99 via Cashfree →</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
