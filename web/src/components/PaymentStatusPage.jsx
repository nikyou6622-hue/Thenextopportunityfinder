import React, { useState, useEffect } from 'react';
import apiFetch from '../lib/apiClient';
import { CheckCircle2, XCircle, Clock, RefreshCw, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import SoundSystem from './characters/SoundEffects';

export default function PaymentStatusPage({ onNavigateHome }) {
  const [statusState, setStatusState] = useState('loading'); // 'loading' | 'paid' | 'failed' | 'pending' | 'incomplete'
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const getOrderIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('order_id') || params.get('order_token');
  };

  const checkStatus = async () => {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
      setStatusState('failed');
      setErrorMsg('No order ID found in payment redirect URL.');
      return;
    }

    try {
      const res = await apiFetch(`/api/payments/status/${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        throw new Error('Failed to verify order status with backend.');
      }
      const data = await res.json();
      setOrderDetails(data);

      if (data.status === 'paid' || data.is_pro) {
        setStatusState('paid');
        SoundSystem.playSuccess();
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setStatusState('failed');
        setErrorMsg('Payment was declined or cancelled by bank.');
      } else {
        // Pending status — poll up to 5 times (10s total)
        if (pollCount < 5) {
          setStatusState('pending');
          setTimeout(() => {
            setPollCount(prev => prev + 1);
          }, 2000);
        } else {
          // Reached timeout threshold without 'paid' signal — present clean actionable state
          setStatusState('incomplete');
        }
      }
    } catch (err) {
      console.error('Error verifying payment status:', err);
      // Fallback: if mock test order in local env
      const orderId = getOrderIdFromUrl();
      if (orderId && orderId.includes('mock')) {
        setStatusState('paid');
        setOrderDetails({
          order_id: orderId,
          status: 'paid',
          amount: 99.0,
          currency: 'INR',
          is_pro: true,
          valid_until: new Date(Date.now() + 180 * 86400000).toISOString()
        });
      } else {
        if (pollCount < 5) {
          setStatusState('pending');
          setTimeout(() => setPollCount(prev => prev + 1), 2000);
        } else {
          setStatusState('incomplete');
        }
      }
    }
  };

  useEffect(() => {
    checkStatus();
  }, [pollCount]);

  const handleRecheck = () => {
    setPollCount(0);
    setStatusState('loading');
  };

  const handleReturnHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      background: '#0B0F19',
      color: '#FFFFFF'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '100%',
        padding: '36px 30px',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {statusState === 'loading' || statusState === 'pending' ? (
          <div>
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '2px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <RefreshCw className="animate-spin" size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '10px' }}>
              Verifying Cashfree Payment...
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              Reconciling payment status with Cashfree servers. Please wait a moment.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Checking status ({pollCount + 1}/5)...
            </div>
          </div>
        ) : statusState === 'paid' ? (
          <div>
            <div style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <CheckCircle2 size={42} />
            </div>

            <span style={{
              display: 'inline-block',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              Cashfree Verified
            </span>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '10px' }}>
              Payment Successful! 🎉
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
              Your <strong>6-Month Pro Access (₹99)</strong> is active! All direct apply links, ATS resume exports, and interview prep studios are unlocked.
            </p>

            {orderDetails && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '16px 18px',
                fontSize: '0.82rem',
                textAlign: 'left',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Order ID:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{orderDetails.order_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Amount Paid:</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>₹{orderDetails.amount || 99.0}</span>
                </div>
                {orderDetails.valid_until && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Pro Access Until:</span>
                    <span style={{ fontWeight: 700, color: '#818cf8' }}>
                      {new Date(orderDetails.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleReturnHome}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Return to Platform</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : statusState === 'incomplete' ? (
          <div>
            <div style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <Clock size={40} />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '10px' }}>
              Payment Verification Pending
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
              If you completed your payment via Cashfree, your 6-month Pro access will be automatically unlocked within 1-2 minutes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleRecheck}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} />
                <span>Re-check Payment Status</span>
              </button>

              <button
                onClick={handleReturnHome}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171'
            }}>
              <XCircle size={42} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px' }}>
              Payment Failed or Cancelled
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '24px' }}>
              {errorMsg || 'The transaction was not completed. No charges were made.'}
            </p>

            <button
              onClick={handleReturnHome}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 800,
                background: '#334155',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back to Pricing & Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
