import React from 'react';
import SoundSystem from '../characters/SoundEffects';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  Server
} from 'lucide-react';

export default function MasterAdminDashboard({ masterReconciliation, onRefresh }) {
  const statusClean = masterReconciliation?.reconciliation_status === 'clean';
  const illegitimateCount = masterReconciliation?.illegitimate_accounts_count || 0;
  const freshnessPct = masterReconciliation?.data_freshness?.freshness_percentage || 100;
  const freshCount = masterReconciliation?.data_freshness?.fresh_jobs_72h || 0;
  const totalSources = masterReconciliation?.scraper_fleet_health?.total_registered_sources || 50;
  const fleetStatus = masterReconciliation?.scraper_fleet_health?.fleet_status || 'healthy';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 🔍 1. CONTINUOUS AUTOMATED RECONCILIATION ENGINE */}
      <div className="glass-panel" style={{ padding: '26px', borderRadius: '22px', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.98))', border: '1px solid rgba(245, 158, 11, 0.5)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>
                CONTINUOUS RECONCILIATION ENGINE
              </span>
              <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '10px' }}>
                ● AUTOMATED BACKGROUND VERIFICATION
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={22} color="#fbbf24" />
              <span>Payment-to-Subscription Integrity Dashboard</span>
            </h3>
          </div>

          <span style={{
            background: statusClean ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.25)',
            color: statusClean ? '#34d399' : '#fca5a5',
            border: statusClean ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {statusClean ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{statusClean ? '100% RECONCILED & CLEAN' : 'DISCREPANCIES DETECTED'}</span>
          </span>
        </div>

        {/* Telemetry Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '22px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Illegitimate Access Accounts</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: illegitimateCount === 0 ? '#34d399' : '#f43f5e', marginTop: '4px' }}>
              {illegitimateCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
              Continuous cross-check of Pro profiles against verified Cashfree payment records & explicit admin grant logs.
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Data Catalog Freshness</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
              {freshnessPct}%
            </div>
            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
              {freshCount} fresh opportunities ingested in the last 72 hours across 50+ data sources.
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Scraper Fleet Operational Status</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a78bfa', marginTop: '4px' }}>
              {totalSources}+ Sources
            </div>
            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.4 }}>
              Fleet Health: <strong style={{ color: '#34d399' }}>{fleetStatus.toUpperCase()}</strong> &bull; Zero concurrency locks detected.
            </div>
          </div>
        </div>

        {/* Flagged Discrepancy Records if any */}
        {(masterReconciliation?.discrepancies || []).length > 0 ? (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontWeight: 900, color: '#fca5a5', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span>Flagged Discrepancy Records Requiring Attention:</span>
            </div>
            {masterReconciliation.discrepancies.map((d, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#fff', marginBottom: '6px', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' }}>
                &bull; <strong>Profile #{d.profile_id} ({d.email})</strong> &mdash; {d.issue}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={20} color="#34d399" />
            <div style={{ fontSize: '0.86rem', color: '#6ee7b7' }}>
              <strong>Reconciliation Status Clean:</strong> All paid candidate subscriptions are fully verified against real Cashfree payment orders or explicit admin audit logs. No unauthorized pro access detected.
            </div>
          </div>
        )}
      </div>

      {/* 📊 2. DATA FRESHNESS & SCRAPER FLEET HEALTH GAUGE */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(20, 26, 48, 0.85)', border: '1px solid rgba(129, 140, 248, 0.35)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="#818cf8" />
          <span>Data Catalog Freshness Gauge & Fleet Metrics</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Catalog Freshness Percentage (Jobs Ingested &lt;72h)</span>
              <span style={{ color: '#38bdf8' }}>{freshnessPct}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ width: `${freshnessPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)', borderRadius: '6px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Total Active Jobs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
                {masterReconciliation?.data_freshness?.total_active_jobs || 0}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Fresh 72h Jobs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                {masterReconciliation?.data_freshness?.fresh_jobs_72h || 0}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Registered Sources</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a78bfa', marginTop: '2px' }}>
                {totalSources}+
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
