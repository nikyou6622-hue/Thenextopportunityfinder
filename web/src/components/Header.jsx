import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu,
  Search, 
  Bell, 
  MessageSquare,
  X,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  FileText,
  Rocket,
  Shield,
  ShieldAlert,
  LogIn,
  Zap,
  Activity
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import GamificationBar from './characters/GamificationBar';
import SoundSystem from './characters/SoundEffects';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  profile, 
  currentUser,
  onLogout,
  onToggleMenu, 
  onDiscover, 
  loading,
  onOpenPaywall,
  isPro = false,
  scrapesRemaining = 5,
  freeLimit = 5
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const candidateName = currentUser?.full_name || profile?.name || "Aditya Tamta";
  const candidateEmail = currentUser?.email || profile?.email || "aditya.tamta@dev.io";
  const candidateRole = currentUser?.target_role || profile?.past_roles?.[0]?.title || "Full Stack Engineer";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabLabel = () => {
    switch (activeTab) {
      case 'home': return 'Home & Complete Platform Guide';
      case 'overview': return 'Executive Career Dashboard';
      case 'profile': return 'ATS Resume Studio & Optimizer';
      case 'jobs': return 'Verified Global Job Feed';
      case 'internships': return 'India Technical Internships Hub';
      case 'mnc': return 'Tier-1 MNC Career Portals';
      case 'tailor': return '1-Click Role Tailor Engine';
      case 'saved': return 'Saved Dream Opportunities';
      case 'pipeline': return 'Application Lifecycle Kanban';
      case 'interview-prep': return 'AI Voice & Behavioral Interview Coach';
      case 'coding': return 'In-Browser DSA & SQL Code Sandbox';
      case 'outreach': return 'Direct Recruiter Cold Email Studio';
      case 'salary': return 'Global CTC & Compensation Benchmark';
      case 'diagnosis': return 'AI Bottleneck Diagnosis & ATS Analytics';
      case 'roadmaps': return 'Career Roadmaps & Study Hub';
      case 'assessment': return 'Skill Diagnostics & Verified Badges';
      case 'community': return 'Indian Tech & Campus Interview Debriefs';
      case 'status': return 'Live Scraper & System Telemetry';
      case 'changelog': return 'Official Product Changelog';
      case 'privacy': return 'Privacy Policy & DPDP Disclosures';
      case 'terms': return 'Terms of Service & Guardrails';
      case 'settings': return 'Settings & Privacy';
      case 'auth': return 'Sign In / Candidate Account';
      default: return 'Home & Complete Platform Guide';
    }
  };

  if (!currentUser) {
    return (
      <header className="glazzed-header" style={{ position: 'sticky', top: 0, zIndex: 90 }}>
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="Thenextopportunity — AI Career Engine"
        >
          <img 
            src="/logo.png" 
            alt="Next Opportunity Finder" 
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'cover',
              borderRadius: '50%',
              background: 'transparent',
              padding: '0',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              display: 'block'
            }} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Next Opportunity Finder
            </span>
            <span 
              className="desktop-only-badge"
              style={{ 
                fontSize: '0.62rem', 
                fontWeight: 800, 
                background: 'rgba(99, 102, 241, 0.2)', 
                color: '#818cf8', 
                border: '1px solid rgba(99, 102, 241, 0.4)', 
                padding: '2px 7px', 
                borderRadius: '8px',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap'
              }}
            >
              AI CAREER ENGINE
            </span>
          </div>
        </div>

        {/* Guest Public Nav Links (Desktop) */}
        <div className="guest-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <button 
            onClick={() => {
              setActiveTab('home');
              setTimeout(() => {
                const el = document.getElementById('ats-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            ATS Resume Engine
          </button>

          <button 
            onClick={() => {
              setActiveTab('home');
              setTimeout(() => {
                const el = document.getElementById('mnc-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            Company Question Bank
          </button>

          <button 
            onClick={() => {
              setActiveTab('home');
              setTimeout(() => {
                const el = document.getElementById('internships-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            India Internships
          </button>

          <button 
            onClick={() => {
              setActiveTab('home');
              setTimeout(() => {
                const el = document.getElementById('security-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            DPDP Security
          </button>
        </div>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isPro ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.75rem', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={13} /> PRO LIFETIME
            </div>
          ) : (
            <button
              onClick={() => {
                SoundSystem.playPop();
                if (onOpenPaywall) onOpenPaywall();
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))',
                border: '1px solid #ec4899',
                color: '#f472b6',
                fontSize: '0.76rem',
                fontWeight: 900,
                padding: '5px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={13} color="#ec4899" />
              <span>Scrapes: {scrapesRemaining}/{freeLimit}</span>
              <span style={{ color: '#34d399', marginLeft: '4px' }}>Upgrade ₹99</span>
            </button>
          )}

          <GamificationBar />

          <button
            onClick={() => {
              SoundSystem.playPop();
              setActiveTab('auth');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={15} color="#818cf8" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              SoundSystem.playSuccess();
              setActiveTab('auth');
            }}
            className="btn-next-primary"
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Sparkles size={15} />
            <span>Get Started Free</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="glazzed-header" style={{ position: 'relative', zIndex: 90 }}>
      {/* Left: Hamburger + Logo + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button 
          onClick={() => {
            SoundSystem.playPop();
            onToggleMenu();
          }}
          className="header-hamburger-btn btn-tactile btn-tactile-ghost"
          aria-label="Toggle Navigation Menu"
          style={{ 
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            color: '#94a3b8', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0
          }}
        >
          <Menu size={19} />
        </button>

        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
          title="Thenextopportunity — Find Your Next Step"
        >
          <img 
            src="/logo.png" 
            alt="Next Opportunity Finder" 
            style={{
              width: '34px',
              height: '34px',
              objectFit: 'cover',
              borderRadius: '50%',
              background: 'transparent',
              padding: '0',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
              display: 'block'
            }} 
          />
        </div>

        <h1 className="header-page-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getTabLabel()}
        </h1>
      </div>

      {/* Middle: Pill-shaped Search Bar (Desktop) */}
      <div className="header-desktop-search" style={{ position: 'relative', width: '320px', maxWidth: '30vw' }}>
        <input 
          type="text" 
          placeholder="Search opportunities, skills..." 
          style={{
            width: '100%',
            padding: '9px 40px 9px 16px',
            background: 'rgba(19, 25, 41, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            color: '#f8fafc',
            fontSize: '0.82rem',
            outline: 'none',
            backdropFilter: 'blur(12px)',
            transition: 'border-color 0.2s ease'
          }}
        />
        <Search 
          size={15} 
          style={{ 
            position: 'absolute', 
            right: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#64748b',
            cursor: 'pointer'
          }} 
        />
      </div>

      {/* Right: Gamification Bar, Notifications, and Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        
        {/* Audio Control */}
        <GamificationBar />

        {/* Mobile Search Icon Toggle */}
        <button
          onClick={() => {
            SoundSystem.playPop();
            setMobileSearchOpen(!mobileSearchOpen);
          }}
          className="header-mobile-search-toggle"
          aria-label="Toggle Search Bar"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(21, 28, 46, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          {mobileSearchOpen ? <X size={16} /> : <Search size={16} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              SoundSystem.playPop();
              setActiveTab('overview');
            }}
            title="Notifications"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(21, 28, 46, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <Bell size={16} />
          </button>
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#3b82f6',
            color: '#ffffff',
            fontSize: '0.6rem',
            fontWeight: 800,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
          }}>
            6
          </span>
        </div>

        {/* Tailor / Quick AI Studio Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setActiveTab('tailor')}
            title="AI Tailoring Hub"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(21, 28, 46, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={16} />
          </button>
        </div>

        {/* Profile User Pill & Interactive Popover */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          
          <div 
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 8px 3px 4px',
              borderRadius: '24px',
              background: userDropdownOpen ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: userDropdownOpen ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <UserAvatar 
              name={candidateName}
              size={32}
            />
            <div className="header-profile-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.15 }}>
                  {candidateName}
                </span>
                {(currentUser?.is_admin || currentUser?.email === 'adityanikt@gmail.com') && (
                  <span style={{ fontSize: '0.6rem', background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '1px 5px', borderRadius: '6px', fontWeight: 900 }}>
                    ADMIN
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 500 }}>
                {candidateRole}
              </span>
            </div>
            <ChevronDown size={14} color="#94a3b8" style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </div>

          {/* Interactive User Menu Popover */}
          {userDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.95), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)',
              backdropFilter: 'blur(20px)',
              zIndex: 120,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              
              {/* User Overview Header */}
              <div style={{ padding: '4px 6px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{candidateName}</span>
                  {(currentUser?.is_admin || currentUser?.email === 'adityanikt@gmail.com') && (
                    <span style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '6px', fontWeight: 900 }}>
                      ADMIN
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidateEmail}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, marginTop: '4px' }}>
                  <Shield size={10} /> Active Candidate Session
                </div>
              </div>

              {/* Admin Jump Link */}
              {(currentUser?.is_admin || currentUser?.email === 'adityanikt@gmail.com') && (
                <button
                  onClick={() => { setActiveTab('admin'); setUserDropdownOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fbbf24',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <ShieldAlert size={14} color="#f59e0b" /> Admin Control Center
                </button>
              )}

              {/* Navigation Actions */}
              <button
                onClick={() => { setActiveTab('profile'); setUserDropdownOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={14} color="#818cf8" /> Resume & ATS Studio
              </button>

              <button
                onClick={() => { setActiveTab('pipeline'); setUserDropdownOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Rocket size={14} color="#38bdf8" /> My Applications
              </button>

              <button
                onClick={() => { setActiveTab('status'); setUserDropdownOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Activity size={14} color="#10b981" /> System Health & Status
              </button>

              <button
                onClick={() => { setActiveTab('auth'); setUserDropdownOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogIn size={14} /> Switch Account / Sign Up
              </button>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '2px 0' }} />

              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  setUserDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                <LogOut size={14} /> Sign Out
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Mobile Search Bar Expansion */}
      {mobileSearchOpen && (
        <div className="header-mobile-search-bar" style={{
          width: '100%',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(14, 19, 34, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '8px',
          zIndex: 95
        }}>
          <input 
            type="text" 
            placeholder="Search opportunities, roles, skills..." 
            autoFocus
            style={{
              flex: 1,
              padding: '8px 14px',
              background: 'rgba(21, 28, 46, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#f8fafc',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      )}
    </header>
  );
}
