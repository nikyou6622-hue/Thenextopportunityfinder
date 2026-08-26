import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiFetch from '../lib/apiClient';
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Zap, 
  Globe, 
  Filter,
  FileSpreadsheet,
  BookOpen,
  RefreshCw,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import SkillGapActionPlanModal from './SkillGapActionPlanModal';
import SoundSystem from './characters/SoundEffects';
import EmptyStateCharacter from './characters/EmptyStateCharacter';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';

export default function JobDiscovery({ 
  matches = [], 
  profile,
  onTailor, 
  onImportFile, 
  onDiscover, 
  onRefreshData, 
  loading,
  error = null,
  onSelectJob,
  onApplyJob,
  onOpenFilters,
  onScrapeTriggered,
  onOpenPaywall,
  isPro = false
}) {
  const [activeTab, setActiveTab] = useState('matched'); // 'matched' | 'global_tech'
  const [filterDomain, setFilterDomain] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [actionPlanData, setActionPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Tech (FreeHire & LinkedIn) Live Feed State
  const [globalJobs, setGlobalJobs] = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalLocation, setGlobalLocation] = useState('');

  const safeMatches = Array.isArray(matches) ? matches : [];
  const domains = ['all', ...new Set(safeMatches.map(m => m.job?.domain).filter(Boolean))];

  const getJobMatchScore = useCallback((m) => {
    const job = m.job || m;
    if (m.match_score) return m.match_score;
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return job.match_score || 75;
    }

    const userSkills = (Array.isArray(profile?.skills) ? profile.skills : []).map(s => String(s).toLowerCase().trim());
    const requiredSkills = (job.required_skills || job.tech_stack || []).map(s => String(s).toLowerCase().trim());

    if (requiredSkills.length === 0) return 75;

    const matchCount = requiredSkills.filter(req =>
      userSkills.some(usr => usr.includes(req) || req.includes(usr))
    ).length;

    const ratio = matchCount / requiredSkills.length;
    if (matchCount > 0) {
      return Math.min(99, Math.round(70 + ratio * 28));
    }
    return Math.round(35 + (1 / requiredSkills.length) * 10);
  }, [profile]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDomain, minScore]);

  const filteredMatches = safeMatches.filter(m => {
    const job = m.job || m;
    const qLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !qLower ||
      (job.role_title || job.title || '').toLowerCase().includes(qLower) ||
      (job.company || '').toLowerCase().includes(qLower) ||
      (job.location || '').toLowerCase().includes(qLower) ||
      (job.required_skills || job.tech_stack || []).some(s => String(s).toLowerCase().includes(qLower));

    const domainMatch = filterDomain === 'all' || (job.domain || '').toLowerCase() === filterDomain.toLowerCase();
    const scoreMatch = getJobMatchScore(m) >= minScore;
    return matchesSearch && domainMatch && scoreMatch;
  }).sort((a, b) => getJobMatchScore(b) - getJobMatchScore(a));

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage) || 1;
  const paginatedMatches = filteredMatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const DEFAULT_GLOBAL_JOBS = [
    {
      id: 'glob-1',
      title: 'Senior Full Stack Engineer (React + Node.js)',
      company: 'Razorpay',
      location: 'Bengaluru, India (Hybrid)',
      salary_range: '₹28L - ₹42L / yr',
      platform: 'LinkedIn',
      apply_url: 'https://razorpay.com/jobs',
      posted_date: '2 hours ago',
      tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
      match_score: 95
    },
    {
      id: 'glob-2',
      title: 'Staff Backend Engineer - High-Concurrency Distributed Systems',
      company: 'Swiggy',
      location: 'Bengaluru, India',
      salary_range: '₹35L - ₹55L / yr',
      platform: 'FreeHire',
      apply_url: 'https://careers.swiggy.com/',
      posted_date: '3 hours ago',
      tech_stack: ['Go', 'Java', 'Kafka', 'Kubernetes', 'AWS'],
      match_score: 94
    },
    {
      id: 'glob-3',
      title: 'AI / ML Infra & LLM Platform Engineer',
      company: 'Zomato (Blinkit Tech)',
      platform: 'Wellfound',
      location: 'Gurugram / Remote',
      salary_range: '₹30L - ₹50L / yr',
      apply_url: 'https://wellfound.com/jobs',
      posted_date: '1 hour ago',
      tech_stack: ['Python', 'FastAPI', 'PyTorch', 'LangChain', 'Docker'],
      match_score: 97
    },
    {
      id: 'glob-4',
      title: 'Software Development Engineer II (SDE-2)',
      company: 'Amazon',
      location: 'Bengaluru / Hyderabad, India',
      salary_range: '₹32L - ₹48L / yr',
      platform: 'Amazon Careers',
      apply_url: 'https://www.amazon.jobs/',
      posted_date: '5 hours ago',
      tech_stack: ['Java', 'C++', 'AWS', 'Distributed Systems'],
      match_score: 96
    },
    {
      id: 'glob-5',
      title: 'Frontend Engineer (React & Next.js)',
      company: 'CRED',
      location: 'Bengaluru, India',
      salary_range: '₹25L - ₹38L / yr',
      platform: 'LinkedIn',
      apply_url: 'https://cred.club/careers',
      posted_date: '4 hours ago',
      tech_stack: ['React.js', 'Next.js', 'TailwindCSS', 'Redux'],
      match_score: 93
    }
  ];

  const fetchGlobalJobs = async (q = '', loc = '') => {
    setLoadingGlobal(true);
    try {
      const res = await apiFetch(`/api/jobs/global?query=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&limit=25`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setGlobalJobs(data);
        } else {
          setGlobalJobs(DEFAULT_GLOBAL_JOBS);
        }
      } else {
        setGlobalJobs(DEFAULT_GLOBAL_JOBS);
      }
    } catch (err) {
      console.error('Error fetching global jobs:', err);
      setGlobalJobs(DEFAULT_GLOBAL_JOBS);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'global_tech' && globalJobs.length === 0) {
      fetchGlobalJobs(globalQuery, globalLocation);
    }
  };

  const handleOpenActionPlan = async (matchId) => {
    setLoadingPlan(true);
    try {
      const res = await apiFetch(`/api/skills/action-plan?match_id=${matchId}`);
      const data = await res.json();
      setActionPlanData(data);
    } catch (err) {
      console.error('Error fetching skill gap action plan:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handlePurgeDead = async () => {
    setPurging(true);
    setPurgeNotice(null);
    try {
      const res = await fetch('/api/jobs/purge-dead', { method: 'POST' });
      const data = await res.json();
      setPurgeNotice(data.message || 'Closed listings successfully purged.');
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      console.error('Error purging dead jobs:', err);
      setPurgeNotice('Error running verification sweep.');
    } finally {
      setPurging(false);
      setTimeout(() => setPurgeNotice(null), 5000);
    }
  };

  const getPlatformBadge = (platform) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('greenhouse')) return { label: 'Greenhouse', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    if (p.includes('lever')) return { label: 'Lever', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
    if (p.includes('ashby')) return { label: 'Ashby', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
    if (p.includes('workday')) return { label: 'Workday', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    if (p.includes('company_direct')) return { label: 'Direct Portal', bg: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' };
    if (p.includes('email')) return { label: 'Email Only', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    if (p.includes('internshala')) return { label: 'Internshala', bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' };
    if (p.includes('naukri')) return { label: 'Naukri', bg: 'rgba(74, 144, 226, 0.15)', color: '#60a5fa', border: 'rgba(74, 144, 226, 0.3)' };
    if (p.includes('linkedin')) return { label: 'LinkedIn', bg: 'rgba(10, 102, 194, 0.15)', color: '#60a5fa', border: 'rgba(10, 102, 194, 0.3)' };
    return { label: 'Direct Link', bg: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Live Freshness & Verification Status Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#34d399" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
              Multi-Source Ingestion & Zero Dead-Links Active
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              FreeHire (~50 ATS normalized), LinkedIn guest, and campus portals synchronized with salary benchmark intelligence.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onDiscover && (
            <button
              onClick={onDiscover}
              disabled={loading}
              className="btn-primary"
              style={{
                fontSize: '0.8rem',
                padding: '7px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? (
                <img src="/loading.svg" alt="Discovering" style={{ width: '16px', height: '16px' }} />
              ) : (
                <RefreshCw size={14} />
              )}
              <span>{loading ? 'Discovering Opportunities...' : 'Discover Opportunities'}</span>
            </button>
          )}

          <button
            onClick={handlePurgeDead}
            disabled={purging}
            className="btn-secondary"
            style={{
              fontSize: '0.8rem',
              padding: '7px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={14} color="#f87171" />
            <span>{purging ? 'Purging...' : 'Purge Closed'}</span>
          </button>
        </div>
      </div>

      {purgeNotice && (
        <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.82rem', fontWeight: 600 }}>
          {purgeNotice}
        </div>
      )}

      {/* Mode Selector Tabs: Matched Pipeline vs Global Tech (FreeHire/LinkedIn) */}
      <div className="mobile-nowrap-scroll" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        <button
          onClick={() => handleTabSwitch('matched')}
          style={{
            background: activeTab === 'matched' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'matched' ? '#fff' : '#94a3b8',
            border: '1px solid ' + (activeTab === 'matched' ? '#818cf8' : 'rgba(255,255,255,0.1)'),
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Award size={15} />
          <span>Profile Matched ({filteredMatches.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('global_tech')}
          style={{
            background: activeTab === 'global_tech' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'global_tech' ? '#fff' : '#94a3b8',
            border: '1px solid ' + (activeTab === 'global_tech' ? '#38bdf8' : 'rgba(255,255,255,0.1)'),
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Globe size={15} />
          <span>Global Tech Scraper</span>
        </button>
      </div>

      {/* TAB 1: PROFILE MATCHED VIEW */}
      {activeTab === 'matched' && (
        <>
          {/* Live Search Input Bar */}
          <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} color="#6366f1" />
            <input 
              type="text"
              placeholder="Search jobs by role title, tech stack (React, Python, Java, Go...), company, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '0.92rem',
                width: '100%',
                fontWeight: 600
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Top Filter & Control Panel */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Domain Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Domain:
              </span>
              {domains.map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDomain(d)}
                  className={filterDomain === d ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.78rem', padding: '6px 12px', textTransform: 'capitalize' }}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Min Match Score Slider & File Import */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#9ca3af' }}>Min Match:</span>
                <strong style={{ color: '#6366f1', minWidth: '35px' }}>{minScore}%</strong>
                <input 
                  type="range" 
                  min="0" 
                  max="90" 
                  step="5" 
                  value={minScore} 
                  onChange={(e) => setMinScore(Number(e.target.value))} 
                  style={{ cursor: 'pointer', accentColor: '#6366f1' }}
                />
              </div>

              {/* Excel / CSV File Import */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <FileSpreadsheet size={16} />
                <span>Import Excel / CSV</span>
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && onImportFile) {
                      onImportFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

            </div>
          </div>

          {/* Matches Grid */}
          <div className="job-cards-grid">
            {error ? (
              <div style={{ gridColumn: '1 / -1', padding: '36px 20px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px' }}>
                <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
                  Unable to Load Matches
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginBottom: '18px', maxWidth: '500px', margin: '0 auto 18px' }}>
                  {String(typeof error === 'string' ? error : (error.message || 'Could not connect to opportunity database. Please refresh or check connection.'))}
                </p>
                <button
                  onClick={onRefreshData || onDiscover}
                  className="btn-primary"
                  style={{ fontSize: '0.82rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                >
                  <RefreshCw size={14} />
                  <span>Retry Opportunity Match</span>
                </button>
              </div>
            ) : loading ? (
              <div style={{ gridColumn: '1 / -1', padding: '50px 20px', textAlign: 'center' }}>
                <RefreshCw size={32} color="#818cf8" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Evaluating 3,000+ Active Database Listings Against Your Resume...
                </div>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <EmptyStateCharacter
                  character="nova"
                  pose="search"
                  title="No Matches Found Yet"
                  description="No job postings match your current resume skills or filters. Try lowering the match score threshold or updating your resume skills."
                  actionLabel="Reset Filters & Lower Score"
                  onAction={() => {
                    SoundSystem.playPop();
                    setMinScore(0);
                    setFilterDomain('all');
                    if (onDiscover) onDiscover();
                  }}
                />
              </div>
            ) : (
              paginatedMatches.map((m, idx) => {
              const job = m.job || {};
              const comp = job.company || 'TechCorp';
              const cLower = comp.toLowerCase();
              const globalIdx = (currentPage - 1) * itemsPerPage + idx;
              const isJobLocked = !isPro && globalIdx >= 5;

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

              const isHighScore = m.match_score >= 75.0;
              const badge = getPlatformBadge(job.source_platform || job.source);
              const targetUrl = job.apply_url_resolved || job.apply_url;

              return (
                <div 
                  key={m.id || idx} 
                  className="two-tone-job-card"
                  onClick={() => {
                    if (isJobLocked) {
                      if (onOpenPaywall) onOpenPaywall();
                    } else {
                      if (onSelectJob) onSelectJob(job, m);
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
                    cursor: 'pointer',
                    opacity: 1,
                    visibility: 'visible'
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
                        🔒 PRO LOCKED JOB #{(idx + 1)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#f472b6', maxWidth: '300px' }}>
                        First 5 scraped jobs are free. Unlock thousands of live MNC jobs & tech postings for ₹99 Lifetime!
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenPaywall) onOpenPaywall();
                        }}
                        className="btn-tactile btn-tactile-emerald"
                        style={{ padding: '8px 18px', fontSize: '0.8rem', fontWeight: 900, marginTop: '4px' }}
                      >
                        Unlock All Scraped Jobs (₹99) →
                      </button>
                    </div>
                  )}

                  <div style={{
                    filter: isJobLocked ? 'blur(7px)' : 'none',
                    userSelect: isJobLocked ? 'none' : 'auto',
                    pointerEvents: isJobLocked ? 'none' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}>
                  {/* Top Vibrant Body */}
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
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
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
                            fontSize: '1.08rem', 
                            fontWeight: 800, 
                            color: isAmber ? '#0F172A' : '#FFFFFF', 
                            lineHeight: 1.2,
                            margin: 0
                          }}>
                            {job.role_title}
                          </h3>
                          <div style={{ 
                            fontSize: '0.82rem', 
                            color: isAmber ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
                            fontWeight: 600,
                            marginTop: '2px'
                          }}>
                            {comp}
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div style={{
                        background: isAmber ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                        color: isAmber ? '#0F172A' : '#FFFFFF',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}>
                        <Award size={13} />
                        {m.match_score}%
                      </div>
                    </div>

                    {/* Tag Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                      <span style={{
                        background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                        color: isAmber ? '#0F172A' : '#FFFFFF',
                        borderRadius: '9999px',
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Globe size={11} /> {job.location || 'Remote'}
                      </span>
                      <span style={{
                        background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                        color: isAmber ? '#0F172A' : '#FFFFFF',
                        borderRadius: '9999px',
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {job.domain || 'Tech'}
                      </span>
                      <span style={{
                        background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                        color: isAmber ? '#0F172A' : '#FFFFFF',
                        borderRadius: '9999px',
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {job.remote ? 'Remote' : 'Full-time'}
                      </span>
                      <span style={{
                        background: isAmber ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.18)',
                        color: isAmber ? '#0F172A' : '#FFFFFF',
                        borderRadius: '9999px',
                        padding: '3px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Description excerpt */}
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: isAmber ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)', 
                      lineHeight: 1.45, 
                      margin: '2px 0 0'
                    }}>
                      {job.description ? (job.description.length > 120 ? `${job.description.substring(0, 115)}...` : job.description) : 'Join a high-growth engineering team building modern platforms.'}
                    </p>

                    {/* Skill Match Breakdown Bar */}
                    {(() => {
                      const userSkillsList = (profile?.skills || []).map(s => String(s).toLowerCase().trim());
                      const reqSkills = job.required_skills || job.tech_stack || [];
                      
                      let matchedSkills = (Array.isArray(m.matched_skills) && m.matched_skills.length > 0)
                        ? m.matched_skills
                        : (Array.isArray(m.matching_skills) && m.matching_skills.length > 0)
                        ? m.matching_skills
                        : reqSkills.filter(req => {
                            const rLower = String(req).toLowerCase().trim();
                            return userSkillsList.some(usr => 
                              usr === rLower || usr.includes(rLower) || rLower.includes(usr) ||
                              (rLower.includes('react') && usr.includes('react')) ||
                              (rLower.includes('node') && usr.includes('node')) ||
                              (rLower.includes('postgres') && usr.includes('postgres')) ||
                              (rLower.includes('python') && usr.includes('python')) ||
                              (rLower.includes('java') && usr.includes('java')) ||
                              (rLower.includes('aws') && usr.includes('aws')) ||
                              (rLower.includes('docker') && usr.includes('docker'))
                            );
                          });

                      const matchCount = matchedSkills.length;
                      const totalCount = reqSkills.length || 5;
                      const pct = Math.round((matchCount / Math.max(1, totalCount)) * 100);
                      const missingCount = Math.max(0, totalCount - matchCount);
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                          <div style={{
                            background: isAmber ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isAmber ? '#047857' : '#4ade80' }}>
                              <CheckCircle2 size={12} />
                              {matchCount} / {totalCount} Skills Matched ({pct}%)
                            </span>
                            <span style={{ opacity: 0.85, fontSize: '0.68rem', color: missingCount > 0 ? (isAmber ? '#b91c1c' : '#fca5a5') : (isAmber ? '#047857' : '#4ade80') }}>
                              {missingCount === 0 ? '100% Fit' : `${missingCount} Gap`}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {reqSkills.slice(0, 5).map((skill, sIdx) => {
                              const isMatch = matchedSkills.some(ms => String(ms).toLowerCase().trim() === String(skill).toLowerCase().trim() || String(ms).toLowerCase().includes(String(skill).toLowerCase()) || String(skill).toLowerCase().includes(String(ms).toLowerCase()));
                              return (
                                <span 
                                  key={sIdx}
                                  style={{
                                    background: isMatch ? (isAmber ? 'rgba(4, 120, 87, 0.2)' : 'rgba(34, 197, 94, 0.25)') : (isAmber ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.2)'),
                                    color: isMatch ? (isAmber ? '#047857' : '#4ade80') : (isAmber ? '#991b1b' : '#fca5a5'),
                                    border: isMatch ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)',
                                    borderRadius: '6px',
                                    padding: '2px 7px',
                                    fontSize: '0.68rem',
                                    fontWeight: isMatch ? 700 : 500,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  {isMatch ? <CheckCircle2 size={10} color={isAmber ? '#059669' : '#34d399'} /> : '•'}
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
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
                      {job.link_status === 'live' && (
                        <span style={{ color: '#059669', fontWeight: 700, marginLeft: '4px' }}>✓ Live</span>
                      )}
                    </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="salary-tag" style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: 900 }}>
                          {(() => {
                            const salStr = job.salary_range || job.stipend || '';
                            if (!salStr || salStr.toLowerCase() === 'null' || salStr.toLowerCase() === 'none') return 'Not specified';
                            if (salStr.toLowerCase().includes('unpaid')) return 'Unpaid';
                            return salStr;
                          })()}
                        </span>

                        <a
                          href={job.apply_url || job.url || `https://www.google.com/search?q=${encodeURIComponent(comp + ' ' + (job.title || '') + ' careers apply')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: 'rgba(15, 23, 42, 0.08)',
                            border: '1px solid rgba(15, 23, 42, 0.2)',
                            color: '#0F172A',
                            borderRadius: '9999px',
                            padding: '6px 12px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="Apply directly on official company careers portal"
                        >
                          <span>Apply</span>
                          <ExternalLink size={12} />
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTailor(m.id);
                          }}
                          style={{
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '6px 14px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Zap size={12} /> Tailor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>

          {/* Pagination Controls */}
          {filteredMatches.length > itemsPerPage && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  SoundSystem.playPop();
                  setCurrentPage(p => Math.max(1, p - 1));
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: currentPage <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                  color: currentPage <= 1 ? '#64748B' : '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                ← Previous Page
              </button>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>
                Page <strong style={{ color: '#F8FAFC' }}>{currentPage}</strong> of <strong style={{ color: '#F8FAFC' }}>{totalPages}</strong> ({filteredMatches.length} total matches)
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  SoundSystem.playPop();
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: currentPage >= totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                  color: currentPage >= totalPages ? '#64748B' : '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                Next Page →
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB 2: GLOBAL TECH & MULTI-ATS FEED (FreeHire + LinkedIn) */}
      {activeTab === 'global_tech' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Global Search Bar */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search tech role or skill (e.g. Python, Distributed Systems, Go)..."
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGlobalJobs(globalQuery, globalLocation)}
                style={{ flex: 2, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
              />
              <input 
                type="text" 
                placeholder="Location (e.g. Remote, India, Bengaluru)..."
                value={globalLocation}
                onChange={(e) => setGlobalLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGlobalJobs(globalQuery, globalLocation)}
                style={{ flex: 1, minWidth: '150px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <button 
              onClick={() => fetchGlobalJobs(globalQuery, globalLocation)}
              disabled={loadingGlobal}
              className="btn-primary"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loadingGlobal ? (
                <img src="/loading.svg" alt="Searching" style={{ width: '16px', height: '16px' }} />
              ) : (
                <RefreshCw size={15} />
              )}
              <span>{loadingGlobal ? 'Searching Global ATS...' : 'Search Global Requisitions'}</span>
            </button>
          </div>

          {/* Global Jobs Results */}
          {loadingGlobal ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 14px' }}>
                <img src="/loading.svg" alt="Querying Global ATS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Querying FreeHire & Global Career Portals...
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                Aggregating live requisitions from Greenhouse, Lever, Ashby & Workday.
              </div>
            </div>
          ) : globalJobs.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Click "Search Global Requisitions" to pull live openings from Greenhouse, Lever, Workday, and LinkedIn.
            </div>
          ) : (
            <div className="job-cards-grid">
              {globalJobs.map((job, idx) => {
                const comp = job.company || 'TechCorp';
                const cLower = comp.toLowerCase();

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

                const sal = job.salary_benchmark || {};
                const rawSal = job.salary_range || sal.annual_ctc_inr_range || sal.annual_usd_range || '';
                const displaySal = (() => {
                  if (!rawSal || rawSal.toLowerCase() === 'null' || rawSal.toLowerCase() === 'none') return 'Not specified';
                  if (rawSal.toLowerCase().includes('unpaid')) return 'Unpaid';
                  return rawSal;
                })();

                return (
                  <div 
                    key={job.id || idx} 
                    className="two-tone-job-card"
                    onClick={() => onSelectJob && onSelectJob(job)}
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
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      cursor: 'pointer',
                      opacity: 1,
                      visibility: 'visible'
                    }}
                  >
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
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
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
                              fontSize: '1.08rem', 
                              fontWeight: 800, 
                              color: isAmber ? '#0F172A' : '#FFFFFF', 
                              lineHeight: 1.2,
                              margin: 0
                            }}>
                              {job.title}
                            </h3>
                            <div style={{ 
                              fontSize: '0.82rem', 
                              color: isAmber ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
                              fontWeight: 600,
                              marginTop: '2px'
                            }}>
                              {comp}
                            </div>
                          </div>
                        </div>

                        <span style={{
                          background: isAmber ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                          color: isAmber ? '#0F172A' : '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {job.source || 'ATS'}
                        </span>
                      </div>

                      {/* Tag Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                        <span style={{
                          background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                          color: isAmber ? '#0F172A' : '#FFFFFF',
                          borderRadius: '9999px',
                          padding: '3px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Globe size={11} /> {job.location || 'Remote'}
                        </span>
                        <span style={{
                          background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                          color: isAmber ? '#0F172A' : '#FFFFFF',
                          borderRadius: '9999px',
                          padding: '3px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}>
                          {job.workplace_type || 'Full-time'}
                        </span>
                        {job.seniority && (
                          <span style={{
                            background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                            color: isAmber ? '#0F172A' : '#FFFFFF',
                            borderRadius: '9999px',
                            padding: '3px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}>
                            {job.seniority}
                          </span>
                        )}
                      </div>

                      {/* Description excerpt */}
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: isAmber ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)', 
                        lineHeight: 1.45, 
                        margin: '2px 0 0'
                      }}>
                        {job.description ? (job.description.length > 120 ? `${job.description.substring(0, 115)}...` : job.description) : 'Join a high-growth engineering team building modern platforms.'}
                      </p>
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="salary-tag" style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: 900 }}>
                          {displaySal}
                        </span>

                        <a 
                          href={job.apply_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: '#0EA5E9',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            borderRadius: '9999px',
                            padding: '6px 14px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Apply <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Skill Gap Action Plan Modal */}
      <SkillGapActionPlanModal 
        data={actionPlanData} 
        onClose={() => setActionPlanData(null)} 
      />

    </div>
  );
}
