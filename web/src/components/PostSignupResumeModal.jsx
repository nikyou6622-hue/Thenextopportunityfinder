import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  X,
  FileCheck,
  RefreshCw,
  Award,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';
import StagedResumeProcessor from './StagedResumeProcessor';

export default function PostSignupResumeModal({ 
  isOpen, 
  onClose, 
  onUploadResume, 
  onSeedDemo,
  onTriggerCelebration,
  onNavigate,
  candidateName = 'Candidate'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const processUpload = (file) => {
    if (!file) return;
    setSelectedFileName(file.name);
    setActiveFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const handleUseDemo = async () => {
    SoundSystem.playPop();
    try {
      if (onSeedDemo) {
        await onSeedDemo();
      }
      if (onTriggerCelebration) {
        onTriggerCelebration();
      }
      onClose();
    } catch (err) {
      console.error("Demo resume seed error:", err);
    }
  };

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px',
          background: 'rgba(5, 7, 15, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.98) 0%, rgba(13, 17, 32, 0.99) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.45)',
            borderRadius: '24px',
            padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.25)',
            boxSizing: 'border-box'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
          />

          {activeFile ? (
            <StagedResumeProcessor
              file={activeFile}
              onUploadResume={onUploadResume}
              onTriggerCelebration={onTriggerCelebration}
              onCancel={() => setActiveFile(null)}
              onNavigate={onNavigate}
              onComplete={(result) => {
                if (result && result.match_session) {
                  if (onNavigate) {
                    onNavigate(result.type === 'internships' ? 'internships' : 'jobs', { match_session: result.match_session });
                  }
                }
                onClose();
              }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header & Greetings */}
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34D399',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: 'clamp(0.7rem, 3vw, 0.78rem)',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  maxWidth: '100%',
                  wordBreak: 'break-word'
                }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                  <span>Account Verified • Welcome {candidateName}!</span>
                </div>

                <h2 style={{
                  fontSize: 'clamp(1.3rem, 4.5vw, 1.8rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '8px'
                }}>
                  Upload Your Resume to Get <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #FF5A5F 0%, #C084FC 50%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Recommended Jobs 🎯
                  </span>
                </h2>

                <p style={{
                  fontSize: 'clamp(0.78rem, 3.2vw, 0.88rem)',
                  color: '#94A3B8',
                  lineHeight: 1.5,
                  maxWidth: '480px',
                  margin: '0 auto'
                }}>
                  Our AI scanner instantly extracts your tech stack, projects, and target role to match you with top Indian tech startups & MNC opportunities.
                </p>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: isDragging 
                    ? 'rgba(124, 58, 237, 0.22)' 
                    : 'rgba(15, 23, 42, 0.75)',
                  border: isDragging 
                    ? '2px dashed #A78BFA' 
                    : '2px dashed rgba(124, 58, 237, 0.4)',
                  borderRadius: '20px',
                  padding: 'clamp(20px, 4vw, 30px) 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <UploadCloud size={26} color="#A78BFA" />
                </div>

                <button
                  type="button"
                  className="btn-gradient-coral-purple"
                  style={{
                    padding: '12px 20px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '340px'
                  }}
                >
                  <FileText size={16} />
                  <span>Browse File from Device</span>
                </button>

                <span style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '10px', fontWeight: 600, lineHeight: 1.4 }}>
                  💡 For best results, upload a PDF — other formats may reduce ATS parsing accuracy.
                </span>
              </div>

              {/* Quick Demo Seed Option */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '16px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 220px' }}>
                  <Sparkles size={18} color="#A78BFA" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Don't have a resume file ready?
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.4 }}>
                      Use our sample full-stack developer profile to explore instant job recommendations.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUseDemo}
                  className="btn-tactile btn-tactile-ghost"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#CBD5E1',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto'
                  }}
                >
                  Use Demo Profile
                </button>
              </div>

              {/* Footer DPDP Security Note */}
              <div style={{ 
                textAlign: 'center', 
                fontSize: '0.7rem', 
                color: '#64748B', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                flexWrap: 'wrap'
              }}>
                <ShieldCheck size={14} color="#10B981" style={{ flexShrink: 0 }} />
                <span>DPDP Act 2023 Compliant • 256-Bit Encrypted • Never Shared Without Permission</span>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
