import React, { useState, useEffect } from 'react';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import MobileOverview from './components/MobileOverview';
import MobileAtsScanner from './components/MobileAtsScanner';
import MobileJobFeed from './components/MobileJobFeed';
import MobilePipeline from './components/MobilePipeline';
import MobileSettings from './components/MobileSettings';
import './mobile.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Profile
      const profRes = await fetch('/api/profile');
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }

      // 2. Matches
      const matchRes = await fetch('/api/matches');
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        setMatches(matchData || []);
      }

      // 3. Applications
      const appRes = await fetch('/api/applications');
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData || []);
      }

      // 4. Metrics
      const metRes = await fetch('/api/dashboard/metrics');
      if (metRes.ok) {
        const metData = await metRes.json();
        setMetrics(metData);
      }
    } catch (err) {
      console.error("Failed to load mobile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      await fetch('/api/jobs/discover', { method: 'POST' });
      await loadData();
    } catch (e) {
      console.error("Discovery error:", e);
    } finally {
      setDiscovering(false);
    }
  };

  const handleUploadResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/profile/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    const data = await res.json();
    setProfile(data);
    await loadData();
  };

  const handleTailor = async (matchId) => {
    const res = await fetch(`/api/applications/tailor/${matchId}`, { method: 'POST' });
    if (res.ok) {
      await loadData();
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      await loadData();
    }
  };

  return (
    <div className="mobile-app-container">
      <MobileHeader 
        profile={profile} 
        onRefresh={loadData} 
        loading={loading} 
      />

      <main className="mobile-content">
        {activeTab === 'overview' && (
          <MobileOverview 
            metrics={metrics}
            profile={profile}
            matches={matches}
            onDiscover={handleDiscover}
            onNavigate={setActiveTab}
            discovering={discovering}
          />
        )}

        {activeTab === 'resume' && (
          <MobileAtsScanner 
            profile={profile}
            onUpload={handleUploadResume}
            loading={loading}
          />
        )}

        {activeTab === 'jobs' && (
          <MobileJobFeed 
            matches={matches}
            onTailor={handleTailor}
            onDiscover={handleDiscover}
            discovering={discovering}
          />
        )}

        {activeTab === 'prep' && (
          <MobileInterviewPrep 
            applications={applications}
          />
        )}

        {activeTab === 'pipeline' && (
          <MobilePipeline 
            applications={applications} 
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'settings' && (
          <MobileSettings 
            profile={profile}
            onReset={loadData}
          />
        )}
      </main>

      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        unreadMatchesCount={matches.length}
      />
    </div>
  );
}
