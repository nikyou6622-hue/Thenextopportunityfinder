import React from 'react';
import { Sparkles, Bell, RefreshCw, Zap } from 'lucide-react';

export default function MobileHeader({ profile, onRefresh, loading }) {
  const name = profile?.name || "Candidate";

  return (
    <header className="mobile-header">
      <div className="mobile-brand">
        <img 
          src="/logo.png" 
          alt="NextOppr Logo" 
          style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }} 
        />
        <div>
          <div className="brand-title">NextOppr</div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
            {name.split(' ')[0]}'s Workspace
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={onRefresh}
          className="header-action-btn"
          title="Refresh Feed"
          style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
        >
          <RefreshCw size={16} />
        </button>
        <div style={{ position: 'relative' }}>
          <button className="header-action-btn" title="Notifications">
            <Bell size={16} />
          </button>
          <div style={{
            position: 'absolute', top: 6, right: 6, width: '6px', height: '6px',
            borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981'
          }} />
        </div>
      </div>
    </header>
  );
}
