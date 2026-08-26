import React, { useMemo } from 'react';
import { 
  Home,
  LayoutDashboard, 
  User, 
  FileText,
  Search, 
  Bookmark, 
  Building2, 
  Sparkles, 
  Rocket, 
  Settings,
  X,
  Briefcase,
  GraduationCap,
  BrainCircuit,
  ChevronRight,
  HelpCircle,
  LogOut,
  LogIn,
  Code,
  Mail,
  Compass,
  BookOpen,
  Flame,
  Zap,
  Star,
  ShieldCheck,
  ShieldAlert,
  Award,
  MessageSquare,
  Activity,
  FileCheck,
  GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import SoundSystem from './characters/SoundEffects';
import { NovaCharacter } from './characters/CharacterUniverse';

const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 18,
    },
  },
};

// Logically Structured Navigation Groups
const NAV_GROUPS = [
  {
    title: 'CORE PLATFORM',
    items: [
      {
        id: 'home',
        label: 'Home & Quests',
        icon: Home,
        badge: 'START',
        badgeColor: '#6366F1'
      },
      {
        id: 'overview',
        label: 'Live Dashboard',
        icon: LayoutDashboard,
      },
    ]
  },
  {
    title: 'OPPORTUNITY DISCOVERY',
    items: [
      {
        id: 'jobs',
        label: 'Search Jobs',
        icon: Search,
        badge: 'LIVE',
        badgeColor: '#38BDF8'
      },
      {
        id: 'internships',
        label: 'India Internships 🇮🇳',
        icon: GraduationCap,
        badge: 'HOT',
        badgeColor: '#10B981'
      },
      {
        id: 'mnc',
        label: 'Big Tech Portals',
        icon: Building2,
      },
      {
        id: 'salary',
        label: 'Salary Benchmarks',
        icon: Flame,
        badge: 'CTC',
        badgeColor: '#F59E0B'
      },
      {
        id: 'saved',
        label: 'Saved Opportunities',
        icon: Bookmark,
      },
      {
        id: 'pipeline',
        label: 'My Applications',
        icon: Rocket,
      },
    ]
  },
  {
    title: 'AI CAREER ACCELERATION',
    items: [
      {
        id: 'profile',
        label: 'Resume & ATS Studio',
        icon: FileText,
        badge: '11 STYLES',
        badgeColor: '#818CF8'
      },
      {
        id: 'tailor',
        label: '1-Click CV Tailoring',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: '#EC4899'
      },
      {
        id: 'interview-prep',
        label: 'AI Mock Interview',
        icon: BrainCircuit,
        badge: 'VOICE',
        badgeColor: '#10B981'
      },
      {
        id: 'coding',
        label: 'Coding Prep',
        icon: Code,
        badge: 'RUN',
        badgeColor: '#06B6D4'
      },
      {
        id: 'outreach',
        label: 'Recruiter Outreach',
        icon: Mail,
      },
      {
        id: 'roadmaps',
        label: 'Career Roadmaps',
        icon: Compass,
      },
      {
        id: 'assessment',
        label: 'Skill Diagnostics',
        icon: Award,
        badge: 'QUIZ',
        badgeColor: '#38BDF8'
      },
      {
        id: 'community',
        label: 'Interview Debriefs',
        icon: MessageSquare,
        badge: 'NEW',
        badgeColor: '#EC4899'
      },
    ]
  },
  {
    title: 'SYSTEM & COMPLIANCE',
    items: [
      {
        id: 'status',
        label: 'System Status',
        icon: Activity,
        badge: 'LIVE',
        badgeColor: '#10B981'
      },
      {
        id: 'changelog',
        label: 'Changelog',
        icon: GitBranch,
      },
      {
        id: 'privacy',
        label: 'Privacy Policy (DPDP)',
        icon: ShieldCheck,
      },
      {
        id: 'terms',
        label: 'Terms of Service',
        icon: FileCheck,
      },
      {
        id: 'settings',
        label: 'Settings & Privacy',
        icon: Settings,
      },
      {
        id: 'auth',
        label: 'Candidate Sign In',
        icon: LogIn,
        badge: 'SECURE',
        badgeColor: '#34D399'
      },
    ]
  }
];

