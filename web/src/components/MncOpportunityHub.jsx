import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Filter, 
  Award,
  Calendar
} from 'lucide-react';

export default function MncOpportunityHub({ onTailor, loading: parentLoading, onOpenPaywall, onScrapeTriggered, isPro = false }) {
  const [mncMatches, setMncMatches] = useState([]);
  const [scanStatus, setScanStatus] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const targetCompanies = [
    { name: 'All MNCs', key: 'all' },
    { name: 'Infosys', key: 'Infosys' },
    { name: 'Deloitte', key: 'Deloitte' },
    { name: 'HCLTech', key: 'HCLTech' },
    { name: 'TCS', key: 'TCS' },
    { name: 'Wipro', key: 'Wipro' },
    { name: 'Accenture', key: 'Accenture' },
    { name: 'Cognizant', key: 'Cognizant' },
    { name: 'Google', key: 'Google' },
    { name: 'Microsoft', key: 'Microsoft' },
    { name: 'Amazon', key: 'Amazon' },
    { name: 'Capgemini', key: 'Capgemini' }
  ];

  const fetchMncData = async () => {
    setLoading(true);
    try {
      // 1. Fetch MNC jobs
      const jobsUrl = selectedCompany === 'all' 
        ? '/api/jobs/mnc' 
        : `/api/jobs/mnc?company=${encodeURIComponent(selectedCompany)}`;
      
      const jobsRes = await fetch(jobsUrl);
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setMncMatches(data);
      }

      // 2. Fetch scan status
      const statusRes = await fetch('/api/jobs/mnc/scan-status');
      if (statusRes.ok) {
        const sData = await statusRes.json();
        setScanStatus(sData);
      }
    } catch (e) {
      console.error("Error fetching MNC scanner data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMncData();
  }, [selectedCompany]);

  const handleManualScan = async () => {
    if (onScrapeTriggered) {
      const allowed = await onScrapeTriggered();
      if (!allowed) {
        if (onOpenPaywall) onOpenPaywall();
        return;
      }
    }
    setScanning(true);
    try {
      const res = await fetch('/api/jobs/mnc/scan', { method: 'POST' });
      if (res.ok) {
        await fetchMncData();
      }
    } catch (e) {
      console.error("Manual MNC scan error:", e);
    } finally {
      setScanning(false);
    }
  };

  const formatLastScanned = (isoString) => {
    if (!isoString) return 'Not scanned yet';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredMatches = mncMatches.filter(m => {
    const job = m.job || {};
    const matchesSearch = 
      (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.role_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.required_skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Header */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.92))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Skyscraper Thumbnail Glow */}
        <div style={{
          position: 'absolute', right: '0', top: '0', bottom: '0',
          width: '320px',
          opacity: 0.35,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)'
        }}>
          <img 
            src="/thumbnails/mnc_careers_banner.png" 
            alt="MNC Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} color="#818cf8" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Agent 2b • Big-MNC Opportunity Scanner
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                ● Daily Scheduled Pipeline
              </span>
            </div>
            
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
              Major Corporate & IT-Services Openings
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '650px', lineHeight: 1.5 }}>
              Dedicated pipeline scanning official career portals of major Indian & global IT MNCs (Infosys, Deloitte, HCLTech, TCS, Wipro, Accenture, Capgemini). Rate-limited, polite, and fresh.
            </p>
          </div>

          <button
            onClick={handleManualScan}
            disabled={scanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: scanning ? 'rgba(99, 102, 241, 0.4)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: scanning ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
          >
            {scanning ? (
              <img src="/loading.svg" alt="Scanning" style={{ width: '18px', height: '18px' }} />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{scanning ? 'Scanning Portals...' : 'Trigger MNC Refresh'}</span>
          </button>
        </div>

        {/* Micro Metrics Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Portals Monitored</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              {scanStatus?.total_companies_monitored || 7} Official Feeds
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Total Open Roles</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8', marginTop: '2px' }}>
              {mncMatches.length} Open Positions
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Last Pipeline Run</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>{formatLastScanned(scanStatus?.last_scan_run)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visually Distinct Company Filter Chips */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="#6366f1" />
          <span>Filter by MNC Employer</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {targetCompanies.map(comp => {
            const isSelected = selectedCompany === comp.key;
            const statusObj = scanStatus?.company_statuses?.[comp.key];
            const roleCount = comp.key === 'all' 
              ? mncMatches.length 
              : mncMatches.filter(m => m.job?.company?.toLowerCase() === comp.key.toLowerCase()).length;

            return (
              <button
                key={comp.key}
                onClick={() => setSelectedCompany(comp.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(79, 70, 229, 0.35))'
                    : 'rgba(0, 0, 0, 0.3)',
                  border: isSelected 
                    ? '1px solid rgba(99, 102, 241, 0.8)' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{comp.name}</span>
                <span style={{
                  padding: '1px 7px',
                  borderRadius: '10px',
                  background: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: isSelected ? '#fff' : '#94a3b8'
                }}>
                  {roleCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Companies Portal Status Drawer */}
      {scanStatus && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {Object.entries(scanStatus.company_statuses || {}).map(([cName, info]) => (
            <div key={cName} style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{cName}</span>
                {info.status === 'success' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> Active
                  </span>
                ) : info.status === 'skipped_robots' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                    <ShieldCheck size={12} /> Robots.txt
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>
                    <AlertCircle size={12} /> Issue
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                <span>Roles: <strong style={{ color: '#818cf8' }}>{info.total_open_roles}</strong></span>
                <span>{formatLastScanned(info.last_scanned_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search MNC job titles, required skills, domains..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ fontSize: '0.82rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
          Showing <strong style={{ color: '#a5b4fc' }}>{filteredMatches.length}</strong> listings
        </div>
      </div>

      {/* Job Listings Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: '#6366f1' }} />
          <div>Loading MNC Opportunity Feed...</div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <Building2 size={36} color="#64748b" style={{ marginBottom: '12px' }} />
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '4px' }}>No MNC roles found for this filter</h3>
          <p style={{ fontSize: '0.85rem' }}>Try clearing the search query or selecting "All MNCs".</p>
        </div>
      ) : (
        <div className="job-cards-grid">
          {filteredMatches.map((m, idx) => {
            const job = m.job || {};
            const comp = job.company || 'MNC Corp';
            const isNewToday = job.posted_date === todayStr;
            const cLower = comp.toLowerCase();
            const isJobLocked = !isPro && idx >= 5;

            const themeType = cLower.includes('spotify') ? 'amber' :
              cLower.includes('airbnb') ? 'coral' :
              cLower.includes('google') ? 'purple' :
              idx % 4 === 0 ? 'purple' :
              idx % 4 === 1 ? 'coral' :
              idx % 4 === 2 ? 'amber' :
              'cyan';

            const isAmber = themeType === 'amber';
            const bgGradient = themeType === 'purple' 
              ? 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)'
              : themeType === 'coral'
              ? 'linear-gradient(135deg, #9f1239 0%, #dc2626 45%, #ff5a5f 100%)'
              : themeType === 'amber'
              ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 45%, #ffb020 100%)'
              : 'linear-gradient(135deg, #0369a1 0%, #0284c7 45%, #0ea5e9 100%)';

            return (
              <div 
                key={m.id || idx}
                className="two-tone-job-card"
                onClick={() => {
                  if (isJobLocked && onOpenPaywall) {
                    onOpenPaywall();
                  }
                }}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  isolation: 'isolate',
                  transform: 'translateZ(0)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                  border: isJobLocked ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: isJobLocked ? 'pointer' : 'default'
                }}
              >
                {isJobLocked && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 20,
                    background: 'rgba(15, 23, 42, 0.86)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🔒 PRO LOCKED MNC ROLE #{(idx + 1)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f472b6', maxWidth: '300px' }}>
                      First 5 MNC roles are free. Unlock thousands of verified off-campus MNC openings for ₹99 Lifetime!
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenPaywall) onOpenPaywall();
                      }}
                      className="btn-tactile btn-tactile-emerald"
                      style={{ padding: '8px 18px', fontSize: '0.8rem', fontWeight: 900, marginTop: '4px' }}
                    >
                      Unlock All MNC Roles (₹99) →
                    </button>
                  </div>
                )}

                <div style={{
                  filter: isJobLocked ? 'blur(7px)' : 'none',
                  userSelect: isJobLocked ? 'none' : 'auto',
                  pointerEvents: isJobLocked ? 'none' : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}>
                {/* Top Body */}
                <div 
                  className={`two-tone-body two-tone-${themeType}`}
                  style={{
                    background: bgGradient,
                    color: isAmber ? '#0F172A' : '#FFFFFF',
                    padding: '20px 20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    flex: 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isAmber ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                        flexShrink: 0
                      }}>
                        {comp.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ 
                          fontSize: '1.05rem', 
                          fontWeight: 800, 
                          color: isAmber ? '#0F172A' : '#FFFFFF', 
                          lineHeight: 1.2,
                          margin: 0
                        }}>
                          {job.role_title}
                        </h3>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: isAmber ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
                          fontWeight: 600,
                          marginTop: '2px'
                        }}>
                          {comp} • {job.location || 'India'}
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <span style={{
                      background: isAmber ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                      color: isAmber ? '#0F172A' : '#FFFFFF',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {m.match_score ? m.match_score.toFixed(0) : 85}% Match
                    </span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    <span style={{
                      background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                      color: isAmber ? '#0F172A' : '#FFFFFF',
                      borderRadius: '9999px',
                      padding: '3px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {job.company_tier === 'consulting' ? 'Consulting Giant' : 'Global IT MNC'}
                    </span>
                    {isNewToday && (
                      <span style={{
                        background: isAmber ? '#059669' : '#10B981',
                        color: '#FFFFFF',
                        borderRadius: '9999px',
                        padding: '3px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        🔥 New Today
                      </span>
                    )}
                  </div>

                  <p style={{ 
                    fontSize: '0.78rem', 
                    color: isAmber ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)', 
                    lineHeight: 1.45, 
                    margin: '2px 0 0'
                  }}>
                    {job.description ? (job.description.length > 110 ? `${job.description.substring(0, 105)}...` : job.description) : 'Enterprise engineering role working with global clients and enterprise architectures.'}
                  </p>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {(job.required_skills || []).slice(0, 4).map((skill, sIdx) => {
                      const isMatch = (m.matching_skills || []).includes(skill);
                      return (
                        <span 
                          key={sIdx}
                          style={{
                            background: isAmber ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.14)',
                            color: isAmber ? '#0F172A' : '#FFFFFF',
                            borderRadius: '6px',
                            padding: '2px 7px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          {isMatch && <CheckCircle2 size={10} color={isAmber ? '#059669' : '#34d399'} />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Crisp White Footer */}
                <div 
                  className="two-tone-footer"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="post-date" style={{ color: '#64748B', fontSize: '0.76rem', fontWeight: 600 }}>
                    <span>🕒 {job.posted_date || 'Posted recently'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                      href={job.apply_url_resolved || job.apply_url || job.url || `https://www.google.com/search?q=${encodeURIComponent(comp + ' ' + (job.title || '') + ' careers apply')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: '#10B981',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        borderRadius: '9999px',
                        padding: '5px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      Apply <ExternalLink size={11} />
                    </a>

                    <button
                      onClick={() => onTailor && onTailor(m.id)}
                      style={{
                        background: '#7C3AED',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '5px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Sparkles size={11} /> Tailor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

    </div>
  );
}
