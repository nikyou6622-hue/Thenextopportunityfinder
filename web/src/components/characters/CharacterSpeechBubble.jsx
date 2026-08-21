import React from 'react';
import { motion } from 'framer-motion';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './CharacterUniverse';
import SoundSystem from './SoundEffects';

export default function CharacterSpeechBubble({
  character = 'nova', // 'nova' | 'pixel' | 'lexi' | 'zenith'
  pose = 'welcome',
  message,
  subtitle,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  size = 'medium', // 'small' | 'medium' | 'large'
  variant = 'indigo' // 'indigo' | 'emerald' | 'amber' | 'coral' | 'pink'
}) {
  const getCharComponent = () => {
    switch (character) {
      case 'pixel': return <PixelCharacter pose={pose} size={size === 'small' ? 65 : size === 'large' ? 110 : 85} />;
      case 'lexi': return <LexiCharacter pose={pose} size={size === 'small' ? 65 : size === 'large' ? 110 : 85} />;
      case 'zenith': return <ZenithCharacter pose={pose} size={size === 'small' ? 65 : size === 'large' ? 110 : 85} />;
      case 'nova':
      default:
        return <NovaCharacter pose={pose} size={size === 'small' ? 70 : size === 'large' ? 120 : 90} />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          border: '1px solid rgba(16, 185, 129, 0.35)',
          bg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.45), rgba(15, 23, 42, 0.95))',
          bubbleBg: 'rgba(16, 185, 129, 0.12)',
          bubbleBorder: 'rgba(16, 185, 129, 0.3)',
          accent: '#34D399',
          btnClass: 'btn-tactile-emerald'
        };
      case 'amber':
        return {
          border: '1px solid rgba(245, 158, 11, 0.35)',
          bg: 'linear-gradient(135deg, rgba(120, 53, 15, 0.45), rgba(15, 23, 42, 0.95))',
          bubbleBg: 'rgba(245, 158, 11, 0.12)',
          bubbleBorder: 'rgba(245, 158, 11, 0.3)',
          accent: '#FBBF24',
          btnClass: 'btn-tactile-amber'
        };
      case 'coral':
      case 'pink':
        return {
          border: '1px solid rgba(236, 72, 153, 0.35)',
          bg: 'linear-gradient(135deg, rgba(131, 24, 67, 0.45), rgba(15, 23, 42, 0.95))',
          bubbleBg: 'rgba(236, 72, 153, 0.12)',
          bubbleBorder: 'rgba(236, 72, 153, 0.3)',
          accent: '#F472B6',
          btnClass: 'btn-tactile-coral'
        };
      case 'indigo':
      default:
        return {
          border: '1px solid rgba(99, 102, 241, 0.35)',
          bg: 'linear-gradient(135deg, rgba(49, 46, 129, 0.45), rgba(15, 23, 42, 0.95))',
          bubbleBg: 'rgba(99, 102, 241, 0.12)',
          bubbleBorder: 'rgba(99, 102, 241, 0.3)',
          accent: '#818CF8',
          btnClass: 'btn-tactile-primary'
        };
    }
  };

  const v = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: v.bg,
        border: v.border,
        borderRadius: '20px',
        padding: '16px 20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Character Mascot */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {getCharComponent()}
      </div>

      {/* Speech Bubble Box */}
      <div 
        style={{ 
          flex: 1, 
          minWidth: 0,
          background: v.bubbleBg,
          border: `1px solid ${v.bubbleBorder}`,
          borderRadius: '16px',
          padding: '12px 18px',
          position: 'relative'
        }}
      >
        {/* Left Arrow Tail */}
        <div
          style={{
            position: 'absolute',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: '14px',
            height: '14px',
            background: v.bubbleBg,
            borderLeft: `1px solid ${v.bubbleBorder}`,
            borderBottom: `1px solid ${v.bubbleBorder}`
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.35 }}>
            {message}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px', lineHeight: 1.4 }}>
              {subtitle}
            </div>
          )}

          {actionLabel && (
            <div style={{ marginTop: '10px' }}>
              <button
                className={`btn-tactile ${v.btnClass}`}
                onClick={() => {
                  SoundSystem.playPop();
                  if (onAction) onAction();
                }}
                style={{
                  fontSize: '0.82rem',
                  padding: '8px 16px',
                  fontWeight: 800
                }}
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optional Dismiss Cross */}
      {dismissible && onDismiss && (
        <button
          onClick={() => {
            SoundSystem.playPop(350);
            onDismiss();
          }}
          aria-label="Dismiss tip"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