export default function Sidebar({ activeTab, setActiveTab, profile, currentUser, isOpen, onClose, onOpenPaywall, isPro = false, scrapesRemaining = 5, freeLimit = 5 }) {
  const userName = currentUser?.full_name || profile?.name || "Aditya Tamta";
  const userRole = currentUser?.target_role || profile?.past_roles?.[0]?.title || "Full Stack Engineer";
  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.email === 'adityanikt@gmail.com');

  const computedNavGroups = useMemo(() => {
    if (!isAdmin) return NAV_GROUPS;
    const adminGroup = {
      title: 'ADMINISTRATION',
      items: [
        {
          id: 'admin',
          label: 'Admin Control Center',
          icon: ShieldAlert,
          badge: 'MASTER',
          badgeColor: '#F59E0B'
        }
      ]
    };
    return [adminGroup, ...NAV_GROUPS];
  }, [isAdmin]);

  const handleItemClick = (id) => {
    SoundSystem.playPop();
    setActiveTab(id);
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Brand Header */}
      <motion.div 
        variants={itemVariants}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '4px 6px 14px', 
          marginBottom: '6px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
        }}
      >
        <div 
          onClick={() => handleItemClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0, overflow: 'hidden' }}
        >
          <img 
            src="/logo.png" 
            alt="Next Opportunity Finder" 
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'cover',
              borderRadius: '50%',
              background: 'transparent',
              padding: '0',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }} 
          />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ 
              fontSize: '0.96rem', 
              fontWeight: 900, 
              color: '#FFFFFF', 
              letterSpacing: '-0.02em', 
              lineHeight: 1.15,
              whiteSpace: 'nowrap'
            }}>
              Next Opportunity Finder
            </div>
            <div style={{ fontSize: '0.62rem', color: '#818CF8', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Find Your Next Step
            </div>
          </div>
        </div>

        {/* Close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-sidebar-close-btn"
            aria-label="Close Navigation Menu"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        )}
      </motion.div>

      {/* 2. User Profile Quick Badge */}
      <motion.div
        variants={itemVariants}
        onClick={() => handleItemClick('user-profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          marginBottom: '10px',
          borderRadius: '12px',
          background: activeTab === 'user-profile' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
          border: activeTab === 'user-profile' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          fontWeight: 900,
          color: '#FFFFFF',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userName}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userRole}
          </div>
        </div>
        <ChevronRight size={14} color="#64748B" />
      </motion.div>

      {/* Pro Upgrade / Scrape Counter Sidebar Card */}
      <motion.div
        variants={itemVariants}
        onClick={() => {
          if (!isPro && onOpenPaywall) onOpenPaywall();
        }}
        style={{
          padding: '10px 12px',
          marginBottom: '14px',
          borderRadius: '14px',
          background: isPro ? 'rgba(16, 185, 129, 0.15)' : 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))',
          border: isPro ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(236, 72, 153, 0.5)',
          cursor: isPro ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <Zap size={18} color={isPro ? '#34d399' : '#ec4899'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#ffffff' }}>
            {isPro ? 'PRO LIFETIME UNLOCKED' : `Free Scrapes: ${scrapesRemaining}/${freeLimit}`}
          </div>
          <div style={{ fontSize: '0.68rem', color: isPro ? '#34d399' : '#f472b6', marginTop: '1px' }}>
            {isPro ? '✓ Unlimited Access' : 'Click to Upgrade (₹99)'}
          </div>
        </div>
      </motion.div>

      {/* 2. Navigation Categories & Links */}
      <div 
        className="sidebar-scrollable-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          marginRight: '-6px',
          paddingRight: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {computedNavGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              padding: '0 10px',
              marginBottom: '6px'
            }}>
              {group.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive 
                        ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.06) 100%)' 
                        : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: '3px',
                          borderRadius: '0 4px 4px 0',
                          background: '#6366f1',
                          boxShadow: '0 0 10px #6366f1'
                        }} 
                      />
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? '#818cf8' : '#64748b'
                    }}>
                      <IconComponent size={15} />
                    </div>

                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: item.badgeColor 
                          ? `${item.badgeColor}22`
                          : 'rgba(99, 102, 241, 0.2)',
                        color: item.badgeColor || '#a5b4fc',
                        border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : 'rgba(99, 102, 241, 0.3)'}`
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. AI Assistant Footer Box */}
      <div 
        style={{
          padding: '10px 12px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0
        }}
      >
        <NovaCharacter pose="welcome" size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FFFFFF' }}>
            AI Career Assistant
          </div>
          <div style={{ fontSize: '0.68rem', color: '#10B981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Active & Ready
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="glazzed-sidebar desktop-sidebar-only" style={{ width: '240px', minWidth: '240px' }}>
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="mobile-sidebar-backdrop"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 998
              }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="mobile-sidebar-drawer"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                maxWidth: '85vw',
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 12px',
                zIndex: 999,
                overflowY: 'auto'
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
