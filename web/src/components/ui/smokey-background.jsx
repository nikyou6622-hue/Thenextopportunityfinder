// SmokeyBackground UI component
import React from 'react';

export function SmokeyBackground({ color = '#4338CA', className = '' }) {
  return (
    <div 
      className={className} 
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(circle at 50% 20%, rgba(67, 56, 202, 0.25) 0%, rgba(15, 23, 42, 0) 70%)'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
          opacity: 0.15,
          filter: 'blur(80px)',
          animation: 'pulse 8s ease-in-out infinite alternate'
        }}
      />
    </div>
  );
}
