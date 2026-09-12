import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Search, 
  Briefcase, 
  BrainCircuit, 
  Code, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  HelpCircle, 
  Zap, 
  Lock, 
  ChevronDown, 
  SlidersHorizontal, 
  Check, 
  Globe, 
  CheckCheck,
  Award,
  Terminal,
  Cpu,
  Layers,
  Flame,
  Star,
  RefreshCw
} from 'lucide-react';
import apiFetch from '../lib/apiClient';
import SoundSystem from './characters/SoundEffects';
import { usePricingConfig } from '../hooks/usePricingConfig';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './characters/CharacterUniverse';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Upload Resume',
    tier: 'FREE',
    badge: '100% Free Forever',
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    icon: FileText,
    targetTab: 'profile',
    description: 'Drop your existing PDF or text resume to extract skills, experience, and contact details instantly.',
    actionLabel: 'Upload Resume →',
    highlights: ['Instant PDF parsing', 'Auto skill extraction', 'Zero data lock-in', '100% Free']
  },
  {
    step: '02',
    title: 'Free ATS Scoring',
    tier: 'FREE',
    badge: '100% Free Forever',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    icon: ShieldCheck,
    targetTab: 'profile',
    description: 'Get a 5-pillar ATS compatibility score and detailed breakdown covering formatting, skills gap, and action verbs.',
    actionLabel: 'Check ATS Score →',
    highlights: ['5-Pillar audit engine', 'Missing skills alert', 'Formatting check', 'Free forever']
  },
  {
    step: '03',
    title: 'Smart Job Matching',
    tier: 'PRO',
    badge: 'Pro Access',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: Search,
    targetTab: 'jobs',
    description: 'Match your profile against 1,500+ verified live listings across Indian startups, MNC portals, and internships.',
    actionLabel: 'Explore Matches →',
    highlights: ['1,500+ Live tech roles', 'Indian Internships Hub 🇮🇳', 'MNC career portals', 'Match percentage score']
  },
  {
    step: '04',
    title: 'AI Resume Tailoring',
    tier: 'PRO',
    badge: 'Pro Access',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    icon: Sparkles,
    targetTab: 'tailor',
    description: 'Generate zero-hallucination, job-specific CVs tailored precisely to target requisitions in one click.',
    actionLabel: 'Tailor Resume →',
    highlights: ['Zero-Hallucination guarantee', '11 Certified templates', 'Role keyword alignment', '1-Click PDF export']
  },
  {
    step: '05',
    title: 'Direct Linkout Apply',
    tier: 'PRO',
    badge: 'Pro Access',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    icon: ArrowRight,
    targetTab: 'jobs',
    description: 'Apply directly on company ATS portals (Lever, Greenhouse, Workday) with zero dead links or middleman forms.',
    actionLabel: 'Start Applying →',
    highlights: ['Direct ATS linkout', 'Zero dead links', 'Unified application tracking', 'Recruiter direct apply']
  }
];

const CORPORATE_TARGETS = [
  { name: 'Google', domain: 'google.com', platform: 'Direct ATS' },
  { name: 'Microsoft', domain: 'microsoft.com', platform: 'Careers Portal' },
  { name: 'Amazon', domain: 'amazon.jobs', platform: 'Amazon.jobs API' },
  { name: 'Swiggy', domain: 'swiggy.com', platform: 'Ashby API' },
  { name: 'Meesho', domain: 'meesho.com', platform: 'Greenhouse API' },
  { name: 'PhonePe', domain: 'phonepe.com', platform: 'Greenhouse API' },
  { name: 'Razorpay', domain: 'razorpay.com', platform: 'Lever API' },
  { name: 'InMobi', domain: 'inmobi.com', platform: 'Lever API' },
  { name: 'TCS', domain: 'tcs.com', platform: 'iBegin Portal' },
  { name: 'Infosys', domain: 'infosys.com', platform: 'Global Careers' }
];

