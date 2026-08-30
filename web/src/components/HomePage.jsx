import React, { useState } from 'react';
import { 
  Rocket, 
  Sparkles, 
  FileText, 
  Search, 
  Briefcase, 
  BrainCircuit, 
  Code, 
  Mail, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Layers, 
  Building2, 
  GraduationCap, 
  Bookmark, 
  ChevronRight, 
  HelpCircle, 
  Zap, 
  Award, 
  Lock, 
  ChevronDown, 
  ExternalLink, 
  Target, 
  Clock, 
  Check, 
  X, 
  UserCheck, 
  Cpu, 
  LogIn, 
  SlidersHorizontal, 
  Flame, 
  Star,
  CheckSquare,
  Pause,
  RotateCcw,
  CheckSquare2,
  TrendingUp,
  Globe,
  CheckCheck
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import ArchifySystemMap from './ArchifySystemMap';
import SoundSystem from './characters/SoundEffects';
import QuestMap from './characters/QuestMap';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './characters/CharacterUniverse';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Build & Audit Your ATS Resume',
    badge: 'Stage 1: The Foundation',
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    icon: FileText,
    targetTab: 'profile',
    description: 'Import your PDF/DOCX resume or seed verified sample data. Edit directly on a live A4 sheet using 11 certified ATS templates with real-time 5-pillar scoring and page-overflow alerts.',
    actionLabel: 'Open Resume Studio →',
    highlights: ['11 Certified Industry Templates', 'Real-Time WYSIWYG Live Editing', '5-Pillar Canonical ATS Audit', 'PDF / Markdown / Print Export']
  },
  {
    step: '02',
    title: 'Discover 10,000+ Verified Openings',
    badge: 'Stage 2: Opportunity Matching',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    icon: Search,
    targetTab: 'jobs',
    description: 'Explore live technical opportunities matching your exact skills across Indian product unicorns (Swiggy, Razorpay, CRED), verified internships, and direct MNC portals (Google, Amazon, Meta).',
    actionLabel: 'Search Opportunities →',
    highlights: ['10,000+ Verified Live Postings', 'Indian Internships Hub 🇮🇳', 'Direct MNC Portals (Google, Amazon, Meta)', 'Zero Middleman Blackholes']
  },
  {
    step: '03',
    title: '1-Click Zero-Hallucination Tailoring',
    badge: 'Stage 3: Maximize Callbacks',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    icon: Sparkles,
    targetTab: 'tailor',
    description: 'Select any target opportunity to generate a job-specific customized CV. Aligns your experience to the job requisition without ever fabricating past companies, degrees, or unearned metrics.',
    actionLabel: 'Open Tailoring Hub →',
    highlights: ['Job-Specific Bullet Customization', 'Missing Technical Skill Gap Audit', 'Instant Match Score Delta', 'Zero-Hallucination Guarantee']
  },
  {
    step: '04',
    title: 'Practice with AI Mock Interview Coach',
    badge: 'Stage 4: Ace the Interview',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: BrainCircuit,
    targetTab: 'interview-prep',
    description: 'Simulate high-pressure technical and behavioral interviews with our real-time voice interviewer. Answers are transcribed live and evaluated against the STAR framework.',
    actionLabel: 'Launch Mock Interview →',
    highlights: ['Voice-to-Text Live Transcription', 'STAR Framework Scoring', 'Company-Specific Question Banks', 'Outcome Diagnosis Engine']
  },
  {
    step: '05',
    title: 'Coding Prep & Recruiter Direct Outreach',
    badge: 'Stage 5: Code & Connect',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.3)',
    icon: Code,
    targetTab: 'coding',
    description: 'Sharpen your coding skills in our in-browser Python, JS, and SQL Coding Prep studio with live test runner. Generate hyper-personalized cold outreach emails targeting hiring managers.',
    actionLabel: 'Launch Coding Prep →',
    highlights: ['In-Browser Python & JS Runner', 'Real-Time DSA Test Execution', 'Recruiter Cold Email Generator', 'Instant Interview Feedback']
  }
];

