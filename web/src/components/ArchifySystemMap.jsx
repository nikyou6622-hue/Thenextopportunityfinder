import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Search, 
  BrainCircuit, 
  DollarSign, 
  Code, 
  Mail, 
  CheckCircle2, 
  ExternalLink,
  Activity,
  Zap,
  Lock,
  Compass,
  Play,
  RotateCcw
} from 'lucide-react';

const ARCHITECTURE_VIEWS = [
  { id: 'user_journey', label: '1. End-to-End User Journey Flow', icon: Activity, desc: 'Step-by-step candidate progression from raw resume to offer negotiation.' },
  { id: 'system_runtime', label: '2. Multi-Agent System Runtime Map', icon: Cpu, desc: 'Interactive topology of FastAPI gateway, Python agents, and SQLite models.' },
  { id: 'security_vault', label: '3. DPDP Security & Privacy Vault', icon: ShieldCheck, desc: 'Field-level AES encryption, PII stripping, and Right to Erasure pipeline.' }
];

const AGENT_NODES = [
  {
    id: 'client_ui',
    name: 'Frontend Client Suite',
    category: 'Client Tier',
    tech: 'React 18 + Vite + Glassmorphism',
    color: '#6366f1',
    description: '16 specialized glassmorphic hubs: ATS WYSIWYG studio, in-browser code runner, audio mock interviewer, and salary calculators.',
    inputs: 'User keystrokes, audio microphone stream, PDF uploads, filter queries',
    outputs: 'Real-time 5-pillar ATS score, dynamic A4 canvas, localized ₹ CTC bands'
  },
  {
    id: 'api_gateway',
    name: 'FastAPI Gateway & Session Router',
    category: 'Gateway Tier',
    tech: 'FastAPI + Pydantic v2 + Uvicorn',
    color: '#3b82f6',
    description: 'High-throughput async ASGI backend handling auth tokens, rate limiting, and agent routing.',
    inputs: 'REST JSON payloads, auth headers, export requests',
    outputs: 'Salted session tokens, JSON responses, binary PDF/LaTeX streams'
  },
  {
    id: 'agent1_ats',
    name: 'Agent 1: Canonical ATS Parser',
    category: 'AI Agent Tier',
    tech: 'agent1_parser.py',
    color: '#8b5cf6',
    description: '5-pillar scoring algorithm measuring skill density, metric quantization, contact health, and keyword weights.',
    inputs: 'Raw text, structured CV JSON, target job specs',
    outputs: 'ATS score (0-100), missing skills list, actionable optimization tips'
  },
  {
    id: 'agent2_discovery',
    name: 'Agent 2: Multi-Source Job Scanner',
    category: 'AI Agent Tier',
    tech: 'agent2_discovery.py + Scrapers',
    color: '#10b981',
    description: 'Aggregates and verifies live jobs from Indian Startups, Global Big Tech, India Internships 🇮🇳, and direct MNC gateways.',
    inputs: 'Keyword searches, location filters, stipend parameters in ₹',
    outputs: 'Verified job feed, live URL health checks, match scores'
  },
  {
    id: 'agent4_tailor',
    name: 'Agent 4: Resume Tailor & Export Compiler',
    category: 'AI Agent Tier',
    tech: 'agent4_tailor.py + agent4_export_generator.py',
    color: '#ec4899',
    description: 'Job-specific bullet rewriter that bridges missing skills and compiles production-ready PDF, LaTeX, DOCX, and Markdown resumes.',
    inputs: 'Base resume profile + selected job description',
    outputs: 'Tailored CV, match delta (+15% score), downloadable .tex & .pdf'
  },
  {
    id: 'agent8_interview',
    name: 'Agent 8: AI Mock Interviewer',
    category: 'AI Agent Tier',
    tech: 'agent8_interview_prep.py',
    color: '#06b6d4',
    description: 'Voice-enabled AI simulator evaluating answers with the STAR rubric (Situation, Task, Action, Result) and outcome diagnosis.',
    inputs: 'Candidate audio/text responses, company context',
    outputs: 'Real-time transcript, STAR scores, bottleneck diagnosis report'
  },
  {
    id: 'salary_engine',
    name: 'Salary Intelligence Engine',
    category: 'Intelligence Tier',
    tech: 'salary_intelligence.py',
    color: '#fbbf24',
    description: 'Live compensation percentiles (25th, 50th, 75th, 90th) in Indian Rupees (₹) with total CTC splits (Base, Stocks, Bonus).',
    inputs: 'Role specialization, experience years, location, company tier',
    outputs: 'Median ₹ CTC, monthly in-hand post-tax ₹ estimate, negotiation scripts'
  },
  {
    id: 'db_vault',
    name: 'Encrypted SQLite & Vector Vault',
    category: 'Storage Tier',
    tech: 'SQLite + AES-256 Field Encryption',
    color: '#14b8a6',
    description: 'Persistent relational database managing users, tailored resumes, application kanban pipelines, and encrypted PII.',
    inputs: 'User profiles, job applications, coding attempts, email logs',
    outputs: 'Decrypted session data, historical analytics, audit trail'
  }
];

