import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, TrendingUp, Building2 } from 'lucide-react';

export default function MobileOverview({ metrics, profile, matches, onDiscover, onNavigate, discovering }) {
  const atsScore = profile?.ats_score || profile?.quality_score || 85;
  const topMatches = matches.slice(0, 3);

  return (
    <div>
      {/* Hero Welcome & ATS Gauge Banner */}
      <div className="mobile-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resume Quality Benchmark
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
              {atsScore}<span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/100</span>
            </div>
          </div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'conic-gradient(#6366f1 ' + (atsScore * 3.6) + 'deg, rgba(255,255,255,0.08) 0deg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#818cf8" />
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '12px' }}>
          Target alignment is optimized for Indian Startups & Fortune 500 MNC tech tiers.
        </p>
        <button 
          onClick={() => onNavigate('resume')}
          className="mobile-btn-secondary"
        >
          <span>Open ATS Resume Studio</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="mobile-stats-grid">
        <div className="metric-box">
          <div className="metric-val">{matches.length}</div>
          <div className="metric-lbl">Total Matched Roles</div>
        </div>
        <div className="metric-box">
          <div className="metric-val" style={{ color: '#34d399' }}>
            {matches.filter(m => (m.match_score || 0) >= 80).length}
          </div>
          <div className="metric-lbl">High Match (80%+)</div>
        </div>
        <div className="metric-box">
          <div className="metric-val" style={{ color: '#818cf8' }}>
            {metrics?.pending_review_count || 0}
          </div>
          <div className="metric-lbl">Staged Applications</div>
        </div>
        <div className="metric-box">
          <div className="metric-val" style={{ color: '#f43f5e' }}>
            {metrics?.avg_match_score || 78}%
          </div>
          <div className="metric-lbl">Avg Match Index</div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button 
        onClick={onDiscover}
        disabled={discovering}
        className="mobile-btn-primary"
        style={{ marginBottom: '20px' }}
      >
        <Zap size={18} />
        <span>{discovering ? 'Scanning Live Portals...' : 'Trigger Live Opportunity Sweep'}</span>
      </button>

      {/* Top Recommendations Feed */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>Top Matched Roles</h4>
        <button 
          onClick={() => onNavigate('jobs')} 
          style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
        >
          View All ({matches.length})
        </button>
      </div>

      {topMatches.map((m) => {
        const score = Math.round(m.match_score || 0);
        const job = m.job || {};
        return (
          <div key={m.id} className="mobile-card" onClick={() => onNavigate('jobs')}>
            <div className="card-title-row">
              <div>
                <div className="card-title">{job.role_title || 'Software Engineer'}</div>
                <div className="card-subtitle">{job.company || 'Tech Company'} • {job.location || 'Remote'}</div>
              </div>
              <div className={`match-pill ${score >= 80 ? 'high' : 'med'}`}>
                {score}%
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              {(job.required_skills || []).slice(0, 3).map((skill, idx) => (
                <span key={idx} className="tag-chip highlight">{skill}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
