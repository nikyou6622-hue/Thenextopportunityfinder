import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Sparkles, 
  BrainCircuit, 
  Code, 
  Mail, 
  CheckCircle2, 
  Star, 
  Lock, 
  ChevronRight, 
  Zap, 
  Play 
} from 'lucide-react';
import SoundSystem from './SoundEffects';
import { NovaCharacter } from './CharacterUniverse';

const QUEST_NODES = [
  {
    id: 'quest-1',
    step: 1,
    title: 'Profile Ignition',
    subtitle: 'Upload or live-edit ATS resume on A4 canvas',
    targetTab: 'profile',
    icon: FileText,
    color: '#6366F1',
    xpReward: 100,
    stars: 3,
    status: 'completed',
    tip: 'Your ATS foundation is live. Keep polishing high-impact bullet points!'
  },
  {
    id: 'quest-2',
    step: 2,
    title: 'ATS 5-Pillar Score',
    subtitle: 'Reach 85+ score in Skills, Metrics, Contact & Verbs',
    targetTab: 'profile',
    icon: Sparkles,
    color: '#38BDF8',
    xpReward: 150,
    stars: 3,
    status: 'completed',
    tip: 'Adding 2 more quantifiable metrics boosted your callback probability by 34%.'
  },
  {
    id: 'quest-3',
    step: 3,
    title: 'Discover Verified Roles',
    subtitle: 'Explore 10,000+ live jobs & Indian internships',
    targetTab: 'jobs',
    icon: Search,
    color: '#10B981',
    xpReward: 120,
    stars: 2,
    status: 'current',
    tip: '3 new High-Match roles at Razorpay, Swiggy & Google matched your profile!'
  },
  {
    id: 'quest-4',
    step: 4,
    title: '1-Click Resume Tailoring',
    subtitle: 'Generate targeted CV with before/after delta boost',
    targetTab: 'tailor',
    icon: Sparkles,
    color: '#EC4899',
    xpReward: 200,
    stars: 1,
    status: 'unlocked',
    tip: 'Tailoring matches your technical skills directly with recruiter job specs.'
  },
  {
    id: 'quest-5',
    step: 5,
    title: 'AI Mock Interview Studio',
    subtitle: 'Practice voice answers evaluated on STAR framework',
    targetTab: 'interview-prep',
    icon: BrainCircuit,
    color: '#8B5CF6',
    xpReward: 250,
    stars: 0,
    status: 'unlocked',
    tip: 'Practice makes confident. Master behavioral and technical rounds with Zenith.'
  },
  {
    id: 'quest-6',
    step: 6,
    title: 'Coding Prep',
    subtitle: 'Run Python/JS algorithms with instant test evaluation',
    targetTab: 'coding',
    icon: Code,
    color: '#06B6D4',
    xpReward: 300,
    stars: 0,
    status: 'unlocked',
    tip: 'Solve 2 Sum, LRU Cache, and SQL questions directly in the browser.'
  },
  {
    id: 'quest-7',
    step: 7,
    title: 'Recruiter Direct Outreach',
    subtitle: 'Generate targeted cold emails for hiring leads',
    targetTab: 'outreach',
    icon: Mail,
    color: '#F59E0B',
    xpReward: 350,
    stars: 0,
    status: 'unlocked',
    tip: 'Send direct connection pitches to engineering managers and founders.'
  }
];

