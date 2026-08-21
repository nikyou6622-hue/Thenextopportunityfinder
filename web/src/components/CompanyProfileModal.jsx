import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Share2, 
  Building2, 
  MapPin, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompanyProfileModal({ 
  companyName = "Spotify", 
  isOpen, 
  onClose, 
  onSelectJob 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('jobs'); // 'about' | 'jobs' | 'reviews' | 'photos'

  const companyDetails = {
    name: companyName,
    tagline: companyName.toLowerCase().includes('spotify') ? 'Music Streaming Platform' : companyName.toLowerCase().includes('google') ? 'Technology & AI Pioneer' : 'Leading Global Technology',
    location: 'Stockholm, Sweden · 1,001-5,000 employees',
    about: `${companyName} is a digital tech leader that provides access to millions of songs, smart productivity tools, and modern infrastructure. We empower people worldwide to unleash their true potential.`,
    tags: ['Music', 'Entertainment', 'Technology', 'Remote-Friendly'],
    openPositions: [
      { id: 'pos-1', title: 'Graphic Designer', salary: '$50K/mo', type: 'Full-time · Remote' },
      { id: 'pos-2', title: 'Product Designer', salary: '$60K/mo', type: 'Full-time · New York' },
      { id: 'pos-3', title: 'UX Researcher', salary: '$55K/mo', type: 'Full-time · Hybrid' },
      { id: 'pos-4', title: 'Senior Software Engineer', salary: '$65K/mo', type: 'Full-time · Remote' },
    ]
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop-dark" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content-dark"
          style={{ maxWidth: '560px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(17, 18, 36, 0.95)'
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
            </button>

            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>
              Company Profile
            </span>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ padding: '22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Company Hero Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(124, 58, 237, 0.2) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.4rem',
                color: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
              }}>
                {companyDetails.name.charAt(0)}
              </div>

              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {companyDetails.name}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#86EFAC', fontWeight: 600, marginTop: '2px' }}>
                  {companyDetails.tagline}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#CBD5E1', marginTop: '4px' }}>
                  {companyDetails.location}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              {[
                { id: 'about', label: 'About' },
                { id: 'jobs', label: `Jobs (${companyDetails.openPositions.length})` },
                { id: 'reviews', label: 'Reviews' },
                { id: 'photos', label: 'Tech Stack' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: activeTab === t.id ? '#7C3AED' : '#94A3B8',
                    borderBottom: activeTab === t.id ? '2px solid #7C3AED' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: About Company */}
            {activeTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                  About Company
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                  {companyDetails.about}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {companyDetails.tags.map((tag, idx) => (
                    <span key={idx} className="tag-pill-light" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#C4B5FD', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Open Positions */}
            {(activeTab === 'jobs' || activeTab === 'about') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Open Positions
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>
                    Verified Direct ATS
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {companyDetails.openPositions.map((pos) => (
                    <div
                      key={pos.id}
                      onClick={() => {
                        onClose();
                        if (onSelectJob) onSelectJob({ ...pos, company: companyDetails.name });
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED';
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {pos.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                          {pos.type}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFB020' }}>
                          {pos.salary}
                        </span>
                        <ArrowRight size={16} color="#7C3AED" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Reviews / Tech Stack */}
            {(activeTab === 'reviews' || activeTab === 'photos') && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.86rem' }}>
                <CheckCircle2 size={32} color="#22C55E" style={{ margin: '0 auto 10px' }} />
                Verified employer · 4.8 / 5 Rating across Glassdoor & AmbitionBox
              </div>
            )}

          </div>

          {/* Bottom Footer */}
          <div style={{
            padding: '14px 20px',
            background: 'rgba(17, 18, 36, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <button
              onClick={onClose}
              className="btn-purple-action"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem' }}
            >
              View All {companyDetails.openPositions.length} Jobs
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