const CORPORATE_TARGETS = [
  { name: 'Google', domain: 'google.com', platform: 'Direct ATS', tier: 'Tier-1 FAANG' },
  { name: 'Microsoft', domain: 'microsoft.com', platform: 'Careers Portal', tier: 'Tier-1 FAANG' },
  { name: 'Amazon', domain: 'amazon.jobs', platform: 'Amazon.jobs API', tier: 'Tier-1 FAANG' },
  { name: 'Swiggy', domain: 'swiggy.com', platform: 'Ashby API', tier: 'Indian Unicorn' },
  { name: 'Meesho', domain: 'meesho.com', platform: 'Greenhouse API', tier: 'Indian Unicorn' },
  { name: 'PhonePe', domain: 'phonepe.com', platform: 'Greenhouse API', tier: 'Indian Unicorn' },
  { name: 'Razorpay', domain: 'razorpay.com', platform: 'Lever API', tier: 'Indian Unicorn' },
  { name: 'InMobi', domain: 'inmobi.com', platform: 'Lever API', tier: 'Global Tech' },
  { name: 'TCS', domain: 'tcs.com', platform: 'iBegin Portal', tier: 'IT Giant' },
  { name: 'Infosys', domain: 'infosys.com', platform: 'Global Careers', tier: 'IT Giant' }
];

const AUDIENCE_PERSONAS = [
  {
    id: 'students',
    label: '🎓 Students & Recent Graduates',
    title: 'Launch Your Tech Career in India',
    description: 'Find verified internships and direct graduate trainee intakes across top Indian startups and multinational tech hubs.',
    tips: [
      'Use the Indian Internships Hub to discover verified technical openings.',
      'Select the ATS-Safe Minimal template for fresh graduate resumes.',
      'Practice core DSA problems in our In-Browser Coding Prep studio.'
    ],
    ctaTab: 'internships',
    ctaText: 'Browse Indian Internships'
  },
  {
    id: 'professionals',
    label: '💼 Mid-Level & Senior Engineers',
    title: 'Optimize Callbacks & Fast-Track Senior Offers',
    description: '1-click tailored CVs for high-impact roles, voice STAR mock interviews, and direct recruiter messaging sequences.',
    tips: [
      'Tailor your resume for specific Big Tech roles with the Tailoring Hub.',
      'Simulate high-pressure system design interviews with the Mock Interview Coach.',
      'Audit your resume metrics score with our real-time 5-pillar rubric.'
    ],
    ctaTab: 'outreach',
    ctaText: 'Launch Recruiter Outreach'
  },
  {
    id: 'switchers',
    label: '🔄 Career Switchers & AI Practitioners',
    title: 'Pivot to High-Demand Tech Tracks',
    description: 'Structured roadmaps for pivoting into AI/ML, Full Stack Systems, or Cloud DevOps.',
    tips: [
      'Follow curated milestone roadmaps with video lectures in the Study Hub.',
      'Generate recruiter cold emails targeting startup founders with the Outreach Studio.',
      'Optimize resume keywords to transition past roles into technical equivalents.'
    ],
    ctaTab: 'roadmaps',
    ctaText: 'View Career Roadmaps'
  }
];

const FAQS = [
  {
    q: 'What is Next Opportunity Finder and how is it different from traditional job boards?',
    a: 'Next Opportunity Finder is an end-to-end AI career operating system. Unlike simple aggregators, it combines live opportunity discovery (with verified direct apply portals) with a real-time ATS live resume studio (11 templates), 1-click tailored CV generation, voice-powered AI mock interviews, an in-browser DSA coding sandbox, and recruiter outreach.'
  },
  {
    q: 'How does the Real-Time ATS Scoring work?',
    a: 'Our scoring algorithm uses a 5-pillar canonical rubric (Skills Coverage: 35pts, Impact Metrics & Action Verbs: 25pts, Contact Info: 15pts, Structure & Formatting: 15pts, Keyword Alignment: 10pts). As you type or edit your resume, the score dynamically updates with actionable recommendations.'
  },
  {
    q: 'How does the Zero-Hallucination standard protect my resume credibility?',
    a: 'Our AI resume tailoring engine strictly operates on candidate-provided facts. It optimizes grammar, phrasing, and keyword positioning, but will NEVER invent unearned metrics, fake company names, degrees, or unlisted credentials.'
  },
  {
    q: 'How is my data protected under the India DPDP Act?',
    a: 'Next Opportunity Finder is built with privacy by design. We support end-to-end field-level AES-256 Fernet encryption, user data portability, and the Right to Erasure (22-table cascade purge) in our Settings & Privacy Hub. Your data is never sold to third parties.'
  }
];

