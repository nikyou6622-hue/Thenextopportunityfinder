import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Search, 
  Filter, 
  SlidersHorizontal,
  DollarSign,
  Briefcase,
  MapPin,
  Clock,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchFiltersModal({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  totalResultsCount = 120,
  initialFilters = {}
}) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [jobType, setJobType] = useState(initialFilters.jobType || 'Full-time');
  const [experienceYears, setExperienceYears] = useState(initialFilters.experience || 3);
  const [salaryMin, setSalaryMin] = useState(initialFilters.salaryMin || 25);
  const [locationType, setLocationType] = useState(initialFilters.locationType || 'Onsite');

  const handleClearAll = () => {
    setSearchQuery('');
    setJobType('All');
    setExperienceYears(0);
    setSalaryMin(10);
    setLocationType('All');
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        query: searchQuery,
        jobType,
        experience: experienceYears,
        salaryMin,
        locationType
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop-dark" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content-dark"
          style={{ maxWidth: '520px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(17, 18, 36, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                Search & Filters
              </h3>
            </div>

            <button
              onClick={handleClearAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FF5A5F',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={13} />
              Clear All
            </button>
          </div>

          {/* Form Controls */}
          <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Search Input Bar */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for roles, companies..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Job Type Section */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: '10px' }}>
                Job Type
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['All', 'Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => {
                  const isActive = jobType.toLowerCase() === type.toLowerCase();
                  return (
                    <button
                      key={type}
                      onClick={() => setJobType(type)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isActive ? '#7C3AED' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#FFFFFF' : '#CBD5E1',
                        boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.4)' : 'none'
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Slider */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Experience
                </label>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7C3AED' }}>
                  {experienceYears === 0 ? 'Any level' : `${experienceYears}+ years`}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="10"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  accentColor: '#7C3AED',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                <span>0 yrs</span>
                <span>5 yrs</span>
                <span>10+ yrs</span>
              </div>
            </div>

            {/* Salary Range Slider */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Target Salary (LPA / Annual CTC)
                </label>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFB020' }}>
                  ₹{salaryMin}L - ₹60L+ LPA
                </span>
              </div>
              <input 
                type="range"
                min="6"
                max="60"
                step="2"
                value={salaryMin}
                onChange={(e) => setSalaryMin(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  accentColor: '#FFB020',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                <span>₹6 LPA</span>
                <span>₹30 LPA</span>
                <span>₹60L+ LPA</span>
              </div>
            </div>

            {/* Location Type Chips */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: '10px' }}>
                Location
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['All', 'Remote', 'Onsite', 'Hybrid'].map((loc) => {
                  const isActive = locationType.toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      onClick={() => setLocationType(loc)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isActive ? '#7C3AED' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#FFFFFF' : '#CBD5E1',
                        boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.4)' : 'none'
                      }}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Action CTA matching Screen 05 */}
          <div style={{
            padding: '16px 22px',
            background: 'rgba(17, 18, 36, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={handleApply}
              className="btn-purple-action"
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              Show {totalResultsCount} Results
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
