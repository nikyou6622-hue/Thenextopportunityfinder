import React, { useState, useEffect } from 'react';
import apiFetch, { safeJson } from '../../lib/apiClient';
import SoundSystem from '../characters/SoundEffects';
import CommanderDashboard from './CommanderDashboard';
import RightHandDashboard from './RightHandDashboard';
import MasterAdminDashboard from './MasterAdminDashboard';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  UserPlus, 
  SlidersHorizontal, 
  Activity, 
  FileText, 
  Lock, 
  Unlock,
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Crown,
  Key,
  Database,
  Globe,
  Radio,
  Eye,
  Shield,
  Layers,
  History
} from 'lucide-react';

export default function SuperAdminDashboard({ 
  currentUser, 
  commanderData, 
  rightHandJobs, 
  rightHandJobsTotal, 
  masterReconciliation,
  onRefresh
}) {
  const [activeSuperTab, setActiveSuperTab] = useState('staff'); // 'staff' | 'deepjobs' | 'scrapers' | 'activity' | 'logins' | 'audit' | 'commander' | 'righthand' | 'master'
  
  // Data States
  const [staff, setStaff] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [permissionsMatrix, setPermissionsMatrix] = useState({});
  const [deepJobs, setDeepJobs] = useState([]);
  const [deepJobsTotal, setDeepJobsTotal] = useState(0);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [lockdownState, setLockdownState] = useState({ is_locked_down: false });
  const [ingestionRuns, setIngestionRuns] = useState([]);
  const [scraperHealth, setScraperHealth] = useState({});
  const [scraperSchedules, setScraperSchedules] = useState([]);
  
  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  
  // Form & Action States
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('commander');
  const [permTargetEmail, setPermTargetEmail] = useState('');
  const [selectedPerm, setSelectedPerm] = useState('cleanup_expired_jobs');
  const [reauthCode, setReauthCode] = useState('');
  const [showLockdownModal, setShowLockdownModal] = useState(false);
  const [lockdownReason, setLockdownReason] = useState('Emergency Security Protocol Audit');
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchAllSuperData = async () => {
    setLoading(true);
    try {
      const [resStaff, resAudit, resPerms, resJobs, resFeed, resLogins, resLockdown, resIngestion, resHealth, resSchedules] = await Promise.all([
        apiFetch('/api/admin/super/staff'),
        apiFetch('/api/admin/audit-logs'),
        apiFetch('/api/admin/super/permissions'),
        apiFetch('/api/admin/super/jobs'),
        apiFetch('/api/admin/super/activity-feed'),
        apiFetch('/api/admin/super/login-logs'),
        apiFetch('/api/admin/super/lockdown'),
        apiFetch('/api/admin/scrapers/ingestion-runs'),
        apiFetch('/api/scrapers/health'),
        apiFetch('/api/scrapers/schedules')
      ]);

      if (resStaff?.ok) {
        const data = await safeJson(resStaff);
        if (data?.staff) setStaff(data.staff);
      }
      if (resAudit?.ok) {
        const data = await safeJson(resAudit);
        if (data?.logs) setAuditLogs(data.logs);
      }
      if (resPerms?.ok) {
        const data = await safeJson(resPerms);
        if (data?.permissions) setPermissionsMatrix(data.permissions);
      }
      if (resJobs?.ok) {
        const data = await safeJson(resJobs);
        if (data?.jobs) {
          setDeepJobs(data.jobs);
          setDeepJobsTotal(data.total || data.jobs.length);
        }
      }
      if (resFeed?.ok) {
        const data = await safeJson(resFeed);
        if (data?.feed) setActivityFeed(data.feed);
      }
      if (resLogins?.ok) {
        const data = await safeJson(resLogins);
        if (data?.logs) setLoginLogs(data.logs);
      }
      if (resLockdown?.ok) {
        const data = await safeJson(resLockdown);
        setLockdownState(data || { is_locked_down: false });
      }
      if (resIngestion?.ok) {
        const data = await safeJson(resIngestion);
        if (data?.runs) setIngestionRuns(data.runs);
      }
      if (resHealth?.ok) {
        const data = await safeJson(resHealth);
        if (data?.health) setScraperHealth(data.health);
      }
      if (resSchedules?.ok) {
        const data = await safeJson(resSchedules);
        if (data?.schedules) setScraperSchedules(data.schedules);
      }
    } catch (e) {
      console.warn("Failed to fetch super admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCleanerPass = async () => {
    SoundSystem.playClick();
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/cleaner/run', { method: 'POST' });
      const data = await safeJson(res);
      if (res?.ok && data?.success) {
        SoundSystem.playSuccess();
        setFeedbackMsg({ type: 'success', text: data.message });
        fetchAllSuperData();
      } else {
        SoundSystem.playError();
        setFeedbackMsg({ type: 'error', text: data?.detail || 'Failed to trigger cleaner pass.' });
      }
    } catch (e) {
      SoundSystem.playError();
      setFeedbackMsg({ type: 'error', text: 'Error connecting to backend.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRunScrapers = async () => {
    SoundSystem.playClick();
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/scrapers/run', { method: 'POST' });
      const data = await safeJson(res);
      if (res?.ok && data?.success) {
        SoundSystem.playSuccess();
        setFeedbackMsg({ type: 'success', text: data.message });
        fetchAllSuperData();
      } else {
        SoundSystem.playError();
        setFeedbackMsg({ type: 'error', text: data?.detail || 'Failed to trigger scrapers.' });
      }
    } catch (e) {
      SoundSystem.playError();
      setFeedbackMsg({ type: 'error', text: 'Error connecting to backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSuperData();
  }, []);

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!targetEmail) return;
    SoundSystem.playClick();
    setFeedbackMsg(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (reauthCode) headers['X-Admin-Reauth-Code'] = reauthCode;

      const res = await apiFetch('/api/admin/super/role-change', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          target_user_email: targetEmail,
          new_admin_level: selectedRole
        })
      });

      const data = await safeJson(res);
      if (res?.ok && data?.success) {
        SoundSystem.playSuccess();
        setFeedbackMsg({ type: 'success', text: data.message });
        setTargetEmail('');
        fetchAllSuperData();
        if (onRefresh) onRefresh();
      } else {
        SoundSystem.playError();
        setFeedbackMsg({ type: 'error', text: data?.detail || "Failed to update admin role. (Check Re-Auth Code if required)" });
      }
    } catch (err) {
      SoundSystem.playError();
      setFeedbackMsg({ type: 'error', text: "Error connecting to server." });
    }
  };

  const handleGrantPerm = async (email, permName) => {
    SoundSystem.playClick();
    try {
      const res = await apiFetch('/api/admin/super/permissions/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_email: email, permission_name: permName })
      });
      const data = await safeJson(res);
      if (res?.ok && data?.success) {
        SoundSystem.playSuccess();
        setFeedbackMsg({ type: 'success', text: `Granted permission ${permName} to ${email}` });
        fetchAllSuperData();
      } else {
        SoundSystem.playError();
        setFeedbackMsg({ type: 'error', text: data?.detail || "Failed to grant permission." });
      }
    } catch (e) {
      SoundSystem.playError();
    }
  };

  const handleRevokePerm = async (email, permName) => {
    SoundSystem.playClick();
    try {
      const res = await apiFetch('/api/admin/super/permissions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_email: email, permission_name: permName })
      });
      const data = await safeJson(res);
      if (res?.ok && data?.success) {
        SoundSystem.playSuccess();
        setFeedbackMsg({ type: 'success', text: `Revoked permission ${permName} from ${email}` });
        fetchAllSuperData();
      } else {
        SoundSystem.playError();
        setFeedbackMsg({ type: 'error', text: data?.detail || "Failed to revoke permission." });
      }
    } catch (e) {
      SoundSystem.playError();
    }
  };

  const handleToggleLockdown = async () => {
    SoundSystem.playClick();
    try {
      const endpoint = lockdownState.is_locked_down ? '/api/admin/super/unlockdown' : '/api/admin/super/lockdown';
      const headers = {};
      if (reauthCode) headers['X-Admin-Reauth-Code'] = reauthCode;

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: lockdownReason })
      });

      const data = await safeJson(res);
      if (res?.ok && (data?.success || data?.is_locked_down !== undefined)) {
        SoundSystem.playSuccess();
        setFeedbackMsg({ 
          type: 'success', 
          text: lockdownState.is_locked_down ? "EMERGENCY LOCKDOWN LIFTED SUCCESSFULLY" : "EMERGENCY LOCKDOWN ACTIVATED! All non-Super-Admin sessions revoked." 
        });
        setShowLockdownModal(false);
        fetchAllSuperData();
      } else {
        SoundSystem.playError();
        setFeedbackMsg({ type: 'error', text: data?.detail || "Lockdown action failed. Re-Auth Header required." });
      }
    } catch (e) {
      SoundSystem.playError();
      setFeedbackMsg({ type: 'error', text: "Error executing emergency lockdown command." });
    }
  };

  const availablePermissionsList = [
    'cleanup_expired_jobs',
    'manage_system_announcements',
    'view_sensitive_audit_logs',
    'export_telemetry_data',
    'bypass_rate_limits',
    'trigger_manual_scraping'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 🚨 LOCKDOWN STATUS ALERT BANNER */}
      {lockdownState.is_locked_down && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.95), rgba(159, 18, 57, 0.95))',
          border: '2px solid #f43f5e',
          color: '#ffffff',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(244, 63, 94, 0.5)',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={32} color="#ffffff" />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                🚨 EMERGENCY LOCKDOWN ACTIVE — ALL NON-SUPER-ADMIN ACCESS REVOKED
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fecdd3', marginTop: '2px' }}>
                Reason: {lockdownState.reason || 'Security Audit'} | Initiated By: {lockdownState.initiated_by || 'Super Admin'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowLockdownModal(true)}
            className="btn-tactile"
            style={{ padding: '8px 16px', background: '#ffffff', color: '#881337', fontWeight: 900, borderRadius: '10px' }}
          >
            Lift Lockdown
          </button>
        </div>
      )}

      {/* 👑 SUPER ADMIN TOP BANNER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '22px', background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95), rgba(15, 23, 42, 0.98))', border: '1px solid rgba(192, 132, 252, 0.5)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(192, 132, 252, 0.25)', color: '#e9d5ff', fontSize: '0.72rem', fontWeight: 900, padding: '3px 12px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SUPER ADMIN FULL CONTROL CENTER (TIER 4)
              </span>
              <span style={{ background: lockdownState.is_locked_down ? 'rgba(244, 63, 94, 0.25)' : 'rgba(52, 211, 153, 0.15)', color: lockdownState.is_locked_down ? '#f43f5e' : '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '10px' }}>
                {lockdownState.is_locked_down ? '● EMERGENCY LOCKDOWN' : '● UNRESTRICTED SYSTEM PERMISSIONS'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={26} color="#c084fc" />
              <span>Super Admin Executive Control Hub</span>
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '4px' }}>
              Manage admin staff roles, delegate granular permissions, audit job lineage, view activity feeds, and execute emergency lockdowns.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setShowLockdownModal(true)}
              className="btn-tactile"
              style={{
                padding: '9px 16px',
                fontSize: '0.82rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: lockdownState.is_locked_down ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 63, 94, 0.25)',
                color: lockdownState.is_locked_down ? '#34d399' : '#f43f5e',
                border: lockdownState.is_locked_down ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid rgba(244, 63, 94, 0.5)'
              }}
            >
              {lockdownState.is_locked_down ? <Unlock size={16} /> : <Lock size={16} />}
              <span>{lockdownState.is_locked_down ? 'Lift Lockdown' : 'Emergency Lockdown'}</span>
            </button>

            <button onClick={fetchAllSuperData} disabled={loading} className="btn-tactile btn-tactile-ghost" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: '#e9d5ff' }}>
              <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Re-Auth Header Secret Input Bar */}
        <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Key size={16} color="#c084fc" />
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>X-Admin-Reauth-Code:</span>
          <input
            type="password"
            placeholder="Enter re-authentication code or password for destructive actions"
            value={reauthCode}
            onChange={(e) => setReauthCode(e.target.value)}
            style={{ flex: 1, minWidth: '220px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(10, 15, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.78rem' }}
          />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Req. for Lockdown & Role Elevation</span>
        </div>

        {/* Super Admin Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <button 
            onClick={() => setActiveSuperTab('staff')}
            className={`btn-tactile ${activeSuperTab === 'staff' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} />
            <span>Staff & Permissions ({staff.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('deepjobs')}
            className={`btn-tactile ${activeSuperTab === 'deepjobs' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Database size={15} />
            <span>Deep Job Lineage ({deepJobsTotal})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('scrapers')}
            className={`btn-tactile ${activeSuperTab === 'scrapers' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Radio size={15} />
            <span>Scrapers & Cleaner ({ingestionRuns.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('activity')}
            className={`btn-tactile ${activeSuperTab === 'activity' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Activity size={15} />
            <span>Activity Feed ({activityFeed.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('logins')}
            className={`btn-tactile ${activeSuperTab === 'logins' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={15} />
            <span>Login Security Logs ({loginLogs.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('audit')}
            className={`btn-tactile ${activeSuperTab === 'audit' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={15} />
            <span>Global Audit Trail ({auditLogs.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('commander')}
            className={`btn-tactile ${activeSuperTab === 'commander' ? 'btn-tactile-amber' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={15} />
            <span>Tier 1 Commander</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('righthand')}
            className={`btn-tactile ${activeSuperTab === 'righthand' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <SlidersHorizontal size={15} />
            <span>Tier 2 Right Hand</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('master')}
            className={`btn-tactile ${activeSuperTab === 'master' ? 'btn-tactile-amber' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={15} />
            <span>Tier 3 Master View</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: feedbackMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)', fontSize: '0.84rem', color: feedbackMsg.type === 'success' ? '#34d399' : '#fca5a5', fontWeight: 700 }}>
          {feedbackMsg.text}
        </div>
      )}

      {/* 1. STAFF ROLES MANAGEMENT & GRANULAR PERMISSIONS TAB */}
      {activeSuperTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Staff Role Change Form */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(192, 132, 252, 0.35)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={18} color="#c084fc" />
                <span>Modify Staff Admin Level</span>
              </h3>

              <form onSubmit={handleRoleChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Staff Email Address</label>
                  <input
                    type="email"
                    placeholder="admin.user@thenextopportunityfinder.com"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Target Tier Level</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  >
                    <option value="commander">Tier 1 — Commander (Operations)</option>
                    <option value="righthand">Tier 2 — Right Hand (Data & Content)</option>
                    <option value="master">Tier 3 — Master Admin (Reconciliation)</option>
                    <option value="superadmin">Tier 4 — Super Admin (Full Control)</option>
                  </select>
                </div>

                <button type="submit" className="btn-tactile btn-tactile-primary" style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                  <UserPlus size={16} />
                  <span>Update Admin Role</span>
                </button>
              </form>
            </div>

            {/* Granular Permission Delegation Form */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#38bdf8" />
                <span>Granular Permission Delegation</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Target Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin.user@thenextopportunityfinder.com"
                    value={permTargetEmail}
                    onChange={(e) => setPermTargetEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Permission Flag</label>
                  <select
                    value={selectedPerm}
                    onChange={(e) => setSelectedPerm(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  >
                    {availablePermissionsList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button 
                    onClick={() => handleGrantPerm(permTargetEmail, selectedPerm)}
                    disabled={!permTargetEmail}
                    className="btn-tactile btn-tactile-primary"
                    style={{ flex: 1, padding: '9px', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    Grant Permission
                  </button>
                  <button 
                    onClick={() => handleRevokePerm(permTargetEmail, selectedPerm)}
                    disabled={!permTargetEmail}
                    className="btn-tactile btn-tactile-amber"
                    style={{ flex: 1, padding: '9px', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    Revoke Permission
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Admin Staff Directory & Permission Matrix Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px' }}>
              Authorized Administrative Staff Directory & Permission Matrix
            </h3>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', color: '#f8fafc' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px' }}>Staff Email</th>
                    <th style={{ padding: '12px 16px' }}>Full Name</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Admin Level</th>
                    <th style={{ padding: '12px 16px' }}>Granular Permission Flags</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length > 0 ? (
                    staff.map((s) => {
                      const userPerms = permissionsMatrix[s.email] || [];
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#c084fc' }}>{s.email}</td>
                          <td style={{ padding: '12px 16px', color: '#f8fafc' }}>{s.full_name}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              background: s.admin_level === 'superadmin' ? 'rgba(192, 132, 252, 0.25)' : s.admin_level === 'master' ? 'rgba(16, 185, 129, 0.2)' : s.admin_level === 'righthand' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: s.admin_level === 'superadmin' ? '#e9d5ff' : s.admin_level === 'master' ? '#34d399' : s.admin_level === 'righthand' ? '#38bdf8' : '#fbbf24',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 900,
                              textTransform: 'uppercase'
                            }}>
                              {s.admin_level}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {s.admin_level === 'superadmin' ? (
                                <span style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#e9d5ff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>ALL (Super Admin)</span>
                              ) : userPerms.length > 0 ? (
                                userPerms.map(p => (
                                  <span key={p} style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {p}
                                    <button onClick={() => handleRevokePerm(s.email, p)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0, fontSize: '0.75rem', fontWeight: 900 }}>×</button>
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Default Tier Scope</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button 
                              onClick={() => {
                                setPermTargetEmail(s.email);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Manage Perms
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        No administrative staff accounts listed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEEP JOB AUDIT CATALOG TAB */}
      {activeSuperTab === 'deepjobs' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="#c084fc" />
                <span>Deep Job Ingestion Lineage & Audit History</span>
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                Total Verified Jobs: {deepJobsTotal} — Exposing scraper agent provenance, raw HTML/JSON source links, and admin edit logs.
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left', color: '#f8fafc' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 12px' }}>Job ID</th>
                  <th style={{ padding: '10px 12px' }}>Title & Company</th>
                  <th style={{ padding: '10px 12px' }}>Raw Scrape Source</th>
                  <th style={{ padding: '10px 12px' }}>Ingestion Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Scraper Agent ID</th>
                  <th style={{ padding: '10px 12px' }}>Link Health</th>
                  <th style={{ padding: '10px 12px' }}>Admin Action Log</th>
                  <th style={{ padding: '10px 12px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {deepJobs.length > 0 ? (
                  deepJobs.map((j) => (
                    <tr key={j.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#c084fc' }}>#{j.id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 800, color: '#ffffff' }}>{j.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{j.company_name} • {j.location}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {j.source || j.raw_scrape_source || 'direct_ingest'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                        {j.ingestion_timestamp || j.created_at ? new Date(j.ingestion_timestamp || j.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#fbbf24', fontWeight: 700 }}>
                        {j.scraper_agent_id || 'Agent-Scraper-V2'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: j.link_status === 'broken' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: j.link_status === 'broken' ? '#f43f5e' : '#34d399', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                          {j.link_status || 'VERIFIED_ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '0.72rem' }}>
                        {j.admin_actions_count || 0} audit events
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button 
                          onClick={() => setSelectedJob(j)}
                          style={{ background: 'rgba(192, 132, 252, 0.2)', border: '1px solid rgba(192, 132, 252, 0.4)', color: '#e9d5ff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800 }}
                        >
                          Inspect Lineage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                      No jobs ingested yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2B. SCRAPERS & CLEANER OPERATIONS TAB */}
      {activeSuperTab === 'scrapers' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={20} color="#c084fc" />
                <span>Scraper Ingestion & 2-Tier Cleaner Operations</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Real-time scraper health, scheduled ingestion runs, adaptive polling telemetry, and deadline expiration cleanup.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRunCleanerPass} 
                disabled={loading}
                className="btn-tactile btn-tactile-amber" 
                style={{ padding: '9px 16px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={16} />
                <span>⚡ Run Expiration & Cleanup Pass</span>
              </button>

              <button 
                onClick={handleRunScrapers} 
                disabled={loading}
                className="btn-tactile btn-tactile-primary" 
                style={{ padding: '9px 16px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
                <span>🔄 Trigger Scraper Ingestion</span>
              </button>
            </div>
          </div>

          {/* Health Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {Object.keys(scraperHealth).length > 0 ? (
              Object.entries(scraperHealth).map(([sourceKey, healthObj]) => (
                <div key={sourceKey} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.8)', border: `1px solid ${healthObj?.healthy ? 'rgba(52, 211, 153, 0.3)' : 'rgba(244, 63, 94, 0.4)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', textTransform: 'capitalize' }}>
                      {sourceKey.replace('_', ' ')}
                    </span>
                    <span style={{ 
                      background: healthObj?.healthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', 
                      color: healthObj?.healthy ? '#34d399' : '#fb7185',
                      padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 
                    }}>
                      {healthObj?.healthy ? 'HEALTHY' : 'DEGRADED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Consecutive Failures: <strong style={{ color: healthObj?.consecutive_failures > 0 ? '#fb7185' : '#34d399' }}>{healthObj?.consecutive_failures || 0}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '14px', color: '#94a3b8', fontSize: '0.8rem' }}>Scraper health telemetry loading...</div>
            )}
          </div>

          {/* Ingestion Runs Log Table */}
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 12px' }}>
            📋 Recent Ingestion Runs Log ({ingestionRuns.length})
          </h4>
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', color: '#f8fafc' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px' }}>Started At</th>
                  <th style={{ padding: '10px 14px' }}>Source</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Seen / New / Updated</th>
                  <th style={{ padding: '10px 14px' }}>Details / Errors</th>
                </tr>
              </thead>
              <tbody>
                {ingestionRuns.length > 0 ? (
                  ingestionRuns.map((run) => (
                    <tr key={run.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{run.started_at ? new Date(run.started_at).toLocaleString() : 'N/A'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#c084fc' }}>{run.source}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ 
                          background: run.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : run.status === 'partial' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: run.status === 'success' ? '#34d399' : run.status === 'partial' ? '#fbbf24' : '#fb7185',
                          padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                        }}>
                          {run.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#e2e8f0', fontWeight: 700 }}>
                        <span style={{ color: '#94a3b8' }}>{run.jobs_seen || 0} seen</span> / <span style={{ color: '#34d399' }}>+{run.jobs_new || 0} new</span> / <span style={{ color: '#38bdf8' }}>~{run.jobs_updated || 0} upd</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.75rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {run.error_detail || 'No errors reported'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                      No ingestion runs logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. UNIFIED ACTIVITY FEED TAB */}
      {activeSuperTab === 'activity' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#38bdf8" />
            <span>Unified Administrative Activity & Audit Feed</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activityFeed.length > 0 ? (
              activityFeed.map((item, idx) => (
                <div key={idx} style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.action?.includes('LOCKDOWN') ? '#f43f5e' : item.action?.includes('GRANT') ? '#34d399' : '#38bdf8' }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>
                        {item.admin_email} — <span style={{ color: '#38bdf8' }}>{item.action}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        {item.details}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                No activity feed events recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ADMIN LOGIN SECURITY LOGS TAB */}
      {activeSuperTab === 'logins' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="#fbbf24" />
            <span>Admin Login IP & Device Forensic Security Logs</span>
          </h3>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', color: '#f8fafc' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Admin Email</th>
                  <th style={{ padding: '10px 14px' }}>IP Address</th>
                  <th style={{ padding: '10px 14px' }}>Device / User Agent</th>
                  <th style={{ padding: '10px 14px' }}>Login Status</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.length > 0 ? (
                  loginLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{new Date(log.login_timestamp).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#c084fc' }}>{log.admin_email}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#38bdf8' }}>{log.ip_address}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.72rem', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {log.user_agent}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>SUCCESS</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                      No admin login logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. GLOBAL AUDIT TRAIL TAB */}
      {activeSuperTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px' }}>
            System Audit Log & Administrative Trail
          </h3>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', color: '#f8fafc' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Admin Email</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                  <th style={{ padding: '10px 14px' }}>Target User ID</th>
                  <th style={{ padding: '10px 14px' }}>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#c084fc' }}>{log.admin_email}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#38bdf8' }}>{log.action}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{log.target_user_id || 'N/A'}</td>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                      No audit log entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CHILD TIER VIEWS */}
      {activeSuperTab === 'commander' && (
        <CommanderDashboard commanderData={commanderData} onRefresh={onRefresh} />
      )}
      {activeSuperTab === 'righthand' && (
        <RightHandDashboard rightHandJobs={rightHandJobs} rightHandJobsTotal={rightHandJobsTotal} onRefresh={onRefresh} />
      )}
      {activeSuperTab === 'master' && (
        <MasterAdminDashboard masterReconciliation={masterReconciliation} onRefresh={onRefresh} />
      )}

      {/* 🚨 LOCKDOWN MODAL */}
      {showLockdownModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '28px', borderRadius: '24px', background: '#0f172a', border: '2px solid #f43f5e', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldAlert size={28} color="#f43f5e" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {lockdownState.is_locked_down ? 'Lift Emergency Lockdown' : 'Trigger Emergency Admin Lockdown'}
              </h3>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 16px' }}>
              {lockdownState.is_locked_down 
                ? 'Lifting lockdown will restore normal session access for Tiers 1, 2, and 3 administrators.'
                : 'Activating Emergency Lockdown will IMMEDIATELY REVOKE all active sessions for Tier 1 Commander, Tier 2 Right Hand, and Tier 3 Master Admins. Regular candidate access remains unaffected.'
              }
            </p>

            {!lockdownState.is_locked_down && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>Reason for Lockdown</label>
                <input
                  type="text"
                  value={lockdownReason}
                  onChange={(e) => setLockdownReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setShowLockdownModal(false)}
                className="btn-tactile btn-tactile-ghost"
                style={{ padding: '10px 18px', fontSize: '0.84rem', fontWeight: 800 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleToggleLockdown}
                className="btn-tactile"
                style={{ padding: '10px 20px', fontSize: '0.84rem', fontWeight: 900, background: lockdownState.is_locked_down ? '#10b981' : '#f43f5e', color: '#ffffff' }}
              >
                {lockdownState.is_locked_down ? 'Confirm Lift Lockdown' : 'CONFIRM LOCKDOWN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 JOB DEEP INSPECTION MODAL */}
      {selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '28px', borderRadius: '24px', background: '#0f172a', border: '1px solid rgba(192, 132, 252, 0.4)', boxShadow: '0 25px 50px rgba(0,0,0,0.8)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ background: 'rgba(192, 132, 252, 0.25)', color: '#e9d5ff', fontSize: '0.7rem', fontWeight: 900, padding: '3px 10px', borderRadius: '8px' }}>
                  JOB LINEAGE INSPECTOR #{selectedJob.id}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '6px 0 0' }}>
                  {selectedJob.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{selectedJob.company_name} — {selectedJob.location}</div>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem', color: '#e2e8f0' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>Raw Scrape Provenance</div>
                <div>Source: <strong>{selectedJob.source || selectedJob.raw_scrape_source || 'direct_scrape'}</strong></div>
                <div>Ingested At: <strong>{selectedJob.ingestion_timestamp || selectedJob.created_at || 'N/A'}</strong></div>
                <div>Scraper Agent: <strong>{selectedJob.scraper_agent_id || 'Agent-Scraper-V2'}</strong></div>
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>Link & Health Telemetry</div>
                <div>Link Status: <strong>{selectedJob.link_status || 'VERIFIED_ACTIVE'}</strong></div>
                <div>Original URL: <a href={selectedJob.job_url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>{selectedJob.job_url || 'N/A'}</a></div>
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>Admin Audit Trail for this Job</div>
                {selectedJob.audit_history && selectedJob.audit_history.length > 0 ? (
                  selectedJob.audit_history.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                      • {h.action} by {h.admin_email} at {new Date(h.timestamp).toLocaleString()}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No manual admin edits performed on this job.</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedJob(null)} className="btn-tactile btn-tactile-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800 }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
