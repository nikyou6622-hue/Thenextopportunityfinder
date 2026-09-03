import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, AlertCircle } from 'lucide-react';
import apiFetch from '../lib/apiClient';

export default function ApplyButton({
  job,
  match,
  variant = 'emerald', // 'emerald' | 'purple' | 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'sm', // 'sm' | 'md' | 'lg'
  children,
  className = '',
  style = {},
  title = 'Apply directly on official employer portal',
  onApplied,
  onOpenFlowModal
}) {
  const [isTracking, setIsTracking] = useState(false);
  const currentJob = job?.job || job || match?.job || {};
  const linkStatus = currentJob.link_status || job?.link_status || match?.link_status || 'live';

  // Determine application ID for click tracking
  const appId = match?.id || job?.application_id || job?.id;

  // Resolve direct apply URL with fallback
  const compName = currentJob.company || currentJob.employer_name || '';
  const roleTitle = currentJob.title || currentJob.role_title || '';
  const searchFallback = `https://www.google.com/search?q=${encodeURIComponent(`${compName} ${roleTitle} careers apply`.trim())}`;
  const targetUrl = currentJob.apply_url_resolved || currentJob.apply_url || currentJob.url || (compName ? searchFallback : '#');

  const isDead = linkStatus === 'dead';
  const isStale = linkStatus === 'stale';

  const handleClick = async (e) => {
    e.stopPropagation();

    if (isDead) {
      alert(`Notice: The application link for "${roleTitle || 'this role'}" at ${compName || 'the company'} has been flagged as dead or inactive.`);
      return;
    }

    // If parent requested launching preview flow modal instead of direct tab open
    if (onOpenFlowModal) {
      onOpenFlowModal(currentJob, match);
      return;
    }

    // Fire click tracking to record candidate link-out telemetry
    if (appId && typeof appId === 'number') {
      setIsTracking(true);
      try {
        await apiFetch(`/api/applications/${appId}/track-click`, { method: 'POST' });
      } catch (err) {
        console.warn('Click tracking call non-fatal warning:', err);
      } finally {
        setIsTracking(false);
      }
    }

    // Pure Link-Out: Open verified external application in a new browser tab
    if (targetUrl && targetUrl !== '#') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    if (onApplied) {
      onApplied(currentJob, match);
    }
  };

  // Base styling per variant
  const getVariantStyles = () => {
    if (isDead) {
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#EF4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        cursor: 'not-allowed',
        opacity: 0.8
      };
    }

    if (isStale) {
      return {
        background: 'rgba(245, 158, 11, 0.15)',
        color: '#F59E0B',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        cursor: 'pointer'
      };
    }

    switch (variant) {
      case 'emerald':
        return {
          background: '#10B981',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer'
        };
      case 'purple':
        return {
          background: '#7C3AED',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer'
        };
      case 'primary':
        return {
          background: '#0EA5E9',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer'
        };
      case 'outline':
        return {
          background: 'rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(15, 23, 42, 0.2)',
          color: '#0F172A',
          cursor: 'pointer'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#38BDF8',
          border: 'none',
          cursor: 'pointer'
        };
      default:
        return {
          background: '#10B981',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { padding: '3px 8px', fontSize: '0.7rem' };
      case 'md':
        return { padding: '8px 18px', fontSize: '0.85rem' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '0.95rem' };
      case 'sm':
      default:
        return { padding: '5px 12px', fontSize: '0.74rem' };
    }
  };

  const finalTitle = isDead 
    ? 'Application link reported dead/inactive'
    : isStale 
    ? 'Application link reported outdated - exercise caution'
    : title;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDead}
      title={finalTitle}
      className={`apply-button-standardized ${className}`}
      style={{
        borderRadius: '9999px',
        fontWeight: 700,
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        transition: 'all 0.15s ease',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
    >
      {isDead ? (
        <>
          <AlertCircle size={size === 'md' ? 14 : 12} />
          <span>Link Broken</span>
        </>
      ) : isStale ? (
        <>
          <AlertTriangle size={size === 'md' ? 14 : 12} />
          <span>Apply (Outdated ⚠️)</span>
        </>
      ) : children ? (
        children
      ) : (
        <>
          <span>{isTracking ? 'Opening...' : 'Apply'}</span>
          <ExternalLink size={size === 'md' ? 14 : 12} />
        </>
      )}
    </button>
  );
}
