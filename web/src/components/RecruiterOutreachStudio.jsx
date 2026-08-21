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
  
  const [recruiterName, setRecruiterName] = useState('Sarah');
  const [companyName, setCompanyName] = useState('Razorpay');
  const [roleTitle, setRoleTitle] = useState('Backend Engineer');
  const [recruiterEmail, setRecruiterEmail] = useState('recruiting@razorpay.com');
  const [pitchMode, setPitchMode] = useState('impact');
  const [copied, setCopied] = useState(false);
  const [outreachLogs, setOutreachLogs] = useState(() => [
    { id: 1, name: 'Ananya Roy', company: 'Swiggy', role: 'Full Stack Engineer', date: '2026-08-15', status: 'Replied' },
    { id: 2, name: 'Vikram Singh', company: 'CRED', role: 'Backend SDE-2', date: '2026-08-16', status: 'Sent' }
  ]);
  const [toastMessage, setToastMessage] = useState('');

  // Dynamic Email Generation Formula
  const generatedEmail = useMemo(() => {
    let subject = '';
    let body = '';

    if (pitchMode === 'impact') {
      subject = `${roleTitle} application — ${candidateName} (Engineered 35% latency reduction)`;
      body = `Hi ${recruiterName},\n\nI noticed ${companyName} is expanding its engineering team for the ${roleTitle} position, and I wanted to reach out directly.\n\nOver the past 2+ years, I have specialized in ${candidateSkills}, focusing on building high-throughput microservices and distributed APIs. In my previous role, I engineered core service optimizations that reduced API response times by 35% and handled thousands of concurrent requests.\n\nGiven ${companyName}'s rapid growth and technical scale, I believe my background aligns strongly with your current roadmap. I have attached my resume and would welcome the chance for a brief 10-minute introductory conversation.\n\nBest regards,\n${candidateName}\nLinkedIn: linkedin.com/in/${candidateName.toLowerCase().replace(/\s+/g, '')}\nPortfolio / GitHub: github.com/${candidateName.toLowerCase().replace(/\s+/g, '')}`;
    } else if (pitchMode === 'portfolio') {
      subject = `Quick note from ${candidateName} re: ${roleTitle} at ${companyName} (Live Projects Included)`;
      body = `Hi ${recruiterName},\n\nI'm reaching out because I've been closely following ${companyName}'s engineering accomplishments, especially around scalable product architectures.\n\nI am a ${roleTitle} with hands-on expertise in ${candidateSkills}. I recently engineered a full-stack open-source career matching platform with real-time vector embeddings and containerized microservices.\n\nYou can review my live code repositories and technical write-ups here: github.com/${candidateName.toLowerCase().replace(/\s+/g, '')}.\n\nWould you be open to connecting this week to discuss how my skill set can support your team's objectives?\n\nWarmly,\n${candidateName}`;
    } else if (pitchMode === 'founder') {
      subject = `Building ${companyName} — Quick intro from ${candidateName} (${roleTitle})`;
      body = `Hi ${recruiterName},\n\nHuge fan of what you are building at ${companyName}! As an engineer who thrives in high-velocity startup environments, I am excited by your product vision.\n\nI ship fast with ${candidateSkills}, having taken zero-to-one MVPs from database architecture to production deployment. I love owning end-to-end features and solving complex engineering bottlenecks.\n\nI'd love to chat about where ${companyName} needs the most engineering firepower right now.\n\nCheers,\n${candidateName}`;
    } else {
      subject = `${roleTitle} opening at ${companyName} — Quick referral inquiry`;
      body = `Hi ${recruiterName},\n\nHope you're having a great week! I came across the ${roleTitle} opening at ${companyName} and was impressed by the team's engineering standards.\n\nWith my background in ${candidateSkills}, I believe I could make an immediate contribution to your group. If you feel there is a good fit, would you be open to submitting an internal referral on my behalf?\n\nI've linked my resume and profile for your review. Happy to answer any questions!\n\nBest regards,\n${candidateName}`;
    }

    return { subject, body };
  }, [recruiterName, companyName, roleTitle, candidateName, candidateSkills, pitchMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailer = () => {
    const mailto = `mailto:${recruiterEmail}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
    window.open(mailto, '_blank');
  };

  const handleLogOutreach = () => {
    const newEntry = {
      id: Date.now(),
      name: recruiterName,
      company: companyName,
      role: roleTitle,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent'
    };
    setOutreachLogs([newEntry, ...outreachLogs]);
    setToastMessage(`Outreach to ${recruiterName} at ${companyName} logged!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
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
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Sarah"
                style={{ padding: '9px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
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
                onChange={(e) => setRoleTitle(e.target.value)}
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
                    onClick={() => setPitchMode(pm.id)}
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

        {/* RIGHT COLUMN: AI EMAIL PREVIEW & INSTANT DISPATCH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Generated Cold Outreach Email
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
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
                  {copied ? 'Copied!' : 'Copy'}
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
                  <Send size={13} /> Open in Mail
                </button>
              </div>
            </div>

            {/* Subject line */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>Subject: </span>
              <span style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600 }}>{generatedEmail.subject}</span>
            </div>

            {/* Email Body */}
            <pre style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontSize: '0.82rem',
              fontFamily: 'inherit',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.55,
              margin: 0,
              maxHeight: '340px',
              overflowY: 'auto'
            }}>
              {generatedEmail.body}
            </pre>

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
