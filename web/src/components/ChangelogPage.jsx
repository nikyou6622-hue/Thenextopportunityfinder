import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Code, 
  Building2, 
  GraduationCap, 
  CheckCircle2,
  Tag,
  Calendar,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const RELEASES = [
  {
    version: 'v2.2.0 — Production Readiness & Multi-Page Expansion',
    date: 'August 19, 2026',
    badge: 'LATEST',
    badgeColor: '#10b981',
    highlights: 'Full compliance legal surfaces, live system health telemetry, technical diagnostic studio, and community interview debriefs.',
    changes: [
      {
        category: 'Legal & Compliance',
        icon: ShieldCheck,
        color: '#10b981',
        items: [
          'Added comprehensive Public DPDP Act 2023 Privacy Policy with Data Fiduciary disclosures.',
          'Added Terms of Service detailing the Zero Auto-Apply Structural Guardrail policy.',
          'Documented AES-256 GCM field-level encryption and 90-day automated purge loop schedule.'
        ]
      },
      {
        category: 'Telemetry & Health',
        icon: Zap,
        color: '#38bdf8',
        items: [
          'Added GET /api/health endpoint monitoring 6 Big-MNC scrapers and 4 India internship adapters.',
          'Added real-time System Status dashboard with latency gauges and 24h uptime tracking.'
        ]
      },
      {
        category: 'Candidate Intelligence',
        icon: Code,
        color: '#818cf8',
        items: [
          'Introduced Skill Assessment & Diagnostic Studio across 5 tracks with instant verified badges.',
          'Launched Indian Tech & Campus Interview Debriefs forum with transparent CTC breakdowns.'
        ]
      }
    ]
  },
  {
    version: 'v2.1.0 — Security Hardening & Bundle Optimization',
    date: 'August 18, 2026',
    badge: 'SECURITY',
    badgeColor: '#818cf8',
    highlights: 'Migrated to HttpOnly cookie auth, reduced initial bundle from 4.49MB to 133kB, and resolved all 4 named audit defects.',
    changes: [
      {
        category: 'Security & Auth',
        icon: ShieldCheck,
        color: '#818cf8',
        items: [
          'Migrated JWT tokens from localStorage to HttpOnly; Secure; SameSite=Strict cookies.',
          'Restricted CORS origins to approved domain whitelist.',
          'Purged dev API keys from all client-side UI fetch requests.'
        ]
      },
      {
        category: 'Performance',
        icon: Layers,
        color: '#f59e0b',
        items: [
          'Implemented React.lazy() and manualChunks in vite.config.js, dropping initial JS bundle by 97%.',
          'Isolated 3.93MB LeetCode problem bank into an on-demand async chunk.'
        ]
      }
    ]
  },
  {
    version: 'v2.0.0 — Big-MNC Portals & India Internships',
    date: 'August 14, 2026',
    badge: 'MAJOR',
    badgeColor: '#ec4899',
    highlights: 'Launched Big-MNC career portal scanner (Agent 2B) and India Internship Hub covering Unstop, Cuvette, and Internshala.',
    changes: [
      {
        category: 'Scraper Engine',
        icon: Building2,
        color: '#ec4899',
        items: [
          'Built direct career portal scrapers for Google, Microsoft, Amazon, TCS, Infosys, and Wipro.',
          'Added deterministic SHA-256 job fingerprinting and robots.txt crawl-delay compliance.',
          'Integrated Unstop and Cuvette internship aggregators with INR 15k-80k stipend parsing.'
        ]
      }
    ]
  },
  {
    version: 'v1.0.0 — Initial Multi-Agent Release',
    date: 'August 1, 2026',
    badge: 'RELEASE',
    badgeColor: '#64748b',
    highlights: 'Core multi-agent foundation: 5-pillar ATS resume scoring, 11 templates, 1-click tailoring, and Kanban lifecycle tracker.',
    changes: [
      {
        category: 'Core Agents',
        icon: GitBranch,
        color: '#64748b',
        items: [
          'Launched Agent 1 resume parser with mathematical 5-pillar scoring algorithm.',
          'Launched Agent 4 zero-hallucination tailoring and multi-format PDF/DOCX export.',
          'Launched Agent 8 AI mock interview coach with STAR evaluation.'
        ]
      }
    ]
  }
];

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'radial-gradient(130% 120% at 50% 0%, rgba(99, 102, 241, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <GitBranch size={14} /> Official Platform Changelog
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Changelog & Product Evolution
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Stay updated with every release, scraper adapter expansion, security enhancement, and ATS optimization shipped to Next Opportunity Finder.
          </p>
        </div>
      </motion.div>

      {/* Release Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {RELEASES.map((rel, rIdx) => (
          <div 
            key={rIdx}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px 28px',
              backdropFilter: 'blur(16px)',
              position: 'relative'
            }}
          >
            {/* Release Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>{rel.version}</h2>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', background: `${rel.badgeColor}18`, border: `1px solid ${rel.badgeColor}35`, color: rel.badgeColor, fontSize: '0.72rem', fontWeight: 800 }}>
                    {rel.badge}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1' }}>{rel.highlights}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                <Calendar size={13} /> {rel.date}
              </div>
            </div>

            {/* Changes Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {rel.changes.map((cat, cIdx) => (
                <div key={cIdx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <cat.icon size={15} color={cat.color} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cat.category}
                    </span>
                  </div>

                  <ul style={{ margin: 0, paddingLeft: '22px', color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.7 }}>
                    {cat.items.map((item, iIdx) => (
                      <li key={iIdx} style={{ marginBottom: '4px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
