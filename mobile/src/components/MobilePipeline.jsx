import React from 'react';
import { Layers, Clock, Send, CheckCircle, XCircle } from 'lucide-react';

export default function MobilePipeline({ applications, onUpdateStatus }) {
  const stages = [
    { id: 'interview_scheduled', label: 'Interviews', color: '#10b981' },
    { id: 'tailored', label: 'Tailored', color: '#6366f1' },
    { id: 'pending_manual_review', label: 'Review', color: '#f59e0b' },
    { id: 'rejected', label: 'Outcomes', color: '#ef4444' }
  ];

  return (
    <div>
      <div className="mobile-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))' }}>
        <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>APPLICATION TRACKER</div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
          Kanban Lifecycle ({applications.length} active)
        </div>
      </div>

      {stages.map((st) => {
        const stageApps = applications.filter(a => a.status === st.id);
        return (
          <div key={st.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{st.label}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{stageApps.length}</span>
            </div>

            {stageApps.length === 0 ? (
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                No applications in this stage
              </div>
            ) : (
              stageApps.map(app => (
                <div key={app.id} className="mobile-card" style={{ marginBottom: '8px', padding: '12px' }}>
                  <div className="card-title-row">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {app.job?.role_title || `Role #${app.job_id}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {app.job?.company || 'Company'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {st.id !== 'interview_scheduled' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'interview_scheduled')}
                        style={{
                          padding: '4px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)',
                          border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.68rem',
                          fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Set Interview
                      </button>
                    )}
                    {st.id !== 'rejected' && (
                      <button
                        onClick={() => onUpdateStatus(app.id, 'rejected')}
                        style={{
                          padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.68rem',
                          fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Log Rejection
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
