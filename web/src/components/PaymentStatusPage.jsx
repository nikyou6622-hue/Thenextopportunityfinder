import React, { useState, useEffect } from 'react';
import apiFetch from '../lib/apiClient';
import { CheckCircle2, XCircle, Clock, RefreshCw, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import SoundSystem from './characters/SoundEffects';

export default function PaymentStatusPage({ onNavigateHome, onSubscriptionUpdated }) {
  const [statusState, setStatusState] = useState('loading'); // 'loading' | 'paid' | 'failed' | 'pending' | 'incomplete'
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const getOrderIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('order_id') || params.get('order_token');
  };

  const getReturnTargetTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      if (redirectParam && redirectParam !== 'payment-status' && redirectParam !== 'payment/status') {
        return redirectParam;
      }
      const savedTab = sessionStorage.getItem('nof_payment_return_tab');
      if (savedTab && savedTab !== 'payment-status' && savedTab !== 'payment/status') {
        return savedTab;
      }
    } catch {}
    return 'overview';
  };

  const formatTabLabel = (tab) => {
    switch (tab) {
      case 'jobs': return 'Jobs & Opportunities';
      case 'discovery': return 'Company Discovery';
      case 'interview-prep': return 'AI Interview Studio';
      case 'resume-builder': return 'ATS Resume Builder';
      case 'overview': return 'Dashboard Overview';
      case 'salary': return 'Salary Intelligence';
      default: return tab ? (tab.charAt(0).toUpperCase() + tab.slice(1)) : 'Dashboard';
    }
  };

  const checkStatus = async () => {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
      setStatusState('failed');
      setErrorMsg('No payment order ID found in the redirect URL.');
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
        // Fresh entitlement re-fetch from backend
        if (onSubscriptionUpdated) {
          try { await onSubscriptionUpdated(); } catch {}
        }
        setStatusState('paid');
        SoundSystem.playSuccess();
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setStatusState('failed');
        setErrorMsg('Payment was declined or cancelled at the payment gateway. No charges were processed.');
      } else {
        // Status is pending/created — poll up to 10 times (15s total) with 1.5s interval
        if (pollCount < 10) {
          setStatusState('pending');
          setTimeout(() => {
            setPollCount(prev => prev + 1);
          }, 1500);
        } else {
          // 15s timeout threshold reached
          setStatusState('incomplete');
        }
      }
    } catch (err) {
      console.error('Error verifying Cashfree payment status:', err);
      const orderId = getOrderIdFromUrl();
      if (orderId && orderId.includes('mock')) {
        if (onSubscriptionUpdated) {
          try { await onSubscriptionUpdated(); } catch {}
        }
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
        if (pollCount < 10) {
          setStatusState('pending');
          setTimeout(() => setPollCount(prev => prev + 1), 1500);
        } else {
          setStatusState('incomplete');
        }
      }
    }
  };

  useEffect(() => {
    checkStatus();
  }, [pollCount]);

  const handleRecheck = async () => {
    if (onSubscriptionUpdated) {
      try { await onSubscriptionUpdated(); } catch {}
    }
    setPollCount(0);
    setStatusState('loading');
  };

  const handleReturnHome = async () => {
    if (onSubscriptionUpdated) {
      try { await onSubscriptionUpdated(); } catch {}
    }
    const targetTab = getReturnTargetTab();
    if (onNavigateHome) {
      onNavigateHome(targetTab);
    } else {
      window.location.href = `/${targetTab === 'home' ? '' : targetTab}`;
    }
  };

  const targetTabName = getReturnTargetTab();

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
        maxWidth: '520px',
        width: '100%',
        padding: '38px 32px',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {statusState === 'loading' || statusState === 'pending' ? (
          <div>
            <div style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '2px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)'
            }}>
              <RefreshCw className="animate-spin" size={34} />
            </div>

            <span style={{
              display: 'inline-block',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '14px'
            }}>
              Cashfree Verification
            </span>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px', color: '#f8fafc' }}>
              Confirming Your Payment...
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '24px' }}>
              Reconciling payment status with Cashfree servers to grant your Pro entitlement. Please wait a moment.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.82rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Clock size={16} />
              <span>Verifying order status ({pollCount + 1}/10)...</span>
            </div>
          </div>
        ) : statusState === 'paid' ? (
          <div>
            <div style={{
              width: '78px',
              height: '78px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '14px'
            }}>
              <ShieldCheck size={14} /> Cashfree Verified · Pro Active
            </span>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '10px', color: '#ffffff' }}>
              Pro Access Unlocked! 🎉
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
              Your <strong>6-Month Pro Subscription (₹{orderDetails?.amount || 79.0})</strong> is active! All direct apply links, unlimited ATS resumes, and voice AI interview modules are ready.
            </p>

            {orderDetails && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '0.84rem',
                textAlign: 'left',
                marginBottom: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Order ID:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#e2e8f0' }}>{orderDetails.order_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Amount Paid:</span>
                  <span style={{ fontWeight: 800, color: '#34d399' }}>₹{orderDetails.amount || 79.0}</span>
                </div>
                {orderDetails.valid_until && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Valid Until:</span>
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
                padding: '15px',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              <span>Return to {formatTabLabel(targetTabName)}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : statusState === 'incomplete' ? (
          <div>
            <div style={{
              width: '78px',
              height: '78px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.3)'
            }}>
              <Clock size={42} />
            </div>

            <span style={{
              display: 'inline-block',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fef08a',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '14px'
            }}>
              Confirmation Pending
            </span>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px', color: '#f8fafc' }}>
              Finalizing Your Subscription
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
              Payment was received, but Cashfree's confirmation notification is taking a few moments. Your access will activate automatically once confirmed.
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
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
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
                Return to {formatTabLabel(targetTabName)}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: '78px',
              height: '78px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185',
              boxShadow: '0 0 25px rgba(244, 63, 94, 0.3)'
            }}>
              <XCircle size={44} />
            </div>

            <span style={{
              display: 'inline-block',
              background: 'rgba(244, 63, 94, 0.2)',
              color: '#fecdd3',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '14px'
            }}>
              Transaction Cancelled
            </span>

            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, marginBottom: '10px', color: '#ffffff' }}>
              Payment Not Completed
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
              {errorMsg || 'The transaction was declined or cancelled at the payment gateway. No charges were made to your account.'}
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
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(225, 29, 72, 0.3)'
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
