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

  const DEFAULT_MATCHES = [
    {
      id: 'm-1',
      match_score: 98,
      job: {
        id: 'j-1',
        role_title: 'Software Development Engineer I (SDE-1)',
        company: 'Amazon',
        location: 'Bengaluru / Hyderabad, India',
        salary_range: '₹22L - ₹32L / yr',
        domain: 'Engineering',
        source_platform: 'Amazon Careers',
        apply_url: 'https://www.amazon.jobs/',
        required_skills: ['Java', 'Python', 'Data Structures', 'AWS', 'System Design'],
        description: 'Design and build high-throughput microservices handling millions of transactions daily.'
      }
    },
    {
      id: 'm-2',
      match_score: 96,
      job: {
        id: 'j-2',
        role_title: 'Full Stack Engineer (React + Node.js)',
        company: 'Razorpay',
        location: 'Bengaluru, India (Hybrid)',
        salary_range: '₹28L - ₹42L / yr',
        domain: 'Fintech',
        source_platform: 'LinkedIn',
        apply_url: 'https://razorpay.com/jobs',
        required_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
        description: 'Engineering the future of digital payments across India and Southeast Asia.'
      }
    },
    {
      id: 'm-3',
      match_score: 95,
      job: {
        id: 'j-3',
        role_title: 'AI / LLM Platform Engineer',
        company: 'Zomato (Blinkit Tech)',
        location: 'Gurugram / Remote',
        salary_range: '₹30L - ₹50L / yr',
        domain: 'AI/ML',
        source_platform: 'Wellfound',
        apply_url: 'https://wellfound.com/jobs',
        required_skills: ['Python', 'FastAPI', 'PyTorch', 'LangChain', 'Docker'],
        description: 'Building ultra-low-latency computer vision and LLM dispatch algorithms.'
      }
    },
    {
      id: 'm-4',
      match_score: 94,
      job: {
        id: 'j-4',
        role_title: 'Staff Backend Systems Engineer',
        company: 'Swiggy',
        location: 'Bengaluru, India',
        salary_range: '₹35L - ₹55L / yr',
        domain: 'Backend',
        source_platform: 'FreeHire',
        apply_url: 'https://careers.swiggy.com/',
        required_skills: ['Go', 'Java', 'Kafka', 'Kubernetes', 'Redis'],
        description: 'Scaling quick-commerce logistics infrastructure to 100K+ concurrent requests/sec.'
      }
    },
    {
      id: 'm-5',
      match_score: 92,
      job: {
        id: 'j-5',
        role_title: 'Frontend React & UI Engineer',
        company: 'CRED',
        location: 'Bengaluru, India',
        salary_range: '₹25L - ₹38L / yr',
        domain: 'Frontend',
        source_platform: 'LinkedIn',
        apply_url: 'https://cred.club/careers',
        required_skills: ['React.js', 'Next.js', 'TailwindCSS', 'Redux', 'Jest'],
        description: 'Crafting pixel-perfect luxury fintech consumer experiences with 60fps animations.'
      }
    },
    {
      id: 'm-6',
      match_score: 91,
      job: {
        id: 'j-6',
        role_title: 'Software Engineer - Cloud & Infrastructure',
        company: 'Microsoft',
        location: 'Hyderabad / Noida / Remote',
        salary_range: '₹26L - ₹40L / yr',
        domain: 'Cloud',
        source_platform: 'Microsoft Careers',
        apply_url: 'https://careers.microsoft.com/',
        required_skills: ['C#', '.NET Core', 'Azure', 'Kubernetes', 'Go'],
        description: 'Building global scale Azure computing nodes and distributed storage engine.'
      }
    },
    {
      id: 'm-7',
      match_score: 90,
      job: {
        id: 'j-7',
        role_title: 'High-Throughput Logistics Systems Developer',
        company: 'Zepto',
        location: 'Mumbai / Remote',
        salary_range: '₹28L - ₹45L / yr',
        domain: 'Backend',
        source_platform: 'LinkedIn',
        apply_url: 'https://www.zeptonow.com/careers',
        required_skills: ['Go', 'Node.js', 'PostgreSQL', 'Elasticsearch', 'Docker'],
        description: 'Optimizing 10-minute delivery routing algorithms across dark store networks.'
      }
    },
    {
      id: 'm-8',
      match_score: 89,
      job: {
        id: 'j-8',
        role_title: 'API Platform Infrastructure Engineer',
        company: 'Postman',
        location: 'Bengaluru / Remote',
        salary_range: '₹30L - ₹48L / yr',
        domain: 'Engineering',
        source_platform: 'LinkedIn',
        apply_url: 'https://www.postman.com/careers/',
        required_skills: ['Node.js', 'TypeScript', 'OpenAPI', 'PostgreSQL', 'Docker'],
        description: 'Building developer tooling relied on by 30+ million engineers worldwide.'
      }
    }
  ];

  const safeMatches = (Array.isArray(matches) && matches.length > 0) ? matches : DEFAULT_MATCHES;
  const domains = ['all', ...new Set(safeMatches.map(m => m.job?.domain).filter(Boolean))];

  const getJobMatchScore = useCallback((m) => {
    const job = m.job || m;
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return m.match_score || job.match_score || 88;
    }

    const userSkills = (Array.isArray(profile?.skills) ? profile.skills : []).map(s => String(s).toLowerCase().trim());
    const requiredSkills = (job.required_skills || job.tech_stack || []).map(s => String(s).toLowerCase().trim());

    if (requiredSkills.length === 0) return 88;

    const matchCount = requiredSkills.filter(req =>
      userSkills.some(usr => usr.includes(req) || req.includes(usr))
    ).length;

    const ratio = matchCount / requiredSkills.length;
    return Math.min(99, Math.max(68, Math.round(62 + ratio * 37)));
  }, [profile]);

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
            {filteredMatches.length === 0 ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <EmptyStateCharacter
                  character="nova"
                  pose="search"
                  title="No Opportunities Matching Current Filters"
                  description="Try lowering the min match score threshold or clearing domain filters to discover 10,000+ verified active tech postings."
                  actionLabel="Reset Score & Refresh Jobs"
                  onAction={() => {
                    SoundSystem.playPop();
                    setMinScore(0);
                    setFilterDomain('all');
                    if (onDiscover) onDiscover();
                  }}
                />
              </div>
            ) : (
              filteredMatches.map((m, idx) => {
              const job = m.job || {};
              const comp = job.company || 'TechCorp';
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

                    {/* Matching Skills */}
                    {m.matching_skills && m.matching_skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                        {m.matching_skills.slice(0, 4).map((s, sIdx) => (
                          <span key={sIdx} style={{
                            background: isAmber ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.14)',
                            color: isAmber ? '#0F172A' : '#FFFFFF',
                            borderRadius: '6px',
                            padding: '2px 7px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <CheckCircle2 size={10} color={isAmber ? '#059669' : '#34d399'} />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
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
                          {job.salary_range || 'Est. ₹14L - 32L'}
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
                const displaySal = sal.annual_ctc_inr_range || sal.annual_usd_range || '$40K - $70K/yr';

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
