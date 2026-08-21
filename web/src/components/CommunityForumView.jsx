import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Tag, 
  Building2, 
  DollarSign, 
  Sparkles, 
  Search, 
  Filter, 
  Share2, 
  CheckCircle2, 
  Briefcase, 
  ExternalLink,
  Code,
  Calendar,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';

const SEEDED_EXPERIENCES = [
  {
    id: 'exp-1',
    company: 'Swiggy',
    role: 'SDE-2 (Backend)',
    tier: 'Tier 1 Unicorn / Product',
    date: 'August 2026',
    location: 'Bengaluru (Hybrid)',
    ctc: {
      total: 'INR 42.0 LPA',
      base: 'INR 34.0 LPA',
      bonus: 'INR 4.0 LPA (Variable)',
      esops: 'INR 4.0 LPA (ESOPs 4yr vest)'
    },
    rounds: [
      { round: 'Round 1: Machine Coding (90m)', detail: 'Design an in-memory Pub-Sub message broker with topic hierarchies and consumer groups. Emphasized thread-safety and clean SOLID design.' },
      { round: 'Round 2: DSA & Problem Solving (60m)', detail: '1 LC Hard (Sliding Window Maximum variation) + 1 LC Medium (Graph BFS shortest cycle).' },
      { round: 'Round 3: High-Level System Design (60m)', detail: 'Design Live Delivery Partner Geohash Dispatching & Real-Time Driver Allocation under 50k RPS.' }
    ],
    upvotes: 42,
    hasUpvoted: false,
    tags: ['Pub-Sub', 'Redis', 'Geohash', 'FastAPI', 'System Design']
  },
  {
    id: 'exp-2',
    company: 'Microsoft',
    role: 'Software Engineer (L60)',
    tier: 'Tier 1 Global FAANG+',
    date: 'July 2026',
    location: 'Hyderabad / Bengaluru',
    ctc: {
      total: 'INR 48.5 LPA',
      base: 'INR 28.0 LPA',
      bonus: 'INR 5.5 LPA (Target Bonus)',
      esops: 'USD $55,000 RSUs (Over 4 Years)'
    },
    rounds: [
      { round: 'Round 1: Online Assessment (90m)', detail: '3 coding questions on Codility (Tree LCA, Dynamic Programming Partition, Interval Scheduling).' },
      { round: 'Round 2: DSA & Concurrency (60m)', detail: 'Deep dive on Binary Trees + Multi-threaded thread-safe LRU Cache implementation.' },
      { round: 'Round 3: Low-Level System Design (60m)', detail: 'Design a Collaborative Document Version History Diff Engine (like Office 365 / Google Docs).' }
    ],
    upvotes: 68,
    hasUpvoted: false,
    tags: ['LRU Cache', 'Concurrency', 'Trees', 'C++', 'Python']
  },
  {
    id: 'exp-3',
    company: 'CRED',
    role: 'Backend Engineer (Payments)',
    tier: 'Tier 1 Unicorn',
    date: 'August 2026',
    location: 'Bengaluru',
    ctc: {
      total: 'INR 38.0 LPA',
      base: 'INR 30.0 LPA',
      bonus: 'INR 3.0 LPA',
      esops: 'INR 5.0 LPA ESOPs'
    },
    rounds: [
      { round: 'Round 1: System Design & Concurrency', detail: 'Idempotent Payment Gateway Orchestrator with distributed locks (Redis Redlock) and webhook reconciliation.' },
      { round: 'Round 2: DSA & Data Structures', detail: 'Trie-based auto-complete with frequency rankings + Top-K Heavy Hitters algorithm.' }
    ],
    upvotes: 35,
    hasUpvoted: false,
    tags: ['Idempotency', 'Payment Gateway', 'Redis', 'Trie', 'Kafka']
  },
  {
    id: 'exp-4',
    company: 'TCS (Digital / Prime Track)',
    role: 'Prime SDE',
    tier: 'Tier 3 Global IT Services',
    date: 'August 2026',
    location: 'Pan India (Bengaluru / Pune)',
    ctc: {
      total: 'INR 9.0 LPA',
      base: 'INR 8.4 LPA',
      bonus: 'INR 60k (Performance)',
      esops: 'N/A'
    },
    rounds: [
      { round: 'Round 1: TCS NQT Advanced Coding (120m)', detail: '2 Advanced Coding Problems (Matrix DP and Bit Manipulation) + Advanced Aptitude.' },
      { round: 'Round 2: Technical & Project Interview (45m)', detail: 'Core OS concepts (Paging, Semaphores vs Mutex), SQL Joins & Indexing, and resume project architecture.' }
    ],
    upvotes: 51,
    hasUpvoted: false,
    tags: ['TCS NQT', 'OS Concepts', 'SQL', 'Fresher Prime', 'Bit Manipulation']
  }
];

