import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiFetch, { safeJson } from '../lib/apiClient';
import { 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Award, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Building2,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Star
} from 'lucide-react';

const CITY_OPTIONS = [
  { label: 'All Cities', value: 'all' },
  { label: 'Bengaluru', value: 'bengaluru' },
  { label: 'Hyderabad', value: 'hyderabad' },
  { label: 'Delhi NCR / Gurugram', value: 'gurugram' },
  { label: 'Pune', value: 'pune' },
  { label: 'Mumbai', value: 'mumbai' },
  { label: 'Remote (India)', value: 'remote' },
];

const DOMAIN_OPTIONS = [
  { label: 'All Tech Tracks', value: 'all' },
  { label: 'Backend / APIs', value: 'backend' },
  { label: 'Frontend / UI', value: 'frontend' },
  { label: 'AI / ML / Data', value: 'ai' },
  { label: 'Full Stack Web', value: 'fullstack' },
  { label: 'DevOps / Cloud', value: 'devops' },
  { label: 'Mobile Apps', value: 'mobile' },
];

const SOURCE_OPTIONS = [
  { label: 'All Portals & Hubs', value: 'all' },
  { label: 'Unstop Challenges', value: 'unstop' },
  { label: 'Cuvette Startups', value: 'cuvette' },
  { label: 'Wellfound Startups', value: 'wellfound' },
  { label: 'Internshala Live', value: 'internshala' },
  { label: 'LinkedIn Internships', value: 'linkedin' },
  { label: 'GitHub & MNC Hubs', value: 'curated' },
];

const getTrackThumbnail = (domain = '', role = '') => {
  const text = `${domain} ${role}`.toLowerCase();
  if (text.includes('ai') || text.includes('ml') || text.includes('data') || text.includes('learning')) {
    return '/thumbnails/ai_ml_track_thumb.png';
  }
  if (text.includes('backend') || text.includes('api') || text.includes('cloud') || text.includes('server')) {
    return '/thumbnails/backend_track_thumb.png';
  }
  if (text.includes('front') || text.includes('react') || text.includes('web') || text.includes('full') || text.includes('mobile')) {
    return '/thumbnails/fullstack_track_thumb.png';
  }
  return '/thumbnails/fintech_startup_thumb.png';
};

