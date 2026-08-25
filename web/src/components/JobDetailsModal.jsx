import React from 'react';
import { 
  X, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobDetailsModal({ 
  job, 
  match, 
  isOpen, 
  onClose, 
  onApply, 
  onToggleSave, 
  isSaved = false,
  onOpenCompany 
}) {
  if (!isOpen || (!job && !match)) return null;

  const currentJob = job || match?.job || {};
  const title = currentJob.title || "Graphic Designer";
  const company = currentJob.company || "Spotify";
  const location = currentJob.location || "New York, USA";
  const domain = currentJob.domain || "Design & Product";
  const jobType = currentJob.job_type || "Full-time";
  const experienceLevel = currentJob.experience_level || "Mid level";
  const rawSal = currentJob.salary_range || currentJob.stipend || (currentJob.estimated_salary ? `$${(currentJob.estimated_salary/1000).toFixed(0)}K/mo` : "");
  const salaryStr = (() => {
    if (!rawSal || rawSal.toLowerCase() === 'null' || rawSal.toLowerCase() === 'none') return "Not specified";
    if (rawSal.toLowerCase().includes('unpaid')) return "Unpaid";
    return rawSal;
  })();
  const score = match?.match_score || 94;

  // Determine vibrant card background theme
  const getThemeClass = (comp = '') => {
    const c = comp.toLowerCase();
    if (c.includes('spotify')) return 'card-next-amber';
    if (c.includes('google') || c.includes('meta')) return 'card-next-purple';
    if (c.includes('airbnb') || c.includes('netflix')) return 'card-next-coral';
    return 'card-next-purple';
  };

  const themeClass = getThemeClass(company);

  const skillsList = currentJob.required_skills && currentJob.required_skills.length > 0 
    ? currentJob.required_skills 
    : [
        "3+ years experience in product / visual design",
        "Expert in Figma, Adobe Creative Suite, Design Systems",
        "Strong understanding of typography, color, and layout hierarchy",
        "Passion for music, digital audio & consumer products",
        "Experience collaborating with cross-functional engineering teams"
      ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} at ${company}`,
        text: `Check out this opportunity: ${title} at ${company}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop-dark" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="modal-content-dark"
          style={{ maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
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
              <ArrowLeft size={18} />
            </button>

            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
              Job Details
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleShare}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CBD5E1',
                  cursor: 'pointer'
                }}
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Body Content */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Vibrant Hero Card */}
            <div className={themeClass} style={{ padding: '22px 20px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    color: '#FFFFFF'
                  }}>
                    {company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                      {title}
                    </h2>
                    <span 
                      onClick={() => onOpenCompany && onOpenCompany(company)}
                      style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {company}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={12} />
                  {score}% Match
                </div>
              </div>

              {/* Tags Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                <span className="tag-pill-dark">
                  <MapPin size={11} /> {location}
                </span>
                <span className="tag-pill-dark">
                  <Briefcase size={11} /> {jobType}
                </span>
                <span className="tag-pill-dark">
                  <Clock size={11} /> {experienceLevel}
                </span>
              </div>

              {/* Salary & Posted Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <Clock size={13} />
                  <span>Posted recently</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {salaryStr}
                </div>
              </div>
            </div>

            {/* Section: Job Description */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '18px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '6px', height: '16px', background: '#7C3AED', borderRadius: '3px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>Job Description</h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                {currentJob.description || `We at ${company} are on a mission to unlock the potential of human creativity by giving millions of creative artists the opportunity to live off their art and billions of fans the opportunity to enjoy and be inspired by it.`}
              </p>
            </div>

            {/* Section: Skills & Requirements */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '18px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '6px', height: '16px', background: '#FF5A5F', borderRadius: '3px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>Skills & Requirements</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {skillsList.map((skill, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.84rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                      {typeof skill === 'string' ? skill : skill.name || JSON.stringify(skill)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Direct Company Application Link */}
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ExternalLink size={16} color="#38bdf8" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Official Company Job Portal</h3>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                  Verified Requisition
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                You can apply directly on <strong>{company}</strong>'s official career portal or use Next Opportunity Finder's 1-click tailored application pipeline.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <a
                  href={currentJob.apply_url || currentJob.url || `https://www.google.com/search?q=${encodeURIComponent(company + ' ' + title + ' careers apply')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Open {company} Portal</span>
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const url = currentJob.apply_url || currentJob.url || window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('Company apply link copied to clipboard!');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Section: Your Role */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '18px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '6px', height: '16px', background: '#FFB020', borderRadius: '3px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>Your Role & Impact</h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                As a {title}, you will be responsible for creating visual concepts, designing marketing materials, scaling user experiences, and collaborating with cross-functional product and engineering leaders.
              </p>
            </div>

          </div>

          {/* Sticky Bottom Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '16px 20px',
            background: 'rgba(17, 18, 36, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => onToggleSave && onToggleSave(currentJob)}
              className="btn-glass-pill"
              style={{
                padding: '12px 16px',
                fontSize: '0.88rem',
                border: isSaved ? '1px solid #FFB020' : '1px solid rgba(255, 255, 255, 0.12)',
                color: isSaved ? '#FFB020' : '#FFFFFF'
              }}
            >
              {isSaved ? <Bookmark size={18} color="#FFB020" fill="#FFB020" /> : <Bookmark size={18} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <a
              href={currentJob.apply_url || currentJob.url || `https://www.google.com/search?q=${encodeURIComponent(company + ' ' + title + ' careers apply')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-pill"
              style={{
                padding: '12px 18px',
                fontSize: '0.88rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                background: 'rgba(56, 189, 248, 0.12)',
                fontWeight: 700
              }}
              title="Open official company job portal"
            >
              <ExternalLink size={16} />
              <span>Company Site ↗</span>
            </a>

            <button
              onClick={() => {
                onClose();
                if (onApply) onApply(currentJob, match);
              }}
              className="btn-purple-action"
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '12px 20px',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              1-Click Apply <ArrowRight size={18} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
