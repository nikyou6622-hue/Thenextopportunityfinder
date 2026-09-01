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
  ArrowLeft
} from 'lucide-react';

export default function AdminPanel({ user, onBackToApp }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

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
      const usersRes = await apiFetch(`/api/admin/users?limit=100${searchQuery ? '&search=' + encodeURIComponent(searchQuery) : ''}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError(err.message || 'An error occurred loading the admin panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery]);

  const handleGrantPro = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    setActionNotice(null);
    try {
      const res = await apiFetch(`/api/admin/users/${targetUserId}/grant-pro`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionNotice({ type: 'success', text: data.message || 'Pro access granted.' });
        await fetchAdminData();
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
        await fetchAdminData();
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
            <Crown color="#fbbf24" size={28} /> Subscription Admin Panel
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            System Administrator Monitor — Logged in as <span style={{ color: '#818cf8', fontWeight: 700 }}>{user?.email || 'Admin'}</span>
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 700 }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
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

      {/* Search & User Management Table */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            User Account & Subscription Management
          </h2>

          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search user by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.82rem'
              }}
            />
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
                <th style={{ padding: '12px 14px' }}>Plan Tier</th>
                <th style={{ padding: '12px 14px' }}>Valid Until</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isProUser = u.plan_tier === 'pro';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{u.full_name || 'Candidate'}</div>
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

                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: isProUser ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: isProUser ? '#34d399' : '#94a3b8',
                          border: '1px solid ' + (isProUser ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)')
                        }}>
                          {isProUser ? '★ PRO' : 'FREE'}
                        </span>
                      </td>

                      <td style={{ padding: '14px', color: isProUser ? '#a7f3d0' : '#64748b', fontSize: '0.8rem', fontWeight: isProUser ? 700 : 400 }}>
                        {u.valid_until ? new Date(u.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        {isProUser ? (
                          <button
                            onClick={() => handleRevokePro(u.id)}
                            disabled={actionLoadingId === u.id}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
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
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Grant Pro (6 Mo)
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
