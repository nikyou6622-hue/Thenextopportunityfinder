import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { NovaCharacter, PixelCharacter, LexiCharacter, ZenithCharacter } from './characters/CharacterUniverse';
import apiFetch from '../lib/apiClient';

/**
 * ProcessingState Component
 * Single, reusable, accessible processing indicator across NextOpportunityFind.
 * 
 * Enforces Message Standard:
 * "[Action] — this may take a few seconds to a couple of minutes. Please wait."
 */
export default function ProcessingState({
  label = 'Processing request',
  scope = 'inline', // 'inline' | 'fullpage'
  timeoutMs = 30000,
  debounceMs = 400,
  minDisplayMs = 500,
  actionType = 'generic_action',
  character = 'nova', // 'nova' | 'lexi' | 'zenith' | 'pixel'
  isProcessing = true,
  error = null,
  onRetry = null,
  onTimeout = null,
  children = null
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [activeError, setActiveError] = useState(error);
  const [a11yAnnouncement, setA11yAnnouncement] = useState('');

  const startTimeRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const uiShownTimeRef = useRef(null);

  // Standardized Prompt Copy Requirement
  const fullWaitMessage = `${label} — this may take a few seconds to a couple of minutes. Please wait.`;

  // Log telemetry to backend
  const logTelemetry = (outcome, durationMs) => {
    try {
      apiFetch('/api/telemetry/processing-wait-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          duration_ms: Math.max(0, Math.round(durationMs)),
          outcome: outcome,
          scope: scope
        })
      }).catch(err => console.debug('Processing wait telemetry notice:', err));
    } catch (e) {
      // Ignore background telemetry errors
    }
  };

  useEffect(() => {
    setActiveError(error);
  }, [error]);

  useEffect(() => {
    if (isProcessing && !activeError && !timedOut) {
      startTimeRef.current = performance.now();
      uiShownTimeRef.current = null;

      // Debounce Timer: Don't show UI if response finishes in < debounceMs
      debounceTimerRef.current = setTimeout(() => {
        setShouldRender(true);
        uiShownTimeRef.current = performance.now();
        setA11yAnnouncement(fullWaitMessage);
      }, debounceMs);

      // Timeout Timer: Trigger error state on timeout
      timeoutTimerRef.current = setTimeout(() => {
        const duration = performance.now() - (startTimeRef.current || performance.now());
        setTimedOut(true);
        setShouldRender(true);
        const timeoutSecs = Math.round(timeoutMs / 1000);
        const errTxt = `Action timed out after ${timeoutSecs} seconds. Please check your network connection or try again.`;
        setActiveError(errTxt);
        setA11yAnnouncement(`Error: ${errTxt}`);
        logTelemetry('timeout', duration);
        if (onTimeout) onTimeout();
      }, timeoutMs);

    } else if (!isProcessing && startTimeRef.current && !activeError && !timedOut) {
      // Operation finished successfully
      const duration = performance.now() - startTimeRef.current;
      logTelemetry('success', duration);

      if (uiShownTimeRef.current) {
        const uiShownDuration = performance.now() - uiShownTimeRef.current;
        const remainingMinMs = Math.max(0, minDisplayMs - uiShownDuration);

        const timer = setTimeout(() => {
          setShouldRender(false);
          setA11yAnnouncement('Processing complete.');
        }, remainingMinMs);
        return () => clearTimeout(timer);
      } else {
        // Fast response (<debounceMs) — bypass UI completely
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
        setShouldRender(false);
      }
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [isProcessing, debounceMs, timeoutMs, minDisplayMs, fullWaitMessage, activeError, timedOut]);

  // Mascot Companion Character Mapper
  const renderCharacter = () => {
    switch (character) {
      case 'pixel': return <PixelCharacter pose="coding" size={90} />;
      case 'lexi': return <LexiCharacter pose="writing" size={90} />;
      case 'zenith': return <ZenithCharacter pose="listening" size={90} />;
      case 'nova':
      default:
        return <NovaCharacter pose="analyze" size={95} />;
    }
  };

  // If not processing, not timed out, no error, and should not render -> render children
  if (!isProcessing && !activeError && !timedOut && !shouldRender) {
    return children || null;
  }

  // If fast response resolved before debounce -> render children immediately
  if (!shouldRender && !activeError && !timedOut) {
    return children || null;
  }

  const isErrorState = Boolean(activeError || timedOut);

  // Content Card Component
  const cardContent = (
    <div
      role={isErrorState ? "alert" : "status"}
      aria-live="polite"
      aria-busy={isProcessing && !isErrorState ? "true" : "false"}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        background: isErrorState 
          ? 'linear-gradient(135deg, rgba(30, 15, 20, 0.95), rgba(45, 10, 15, 0.98))' 
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 27, 75, 0.94))',
        border: isErrorState ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '20px',
        boxShadow: isErrorState ? '0 15px 40px rgba(239, 68, 68, 0.25)' : '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.25)',
        backdropFilter: 'blur(16px)',
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Hidden Live Region Cue for Screen Readers */}
      <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {a11yAnnouncement}
      </span>

      {!isErrorState ? (
        <>
          {/* Character Animation */}
          <div style={{ marginBottom: '14px' }}>
            {renderCharacter()}
          </div>

          {/* Standard Copy Format */}
          <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px', lineHeight: 1.45 }}>
            {label}
          </h4>

          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0 0 16px', lineHeight: 1.5, maxWidth: '400px' }}>
            This may take a few seconds to a couple of minutes. Please wait.
          </p>

          {/* Animated Progress Bar */}
          <div style={{
            width: '240px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '10px'
          }}>
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              style={{
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #38bdf8, #34d399)',
                borderRadius: '999px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            <Clock size={13} color="#818cf8" />
            <span>Processing request securely...</span>
          </div>
        </>
      ) : (
        /* Error & Timeout State with Retry Action */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171'
          }}>
            <AlertCircle size={24} />
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f87171', margin: 0 }}>
            {timedOut ? 'Request Timed Out' : 'Action Failed'}
          </h4>

          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5, maxWidth: '400px' }}>
            {typeof activeError === 'string' ? activeError : (activeError?.message || 'An unexpected error occurred. Please try again.')}
          </p>

          {onRetry && (
            <button
              onClick={() => {
                setTimedOut(false);
                setActiveError(null);
                setShouldRender(false);
                if (onRetry) onRetry();
              }}
              className="btn-tactile btn-tactile-primary"
              style={{
                marginTop: '10px',
                padding: '10px 22px',
                fontSize: '0.86rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: '1px solid #f87171',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
              }}
            >
              <RefreshCw size={15} style={{ marginRight: '6px' }} />
              Retry Action
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Scope: Fullpage vs Inline Overlay
  if (scope === 'fullpage') {
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
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {cardContent}
      </div>
    );
  }

  // Default: Scope = 'inline'
  return (
    <div style={{ width: '100%', padding: '16px 0', boxSizing: 'border-box' }}>
      {cardContent}
    </div>
  );
}
