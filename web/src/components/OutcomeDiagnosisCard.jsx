import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lightbulb, RefreshCw, CheckCircle, Target, ArrowRight } from 'lucide-react';

export default function OutcomeDiagnosisCard({ profileId, onNavigate }) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDiagnoses = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/diagnosis/${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setDiagnoses(data);
      }
    } catch (e) {
      console.error("Error fetching outcome diagnosis:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/diagnosis/${profileId}/analyze`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDiagnoses(data);
      }
    } catch (e) {
      console.error("Error running outcome analysis:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, [profileId]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      marginBottom: '28px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Accent Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171'
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Why am I not getting through?
              </h3>
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                Agent 7 Outcome Intelligence (FREE)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0' }}>
              Automated multi-application rejection pattern diagnosis and skill adjustment strategy.
            </p>
          </div>
        </div>

        <button
          onClick={handleReanalyze}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          {loading ? "Diagnosing..." : "Run Analysis"}
        </button>
      </div>

      {/* Diagnostics List */}
      {diagnoses.length === 0 ? (
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <CheckCircle size={20} color="#34d399" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            No rejection patterns detected yet! Keep sending applications. Outcome Intelligence will alert you if 3+ rejections occur in the same domain.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {diagnoses.map((diag) => (
            <div
              key={diag.id}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Target size={16} color="#f87171" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {diag.pattern_type.replace(/_/g, ' ')}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Evidence:</strong> {diag.evidence_summary}
              </p>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '12px 14px', borderRadius: '8px' }}>
                <Lightbulb size={18} color="#818cf8" style={{ marginTop: '2px', shrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '2px' }}>
                    Actionable Recommendation
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {diag.recommendation}
                  </div>
                </div>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('profile')}
                    style={{
                      background: 'rgba(99, 102, 241, 0.3)',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Fix in ATS Studio <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