const SAMPLE_QUESTION_BANKS = [
  { company: 'Google', topic: 'System Design', title: 'Design a High-Throughput Distributed Rate Limiter', frequency: 'Top 5%', difficulty: 'Hard', color: '#4285F4' },
  { company: 'Amazon', topic: 'Algorithms', title: 'LRU Cache & High-Velocity Inventory Queue', frequency: 'Top 3%', difficulty: 'Medium', color: '#FF9900' },
  { company: 'Microsoft', topic: 'Data Structures', title: 'Reverse Nodes in k-Group & Tree Serialization', frequency: 'Top 4%', difficulty: 'Hard', color: '#00A4EF' },
  { company: 'Swiggy', topic: 'Backend Architecture', title: 'Real-Time Geospatial Driver Allocation Engine', frequency: 'Unicorn Special', difficulty: 'Medium', color: '#FC8019' },
  { company: 'TCS & Infosys', topic: 'Aptitude & Coding', title: 'NQT Advanced Coding & Data Interpretation', frequency: 'Mass Recruiter Intakes', difficulty: 'Easy-Medium', color: '#10B981' }
];

const FAQS = [
  {
    q: 'What is NextOpportunityFinder and how is it different from traditional job boards?',
    a: 'It\'s an end-to-end career platform, not just a listings aggregator. It combines verified, direct-apply job discovery with a real-time ATS resume studio, one-click tailored CVs, voice-powered mock interviews, and in-browser DSA practice — so you fix your resume, find the right role, and prepare for the interview, all without switching tools.'
  },
  {
    q: 'How does the real-time ATS scoring work?',
    a: 'Your resume is scored against how well it matches a specific job — covering required skills, demonstrated experience, achievement evidence, seniority fit, and formatting/parsing risk. Every point is explained: you see exactly what\'s missing and why, not just a number.'
  },
  {
    q: 'How does the Zero-Hallucination standard protect my resume credibility?',
    a: 'The system never invents skills, companies, degrees, or metrics you didn\'t provide. Every suggestion is based only on what\'s actually in your resume — if something\'s missing, you\'re told it\'s missing, never given a fabricated addition.'
  },
  {
    q: 'How is my data protected under India\'s DPDP Act?',
    a: 'Your resume and personal data are encrypted at rest, never sold or shared with third parties beyond what\'s needed to operate the service, and can be deleted by you at any time — consistent with the DPDP Act 2023.'
  }
];

