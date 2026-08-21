import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Play, 
  FileText, 
  Layers, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Compass, 
  Target, 
  ShieldCheck, 
  Check, 
  Clock, 
  Video,
  ListTodo
} from 'lucide-react';

const ROADMAP_TRACKS = [
  {
    id: 'fullstack',
    title: 'Full Stack Engineering 2026',
    badge: 'Most Popular',
    color: '#6366f1',
    description: 'Master modern React/Next.js, FastAPI/Node.js, PostgreSQL, Docker, and distributed cloud deployments.',
    milestones: [
      { id: 'fs1', title: 'React 19 & Next.js App Router Masterclass', duration: '3 weeks', completed: true, resources: [
        { title: 'Next.js 15 Full Stack Architecture & Server Actions', type: 'video', url: 'https://youtube.com', author: 'Vercel Mastery' },
        { title: 'Modern React Design Patterns & Compound Components', type: 'guide', url: 'https://react.dev', author: 'React Core Team' }
      ]},
      { id: 'fs2', title: 'High-Performance REST & GraphQL Backend with FastAPI', duration: '2.5 weeks', completed: true, resources: [
        { title: 'FastAPI Production Microservices Architecture', type: 'guide', url: 'https://fastapi.tiangolo.com', author: 'Tiangolo Docs' },
        { title: 'Async Python & Database Connection Pooling (asyncpg)', type: 'video', url: 'https://youtube.com', author: 'Python Tech' }
      ]},
      { id: 'fs3', title: 'PostgreSQL Indexing, Query Optimization & Sharding', duration: '2 weeks', completed: false, resources: [
        { title: 'Use The Index, Luke: SQL Indexing Deep Dive', type: 'guide', url: 'https://use-the-index-luke.com', author: 'Markus Winand' },
        { title: 'PostgreSQL Performance Optimization at Scale', type: 'video', url: 'https://youtube.com', author: 'Database Daily' }
      ]},
      { id: 'fs4', title: 'Docker Containers, CI/CD GitHub Actions & AWS ECS', duration: '2 weeks', completed: false, resources: [
        { title: 'Docker for Full Stack Developers (Zero to Production)', type: 'video', url: 'https://youtube.com', author: 'DevOps Directive' },
        { title: 'Automated CI/CD Pipeline Construction with GitHub Actions', type: 'guide', url: 'https://docs.github.com', author: 'GitHub Docs' }
      ]}
    ]
  },
  {
    id: 'backend',
    title: 'Backend Systems & Distributed Architecture',
    badge: 'High Salary',
    color: '#3b82f6',
    description: 'Deep dive into microservices, message queues (Kafka, RabbitMQ), caching (Redis), and system design.',
    milestones: [
      { id: 'be1', title: 'System Design Fundamentals & CAP Theorem', duration: '2 weeks', completed: true, resources: [
        { title: 'System Design Primer (Open Source Roadmap)', type: 'guide', url: 'https://github.com/donnemartin/system-design-primer', author: 'Donne Martin' },
        { title: 'Consistent Hashing & Distributed Caching Blueprint', type: 'video', url: 'https://youtube.com', author: 'Tech Dummies' }
      ]},
      { id: 'be2', title: 'Event-Driven Architectures with Apache Kafka', duration: '3 weeks', completed: false, resources: [
        { title: 'Apache Kafka Crash Course for Backend Developers', type: 'video', url: 'https://youtube.com', author: 'Confluent Community' },
        { title: 'Designing Data-Intensive Applications Study Guide', type: 'guide', url: 'https://dataintensive.net', author: 'Martin Kleppmann' }
      ]},
      { id: 'be3', title: 'Redis Caching Strategies & Rate Limiting Algorithms', duration: '1.5 weeks', completed: false, resources: [
        { title: 'Leaky Bucket & Token Bucket Rate Limiting in Python', type: 'guide', url: 'https://redis.io', author: 'Redis University' }
      ]}
    ]
  },
  {
    id: 'aiml',
    title: 'AI Engineering & LLM Application Stack',
    badge: 'Emerging',
    color: '#10b981',
    description: 'Build production GenAI systems with LangChain, LlamaIndex, Vector Databases (Pinecone/Milvus), and PyTorch.',
    milestones: [
      { id: 'ai1', title: 'Vector Embeddings, RAG Architectures & Chunking', duration: '2 weeks', completed: true, resources: [
        { title: 'Retrieval Augmented Generation (RAG) End-to-End Blueprint', type: 'video', url: 'https://youtube.com', author: 'AI Jason' }
      ]},
      { id: 'ai2', title: 'Fine-Tuning Open Source LLMs (Llama 3 / Mistral)', duration: '3 weeks', completed: false, resources: [
        { title: 'PEFT, LoRA & QLoRA Fine-Tuning Guide', type: 'guide', url: 'https://huggingface.co', author: 'Hugging Face Docs' }
      ]}
    ]
  }
];

