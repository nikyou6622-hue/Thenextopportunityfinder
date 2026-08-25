import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Sparkles, 
  MapPin, 
  Clock, 
  Briefcase, 
  ArrowRight,
  ExternalLink,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';
import EmptyStateCharacter from './characters/EmptyStateCharacter';

export default function SavedJobsView({ 
  savedJobs = [], 
  onSelectJob, 
  onRemoveJob, 
  onTailor,
  onNavigate 
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'jobs' | 'companies'

  // If savedJobs is empty, display curated default saved items
  const displayJobs = savedJobs.length > 0 ? savedJobs : [
    {
      id: 'saved-1',
      title: 'Full Stack Engineer',
      company: 'Spotify',
      location: 'Bengaluru / Remote',
      job_type: 'Full-time',
      experience_level: '1-3 years exp',
      salary_range: '₹28L - ₹42L / yr',
      theme: 'card-next-amber',
      logo: 'S'
    },
    {
      id: 'saved-2',
      title: 'Sr. Backend Engineer',
      company: 'Google',
      location: 'Bengaluru / Hyderabad',
      job_type: 'Full-time',
      experience_level: '3+ years exp',
      salary_range: '₹45L - ₹65L / yr',
      theme: 'card-next-purple',
      logo: 'G'
    },
    {
      id: 'saved-3',
      title: 'Product Engineer',
      company: 'CRED',
      location: 'Bengaluru',
      job_type: 'Full-time',
      experience_level: '1-3 years exp',
      salary_range: '₹24L - ₹36L / yr',
      theme: 'card-next-coral',
      logo: 'C'
    },
    {
      id: 'saved-4',
      title: 'Frontend Developer',
      company: 'Razorpay',
      location: 'Bengaluru / Remote',
      job_type: 'Full-time',
      experience_level: '2+ years exp',
      salary_range: '₹30L - ₹45L / yr',
      theme: 'card-next-dark',
      logo: 'R'
    }
  ];

  const filteredList = displayJobs.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'jobs') return true;
    if (filterType === 'companies') return item.company;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header & Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'rgba(255, 176, 32, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bookmark size={18} color="#FFB020" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              Saved Opportunities
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {filteredList.length} bookmarked roles ready for application
            </span>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {['all', 'jobs', 'companies'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: filterType === t ? '#7C3AED' : 'transparent',
                color: filterType === t ? '#FFFFFF' : '#94A3B8'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="job-cards-grid">
        {filteredList.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyStateCharacter
              character="nova"
              pose="search"
              title="No Saved Bookmarks Yet"
              description="Explore 10,000+ live verified tech opportunities and bookmark your dream roles with one tap."
              actionLabel="Discover Opportunities →"
              onAction={() => {
                SoundSystem.playPop();
                if (onNavigate) onNavigate('jobs');
              }}
            />
          </div>
        ) : (
          filteredList.map((job, idx) => {
          const comp = job.company || 'TechCorp';
          const cLower = comp.toLowerCase();

          const themeType = cLower.includes('spotify') ? 'amber' :
            cLower.includes('airbnb') ? 'coral' :
            cLower.includes('google') ? 'purple' :
            idx % 4 === 0 ? 'purple' :
            idx % 4 === 1 ? 'coral' :
            idx % 4 === 2 ? 'amber' :
            'cyan';

          const isAmber = themeType === 'amber';
          const bgGradient = themeType === 'purple' 
            ? 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)'
            : themeType === 'coral'
            ? 'linear-gradient(135deg, #9f1239 0%, #dc2626 45%, #ff5a5f 100%)'
            : themeType === 'amber'
            ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 45%, #ffb020 100%)'
            : 'linear-gradient(135deg, #0369a1 0%, #0284c7 45%, #0ea5e9 100%)';

          return (
            <div
              key={job.id || idx}
              className="two-tone-job-card"
              onClick={() => onSelectJob && onSelectJob(job)}
              style={{
                position: 'relative',
                zIndex: 2,
                isolation: 'isolate',
                transform: 'translateZ(0)',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                opacity: 1,
                visibility: 'visible'
              }}
            >
              {/* Top Vibrant Body */}
              <div 
                className={`two-tone-body two-tone-${themeType}`}
                style={{
                  background: bgGradient,
                  color: isAmber ? '#0F172A' : '#FFFFFF',
                  padding: '20px 20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flex: 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: isAmber ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.15rem',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
                    }}>
                      {job.logo || comp.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.05rem', 
                        fontWeight: 800, 
                        color: isAmber ? '#0F172A' : '#FFFFFF', 
                        lineHeight: 1.2,
                        margin: 0
                      }}>
                        {job.title}
                      </h3>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: isAmber ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
                        fontWeight: 600 
                      }}>
                        {comp}
                      </span>
                    </div>
                  </div>

                  {onRemoveJob && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveJob(job.id);
                      }}
                      style={{
                        background: isAmber ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAmber ? '#0F172A' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Tags Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                  <span style={{
                    background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                    color: isAmber ? '#0F172A' : '#FFFFFF',
                    borderRadius: '9999px',
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MapPin size={10} /> {job.location || 'Remote'}
                  </span>
                  <span style={{
                    background: isAmber ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)',
                    color: isAmber ? '#0F172A' : '#FFFFFF',
                    borderRadius: '9999px',
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Briefcase size={10} /> {job.job_type || 'Full-time'}
                  </span>
                </div>
              </div>

              {/* Bottom White Footer */}
              <div 
                className="two-tone-footer"
                style={{
                  background: '#FFFFFF',
                  color: '#0F172A',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="post-date" style={{ color: '#64748B', fontSize: '0.76rem', fontWeight: 600 }}>
                  <Clock size={13} color="#64748B" />
                  <span>Posted recently</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="salary-tag" style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: 900 }}>
                    {(() => {
                      const salStr = job.salary_range || job.stipend || '';
                      if (!salStr || salStr.toLowerCase() === 'null' || salStr.toLowerCase() === 'none') return 'Not specified';
                      if (salStr.toLowerCase().includes('unpaid')) return 'Unpaid';
                      return salStr;
                    })()}
                  </div>

                  <a
                    href={job.apply_url || job.url || `https://www.google.com/search?q=${encodeURIComponent(comp + ' ' + (job.title || '') + ' careers apply')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#10B981',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      borderRadius: '9999px',
                      padding: '5px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Apply directly on company portal"
                  >
                    Apply <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
