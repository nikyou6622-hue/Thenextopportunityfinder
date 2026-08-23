import React from 'react';
import { AlertTriangle, RefreshCw, Home, Sparkles } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("NextOpportunityFind Uncaught Error Boundary:", error, errorInfo);

    // Auto-recover from stale Vercel deployment chunk load errors
    if (error && (
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError'
    )) {
      const pageHasBeenReloaded = sessionStorage.getItem('nof_chunk_reloaded');
      if (!pageHasBeenReloaded) {
        sessionStorage.setItem('nof_chunk_reloaded', 'true');
        window.location.reload(true);
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('nof_active_tab');
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080b14',
          color: '#f8fafc',
          padding: '24px',
          boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: 'linear-gradient(135deg, rgba(17, 24, 48, 0.95), rgba(11, 15, 30, 0.98))',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(244, 63, 94, 0.15)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1.5px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#f43f5e'
            }}>
              <AlertTriangle size={32} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '3px 10px', borderRadius: '16px', marginBottom: '12px' }}>
              <Sparkles size={12} color="#f43f5e" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Application Recovery Shield
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px' }}>
              Something went unexpected
            </h2>
            
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px' }}>
              An isolated UI exception occurred. Your candidate data and saved sessions are protected.
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#fca5a5',
                overflowX: 'auto',
                marginBottom: '24px',
                maxHeight: '100px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}
              >
                <RefreshCw size={14} /> Reload Page
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Home size={14} /> Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
