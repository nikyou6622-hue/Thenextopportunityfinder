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
  Activity,
  Check,
  CheckCircle2,
  Trash2,
  Briefcase,
  GraduationCap,
  FileCheck
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import GamificationBar from './characters/GamificationBar';
import SoundSystem from './characters/SoundEffects';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'system',
    icon: Sparkles,
    iconColor: '#818cf8',
    title: 'Welcome to Next Opportunity Finder! 🚀',
    message: 'Your AI Candidate Engine is active. Upload your resume to unlock 5-pillar ATS scoring.',
    timestamp: 'Just now',
    read: false,
    actionTab: 'profile'
  },
  {
    id: 'n2',
    type: 'jobs',
    icon: Briefcase,
    iconColor: '#34d399',
    title: '45+ New Tech Jobs Scanned Today',
    message: 'Fresh engineering openings scraped from Razorpay, Swiggy, and Google career portals.',
    timestamp: '2h ago',
    read: false,
    actionTab: 'jobs'
  },
  {
    id: 'n3',
    type: 'jobs',
    icon: GraduationCap,
    iconColor: '#fbbf24',
    title: 'India Internship Alert 🇮🇳',
    message: '12 new stipended software development internships added from Cuvette & Unstop.',
    timestamp: '4h ago',
    read: false,
    actionTab: 'internships'
  },
  {
    id: 'n4',
    type: 'system',
    icon: FileCheck,
    iconColor: '#38bdf8',
    title: 'Zero-Hallucination ATS Resume Tailoring',
    message: 'Role-based resume optimizer ready. Benchmark your resume against target MNC requirements.',
    timestamp: '1d ago',
    read: true,
    actionTab: 'tailor'
  },
  {
    id: 'n5',
    type: 'pro',
    icon: Zap,
    iconColor: '#a78bfa',
    title: 'Unlock Pro Subscription Power',
    message: 'Get unlimited AI resume rewrites and cold recruiter email sequence exports.',
    timestamp: '2d ago',
    read: true,
    actionTab: 'overview'
  }
];

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
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread' | 'jobs'
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const candidateName = currentUser?.full_name || profile?.name || "Aditya Tamta";
  const candidateEmail = currentUser?.email || profile?.email || "aditya.tamta@dev.io";
  const candidateRole = currentUser?.target_role || profile?.past_roles?.[0]?.title || "Full Stack Engineer";

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    SoundSystem.playSuccess();
  };

  const handleDismissNotif = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    SoundSystem.playPop();
  };

  const handleSelectNotif = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setNotificationDropdownOpen(false);
    SoundSystem.playPop();
    if (notif.actionTab) {
      setActiveTab(notif.actionTab);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationDropdownOpen(false);
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
            onClick={() => setActiveTab('architecture')} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            System Architecture
          </button>
        </div>

        {/* Right CTA Actions for Guests */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => {
              SoundSystem.playPop();
              setActiveTab('auth');
            }}
            className="btn-tactile btn-tactile-ghost"
            style={{
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f8fafc',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(99, 102, 241, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.35)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <LogIn size={15} color="#818cf8" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              SoundSystem.playPop();
              setActiveTab('profile');
            }}
            className="btn-tactile btn-tactile-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 800
            }}
          >
            <FileText size={15} /> Upload your resume — free
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

        {/* Notification Bell & Interactive Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              SoundSystem.playPop();
              setNotificationDropdownOpen(!notificationDropdownOpen);
            }}
            title="Notifications & Updates"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: notificationDropdownOpen ? 'rgba(99, 102, 241, 0.25)' : 'rgba(21, 28, 46, 0.7)',
              border: notificationDropdownOpen ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: notificationDropdownOpen ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={16} />
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: 900,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
              border: '1.5px solid #0f172a'
            }}>
              {unreadCount}
            </span>
          )}

          {/* Interactive Notification Popover */}
          {notificationDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: '-40px',
              width: '340px',
              maxWidth: '90vw',
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96))',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              borderRadius: '18px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.2)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              zIndex: 150,
              padding: '16px',
              boxSizing: 'border-box'
            }}>
              {/* Popover Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.25)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Check size={12} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
                {['all', 'unread', 'jobs'].map(f => (
                  <button
                    key={f}
                    onClick={() => setNotifFilter(f)}
                    style={{
                      background: notifFilter === f ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                      border: notifFilter === f ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
                      color: notifFilter === f ? '#ffffff' : '#94a3b8',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Notification Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {notifications
                  .filter(n => {
                    if (notifFilter === 'unread') return !n.read;
                    if (notifFilter === 'jobs') return n.type === 'jobs';
                    return true;
                  })
                  .map(n => {
                    const IconComp = n.icon || Sparkles;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleSelectNotif(n)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          background: n.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(99, 102, 241, 0.12)',
                          border: n.read ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(99, 102, 241, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: `${n.iconColor}20`,
                          border: `1px solid ${n.iconColor}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: n.iconColor,
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          <IconComp size={15} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                              {n.timestamp}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {n.message}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDismissNotif(n.id, e)}
                          title="Dismiss notification"
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, marginLeft: '2px' }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}

                {notifications.length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
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
