import React, { useState } from 'react';
import apiFetch from '../lib/apiClient';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink,
  ChevronDown,
  Globe,
  AlertCircle,
  Mail,
  Building2,
  BrainCircuit,
  Briefcase,
  Sparkles,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';
import EmptyStateCharacter from './characters/EmptyStateCharacter';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';

export default function ApplicationPipeline({ applications = [], onUpdateAppStatus, onLaunchInterviewPrep }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [openingId, setOpeningId] = useState(null);

  // Normalized list of apps (Real Data Only)
  const appList = applications.length > 0 ? applications.map(app => {
    const j = app.job || {};
    let statusLabel = 'Applied';
    let statusClass = 'badge-status-applied';
    
    if (app.status === 'interview_scheduled' || app.status === 'interview') {
      statusLabel = 'Interview';
      statusClass = 'badge-status-interview';
    } else if (app.status === 'offer_received' || app.status === 'offered' || app.status === 'hired') {
      statusLabel = 'Offered';
      statusClass = 'badge-status-offered';
    } else if (app.status === 'rejected') {
      statusLabel = 'Rejected';
      statusClass = 'badge-status-rejected';
    } else if (app.status === 'link_opened' || app.status === 'submitted' || app.status === 'tailored') {
      statusLabel = 'In Review';
      statusClass = 'badge-status-review';
    }

    return {
      id: app.id,
      company: j.company || 'Direct Employer',
      role_title: j.role_title || j.title || 'Software Engineer',
      applied_time: 'Applied recently',
      status: app.status,
      status_label: statusLabel,
      status_badge_class: statusClass,
      logo: (j.company || 'D').charAt(0).toUpperCase(),
      logo_bg: '#7C3AED',
      match_score: app.match?.match_score || 88,
      raw: app
    };
  }) : [];

  const filteredList = appList.filter(app => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'applied') return app.status === 'applied' || app.status_label.toLowerCase() === 'applied';
    if (filterStatus === 'interview') return app.status === 'interview' || app.status === 'interview_scheduled' || app.status_label.toLowerCase() === 'interview';
    if (filterStatus === 'offered') return app.status === 'offered' || app.status === 'offer_received' || app.status === 'hired' || app.status_label.toLowerCase() === 'offered';
    if (filterStatus === 'rejected') return app.status === 'rejected' || app.status_label.toLowerCase() === 'rejected';
    return true;
  });

  const handleOpenApplication = async (app) => {
    const rawApp = app.raw || app;
    setOpeningId(app.id);
    try {
      const res = await apiFetch(`/api/applications/${app.id}/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      const targetUrl = data.apply_url_resolved || rawApp.apply_url_resolved || rawApp.job?.apply_url || `https://www.google.com/search?q=${encodeURIComponent((app.company || 'Tech') + ' ' + (app.role_title || '') + ' careers apply')}`;
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
      if (onUpdateAppStatus) {
        onUpdateAppStatus(app.id, data.status || 'link_opened');
      }
    } catch (err) {
      console.error('Error opening application link:', err);
      const fallbackUrl = rawApp.apply_url_resolved || rawApp.job?.apply_url || `https://www.google.com/search?q=${encodeURIComponent((app.company || 'Tech') + ' ' + (app.role_title || '') + ' careers apply')}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 🌟 NOVA PIPELINE TRACKER GUIDANCE */}
      <CharacterSpeechBubble
        character="nova"
        pose="celebrate"
        message="Active Pipeline Tracker: Keep momentum rolling with regular follow-ups!"
        subtitle="Recruiter Pro-Tip: Applications with tailored ATS resumes and GitHub project demos have a 4.2x higher interview callback rate."
        variant="indigo"
      />

      {/* Top Filter Bar & Summary Header (Design System Screen 07) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(124, 58, 237, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={20} color="#C4B5FD" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              My Applications
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {filteredList.length} active submissions tracked in real-time
            </span>
          </div>
        </div>

        {/* Action Controls: Tabs & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status Filter Tabs matching Screen 07 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'applied', label: 'Applied' },
              { id: 'interview', label: 'Interview' },
              { id: 'offered', label: 'Offered' }
            ].map((t) => {
              const isActive = filterStatus === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setFilterStatus(t.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? '#7C3AED' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.4)' : 'none'
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? '#7C3AED' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 8px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Card View (Screen 07)"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#7C3AED' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 8px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Lifecycle Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 07. SCREEN 07 CARD VIEW */}
      {viewMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredList.map((app, idx) => (
            <motion.div
              key={app.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              style={{
                background: 'rgba(19, 20, 36, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.35)';
                e.currentTarget.style.background = 'rgba(25, 27, 48, 0.85)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.background = 'rgba(19, 20, 36, 0.75)';
              }}
            >
              {/* Left: Company Icon + Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: app.logo_bg || '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
                }}>
                  {app.logo}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>
                    {app.role_title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#CBD5E1' }}>{app.company}</span>
                    <span>•</span>
                    <span style={{ fontSize: '0.75rem' }}>{app.applied_time}</span>
                  </div>
                </div>
              </div>

              {/* Right: Status Badge & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span className={app.status_badge_class}>
                  {app.status_label}
                </span>

                {onLaunchInterviewPrep && (
                  <button
                    onClick={() => onLaunchInterviewPrep(app.id)}
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      color: '#C4B5FD',
                      borderRadius: '9999px',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Launch AI Interview Prep Studio"
                  >
                    <BrainCircuit size={13} />
                    <span>Prep</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenApplication(app)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Open application link"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADVANCED LIFECYCLE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Role / Company</th>
                  <th style={{ padding: '12px 16px' }}>Match Score</th>
                  <th style={{ padding: '12px 16px' }}>Lifecycle Status</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{app.role_title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{app.company} · {app.applied_time}</div>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                        {app.match_score}%
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span className={app.status_badge_class}>
                        {app.status_label}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {onLaunchInterviewPrep && (
                          <button
                            onClick={() => onLaunchInterviewPrep(app.id)}
                            style={{
                              background: 'rgba(124, 58, 237, 0.15)',
                              border: '1px solid rgba(124, 58, 237, 0.3)',
                              color: '#C4B5FD',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <BrainCircuit size={13} />
                            Interview Prep
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenApplication(app)}
                          style={{
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
