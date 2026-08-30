import React, { useState, useEffect, useMemo } from 'react';
import apiFetch from '../lib/apiClient';
import { 
  ShieldAlert, 
  Users, 
  Briefcase, 
  Search, 
  BrainCircuit, 
  FileText, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Lock, 
  Sparkles, 
  Clock, 
  Eye, 
  Send, 
  ShieldCheck, 
  Layers, 
  ExternalLink, 
  SlidersHorizontal,
  FileCheck,
  Building2,
  Code,
  Terminal,
  Database,
  Server,
  Zap,
  Flame,
  Radio,
  UserCheck,
  Check,
  X,
  ChevronRight,
  Filter,
  ArrowRight,
  KeyRound,
  LogIn,
  AlertTriangle,
  FileSpreadsheet,
  Ban,
  UserPlus,
  Globe
} from 'lucide-react';
import SoundSystem from './characters/SoundEffects';
import UserAvatar from './UserAvatar';

export default function AdminDashboard({ currentUser, onAuthSuccess, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('scraper'); // 'scraper' | 'system' | 'users' | 'deploy' | 'metrics' | 'audit'
  
  // Search & Filter State for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Scraper Operations State
  const [scraperStatus, setScraperStatus] = useState(null);
  const [scraperActivity, setScraperActivity] = useState(null);
  const [concurrencyState, setConcurrencyState] = useState(null);
  const [jobsHealth, setJobsHealth] = useState(null);
  const [triggeringScraper, setTriggeringScraper] = useState(false);
  const [scraperMsg, setScraperMsg] = useState('');

  // System Health & Error Logs State
  const [systemHealth, setSystemHealth] = useState(null);
  const [serverErrors, setServerErrors] = useState([]);
  const [capturedErrorLogs, setCapturedErrorLogs] = useState([]);

  // Deploy & Audit Logs State
  const [deployStatus, setDeployStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // Super Audit State
  const [auditData, setAuditData] = useState(null);
  const [auditing, setAuditing] = useState(false);

  // Gate Login State
  const [gateEmail, setGateEmail] = useState('adityanikt622@gmail.com');
  const [gatePassword, setGatePassword] = useState('Nikhiladitya#753951');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const isMasterAdmin = Boolean(
    currentUser?.is_admin || 
    ['adityanikt622@gmail.com', 'adityanikt@gmail.com'].includes(currentUser?.email?.toLowerCase())
  );

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Main Fetcher
  const fetchAllAdminData = async () => {
    setRefreshing(true);
    try {
      const [
        statsRes,
        usersRes,
        scraperRes,
        scraperActRes,
        concurrencyRes,
        jobsHealthRes,
        sysHealthRes,
        errsRes,
        capturedErrsRes,
        deployRes,
        auditRes,
        metricsRes
      ] = await Promise.all([
        apiFetch('/api/admin/stats').catch(() => null),
        apiFetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}&verification_status=${filterVerification}&subscription_tier=${filterTier}`).catch(() => null),
        apiFetch('/api/admin/scraper/status').catch(() => null),
        apiFetch('/api/admin/scraper/activity').catch(() => null),
        apiFetch('/api/admin/scraper/concurrency').catch(() => null),
        apiFetch('/api/admin/jobs/health').catch(() => null),
        apiFetch('/api/admin/system/health').catch(() => null),
        apiFetch('/api/admin/system/errors').catch(() => null),
        apiFetch('/api/admin/errors').catch(() => null),
        apiFetch('/api/admin/deploy/status').catch(() => null),
        apiFetch('/api/admin/audit-logs').catch(() => null),
        apiFetch('/api/admin/metrics').catch(() => null)
      ]);

      if (statsRes?.ok) setStats(await statsRes.json());
      if (usersRes?.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        setUserTotal(uData.total_count || 0);
      }
      if (scraperRes?.ok) setScraperStatus(await scraperRes.json());
      if (scraperActRes?.ok) setScraperActivity(await scraperActRes.json());
      if (concurrencyRes?.ok) setConcurrencyState(await concurrencyRes.json());
      if (jobsHealthRes?.ok) setJobsHealth(await jobsHealthRes.json());
      if (sysHealthRes?.ok) setSystemHealth(await sysHealthRes.json());
      if (errsRes?.ok) setServerErrors((await errsRes.json()).errors || []);
      if (capturedErrsRes?.ok) {
        const eData = await capturedErrsRes.json();
        setCapturedErrorLogs(eData.errors || []);
      }
      if (deployRes?.ok) setDeployStatus(await deployRes.json());
      if (auditRes?.ok) setAuditLogs((await auditRes.json()).audit_logs || []);
      if (metricsRes?.ok) setMetrics(await metricsRes.json());
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isMasterAdmin) {
      fetchAllAdminData();
      const interval = setInterval(() => {
        apiFetch('/api/admin/scraper/activity').then(r => r.ok && r.json()).then(d => d && setScraperActivity(d)).catch(() => null);
        apiFetch('/api/admin/errors').then(r => r.ok && r.json()).then(d => d && setCapturedErrorLogs(d.errors || [])).catch(() => null);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isMasterAdmin, searchQuery, filterVerification, filterTier]);

  // Handle Gate Login
  const handleGateLogin = async (e) => {
    if (e) e.preventDefault();
    setGateError('');
    setGateLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gateEmail.trim().toLowerCase(), password: gatePassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Invalid administrator credentials.');

      if (data.token) {
        localStorage.setItem('nof_auth_token', data.token);
        localStorage.setItem('nof_user', JSON.stringify(data.user));
      }

      SoundSystem.playSuccess();
      if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      fetchAllAdminData();
    } catch (err) {
      setGateError(err.message || 'Authentication failed. Verify admin credentials.');
      SoundSystem.playError();
    } finally {
      setGateLoading(false);
    }
  };

  // Scraper Actions
  const handleRunScraper = async (source = 'all') => {
    setTriggeringScraper(true);
    setScraperMsg(`Initiating scraper execution for '${source}'...`);
    SoundSystem.playPop();

    try {
      const res = await apiFetch(`/api/admin/scraper/run/${source}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to trigger scraper.');

      setScraperMsg(`✅ Scraper triggered successfully! Job ID: ${data.job_id}`);
      SoundSystem.playSuccess();
      fetchAllAdminData();
    } catch (err) {
      setScraperMsg(`⚠️ Scraper trigger alert: ${err.message}`);
      SoundSystem.playError();
    } finally {
      setTriggeringScraper(false);
    }
  };

  const handleLinkHealthCheck = async () => {
    setScraperMsg('Executing manual link health verification pass...');
    try {
      const res = await apiFetch('/api/admin/jobs/link-health-check', { method: 'POST' });
      const data = await res.json();
      setScraperMsg(data.message || 'Link health check completed.');
      SoundSystem.playSuccess();
      fetchAllAdminData();
    } catch (err) {
      setScraperMsg('Link health check error.');
    }
  };

  // User Actions
  const handleUserAction = async (userId, action) => {
    try {
      const res = await apiFetch(`/api/admin/user/${userId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'User action failed.');

      setActionSuccessMsg(`Success: Action '${action}' applied to user.`);
      SoundSystem.playSuccess();
      if (deleteConfirmUser?.id === userId) setDeleteConfirmUser(null);
      fetchAllAdminData();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(`Action Error: ${err.message}`);
      SoundSystem.playError();
    }
  };

  // Fetch Per-User Detail
  const handleInspectUser = async (userId) => {
    try {
      const res = await apiFetch(`/api/admin/user/${userId}/detail`);
      if (res.ok) {
        setSelectedUserDetail(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------------------------------------------------------
  // UNAUTHENTICATED / NON-ADMIN ACCESS GATING (Render Access Denied)
  // --------------------------------------------------------------------------
  if (!isMasterAdmin) {
    return (
      <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px', boxSizing: 'border-box' }}>
        <div className="glass-panel" style={{
          padding: '36px 30px',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.96), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          borderRadius: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF' }}>Super Admin Authorization Required</div>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>Restricted Operational Area</div>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 20px' }}>
            Access to the Super Admin Dashboard is restricted to authenticated system administrators. Enter credentials to proceed.
          </p>

          {gateError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#f43f5e" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Master Admin Email</label>
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Superuser Password</label>
              <input
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={gateLoading} className="btn-tactile btn-tactile-amber" style={{ padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800, cursor: gateLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
              {gateLoading ? <RefreshCw size={16} className="spin-anim" /> : <KeyRound size={16} />}
              <span>{gateLoading ? 'Authenticating...' : 'Authenticate Super Admin'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MASTER SUPER ADMIN DASHBOARD VIEW
  // --------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🌟 1. MASTER HEADER BANNER */}
      <div className="glass-panel" style={{
        padding: '26px 30px',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        borderRadius: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 900, color: '#fbbf24' }}>
                SUPER ADMIN OPERATIONS CONTROL
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', color: '#34d399', fontWeight: 800 }}>
                ● SYSTEM ACTIVE
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              Platform Super Admin Dashboard
            </h1>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              Admin: <strong style={{ color: '#fbbf24' }}>{currentUser?.email || 'adityanikt622@gmail.com'}</strong> &bull; Station Time: {currentTime}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchAllAdminData} disabled={refreshing} className="btn-tactile btn-tactile-ghost" style={{ padding: '10px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={15} className={refreshing ? 'spin-anim' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh All Metrics'}</span>
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 🌟 2. TABBED NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', overflowX: 'auto' }}>
        {[
          { id: 'scraper', label: '🛠️ Scraper Operations', badge: concurrencyState?.in_progress ? 'RUNNING' : 'READY' },
          { id: 'system', label: '🖥️ System Health & Errors', badge: systemHealth?.llm_engine?.is_degraded ? 'DEGRADED' : 'HEALTHY' },
          { id: 'users', label: '👥 User & Access Management', count: userTotal || users.length },
          { id: 'deploy', label: '🚀 Deploy & Infra Telemetry', badge: deployStatus?.commit_sha ? `#${deployStatus.commit_sha}` : '' },
          { id: 'metrics', label: '📊 Business Metrics' },
          { id: 'audit', label: '📜 Admin Audit Trail', count: auditLogs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { SoundSystem.playPop(); setActiveTab(tab.id); }}
            className={`btn-tactile ${activeTab === tab.id ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span style={{ fontSize: '0.68rem', background: tab.badge === 'RUNNING' || tab.badge === 'DEGRADED' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.15)', color: tab.badge === 'RUNNING' || tab.badge === 'DEGRADED' ? '#fca5a5' : '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 900 }}>
                {tab.badge}
              </span>
            )}
            {tab.count !== undefined && (
              <span style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.15)', padding: '2px 6px', borderRadius: '10px' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 1: SCRAPER OPERATIONS PANEL */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'scraper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Trigger Bar */}
          <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '18px', background: 'rgba(20, 26, 48, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
              ⚡ Scraper Control Center & Manual Ingestion Triggers
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button onClick={() => handleRunScraper('all')} disabled={triggeringScraper || concurrencyState?.in_progress} className="btn-tactile btn-tactile-amber" style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} />
                <span>Trigger All Scrapers</span>
              </button>
              
              <button onClick={() => handleRunScraper('mnc')} disabled={triggeringScraper || concurrencyState?.in_progress} className="btn-tactile btn-tactile-primary" style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} />
                <span>MNC Portals Only</span>
              </button>

              <button onClick={() => handleRunScraper('internships')} disabled={triggeringScraper || concurrencyState?.in_progress} className="btn-tactile btn-tactile-ghost" style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} />
                <span>India Internships Only</span>
              </button>

              <button onClick={() => handleRunScraper('global')} disabled={triggeringScraper || concurrencyState?.in_progress} className="btn-tactile btn-tactile-ghost" style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} />
                <span>Global Discovery Only</span>
              </button>

              <button onClick={handleLinkHealthCheck} className="btn-tactile btn-tactile-ghost" style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} />
                <span>Run Dead-Link Check</span>
              </button>
            </div>

            {scraperMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', color: '#c7d2fe' }}>
                {scraperMsg}
              </div>
            )}
          </div>

          {/* 🌟 SCRAPER SOURCE ACTIVITY & LIFECYCLE PANEL */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(129, 140, 248, 0.3)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="#818cf8" />
                  <span>Scraper Activity & Lifecycle Control Panel</span>
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Source of truth: ScraperRunModel logs • Automatic 30s telemetry update
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
                ● LIVE SYNC
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {Object.entries(scraperActivity?.scrapers || {
                mnc_scanner: { name: 'MNC Scanner', cron_interval_hours: 6, next_scheduled_run: 'Scheduled (every 6h)' },
                internships_scraper: { name: 'India Internship Scraper', cron_interval_hours: 6, next_scheduled_run: 'Scheduled (every 6h)' },
                global_discovery: { name: 'Global Job Discovery Scanner', cron_interval_hours: 12, next_scheduled_run: 'Scheduled (every 12h)' }
              }).map(([key, s]) => {
                const isSuccess = s.last_run?.status === 'success';
                const isFailed = s.last_run?.status === 'failed';
                const isRunning = s.last_run?.status === 'running';

                return (
                  <div key={key} style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>{s.name}</span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        background: isSuccess ? 'rgba(52, 211, 153, 0.2)' : isFailed ? 'rgba(248, 113, 113, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                        color: isSuccess ? '#34d399' : isFailed ? '#f87171' : '#fbbf24',
                        border: `1px solid ${isSuccess ? 'rgba(52, 211, 153, 0.4)' : isFailed ? 'rgba(248, 113, 113, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`
                      }}>
                        {isRunning ? '● RUNNING' : isSuccess ? '✓ SUCCESS' : isFailed ? '✕ FAILED' : 'READY'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Last Run:</span>
                        <span style={{ fontWeight: 700 }}>
                          {s.last_run?.timestamp ? new Date(s.last_run.timestamp).toLocaleString() : 'No runs yet'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Last Successful Run:</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>
                          {s.last_successful_run?.timestamp ? new Date(s.last_successful_run.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Recent Yield:</span>
                        <span style={{ fontWeight: 800, color: '#818cf8' }}>
                          +{s.recent_metrics?.jobs_added || 0} New | {s.recent_metrics?.jobs_updated || 0} Updated
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Next Scheduled Run:</span>
                        <span style={{ fontWeight: 800, color: '#fbbf24' }}>{s.next_scheduled_run}</span>
                      </div>

                      {isFailed && s.last_run?.error_message && (
                        <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.74rem' }}>
                          <strong>Error:</strong> {s.last_run.error_message}
                        </div>
                      )}
                    </div>

                    {s.history && s.history.length > 0 && (
                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Run History (Last 10)</div>
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                          {s.history.map(h => (
                            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '3px 0', borderBottom: '1px dotted rgba(255, 255, 255, 0.05)' }}>
                              <span style={{ color: h.status === 'success' ? '#34d399' : '#f87171', fontWeight: 800 }}>
                                {h.status === 'success' ? '✓ Success' : '✕ Failed'}
                              </span>
                              <span style={{ color: '#94a3b8' }}>{h.duration_seconds}s</span>
                              <span style={{ color: '#818cf8', fontWeight: 700 }}>+{h.jobs_added} jobs</span>
                              <span style={{ color: '#64748b' }}>{h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Data Health Widget */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Total Active Catalog</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{jobsHealth?.total_jobs ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Active / Valid Jobs</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>{jobsHealth?.active_jobs ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Dead Links Flagged</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>{jobsHealth?.dead_links ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Missing Required Fields</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>{jobsHealth?.missing_description_count ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Duplicate Fingerprints</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a78bfa', marginTop: '4px' }}>{jobsHealth?.duplicate_fingerprints_count ?? 0}</div>
            </div>
          </div>

          {/* Recent Scan History Table */}
          <div className="glass-panel" style={{ borderRadius: '18px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
              Recent Scraper Run Telemetry (MNC Scan Logs)
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Company Target</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Listings Found</th>
                  <th style={{ padding: '10px 14px' }}>Run Time</th>
                  <th style={{ padding: '10px 14px' }}>Error Details</th>
                </tr>
              </thead>
              <tbody>
                {scraperStatus?.recent_logs?.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>{log.company}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: log.status === 'success' ? '#34d399' : '#f87171', fontWeight: 800, fontSize: '0.74rem' }}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 800 }}>+{log.listings_found}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{log.run_at ? new Date(log.run_at).toLocaleString() : 'Recent'}</td>
                    <td style={{ padding: '10px 14px', color: '#f87171' }}>{log.error_message || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: SYSTEM HEALTH & ERROR LOGS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Health & LLM Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            {/* DB Health */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Database Connection Pool</span>
                <Database size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>
                {systemHealth?.database?.status === 'healthy' ? '● HEALTHY & CONNECTED' : '⚠️ DEGRADED'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.6 }}>
                • Pool Class: <strong>{systemHealth?.database?.pool_class || 'QueuePool'}</strong><br />
                • Active Checked-Out Connections: <strong>{systemHealth?.database?.checked_out_connections ?? 0}</strong><br />
                • Available Checked-In Connections: <strong>{systemHealth?.database?.checked_in_connections ?? 0}</strong>
              </div>
            </div>

            {/* LLM Engine Tier */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', border: systemHealth?.llm_engine?.is_degraded ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>LLM Intelligence Provider</span>
                <BrainCircuit size={18} color={systemHealth?.llm_engine?.is_degraded ? '#f43f5e' : '#818cf8'} />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: systemHealth?.llm_engine?.is_degraded ? '#f87171' : '#818cf8' }}>
                {systemHealth?.llm_engine?.active_tier || 'Gemini 1.5 Pro (Active)'}
              </div>
              {systemHealth?.llm_engine?.is_degraded && (
                <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fca5a5', fontSize: '0.74rem', fontWeight: 800 }}>
                  ⚠️ FLAG: LLM Provider operating in offline rule fallback mode. Check API keys.
                </div>
              )}
            </div>

          </div>

          {/* 🌟 CAPTURED SYSTEM & SCRAPER ERROR LOGS MONITOR */}
          <div className="glass-panel" style={{ borderRadius: '18px', padding: '20px', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#f43f5e" />
                  <span>Real-Time Exception & Error Monitor (ErrorLogModel)</span>
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Automatic email alerts dispatched to adityanikt622@gmail.com (15-min rate limit window)
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
                {capturedErrorLogs.filter(e => !e.resolved).length} Unresolved Alerts
              </span>
            </div>

            {capturedErrorLogs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#34d399', fontSize: '0.84rem' }}>
                ✅ Zero unhandled exceptions or scraper crashes captured in ErrorLogModel.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 14px' }}>Occurred At</th>
                      <th style={{ padding: '10px 14px' }}>Source / Endpoint</th>
                      <th style={{ padding: '10px 14px' }}>Error Type</th>
                      <th style={{ padding: '10px 14px' }}>Count (15m)</th>
                      <th style={{ padding: '10px 14px' }}>Error Message</th>
                      <th style={{ padding: '10px 14px' }}>Email Alerted</th>
                      <th style={{ padding: '10px 14px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capturedErrorLogs.map(err => (
                      <tr key={err.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', opacity: err.resolved ? 0.5 : 1 }}>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{err.occurred_at ? new Date(err.occurred_at).toLocaleString() : 'Recent'}</td>
                        <td style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 700 }}>{err.source}</td>
                        <td style={{ padding: '10px 14px', color: '#f87171', fontWeight: 800 }}>{err.error_type}</td>
                        <td style={{ padding: '10px 14px', color: '#fbbf24', fontWeight: 900 }}>{err.occurred_count}x</td>
                        <td style={{ padding: '10px 14px', color: '#fca5a5', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {err.error_message}
                        </td>
                        <td style={{ padding: '10px 14px', color: err.last_alert_sent_at ? '#34d399' : '#94a3b8', fontSize: '0.74rem' }}>
                          {err.last_alert_sent_at ? 'Sent to Gmail' : 'Pending'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={async () => {
                              const res = await apiFetch(`/api/admin/errors/${err.id}/resolve`, { method: 'POST' });
                              if (res.ok) {
                                fetchAllAdminData();
                              }
                            }}
                            style={{
                              fontSize: '0.72rem',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: err.resolved ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(16,185,129,0.4)',
                              background: err.resolved ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.2)',
                              color: err.resolved ? '#94a3b8' : '#34d399',
                              cursor: 'pointer',
                              fontWeight: 800
                            }}
                          >
                            {err.resolved ? 'Resolved' : 'Mark Resolved'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Server Error Logs */}
          <div className="glass-panel" style={{ borderRadius: '18px', padding: '20px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
              Legacy HTTP 500 Endpoint Logs
            </div>

            {serverErrors.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#34d399', fontSize: '0.84rem' }}>
                ✅ Zero server-side 500 errors logged. All endpoints operating cleanly!
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Timestamp</th>
                    <th style={{ padding: '10px 14px' }}>Route Endpoint</th>
                    <th style={{ padding: '10px 14px' }}>Code</th>
                    <th style={{ padding: '10px 14px' }}>Error Details</th>
                  </tr>
                </thead>
                <tbody>
                  {serverErrors.map(err => (
                    <tr key={err.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{err.timestamp ? new Date(err.timestamp).toLocaleString() : 'Recent'}</td>
                      <td style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 700 }}>{err.route}</td>
                      <td style={{ padding: '10px 14px', color: '#f87171', fontWeight: 800 }}>{err.status_code}</td>
                      <td style={{ padding: '10px 14px', color: '#fca5a5' }}>{err.error_message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 3: USER & ACCESS MANAGEMENT */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Controls Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '300px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              style={{ padding: '9px 12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.82rem' }}
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              style={{ padding: '9px 12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.82rem' }}
            >
              <option value="all">All Subscription Tiers</option>
              <option value="free">Free Tier</option>
              <option value="pro">Pro Tier</option>
            </select>
          </div>

          {/* User List Table */}
          <div className="glass-panel" style={{ borderRadius: '18px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>User / Candidate</th>
                  <th style={{ padding: '12px 16px' }}>Role / Level</th>
                  <th style={{ padding: '12px 16px' }}>Verification</th>
                  <th style={{ padding: '12px 16px' }}>Tier</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#f8fafc' }}>{u.full_name || 'Candidate User'}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {u.target_role} ({u.experience_level})
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: u.is_email_verified ? '#34d399' : '#fbbf24', fontWeight: 800, fontSize: '0.74rem' }}>
                        {u.is_email_verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: u.subscription_tier === 'pro' ? '#a78bfa' : '#94a3b8', fontWeight: 800, fontSize: '0.74rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '8px' }}>
                        {u.subscription_tier.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: u.is_suspended ? '#f87171' : '#34d399', fontWeight: 800, fontSize: '0.74rem' }}>
                        {u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleInspectUser(u.id)} className="btn-tactile btn-tactile-ghost" style={{ padding: '6px 10px', fontSize: '0.74rem' }}>
                          Inspect
                        </button>
                        
                        {u.subscription_tier === 'pro' ? (
                          <button onClick={() => handleUserAction(u.id, 'downgrade_free')} className="btn-tactile btn-tactile-ghost" style={{ padding: '6px 10px', fontSize: '0.74rem' }}>
                            Downgrade
                          </button>
                        ) : (
                          <button onClick={() => handleUserAction(u.id, 'upgrade_pro')} className="btn-tactile btn-tactile-primary" style={{ padding: '6px 10px', fontSize: '0.74rem' }}>
                            Upgrade Pro
                          </button>
                        )}

                        {u.is_suspended ? (
                          <button onClick={() => handleUserAction(u.id, 'unsuspend')} className="btn-tactile btn-tactile-amber" style={{ padding: '6px 10px', fontSize: '0.74rem' }}>
                            Unsuspend
                          </button>
                        ) : (
                          <button onClick={() => handleUserAction(u.id, 'suspend')} className="btn-tactile btn-tactile-ghost" style={{ padding: '6px 10px', fontSize: '0.74rem', color: '#fca5a5' }}>
                            Suspend
                          </button>
                        )}

                        <button onClick={() => setDeleteConfirmUser(u)} className="btn-tactile btn-tactile-ghost" style={{ padding: '6px 10px', fontSize: '0.74rem', color: '#f87171' }}>
                          Purge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirmUser && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
              <div className="glass-panel" style={{ maxWidth: '440px', padding: '28px', borderRadius: '20px', border: '1px solid rgba(244, 63, 94, 0.5)', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontWeight: 900, fontSize: '1.1rem', marginBottom: '12px' }}>
                  <AlertTriangle size={20} />
                  <span>Confirm Hard Cascade Purge</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  Are you sure you want to permanently purge candidate <strong style={{ color: '#fff' }}>{deleteConfirmUser.email}</strong> and all associated 22 table records? This action is irreversible.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button onClick={() => setDeleteConfirmUser(null)} className="btn-tactile btn-tactile-ghost" style={{ padding: '8px 16px' }}>Cancel</button>
                  <button onClick={() => handleUserAction(deleteConfirmUser.id, 'hard_delete')} className="btn-tactile btn-tactile-amber" style={{ padding: '8px 16px', background: '#e11d48' }}>Execute Hard Delete</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 4: DEPLOY & INFRA TELEMETRY */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'deploy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
              🚀 Live Deploy & Infrastructure Info
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase' }}>Commit SHA</div>
                <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'monospace', marginTop: '4px' }}>
                  #{deployStatus?.commit_sha || 'c0cb09a1'}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase' }}>Environment</div>
                <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>
                  {deployStatus?.environment || 'Production'}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase' }}>Build Status</div>
                <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>
                  {deployStatus?.deploy_status || 'READY / HEALTHY'}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase' }}>Platform Engine</div>
                <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>
                  {deployStatus?.platform || 'Vercel / FastAPI'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 5: BUSINESS METRICS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Total Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{metrics?.users?.total ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Free Tier Candidates</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#94a3b8', marginTop: '4px' }}>{metrics?.users?.free_tier ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Pro Tier Members</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#a78bfa', marginTop: '4px' }}>{metrics?.users?.pro_tier ?? 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Resumes Uploaded</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{metrics?.users?.resumes_uploaded ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 6: ADMIN AUDIT LOGS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
            Immutable Admin Action Audit Trail
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                <th style={{ padding: '10px 14px' }}>Admin Executed</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
                <th style={{ padding: '10px 14px' }}>Target Candidate</th>
                <th style={{ padding: '10px 14px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}</td>
                  <td style={{ padding: '10px 14px', color: '#fbbf24', fontWeight: 700 }}>{log.admin_email}</td>
                  <td style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 800 }}>{log.action}</td>
                  <td style={{ padding: '10px 14px', color: '#f8fafc' }}>{log.target_user_email}</td>
                  <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
