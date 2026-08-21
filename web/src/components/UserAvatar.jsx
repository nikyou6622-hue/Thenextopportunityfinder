import React from 'react';
import { User, Bot, Sparkles, Code, Shield, Terminal } from 'lucide-react';

export const AVATAR_OPTIONS = [
  { id: 'initials', label: 'Gradient Initials', bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: null },
  { id: 'bot', label: 'AI Cyber Bot', bg: 'linear-gradient(135deg, #0ea5e9, #6366f1)', icon: Bot },
  { id: 'coder', label: 'Tech Developer', bg: 'linear-gradient(135deg, #10b981, #06b6d4)', icon: Code },
  { id: 'shield', label: 'Security Lead', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', icon: Shield },
  { id: 'terminal', label: 'Terminal Hacker', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', icon: Terminal }
];

export function getInitials(name = '') {
  if (!name || typeof name !== 'string') return 'AT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserAvatar({ 
  name = 'Aditya Tamta', 
  avatarStyle = 'initials', 
  size = 36, 
  glow = true,
  className = '',
  style = {}
}) {
  const initials = getInitials(name);
  const matchedOption = AVATAR_OPTIONS.find(o => o.id === avatarStyle) || AVATAR_OPTIONS[0];
  const IconComponent = matchedOption.icon;

  const fontSize = Math.max(11, Math.round(size * 0.42));
  const iconSize = Math.max(14, Math.round(size * 0.52));

  return (
    <div
      className={`user-avatar-badge ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: matchedOption.bg,
        boxShadow: glow ? `0 0 ${Math.round(size * 0.35)}px rgba(99, 102, 241, 0.45)` : 'none',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 900,
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      title={name}
    >
      {/* Background subtle mesh overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {IconComponent ? (
        <IconComponent size={iconSize} color="#ffffff" style={{ position: 'relative', zIndex: 2 }} />
      ) : (
        <span style={{ fontSize: `${fontSize}px`, letterSpacing: '0.02em', position: 'relative', zIndex: 2 }}>
          {initials}
        </span>
      )}
    </div>
  );
}
