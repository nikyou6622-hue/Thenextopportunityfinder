import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './CharacterUniverse';

const ROTATING_TIPS = [
  "Auditing 5 ATS core pillars (Skills, Metrics, Contact, Structure, Verbs)...",
  "Calibrating high-yield Indian unicorn & FAANG opportunity feeds...",
  "Synthesizing high-impact STAR framework interview scenarios...",
  "Calculating real-time CTC splits in Indian Rupees (₹ Base + Stocks)...",
  "Checking live job link health across Greenhouse, Lever, and Workday..."
];

export default function BrandedLoadingState({
  character = 'nova',
  title = 'Processing...',
  fullScreen = false
}) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % ROTATING_TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const getChar = () => {
    switch (character) {
      case 'pixel': return <PixelCharacter pose="coding" size={110} />;
      case 'lexi': return <LexiCharacter pose="writing" size={110} />;
      case 'zenith': return <ZenithCharacter pose="listening" size={110} />;
      case 'nova':
      default:
        return <NovaCharacter pose="analyze" size={120} />;
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 28px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 27, 75, 0.92))',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.25)',
        backdropFilter: 'blur(20px)',
        maxWidth: '460px',
        margin: '0 auto',
        userSelect: 'none'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        {getChar()}
      </div>

      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '8px' }}>
        {title}
      </h4>

      {/* Animated Loading Bar */}
      <div style={{
        width: '220px',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '14px'
      }}>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          style={{
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, #6366F1, #38BDF8, #10B981)',
            borderRadius: '999px'
          }}
        />
      </div>

      {/* Rotating Tip */}
      <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '0.8rem', color: '#94A3B8', maxWidth: '380px', lineHeight: 1.35 }}
          >
            {ROTATING_TIPS[tipIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(8, 11, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {content}
      </div>
    );
  }

  return content;
}
