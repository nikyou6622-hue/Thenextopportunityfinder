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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Discover', icon: Search },
    { id: 'profile', label: 'Resume', icon: FileText },
    { id: 'interview-prep', label: 'Interviews', icon: BrainCircuit },
    { id: 'pipeline', label: 'Pipeline', icon: Briefcase },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'overview');

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
              position: 'relative', 
              outline: 'none',
              minHeight: '48px',
              touchAction: 'manipulation'
            }}
          >
            <div className="mobile-nav-icon-wrap" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '30px',
              borderRadius: '14px',
              background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
              transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isActive ? 'scale(1.1)' : 'scale(1)'
            }}>
              <Icon size={19} color={isActive ? '#A5B4FC' : '#94a3b8'} />
            </div>
            <span className="mobile-nav-label" style={{ 
              color: isActive ? '#ffffff' : '#94a3b8',
              fontWeight: isActive ? 800 : 600,
              fontSize: '0.68rem',
              letterSpacing: '0.01em',
              transition: 'color 0.2s ease',
              marginTop: '2px'
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '2px',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#818cf8',
                boxShadow: '0 0 8px #818cf8'
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
