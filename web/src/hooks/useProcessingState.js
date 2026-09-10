import { useState, useEffect, useRef, useCallback } from 'react';
import apiFetch from '../lib/apiClient';

/**
 * useProcessingState Hook
 * Manages debouncing (400ms), min display duration (500ms), timeout, error handling,
 * tab backgrounding recovery, and backend telemetry logging for long-running actions.
 */
export function useProcessingState({
  actionType = 'generic_action',
  scope = 'inline',
  timeoutMs = 30000,
  debounceMs = 400,
  minDisplayMs = 500,
  onTimeout = null,
  onRetry = null
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldRenderUI, setShouldRenderUI] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const startTimeRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const minDisplayTimerRef = useRef(null);
  const uiShownTimestampRef = useRef(null);

  // Send wait telemetry to backend
  const logTelemetry = useCallback((outcome, durationMs) => {
    try {
      apiFetch('/api/telemetry/processing-wait-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          duration_ms: Math.max(0, Math.round(durationMs)),
          outcome: outcome, // 'success' | 'error' | 'timeout'
          scope: scope
        })
      }).catch(err => console.debug('Wait telemetry log notice:', err));
    } catch (e) {
      // Ignore background telemetry errors
    }
  }, [actionType, scope]);

  // Start processing action
  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setTimedOut(false);
    setErrorMessage(null);
    setShouldRenderUI(false);
    startTimeRef.current = performance.now();
    uiShownTimestampRef.current = null;

    // Debounce timer: Only render UI if pending past debounceMs
    debounceTimerRef.current = setTimeout(() => {
      setShouldRenderUI(true);
      uiShownTimestampRef.current = performance.now();
    }, debounceMs);

    // Timeout timer: Failsafe timeout transition
    timeoutTimerRef.current = setTimeout(() => {
      const durationMs = performance.now() - (startTimeRef.current || performance.now());
      setTimedOut(true);
      setIsProcessing(false);
      setShouldRenderUI(true);
      const timeoutSecs = Math.round(timeoutMs / 1000);
      const errText = `Action timed out after ${timeoutSecs} seconds. Please check your connection and try again.`;
      setErrorMessage(errText);
      logTelemetry('timeout', durationMs);
      if (onTimeout) onTimeout();
    }, timeoutMs);
  }, [debounceMs, timeoutMs, logTelemetry, onTimeout]);

  // Complete processing action successfully
  const stopProcessing = useCallback((overrideOutcome = 'success', overrideErr = null) => {
    const endTime = performance.now();
    const durationMs = startTimeRef.current ? (endTime - startTimeRef.current) : 0;

    // Clear timers
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    if (overrideOutcome === 'error') {
      setIsProcessing(false);
      setErrorMessage(overrideErr || 'Operation failed. Please try again.');
      setShouldRenderUI(true);
      logTelemetry('error', durationMs);
      return;
    }

    logTelemetry(overrideOutcome, durationMs);

    // Enforce minimum display duration if UI was already shown to prevent jarring flicker
    if (uiShownTimestampRef.current) {
      const uiShownDuration = endTime - uiShownTimestampRef.current;
      const remainingMinMs = Math.max(0, minDisplayMs - uiShownDuration);

      minDisplayTimerRef.current = setTimeout(() => {
        setIsProcessing(false);
        setShouldRenderUI(false);
        setErrorMessage(null);
        setTimedOut(false);
      }, remainingMinMs);
    } else {
      // Fast response (<debounceMs) — never show UI at all
      setIsProcessing(false);
      setShouldRenderUI(false);
      setErrorMessage(null);
      setTimedOut(false);
    }
  }, [minDisplayMs, logTelemetry]);

  // Handle mobile tab backgrounding / tab focus restore
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isProcessing && startTimeRef.current) {
        const elapsed = performance.now() - startTimeRef.current;
        if (elapsed >= timeoutMs) {
          stopProcessing('timeout', `Operation timed out while app was in background.`);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isProcessing, timeoutMs, stopProcessing]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (minDisplayTimerRef.current) clearTimeout(minDisplayTimerRef.current);
    };
  }, []);

  return {
    isProcessing,
    shouldRenderUI,
    timedOut,
    errorMessage,
    startProcessing,
    stopProcessing
  };
}
