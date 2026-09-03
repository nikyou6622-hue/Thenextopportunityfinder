import React, { useState } from 'react';
import apiFetch from '../../lib/apiClient';
import SoundSystem from '../characters/SoundEffects';
import { 
  Zap, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Send,
  CreditCard,
  Building2,
  Briefcase,
  Globe,
  ShieldCheck,
  Inbox
} from 'lucide-react';

export default function CommanderDashboard({ commanderData, onRefresh, triggeringScraper, setTriggeringScraper, scraperMsg, setScraperMsg }) {
  const [respondingQueryId, setRespondingQueryId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

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
      onRefresh();
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
      onRefresh();
    } catch (err) {
      setScraperMsg('Link health check error.');
    }
  };

  // Support Reply Action
  const handleRespondSupportQuery = async (queryId) => {
    if (!responseText) return;
    try {
      const res = await apiFetch(`/api/admin/tier1/support/${queryId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      });
      if (res.ok) {
        setRespondingQueryId(null);
        setResponseText('');
        setActionSuccessMsg('Support ticket resolved and response sent to user.');
        SoundSystem.playSuccess();
        onRefresh();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      SoundSystem.playError();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 💰 1. COLLECTED ONLINE PAYMENTS SECTION (CASHFREE REVENUE) */}
      <div className="glass-panel" style={{ padding: '26px', borderRadius: '22px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.85))', border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>
                CASHFREE PAYMENT GATEWAY TELEMETRY
              </span>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '10px' }}>
                ● REAL-TIME SYNC
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={22} color="#34d399" />
              <span>Collected Online Payments & Running Revenue Balance</span>
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Total Revenue Collected</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399' }}>₹{commanderData?.total_revenue_collected || 0} INR</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Successful Payments</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#818cf8' }}>{commanderData?.payment_records_count || 0}</div>
            </div>
          </div>
        </div>

        {/* Payment Records Table */}
        <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', color: '#f8fafc' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>User Email</th>
                <th style={{ padding: '12px 16px' }}>Amount Paid</th>
                <th style={{ padding: '12px 16px' }}>Cashfree Order / Payment ID</th>
                <th style={{ padding: '12px 16px' }}>Payment Method</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Gateway Status</th>
              </tr>
            </thead>
            <tbody>
              {(commanderData?.payment_records || []).length > 0 ? (
                commanderData.payment_records.map((rec, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#818cf8' }}>{rec.user_email}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 900, color: '#34d399' }}>₹{rec.amount} {rec.currency}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#cbd5e1' }}>{rec.cf_payment_id}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{rec.payment_method}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{new Date(rec.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>
                        SUCCESSFUL
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: '#94a3b8' }}>
                    No Cashfree online payments recorded yet. Real transactions will populate automatically upon payment receipt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⚡ 2. SCRAPER CONTROL & OVERDUE MONITOR */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(99, 102, 241, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#fbbf24" />
              <span>Scraper Fleet Command & Overdue Monitoring</span>
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Real-time monitoring across 50+ registered technical job portals & ATS engines.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => handleRunScraper('all')} disabled={triggeringScraper} className="btn-tactile btn-tactile-amber" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} />
              <span>Trigger All Scrapers</span>
            </button>
            <button onClick={() => handleRunScraper('mnc')} disabled={triggeringScraper} className="btn-tactile btn-tactile-primary" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} />
              <span>MNC Portals</span>
            </button>
            <button onClick={() => handleRunScraper('internships')} disabled={triggeringScraper} className="btn-tactile btn-tactile-ghost" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} />
              <span>Internships</span>
            </button>
            <button onClick={() => handleRunScraper('global')} disabled={triggeringScraper} className="btn-tactile btn-tactile-ghost" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} />
              <span>Global Boards</span>
            </button>
            <button onClick={handleLinkHealthCheck} className="btn-tactile btn-tactile-ghost" style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              <span>Dead-Link Pass</span>
            </button>
          </div>
        </div>

        {scraperMsg && (
          <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', color: '#c7d2fe' }}>
            {scraperMsg}
          </div>
        )}

        {/* Overdue Monitoring Table */}
        <div style={{ overflowX: 'auto', maxHeight: '340px', overflowY: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', color: '#f8fafc' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '10px 14px' }}>Source Name</th>
                <th style={{ padding: '10px 14px' }}>Access Method</th>
                <th style={{ padding: '10px 14px' }}>Last Execution</th>
                <th style={{ padding: '10px 14px' }}>Schedule Status</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(commanderData?.scrapers_status || []).length > 0 ? (
                commanderData.scrapers_status.map((sc, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>{sc.name}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{sc.access_method}</td>
                    <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{sc.last_run === 'Never' ? 'Never' : new Date(sc.last_run).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {sc.is_overdue ? (
                        <span style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fca5a5', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>OVERDUE (&gt;24h)</span>
                      ) : (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>ON SCHEDULE</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => handleRunScraper(sc.key)} disabled={triggeringScraper} className="btn-tactile btn-tactile-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                        Run Now
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading scraper status telemetries...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🐛 3. LIVE PRODUCTION ERROR FEED & GITHUB ACTIONS CORRELATION */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(244, 63, 94, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#f43f5e" />
              <span>Live Production Error Diagnostics Feed</span>
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Correlated with backend ErrorLogModel exception traces & GitHub Actions workflow runs.
            </div>
          </div>
          <a href="https://github.com/nikyou6622-hue/Thenextopportunityfinder/actions" target="_blank" rel="noreferrer" className="btn-tactile btn-tactile-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc' }}>
            <ExternalLink size={15} />
            <span>GitHub Actions Dashboard</span>
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(commanderData?.live_error_feed || []).length > 0 ? (
            commanderData.live_error_feed.map((err) => (
              <div key={err.id} style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase' }}>
                    [{err.error_type}] &bull; {err.source}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#f8fafc', marginTop: '3px', fontWeight: 600 }}>
                    {err.error_message}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                    Occurrences: {err.occurred_count} &bull; Timestamp: {err.occurred_at ? new Date(err.occurred_at).toLocaleString() : 'Recent'}
                  </div>
                </div>
                <a href={err.github_actions_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.76rem', color: '#38bdf8', textDecoration: 'underline', fontWeight: 700 }}>
                  Inspect Workflow Run &rarr;
                </a>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '14px' }}>
              ✅ Zero live production errors logged. All backend endpoints & scraper workers operating clean.
            </div>
          )}
        </div>
      </div>

      {/* 📬 4. USER SUPPORT INBOX */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(168, 85, 247, 0.35)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Inbox size={20} color="#c084fc" />
          <span>User Support Queries & Ticket Inbox</span>
        </h3>

        {actionSuccessMsg && (
          <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(commanderData?.support_inbox || []).length > 0 ? (
            commanderData.support_inbox.map((q) => (
              <div key={q.id} style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#c084fc', fontSize: '0.88rem' }}>
                    {q.user_name} &lt;{q.user_email}&gt;
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '8px', background: q.status === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: q.status === 'resolved' ? '#34d399' : '#fbbf24', fontWeight: 800 }}>
                    {q.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.86rem', marginBottom: '4px' }}>{q.subject}</div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>{q.message}</div>

                {q.admin_response ? (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(168, 85, 247, 0.12)', borderLeft: '3px solid #c084fc', borderRadius: '4px', fontSize: '0.8rem', color: '#e9d5ff' }}>
                    <strong>Admin Response:</strong> {q.admin_response}
                  </div>
                ) : (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Type official support resolution..."
                      value={respondingQueryId === q.id ? responseText : ''}
                      onChange={(e) => { setRespondingQueryId(q.id); setResponseText(e.target.value); }}
                      style={{ flex: 1, padding: '8px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                    />
                    <button onClick={() => handleRespondSupportQuery(q.id)} className="btn-tactile btn-tactile-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Send size={14} />
                      <span>Reply & Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
              No open candidate support tickets in the inbox.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
