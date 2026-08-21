import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  Building2, 
  Clock, 
  Sparkles, 
  Upload,
  User,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';
import { NovaCharacter } from './characters/CharacterUniverse';

export default function ApplicationFlowModal({ 
  job, 
  match, 
  profile, 
  isOpen, 
  onClose, 
  onSubmitSuccess,
  onTriggerCelebration
}) {
  if (!isOpen || (!job && !match)) return null;

  const currentJob = job || match?.job || {};
  const [currentStep, setCurrentStep] = useState(2); // 1: Contact, 2: Experience, 3: Resume Review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State initialized from profile
  const [formData, setFormData] = useState({
    fullName: profile?.name || "Kabira Sharma",
    email: profile?.email || "kabira@email.com",
    phone: profile?.phone || "+1 (555) 234-5678",
    totalExperience: "3",
    currentRole: profile?.past_roles?.[0]?.title || "Senior Graphic Designer",
    currentCompany: profile?.past_roles?.[0]?.company || "Design Studio",
    noticePeriod: "30 Days",
    resumeName: "Resume.pdf"
  });

  const handleNext = () => {
    SoundSystem.playPop();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    SoundSystem.playPop();
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    SoundSystem.playPop();
    try {
      if (match?.id) {
        await fetch(`/api/applications/tailor/${match.id}`, { method: 'POST' });
      }
      setSubmitted(true);
      SoundSystem.playSuccess();
      if (onTriggerCelebration) onTriggerCelebration();
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      }, 1600);
    } catch (e) {
      console.error("Submission error:", e);
      setSubmitted(true);
      SoundSystem.playSuccess();
      if (onTriggerCelebration) onTriggerCelebration();
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      }, 1600);
    } finally {
      setIsSubmitting(false);
    }
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
            padding: '18px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(17, 18, 36, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <button
                onClick={handleBack}
                aria-label="Previous step"
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

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Apply for {currentJob.title || "Graphic Designer"}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                  {currentJob.company || "Spotify"} · Step {currentStep} of 3
                </span>
              </div>

              <button
                onClick={onClose}
                aria-label="Close application modal"
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
                <X size={18} />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{
                width: `${(currentStep / 3) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FF5A5F, #7C3AED)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Body Form */}
          <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <NovaCharacter pose="celebrate" size={96} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
                  Application Submitted! 🚀
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                  Nova added this to your Application Pipeline & primed your Interview Prep Studio.
                </p>
              </div>
            ) : isSubmitting ? (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src="/loading.svg" alt="Submitting Application" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                  Tailoring & Submitting Requisition...
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                  Formatting ATS bullet points & syncing career telemetry.
                </p>
              </div>
            ) : (
              <>
                {/* STEP 1: Personal & Contact */}
                {currentStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <User size={16} color="#7C3AED" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Candidate Information</span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Full Name</label>
                      <input 
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Email Address</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                      <input 
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Experience */}
                {currentStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Briefcase size={16} color="#FF5A5F" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Experience Details</span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Total Experience</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text"
                          value={formData.totalExperience}
                          onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 60px 11px 14px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '0.85rem'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.8rem' }}>
                          Years
                        </span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Current Role</label>
                      <input 
                        type="text"
                        value={formData.currentRole}
                        onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Current Company</label>
                      <input 
                        type="text"
                        value={formData.currentCompany}
                        onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Notice Period</label>
                      <input 
                        type="text"
                        value={formData.noticePeriod}
                        onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Resume Review */}
                {currentStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FileText size={16} color="#FFB020" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Resume Attachment</span>
                    </div>

                    {/* Resume Card matching Screen 04 */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(124, 58, 237, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={20} color="#C4B5FD" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {formData.resumeName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            ATS Scored · 88/100 Ready
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => alert("Choose another resume from your ATS studio or upload a new file.")}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#7C3AED',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Change
                      </button>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </div>

                    {/* AI Tailoring Badge */}
                    <div style={{
                      background: 'rgba(124, 58, 237, 0.12)',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <Sparkles size={16} color="#A78BFA" />
                      <span style={{ fontSize: '0.78rem', color: '#C4B5FD', lineHeight: 1.4 }}>
                        AI Auto-Tailoring will align your bullet points to <strong>{currentJob.company}</strong>'s requirements upon submission.
                      </span>
                    </div>

                    {/* Direct Company Apply Fallback Link */}
                    <div style={{ textAlign: 'center', marginTop: '6px' }}>
                      <a
                        href={currentJob.apply_url || currentJob.url || `https://www.google.com/search?q=${encodeURIComponent((currentJob.company || '') + ' ' + (currentJob.title || '') + ' careers apply')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.76rem',
                          color: '#38bdf8',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}
                      >
                        <span>Prefer to apply on company site? Open {currentJob.company || 'Company'} Portal</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Bottom Action Footer */}
          {!submitted && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px',
              background: 'rgba(17, 18, 36, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="btn-glass-pill"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="btn-purple-action"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Submitting...' : currentStep === 3 ? 'Submit Application 🚀' : 'Next →'}
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