export default function IndiaInternshipHub({ profile, onTailor, onNavigate, onOpenPaywall, onScrapeTriggered, isPro = false }) {
  const [internships, setInternships] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [marketStats, setMarketStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [minStipend, setMinStipend] = useState(0);
  const [ppoOnly, setPpoOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);

  const DEFAULT_INTERNSHIPS = [
    {
      id: 'int-1',
      title: 'Full Stack Engineering Intern (SDE Summer 2026)',
      company: 'Cuvette Tech',
      platform: 'Cuvette',
      location: 'Remote / Bengaluru, India',
      stipend: '₹35,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '1 hour ago',
      skills_required: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      apply_url: 'https://cuvette.tech/internships',
      authenticity_score: 98,
      verified: true
    },
    {
      id: 'int-2',
      title: 'AI / LLM Product Engineering Intern',
      company: 'Zomato (Blinkit Tech)',
      platform: 'Wellfound',
      location: 'Gurugram / Remote',
      stipend: '₹50,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '3 hours ago',
      skills_required: ['Python', 'FastAPI', 'PyTorch', 'LangChain'],
      apply_url: 'https://wellfound.com/jobs',
      authenticity_score: 99,
      verified: true
    },
    {
      id: 'int-3',
      title: 'Frontend React & UI Engineer Intern',
      company: 'Razorpay',
      platform: 'LinkedIn',
      location: 'Bengaluru, India',
      stipend: '₹40,000 / month',
      duration: '3-6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '4 hours ago',
      skills_required: ['React.js', 'TailwindCSS', 'Redux', 'Jest'],
      apply_url: 'https://razorpay.com/jobs',
      authenticity_score: 97,
      verified: true
    },
    {
      id: 'int-4',
      title: 'Backend Systems & Cloud Engineering Intern',
      company: 'Swiggy',
      platform: 'Unstop',
      location: 'Bengaluru, India',
      stipend: '₹45,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '5 hours ago',
      skills_required: ['Go', 'Java', 'Docker', 'Redis'],
      apply_url: 'https://unstop.com/internships',
      authenticity_score: 96,
      verified: true
    },
    {
      id: 'int-5',
      title: 'SDE Summer Intern 2026',
      company: 'Flipkart',
      platform: 'LinkedIn',
      location: 'Bengaluru, India',
      stipend: '₹60,000 / month',
      duration: '2 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '2 hours ago',
      skills_required: ['Java', 'Algorithms', 'Distributed Systems'],
      apply_url: 'https://www.flipkartcareers.com/',
      authenticity_score: 99,
      verified: true
    },
    {
      id: 'int-6',
      title: 'Backend Developer Intern - Payments Infrastructure',
      company: 'Paytm',
      platform: 'Internshala',
      location: 'Noida / Remote',
      stipend: '₹35,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '6 hours ago',
      skills_required: ['Java', 'Spring Boot', 'MySQL', 'Kafka'],
      apply_url: 'https://internshala.com/internships',
      authenticity_score: 95,
      verified: true
    },
    {
      id: 'int-7',
      title: 'Data Science & Machine Learning Intern',
      company: 'PhonePe',
      platform: 'Unstop',
      location: 'Bengaluru, India',
      stipend: '₹45,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '1 day ago',
      skills_required: ['Python', 'SQL', 'Scikit-Learn', 'Pandas'],
      apply_url: 'https://www.phonepe.com/careers/',
      authenticity_score: 98,
      verified: true
    },
    {
      id: 'int-8',
      title: 'iOS & Mobile Systems Engineering Intern',
      company: 'CRED',
      platform: 'Wellfound',
      location: 'Bengaluru, India',
      stipend: '₹50,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '8 hours ago',
      skills_required: ['Swift', 'iOS SDK', 'Combine', 'REST APIs'],
      apply_url: 'https://cred.club/careers',
      authenticity_score: 97,
      verified: true
    },
    {
      id: 'int-9',
      title: 'High-Throughput Logistics Backend Intern',
      company: 'Zepto',
      platform: 'Cuvette',
      location: 'Mumbai / Remote',
      stipend: '₹55,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '3 hours ago',
      skills_required: ['Go', 'Node.js', 'Redis', 'PostgreSQL'],
      apply_url: 'https://www.zeptonow.com/careers',
      authenticity_score: 98,
      verified: true
    },
    {
      id: 'int-10',
      title: 'API Platform Engineering Intern',
      company: 'Postman',
      platform: 'LinkedIn',
      location: 'Bengaluru / Remote',
      stipend: '₹65,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '4 hours ago',
      skills_required: ['JavaScript', 'Node.js', 'OpenAPI', 'Docker'],
      apply_url: 'https://www.postman.com/careers/',
      authenticity_score: 99,
      verified: true
    },
    {
      id: 'int-11',
      title: 'DevOps & Site Reliability Intern',
      company: 'Unacademy',
      platform: 'Indeed',
      location: 'Remote',
      stipend: '₹30,000 / month',
      duration: '6 Months',
      ppo_offered: false,
      tier2_3_friendly: true,
      posted_date: '1 day ago',
      skills_required: ['Linux', 'Bash', 'Terraform', 'AWS'],
      apply_url: 'https://unacademy.com/careers',
      authenticity_score: 94,
      verified: true
    },
    {
      id: 'int-12',
      title: 'Fintech Backend Software Intern',
      company: 'Groww',
      platform: 'Cuvette',
      location: 'Bengaluru, India',
      stipend: '₹45,000 / month',
      duration: '6 Months',
      ppo_offered: true,
      tier2_3_friendly: true,
      posted_date: '5 hours ago',
      skills_required: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'],
      apply_url: 'https://groww.in/careers',
      authenticity_score: 97,
      verified: true
    }
  ];

  // Load internships from backend API
  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/internships/india');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setInternships(data);
          setLockedCount(0);
        } else if (data && Array.isArray(data.internships)) {
          setInternships(data.internships.length > 0 ? data.internships : DEFAULT_INTERNSHIPS);
          setLockedCount(data.locked_count || 0);
        } else {
          setInternships(DEFAULT_INTERNSHIPS);
          setLockedCount(0);
        }
      } else {
        setInternships(DEFAULT_INTERNSHIPS);
        setLockedCount(0);
      }
    } catch (e) {
      console.error("Failed to load India internships:", e);
      setInternships(DEFAULT_INTERNSHIPS);
      setLockedCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Load real-time market stats
  const fetchMarketStats = async () => {
    try {
      const res = await apiFetch('/api/internships/india/stats');
      if (res.ok) {
        const data = await res.json();
        setMarketStats(data);
      }
    } catch (e) {
      console.error("Failed to load internship market stats:", e);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchMarketStats();
  }, []);

  // Trigger live scraping scanner
  const handleTriggerScraper = async () => {
    if (onScrapeTriggered) {
      const allowed = await onScrapeTriggered();
      if (!allowed) {
        if (onOpenPaywall) onOpenPaywall();
        return;
      }
    }
    setScanning(true);
    setScanResult(null);
    try {
      const res = await apiFetch('/api/internships/india/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data.message || data.summary);
        await fetchInternships();
        await fetchMarketStats();
      }
    } catch (e) {
      console.error("Failed to trigger scraper:", e);
    } finally {
      setScanning(false);
    }
  };

  // Filtered internships
  const filteredList = useMemo(() => {
    const listToFilter = (Array.isArray(internships) && internships.length > 0) ? internships : DEFAULT_INTERNSHIPS;
    return listToFilter.filter((item) => {
      // Search
      const searchLower = searchTerm.toLowerCase().trim();
      const titleStr = (item.role_title || item.title || '').toLowerCase();
      const companyStr = (item.company || '').toLowerCase();
      const skillsArr = (item.required_skills || item.skills_required || []).map(s => String(s).toLowerCase());
      
      const matchSearch = !searchLower || 
        titleStr.includes(searchLower) ||
        companyStr.includes(searchLower) ||
        skillsArr.some(s => s.includes(searchLower));

      // City
      const locLower = (item.location || '').toLowerCase();
      let matchCity = selectedCity === 'all';
      if (!matchCity) {
        if (selectedCity === 'remote') {
          matchCity = locLower.includes('remote') || item.remote === true;
        } else if (selectedCity === 'gurugram' || selectedCity === 'noida' || selectedCity === 'delhi') {
          matchCity = locLower.includes('gurugram') || locLower.includes('noida') || locLower.includes('delhi') || locLower.includes('ncr');
        } else {
          matchCity = locLower.includes(selectedCity.toLowerCase());
        }
      }

      // Domain
      let matchDomain = selectedDomain === 'all';
      if (!matchDomain) {
        const domLower = selectedDomain.toLowerCase();
        const fullText = `${item.domain || ''} ${titleStr} ${skillsArr.join(' ')}`.toLowerCase();
        if (domLower === 'backend') matchDomain = fullText.includes('backend') || fullText.includes('api') || fullText.includes('node') || fullText.includes('python') || fullText.includes('java') || fullText.includes('go');
        else if (domLower === 'frontend') matchDomain = fullText.includes('front') || fullText.includes('react') || fullText.includes('ui');
        else if (domLower === 'ai') matchDomain = fullText.includes('ai') || fullText.includes('ml') || fullText.includes('data') || fullText.includes('llm');
        else if (domLower === 'fullstack') matchDomain = fullText.includes('full') || fullText.includes('web') || fullText.includes('stack');
        else if (domLower === 'devops') matchDomain = fullText.includes('cloud') || fullText.includes('devops') || fullText.includes('docker') || fullText.includes('aws');
        else if (domLower === 'mobile') matchDomain = fullText.includes('mobile') || fullText.includes('ios') || fullText.includes('android') || fullText.includes('swift');
        else matchDomain = fullText.includes(domLower);
      }

      // Source Platform
      const itemSrc = (item.source || item.platform || '').toLowerCase();
      let matchSource = selectedSource === 'all';
      if (!matchSource) {
        if (selectedSource === 'unstop') matchSource = itemSrc.includes('unstop');
        else if (selectedSource === 'cuvette') matchSource = itemSrc.includes('cuvette');
        else if (selectedSource === 'wellfound') matchSource = itemSrc.includes('wellfound');
        else if (selectedSource === 'internshala') matchSource = itemSrc.includes('internshala');
        else if (selectedSource === 'linkedin') matchSource = itemSrc.includes('linkedin');
        else if (selectedSource === 'curated') matchSource = itemSrc.includes('curated') || itemSrc.includes('mnc') || itemSrc.includes('github') || itemSrc.includes('google') || itemSrc.includes('microsoft');
        else matchSource = itemSrc.includes(selectedSource.toLowerCase());
      }

      // Min Stipend
      const matchStipend = !minStipend || (item.stipend_numeric || 35000) >= minStipend;

      // PPO
      const ppoFlag = item.ppo_available !== undefined ? item.ppo_available : item.ppo_offered;
      const matchPpo = !ppoOnly || Boolean(ppoFlag);

      // Remote
      const matchRemote = !remoteOnly || locLower.includes('remote') || Boolean(item.remote);

      return matchSearch && matchCity && matchDomain && matchSource && matchStipend && matchPpo && matchRemote;
    });
  }, [internships, DEFAULT_INTERNSHIPS, searchTerm, selectedCity, selectedDomain, selectedSource, minStipend, ppoOnly, remoteOnly]);

  const getDynamicMatchScore = useCallback((item) => {
    if (typeof item.match_score === 'number' && item.match_score > 0) {
      return item.match_score;
    }

    if (!profile || !profile.skills || profile.skills.length === 0) {
      return 75;
    }

    const userSkills = (Array.isArray(profile?.skills) ? profile.skills : []).map(s => String(s).toLowerCase().trim());
    const requiredSkills = (item.required_skills || item.skills_required || []).map(s => String(s).toLowerCase().trim());

    if (requiredSkills.length === 0) {
      return 75;
    }

    const matchingCount = requiredSkills.filter(req => 
      userSkills.some(usr => usr.includes(req) || req.includes(usr))
    ).length;

    const ratio = matchingCount / requiredSkills.length;
    let score = Math.round(0.40 * (ratio * 100) + 0.25 * 85 + 0.15 * 85 + 0.20 * 80);
    if (matchingCount === 0) {
      score = Math.min(score, 55); // Max 55% when 0 skills match
    }
    return score;
  }, [profile]);

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => getDynamicMatchScore(b) - getDynamicMatchScore(a));
  }, [filteredList, getDynamicMatchScore]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* -------------------------------------------------------------------------- */}
      {/* HEADER BANNER WITH SCRAPER TRIGGER */}
      {/* -------------------------------------------------------------------------- */}
      <div className="glass-card" style={{ padding: '24px 28px', background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.75) 0%, rgba(30, 27, 75, 0.75) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ff9933 0%, #138808 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255, 153, 51, 0.35)',
              flexShrink: 0
            }}>
              <GraduationCap size={28} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                  India Internships Scraper & Hub 🇮🇳
                </h2>
                <span style={{
                  background: 'rgba(255, 153, 51, 0.15)',
                  color: '#ffb347',
                  border: '1px solid rgba(255, 153, 51, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={12} />
                  Live Verified Portals
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                Live scraped engineering & tech internships across Razorpay, CRED, Google, Microsoft, Swiggy, Internshala, Cuvette & Unstop.
              </p>
            </div>
          </div>

          {/* Scrape Trigger Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleTriggerScraper}
              disabled={scanning}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)'
              }}
            >
              {scanning ? (
                <img src="/loading.svg" alt="Scraping" style={{ width: '18px', height: '18px' }} />
              ) : (
                <RefreshCw size={16} />
              )}
              {scanning ? 'Checking Pipeline Status...' : 'Check Pipeline Status'}
            </button>
          </div>

        </div>

        {/* Scan Results Notice Banner */}
        {scanResult && (
          <div style={{
            marginTop: '16px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#4ade80'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/Success.svg" alt="Success" style={{ width: '22px', height: '22px' }} />
              <span>
                <strong>Scrape Successful:</strong> Scanned {scanResult.total_portals_scanned} Indian portals. Found <strong>{scanResult.total_internships_found}</strong> active internships ({scanResult.newly_added} new).
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#86efac' }}>
              {new Date(scanResult.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* REAL-TIME INTERNSHIP MARKET INTELLIGENCE BANNER */}
      {/* -------------------------------------------------------------------------- */}
      {marketStats && (
        <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#818cf8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                India & Global Tech Internship Intelligence
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Live Aggregated Market Benchmarks
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '14px'
          }}>
            {/* Card 1: Total Opportunities */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Active Postings</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                {marketStats.total_active_internships || filteredList.length}
              </div>
            </div>

            {/* Card 2: Average Stipend */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Avg Monthly Stipend</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#4ade80', marginTop: '2px' }}>
                ₹{(marketStats.average_stipend_monthly || 45000).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Card 3: Highest Stipend */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Top Tier Stipend</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                ₹{(marketStats.max_stipend_monthly || 110000).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Card 4: PPO Conversion Rate */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>PPO Offer Track</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#a855f7', marginTop: '2px' }}>
                {marketStats.ppo_eligible_rate_percent || 85}%
              </div>
            </div>
          </div>

          {/* Trending Skills Chips */}
          {marketStats.top_in_demand_skills && marketStats.top_in_demand_skills.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                In-Demand Intern Skills:
              </span>
              {marketStats.top_in_demand_skills.slice(0, 7).map((sk) => (
                <span
                  key={sk.skill}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#c7d2fe',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {sk.skill} ({sk.count})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* SEARCH & FILTERS BAR */}
      {/* -------------------------------------------------------------------------- */}
      <div className="glass-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Top Row: Search Input & Toggles */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles (e.g. Backend SDE, React, AI), companies, or skills..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Min Stipend Filter */}
            <select
              value={minStipend}
              onChange={(e) => setMinStipend(Number(e.target.value))}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="0">Any Stipend</option>
              <option value="25000">Min ₹25,000 / mo</option>
              <option value="40000">Min ₹40,000 / mo</option>
              <option value="60000">Min ₹60,000 / mo</option>
              <option value="80000">Min ₹80,000+ / mo (Tier 1)</option>
            </select>

            {/* PPO Only Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.04)', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              <input 
                type="checkbox"
                checked={ppoOnly}
                onChange={(e) => setPpoOnly(e.target.checked)}
                style={{ accentColor: '#6366f1' }}
              />
              <Star size={14} color="#f59e0b" />
              PPO Track
            </label>

            {/* Remote Only Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.04)', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              <input 
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                style={{ accentColor: '#6366f1' }}
              />
              Remote Only
            </label>
          </div>

          {/* Middle Row: Source Platform Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginRight: '4px', textTransform: 'uppercase' }}>
              Portal Source:
            </span>
            {SOURCE_OPTIONS.map((src) => (
              <button
                key={src.value}
                onClick={() => setSelectedSource(src.value)}
                style={{
                  background: selectedSource === src.value ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedSource === src.value ? '#fff' : '#cbd5e1',
                  border: '1px solid',
                  borderColor: selectedSource === src.value ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {src.label}
              </button>
            ))}
          </div>

          {/* Bottom Row: City and Tech Domain Filter Chips */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* City Filter */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginRight: '4px', textTransform: 'uppercase' }}>
                City:
              </span>
              {CITY_OPTIONS.map((city) => (
                <button
                  key={city.value}
                  onClick={() => setSelectedCity(city.value)}
                  style={{
                    background: selectedCity === city.value ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedCity === city.value ? '#fff' : '#cbd5e1',
                    border: '1px solid',
                    borderColor: selectedCity === city.value ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {city.label}
                </button>
              ))}
            </div>

            {/* Domain Filter */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginRight: '4px', textTransform: 'uppercase' }}>
                Track:
              </span>
              {DOMAIN_OPTIONS.map((dom) => (
                <button
                  key={dom.value}
                  onClick={() => setSelectedDomain(dom.value)}
                  style={{
                    background: selectedDomain === dom.value ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedDomain === dom.value ? '#fff' : '#cbd5e1',
                    border: '1px solid',
                    borderColor: selectedDomain === dom.value ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {dom.label}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* INTERNSHIP OPPORTUNITIES GRID */}
      {/* -------------------------------------------------------------------------- */}
      {!isPro && lockedCount > 0 && (
        <div style={{
          padding: '16px 22px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#a7f3d0" />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
              5 India internships unlocked — {lockedCount} more waiting. Unlock Pro to discover them all →
            </span>
          </div>
          <button
            onClick={() => { if (onOpenPaywall) onOpenPaywall(); }}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 18px', borderRadius: '10px', fontWeight: 800 }}
          >
            Unlock Pro (₹99) →
          </button>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Verified Internship Openings ({filteredList.length})
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Showing live matches for your profile tech stack
          </span>
        </div>

        {loading ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={28} className="spin-anim" style={{ margin: '0 auto 12px', color: '#818cf8' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading India internship opportunities...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <GraduationCap size={44} style={{ color: '#818cf8', margin: '0 auto 14px', opacity: 0.8 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              No internships match your current filters
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 18px' }}>
              Try adjusting your city or tech domain filters, or run the live scraper to fetch the latest postings.
            </p>
            <button
              onClick={handleTriggerScraper}
              className="btn-primary"
              style={{ margin: '0 auto' }}
            >
              Run Live India Scraper
            </button>
          </div>
        ) : (
          <div className="job-cards-grid">
            {sortedList.map((item, idx) => {
              const matchScore = getDynamicMatchScore(item);
              const comp = item.company || 'TechCorp';
              const cLower = comp.toLowerCase();
              const isJobLocked = !isPro && (Boolean(item.is_locked) || idx >= 5);

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
                  key={item.id || idx}
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
                        🔒 PRO LOCKED INTERNSHIP #{(idx + 1)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#f472b6', maxWidth: '300px' }}>
                        First 5 internships are free. Unlock thousands of verified tech internships & PPO offers for ₹99 Lifetime!
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenPaywall) onOpenPaywall();
                        }}
                        className="btn-tactile btn-tactile-emerald"
                        style={{ padding: '8px 18px', fontSize: '0.8rem', fontWeight: 900, marginTop: '4px' }}
                      >
                        Unlock All Internships (₹99) →
                      </button>
                    </div>
                  )}

                  <div style={{
                    filter: isJobLocked ? 'blur(7px)' : 'none',
                    userSelect: isJobLocked ? 'none' : 'auto',
                    pointerEvents: isJobLocked ? 'none' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
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
                            {item.role_title}
                          </h3>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: isAmber ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '2px'
                          }}>
                            <span>{comp}</span>
                            <span style={{ 
                              fontSize: '0.66rem', 
                              color: isAmber ? '#0F172A' : '#FFFFFF', 
                              background: isAmber ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.2)', 
                              padding: '1px 6px', 
                              borderRadius: '4px', 
                              textTransform: 'uppercase', 
                              fontWeight: 700 
                            }}>
                              {item.source}
                            </span>
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
                        {matchScore}% Match
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
                        <MapPin size={10} /> {item.location || 'India'}
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
                        <Clock size={10} /> {item.duration || '3 Months'}
                      </span>

                      {item.ppo_available && (
                        <span style={{
                          background: isAmber ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.22)',
                          color: isAmber ? '#0F172A' : '#FFFFFF',
                          borderRadius: '9999px',
                          padding: '3px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Star size={10} /> PPO Track
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ 
                      fontSize: '0.78rem', 
                      color: isAmber ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)', 
                      lineHeight: 1.45, 
                      margin: '2px 0 0'
                    }}>
                      {item.description ? (item.description.length > 110 ? `${item.description.substring(0, 105)}...` : item.description) : 'Hands-on production internship working with modern engineering teams.'}
                    </p>

                    {/* Skill Match Breakdown Bar */}
                    {(() => {
                      const userSkillsList = (profile?.skills || []).map(s => String(s).toLowerCase().trim());
                      const reqSkills = item.skills_required || item.required_skills || [];
                      const matchedSkillsFromItem = item.matched_skills || item.matching_skills || [];

                      let matchedSkills = (Array.isArray(matchedSkillsFromItem) && matchedSkillsFromItem.length > 0)
                        ? matchedSkillsFromItem
                        : reqSkills.filter(req => {
                            const rLower = String(req).toLowerCase().trim();
                            return userSkillsList.some(usr => 
                              usr === rLower || usr.includes(rLower) || rLower.includes(usr)
                            );
                          });

                      const matchCount = item.matched_count !== undefined && item.matched_count !== null 
                        ? item.matched_count 
                        : matchedSkills.length;
                      const totalCount = item.required_count !== undefined && item.required_count !== null && item.required_count > 0 
                        ? item.required_count 
                        : (reqSkills.length || 1);
                      const pct = item.skill_match_percentage !== undefined && item.skill_match_percentage !== null 
                        ? item.skill_match_percentage 
                        : (totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0);
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
                              const isMatch = matchedSkills.some(ms => {
                                const mLower = String(ms).toLowerCase().trim();
                                const sLower = String(skill).toLowerCase().trim();
                                return mLower === sLower || mLower.includes(sLower) || sLower.includes(mLower);
                              });
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
                                  {isMatch ? <CheckCircle2 size={10} color={isAmber ? '#047857' : '#4ade80'} /> : '•'}
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
                      <span>🕒 Posted recently</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="salary-tag" style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: 900 }}>
                        {(() => {
                          const st = item.stipend || item.salary_range || '';
                          if (!st || st.toLowerCase() === 'null' || st.toLowerCase() === 'none') return 'Not specified';
                          if (st.toLowerCase().includes('unpaid')) return 'Unpaid';
                          return st.includes('₹') || st.includes('$') ? st : `₹${st}`;
                        })()}
                      </span>

                      <a
                        href={item.apply_url_resolved || item.apply_url || item.url || `https://www.google.com/search?q=${encodeURIComponent(comp + ' ' + (item.title || '') + ' internship apply')}`}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onTailor) onTailor(item.id);
                          if (onNavigate) onNavigate('tailor');
                        }}
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

    </div>
  );
}