export default function QuestMap({ onNavigate, onClaimXp }) {
  const [selectedQuest, setSelectedQuest] = useState(null);

  const handleNodeClick = (node) => {
    SoundSystem.playPop();
    setSelectedQuest(node);
  };

  return (
    <div className="quest-map-container" style={{ position: 'relative', width: '100%', padding: '24px 12px 48px' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '36px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7), rgba(15, 23, 42, 0.9))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '20px',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
          }}>
            <Zap size={22} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
              Your Career Acceleration Journey
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
              Complete checkpoints to master every stage of the tech hiring pipeline
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '20px',
          padding: '6px 14px',
          color: '#34D399',
          fontSize: '0.8rem',
          fontWeight: 800
        }}>
          <CheckCircle2 size={16} />
          <span>2 of 7 Milestones Cleared</span>
        </div>
      </div>

      {/* Stepping Stones Winding Path */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        position: 'relative',
        maxWidth: '560px',
        margin: '0 auto'
      }}>
        {/* Background Connecting SVG Line */}
        <svg
          style={{
            position: 'absolute',
            top: '40px',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: 'calc(100% - 80px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="10 10"
          />
        </svg>

        {QUEST_NODES.map((node, index) => {
          const isLeft = index % 2 === 1;
          const isCompleted = node.status === 'completed';
          const isCurrent = node.status === 'current';
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateX(${isLeft ? '-45px' : '45px'})`,
                transition: 'transform 0.3s ease'
              }}
            >
              {/* If Current Node, render Nova Mascot pointing at it */}
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  right: isLeft ? 'auto' : '-120px',
                  left: isLeft ? '-120px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}>
                  <NovaCharacter pose="welcome" size={75} />
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    borderRadius: '12px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
                  }}>
                    Next Step! 👇
                  </div>
                </div>
              )}

              {/* Stepping Stone Tactile Disc */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleNodeClick(node)}
                className={`quest-stepping-stone ${isCurrent ? 'active-pulse' : ''}`}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: isCompleted
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : isCurrent
                    ? `linear-gradient(135deg, ${node.color}, #4F46E5)`
                    : 'linear-gradient(135deg, #1E293B, #0F172A)',
                  border: `3px solid ${isCompleted ? '#34D399' : isCurrent ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)'}`,
                  boxShadow: isCompleted
                    ? '0 6px 0 #047857, 0 10px 20px rgba(16, 185, 129, 0.35)'
                    : isCurrent
                    ? `0 6px 0 #4338CA, 0 0 25px ${node.color}`
                    : '0 5px 0 #0B0F19',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  position: 'relative',
                  outline: 'none'
                }}
              >
                <Icon size={26} color={isCompleted ? '#FFFFFF' : isCurrent ? '#FFFFFF' : '#94A3B8'} />
                
                {/* Star Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '-12px',
                  display: 'flex',
                  gap: '2px',
                  background: '#0F172A',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      size={10}
                      fill={s <= node.stars ? '#FDE047' : '#334155'}
                      color={s <= node.stars ? '#FDE047' : '#334155'}
                    />
                  ))}
                </div>
              </motion.button>

              {/* Title & Step Label Below Disc */}
              <div 
                onClick={() => handleNodeClick(node)}
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxWidth: '160px',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: isCompleted ? '#34D399' : isCurrent ? '#FFFFFF' : '#E2E8F0',
                  lineHeight: 1.25,
                  textShadow: isCurrent ? `0 0 12px ${node.color}80` : 'none'
                }}>
                  {node.title}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  color: isCurrent ? '#A5B4FC' : '#94A3B8',
                  marginTop: '2px',
                  fontWeight: 700
                }}>
                  Step {node.step}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUEST DETAIL / START MODAL */}
      <AnimatePresence>
        {selectedQuest && (
          <div className="modal-backdrop-dark" onClick={() => setSelectedQuest(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content-dark"
              style={{
                maxWidth: '460px',
                padding: '26px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
                border: `1px solid ${selectedQuest.color}`,
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: selectedQuest.color,
                  letterSpacing: '0.05em'
                }}>
                  Step {selectedQuest.step} of 7
                </span>
                <button
                  onClick={() => setSelectedQuest(null)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#94A3B8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '6px' }}>
                {selectedQuest.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.45, marginBottom: '18px' }}>
                {selectedQuest.subtitle}
              </p>

              {/* Tip from mascot */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px',
                padding: '12px 14px',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <span>{selectedQuest.tip}</span>
              </div>

              <button
                className="btn-tactile btn-tactile-primary"
                onClick={() => {
                  SoundSystem.playSuccess();
                  if (onNavigate) onNavigate(selectedQuest.targetTab);
                  setSelectedQuest(null);
                }}
                style={{ width: '100%', padding: '12px', fontWeight: 800, fontSize: '0.95rem' }}
              >
                Jump In & Practice →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