export default function CommunityForumView({ onNavigate, onTriggerCelebration }) {
  const [experiences, setExperiences] = useState(SEEDED_EXPERIENCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roundNotes, setRoundNotes] = useState('');

  const allTags = ['ALL', 'System Design', 'Redis', 'Pub-Sub', 'Concurrency', 'Payment Gateway', 'TCS NQT', 'Trees'];

  const handleUpvote = (id) => {
    SoundSystem.playPop();
    setExperiences(prev => prev.map(exp => {
      if (exp.id === id) {
        const nextState = !exp.hasUpvoted;
        return {
          ...exp,
          hasUpvoted: nextState,
          upvotes: nextState ? exp.upvotes + 1 : exp.upvotes - 1
        };
      }
      return exp;
    }));
  };

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'ALL' || exp.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      company: companyName,
      role: roleTitle,
      tier: 'Community Verified',
      date: 'Just Now',
      location: 'India',
      ctc: { total: 'Shared in Post', base: 'Competitive', bonus: '-', esops: '-' },
      rounds: [
        { round: 'Interview Experience Notes', detail: roundNotes || 'Technical and system design discussion with lead architect.' }
      ],
      upvotes: 1,
      hasUpvoted: true,
      tags: ['Community Post', 'Recent Interview']
    };

    setExperiences([newExp, ...experiences]);
    setNewPostModalOpen(false);
    setCompanyName('');
    setRoleTitle('');
    setRoundNotes('');
    SoundSystem.playSuccess();
    if (onTriggerCelebration) onTriggerCelebration();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'radial-gradient(130% 120% at 50% 0%, rgba(236, 72, 153, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#f472b6', fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <MessageSquare size={14} /> Peer Verified Technical Debriefs
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Indian Tech & Campus Interview Debriefs
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Read real, recent interview debriefs from Indian unicorns, Big Tech FAANG+, and IT MNCs. Learn exact rounds, machine coding problem statements, and transparent CTC breakdowns.
          </p>
        </div>

        <button 
          id="share-interview-experience-btn"
          onClick={() => setNewPostModalOpen(true)}
          className="btn-tactile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)'
          }}
        >
          <Sparkles size={16} /> Share Your Interview Debrief
        </button>
      </motion.div>

      {/* Search & Tag Filter Bar */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '14px 18px', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '8px 14px' }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company (e.g. Swiggy, TCS, CRED) or topic..."
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.86rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        {/* Tag Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {allTags.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                background: selectedTag === t ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${selectedTag === t ? 'rgba(236, 72, 153, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: selectedTag === t ? '#f472b6' : '#94a3b8',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Cards Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredExperiences.map(exp => (
          <div 
            key={exp.id}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '22px',
              padding: '28px 26px',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>{exp.company}</h3>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.72rem', fontWeight: 700 }}>
                    {exp.tier}
                  </span>
                </div>
                <span style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>{exp.role} • {exp.location}</span>
              </div>

              {/* Upvote Button */}
              <button 
                onClick={() => handleUpvote(exp.id)}
                className="btn-tactile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: exp.hasUpvoted ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${exp.hasUpvoted ? 'rgba(236, 72, 153, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: exp.hasUpvoted ? '#f472b6' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ThumbsUp size={15} /> {exp.upvotes}
              </button>
            </div>

            {/* CTC Breakdown Box */}
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '14px 18px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>TOTAL PACKAGE</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#34d399' }}>{exp.ctc.total}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>BASE SALARY</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>{exp.ctc.base}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>VARIABLE / BONUS</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1' }}>{exp.ctc.bonus}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>EQUITY / ESOPS</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1' }}>{exp.ctc.esops}</span>
              </div>
            </div>

            {/* Rounds List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {exp.rounds.map((r, rIdx) => (
                <div key={rIdx} style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', display: 'block', marginBottom: '4px' }}>{r.round}</span>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>{r.detail}</p>
                </div>
              ))}
            </div>

            {/* Tags & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {exp.tags.map((t, idx) => (
                  <span key={idx} style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onNavigate('coding')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Code size={13} /> Practice Similar in Coding Sandbox
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {newPostModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', padding: '32px', maxWidth: '520px', width: '100%', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc' }}>Share Your Technical Debrief</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Help other Indian developers prepare. Share what questions were asked, machine coding constraints, and tips.
            </p>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Swiggy, Flipkart, Zepto"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#f8fafc', fontSize: '0.86rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Role Target</label>
                <input 
                  type="text" 
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. SDE-1 Backend, Frontend Engineer"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#f8fafc', fontSize: '0.86rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Interview Round Details & Questions</label>
                <textarea 
                  value={roundNotes}
                  onChange={(e) => setRoundNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe the coding problem, system design prompt, or behavioral questions asked..."
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#f8fafc', fontSize: '0.84rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  style={{ padding: '8px 18px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', border: 'none', color: '#fff', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Publish Debrief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
