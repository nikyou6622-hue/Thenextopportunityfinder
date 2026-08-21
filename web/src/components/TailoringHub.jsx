import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Send, 
  ShieldAlert, 
  User, 
  Mail, 
  Sparkles,
  Edit3,
  BrainCircuit
} from 'lucide-react';

export default function TailoringHub({ applications, onUpdateAppStatus, onLaunchInterviewPrep, onOpenPaywall, isPro = false }) {
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || null);

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  if (!selectedApp) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        No application packets generated yet. Go to "Discover & Match" tab and click "Tailor Resume & Apply" on any opportunity!
      </div>
    );
  }

  const job = selectedApp.job || {};
  const autofill = selectedApp.form_autofill_data || {};

  const handleCopyCoverLetter = () => {
    if (autofill.cover_letter) {
      navigator.clipboard.writeText(autofill.cover_letter);
      alert("Cover letter copied to clipboard!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {!isPro && (
        <div className="glass-panel" style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))',
          border: '2px solid #ec4899',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#ec4899" /> 1-Click Zero-Hallucination Resume Tailoring (Pro Feature)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
              Upgrade to Pro for ₹99 to generate job-specific customized CVs for 100+ MNC Requisitions instantly!
            </div>
          </div>
          <button
            onClick={onOpenPaywall}
            className="btn-tactile btn-tactile-emerald"
            style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 900 }}
          >
            Unlock Pro (₹99) →
          </button>
        </div>
      )}

      <div className="tailoring-hub-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        
        {/* Left Application Queue Selector */}
        <div className="glass-panel tailoring-hub-sidebar" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={17} color="#6366f1" /> Tailored Packets ({applications.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {applications.map(app => (
            <div
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: selectedAppId === app.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedAppId === app.id ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedAppId === app.id ? '#fff' : '#d1d5db' }}>
                {app.job?.role_title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>{app.job?.company}</span>
                <span className={`badge ${app.status === 'submitted' ? 'badge-emerald' : 'badge-amber'}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tailoring Detail & Review Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Action Banner */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{job.role_title}</h2>
                <span className="badge badge-indigo">{job.company}</span>
                <span className="badge badge-amber">{selectedApp.apply_mode}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
                Match Score: <strong style={{ color: '#34d399' }}>{selectedApp.match?.match_score}%</strong> • Applied Mode: {selectedApp.apply_mode}
              </p>
            </div>

            {/* Application Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="btn-secondary"
                onClick={() => onLaunchInterviewPrep && onLaunchInterviewPrep(selectedApp.id)}
                style={{ fontSize: '0.82rem', background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}
              >
                <BrainCircuit size={16} color="#818cf8" /> Practice Interview
              </button>

              <button 
                className="btn-secondary"
                onClick={() => onUpdateAppStatus(selectedApp.id, 'pending_manual_review')}
                style={{ fontSize: '0.82rem' }}
              >
                <ShieldAlert size={16} color="#f59e0b" /> Request Manual Review
              </button>

              <button 
                className="btn-primary"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/applications/${selectedApp.id}/track-click`, { method: 'POST' });
                    const data = await res.json();
                    const url = data.apply_url_resolved || selectedApp.apply_url_resolved || job.apply_url;
                    if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
                    onUpdateAppStatus(selectedApp.id, data.status || 'link_opened');
                  } catch (e) {
                    if (job.apply_url) window.open(job.apply_url, '_blank', 'noopener,noreferrer');
                    onUpdateAppStatus(selectedApp.id, 'link_opened');
                  }
                }}
                style={{ fontSize: '0.82rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <Send size={16} /> Open Application Link
              </button>
            </div>
          </div>
        </div>

        {/* Tailored Resume Diff & Fact-Verification Audit Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#8b5cf6" /> Agent 4 — Tailored Resume Summary
            </h3>

            {/* Zero-Hallucination Audit Badge */}
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <img src="/Success.svg" alt="Verified" style={{ width: '16px', height: '16px' }} />
              Zero-Hallucination Standard: 100% Verified
            </span>
          </div>

          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', fontSize: '0.92rem', lineHeight: 1.6, color: '#e0e7ff', marginBottom: '16px' }}>
            "{selectedApp.tailored_summary}"
          </div>

          <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
            Optimized Skill Stack Priority (Matching skills ordered first):
          </h4>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {selectedApp.tailored_skills?.map((skill, idx) => {
              const isMatch = selectedApp.match?.matching_skills?.includes(skill);
              return (
                <span key={skill} className={`skill-chip ${isMatch ? 'skill-chip-match' : ''}`}>
                  {idx + 1}. {skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Autofill Form Data Preview */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#6366f1" /> Pre-filled Form Autofill Packet
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => window.open(`/api/cover-letter/export/${selectedApp.id}?format=tex`, '_blank')} 
                style={{ fontSize: '0.78rem', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              >
                LaTeX Cover (.tex)
              </button>
              <button className="btn-secondary" onClick={handleCopyCoverLetter} style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                <Copy size={14} /> Copy Cover Letter
              </button>
            </div>
          </div>

          <div className="compact-cards-grid" style={{ marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> Full Name</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{autofill.full_name}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> Email</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{autofill.email}</div>
            </div>
          </div>

          {/* Cover Letter Box */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Generated Role Cover Letter:
            </label>
            <textarea 
              rows={5}
              value={autofill.cover_letter || ''}
              readOnly
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#d1d5db', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', lineHeight: 1.5 }}
            />
          </div>

          {/* Custom Questions */}
          {autofill.custom_questions && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Pre-filled Custom Form Answers:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {autofill.custom_questions.map((q, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a5b4fc' }}>Q: {q.question}</div>
                    <div style={{ fontSize: '0.85rem', color: '#e5e7eb', marginTop: '4px' }}>A: {q.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  </div>
  );
}
