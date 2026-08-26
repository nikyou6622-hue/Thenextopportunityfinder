import React from 'react';
import { 
  Home,
  Search, 
  FileText, 
  BrainCircuit, 
  Briefcase
} from 'lucide-react';
import SoundSystem from './characters/SoundEffects';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const bottomItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Discover', icon: Search },
    { id: 'profile', label: 'Resume', icon: FileText },
    { id: 'interview-prep', label: 'Interviews', icon: BrainCircuit },
    { id: 'pipeline', label: 'Pipeline', icon: Briefcase },
  ];

  return (
    <nav 
      className="mobile-bottom-nav" 
      aria-label="Mobile Navigation Bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '64px',
        paddingTop: '4px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
        background: 'rgba(10, 14, 26, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.6), 0 -2px 10px rgba(124, 58, 237, 0.15)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
        contain: 'layout style',
        touchAction: 'none'
      }}
    >
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'overview' && (activeTab === 'home' || activeTab === 'overview'));

        return (
          <button
            key={item.id}
            onClick={() => {
              SoundSystem.playPop(isActive ? 620 : 480);
              setActiveTab(item.id);
            }}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative', 
              outline: 'none',
              minHeight: '48px',
              padding: '2px 0',
              touchAction: 'manipulation'
            }}
          >
            {/* Icon Container with glowing background pill */}
            <div className="mobile-nav-icon-wrap" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '30px',
              borderRadius: '16px',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(255, 90, 95, 0.25) 0%, rgba(124, 58, 237, 0.3) 100%)' 
                : 'transparent',
              border: isActive ? '1px solid rgba(255, 90, 95, 0.4)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 16px rgba(124, 58, 237, 0.35)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isActive ? 'scale(1.08)' : 'scale(1)'
            }}>
              <Icon size={19} color={isActive ? '#FFFFFF' : '#94A3B8'} />
            </div>

            {/* Label */}
            <span className="mobile-nav-label" style={{ 
              color: isActive ? '#FFFFFF' : '#94A3B8',
              fontWeight: isActive ? 800 : 600,
              fontSize: '0.68rem',
              letterSpacing: '0.01em',
              transition: 'color 0.2s ease',
              marginTop: '1px'
            }}>
              {item.label}
            </span>

            {/* Top Active Dot Indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '0px',
                width: '16px',
                height: '3px',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #FF5A5F 0%, #A78BFA 100%)',
                boxShadow: '0 0 10px #A78BFA'
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
