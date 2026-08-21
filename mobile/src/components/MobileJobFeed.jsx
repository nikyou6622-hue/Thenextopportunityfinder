import React, { useState } from 'react';
import { Search, ExternalLink, Zap, Building2, Globe, CheckCircle2 } from 'lucide-react';

export default function MobileJobFeed({ matches, onTailor, onDiscover, discovering }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tailoringId, setTailoringId] = useState(null);
  const [tailoredSuccess, setTailoredSuccess] = useState({});

  const handleTailorClick = async (matchId) => {
    setTailoringId(matchId);
    try {
      await onTailor(matchId);
      setTailoredSuccess(prev => ({ ...prev, [matchId]: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setTailoringId(null);
    }
  };

  const filteredMatches = matches.filter(m => {
    const job = m.job || {};
    const titleMatch = (job.role_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (job.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;

    if (filter === 'high') return (m.match_score || 0) >= 80;
    if (filter === 'remote') return job.remote === true;
    if (filter === 'mnc') return job.source_category === 'mnc';
    return true;
  });

  return (
    <div>
      {/* Search & Filter Bar */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{
          position: 'relative', marginBottom: '10px'
        }}>
          <input 
            type="text"
            placeholder="Search roles or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '12px',
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: `All (${matches.length})` },
            { id: 'high', label: 'High Match (80%+)' },
            { id: 'remote', label: 'Remote Only' },
            { id: 'mnc', label: 'Fortune 500 MNC' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid ' + (filter === f.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'),
                background: filter === f.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                color: filter === f.id ? '#a5b4fc' : '#94a3b8',
                fontSize: '0.74rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discovered Match Cards */}
      {filteredMatches.length === 0 ? (
        <div className="mobile-card" style={{ textAlign: 'center', padding: '30px 16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
            No opportunities match your current filters.
          </div>
          <button onClick={onDiscover} disabled={discovering} className="mobile-btn-primary">
            <Zap size={16} />
            <span>{discovering ? 'Scanning...' : 'Trigger Live Opportunity Sweep'}</span>
          </button>
        </div>
      ) : (
        filteredMatches.map(m => {
          const score = Math.round(m.match_score || 0);
          const job = m.job || {};
          const isTailored = tailoredSuccess[m.id];

          return (
            <div key={m.id} className="mobile-card">
              <div className="card-title-row">
                <div>
                  <div className="card-title">{job.role_title}</div>
                  <div className="card-subtitle">
                    {job.company} • {job.location || 'Remote'}
                  </div>
                </div>
                <div className={`match-pill ${score >= 80 ? 'high' : 'med'}`}>
                  {score}%
                </div>
              </div>

              {/* Skills overlap */}
              <div style={{ margin: '10px 0' }}>
                {(job.required_skills || []).slice(0, 4).map((s, idx) => (
                  <span key={idx} className="tag-chip highlight">{s}</span>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => handleTailorClick(m.id)}
                  disabled={tailoringId === m.id || isTailored}
                  className="mobile-btn-primary"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    background: isTailored ? 'rgba(16,185,129,0.2)' : undefined,
                    border: isTailored ? '1px solid rgba(16,185,129,0.4)' : undefined,
                    color: isTailored ? '#34d399' : '#fff'
                  }}
                >
                  {isTailored ? (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Tailored & Staged</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>{tailoringId === m.id ? 'Tailoring with AI...' : 'Tailor with AI'}</span>
                    </>
                  )}
                </button>

                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mobile-btn-secondary"
                    style={{ padding: '8px 12px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