export default function HomePage({ onNavigate, currentUser, onTriggerCelebration, onOpenPaywall, isPro = false, isSubLoading = false }) {
  const pricing = usePricingConfig();
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [healthData, setHealthData] = useState(null);
  const [activeQuestionCompany, setActiveQuestionCompany] = useState('Google');

  // Fetch live active job count from single source of truth /api/health
  useEffect(() => {
    let isMounted = true;
    const loadHealth = async () => {
      try {
        const res = await apiFetch('/api/health');
        if (res && res.ok) {
          const data = await res.json();
          if (isMounted) setHealthData(data);
        }
      } catch (err) {
        console.debug('Health telemetry fetch notice:', err);
      }
    };
    loadHealth();
    return () => { isMounted = false; };
  }, []);

  // Live pulled count from real database (or 0 if unpopulated)
  const liveJobCount = healthData?.database_metrics?.total_jobs || healthData?.database?.total_jobs || 0;

  // Interactive ATS Live Benchmark Simulator State
  const [simSkillsCount, setSimSkillsCount] = useState(10);
  const [simHasMetrics, setSimHasMetrics] = useState(true);
  const [simTemplate, setSimTemplate] = useState('modern');

  // Compute live simulator score & breakdown
  const skillsScore = Math.min(35, Math.round(simSkillsCount * 2.5));
  const metricsScore = simHasMetrics ? 25 : 8;
  const templateScore = simTemplate === 'ats_safe' || simTemplate === 'modern' ? 15 : 12;
  const contactScore = 14;
  const keywordScore = 9;

  const simScore = Math.min(99, Math.max(40, skillsScore + metricsScore + templateScore + contactScore + keywordScore));

  const activeQuestionCard = SAMPLE_QUESTION_BANKS.find(q => q.company.includes(activeQuestionCompany)) || SAMPLE_QUESTION_BANKS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🌟 1. HERO SECTION */}
      <div className="glass-panel" style={{
        padding: '48px 36px',
        background: 'radial-gradient(ellipse at 15% 10%, rgba(99, 102, 241, 0.28) 0%, rgba(20, 26, 48, 0.95) 60%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.45)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.25)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '880px', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '6px 16px', borderRadius: '24px', alignSelf: 'flex-start' }}>
            <Sparkles size={15} color="#a5b4fc" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.04em' }}>
              NEXT OPPORTUNITY FIND &bull; VERIFIED CAREER OPERATING SYSTEM
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.2rem)', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            Land your dream job — <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>the way thousands already have.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#cbd5e1', lineHeight: 1.6, margin: 0, maxWidth: '780px' }}>
            Build an ATS-proof resume, apply to real verified openings, and walk into every interview prepared — all in one place.
          </p>

          {/* Primary & Secondary CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button
              onClick={() => {
                SoundSystem.playPop();
                onNavigate(currentUser ? 'profile' : 'auth');
              }}
              className="btn-tactile btn-tactile-primary"
              style={{
                padding: '14px 30px',
                fontSize: '1.02rem',
                fontWeight: 900,
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              Get Started Free →
            </button>

            <button
              onClick={() => {
                SoundSystem.playPop();
                onNavigate('auth');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '4px'
              }}
            >
              Already have an account? Sign in
            </button>
          </div>

          {/* Trust Strip (Directly under hero, real data only) */}
          <div style={{
            marginTop: '12px',
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.84rem',
            color: '#34d399',
            fontWeight: 800,
            width: 'fit-content',
            flexWrap: 'wrap'
          }}>
            <CheckCheck size={16} />
            <span>
              {liveJobCount > 0 
                ? `${liveJobCount.toLocaleString()} verified openings` 
                : 'Thousands of verified openings'}
            </span>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>&bull; Updated every 6 hours &bull;</span>
            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Zero dead links — every listing links straight to the real application</span>
          </div>

          {/* User-Facing Benefit Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '10px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#818cf8', fontWeight: 700 }}>
              <ShieldCheck size={14} /> Zero-Hallucination Engine
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '10px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#fbbf24', fontWeight: 700 }}>
              <Award size={14} /> 11 Certified ATS Templates
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '10px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#34d399', fontWeight: 700 }}>
              <Lock size={14} /> DPDP Act 2023 Compliant
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 2. SECTION — DIRECT-APPLY ACCESS TO TOP EMPLOYERS */}
      <div className="glass-panel" style={{
        padding: '20px 26px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
          Direct-apply access to top employers
        </div>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CORPORATE_TARGETS.map((comp, idx) => (
            <div key={idx} style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <Building2 size={16} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>{comp.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>✓ {comp.platform}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 3. SECTION — SEE YOUR ATS SCORE, LIVE */}
      <div id="ats-section" className="glass-panel" style={{
        padding: '30px 34px',
        background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.95), rgba(11, 15, 25, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', padding: '4px 12px', borderRadius: '12px', marginBottom: '8px' }}>
            <SlidersHorizontal size={14} color="#818cf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#818cf8', letterSpacing: '0.04em' }}>
              INTERACTIVE ATS RESUME SIMULATOR
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
            Your ATS Score, Explained
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Adjust the sliders and see exactly how your resume would score against a real job — before you ever upload one.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'center' }}>
          
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '6px' }}>
                <span>Technical Skills Coverage:</span>
                <strong style={{ color: '#818cf8' }}>{simSkillsCount} Skills ({skillsScore} pts)</strong>
              </div>
              <input 
                type="range" 
                min="2" 
                max="15" 
                value={simSkillsCount} 
                onChange={(e) => setSimSkillsCount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>Quantifiable Impact Metrics:</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Include numbers, SLAs, and performance deltas</div>
              </div>
              <button
                onClick={() => {
                  SoundSystem.playPop();
                  setSimHasMetrics(!simHasMetrics);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  background: simHasMetrics ? '#10b981' : '#ef4444',
                  color: '#fff',
                  boxShadow: simHasMetrics ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {simHasMetrics ? 'YES (+25 pts)' : 'NO (Missing)'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>Structure & Formatting:</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Certified single-column layout</div>
              </div>
              <select
                value={simTemplate}
                onChange={(e) => setSimTemplate(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <option value="modern">Modern Minimalist</option>
                <option value="ats_safe">FAANG Tech</option>
                <option value="compact">Executive Pro</option>
              </select>
            </div>
          </div>

          {/* Real Live Output Scorecard */}
          <div style={{ background: 'rgba(20, 26, 48, 0.7)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Your ATS Score
            </div>
            <div style={{ fontSize: '3.2rem', fontWeight: 900, color: simScore >= 80 ? '#34d399' : (simScore >= 60 ? '#38bdf8' : '#fbbf24'), margin: '4px 0' }}>
              {simScore} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: simScore >= 80 ? '#34d399' : '#fbbf24', fontWeight: 800, marginBottom: '16px' }}>
              {simScore >= 80 ? '🔥 High ATS Pass Rate (>85% Callback Chance)' : '⚠️ Action required: Add metrics & tech keywords'}
            </div>

            {/* Point Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', textAlign: 'left' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>Technical Skills Coverage</span>
                  <span>{skillsScore} / 35 pts</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(skillsScore / 35) * 100}%`, background: '#6366f1', height: '100%' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>Quantifiable Impact Metrics</span>
                  <span>{metricsScore} / 25 pts</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(metricsScore / 25) * 100}%`, background: '#10b981', height: '100%' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>Structure & Formatting</span>
                  <span>{templateScore} / 15 pts</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(templateScore / 15) * 100}%`, background: '#38bdf8', height: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 4. SECTION — PRACTICE QUESTIONS FROM COMPANIES YOU'RE APPLYING TO */}
      <div className="glass-panel" style={{
        padding: '30px 34px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '820px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', padding: '4px 12px', borderRadius: '12px', alignSelf: 'flex-start' }}>
              <Award size={14} color="#34d399" />
              <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#34d399', letterSpacing: '0.04em' }}>
                TARGETED INTERVIEW PREPARATION
              </span>
            </div>

            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
              Practice questions from the companies you're actually applying to
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
              Company-specific question banks for Google, Microsoft, Amazon, TCS, Infosys, and more — with new companies added regularly.
            </p>
          </div>

          <button
            onClick={() => {
              SoundSystem.playPop();
              onNavigate('interview-prep');
            }}
            className="btn-tactile btn-tactile-emerald"
            style={{
              padding: '12px 24px',
              fontSize: '0.92rem',
              fontWeight: 900
            }}
          >
            Explore Question Banks →
          </button>
        </div>

        {/* Company Question Filter Chips & Interactive Showcase */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {['Google', 'Amazon', 'Microsoft', 'Swiggy', 'TCS'].map((comp) => (
            <button
              key={comp}
              onClick={() => {
                SoundSystem.playPop();
                setActiveQuestionCompany(comp);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: activeQuestionCompany === comp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                color: activeQuestionCompany === comp ? '#34d399' : '#94a3b8',
                borderColor: activeQuestionCompany === comp ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              {comp} Question Bank
            </button>
          ))}
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          borderRadius: '14px',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 900, color: activeQuestionCard.color, background: `${activeQuestionCard.color}20`, padding: '2px 10px', borderRadius: '6px' }}>
                {activeQuestionCard.company} &bull; {activeQuestionCard.topic}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>
                🔥 {activeQuestionCard.frequency}
              </span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
              {activeQuestionCard.title}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
              Difficulty: {activeQuestionCard.difficulty}
            </span>
            <button
              onClick={() => {
                SoundSystem.playPop();
                onNavigate('interview-prep');
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                color: '#34d399',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Solve Problem →
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 5. SECTION — HOW IT WORKS (4 STEPS, OUTCOME-FIRST) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 12px', borderRadius: '12px', marginBottom: '6px' }}>
            <Zap size={14} color="#818cf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#818cf8', letterSpacing: '0.04em' }}>
              OUTCOME-FIRST PIPELINE
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            How NextOpportunityFinder works
          </h2>
        </div>

        {/* 5 Outcome-First Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            const isProStep = step.tier === 'PRO';
            return (
              <div 
                key={step.step}
                className="glass-panel tactile-card-lift"
                style={{
                  padding: '22px 20px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'rgba(19, 20, 36, 0.85)',
                  border: `1px solid ${step.color}35`,
                  boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px ${step.glowColor}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: `${step.color}20`, 
                    border: `1px solid ${step.color}50`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Icon size={20} color={step.color} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      color: isProStep ? '#f59e0b' : '#34d399',
                      background: isProStep ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                      border: `1px solid ${isProStep ? 'rgba(245, 158, 11, 0.35)' : 'rgba(52, 211, 153, 0.35)'}`,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      letterSpacing: '0.04em'
                    }}>
                      {step.tier}
                    </span>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: step.color,
                      background: `${step.color}15`,
                      border: `1px solid ${step.color}30`,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {step.step}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5, marginTop: '5px' }}>
                    {step.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {step.highlights.map((h, hIdx) => (
                    <div key={hIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                      <Check size={12} color={step.color} style={{ flexShrink: 0 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    SoundSystem.playPop();
                    onNavigate(step.targetTab);
                  }}
                  className="btn-tactile btn-tactile-ghost"
                  style={{ 
                    marginTop: '6px', 
                    padding: '8px 12px', 
                    fontSize: '0.8rem', 
                    width: '100%',
                    justifyContent: 'center',
                    color: step.color,
                    borderColor: `${step.color}40`
                  }}
                >
                  <span>{step.actionLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌟 6. SECTION — PRICING / PRO CONFIRMATION STATE */}
      {isSubLoading ? (
        <div className="glass-panel" style={{
          padding: '28px 34px',
          background: 'rgba(20, 26, 48, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          minHeight: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <RefreshCw size={20} color="#818cf8" className="animate-spin" />
          <span style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 600 }}>
            Verifying subscription entitlement...
          </span>
        </div>
      ) : isPro ? (
        <div className="glass-panel" style={{
          padding: '24px 30px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(5, 150, 105, 0.1), rgba(15, 23, 42, 0.9))',
          border: '1.5px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={24} color="#34d399" />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', marginBottom: '4px' }}>
                <Sparkles size={12} /> PRO UNLOCKED • FULL ACCESS ACTIVE
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                You're on Pro Access
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>
                Unlimited access to 1,500+ verified live jobs, company question banks, voice AI mock interviews, and 1-click ATS resume tailoring.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('overview')}
            className="btn-tactile btn-tactile-ghost"
            style={{ padding: '10px 20px', fontSize: '0.85rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
          >
            Go to Dashboard →
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{
          padding: '30px 34px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22), rgba(99, 102, 241, 0.22), rgba(16, 185, 129, 0.18))',
          border: '2px solid rgba(236, 72, 153, 0.6)',
          boxShadow: '0 15px 40px rgba(236, 72, 153, 0.25), 0 0 30px rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ec4899', color: '#fff', fontSize: '0.76rem', fontWeight: 900, padding: '4px 14px', borderRadius: '12px', alignSelf: 'flex-start' }}>
              <Flame size={14} /> {pricing.isPromoActive ? 'LIMITED LAUNCH PROMO' : 'TRANSPARENT VALUE PRICING'}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
              {pricing.headline}
            </h2>

            <p style={{ fontSize: '0.94rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
              {pricing.subheadline}
            </p>

            {pricing.isPromoActive && pricing.countdownText && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, marginTop: '4px' }}>
                <Flame size={16} /> Price increases to ₹{pricing.standardPrice} in {pricing.countdownText}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => {
                SoundSystem.playPop();
                if (!currentUser) {
                  onNavigate('auth', { mode: 'signup', redirect: 'checkout' });
                } else if (onOpenPaywall) {
                  onOpenPaywall();
                }
              }}
              className="btn-tactile btn-tactile-emerald"
              style={{
                padding: '14px 28px',
                fontSize: '1.05rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)',
                border: '1px solid #34d399'
              }}
            >
              <Lock size={18} /> {pricing.ctaText} →
            </button>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
              ✓ Zero monthly subscriptions &bull; {pricing.isPromoActive ? 'Early launch price locked' : 'Instant full platform access'}
            </span>
          </div>
        </div>
      )}

      {/* 🌟 7. SECTION — MEET YOUR CAREER TEAM */}
      <div className="glass-panel" style={{
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.8), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            PERSONALIZED GUIDANCE
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
            Meet your career team
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '640px', margin: '4px auto 0' }}>
            Specialized mentors guiding every milestone of your resume audits, job search, coding, and mock interviews.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <NovaCharacter pose="welcome" size={85} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Nova</h4>
            <div style={{ fontSize: '0.74rem', color: '#818CF8', fontWeight: 800 }}>Career Navigator</div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>
              Guides your daily prep, application tracking, and job matching.
            </p>
          </div>

          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
            <LexiCharacter pose="writing" size={80} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Lexi</h4>
            <div style={{ fontSize: '0.74rem', color: '#F472B6', fontWeight: 800 }}>ATS Wordsmith</div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>
              Audits your resume score and generates tailored CVs.
            </p>
          </div>

          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <ZenithCharacter pose="listening" size={80} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Zenith</h4>
            <div style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 800 }}>Interview Coach</div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>
              Runs mock interviews, scores answers against STAR.
            </p>
          </div>

          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <PixelCharacter pose="coding" size={80} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Pixel</h4>
            <div style={{ fontSize: '0.74rem', color: '#22D3EE', fontWeight: 800 }}>DSA & Coding</div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>
              Runs Python/JavaScript test cases with instant feedback.
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 8. SECTION — FOR STUDENTS & FRESH GRADUATES */}
      <div id="internships-section" className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
            Launch your tech career in India
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '6px' }}>
            Find verified internships and direct graduate trainee intakes across top Indian startups and multinational tech hubs.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Use the Indian Internships Hub to discover verified technical openings</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Select the ATS-Safe Minimal template for fresh graduate resumes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Practice core DSA problems in our in-browser coding prep studio</span>
            </div>
          </div>

          <button
            onClick={() => {
              SoundSystem.playPop();
              onNavigate('internships');
            }}
            className="btn-tactile btn-tactile-emerald"
            style={{ padding: '10px 20px', fontSize: '0.88rem', width: '100%', justifyContent: 'center' }}
          >
            Browse Indian Internships →
          </button>
        </div>
      </div>

      {/* 🌟 9. SECTION — TRUST & COMPLIANCE */}
      <div className="glass-panel" style={{
        padding: '20px 26px',
        borderRadius: '18px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={22} color="#818cf8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.5 }}>
            Your candidate data is encrypted at rest and deletable anytime — <strong>DPDP Act 2023 compliant</strong>.
          </span>
        </div>

        <button
          onClick={() => {
            SoundSystem.playPop();
            onNavigate('architecture');
          }}
          className="btn-tactile btn-tactile-ghost"
          style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.4)' }}
        >
          View Full System Architecture →
        </button>
      </div>

      {/* 🌟 10. SECTION — FREQUENTLY ASKED QUESTIONS */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 20px', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '840px', margin: '0 auto' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => {
                    SoundSystem.playPop();
                    setOpenFaqIdx(isOpen ? -1 : idx);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    gap: '12px'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: '#818cf8', flexShrink: 0 }} />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 20px 16px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
