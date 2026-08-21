import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import SoundSystem from './SoundEffects';

export default function GamificationBar() {
  const [muted, setMuted] = useState(SoundSystem.isMuted());

  const handleToggleAudio = (e) => {
    e.stopPropagation();
    const isNowEnabled = SoundSystem.toggleSound();
    setMuted(!isNowEnabled);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
      {/* Tactile Audio Sound Toggle */}
      <button
        onClick={handleToggleAudio}
        className="gamify-sound-toggle"
        title={muted ? 'Enable Sound Effects' : 'Mute Sound Effects'}
        aria-label={muted ? 'Enable Sound Effects' : 'Mute Sound Effects'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: muted ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${muted ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.35)'}`,
          color: muted ? '#64748B' : '#34D399',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          padding: 0
        }}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    </div>
  );
}

