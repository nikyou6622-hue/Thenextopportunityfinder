import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  FileText, 
  Bookmark, 
  Clock, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Edit3,
  Award,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

import UserAvatar, { AVATAR_OPTIONS } from './UserAvatar';

export default function UserProfileView({ 
  profile, 
  applications = [], 
  savedJobs = [], 
  onNavigate, 
  onResetProfile 
}) {
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState(() => {
    try {
      return localStorage.getItem('nof_avatar_style') || 'initials';
    } catch {
      return 'initials';
    }
  });

  const handleSelectAvatarStyle = (styleId) => {
    setSelectedAvatarStyle(styleId);
    try {
      localStorage.setItem('nof_avatar_style', styleId);
    } catch {}
  };

  const userName = profile?.name || "Aditya Tamta";
  const userEmail = profile?.email || "aditya.tamta@dev.io";
  const userRole = profile?.past_roles?.[0]?.title || "Full Stack Engineer";
  const appCount = applications.length > 0 ? applications.length : 24;
  const interviewCount = applications.filter(a => a.status === 'interview_scheduled' || a.status === 'interview').length || 6;
  const offerCount = applications.filter(a => a.status === 'offer_received' || a.status === 'offered').length || 2;
  const atsScore = profile?.ats_score || 88;

  const menuItems = [
    { id: 'edit', label: 'Edit Profile', icon: Edit3, action: () => onNavigate('profile') },
    { id: 'resume', label: 'Resume & Documents', icon: FileText, badge: `${atsScore}/100 ATS`, action: () => onNavigate('profile') },
    { id: 'saved', label: 'Saved Jobs', icon: Bookmark, badge: `${savedJobs.length || 4} saved`, action: () => onNavigate('saved') },
    { id: 'history', label: 'Application History', icon: Clock, action: () => onNavigate('pipeline') },
    { 
      id: 'alerts', 
      label: 'Job Alerts', 
      icon: Bell, 
      isToggle: true, 
      toggleState: jobAlertsEnabled, 
      onToggle: () => setJobAlertsEnabled(!jobAlertsEnabled) 
    },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings, action: () => onNavigate('settings') },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, action: () => alert('Support: support@thenextopportunityfind.com') },
    { id: 'logout', label: 'Reset / Logout', icon: LogOut, isDanger: true, action: onResetProfile }
  ];

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(19, 20, 36, 0.95) 0%, rgba(26, 28, 48, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Avatar Display */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <UserAvatar 
            name={userName}
            avatarStyle={selectedAvatarStyle}
            size={84}
            glow={true}
          />
        </div>

        {/* Interactive Avatar Style Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {AVATAR_OPTIONS.map((opt) => {
            const isSelected = selectedAvatarStyle === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectAvatarStyle(opt.id)}
                title={opt.label}
                style={{
                  padding: '3px 8px',
                  borderRadius: '16px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#fff' : '#94a3b8',
                  fontSize: '0.68rem',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UserAvatar name={userName} avatarStyle={opt.id} size={16} glow={false} />
                <span>{opt.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
          {userName}
        </h2>
        <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '3px' }}>
          {userEmail}
        </div>
        <div style={{
          display: 'inline-block',
          background: 'rgba(124, 58, 237, 0.2)',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          borderRadius: '9999px',
          padding: '4px 14px',
          color: '#C4B5FD',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginTop: '10px'
        }}>
          {userRole}
        </div>

        {/* 3-Column Stats Row matching Screen 09 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#FFFFFF' }}>
              {appCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>
              Applications
            </div>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#A78BFA' }}>
              {interviewCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>
              Interviews
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#22C55E' }}>
              {offerCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>
              Offers
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu Options List */}
      <div style={{
        background: 'rgba(19, 20, 36, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={!item.isToggle ? item.action : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                minHeight: '48px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: item.isDanger ? '#FF5A5F' : '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: item.isDanger ? 'rgba(255, 90, 95, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} color={item.isDanger ? '#FF5A5F' : '#A78BFA'} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.badge && (
                  <span style={{
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    color: '#C4B5FD',
                    borderRadius: '9999px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}

                {item.isToggle ? (
                  <div 
                    onClick={item.onToggle}
                    style={{
                      width: '42px',
                      height: '24px',
                      borderRadius: '12px',
                      background: item.toggleState ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'background 0.25s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transform: item.toggleState ? 'translateX(18px)' : 'translateX(0)',
                      transition: 'transform 0.25s ease'
                    }} />
                  </div>
                ) : (
                  <ChevronRight size={16} color="#64748B" />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
