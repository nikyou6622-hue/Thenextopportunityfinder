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
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Crown,
  Key
} from 'lucide-react';

export default function SuperAdminDashboard({ 
  currentUser, 
  commanderData, 
  rightHandJobs, 
  rightHandJobsTotal, 
  masterReconciliation,
  onRefresh
}) {
  const [activeSuperTab, setActiveSuperTab] = useState('staff'); // 'staff' | 'audit' | 'commander' | 'righthand' | 'master'
  const [staff, setStaff] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('commander');
  const [roleMsg, setRoleMsg] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const fetchStaffData = async () => {
    setLoadingStaff(true);
    try {
      const [resStaff, resAudit] = await Promise.all([
        apiFetch('/api/admin/super/staff'),
        apiFetch('/api/admin/audit-logs')
      ]);

      if (resStaff && resStaff.ok) {
        const dStaff = await safeJson(resStaff);
        if (dStaff?.staff) setStaff(dStaff.staff);
      }

      if (resAudit && resAudit.ok) {
        const dAudit = await safeJson(resAudit);
        if (dAudit?.logs) setAuditLogs(dAudit.logs);
      }
    } catch (e) {
      console.warn("Failed to fetch super admin staff data:", e);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!targetEmail) return;
    SoundSystem.playClick();
    setUpdatingRole(true);
    setRoleMsg(null);

    try {
      const res = await apiFetch('/api/admin/super/role-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_email: targetEmail,
          new_admin_level: selectedRole
        })
      });

      const data = await safeJson(res);
      if (res && res.ok && data?.success) {
        SoundSystem.playSuccess();
        setRoleMsg({ type: 'success', text: data.message });
        setTargetEmail('');
        fetchStaffData();
        if (onRefresh) onRefresh();
      } else {
        SoundSystem.playError();
        setRoleMsg({ type: 'error', text: data?.detail || "Failed to update admin staff role." });
      }
    } catch (err) {
      SoundSystem.playError();
      setRoleMsg({ type: 'error', text: "Error connecting to server." });
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 👑 SUPER ADMIN TOP BANNER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '22px', background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95), rgba(15, 23, 42, 0.98))', border: '1px solid rgba(192, 132, 252, 0.5)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(192, 132, 252, 0.25)', color: '#e9d5ff', fontSize: '0.72rem', fontWeight: 900, padding: '3px 12px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SUPER ADMIN FULL CONTROL CENTER
              </span>
              <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '10px' }}>
                ● UNRESTRICTED SYSTEM PERMISSIONS
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={26} color="#c084fc" />
              <span>Super Admin Executive Control Hub</span>
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '4px' }}>
              Manage admin staff roles, monitor global system audit logs, and oversee Commander, Right Hand, and Master Admin operations.
            </div>
          </div>

          <button onClick={fetchStaffData} disabled={loadingStaff} className="btn-tactile btn-tactile-ghost" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: '#e9d5ff' }}>
            <RefreshCw size={16} className={loadingStaff ? "spin-icon" : ""} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Super Admin Sub-Nav Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <button 
            onClick={() => setActiveSuperTab('staff')}
            className={`btn-tactile ${activeSuperTab === 'staff' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={16} />
            <span>Staff Roles & RBAC ({staff.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('audit')}
            className={`btn-tactile ${activeSuperTab === 'audit' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={16} />
            <span>Global Audit Trail ({auditLogs.length})</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('commander')}
            className={`btn-tactile ${activeSuperTab === 'commander' ? 'btn-tactile-amber' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={16} />
            <span>Tier 1 Commander View</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('righthand')}
            className={`btn-tactile ${activeSuperTab === 'righthand' ? 'btn-tactile-primary' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <SlidersHorizontal size={16} />
            <span>Tier 2 Right Hand View</span>
          </button>

          <button 
            onClick={() => setActiveSuperTab('master')}
            className={`btn-tactile ${activeSuperTab === 'master' ? 'btn-tactile-amber' : 'btn-tactile-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} />
            <span>Tier 3 Master Reconciliation View</span>
          </button>
        </div>
      </div>

      {/* 1. STAFF ROLES MANAGEMENT TAB */}
      {activeSuperTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Staff Promotion Form */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(192, 132, 252, 0.35)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="#c084fc" />
              <span>Promote / Modify Admin Staff Permission Tier</span>
            </h3>

            <form onSubmit={handleRoleChange} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: '240px' }}>
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

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Target Permission Level</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                >
                  <option value="commander">Tier 1 — Commander (Operations)</option>
                  <option value="righthand">Tier 2 — Right Hand (Data & Content)</option>
                  <option value="master">Tier 3 — Master Admin (Reconciliation)</option>
                  <option value="superadmin">Super Admin (Full Unrestricted Access)</option>
                </select>
              </div>

              <button type="submit" disabled={updatingRole} className="btn-tactile btn-tactile-primary" style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} />
                <span>Assign Admin Role</span>
              </button>
            </form>

            {roleMsg && (
              <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: roleMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: roleMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)', fontSize: '0.82rem', color: roleMsg.type === 'success' ? '#34d399' : '#fca5a5' }}>
                {roleMsg.text}
              </div>
            )}
          </div>

          {/* Admin Staff Directory Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px' }}>
              Authorized Administrative Staff Directory
            </h3>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', color: '#f8fafc' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px' }}>Staff Email</th>
                    <th style={{ padding: '12px 16px' }}>Full Name</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Admin Level</th>
                    <th style={{ padding: '12px 16px' }}>Super Admin Privilege</th>
                    <th style={{ padding: '12px 16px' }}>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length > 0 ? (
                    staff.map((s) => (
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
                        <td style={{ padding: '12px 16px', color: s.admin_level === 'superadmin' ? '#34d399' : '#94a3b8' }}>
                          {s.admin_level === 'superadmin' ? 'YES (Full Master)' : 'NO (Scoped)'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>ACTIVE</span>
                        </td>
                      </tr>
                    ))
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

      {/* 2. GLOBAL AUDIT TRAIL TAB */}
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

      {/* 3. TIER 1 COMMANDER VIEW FOR SUPER ADMIN */}
      {activeSuperTab === 'commander' && (
        <CommanderDashboard commanderData={commanderData} onRefresh={onRefresh} />
      )}

      {/* 4. TIER 2 RIGHT HAND VIEW FOR SUPER ADMIN */}
      {activeSuperTab === 'righthand' && (
        <RightHandDashboard rightHandJobs={rightHandJobs} rightHandJobsTotal={rightHandJobsTotal} onRefresh={onRefresh} />
      )}

      {/* 5. TIER 3 MASTER ADMIN RECONCILIATION VIEW FOR SUPER ADMIN */}
      {activeSuperTab === 'master' && (
        <MasterAdminDashboard masterReconciliation={masterReconciliation} onRefresh={onRefresh} />
      )}
    </div>
  );
}
