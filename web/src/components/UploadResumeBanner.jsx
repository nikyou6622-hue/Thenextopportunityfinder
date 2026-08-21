import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  FileCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';

export default function UploadResumeBanner({ 
  profile, 
  onUploadResume, 
  onNavigate, 
  onTriggerCelebration,
  onSeedDemo
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  const hasResume = Boolean(profile?.raw_text || profile?.resume_url || (profile?.skills && profile.skills.length > 0));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUpload(file);
  };

  const processUpload = async (file) => {
    setSelectedFileName(file.name);
    setUploading(true);
    SoundSystem.playPop();
    try {
      if (onUploadResume) {
        await onUploadResume(file);
      }
      if (onTriggerCelebration) {
        onTriggerCelebration();
      }
    } catch (err) {
      console.error("Banner resume upload error:", err);
    } finally {
      setUploading(false);
    }
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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: hasResume 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(255, 90, 95, 0.12) 50%, rgba(15, 23, 42, 0.96) 100%)',
        border: hasResume 
          ? '1px solid rgba(16, 185, 129, 0.35)'
          : '1px solid rgba(124, 58, 237, 0.4)',
        borderRadius: '24px',
        padding: '26px 28px',
        marginBottom: '8px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hasResume 
          ? '0 16px 40px rgba(16, 185, 129, 0.12)' 
          : '0 20px 50px rgba(0, 0, 0, 0.45), 0 0 30px rgba(124, 58, 237, 0.2)'
      }}
    >
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.doc,.txt"
        style={{ display: 'none' }}
      />

      {/* Radiant ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: hasResume 
          ? 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 90, 95, 0.25) 0%, rgba(124, 58, 237, 0.2) 50%, transparent 70%)',
        filter: 'blur(45px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '24px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }} className="upload-banner-grid">
        
        {/* Left Side: Copy & Call To Action */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{
              background: hasResume ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 90, 95, 0.2)',
              border: hasResume ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 90, 95, 0.4)',
              color: hasResume ? '#34D399' : '#FF5A5F',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              {hasResume ? <CheckCircle2 size={13} /> : <Zap size={13} />}
              {hasResume ? 'Resume Ready for Applying' : 'Step 1: Upload Resume'}
            </span>

            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
              • DPDP Act 2023 Encrypted
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            marginBottom: '8px'
          }}>
            {hasResume ? (
              <>Your Resume is Analyzed & Ready to Start Applying 🚀</>
            ) : (
              <>Upload Your Resume to <span style={{
                background: 'linear-gradient(135deg, #FF5A5F 0%, #C084FC 50%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Start Applying</span></>
            )}
          </h2>

          <p style={{
            fontSize: '0.88rem',
            color: '#CBD5E1',
            lineHeight: 1.5,
            marginBottom: '18px',
            maxWidth: '520px'
          }}>
            {hasResume 
              ? `Current ATS Match Score: ${profile?.ats_score || 82}% | ${profile?.skills?.length || 8} Verified Skills extracted.`
              : 'Upload your PDF or DOCX resume to unlock AI job matching, 5-pillar ATS scoring, and 1-click direct applications across Indian tech startups & MNCs.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-gradient-coral-purple"
              style={{
                padding: '11px 24px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Parsing Resume...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={17} />
                  <span>{hasResume ? 'Update Resume (PDF/DOCX)' : 'Upload Resume to Apply'}</span>
                </>
              )}
            </button>

            {!hasResume && onSeedDemo && (
              <button
                onClick={() => {
                  SoundSystem.playPop();
                  onSeedDemo();
                }}
                className="btn-tactile btn-tactile-ghost"
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#CBD5E1'
                }}
              >
                <Sparkles size={14} color="#A78BFA" />
                <span>Use Sample Demo Resume</span>
              </button>
            )}

            <button
              onClick={() => {
                SoundSystem.playPop();
                if (onNavigate) onNavigate(hasResume ? 'jobs' : 'profile');
              }}
              className="btn-purple-action"
              style={{
                padding: '10px 18px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <span>{hasResume ? 'Browse & Apply Roles' : 'Open Resume Studio'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: isDragging 
              ? 'rgba(124, 58, 237, 0.25)' 
              : 'rgba(15, 23, 42, 0.65)',
            border: isDragging 
              ? '2px dashed #A78BFA' 
              : '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '18px',
            padding: '24px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '150px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.6)';
            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.12)';
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
            }
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: hasResume ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, rgba(255, 90, 95, 0.2), rgba(124, 58, 237, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            {hasResume ? <FileCheck size={24} color="#34D399" /> : <UploadCloud size={24} color="#A78BFA" />}
          </div>

          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
            {selectedFileName 
              ? selectedFileName 
              : (hasResume ? 'Click or Drag to replace resume' : 'Drop your resume file here')}
          </span>

          <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
            Supports PDF, DOCX, DOC or TXT (Max 10MB)
          </span>
        </div>

      </div>
    </motion.div>
  );
}
