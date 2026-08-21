import React, { useState } from 'react';
import { 
  FileCheck, 
  ShieldAlert, 
  Mail, 
  DollarSign, 
  Scale, 
  Printer, 
  Copy, 
  CheckCircle2, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';
import { motion } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';

export default function TermsOfServicePage({ onNavigate, onTriggerCelebration }) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('acceptance');

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
    { id: 'acceptance', title: '1. Acceptance of Terms & Eligibility' },
    { id: 'auto-apply', title: '2. Zero Auto-Apply Prohibition' },
    { id: 'ats-tailoring', title: '3. Resume Tailoring & Zero Fabrication' },
    { id: 'recruiter-outreach', title: '4. Recruiter Outreach Fair-Use Rules' },
    { id: 'salary-intelligence', title: '5. Salary Intelligence Disclaimer' },
    { id: 'ip', title: '6. Intellectual Property & Candidate Ownership' },
    { id: 'termination', title: '7. Account Termination & Liability' },
    { id: 'governing-law', title: '8. Governing Law & Dispute Resolution' }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Hero Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'radial-gradient(130% 120% at 50% 0%, rgba(56, 189, 248, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <FileCheck size={14} /> Official Platform Terms of Service
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Terms of Service & Usage Guardrails
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            These terms govern your access to Next Opportunity Finder. By using our discovery feed, resume tailoring engine, interview simulator, and direct apply linkouts, you agree to these ethical usage principles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            id="copy-terms-link-btn"
            onClick={handleCopyLink}
            className="btn-tactile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: copied ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${copied ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
              color: copied ? '#38bdf8' : '#e2e8f0',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied ? 'Link Copied!' : 'Share Terms'}
          </button>
          
          <button 
            id="print-terms-btn"
            onClick={handlePrint}
            className="btn-tactile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} /> Print Terms
          </button>
        </div>
      </motion.div>

      {/* Main Document Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Table of Contents Sticky Nav */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '16px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 8px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            Document Sections
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
                background: activeSection === sec.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: activeSection === sec.id ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                color: activeSection === sec.id ? '#38bdf8' : '#94a3b8',
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

        {/* Detailed Clauses Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '36px 32px' }}>
          
          <div id="acceptance">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} color="#38bdf8" /> 1. Acceptance of Terms & Eligibility
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              By creating an account or using Next Opportunity Finder, you certify that you are at least 18 years old (or of legal age to form a binding contract) and that all career information, education details, and work experience provided in your resume profile are genuine and accurate.
            </p>
          </div>

          <div id="auto-apply">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="#ef4444" /> 2. Zero Auto-Apply Prohibition
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Next Opportunity Finder fundamentally rejects automated bot application submission. We do not provide, permit, or support tools that bypass company CAPTCHAs, autofill forms without human review, or send bot spam applications to employer applicant tracking systems.
            </p>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid #ef4444', padding: '14px 16px', borderRadius: '0 10px 10px 0', color: '#fca5a5', fontSize: '0.84rem', lineHeight: 1.6 }}>
              <strong>Why This Protects You:</strong> Automated bot applications frequently trigger ATS anti-spam blacklist filters, causing immediate disqualification of your candidate credentials across enterprise employers.
            </div>
          </div>

          <div id="ats-tailoring">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCheck size={20} color="#10b981" /> 3. Resume Tailoring & Zero Fabrication Standard
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              Our AI tailoring engine rewrites and aligns your experience against verified job keywords using high-selection-rate ATS formats. The candidate remains solely responsible for reviewing the generated resume. The AI engine is strictly constrained by deterministic guardrails to prevent fabricating fake credentials or employment history.
            </p>
          </div>

          <div id="recruiter-outreach">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={20} color="#818cf8" /> 4. Recruiter Outreach Fair-Use Rules
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 10px 0' }}>
              Candidate cold email outreach via Agent 6 is restricted strictly to verified professional recruiters and talent acquisition leads. Usage is subject to:
            </p>
            <ul style={{ color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
              <li>Hard rate limit cap of <strong>20 emails per hour</strong> and weekly account limits.</li>
              <li>Prohibition of consumer webmail SMTP relays to protect candidate email reputation.</li>
              <li>Strict requirement for individualized, role-specific personalization on every message.</li>
            </ul>
          </div>

          <div id="salary-intelligence">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={20} color="#f59e0b" /> 5. Salary Intelligence Disclaimer
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              The compensation benchmarks presented in the Overview Dashboard and Salary Calculator are deterministic statistical indices derived from historical Indian tech market tiers (Tier 1 FAANG+, Tier 2 Unicorns, Tier 3 IT Services). They serve as general reference ranges and do not constitute guaranteed wage quotes or binding employment terms.
            </p>
          </div>

          <div id="ip">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale size={20} color="#38bdf8" /> 6. Intellectual Property & Candidate Ownership
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              You retain 100% full ownership and copyright of all resume documents, code snippets, project descriptions, and personal data uploaded to the platform. Next Opportunity Finder claims zero intellectual property rights over candidate resume exports or generated cover letters.
            </p>
          </div>

          <div id="termination">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertOctagon size={20} color="#ef4444" /> 7. Account Termination & Liability
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              We reserve the right to suspend or terminate accounts that engage in automated crawling of our platform, mass email spamming, or fraudulent job postings. Next Opportunity Finder is provided on an "as-is" basis without warranties of guaranteed hiring outcomes.
            </p>
          </div>

          <div id="governing-law">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale size={20} color="#10b981" /> 8. Governing Law & Dispute Resolution
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Bengaluru, Karnataka, India</strong>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