export default function HomePage({ onNavigate, currentUser, onTriggerCelebration, onOpenPaywall, isPro = false }) {
  const [selectedPersona, setSelectedPersona] = useState('students');
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // Signature Element State: Interactive ATS Live Benchmark Simulator
  const [simRole, setSimRole] = useState('fullstack');
  const [simSkillsCount, setSimSkillsCount] = useState(8);
  const [simHasMetrics, setSimHasMetrics] = useState(true);
  const [simTemplate, setSimTemplate] = useState('modern');

  // Calculate dynamic simulator score & breakdown
  const skillsScore = Math.min(35, Math.round(simSkillsCount * 3.2));
  const metricsScore = simHasMetrics ? 25 : 8;
  const templateScore = simTemplate === 'ats_safe' || simTemplate === 'modern' ? 15 : 12;
  const contactScore = 14;
  const keywordScore = 9;

  const simScore = Math.min(99, Math.max(40, skillsScore + metricsScore + templateScore + contactScore + keywordScore));

  const activePersonaObj = AUDIENCE_PERSONAS.find(p => p.id === selectedPersona) || AUDIENCE_PERSONAS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🌟 1. TOP ANNOUNCEMENT & AUTH QUICK-JUMP BAR */}
      <div className="glass-panel" style={{
        padding: '12px 20px',
        background: 'rgba(20, 26, 48, 0.75)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.png" 
            alt="Next Opportunity Finder" 
            style={{ width: '26px', height: '26px', objectFit: 'cover', borderRadius: '50%', background: 'transparent' }} 
          />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
            Next Opportunity Finder OS <strong style={{ color: '#fff' }}>v2.14.0 Live</strong> &bull; {isPro ? 'PRO UNLOCKED' : '5 Free Daily Scrapes Active'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isPro && (
            <button
              onClick={() => {
                SoundSystem.playPop();
                if (onOpenPaywall) onOpenPaywall();
              }}
              className="btn-tactile btn-tactile-emerald"
              style={{ padding: '7px 14px', fontSize: '0.78rem', fontWeight: 900 }}
            >
              <Zap size={13} /> Upgrade to Pro (₹99) →
            </button>
          )}

          {currentUser ? (
            <button
              onClick={() => {
                SoundSystem.playPop();
                onNavigate('overview');
              }}
              className="btn-tactile btn-tactile-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <Rocket size={14} /> Live Dashboard ({currentUser.full_name?.split(' ')[0] || 'User'}) →
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onNavigate('auth');
                }}
                className="btn-tactile btn-tactile-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <LogIn size={14} /> Sign In / Register
              </button>

              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onNavigate('overview');
                }}
                className="btn-tactile btn-tactile-ghost"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                Explore Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 2. HERO THESIS BANNER WITH DYNAMIC GLOW & STAT BADGES */}
      <div className="glass-panel" style={{
        padding: '40px 36px',
        background: 'radial-gradient(ellipse at 15% 10%, rgba(99, 102, 241, 0.25) 0%, rgba(20, 26, 48, 0.95) 60%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.45)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.25)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px'
      }}>
        <div className="homepage-hero-grid" style={{ display: 'grid', gap: '28px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '840px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '6px 16px', borderRadius: '24px', alignSelf: 'flex-start' }}>
              <Sparkles size={15} color="#a5b4fc" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.04em' }}>
                NEXT OPPORTUNITY FINDER &bull; PRIVACY-FIRST CAREER OPERATING SYSTEM
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.16, letterSpacing: '-0.03em' }}>
              Level Up Your Tech Career — From Zero to <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Offer</span>
            </h1>

            <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Optimize your ATS score with live A4 preview (11 certified templates), discover 10,000+ verified Indian & global tech roles, 1-click tailored CVs, voice AI mock interviews, and in-browser DSA coding sandbox.
            </p>

            {/* Live Key Metric Chips */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#34d399', fontWeight: 800 }}>
                <CheckCheck size={14} /> 3,155+ Active Verified Jobs
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#818cf8', fontWeight: 800 }}>
                <ShieldCheck size={14} /> 100% Zero-Hallucination Engine
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#fbbf24', fontWeight: 800 }}>
                <Award size={14} /> 11 Certified ATS Templates
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800 }}>
                <Zap size={14} /> 22ms Decoupled Match Speed
              </div>
            </div>

            {/* Tactile Quick Action CTAs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onNavigate('profile');
                }}
                className="btn-tactile btn-tactile-primary"
                style={{ padding: '12px 22px', fontSize: '0.9rem', fontWeight: 800 }}
              >
                <FileText size={16} /> Open ATS Resume Studio
              </button>

              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onNavigate('jobs');
                }}
                className="btn-tactile btn-tactile-ghost"
                style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 800 }}
              >
                <Search size={16} color="#38bdf8" /> Discover Live Jobs
              </button>

              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onNavigate('interview-prep');
                }}
                className="btn-tactile btn-tactile-emerald"
                style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 800 }}
              >
                <BrainCircuit size={16} /> AI Mock Interview
              </button>

              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onNavigate('coding');
                }}
                className="btn-tactile btn-tactile-amber"
                style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 800 }}
              >
                <Code size={16} /> Coding Prep (DSA)
              </button>
            </div>
          </div>

          {/* Nova Mascot Hero Companion */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <NovaCharacter pose="welcome" size={135} />
            <div style={{
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              borderRadius: '12px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#A5B4FC',
              textAlign: 'center'
            }}>
              Ready for Quest 1! 🚀
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 2A. CORPORATE & UNICORN TARGET WALL TICKER */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
          Direct ATS Integration & Live Target Monitoring Across Top Employers
        </div>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CORPORATE_TARGETS.map((comp, idx) => (
            <div key={idx} style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <Building2 size={16} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>{comp.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>✓ {comp.platform}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 2B. HIGH-CONVERTING ₹99 PRO ADVERTISEMENT BANNER */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.2))',
        border: '2px solid rgba(236, 72, 153, 0.6)',
        boxShadow: '0 15px 40px rgba(236, 72, 153, 0.25), 0 0 30px rgba(99, 102, 241, 0.3)',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ec4899', color: '#fff', fontSize: '0.72rem', fontWeight: 900, padding: '3px 12px', borderRadius: '12px', alignSelf: 'flex-start' }}>
            <Zap size={14} /> ONLY ₹99 ONE-TIME PAYMENT &bull; LIFETIME ACCESS
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
            Secure Your Dream Job — Unlock Thousands of Real MNC Interview Questions & Unlimited Scrapers!
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Run live scrapers across Google, Microsoft, Swiggy, Internshala, and 100+ MNC portals. Get instant access to <strong>5,000+ LeetCode company questions & solutions</strong>, 1-click ATS resume tailoring, and voice AI mock interviews for just ₹99.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => {
              SoundSystem.playPop();
              if (onOpenPaywall) onOpenPaywall();
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
            <Lock size={18} /> Unlock Pro for ₹99 →
          </button>
          <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
            ✓ 0 Monthly Subscriptions &bull; Lifetime Unlimited
          </span>
        </div>
      </div>

      {/* 🌟 3. DUOLINGO-STYLE INTERACTIVE QUEST ROADMAP PATH */}
      <QuestMap onNavigate={onNavigate} />

      {/* 🌟 4. STEP-BY-STEP WORKFLOW SYSTEM (CLEAR, NUMBERED & ACTIONABLE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 12px', borderRadius: '12px', marginBottom: '6px' }}>
              <Zap size={14} color="#818cf8" />
              <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#818cf8', letterSpacing: '0.04em' }}>
                5-STEP CAREER ACCELERATION PIPELINE
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              How Next Opportunity Finder Works
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: '4px 0 0' }}>
              A proven, sequential workflow that takes you from raw resume to verified applications and interview success.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 600 }}>
              5 Sequential Stages &bull; 100% Free
            </span>
          </div>
        </div>

        {/* 5 Distinct Workflow Step Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.step}
                className="glass-panel tactile-card-lift"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: 'rgba(19, 20, 36, 0.85)',
                  border: `1px solid ${step.color}35`,
                  boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px ${step.glowColor}`,
                  position: 'relative'
                }}
              >
                {/* Step Number & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '14px', 
                    background: `${step.color}20`, 
                    border: `1px solid ${step.color}50`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Icon size={22} color={step.color} />
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: step.color,
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}30`,
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    STAGE {step.step}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.55, marginTop: '6px' }}>
                    {step.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {step.highlights.map((h, hIdx) => (
                    <div key={hIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                      <Check size={12} color={step.color} style={{ flexShrink: 0 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Button */}
                <button
                  onClick={() => {
                    SoundSystem.playPop();
                    onNavigate(step.targetTab);
                  }}
                  className="btn-tactile btn-tactile-ghost"
                  style={{ 
                    marginTop: '8px', 
                    padding: '9px 14px', 
                    fontSize: '0.82rem', 
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

      {/* 🌟 5. MEET YOUR ORIGINAL CAREER CREW */}
      <div className="glass-panel" style={{
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.8), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Original Character Universe
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
            Meet Your AI Career Mentors
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '600px', margin: '4px auto 0' }}>
            Specialized companions guiding every milestone of your resume audits, job search, coding, and mock interviews.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          {/* Nova */}
          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <NovaCharacter pose="welcome" size={85} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Nova</h4>
            <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: 800 }}>Astro Career Navigator</div>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.35 }}>
              Guides your daily preparation quests, application tracking, and verified job matching.
            </p>
          </div>

          {/* Lexi */}
          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
            <LexiCharacter pose="writing" size={80} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Lexi</h4>
            <div style={{ fontSize: '0.72rem', color: '#F472B6', fontWeight: 800 }}>ATS Wordsmith Lynx</div>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.35 }}>
              Audits 5-pillar resume scores, highlights action verbs, and generates tailored CVs.
            </p>
          </div>

          {/* Zenith */}
          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <ZenithCharacter pose="listening" size={80} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Zenith</h4>
            <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 800 }}>Interview Sensei Orb</div>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.35 }}>
              Simulates high-pressure voice interviews and scores answers with STAR framework.
            </p>
          </div>

          {/* Pixel */}
          <div className="glass-panel tactile-card-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '18px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <PixelCharacter pose="coding" size={80} />
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>Pixel</h4>
            <div style={{ fontSize: '0.72rem', color: '#22D3EE', fontWeight: 800 }}>DSA & Coding Spark</div>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.35 }}>
              Runs Python & JavaScript algorithm test cases with instant runtime analytics.
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 6. SIGNATURE WORKBENCH: LIVE ATS BENCHMARK SIMULATOR */}
      <div id="ats-section" className="glass-panel" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.95), rgba(11, 15, 25, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', padding: '3px 10px', borderRadius: '12px', marginBottom: '6px' }}>
              <SlidersHorizontal size={13} color="#818cf8" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8', letterSpacing: '0.04em' }}>
                SIGNATURE INTERACTIVE WORKBENCH
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
              Real-Time ATS Benchmark Simulator
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Adjust parameters below to see how our 5-pillar canonical algorithm scores candidate resumes live.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'fullstack', label: 'Full Stack' },
              { id: 'aiml', label: 'AI / ML' },
              { id: 'devops', label: 'DevOps' }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  SoundSystem.playPop();
                  setSimRole(role.id);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: simRole === role.id ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                  color: simRole === role.id ? '#ffffff' : '#94a3b8'
                }}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          
          {/* Interactive Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                <span>Technical Skills Coverage:</span>
                <strong style={{ color: '#818cf8' }}>{simSkillsCount} / 15 Skills ({skillsScore} pts)</strong>
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
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>Quantifiable Metrics (% / Impact):</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Include numbers, SLAs, and performance deltas</div>
              </div>
              <button
                onClick={() => {
                  SoundSystem.playPop();
                  setSimHasMetrics(!simHasMetrics);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.76rem',
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
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>ATS Layout Template:</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Certified single-column layout</div>
              </div>
              <select
                value={simTemplate}
                onChange={(e) => setSimTemplate(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
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

          {/* Real-time 5-Pillar Scorecard */}
          <div style={{ background: 'rgba(20, 26, 48, 0.7)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '18px', padding: '22px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Pillar Canonical ATS Audit Score
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: simScore >= 80 ? '#34d399' : (simScore >= 60 ? '#38bdf8' : '#fbbf24'), margin: '4px 0' }}>
              {simScore} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: simScore >= 80 ? '#34d399' : '#fbbf24', fontWeight: 800, marginBottom: '14px' }}>
              {simScore >= 80 ? '🔥 High ATS Pass Rate (>85% Callback Chance)' : '⚠️ Action required: Add metrics & tech keywords'}
            </div>

            {/* 5-Pillar Breakdown Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.72rem', textAlign: 'left' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '2px' }}>
                  <span>Technical Skills Coverage</span>
                  <span>{skillsScore} / 35 pts</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '5px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(skillsScore / 35) * 100}%`, background: '#6366f1', height: '100%' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '2px' }}>
                  <span>Quantifiable Impact Metrics</span>
                  <span>{metricsScore} / 25 pts</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '5px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(metricsScore / 25) * 100}%`, background: '#10b981', height: '100%' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '2px' }}>
                  <span>Structure & ATS Formatting</span>
                  <span>{templateScore} / 15 pts</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '5px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(templateScore / 15) * 100}%`, background: '#38bdf8', height: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 7. AUDIENCE PERSONAS */}
      <div id="internships-section" className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
            Tailored For Every Stage of Your Career & Indian Internships
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {AUDIENCE_PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  SoundSystem.playPop();
                  setSelectedPersona(p.id);
                }}
                className={`btn-tactile ${selectedPersona === p.id ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            {activePersonaObj.title}
          </h4>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>
            {activePersonaObj.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
            {activePersonaObj.tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              SoundSystem.playPop();
              onNavigate(activePersonaObj.ctaTab);
            }}
            className="btn-tactile btn-tactile-emerald"
            style={{ padding: '10px 18px', fontSize: '0.84rem' }}
          >
            {activePersonaObj.ctaText} →
          </button>
        </div>
      </div>

      {/* 🌟 8. SYSTEM ARCHITECTURE & DPDP SECURITY VAULT */}
      <div id="security-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 12px', borderRadius: '12px', marginBottom: '6px' }}>
            <ShieldCheck size={14} color="#818cf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#818cf8', letterSpacing: '0.04em' }}>
              DPDP ACT 2023 SECURITY & ARCHITECTURE
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Candidate Privacy & System Topology
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#94A3B8', maxWidth: '640px', margin: '4px auto 0' }}>
            Explore our interactive end-to-end user journey, multi-agent engine, and 22-table cascade purge pipeline.
          </p>
        </div>

        <ArchifySystemMap onLaunchStudio={(tab) => onNavigate(tab)} />
      </div>

      {/* 🌟 9. FREQUENTLY ASKED QUESTIONS */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px', textAlign: 'center' }}>
          Frequently Asked Questions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '800px', margin: '0 auto' }}>
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
                    padding: '14px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    gap: '10px'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: '#818cf8', flexShrink: 0 }} />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 18px 14px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
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