export default function LearningRoadmapStudio({ profile }) {
  const [selectedTrackId, setSelectedTrackId] = useState('fullstack');
  const [userMilestoneStates, setUserMilestoneStates] = useState({});

  const activeTrack = useMemo(() => {
    return ROADMAP_TRACKS.find(t => t.id === selectedTrackId) || ROADMAP_TRACKS[0];
  }, [selectedTrackId]);

  const toggleMilestone = (milestoneId, defaultCompleted) => {
    setUserMilestoneStates(prev => {
      const current = prev[milestoneId] !== undefined ? prev[milestoneId] : defaultCompleted;
      return { ...prev, [milestoneId]: !current };
    });
  };

  const progressStats = useMemo(() => {
    let completedCount = 0;
    activeTrack.milestones.forEach(m => {
      const isDone = userMilestoneStates[m.id] !== undefined ? userMilestoneStates[m.id] : m.completed;
      if (isDone) completedCount += 1;
    });

    const percent = Math.round((completedCount / activeTrack.milestones.length) * 100);
    return { completedCount, total: activeTrack.milestones.length, percent };
  }, [activeTrack, userMilestoneStates]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HERO BANNER */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.9), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '16px', marginBottom: '8px' }}>
              <Compass size={14} color="#818cf8" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#818cf8' }}>
                CURATED CAREER ROADMAPS & ENGINEERING STUDY HUB
              </span>
            </div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Skills Roadmap & Curated Tech Learning Hub
            </h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
              Structured, milestone-based learning paths with top video tutorials, architecture guides, and interview cheat sheets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Track Progress</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                {progressStats.percent}% Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRACK SELECTOR STRIP */}
      <div className="compact-cards-grid">
        {ROADMAP_TRACKS.map((track) => {
          const isSelected = selectedTrackId === track.id;
          return (
            <div
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                border: isSelected ? `2px solid ${track.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 20px ${track.color}25` : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isSelected ? '#fff' : '#e2e8f0' }}>{track.title}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: track.color, background: `${track.color}25`, padding: '2px 8px', borderRadius: '6px' }}>
                  {track.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                {track.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ACTIVE TRACK MILESTONES & CURATED STUDY MATERIALS */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
            <span>Milestone Readiness ({activeTrack.title})</span>
            <strong>{progressStats.completedCount} of {progressStats.total} Milestones Done ({progressStats.percent}%)</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressStats.percent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #34d399)', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Milestones List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeTrack.milestones.map((m, idx) => {
            const isDone = userMilestoneStates[m.id] !== undefined ? userMilestoneStates[m.id] : m.completed;
            return (
              <div
                key={m.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: isDone ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Milestone Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      onClick={() => toggleMilestone(m.id, m.completed)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isDone ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {isDone && <Check size={16} />}
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 800 }}>MILESTONE {idx + 1}</span>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '2px 0 0', color: isDone ? '#86efac' : '#f8fafc', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {m.title}
                      </h4>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {m.duration}
                  </span>
                </div>

                {/* Curated Study Resources */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {m.resources.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#cbd5e1',
                        fontSize: '0.76rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {res.type === 'video' ? <Video size={14} color="#f43f5e" /> : <FileText size={14} color="#38bdf8" />}
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{res.title}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{res.author}</div>
                        </div>
                      </div>
                      <ExternalLink size={13} color="#818cf8" style={{ flexShrink: 0 }} />
                    </a>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
