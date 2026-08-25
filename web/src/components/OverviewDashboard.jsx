import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar,
  Briefcase, 
  User, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Rocket, 
  Bookmark, 
  Bell, 
  Sparkles, 
  Zap, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Link2, 
  RefreshCw, 
  ExternalLink, 
  BrainCircuit, 
  SlidersHorizontal, 
  Search, 
  MapPin, 
  Clock,
  Flame,
  Star
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import NotificationCenter from './NotificationCenter';
import OutcomeDiagnosisCard from './OutcomeDiagnosisCard';
import OnboardingHeroBanner from './OnboardingHeroBanner';
import UploadResumeBanner from './UploadResumeBanner';
import UserAvatar from './UserAvatar';
import SoundSystem from './characters/SoundEffects';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './characters/CharacterUniverse';

export default function OverviewDashboard({ 
  metrics, 
  matches = [], 
  applications = [], 
  profile, 
  onNavigate,
  onSelectJob,
  onOpenFilters,
  onQuickSearch,
  onApplyJob,
  onToggleSave,
  savedJobs = [],
  onOpenCompany,
  onTriggerCelebration,
  onUploadResume,
  onSeedDemo
}) {
  const [toggleSent, setToggleSent] = useState(true);
  const [toggleInterviews, setToggleInterviews] = useState(true);
  const [toggleShortlisted, setToggleShortlisted] = useState(false);
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [showRecentAll, setShowRecentAll] = useState(false);
  const [linkHealth, setLinkHealth] = useState(null);
  const [revalidating, setRevalidating] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLinkHealth = async () => {
    try {
      const res = await fetch('/api/jobs/link-health');
      if (res.ok) {
        const data = await res.json();
        setLinkHealth(data);
      }
    } catch (e) {
      console.error('Error fetching link health:', e);
    }
  };

  useEffect(() => {
    fetchLinkHealth();
  }, []);

  const handleRevalidateLinks = async () => {
    setRevalidating(true);
    try {
      const res = await fetch('/api/jobs/revalidate-links?max_age_hours=24&limit=100', { method: 'POST' });
      if (res.ok) {
        await fetchLinkHealth();
      }
    } catch (e) {
      console.error('Error revalidating links:', e);
    } finally {
      setRevalidating(false);
    }
  };

  // Exact real-time ATS Score Calculation from profile
  const atsScore = useMemo(() => {
    if (!profile) return 0;
    if (typeof profile.ats_score === 'number' && profile.ats_score > 0) {
      return profile.ats_score;
    }
    const skills = Array.isArray(profile.skills) ? profile.skills : (profile.key_strengths || []);
    const summary = profile.summary || '';
    const expList = profile.experience_list?.length > 0 
      ? profile.experience_list 
      : (profile.past_roles?.length > 0 ? profile.past_roles : []);

    let textForAnalysis = `${summary}`.toLowerCase();
    expList.forEach(exp => {
      textForAnalysis += ` ${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`.toLowerCase();
    });

    const numSkills = skills.length;
    let skillsScore = 5;
    if (numSkills >= 8) skillsScore = 35;
    else if (numSkills >= 5) skillsScore = 28;
    else if (numSkills >= 3) skillsScore = 20;
    else if (numSkills >= 1) skillsScore = 12;

    const metricsMatches = textForAnalysis.match(/\b\d+(?:[\.,]\d+)?%?|\$\d+|\b\d+\+\b/g) || [];
    const metricsCount = metricsMatches.length;
    const ACTION_VERBS = ["built", "led", "engineered", "scaled", "spearheaded", "developed", "optimized", "architected", "implemented", "deployed", "designed", "created", "reduced", "increased", "transformed", "streamlined", "launched", "automated"];
    const foundVerbs = ACTION_VERBS.filter(v => textForAnalysis.includes(v));
    const verbCount = foundVerbs.length;

    const metricsScore = Math.min(15, metricsCount * 3);
    const verbScore = Math.min(10, verbCount * 2.5);
    const metricsAndVerbsScore = Math.round(metricsScore + verbScore);

    let contactScore = 0;
    if (profile.name && profile.name.trim().length > 0) contactScore += 4;
    if (profile.email && profile.email.includes('@')) contactScore += 4;
    if (profile.phone && profile.phone.trim().length > 4) contactScore += 3;
    if (profile.location?.city || profile.location?.country) contactScore += 4;

    let structureScore = 0;
    if (summary.trim().length >= 25) structureScore += 4;
    if (expList.length >= 1) structureScore += 5;
    if ((profile.education_list || profile.education || []).length >= 1) structureScore += 3;
    if ((profile.domains || []).length >= 1) structureScore += 3;

    const keywordScore = Math.min(10, Math.round((numSkills * 1.1) + ((profile.domains || []).length * 2.0)));
    const rawTotal = skillsScore + metricsAndVerbsScore + contactScore + structureScore + keywordScore;
    return Math.min(98, Math.max(30, Math.round(rawTotal)));
  }, [profile]);

  // Derived real pipeline metrics
  const activeAppsCount = applications.filter(a => a.status !== 'rejected').length;
  const sentAppsCount = applications.filter(a => a.status === 'applied' || a.status === 'interviewing' || a.status === 'offered').length;
  const interviewCount = applications.filter(a => a.status === 'interviewing' || a.status === 'offered').length;
  const matchCount = matches.length;
  const avgMatchScore = matches.length > 0 
    ? Math.round(matches.reduce((acc, m) => acc + (m.match_score || 0), 0) / matches.length) 
    : (profile ? 78 : 0);

  const candidateName = profile?.name || "Aditya Tamta";
  const candidateEmail = profile?.email || "aditya.tamta@dev.io";
  const candidateRole = profile?.past_roles?.[0]?.title || profile?.experience_list?.[0]?.title || "Full Stack Engineer";

  // Spline Wave Chart Data exactly matching the X-Axis in the image
  const chartData = [
    { name: '0', sent: 30, interviews: 40, shortlisted: 20 },
    { name: 'May 01', sent: 70, interviews: 45, shortlisted: 30 },
    { name: 'May 05', sent: 88, interviews: 58, shortlisted: 38 },
    { name: 'May 10', sent: 75, interviews: 50, shortlisted: 32 },
    { name: 'May 15', sent: 48, interviews: 45, shortlisted: 28 },
    { name: 'May 20', sent: 62, interviews: 56, shortlisted: 36 },
    { name: 'May 25', sent: 78, interviews: 48, shortlisted: 34 },
    { name: 'May 30', sent: 65, interviews: 62, shortlisted: 42 },
    { name: 'June 05', sent: 48, interviews: 52, shortlisted: 38 },
    { name: 'June 10', sent: 68, interviews: 32, shortlisted: 26 },
    { name: 'June 15', sent: 50, interviews: 22, shortlisted: 18 },
  ];

  // Dynamic Recommended Jobs from real matches (fallback to curated opportunities)
  const displayRecommendedJobs = useMemo(() => {
    if (matches && matches.length > 0) {
      return matches.slice(0, 4).map((m, idx) => {
        const j = m.job || {};
        const applyUrl = j.apply_url_resolved || j.apply_url || 'https://careers.google.com/jobs/results/?location=India';
        return {
          id: m.id || `match-${idx}`,
          title: j.role_title || 'Full Stack Engineer',
          company: j.company || 'Tech Innovator',
          apply_url: applyUrl,
          salary: (() => {
            const s = j.salary_range || j.stipend || '';
            if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'none') return 'Not specified';
            if (s.toLowerCase().includes('unpaid')) return 'Unpaid';
            return s;
          })(),
          description: (j.description && j.description.length > 120) 
            ? `${j.description.substring(0, 115)}...` 
            : (j.description || 'Join a high-growth team building cutting-edge web and cloud platforms.'),
          type: j.role_type || (j.remote ? 'Remote' : 'Full Time'),
          location: j.location || 'Bengaluru, India',
          match_score: Math.round(m.match_score || 85),
          source_platform: j.source_platform || j.source || 'company_direct',
          logoBg: idx % 2 === 0 ? '#1f2a24' : '#151c2e',
          logoColor: idx % 2 === 0 ? '#00e676' : '#818cf8',
          iconType: idx % 2 === 0 ? 'circle' : 'c'
        };
      });
    }
    return [
      {
        id: 'job-1',
        title: 'React Developer',
        company: 'Decabits Programmer',
        apply_url: 'https://careers.google.com/jobs/results/?location=India',
        salary: '₹12,00,000 - ₹18,00,000',
        description: 'We are looking for a skilled React developer to build amazing web applications.',
        type: 'Full Time',
        location: 'Bengaluru, India',
        match_score: 92,
        source_platform: 'company_direct',
        logoBg: '#1f2a24',
        logoColor: '#00e676',
        iconType: 'circle'
      },
      {
        id: 'job-2',
        title: 'UI/UX Designer',
        company: 'Sunrise Programmer',
        apply_url: 'https://boards.greenhouse.io/stripe',
        salary: '₹10,00,000 - ₹15,00,000',
        description: 'Join our design team to create beautiful and user-friendly experiences.',
        type: 'Full Time',
        location: 'Remote (India)',
        match_score: 88,
        source_platform: 'greenhouse',
        logoBg: '#151c2e',
        logoColor: '#ffffff',
        iconType: 'c'
      },
      {
        id: 'job-3',
        title: 'Backend Developer',
        company: 'Nexora Engineer',
        apply_url: 'https://jobs.lever.co/figma',
        salary: '₹15,00,000 - ₹22,00,000',
        description: 'Work with scalable systems and powerful APIs in a fast-paced environment.',
        type: 'Full Time',
        location: 'Hyderabad, India',
        match_score: 84,
        source_platform: 'lever',
        logoBg: '#151c2e',
        logoColor: '#ffffff',
        iconType: 'c'
      },
      {
        id: 'job-4',
        title: 'DevOps Engineer',
        company: 'Brighten Cloud Systems',
        apply_url: 'https://jobs.ashbyhq.com/openai',
        salary: '₹18,00,000 - ₹26,00,000',
        description: 'Help us build and maintain our cloud infrastructure and deployment pipelines.',
        type: 'Full Time',
        location: 'Pune / Remote',
        match_score: 82,
        source_platform: 'ashby',
        logoBg: '#1a1829',
        logoColor: '#ffffff',
        iconType: 'c'
      }
    ];
  }, [matches]);

  // 5 Featured Companies matching the mockup
  const featuredCompanies = [
    {
      id: 'comp-1',
      name: 'Spotify Labs',
      openings: '25 Openings',
      logoSvg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#00e676">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.216.353-.674.464-1.027.25-2.812-1.718-6.35-2.108-10.518-1.155-.403.092-.808-.16-.9-.562-.093-.404.16-.808.563-.901 4.562-1.042 8.48-.598 11.632 1.341.353.214.464.673.25 1.027zm1.467-3.26c-.272.441-.848.583-1.29.31-3.218-1.977-8.125-2.55-11.933-1.393-.497.15-1.026-.134-1.176-.63-.15-.497.134-1.026.63-1.176 4.356-1.322 9.774-.682 13.46 1.597.44.273.582.85.309 1.292zm.126-3.397c-3.858-2.29-10.222-2.502-13.896-1.387-.59.18-1.221-.157-1.4-.748-.18-.592.156-1.222.748-1.402 4.223-1.282 11.25-1.037 15.69 1.598.53.315.704 1.004.39 1.534-.316.53-1.005.703-1.532.39z"/>
        </svg>
      )
    },
    {
      id: 'comp-2',
      name: 'Meta Inc.',
      openings: '18 Openings',
      logoSvg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 5.5c-2.38 0-4.4 1.2-5.4 3.02C5.45 6.44 3.65 5.5 1.5 5.5 0.67 5.5 0 6.17 0 7v10c0 .83.67 1.5 1.5 1.5 2.15 0 3.95-.94 5.1-3.02 1 1.82 3.02 3.02 5.4 3.02s4.4-1.2 5.4-3.02c1.15 2.08 2.95 3.02 5.1 3.02.83 0 1.5-.67 1.5-1.5V7c0-.83-.67-1.5-1.5-1.5-2.15 0-3.95.94-5.1 3.02C16.4 6.7 14.38 5.5 12 5.5z"/>
        </svg>
      )
    },
    {
      id: 'comp-3',
      name: 'Amazon Inc.',
      openings: '32 Openings',
      logoSvg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-3.1 0-5.6-1.5-6.8-3.7.2-.2.5-.2.7-.1 1 1.8 3.1 3 5.5 3 2.6 0 4.9-1.5 5.8-3.6.3-.1.5 0 .7.2-1.1 2.5-3.5 4.2-6.4 4.2zm3.5-5.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/>
        </svg>
      )
    },
    {
      id: 'comp-4',
      name: 'Microsoft Ltd.',
      openings: '28 Openings',
      logoSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path fill="#f25022" d="M1 1h10v10H1z"/>
          <path fill="#7fba00" d="M13 1h10v10H13z"/>
          <path fill="#00a4ef" d="M1 13h10v10H1z"/>
          <path fill="#ffb900" d="M13 13h10v10H13z"/>
        </svg>
      )
    },
    {
      id: 'comp-5',
      name: 'Google LLC',
      openings: '23 Openings',
      logoSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
      )
    }
  ];

  // Helper for Circular Donut SVG
  const DonutGauge = ({ percent, color, label }) => {
    const radius = 26;
    const stroke = 5;
    const normRadius = radius - stroke / 2;
    const circumference = normRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
          <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              stroke="rgba(255,255,255,0.06)"
              fill="transparent"
              strokeWidth={stroke}
              r={normRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease 0s' }}
              strokeLinecap="round"
              r={normRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f8fafc'
          }}>
            {percent}%
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', color: '#8a99ad', fontWeight: 600 }}>
          {label}
        </span>
      </div>
    );
  };

  const displayName = profile?.name ? profile.name.split(' ')[0] : 'Kabira';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* 🌟 AI CAREER OS GUIDANCE */}
      <CharacterSpeechBubble
        character="nova"
        pose="welcome"
        message={`Welcome back, ${displayName}! Explore today's curated opportunities and AI career tools.`}
        subtitle="Today's Recommendation: Practice 1 behavioral STAR interview question or audit your top 3 resume bullet points."
        actionLabel="Practice Interview with Zenith →"
        onAction={() => {
          SoundSystem.playPop();
          if (onNavigate) onNavigate('interview-prep');
        }}
        variant="indigo"
      />

      {/* 📄 RESUME UPLOAD HERO BANNER (Directly displayed after Verification to start applying) */}
      <UploadResumeBanner 
        profile={profile}
        onUploadResume={onUploadResume}
        onNavigate={onNavigate}
        onTriggerCelebration={onTriggerCelebration}
        onSeedDemo={onSeedDemo}
      />

      {/* 02. HOME / DISCOVER TOP GREETING & FILTER SEARCH BAR (Design System Screen 02) */}
      <div style={{
        background: 'rgba(19, 20, 36, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Top greeting row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Hello {displayName} 👋
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px', margin: 0 }}>
              Discover opportunities, apply with tailored resumes, and track your career growth.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                SoundSystem.playPop();
                if (onNavigate) onNavigate('profile');
              }}
              className="btn-tactile btn-tactile-ghost"
              style={{
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <User size={14} color="#A78BFA" />
              <span>{profile?.name || "Kabira"}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips matching Screen 02 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'saved', label: `Saved (${savedJobs?.length || 4})`, action: () => onNavigate && onNavigate('saved') },
            { id: 'applied', label: `Applied (${applications?.length || 24})`, action: () => onNavigate && onNavigate('pipeline') },
            { id: 'remote', label: 'Remote' },
            { id: 'onsite', label: 'Onsite' },
            { id: 'internships', label: 'Internships 🇮🇳', action: () => onNavigate && onNavigate('internships') }
          ].map((chip) => {
            const isActive = activeCategoryTab === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  SoundSystem.playPop();
                  setActiveCategoryTab(chip.id);
                  if (chip.action) chip.action();
                }}
                className={`btn-tactile ${isActive ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar + Filter Sliders Trigger matching Screen 02 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onQuickSearch) {
                  onQuickSearch(searchQuery);
                }
              }}
              placeholder="Search for company or roles..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 46px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '9999px',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={onOpenFilters}
            className="btn-glass-pill"
            style={{
              padding: '12px 18px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Open Search & Filters"
          >
            <SlidersHorizontal size={16} color="#A78BFA" />
            <span style={{ display: 'inline' }}>Filters</span>
          </button>
        </div>
      </div>

      {/* 01. ONBOARDING / DREAM JOB HERO BANNER (Design System Screen 01) */}
      <OnboardingHeroBanner 
        onStartSearching={() => onNavigate && onNavigate('jobs')}
        onQuickSearch={(term) => {
          if (onQuickSearch) onQuickSearch(term);
          if (onNavigate) onNavigate('jobs');
        }}
        onOpenFilters={onOpenFilters}
      />

      {/* Real-Time Notification Center (Skill 5 Standard) */}
      <NotificationCenter profileId={profile?.id} onNavigate={onNavigate} />

      {/* TOP 4 VIBRANT METRIC CARDS */}
      <div className="overview-metric-grid">
        {/* Card 1: Active Job Applications (Green) */}
        <div className="metric-card-green" onClick={() => onNavigate && onNavigate('pipeline')} style={{ cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: '6px' }}>
              Active Job Applications
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.1 }}>
              {activeAppsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: 500 }}>
              Live in Kanban pipeline
            </div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} color="#ffffff" />
          </div>
        </div>

        {/* Card 2: Applications Sent (Orange) */}
        <div className="metric-card-orange" onClick={() => onNavigate && onNavigate('pipeline')} style={{ cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: '6px' }}>
              Applications Sent
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.1 }}>
              {sentAppsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: 500 }}>
              Submitted to employers
            </div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={22} color="#ffffff" />
          </div>
        </div>

        {/* Card 3: ATS Resume Score (Purple) */}
        <div className="metric-card-purple" onClick={() => onNavigate && onNavigate('profile')} style={{ cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: '6px' }}>
              ATS Resume Score
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.1 }}>
              {atsScore > 0 ? `${atsScore}` : '0'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: 500 }}>
              {atsScore >= 82 ? 'A+ Benchmark Ready' : (atsScore >= 68 ? 'Good Alignment' : 'Needs Optimization')}
            </div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={22} color="#ffffff" />
          </div>
        </div>

        {/* Card 4: AI Match Opportunities (Pink) */}
        <div className="metric-card-pink" onClick={() => onNavigate && onNavigate('jobs')} style={{ cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: '6px' }}>
              AI Match Opportunities
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.1 }}>
              {matchCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: 500 }}>
              Qualified startup roles
            </div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* HERO FEATURED OPPORTUNITY HUBS WITH THUMBNAIL BANNERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        
        {/* Hub 1: India Internships Hub */}
        <div 
          onClick={() => onNavigate && onNavigate('internships')}
          className="jobfit-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 153, 51, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}
        >
          <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src="/thumbnails/internship_hub_banner.png" 
              alt="India Internships Hub"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'transform 0.5s ease' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)' }} />
            <span style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(255, 153, 51, 0.9)',
              color: '#0f172a',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              🇮🇳 Live Scraper
            </span>
          </div>
          <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>India Internships Hub</span>
              <ArrowRight size={16} color="#ffb347" />
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, margin: 0 }}>
              Direct apply student & early-career roles across Unstop, Cuvette, Wellfound, Internshala & GitHub repos.
            </p>
          </div>
        </div>

        {/* Hub 2: MNC Campus & Big Tech Hub */}
        <div 
          onClick={() => onNavigate && onNavigate('mnc')}
          className="jobfit-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(112, 0, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}
        >
          <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src="/thumbnails/mnc_careers_banner.png" 
              alt="MNC Careers Hub"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'transform 0.5s ease' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)' }} />
            <span style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(112, 0, 255, 0.9)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              ⚡ Tier-1 Big Tech
            </span>
          </div>
          <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>MNC Careers Hub</span>
              <ArrowRight size={16} color="#a855f7" />
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, margin: 0 }}>
              Live careers scanner for Google, Microsoft, Amazon, Uber and top Indian tech campuses with direct ATS links.
            </p>
          </div>
        </div>

        {/* Hub 3: AI ATS Resume Optimizer */}
        <div 
          onClick={() => onNavigate && onNavigate('profile')}
          className="jobfit-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}
        >
          <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src="/thumbnails/ats_optimizer_banner.png" 
              alt="ATS Resume Optimizer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'transform 0.5s ease' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)' }} />
            <span style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(16, 185, 129, 0.9)',
              color: '#0f172a',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              🎯 Zero-Hallucination
            </span>
          </div>
          <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>ATS Resume Optimizer</span>
              <ArrowRight size={16} color="#34d399" />
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, margin: 0 }}>
              Multi-format parsing (PDF, DOCX, ODT), 4-pillar quality benchmark scoring, and drag-and-drop structural editor.
            </p>
          </div>
        </div>

        {/* Hub 4: 360° Interview Prep Studio */}
        <div 
          onClick={() => onNavigate && onNavigate('interview-prep')}
          className="jobfit-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}
        >
          <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src="/thumbnails/interview_studio_banner.png" 
              alt="Interview Prep Studio"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'transform 0.5s ease' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)' }} />
            <span style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0, 229, 255, 0.9)',
              color: '#0f172a',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              🎙️ AI Mock Studio
            </span>
          </div>
          <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Interview Prep Studio</span>
              <ArrowRight size={16} color="#00e5ff" />
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, margin: 0 }}>
              Company-specific question packets, interactive mock response AI evaluator, and curated video study recommendations.
            </p>
          </div>
        </div>

      </div>

      {/* TECH TRACKS BY DOMAIN WITH CREATIVE THUMBNAILS */}
      <div className="jobfit-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Explore Opportunities by Domain
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#8a99ad', marginTop: '3px', margin: 0 }}>
              Curated tech sectors with highest hiring velocity & market compensation
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('jobs')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <span>All Domains</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          
          {/* Track 1: AI / Machine Learning */}
          <div 
            onClick={() => onNavigate && onNavigate('internships')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <img 
              src="/thumbnails/ai_ml_track_thumb.png" 
              alt="AI ML Track" 
              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                AI & Machine Learning
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 600, marginTop: '2px' }}>
                PyTorch, NLP, LLMs
              </div>
            </div>
          </div>

          {/* Track 2: Backend & Cloud */}
          <div 
            onClick={() => onNavigate && onNavigate('internships')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <img 
              src="/thumbnails/backend_track_thumb.png" 
              alt="Backend Track" 
              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                Backend & Distributed
              </div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                FastAPI, Go, Docker
              </div>
            </div>
          </div>

          {/* Track 3: Fullstack & React */}
          <div 
            onClick={() => onNavigate && onNavigate('jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <img 
              src="/thumbnails/fullstack_track_thumb.png" 
              alt="Fullstack Track" 
              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                Fullstack Engineering
              </div>
              <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600, marginTop: '2px' }}>
                React, Next.js, Node
              </div>
            </div>
          </div>

          {/* Track 4: Fintech & Unicorns */}
          <div 
            onClick={() => onNavigate && onNavigate('jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251, 191, 36, 0.08)'; e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <img 
              src="/thumbnails/fintech_startup_thumb.png" 
              alt="Fintech Track" 
              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                Fintech & Unicorns
              </div>
              <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600, marginTop: '2px' }}>
                High-scale, Tier-1 Pay
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TWO-COLUMN MAIN WORKSPACE */}
      <div className="overview-main-grid">
        
        {/* LEFT COLUMN: Profile Card & Recent Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Candidate Profile Card */}
          <div className="jobfit-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
            {/* Glowing Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <UserAvatar 
                name={candidateName}
                size={76}
                glow={true}
              />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
              {candidateName}
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#8a99ad', marginBottom: '16px' }}>
              {candidateEmail}
            </p>
            <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 700, marginBottom: '18px', background: 'rgba(99, 102, 241, 0.12)', padding: '4px 10px', borderRadius: '12px', display: 'inline-block' }}>
              {candidateRole}
            </div>

            {/* 3 Circular Donut Progress Gauges */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <DonutGauge percent={atsScore > 0 ? atsScore : 0} color="#ffb300" label="ATS Score" />
              <DonutGauge percent={avgMatchScore} color="#00e5ff" label="Match Rate" />
              <DonutGauge percent={applications.length > 0 ? Math.round((interviewCount / applications.length) * 100) : 0} color="#7000ff" label="Interviews" />
            </div>

            {/* AI Interview Prep Studio Launch Button */}
            <button
              onClick={() => onNavigate && onNavigate('interview-prep')}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '9px 14px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                borderRadius: '10px'
              }}
            >
              <BrainCircuit size={15} />
              <span>Practice in Interview Prep Studio</span>
            </button>
          </div>

          {/* Recent Activities Card */}
          <div className="jobfit-card" style={{ padding: '22px 20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', marginBottom: '18px' }}>
              Recent Activities
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Activity 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#1a2236',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Rocket size={16} color="#818cf8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, lineHeight: 1.3 }}>
                    You applied for <span style={{ color: '#f8fafc', fontWeight: 700 }}>Frontend Developer</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    2h ago
                  </div>
                </div>
              </div>

              {/* Activity 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#1a2236',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Rocket size={16} color="#818cf8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, lineHeight: 1.3 }}>
                    You applied for <span style={{ color: '#f8fafc', fontWeight: 700 }}>UI/UX Designer</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    5h ago
                  </div>
                </div>
              </div>

              {/* Activity 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#1a2236',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bookmark size={16} color="#ff9f00" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, lineHeight: 1.3 }}>
                    You bookmarked <span style={{ color: '#f8fafc', fontWeight: 700 }}>Product Manager</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    1d ago
                  </div>
                </div>
              </div>

              {/* Activity 4 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#1a2236',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Rocket size={16} color="#818cf8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, lineHeight: 1.3 }}>
                    You applied for <span style={{ color: '#f8fafc', fontWeight: 700 }}>Backend Developer</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    2d ago
                  </div>
                </div>
              </div>

            </div>

            {/* Down Chevron Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button 
                onClick={() => setShowRecentAll(!showRecentAll)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

          </div>

          {/* Outcome Diagnostics */}
          <OutcomeDiagnosisCard onNavigate={onNavigate} />

          {/* Link Quality & Canonical Ingestion Hardening Card */}
          <div className="jobfit-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                  Direct Apply Link Health
                </span>
              </div>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {linkHealth?.health_percentage !== undefined ? `${linkHealth.health_percentage}% Live` : 'Verified'}
              </span>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, marginBottom: '14px' }}>
              Every posting is verified with canonical link extraction. Dead, expired, or bounce-to-homepage links are automatically excluded from feeds.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399' }}>
                  {linkHealth?.live_count ?? (matches.length || 0)}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Live Verified</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ef4444' }}>
                  {linkHealth?.dead_count ?? 0}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Dead Excluded</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#818cf8' }}>
                  {linkHealth?.redirected_count ?? 0}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Redirected</div>
              </div>
            </div>

            <button
              onClick={handleRevalidateLinks}
              disabled={revalidating}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '7px 12px',
                fontSize: '0.76rem',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: revalidating ? 0.7 : 1
              }}
            >
              <RefreshCw size={12} className={revalidating ? 'spin-anim' : ''} />
              <span>{revalidating ? 'Re-Validating Direct Links...' : 'Re-Validate Direct Links'}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Vacancy Stats + Recommended Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* VACANCY STATS SPLINE WAVE CHART */}
          <div className="jobfit-card" style={{ padding: '24px' }}>
            
            {/* Header with Toggles and Time Filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Vacancy Stats
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Toggle 1: Application Sent */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8a99ad', fontWeight: 600 }}>Application Sent</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={toggleSent} 
                      onChange={(e) => setToggleSent(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Toggle 2: Interviews */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8a99ad', fontWeight: 600 }}>Interviews</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={toggleInterviews} 
                      onChange={(e) => setToggleInterviews(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Toggle 3: Shortlisted */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8a99ad', fontWeight: 600 }}>Shortlisted</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={toggleShortlisted} 
                      onChange={(e) => setToggleShortlisted(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Dropdown: This Month */}
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: '#151c2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <span>{timeFilter}</span>
                  <ChevronDown size={14} color="#94a3b8" />
                </div>

              </div>
            </div>

            {/* Relative Container for Floating Job Status Tooltip Card at peak */}
            <div style={{ position: 'relative', height: '240px', width: '100%' }}>
              
              {/* Floating Job Status Card overlay */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '18%',
                background: '#101626',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '10px 16px',
                zIndex: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc', textAlign: 'center', marginBottom: '2px' }}>
                  Job Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7000ff' }} />
                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>31</span> Open Positions
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff9f00' }} />
                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>8</span> Closed Positions
                  </div>
                </div>
              </div>

              {/* Responsive Recharts Spline Wave Chart */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    tick={{ fill: '#64748b', fontSize: 11 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 20, 40, 60, 80, 100]} 
                    stroke="#475569" 
                    tick={{ fill: '#64748b', fontSize: 11 }} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#101626', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.78rem' }} 
                  />
                  {toggleSent && (
                    <Line 
                      type="monotone" 
                      dataKey="sent" 
                      stroke="#7000ff" 
                      strokeWidth={3} 
                      dot={{ r: 0 }} 
                      activeDot={{ r: 5, fill: '#7000ff' }} 
                    />
                  )}
                  {toggleInterviews && (
                    <Line 
                      type="monotone" 
                      dataKey="interviews" 
                      stroke="#ff9f00" 
                      strokeWidth={3} 
                      dot={{ r: 0 }} 
                      activeDot={{ r: 5, fill: '#ff9f00' }} 
                    />
                  )}
                  {toggleShortlisted && (
                    <Line 
                      type="monotone" 
                      dataKey="shortlisted" 
                      stroke="#ff0055" 
                      strokeWidth={3} 
                      dot={{ r: 0 }} 
                      activeDot={{ r: 5, fill: '#ff0055' }} 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>

            </div>

            {/* Bottom Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7000ff' }} />
                Applications Sent
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff9f00' }} />
                Interviews
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff0055' }} />
                Shortlisted
              </div>
            </div>

          </div>

          {/* 02. RECOMMENDED JOBS (Design System Screen 02 Vibrant Cards) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Recommended for you
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                  Curated high-match roles aligned to your ATS profile
                </span>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('jobs')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#A78BFA',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View all</span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {/* Recommended Jobs Cards matching exact mockup */}
              {(matches && matches.length > 0 ? matches.slice(0, 6) : [
                {
                  id: 'card-1',
                  job: {
                    title: 'Sr. UX Designer',
                    company: 'Google',
                    location: 'New York',
                    job_type: 'Full-time',
                    experience_level: '3 years exp',
                    salary_range: '$50K/mo',
                    description: "We're looking for a UX Designer to craft seamless and delightful user experiences."
                  },
                  match_score: 96,
                  theme_body: 'two-tone-purple',
                  posted_time: 'Posted 2 days ago',
                  logo: 'G'
                },
                {
                  id: 'card-2',
                  job: {
                    title: 'Project Manager',
                    company: 'Airbnb',
                    location: 'Sydney',
                    job_type: 'Full-time',
                    experience_level: '1-2 years exp',
                    salary_range: '$25K/mo',
                    description: "Lead and deliver impactful projects that solve real problems and create value."
                  },
                  match_score: 92,
                  theme_body: 'two-tone-coral',
                  posted_time: 'Posted 1 day ago',
                  logo: 'A'
                },
                {
                  id: 'card-3',
                  job: {
                    title: 'Graphic Designer',
                    company: 'Spotify',
                    location: 'Gold Coast',
                    job_type: 'Full-time',
                    experience_level: '1-3 years exp',
                    salary_range: '$50K/mo',
                    description: "Create visual branding and high-impact media for millions of music listeners."
                  },
                  match_score: 90,
                  theme_body: 'two-tone-amber',
                  posted_time: 'Posted 2 days ago',
                  logo: 'S'
                },
                {
                  id: 'card-4',
                  job: {
                    title: 'Frontend Developer',
                    company: 'Meta',
                    location: 'Remote',
                    job_type: 'Full-time',
                    experience_level: '2+ years exp',
                    salary_range: '$45K/mo',
                    description: "Build cutting-edge React architectures for global communication products."
                  },
                  match_score: 88,
                  theme_body: 'two-tone-cyan',
                  posted_time: 'Posted 3 days ago',
                  logo: 'M'
                }
              ]).map((item, idx) => {
                const jobObj = item.job || item;
                const comp = jobObj.company || 'TechCorp';
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

                const isSaved = (savedJobs || []).some(s => s.id === (item.id || jobObj.id));
                const postedStr = item.posted_time || (idx % 2 === 1 ? 'Posted 1 day ago' : 'Posted 2 days ago');
                const roleTitle = jobObj.title || jobObj.role_title || 'Software Engineer';
                const roleLocation = jobObj.location || 'Remote / India';
                const roleExp = jobObj.experience_level || (jobObj.role_type === 'internship' ? 'Internship' : '1-3 years exp');
                const roleType = jobObj.job_type || (jobObj.remote ? 'Remote' : (jobObj.role_type === 'internship' ? 'Internship' : 'Full-time'));
                const roleDesc = (jobObj.description && jobObj.description.trim().length > 0)
                  ? (jobObj.description.length > 100 ? `${jobObj.description.substring(0, 95)}...` : jobObj.description)
                  : "High-impact opportunity to build scalable software and innovative product features.";
                const rawSal = jobObj.salary_range || jobObj.stipend || '';
                const roleSalary = (() => {
                  if (!rawSal || rawSal.toLowerCase() === 'null' || rawSal.toLowerCase() === 'none') return 'Not specified';
                  if (rawSal.toLowerCase().includes('unpaid')) return 'Unpaid';
                  return rawSal;
                })();

                return (
                  <div
                    key={item.id || idx}
                    className="two-tone-job-card"
                    onClick={() => onSelectJob && onSelectJob(jobObj, item)}
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
                      {/* Header Row: Avatar, Title, Company & Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isAmber ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1.15rem',
                            color: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
                          }}>
                            {item.logo || comp.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ 
                              fontSize: '1.05rem', 
                              fontWeight: 800, 
                              color: isAmber ? '#0F172A' : '#FFFFFF', 
                              lineHeight: 1.2,
                              margin: 0
                            }}>
                              {roleTitle}
                            </h4>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenCompany) onOpenCompany(comp);
                              }}
                              style={{ 
                                fontSize: '0.8rem', 
                                color: isAmber ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
                                fontWeight: 600, 
                                textDecoration: 'underline' 
                              }}
                            >
                              {comp}
                            </span>
                          </div>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleSave) onToggleSave(jobObj);
                          }}
                          style={{
                            background: isAmber ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSaved ? (isAmber ? '#0F172A' : '#FFB020') : (isAmber ? '#1E293B' : '#FFFFFF'),
                            cursor: 'pointer'
                          }}
                        >
                          <Bookmark size={15} fill={isSaved ? (isAmber ? '#0F172A' : '#FFB020') : 'none'} />
                        </button>
                      </div>

                      {/* Filter Tag Pills Row */}
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
                          <MapPin size={10} /> {roleLocation}
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
                          <Clock size={10} /> {roleExp}
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
                          <Briefcase size={10} /> {roleType}
                        </span>
                      </div>

                      {/* Excerpt Snippet */}
                      <p style={{ 
                        fontSize: '0.78rem', 
                        color: isAmber ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)', 
                        lineHeight: 1.45, 
                        margin: 0 
                      }}>
                        {roleDesc}
                      </p>
                    </div>

                    {/* Bottom Crisp White Footer Bar matching Mockup */}
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
                        <Clock size={13} color="#64748B" />
                        <span>{postedStr}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div className="salary-tag" style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: 900 }}>
                          {roleSalary}
                        </div>

                        <a
                          href={jobObj.apply_url || jobObj.url || `https://www.google.com/search?q=${encodeURIComponent(comp + ' ' + roleTitle + ' careers apply')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: '#10B981',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            borderRadius: '9999px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Apply directly on company portal"
                        >
                          Apply <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM SECTION: FEATURED COMPANIES */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Featured Companies
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#151c2e',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}>
                <ChevronLeft size={16} />
              </button>
              <button style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#151c2e',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View More Link */}
            <button 
              onClick={() => onNavigate && onNavigate('mnc')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#818cf8',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>View more</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 5 Featured Company Pill Cards */}
        <div className="featured-companies-grid">
          {featuredCompanies.map((comp) => (
            <div 
              key={comp.id}
              className="jobfit-card"
              onClick={() => onNavigate && onNavigate('mnc')}
              style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#101626',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {comp.logoSvg}
              </div>

              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                  {comp.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8a99ad', marginTop: '2px', fontWeight: 500 }}>
                  {comp.openings}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
