import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';

export default function PrivacyPolicyPage({ onNavigate, onTriggerCelebration }) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('dpdp-overview');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    SoundSystem.playSuccess();
    if (onTriggerCelebration) onTriggerCelebration();
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'dpdp-overview', title: '1. DPDP Act 2023 Overview & Fiduciary Notice' },
    { id: 'data-collected', title: '2. Personal & Career Data We Collect' },
    { id: 'encryption', title: '3. AES-256 GCM Field Encryption at Rest' },
    { id: 'retention', title: '4. 90-Day Automated Retention & Scheduled Purge' },
    { id: 'erasure', title: '5. Right to Erasure & 22-Table Cascade Wipe' },
    { id: 'anti-scraping', title: '6. Zero Auto-Apply & Ethical Ingestion Policy' },
    { id: 'cookies', title: '7. Cookie Security (HttpOnly & SameSite=Strict)' },
    { id: 'contact', title: '8. Data Protection Officer (DPO) Contact' }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Hero Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'radial-gradient(130% 120% at 50% 0%, rgba(99, 102, 241, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <ShieldCheck size={14} /> Official DPDP Act 2023 Compliance Standard
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Privacy Policy & Data Fiduciary Disclosure
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Next Opportunity Finder is engineered with a privacy-by-design architecture. Your resume text, contact details, and application events are protected by cryptographic encryption and strict 90-day automated purge cycles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            id="copy-privacy-link-btn"
            onClick={handleCopyLink}
            className="btn-tactile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
              color: copied ? '#34d399' : '#e2e8f0',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied ? 'Link Copied!' : 'Share Policy'}
          </button>
          
          <button 
            id="print-privacy-btn"
            onClick={handlePrint}
            className="btn-tactile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#818cf8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} /> Print Policy
          </button>
        </div>
      </motion.div>

      {/* 4 Core Pillars Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {[
          { title: 'AES-256 Encryption', desc: 'Raw resume text and candidate PII are encrypted at rest with enc:: cryptographic prefixes.', icon: Lock, color: '#38bdf8' },
          { title: '90-Day Auto Purge', desc: 'Unused candidate records are automatically wiped from all database tables after 90 days.', icon: Clock, color: '#f59e0b' },
          { title: '1-Click Hard Erasure', desc: 'Trigger permanent cascade deletion across all 22 database tables with zero orphaned rows.', icon: Trash2, color: '#ef4444' },
          { title: 'Zero Data Brokerage', desc: 'Your profile is never sold, shared, or indexed by third-party recruiters without your direct action.', icon: ShieldCheck, color: '#10b981' }
        ].map((pillar, idx) => (
          <div 
            key={idx}
            style={{
              background: 'rgba(19, 24, 43, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${pillar.color}18`, border: `1px solid ${pillar.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: pillar.color, marginBottom: '12px' }}>
              <pillar.icon size={19} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>{pillar.title}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Legal Document Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Table of Contents Sticky Nav */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '16px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 8px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            Table of Contents
          </span>
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                background: activeSection === sec.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: activeSection === sec.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                color: activeSection === sec.id ? '#818cf8' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: activeSection === sec.id ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.title}</span>
              <ChevronRight size={13} style={{ opacity: activeSection === sec.id ? 1 : 0.4 }} />
            </button>
          ))}
        </div>

        {/* Detailed Clauses Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '36px 32px' }}>
          
          <div id="dpdp-overview">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale size={20} color="#818cf8" /> 1. DPDP Act 2023 Overview & Data Fiduciary Notice
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Under the <strong>Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong>, Next Opportunity Finder operates strictly as a <strong>Data Fiduciary</strong> for job seekers ("Data Principals"). We collect, parse, and process candidate information solely to provide career discovery, ATS resume benchmarking, tailoring, and direct application routing.
            </p>
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderLeft: '4px solid #6366f1', padding: '12px 16px', borderRadius: '0 10px 10px 0', color: '#cbd5e1', fontSize: '0.84rem' }}>
              <strong>Explicit Consent Required:</strong> No resume or personal profile data is stored without affirmative consent granted via the explicit consent checkbox during file upload.
            </div>
          </div>

          <div id="data-collected">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="#38bdf8" /> 2. Personal & Career Data We Collect
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 10px 0' }}>
              We collect only the minimum required information necessary to perform resume scoring and job matching:
            </p>
            <ul style={{ color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
              <li><strong>Candidate Identifiers:</strong> Name, professional email, phone number, and location (City, Country).</li>
              <li><strong>Resume Content:</strong> Professional summaries, employment history, education, skills, and project descriptions.</li>
              <li><strong>Application Metadata:</strong> Job apply link clicks, tailored resume drafts, and Kanban application status events.</li>
              <li><strong>Interview Prep Logs:</strong> Mock technical answer responses and STAR rubric scores evaluated by our coach.</li>
            </ul>
          </div>

          <div id="encryption">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} color="#34d399" /> 3. AES-256 GCM Field Encryption at Rest
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              All sensitive raw text fields (such as uploaded resume strings) are encrypted at rest using industry-standard <strong>AES-256 GCM</strong> authenticated encryption. Unencrypted plain text is never persisted to database disk storage.
            </p>
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8' }}>
              Encrypted Database Value Sample: enc::gAAAAABn...[AES-256-GCM Cryptographic Payload]
            </div>
          </div>

          <div id="retention">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="#f59e0b" /> 4. 90-Day Automated Retention & Scheduled Purge
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              In accordance with data minimization standards, candidate profiles that have been inactive for more than <strong>90 days</strong> are automatically purged by our daily background retention loop (<code style={{ color: '#818cf8' }}>daily_dpdp_retention_purge_loop</code>) executed on our production cluster.
            </p>
          </div>

          <div id="erasure">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={20} color="#ef4444" /> 5. Right to Erasure & 22-Table Cascade Wipe
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Under DPDP Section 12, candidates have the absolute right to revoke consent and demand total erasure of their data at any time. When you click <strong>"Delete All My Data"</strong> in your Settings panel:
            </p>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: '#fca5a5', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
                A deterministic hard cascade delete executes across all <strong>22 relational database tables</strong> (including profiles, resumes_tailored, matches, applications, application_events, interview_prep, coding_attempts, notification_events, and usage logs), guaranteeing <strong>zero orphaned records</strong> remain.
              </p>
            </div>
          </div>

          <div id="anti-scraping">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#10b981" /> 6. Zero Auto-Apply & Ethical Ingestion Policy
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              Next Opportunity Finder enforces a strict <strong>Zero Auto-Apply Structural Guardrail</strong>. We do not use headless browser automation (Playwright/Selenium) to submit fake or bot applications on corporate ATS systems (Greenhouse, Lever, Workday). Every application link resolves to the canonical official ATS portal where the candidate reviews and submits their verified application.
            </p>
          </div>

          <div id="cookies">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} color="#818cf8" /> 7. Cookie Security (HttpOnly & SameSite=Strict)
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              Authentication tokens (<code style={{ color: '#818cf8' }}>nof_auth_token</code>) are transmitted in signed, <code style={{ color: '#38bdf8' }}>HttpOnly; Secure; SameSite=Strict</code> cookies. They are completely inaccessible to client-side JavaScript execution, eliminating Cross-Site Scripting (XSS) token exfiltration risks.
            </p>
          </div>

          <div id="contact">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ExternalLink size={20} color="#38bdf8" /> 8. Data Protection Officer (DPO) Contact
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 10px 0' }}>
              For data privacy inquiries, grievances, or formal erasure requests, reach our Data Protection Officer directly:
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '0.82rem' }}>
                Email: <strong>privacy@thenextopportunityfind.io</strong>
              </span>
              <span style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '0.82rem' }}>
                Jurisdiction: <strong>Bengaluru, Karnataka, India</strong>
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
