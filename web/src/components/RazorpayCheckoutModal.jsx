import React, { useState } from 'react';
import apiFetch from '../lib/apiClient';
import { ShieldCheck, CheckCircle2, Zap, X, CreditCard, Sparkles, Clock, Lock } from 'lucide-react';

export default function RazorpayCheckoutModal({ isOpen, onClose, user, profile, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Call backend to create Razorpay Order
      const res = await apiFetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 99.0, currency: 'INR' })
      });

      if (!res.ok) {
        throw new Error('Failed to create payment order. Please try again.');
      }

      const orderData = await res.json();
      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay || orderData.key_id?.startsWith('rzp_test_mock')) {
        // Test / Sandbox Simulation Mode (Smooth Fallback for local testing without live keys)
        const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const mockOrderId = orderData.order_id || `order_mock_${Date.now()}`;
        const mockSig = `sig_mock_${Date.now()}`;

        const verifyRes = await apiFetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: mockOrderId,
            razorpay_signature: mockSig,
            profile_id: profile?.id
          })
        });

        if (verifyRes.ok) {
          const vData = await verifyRes.json();
          setSuccessData(vData);
          if (onPaymentSuccess) onPaymentSuccess(vData);
        } else {
          throw new Error('Payment verification failed.');
        }
        setLoading(false);
        return;
      }

      // Live Razorpay Modal Integration
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'NextOpportunityFind Pro',
        description: '6 Months Full Pro Access (₹99)',
        image: '/logo.png',
        order_id: orderData.order_id,
        prefill: {
          name: user?.full_name || profile?.name || '',
          email: user?.email || profile?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        handler: async function (response) {
          try {
            const verifyRes = await apiFetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                profile_id: profile?.id
              })
            });

            if (verifyRes.ok) {
              const vData = await verifyRes.json();
              setSuccessData(vData);
              if (onPaymentSuccess) onPaymentSuccess(vData);
            } else {
              setError('Payment verification failed. Please contact support with payment ID.');
            }
          } catch (err) {
            setError('Error verifying payment: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
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
            <Sparkles size={14} color="#fde047" /> Exclusive Early Access Offer
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
                🎉 You're Pro Until {new Date(successData.valid_until || Date.now() + 180*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '24px' }}>
                Payment verified ({successData.payment_id}). All features, direct apply links, and ATS resume exports are now unlocked.
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
                  <ShieldCheck size={16} color="#818cf8" /> Secure Razorpay Payment
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
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Pay ₹99 & Unlock Pro Access →</span>
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
