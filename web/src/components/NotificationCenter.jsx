import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, AlertTriangle, Building2, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function NotificationCenter({ profileId, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [profileId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications${profileId ? `/${profileId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  if (visibleNotifications.length === 0 && !loading) {
    return null; // Per Skill 5 / Blueprint: zero filler content when empty
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Bell size={16} color="#818cf8" />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Real-Time Intelligence & Alerts ({visibleNotifications.length})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleNotifications.map((n) => {
          const isWarning = n.severity === 'warning';
          const isSuccess = n.severity === 'success';

          return (
            <div
              key={n.id}
              onClick={() => n.action_tab && onNavigate && onNavigate(n.action_tab)}
              className="glass-card glass-card-hover"
              style={{
                padding: '14px 18px',
                cursor: n.action_tab ? 'pointer' : 'default',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isWarning 
                  ? 'linear-gradient(90deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)' 
                  : isSuccess 
                  ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)' 
                  : 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
                borderLeft: `4px solid ${isWarning ? '#f43f5e' : isSuccess ? '#10b981' : '#6366f1'}`,
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isWarning ? 'rgba(244, 63, 94, 0.2)' : isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isWarning && <AlertTriangle size={16} color="#f43f5e" />}
                  {isSuccess && <Sparkles size={16} color="#34d399" />}
                  {!isWarning && !isSuccess && <Building2 size={16} color="#818cf8" />}
                </div>

                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {n.message}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {n.action_tab && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isWarning ? '#fda4af' : isSuccess ? '#6ee7b7' : '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View <ArrowRight size={13} />
                  </span>
                )}
                <button
                  onClick={(e) => handleDismiss(n.id, e)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
