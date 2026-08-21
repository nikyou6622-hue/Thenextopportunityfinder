import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function MobileAtsScanner({ profile, onUpload, loading }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      await onUpload(file);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const atsScore = profile?.ats_score ?? profile?.quality_score ?? 0;
  const breakdown = profile?.quality_score_breakdown || profile?.breakdown || {
    skills_density: 0,
    action_verbs_metrics: 0,
    section_structure: 0,
    summary_alignment: 0
  };

  return (
    <div>
      {/* Upload Box */}
      <div className="mobile-card" style={{ textAlign: 'center', padding: '24px 16px', borderStyle: 'dashed', borderColor: 'rgba(99,102,241,0.4)' }}>
        <input 
          type="file" 
          id="mobile-resume-upload" 
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="mobile-resume-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 12px auto'
          }}>
            <Upload size={24} color="#818cf8" />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            {uploading ? 'Parsing Resume...' : 'Upload or Replace Resume'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Supports PDF, DOCX, ODT & TXT (Max 5MB)
          </div>
        </label>
        {uploadError && (
          <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '10px' }}>
            {uploadError}
          </div>
        )}
      </div>

      {/* ATS Score Detailed Breakdown Card */}
      <div className="mobile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700 }}>5-PILLAR ATS EVALUATION</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
              {atsScore} / 100
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)',
            color: '#34d399', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(16,185,129,0.3)'
          }}>
            Tier: {profile?.tier || 'Excellent'}
          </div>
        </div>

        {/* Progress bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '3px' }}>
              <span>Skills Density & Relevance</span>
              <span>{breakdown.skills_density} / 35</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${(breakdown.skills_density / 35) * 100}%`, height: '100%', background: '#6366f1' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '3px' }}>
              <span>Action Verbs & Quantified Metrics</span>
              <span>{breakdown.action_verbs_metrics} / 25</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${(breakdown.action_verbs_metrics / 25) * 100}%`, height: '100%', background: '#8b5cf6' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '3px' }}>
              <span>Section Structure & ATS Flow</span>
              <span>{breakdown.section_structure} / 20</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${(breakdown.section_structure / 20) * 100}%`, height: '100%', background: '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Profile Details */}
      <div className="mobile-card">
        <div className="card-title" style={{ marginBottom: '10px' }}>Extracted Skills & Domains</div>
        <div style={{ marginBottom: '10px' }}>
          {(profile?.skills || ['Python', 'FastAPI', 'React', 'Docker', 'AWS']).map((s, i) => (
            <span key={i} className="tag-chip highlight">{s}</span>
          ))}
        </div>
      </div>

      {/* Direct Export Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <a 
          href={`/api/resume/export/${profile?.id || 1}?format=pdf`} 
          className="mobile-btn-secondary"
          style={{ textDecoration: 'none' }}
          download
        >
          <Download size={15} />
          <span>Export PDF</span>
        </a>
        <a 
          href={`/api/resume/export/${profile?.id || 1}?format=docx`} 
          className="mobile-btn-secondary"
          style={{ textDecoration: 'none' }}
          download
        >
          <Download size={15} />
          <span>Export DOCX</span>
        </a>
      </div>
    </div>
  );
}
