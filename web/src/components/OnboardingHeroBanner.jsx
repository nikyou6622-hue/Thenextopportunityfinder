import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Building, 
  Compass, 
  Zap, 
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const POPULAR_SEARCHES = [
  "UI/UX Designer",
  "Developer",
  "Graphic Designer",
  "Product Manager",
  "Marketing",
  "Data Scientist",
  "Content Writer",
  "And more"
];

export default function OnboardingHeroBanner({ onStartSearching, onQuickSearch, onOpenFilters }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, rgba(19, 20, 36, 0.9) 0%, rgba(13, 14, 26, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '32px 28px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.12)'
      }}
    >
      {/* Ambient background glow & stars */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(255, 90, 95, 0.15) 50%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '32px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }} className="onboarding-grid">
        
        {/* Left: Main Copy & Features */}
        <div>
          {/* Brand Tag / Step Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF5A5F 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
            }}>
              <Search size={16} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              NextDream <span style={{ color: '#FF5A5F', fontWeight: 600, fontSize: '0.75rem', marginLeft: '4px' }}>Find. Apply. Grow.</span>
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            marginBottom: '14px'
          }}>
            Your search for <br />
            the next <span style={{ 
              background: 'linear-gradient(135deg, #FF5A5F 0%, #C084FC 50%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>dream job</span> is over 🚀
          </h1>

          <p style={{
            fontSize: '0.94rem',
            color: '#94A3B8',
            lineHeight: 1.55,
            marginBottom: '22px',
            maxWidth: '520px'
          }}>
            Find the perfect job, build your career and achieve your dreams with NextOppr career intelligence & real-time ATS matcher.
          </p>

          {/* 4 Key Feature Checklist */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px 16px',
            marginBottom: '26px'
          }} className="onboarding-features-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={13} color="#A78BFA" />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>Smart Job Search</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 90, 95, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={13} color="#FF5A5F" />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>Personalized Recommendations</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={13} color="#22C55E" />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>Verified Companies</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={13} color="#0EA5E9" />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>Track Applications</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button 
              onClick={onStartSearching}
              className="btn-gradient-coral-purple"
              style={{ padding: '12px 28px', fontSize: '0.92rem' }}
            >
              <Sparkles size={16} />
              Get Started
            </button>

            <button
              onClick={onStartSearching}
              className="btn-purple-action"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              Start Searching <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Popular Searches & Cosmic Celestial Art */}
        <div style={{
          background: 'rgba(11, 12, 22, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '320px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Cosmic Orb Atmosphere */}
          <div style={{ width: '100%', marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Popular Searches
              </span>
              <span style={{ fontSize: '0.7rem', color: '#7C3AED', fontWeight: 700 }}>
                Trending 🔥
              </span>
            </div>

            {/* Popular Search Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_SEARCHES.map((term, i) => (
                <button
                  key={i}
                  onClick={() => onQuickSearch && onQuickSearch(term)}
                  className="tag-pill-subtle"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: i === 0 ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: i === 0 ? '#FFFFFF' : '#CBD5E1',
                    borderColor: i === 0 ? '#7C3AED' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7C3AED';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = i === 0 ? '#7C3AED' : 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = i === 0 ? '#FFFFFF' : '#CBD5E1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Radiant Cosmic Planet with Orbit Ring */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 0 10px',
            width: '100%'
          }}>
            <div className="cosmic-planet-sphere">
              <div className="cosmic-orbit-ring" />
            </div>
          </div>

          {/* Bottom quick caption */}
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Live indexing from Greenhouse, Lever, Ashby, Internshala & MNCs
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
