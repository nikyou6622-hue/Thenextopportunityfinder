import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Building, 
  User, 
  Briefcase, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  FileText, 
  RefreshCw, 
  Zap, 
  Sliders, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

const PITCH_MODES = [
  { id: 'impact', label: 'Metrics & Direct Impact', badge: 'High Response', desc: 'Focuses on 2-3 quantifiable achievements and engineering scale.' },
  { id: 'portfolio', label: 'Portfolio & Code Showcase', badge: 'Tech Heavy', desc: 'Highlights GitHub repositories, live full-stack projects, and architecture.' },
  { id: 'founder', label: 'Founder / Early Startup Pitch', badge: 'High Energy', desc: 'Fast-paced, product-focused intro tailored for YC & seed founders.' },
  { id: 'referral', label: 'Warm Referral Request', badge: 'Networking', desc: 'Respectful inquiry to an engineering peer or alumni for an internal referral.' }
];

export default function RecruiterOutreachStudio({ profile, onOpenPaywall, isPro = false }) {
  const candidateName = profile?.name || 'Aditya Tamta';
  const candidateSkills = (profile?.skills || ['Python', 'FastAPI', 'React', 'Docker', 'PostgreSQL']).slice(0, 4).join(', ');
  
  const [recruiterName, setRecruiterName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [pitchMode, setPitchMode] = useState('impact');
  const [copied, setCopied] = useState(false);
  const [outreachLogs, setOutreachLogs] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Sanitized Dynamic Email Formula
  const defaultEmail = useMemo(() => {
    const recName = recruiterName.trim() || 'Hiring Team';
    const compName = companyName.trim() || 'your team';
    const targetRole = roleTitle.trim() || 'Software Engineer';
    const skills = candidateSkills || 'Full Stack Engineering';

    let subject = '';
    let body = '';

    if (pitchMode === 'impact') {
      subject = `${targetRole} application — ${candidateName} (Engineered 35% latency reduction)`;
      body = `Hi ${recName},\n\nI noticed ${compName} is expanding its engineering team for the ${targetRole} position, and I wanted to reach out directly.\n\nOver the past 2+ years, I have specialized in ${skills}, focusing on building high-throughput microservices and distributed APIs. In my previous role, I engineered core service optimizations that reduced API response times by 35% and handled thousands of concurrent requests.\n\nGiven ${compName}'s rapid growth and technical scale, I believe my background aligns strongly with your current roadmap. I have attached my resume and would welcome the chance for a brief 10-minute introductory conversation.\n\nBest regards,\n${candidateName}\nLinkedIn: linkedin.com/in/${candidateName.toLowerCase().replace(/\s+/g, '')}\nPortfolio / GitHub: github.com/${candidateName.toLowerCase().replace(/\s+/g, '')}`;
    } else if (pitchMode === 'portfolio') {
      subject = `Quick note from ${candidateName} re: ${targetRole} at ${compName} (Live Projects Included)`;
      body = `Hi ${recName},\n\nI'm reaching out because I've been closely following ${compName}'s engineering accomplishments, especially around scalable product architectures.\n\nI am a ${targetRole} with hands-on expertise in ${skills}. I recently engineered a full-stack open-source career matching platform with real-time vector embeddings and containerized microservices.\n\nYou can review my live code repositories and technical write-ups here: github.com/${candidateName.toLowerCase().replace(/\s+/g, '')}.\n\nWould you be open to connecting this week to discuss how my skill set can support your team's objectives?\n\nWarmly,\n${candidateName}`;
    } else if (pitchMode === 'founder') {
      subject = `Building ${compName} — Quick intro from ${candidateName} (${targetRole})`;
      body = `Hi ${recName},\n\nHuge fan of what you are building at ${compName}! As an engineer who thrives in high-velocity startup environments, I am excited by your product vision.\n\nI ship fast with ${skills}, having taken zero-to-one MVPs from database architecture to production deployment. I love owning end-to-end features and solving complex engineering bottlenecks.\n\nI'd love to chat about where ${compName} needs the most engineering firepower right now.\n\nCheers,\n${candidateName}`;
    } else {
      subject = `${targetRole} opening at ${compName} — Quick referral inquiry`;
      body = `Hi ${recName},\n\nHope you're having a great week! I came across the ${targetRole} opening at ${compName} and was impressed by the team's engineering standards.\n\nWith my background in ${skills}, I believe I could make an immediate contribution to your group. If you feel there is a good fit, would you be open to submitting an internal referral on my behalf?\n\nI've linked my resume and profile for your review. Happy to answer any questions!\n\nBest regards,\n${candidateName}`;
    }

    // Sanitize any accidental raw double bracket template artifacts
    subject = subject.replace(/\{\{\s*company_name\s*\}\}/gi, compName)
                     .replace(/\{\{\s*recruiter_name\s*\}\}/gi, recName)
                     .replace(/\{\{\s*role_title\s*\}\}/gi, targetRole);
    body = body.replace(/\{\{\s*company_name\s*\}\}/gi, compName)
               .replace(/\{\{\s*recruiter_name\s*\}\}/gi, recName)
               .replace(/\{\{\s*role_title\s*\}\}/gi, targetRole);

    return { subject, body };
  }, [recruiterName, companyName, roleTitle, candidateName, candidateSkills, pitchMode]);

  // Editable Draft State
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isCustomEdited, setIsCustomEdited] = useState(false);

  // Synchronize default formula changes to editable draft unless manually edited
  React.useEffect(() => {
    if (!isCustomEdited) {
      setEditedSubject(defaultEmail.subject);
      setEditedBody(defaultEmail.body);
    }
  }, [defaultEmail, isCustomEdited]);

  const handleResetToDefault = () => {
    setIsCustomEdited(false);
    setEditedSubject(defaultEmail.subject);
    setEditedBody(defaultEmail.body);
  };

  const handleCopy = () => {
    const finalSub = editedSubject || defaultEmail.subject;
    const finalBody = editedBody || defaultEmail.body;
    navigator.clipboard.writeText(`Subject: ${finalSub}\n\n${finalBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailer = () => {
    const finalSub = editedSubject || defaultEmail.subject;
    const finalBody = editedBody || defaultEmail.body;
    const mailto = `mailto:${recruiterEmail}?subject=${encodeURIComponent(finalSub)}&body=${encodeURIComponent(finalBody)}`;
    window.open(mailto, '_blank');
  };

  const handleLogOutreach = () => {
    const newEntry = {
      id: Date.now(),
      name: recruiterName || 'Hiring Manager',
      company: companyName || 'Target Tech',
      role: roleTitle || 'Software Engineer',
      date: new Date().toISOString().split('T')[0],
      status: 'Sent'
    };
    setOutreachLogs([newEntry, ...outreachLogs]);
    setToastMessage(`Outreach to ${recruiterName || 'Hiring Manager'} at ${companyName || 'Target Tech'} logged!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🛡️ CANDIDATE OUTREACH SAFETY & NO-AUTO-SEND DISCLAIMER */}
      <div style={{
        padding: '12px 18px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.82rem',
        color: '#7dd3fc',
        lineHeight: 1.45
      }}>
        <ShieldCheck size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Outreach Safety & Control Guarantee:</strong> This tool generates real-data draft pitches for your review. In compliance with candidate safety policies, <strong>emails are NEVER automatically sent on your behalf</strong>. You retain 100% control to review, edit, copy, or send manually.
        </span>
      </div>

      {!isPro && (
        <div className="glass-panel" style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))',
          border: '2px solid #ec4899',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#ec4899" /> Recruiter Outreach Studio (Pro Feature)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
              Upgrade to Pro for ₹99 to generate hyper-personalized cold outreach emails and bypass application queues!
            </div>
          </div>
          <button
            onClick={onOpenPaywall}
            className="btn-tactile btn-tactile-emerald"
            style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 900 }}
          >
            Unlock Pro (₹99) →
          </button>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.9), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '16px', marginBottom: '8px' }}>
              <Mail size={14} color="#818cf8" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#818cf8' }}>
                DIRECT HIRING MANAGER & RECRUITER OUTREACH ENGINE
              </span>
            </div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Recruiter Outreach & Cold Email Campaign Studio
            </h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
              Generate high-converting, personalized outreach pitches with proven response rates. Connect directly with decision makers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Total Outreach Logged</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>{outreachLogs.length} Candidates</div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GENERATOR WORKSPACE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)', gap: '18px' }} className="outreach-studio-grid">
        
        {/* LEFT COLUMN: PITCH CONFIGURATOR */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
            <Sliders size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Configure Target Details
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>Recruiter / Contact Name</label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => {
                  setRecruiterName(e.target.value);
                  setIsCustomEdited(false);
                }}
                placeholder="e.g. Sarah"
                style={{ padding: '9px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setIsCustomEdited(false);
                }}
                placeholder="e.g. Razorpay"
                style={{ padding: '9px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>Target Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => {
                  setRoleTitle(e.target.value);
                  setIsCustomEdited(false);
                }}
                placeholder="e.g. Backend Engineer"
                style={{ padding: '9px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>Recruiter Email (Optional)</label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="recruiting@company.com"
                style={{ padding: '9px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Pitch Tone Mode Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>Select Pitch Strategy & Tone</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PITCH_MODES.map((pm) => {
                const isSelected = pitchMode === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => {
                      setPitchMode(pm.id);
                      setIsCustomEdited(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#fff' : '#e2e8f0' }}>{pm.label}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>{pm.badge}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.35 }}>{pm.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI EMAIL EDITABLE DRAFT & DISPATCH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Editable Cold Outreach Pitch (Live Draft)
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {isCustomEdited && (
                  <button
                    onClick={handleResetToDefault}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Template
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: copied ? '#4ade80' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy Draft'}
                </button>

                <button
                  onClick={handleOpenMailer}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Send size={13} /> Open in Mail Client
                </button>
              </div>
            </div>

            {/* Editable Subject input line */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 800 }}>Subject:</span>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => {
                  setEditedSubject(e.target.value);
                  setIsCustomEdited(true);
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            {/* Editable Email Body Textarea */}
            <div style={{ position: 'relative' }}>
              <textarea
                rows={11}
                value={editedBody}
                onChange={(e) => {
                  setEditedBody(e.target.value);
                  setIsCustomEdited(true);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  fontSize: '0.84rem',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.55,
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
              <span style={{ position: 'absolute', right: '12px', bottom: '12px', fontSize: '0.68rem', color: '#64748b', pointerEvents: 'none' }}>
                ✏️ Click text to edit draft before sending
              </span>
            </div>

            {/* Save Log Button */}
            <button
              onClick={handleLogOutreach}
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} /> Log Outreach to Activity Pipeline
            </button>
          </div>

          {/* Outreach Activity Tracker Table */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Recent Recruiter Conversations
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {outreachLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.76rem' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{log.name}</strong> • <span style={{ color: '#818cf8' }}>{log.company}</span> ({log.role})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{log.date}</span>
                    <span style={{ background: log.status === 'Replied' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: log.status === 'Replied' ? '#4ade80' : '#818cf8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