export default function ArchifySystemMap({ onNavigate }) {
  const [activeView, setActiveView] = useState('user_journey');
  const [selectedNodeId, setSelectedNodeId] = useState('agent1_ats');
  const [isPlayingFlow, setIsPlayingFlow] = useState(true);

  const selectedNode = AGENT_NODES.find(n => n.id === selectedNodeId) || AGENT_NODES[0];

  return (
    <div className="glass-panel" style={{
      padding: '28px',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(11, 15, 25, 0.98))',
      border: '1px solid rgba(99, 102, 241, 0.35)',
      borderRadius: '20px',
      boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', padding: '3px 10px', borderRadius: '14px', marginBottom: '6px' }}>
            <Cpu size={13} color="#818cf8" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8', letterSpacing: '0.04em' }}>
              ARCHIFY™ VERIFIED SYSTEM MAP & WORKFLOW RUNTIME
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
            Interactive Architecture & Data-Flow Visualizer
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Explore verified runtime components, multi-agent pipelines, and end-to-end data flow.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ARCHITECTURE_VIEWS.map((v) => {
            const isSelected = activeView === v.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontSize: '0.76rem',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isSelected ? '#818cf8' : '#94a3b8'} />
                <span>{v.label.split('.')[1] || v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 VIEW 1: END-TO-END CANDIDATE WORKFLOW LIFECYCLE */}
      {activeView === 'user_journey' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px' }}>
            
            {/* Visual Lifecycle Stepper */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', position: 'relative' }}>
              
              {/* Step 1 */}
              <div 
                onClick={() => onNavigate('profile')}
                style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#818cf8', background: 'rgba(99, 102, 241, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>STAGE 1</span>
                  <FileText size={16} color="#818cf8" />
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Resume & ATS Studio</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>WYSIWYG live editing with 5 ATS certified templates and real-time score.</p>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => onNavigate('jobs')}
                style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#60a5fa', background: 'rgba(59, 130, 246, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>STAGE 2</span>
                  <Search size={16} color="#60a5fa" />
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>AI Discovery & MNCs</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Multi-source verified jobs, Indian internships 🇮🇳, and direct MNC gateways.</p>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => onNavigate('tailor')}
                style={{ background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.35)', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f472b6', background: 'rgba(236, 72, 153, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>STAGE 3</span>
                  <Sparkles size={16} color="#f472b6" />
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>1-Click Tailor Hub</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Targeted skill bridging, bullet optimization, and LaTeX export.</p>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => onNavigate('interview-prep')}
                style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.35)', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#22d3ee', background: 'rgba(6, 182, 212, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>STAGE 4</span>
                  <BrainCircuit size={16} color="#22d3ee" />
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>AI Mock Interview</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Voice-enabled STAR evaluation and bottleneck diagnosis.</p>
              </div>

              {/* Step 5 */}
              <div 
                onClick={() => onNavigate('salary')}
                style={{ background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.35)', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>STAGE 5</span>
                  <DollarSign size={16} color="#fbbf24" />
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Salary Intelligence (₹)</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>CTC percentiles in ₹ and AI counter-offer negotiation scripts.</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 🌟 VIEW 2: MULTI-AGENT ARCHITECTURE & SYSTEM TOPOLOGY */}
      {activeView === 'system_runtime' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.85fr)', gap: '16px' }} className="archify-topology-grid">
          
          {/* Node Topology Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }} className="archify-node-matrix">
            {AGENT_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: isSelected ? `${node.color}20` : 'rgba(15, 23, 42, 0.7)',
                    border: isSelected ? `1.5px solid ${node.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: node.color }}>{node.category}</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  </div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 2px' }}>{node.name}</h4>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>{node.tech}</div>
                </div>
              );
            })}
          </div>

          {/* Detailed Node Inspector Panel */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: `1px solid ${selectedNode.color}45`, borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: selectedNode.color }}>NODE SPECIFICATION</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>{selectedNode.name}</h3>
              </div>
              <span style={{ background: `${selectedNode.color}25`, color: selectedNode.color, padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                {selectedNode.category}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45, margin: 0 }}>
              {selectedNode.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Inbound Payloads / Telemetry:</span>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '2px' }}>{selectedNode.inputs}</div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Outbound Artifacts / Synthesis:</span>
                <div style={{ fontSize: '0.74rem', color: '#4ade80', marginTop: '2px' }}>{selectedNode.outputs}</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 🌟 VIEW 3: DPDP SECURITY & DATA VAULT */}
      {activeView === 'security_vault' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(20, 184, 166, 0.35)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                India Digital Personal Data Protection (DPDP) Act Architecture
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                Automated privacy safeguards ensuring complete candidate autonomy and zero third-party leakage.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <strong style={{ fontSize: '0.78rem', color: '#2dd4bf' }}>1. Right to Erasure</strong>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>Instant hard-deletion of resume text, contact PII, and interview transcripts from local databases.</p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <strong style={{ fontSize: '0.78rem', color: '#2dd4bf' }}>2. AES-256 Field Encryption</strong>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>All profile fields and resume records are stored with salted encryption tokens (`enc::` prefix).</p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <strong style={{ fontSize: '0.78rem', color: '#2dd4bf' }}>3. Data Portability Export</strong>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>1-click complete JSON machine-readable export of all candidate applications and history.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
