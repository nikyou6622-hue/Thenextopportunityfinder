import React, { useState } from 'react';
import apiFetch from '../../lib/apiClient';
import SoundSystem from '../characters/SoundEffects';
import { 
  UserPlus, 
  Trash2, 
  Send, 
  Search, 
  CheckCircle2, 
  Briefcase, 
  Mail,
  Filter,
  Building,
  RefreshCw
} from 'lucide-react';

export default function RightHandDashboard({ rightHandJobs, rightHandJobsTotal, onRefresh }) {
  // Manual User Creation State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserMsg, setNewUserMsg] = useState('');

  // Announcement State
  const [announcementSubject, setAnnouncementSubject] = useState('New Verified Opportunities Digest');
  const [announcementBody, setAnnouncementBody] = useState('Here is your latest digest of verified technical openings on Next Opportunity Finder!');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Search & Filter State for Job Catalog
  const [jobSearch, setJobSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Action: Create Support User
  const handleCreateSupportUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail) return;
    try {
      const res = await apiFetch('/api/admin/tier2/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail, full_name: newUserName || 'Candidate User' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create candidate user.');
      setNewUserMsg(`✅ ${data.message}`);
      setNewUserEmail('');
      setNewUserName('');
      SoundSystem.playSuccess();
      onRefresh();
    } catch (err) {
      setNewUserMsg(`⚠️ ${err.message}`);
      SoundSystem.playError();
    }
  };

  // Action: Send Announcement
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementBody) return;
    setSendingAnnouncement(true);
    try {
      const res = await apiFetch('/api/admin/tier2/email/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: announcementSubject, body: announcementBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send platform announcement.');
      setAnnouncementMsg(`✅ ${data.message}`);
      SoundSystem.playSuccess();
      onRefresh();
    } catch (err) {
      setAnnouncementMsg(`⚠️ ${err.message}`);
      SoundSystem.playError();
    } finally {
      setSendingAnnouncement(false);
    }
  };

  // Action: Delete Job
  const handleDeleteJob = async (jobId) => {
    try {
      const res = await apiFetch(`/api/admin/tier2/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionSuccessMsg(`Job #${jobId} marked as removed.`);
        SoundSystem.playPop();
        onRefresh();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      SoundSystem.playError();
    }
  };

  // Action: Expired Cleanup Trigger
  const handleTriggerExpiredCleanup = async () => {
    try {
      const res = await apiFetch('/api/admin/tier2/jobs/cleanup-expired', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionSuccessMsg(`Purged ${data.expired_jobs_removed} expired jobs from catalog.`);
        SoundSystem.playSuccess();
        onRefresh();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      SoundSystem.playError();
    }
  };

  // Client Filtered Jobs
  const filteredJobs = rightHandJobs.filter(j => {
    const q = jobSearch.toLowerCase();
    const matchesSearch = !q || j.company?.toLowerCase().includes(q) || j.role_title?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
    const matchesCompany = !companyFilter || j.company?.toLowerCase().includes(companyFilter.toLowerCase());
    const matchesSource = sourceFilter === 'all' || j.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesCompany && matchesSource && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 👤 1. MANUAL SUPPORT ACCOUNT CREATION FORM */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={20} color="#38bdf8" />
          <span>Manual Support Account Provisioning (Default Free Tier)</span>
        </h3>
        
        <form onSubmit={handleCreateSupportUser} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Candidate Email</label>
            <input
              type="email"
              placeholder="candidate.support@dev.io"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              placeholder="Candidate User"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" className="btn-tactile btn-tactile-primary" style={{ padding: '10px 20px', fontSize: '0.84rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} />
            <span>Provision Candidate Account</span>
          </button>
        </form>

        {newUserMsg && (
          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.82rem', color: '#38bdf8' }}>
            {newUserMsg}
          </div>
        )}
      </div>

      {/* 🗄️ 2. DEEP DATABASE JOB CATALOG EXPLORER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(99, 102, 241, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#818cf8" />
              <span>Deep Database Job Catalog Explorer ({rightHandJobsTotal} Postings)</span>
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Inspect technical opportunities, filter by company or source, and trigger deadline purges.
            </div>
          </div>

          <button onClick={handleTriggerExpiredCleanup} className="btn-tactile btn-tactile-amber" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={16} />
            <span>Run Expired-Job Purge Pass</span>
          </button>
        </div>

        {actionSuccessMsg && (
          <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.82rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Catalog Filters Bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search company, role title, or location..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="removed">Removed Only</option>
          </select>
        </div>

        {/* Jobs Table */}
        <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', color: '#f8fafc' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '10px 14px' }}>ID</th>
                <th style={{ padding: '10px 14px' }}>Company</th>
                <th style={{ padding: '10px 14px' }}>Role Title</th>
                <th style={{ padding: '10px 14px' }}>Location</th>
                <th style={{ padding: '10px 14px' }}>Source Platform</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((j) => (
                  <tr key={j.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontFamily: 'monospace' }}>#{j.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>{j.company}</td>
                    <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{j.role_title}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{j.location}</td>
                    <td style={{ padding: '10px 14px', color: '#a78bfa', fontWeight: 600 }}>{j.source}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: j.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', color: j.status === 'active' ? '#34d399' : '#fca5a5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                        {j.status ? j.status.toUpperCase() : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {j.status !== 'removed' && (
                        <button onClick={() => handleDeleteJob(j.id)} className="btn-tactile btn-tactile-ghost" style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#f43f5e' }}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No job postings matching current search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📧 3. TRANSACTIONAL ANNOUNCEMENT EMAIL SENDER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={20} color="#fbbf24" />
          <span>Batch Email Announcement Sender (With Compliant Unsubscribe Link)</span>
        </h3>
        
        <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Subject Line</label>
            <input
              type="text"
              value={announcementSubject}
              onChange={(e) => setAnnouncementSubject(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Email Body Content</label>
            <textarea
              rows={4}
              value={announcementBody}
              onChange={(e) => setAnnouncementBody(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" disabled={sendingAnnouncement} className="btn-tactile btn-tactile-amber" style={{ padding: '10px 20px', fontSize: '0.84rem', fontWeight: 800, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sendingAnnouncement ? <RefreshCw size={16} className="spin-anim" /> : <Send size={16} />}
            <span>{sendingAnnouncement ? 'Queueing Broadcast...' : 'Send Platform Broadcast Announcement'}</span>
          </button>
        </form>

        {announcementMsg && (
          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.82rem', color: '#fbbf24' }}>
            {announcementMsg}
          </div>
        )}
      </div>
    </div>
  );
}
