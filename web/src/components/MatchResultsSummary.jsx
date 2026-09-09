import React from 'react';
import { 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MatchResultsSummary({
  matchSessionId,
  totalJobs = 0,
  totalInternships = 0,
  atsScore = null,
  onNavigateToDiscovery, // (type: 'jobs' | 'internships', sessionId: number) => void
  onOpenSettings,
  isMatching = false
}) {
  if (isMatching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          margin: '20px 0',
          backdropFilter: 'blur(12px)',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" style={{ animationDuration: '2s' }} />
          <span style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600 }}>
            Matching your resume with live opportunities...
          </span>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
          Running Agent 3 zero-hallucination skill set matching against active database listings.
        </p>
      </motion.div>
    );
  }

  const isZeroMatches = (totalJobs === 0 && totalInternships === 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 27, 75, 0.88) 100%)',
        border: '1px solid rgba(129, 140, 248, 0.35)',
        borderRadius: '20px',
        padding: '28px',
        margin: '24px 0',
        boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.25)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glow accent */}
      <div 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Resume Auto-Match Complete
            </h3>
            <p style={{ margin: '2px 0 0 0', color: '#94A3B8', fontSize: '13px' }}>
              Real-time Agent 3 verified opportunities matched to your profile
            </p>
          </div>
        </div>

        {atsScore !== null && (
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.15)', 
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '12px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target className="w-4 h-4 text-indigo-400" />
            <span style={{ color: '#CBD5E1', fontSize: '13px' }}>ATS Score:</span>
            <span style={{ color: '#818CF8', fontSize: '16px', fontWeight: 700 }}>{Math.round(atsScore)}%</span>
          </div>
        )}
      </div>

      {/* Main summary cards */}
      {!isZeroMatches ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Jobs Card */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateToDiscovery && onNavigateToDiscovery('jobs', matchSessionId)}
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  color: '#818CF8',
                  background: 'rgba(99, 102, 241, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  Full-Time Jobs
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {totalJobs}
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '6px 0 16px 0' }}>
                Matched with <strong style={{ color: '#F8FAFC' }}>{totalJobs}</strong> live jobs
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#818CF8', 
              fontSize: '13px', 
              fontWeight: 600 
            }}>
              <span>Explore Matched Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Internships Card */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateToDiscovery && onNavigateToDiscovery('internships', matchSessionId)}
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  color: '#34D399',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  Tech Internships
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {totalInternships}
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: '6px 0 16px 0' }}>
                Matched with <strong style={{ color: '#F8FAFC' }}>{totalInternships}</strong> internships
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#34D399', 
              fontSize: '13px', 
              fontWeight: 600 
            }}>
              <span>Explore Matched Internships</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      ) : (
        /* Explicit True-Zero State */
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.6)', 
          border: '1px solid rgba(239, 68, 68, 0.25)', 
          borderRadius: '16px', 
          padding: '24px',
          textAlign: 'center'
        }}>
          <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h4 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0' }}>
            No matches found yet
          </h4>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 16px 0', maxWidth: '480px', marginInline: 'auto' }}>
            We scored your resume against active opportunities, but couldn't find a direct match yet. Try broadening your technical skills or preferred location in Settings.
          </p>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Update Profile & Settings</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
