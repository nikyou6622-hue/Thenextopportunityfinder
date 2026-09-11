import React, { useState, useEffect } from 'react';
import apiFetch from '../lib/apiClient';
import { 
  Users, 
  Crown, 
  IndianRupee, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  UserCheck, 
  UserX,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  UserPlus,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function AdminPanel({ user, onBackToApp }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit_logs'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Add User Modal State
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    targetRole: 'Software Engineer',
    experienceLevel: 'Entry Level / Student',
    subscriptionTier: 'free'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Deactivate Modal State
  const [deactivateModalUser, setDeactivateModalUser] = useState(null);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');
  const [deactivatingUser, setDeactivatingUser] = useState(false);

  // Hard Delete Modal State
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingUser, setDeletingUser] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotalCount, setAuditTotalCount] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Admin Stats
      const statsRes = await apiFetch('/api/admin/stats');
      if (statsRes.status === 403) {
        throw new Error('Access denied: You need system administrator privileges to view this page.');
      }
      if (!statsRes.ok) {
        throw new Error('Failed to load admin telemetry.');
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Users List
      await fetchUsersList();
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError(err.message || 'An error occurred loading the admin panel.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      let url = `/api/admin/users?page=${page}&limit=${limit}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      if (statusFilter && statusFilter !== 'all') url += `&subscription_status=${statusFilter}`;
      
      const usersRes = await apiFetch(url);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        setTotalUsersCount(usersData.total_users || 0);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      let url = `/api/admin/audit-logs?page=${auditPage}&limit=20`;
      if (auditActionFilter && auditActionFilter !== 'all') {
        url += `&action_filter=${encodeURIComponent(auditActionFilter)}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setAuditTotalCount(data.total_audit_logs || 0);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    if (activeTab === 'audit_logs') {
      fetchAuditLogs();
    }
  }, [activeTab, auditPage, auditActionFilter]);

  const handleGrantPro = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    setActionNotice(null);
    try {
      const res = await apiFetch(`/api/admin/users/${targetUserId}/grant-pro`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', text: data.message || 'Pro access granted.' });
        await fetchUsersList();
      } else {
        setActionNotice({ type: 'error', text: data.detail || 'Failed to grant Pro access.' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRevokePro = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    setActionNotice(null);
    try {
      const res = await apiFetch(`/api/admin/users/${targetUserId}/revoke-pro`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', text: data.message || 'Pro access revoked.' });
        await fetchUsersList();
      } else {
        setActionNotice({ type: 'error', text: data.detail || 'Failed to revoke Pro access.' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.email.includes('@')) {
      setActionNotice({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!newUserForm.fullName.trim()) {
      setActionNotice({ type: 'error', text: 'Please enter full name.' });
      return;
    }

    setCreatingUser(true);
    setActionNotice(null);
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserForm.email.trim(),
          full_name: newUserForm.fullName.trim(),
          password: newUserForm.password.trim() || undefined,
          target_role: newUserForm.targetRole,
          experience_level: newUserForm.experienceLevel,
          subscription_tier: newUserForm.subscriptionTier
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create user account.');
      }

      setActionNotice({ 
        type: 'success', 
        text: `Account created for ${data.email}! Generated password: ${data.generated_password}` 
      });

      setAddUserModalOpen(false);
      setNewUserForm({
        fullName: '',
        email: '',
        password: '',
        targetRole: 'Software Engineer',
        experienceLevel: 'Entry Level / Student',
        subscriptionTier: 'free'
      });
      await fetchUsersList();
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateModalUser) return;
    setDeactivatingUser(true);
    setActionNotice(null);
    try {
      const res = await apiFetch(`/api/admin/users/${deactivateModalUser.id}/deactivate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', text: data.message || 'User account deactivated.' });
        setDeactivateModalUser(null);
        setDeactivateConfirmText('');
        await fetchUsersList();
      } else {
        setActionNotice({ type: 'error', text: data.detail || 'Failed to deactivate user.' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setDeactivatingUser(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleReactivateUser = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    setActionNotice(null);
    try {
      const res = await apiFetch(`/api/admin/users/${targetUserId}/reactivate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', text: data.message || 'User account reactivated.' });
        await fetchUsersList();
      } else {
        setActionNotice({ type: 'error', text: data.detail || 'Failed to reactivate user.' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    setDeletingUser(true);
    setActionNotice(null);
    try {
      const res = await apiFetch(`/api/admin/users/${deleteModalUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', text: data.message || 'User account permanently deleted.' });
        setDeleteModalUser(null);
        setDeleteConfirmText('');
        await fetchUsersList();
      } else {
        setActionNotice({ type: 'error', text: data.detail || 'Failed to delete user.' });
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setDeletingUser(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  if (error && error.includes('denied')) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '60px auto', textAlign: 'center' }} className="glass-panel">
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 12px 0' }}>403 Access Denied</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '24px' }}>
          Server-side security check failed: Only authenticated system administrator accounts can access this panel.
        </p>
        <button onClick={onBackToApp} className="btn-primary" style={{ padding: '10px 20px' }}>
          Return to Application
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(totalUsersCount / limit) || 1;
  const auditTotalPages = Math.ceil(auditTotalCount / 20) || 1;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button 
            onClick={onBackToApp}
            style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown color="#fbbf24" size={28} /> Super Admin Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            User Management & Subscription Visibility Subsystem — Authenticated as <span style={{ color: '#818cf8', fontWeight: 700 }}>{user?.email || 'Admin'}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAddUserModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <UserPlus size={16} />
            <span>+ Add User Account</span>
          </button>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: 700,
          background: actionNotice.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: '1px solid ' + (actionNotice.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'),
          color: actionNotice.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {actionNotice.text}
        </div>
      )}

      {/* Summary Analytics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Registered Users</span>
              <Users size={20} color="#818cf8" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc' }}>{stats.total_users}</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
              {stats.signups_this_week} new signups this week
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Active Pro Members</span>
              <Crown size={20} color="#34d399" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>{stats.pro_users}</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
              {stats.free_users} free tier members
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Revenue</span>
              <IndianRupee size={20} color="#fbbf24" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24' }}>₹{stats.total_revenue?.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
              ₹99 per 6-month access
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #ec4899' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Free-to-Pro Conversion</span>
              <TrendingUp size={20} color="#f472b6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f472b6' }}>{stats.conversion_rate_pct}%</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
              Conversion performance rate
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: activeTab === 'users' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'users' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            color: activeTab === 'users' ? '#818cf8' : '#94a3b8',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} /> User Management ({totalUsersCount})
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          style={{
            background: activeTab === 'audit_logs' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'audit_logs' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            color: activeTab === 'audit_logs' ? '#818cf8' : '#94a3b8',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Shield size={16} /> Audit Trail & Logs ({auditTotalCount})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Search, Filter & Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Candidate Directory & Real Payment Status
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Subscription Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} color="#94a3b8" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Subscriptions</option>
                  <option value="pro">★ Pro (Active)</option>
                  <option value="expired">⏰ Expired (Lapsed)</option>
                  <option value="free">Free Tier</option>
                </select>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search email or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* User Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>User / Email</th>
                  <th style={{ padding: '12px 14px' }}>Target Role</th>
                  <th style={{ padding: '12px 14px' }}>Signup Date</th>
                  <th style={{ padding: '12px 14px' }}>Real Subscription Status</th>
                  <th style={{ padding: '12px 14px' }}>Valid Until</th>
                  <th style={{ padding: '12px 14px' }}>Account State</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      No users found matching current filter query.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const status = u.subscription_status || u.plan_tier || 'free';
                    const isPro = status === 'pro';
                    const isExpired = status === 'expired';
                    const isSelf = user?.id === u.id || (user?.email && user.email.toLowerCase() === u.email?.toLowerCase());

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: u.is_active ? 1 : 0.6 }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 700, color: u.is_active ? '#f8fafc' : '#94a3b8' }}>
                            {u.full_name || 'Candidate'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.email}</div>
                          {u.is_admin && (
                            <span style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.4)', color: '#fde047', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>
                              ADMIN
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px', color: '#cbd5e1' }}>
                          {u.target_role || 'Software Engineer'}
                        </td>

                        <td style={{ padding: '14px', color: '#94a3b8', fontSize: '0.8rem' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                        {/* Derived Subscription Status Badge (3 Distinct States) */}
                        <td style={{ padding: '14px' }}>
                          {isPro && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                              ★ PRO
                            </span>
                          )}
                          {isExpired && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                              ⏰ EXPIRED
                            </span>
                          )}
                          {!isPro && !isExpired && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              FREE
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px', color: isPro ? '#a7f3d0' : (isExpired ? '#fde68a' : '#64748b'), fontSize: '0.8rem', fontWeight: isPro ? 700 : 400 }}>
                          {u.valid_until ? new Date(u.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                        {/* Account Active / Deactivated State */}
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: u.is_active ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: u.is_active ? '#60a5fa' : '#f87171',
                            border: `1px solid ${u.is_active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                            
                            {/* Grant/Revoke Pro */}
                            {isPro ? (
                              <button
                                onClick={() => handleRevokePro(u.id)}
                                disabled={actionLoadingId === u.id}
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  color: '#fbbf24',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Revoke Pro
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGrantPro(u.id)}
                                disabled={actionLoadingId === u.id}
                                style={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  color: '#34d399',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Grant Pro
                              </button>
                            )}

                            {/* Soft-Deactivate / Reactivate with Self-Lockout Shield */}
                            {u.is_active ? (
                              <button
                                onClick={() => setDeactivateModalUser(u)}
                                disabled={isSelf || actionLoadingId === u.id}
                                title={isSelf ? "Self-deactivation disabled to prevent accidental admin lockout" : "Soft-deactivate user account"}
                                style={{
                                  background: isSelf ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.15)',
                                  border: `1px solid ${isSelf ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.3)'}`,
                                  color: isSelf ? '#64748b' : '#f87171',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: isSelf ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {isSelf && <Lock size={12} />}
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivateUser(u.id)}
                                disabled={actionLoadingId === u.id}
                                style={{
                                  background: 'rgba(59, 130, 246, 0.15)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  color: '#60a5fa',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Reactivate
                              </button>
                            )}

                            {/* Hard Delete / Purge User with Self-Lockout Shield */}
                            <button
                              onClick={() => setDeleteModalUser(u)}
                              disabled={isSelf || actionLoadingId === u.id}
                              title={isSelf ? "Self-deletion disabled to prevent accidental admin lockout" : "Permanently purge user account & data"}
                              style={{
                                background: isSelf ? 'rgba(255, 255, 255, 0.05)' : 'rgba(225, 29, 72, 0.15)',
                                border: `1px solid ${isSelf ? 'rgba(255, 255, 255, 0.1)' : 'rgba(225, 29, 72, 0.3)'}`,
                                color: isSelf ? '#64748b' : '#f43f5e',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isSelf && <Lock size={12} />}
                              Purge
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Page {page} of {totalPages} ({totalUsersCount} total candidates)
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: page <= 1 ? '#475569' : '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: page >= totalPages ? '#475569' : '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#818cf8" /> Super Admin Operational Audit Log
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Read-only immutable log of every administrative action (creations, deactivations, role changes, Pro grants).
              </p>
            </div>

            {/* Action Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="#94a3b8" />
              <select
                value={auditActionFilter}
                onChange={(e) => {
                  setAuditActionFilter(e.target.value);
                  setAuditPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Audit Actions</option>
                <option value="user_created">user_created</option>
                <option value="user_deactivated">user_deactivated</option>
                <option value="user_reactivated">user_reactivated</option>
                <option value="upgrade_pro">upgrade_pro</option>
                <option value="revoke_pro">revoke_pro</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Log ID</th>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Admin Executed</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                  <th style={{ padding: '10px 12px' }}>Target Candidate</th>
                  <th style={{ padding: '10px 12px' }}>Operation Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#818cf8' }}>
                      <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      No audit log entries recorded for selected action filter.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: '#64748b', fontFamily: 'monospace' }}>#{log.id}</td>
                      
                      <td style={{ padding: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </td>

                      <td style={{ padding: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                        {log.admin_email || `User #${log.admin_user_id}`}
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}>
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: '12px', color: '#f8fafc' }}>
                        {log.target_user_email || `User #${log.target_user_id}` || 'N/A'}
                      </td>

                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Audit Logs Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Page {auditPage} of {auditTotalPages} ({auditTotalCount} logged actions)
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={auditPage <= 1}
                onClick={() => setAuditPage(prev => Math.max(1, prev - 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: auditPage <= 1 ? '#475569' : '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: auditPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <button
                disabled={auditPage >= auditTotalPages}
                onClick={() => setAuditPage(prev => Math.min(auditTotalPages, prev + 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: auditPage >= auditTotalPages ? '#475569' : '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: auditPage >= auditTotalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD USER ACCOUNT MODAL */}
      {addUserModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }}>
            <button
              onClick={() => setAddUserModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} color="#818cf8" /> Create Candidate Account
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 18px 0' }}>
              Manually provision candidate user credentials & subscription tier with full email validation.
            </p>

            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Candidate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@domain.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Password (Optional — leave blank for auto-gen)</label>
                <input
                  type="text"
                  placeholder="Minimum 6 characters"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Role</label>
                  <select
                    value={newUserForm.targetRole}
                    onChange={(e) => setNewUserForm({ ...newUserForm, targetRole: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.8rem' }}
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Full Stack Engineer">Full Stack Engineer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Initial Subscription</label>
                  <select
                    value={newUserForm.subscriptionTier}
                    onChange={(e) => setNewUserForm({ ...newUserForm, subscriptionTier: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.8rem' }}
                  >
                    <option value="free">Free Tier</option>
                    <option value="pro">Pro Tier (6 Months)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '9px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DEACTIVATION MODAL */}
      {deactivateModalUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', border: '1px solid rgba(239, 68, 68, 0.4)', position: 'relative' }}>
            <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0', textAlign: 'center' }}>
              Confirm Account Deactivation
            </h3>
            
            <p style={{ fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 16px 0', textAlign: 'center' }}>
              Are you sure you want to soft-deactivate candidate account <strong style={{ color: '#f87171' }}>{deactivateModalUser.email}</strong>? 
              They will be immediately blocked from logging in.
            </p>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.74rem', color: '#fca5a5', fontWeight: 700 }}>
                Type "DEACTIVATE" below to confirm:
              </span>
              <input
                type="text"
                placeholder="DEACTIVATE"
                value={deactivateConfirmText}
                onChange={(e) => setDeactivateConfirmText(e.target.value)}
                style={{ width: '100%', marginTop: '6px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setDeactivateModalUser(null);
                  setDeactivateConfirmText('');
                }}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeactivateConfirm}
                disabled={deactivateConfirmText.trim().toUpperCase() !== 'DEACTIVATE' || deactivatingUser}
                style={{
                  background: deactivateConfirmText.trim().toUpperCase() === 'DEACTIVATE' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: deactivateConfirmText.trim().toUpperCase() === 'DEACTIVATE' ? 'pointer' : 'not-allowed'
                }}
              >
                {deactivatingUser ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM HARD DELETE MODAL */}
      {deleteModalUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', border: '1px solid rgba(225, 29, 72, 0.5)', position: 'relative' }}>
            <AlertTriangle size={36} color="#e11d48" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0', textAlign: 'center' }}>
              Confirm Hard Cascade Purge
            </h3>
            
            <p style={{ fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 16px 0', textAlign: 'center' }}>
              Are you sure you want to permanently purge candidate <strong style={{ color: '#f43f5e' }}>{deleteModalUser.email}</strong> and all associated profile, application, match, and subscription records? This action is <strong style={{ color: '#fff' }}>irreversible</strong>.
            </p>

            <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.74rem', color: '#fda4af', fontWeight: 700 }}>
                Type "DELETE" below to confirm purge:
              </span>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{ width: '100%', marginTop: '6px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(225, 29, 72, 0.4)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setDeleteModalUser(null);
                  setDeleteConfirmText('');
                }}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || deletingUser}
                style={{
                  background: deleteConfirmText.trim().toUpperCase() === 'DELETE' ? '#e11d48' : 'rgba(225, 29, 72, 0.3)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: deleteConfirmText.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed'
                }}
              >
                {deletingUser ? 'Purging...' : 'Execute Hard Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
