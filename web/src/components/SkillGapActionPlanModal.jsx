import React from 'react';
import { Sparkles, Calendar, BookOpen, ExternalLink, X } from 'lucide-react';

export default function SkillGapActionPlanModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          title="Close Modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={20} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>2-Week Skill-Closing Roadmap</h3>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '20px' }}>
          {data.summary}
        </p>

        {/* Gap skills tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {data.gap_skills?.map(s => (
            <span key={s} className="badge badge-amber" style={{ fontSize: '0.78rem' }}>
              Target Gap: {s}
            </span>
          ))}
        </div>

        {/* Action Plan Phases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {data.action_plan?.map((phase, idx) => (
            <div key={idx} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.92rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} color="#38bdf8" /> {phase.phase}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                <strong>Objective:</strong> {phase.objective}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                <strong>Action:</strong> {phase.daily_action}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                ✓ Milestone: {phase.milestone}
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Learning Vault Resources */}
        {data.recommended_resources?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="#10b981" /> Verified Learning Vault Resources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recommended_resources.map((res, idx) => (
                <a 
                  key={idx} 
                  href={res.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{res.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{res.added_reason} • {res.difficulty}</div>
                  </div>
                  <ExternalLink size={14} color="#34d399" />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
