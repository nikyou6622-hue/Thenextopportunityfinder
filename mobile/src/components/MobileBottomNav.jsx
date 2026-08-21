import React from 'react';
import { LayoutDashboard, FileText, Search, ShieldCheck, Layers } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, unreadMatchesCount = 0 }) {
  const tabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'resume', label: 'ATS', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Search, badge: unreadMatchesCount > 0 },
    { id: 'pipeline', label: 'Pipeline', icon: Layers },
    { id: 'settings', label: 'Settings', icon: ShieldCheck }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
            {tab.badge && <div className="nav-badge" />}
          </button>
        );
      })}
    </nav>
  );
}
