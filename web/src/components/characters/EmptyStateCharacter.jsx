import React from 'react';
import { motion } from 'framer-motion';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './CharacterUniverse';
import SoundSystem from './SoundEffects';

export default function EmptyStateCharacter({
  character = 'nova',
  pose = 'oops',
  title = 'Nothing here yet!',
  description = 'Start exploring opportunities or build your profile to see tailored recommendations.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) {
  const getCharacter = () => {
    switch (character) {
      case 'pixel': return <PixelCharacter pose={pose} size={130} />;
      case 'lexi': return <LexiCharacter pose={pose} size={130} />;
      case 'zenith': return <ZenithCharacter pose={pose} size={130} />;
      case 'nova':
      default:
        return <NovaCharacter pose={pose} size={140} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        maxWidth: '520px',
        margin: '0 auto',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px dashed rgba(255, 255, 255, 0.12)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        {getCharacter()}
      </div>

      <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '24px', maxWidth: '400px' }}>
        {description}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && (
          <button
            className="btn-tactile btn-tactile-primary"
            onClick={() => {
              SoundSystem.playPop();
              if (onAction) onAction();
            }}
            style={{ padding: '10px 22px', fontSize: '0.88rem', fontWeight: 800 }}
          >
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && (
          <button
            className="btn-tactile btn-tactile-ghost"
            onClick={() => {
              SoundSystem.playPop();
              if (onSecondaryAction) onSecondaryAction();
            }}
            style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
