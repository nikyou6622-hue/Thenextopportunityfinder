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
          padding: '20px',
          background: 'rgba(5, 7, 15, 0.84)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: 'linear-gradient(135deg, rgba(19, 20, 36, 0.98) 0%, rgba(13, 14, 26, 0.98) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.35)',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '620px',
            padding: '32px 30px',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 50px rgba(124, 58, 237, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Ambient Glow Orbs */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 90, 95, 0.25) 0%, rgba(124, 58, 237, 0.2) 50%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />

          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          {activeFile ? (
            <StagedResumeProcessor
              file={activeFile}
              onUploadResume={onUploadResume}
              onTriggerCelebration={onTriggerCelebration}
              onCancel={() => setActiveFile(null)}
              onComplete={onClose}
            />
          ) : (
            <>
              {/* Header & Greetings */}
              <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34D399',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '14px'
                }}>
                  <CheckCircle2 size={14} />
                  <span>Account Verified • Welcome {candidateName}!</span>
                </div>

                <h2 style={{
                  fontSize: '1.75rem',
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
                  fontSize: '0.88rem',
                  color: '#94A3B8',
                  lineHeight: 1.5,
                  maxWidth: '460px',
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
                  padding: '30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <UploadCloud size={28} color="#A78BFA" />
                </div>

                <button
                  type="button"
                  className="btn-gradient-coral-purple"
                  style={{
                    padding: '10px 22px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={16} />
                  <span>Browse File from Computer</span>
                </button>
              </div>

              {/* Quick Demo Seed Option */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '16px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="#A78BFA" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Don't have a resume file ready?
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
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
                    whiteSpace: 'nowrap'
                  }}
                >
                  Use Demo Profile
                </button>
              </div>

              {/* Footer DPDP Security Note */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: '16px', 
                fontSize: '0.72rem', 
                color: '#64748B', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={14} color="#10B981" />
                <span>DPDP Act 2023 Compliant • 256-Bit Encrypted • Never Shared Without Permission</span>
              </div>
            </>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
