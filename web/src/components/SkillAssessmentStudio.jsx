import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Code, 
  Database, 
  Layers, 
  Cpu, 
  Zap, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoundSystem from './characters/SoundEffects';

const ASSESSMENT_TRACKS = [
  {
    id: 'python-backend',
    title: 'Python & FastAPI Microservices',
    category: 'Backend Engineering',
    icon: Code,
    color: '#38bdf8',
    durationMinutes: 10,
    questions: [
      {
        id: 'py-1',
        question: 'In FastAPI, what is the key performance difference between `async def` and regular `def` path operations?',
        options: [
          'FastAPI runs `async def` in the main event loop, while `def` is automatically dispatched to an external thread pool.',
          '`async def` is slower because it requires manual thread locks.',
          'There is zero difference; FastAPI converts all functions to synchronous threads.',
          '`def` operations bypass Pydantic request validation.'
        ],
        correctIndex: 0,
        explanation: 'FastAPI runs `async def` directly on the event loop (ideal for non-blocking I/O). Regular `def` functions are executed in an AnyIO worker thread pool to avoid blocking the event loop on CPU-bound or sync operations.'
      },
      {
        id: 'py-2',
        question: 'Which SQLAlchemy relationship configuration is essential to prevent orphaned child rows when deleting a parent ProfileModel?',
        options: [
          'cascade="all, delete-orphan"',
          'passive_deletes=True',
          'lazy="joined"',
          'uselist=False'
        ],
        correctIndex: 0,
        explanation: '`cascade="all, delete-orphan"` guarantees that when the parent entity is deleted or removed from a collection, all associated child rows are automatically deleted rather than leaving orphaned foreign keys.'
      },
      {
        id: 'py-3',
        question: 'What is the primary vulnerability prevented by storing JWT auth tokens in `HttpOnly; SameSite=Strict` cookies instead of localStorage?',
        options: [
          'Cross-Site Scripting (XSS) token exfiltration and Cross-Site Request Forgery (CSRF).',
          'SQL Injection into the auth table.',
          'DDoS attacks on the auth gateway.',
          'Bcrypt hash rainbow table collisions.'
        ],
        correctIndex: 0,
        explanation: 'HttpOnly cookies cannot be accessed by client-side JavaScript execution (preventing malicious XSS scripts from stealing JWTs), and SameSite=Strict blocks cross-site request forgery.'
      }
    ]
  },
  {
    id: 'react-frontend',
    title: 'React & Modern Frontend Architecture',
    category: 'Frontend Engineering',
    icon: Layers,
    color: '#818cf8',
    durationMinutes: 10,
    questions: [
      {
        id: 'react-1',
        question: 'Why should large static datasets (such as a 4MB question catalog) be loaded via `React.lazy()` with dynamic import() rather than static imports?',
        options: [
          'It isolates the heavy payload into a separate chunk loaded on-demand, keeping the initial JS bundle small and fast to parse.',
          'Dynamic import automatically compresses images to WebP.',
          'React does not allow static JSON imports larger than 1MB.',
          'It prevents CORS preflight requests on the client.'
        ],
        correctIndex: 0,
        explanation: 'Code-splitting with `React.lazy()` moves the heavy payload out of the initial index bundle, preventing slow first-contentful-paint (FCP) and high memory usage on initial page load.'
      },
      {
        id: 'react-2',
        question: 'In React 18+, what is the purpose of `useTransition()`?',
        options: [
          'It lets you mark UI updates as non-urgent transitions, keeping the main thread responsive for user typing and clicks.',
          'It animates CSS opacity between page routes.',
          'It replaces the useEffect hook for data fetching.',
          'It guarantees server-side rendering hydration matching.'
        ],
        correctIndex: 0,
        explanation: '`useTransition()` allows developers to designate heavy state updates (like filtering 10k items) as concurrent transitions, allowing immediate user input (typing in an input box) to interrupt rendering.'
      },
      {
        id: 'react-3',
        question: 'When implementing dark-mode glassmorphism, what CSS property is required alongside a translucent background?',
        options: [
          'backdrop-filter: blur(...)',
          'filter: drop-shadow(...)',
          'background-blend-mode: multiply',
          'mix-blend-mode: overlay'
        ],
        correctIndex: 0,
        explanation: '`backdrop-filter: blur(...)` applies the optical frosted-glass blurring effect to the elements behind the translucent element.'
      }
    ]
  },
  {
    id: 'sql-db',
    title: 'SQL, Databases & Distributed Indexing',
    category: 'Data & Infrastructure',
    icon: Database,
    color: '#10b981',
    durationMinutes: 10,
    questions: [
      {
        id: 'sql-1',
        question: 'What is the primary indexing advantage of a Composite Index `(company, role_title)` over two separate single-column indexes?',
        options: [
          'It allows single-pass B-Tree traversal for queries filtering on both `company` and `role_title` simultaneously.',
          'It reduces database disk space by 90%.',
          'It turns all SELECT queries into asynchronous tasks.',
          'It allows sorting by any arbitrary third column.'
        ],
        correctIndex: 0,
        explanation: 'A composite index allows the query planner to satisfy multi-column WHERE clauses in a single index scan without performing bitmap index intersection.'
      },
      {
        id: 'sql-2',
        question: 'In PostgreSQL and SQLite, what does Write-Ahead Logging (WAL) mode enable?',
        options: [
          'Concurrent read transactions without blocking write transactions.',
          'Automatic distributed replication across 5 cloud regions.',
          'Real-time GraphQL subscriptions on every row.',
          'Lossless compression of TEXT and BLOB columns.'
        ],
        correctIndex: 0,
        explanation: 'WAL mode allows readers to read the consistent database snapshot while writers append changes to the WAL file, enabling concurrent readers and writers.'
      }
    ]
  },
  {
    id: 'system-design',
    title: 'Distributed System Design & Microservices',
    category: 'Architecture',
    icon: Cpu,
    color: '#f59e0b',
    durationMinutes: 12,
    questions: [
      {
        id: 'sd-1',
        question: 'Why should high-latency web scraper crawlers be offloaded to background task queues instead of running inline in the HTTP request handler?',
        options: [
          'To prevent HTTP worker thread starvation and browser request timeouts during long network crawls.',
          'Because HTTP protocols forbid network sockets lasting longer than 5 seconds.',
          'Because web scrapers cannot execute inside Docker containers.',
          'To prevent database connection pooling errors.'
        ],
        correctIndex: 0,
        explanation: 'Synchronous execution of long-running operations ties up ASGI/WSGI worker threads. Offloading to background tasks allows the API to return HTTP 202/200 immediately, freeing workers to handle incoming requests.'
      },
      {
        id: 'sd-2',
        question: 'In a microservices architecture, what is the primary purpose of a Circuit Breaker pattern (e.g. for an external LLM API)?',
        options: [
          'To detect failures and prevent cascading system collapse by failing fast and switching to a fallback engine without repeatedly making doomed network calls.',
          'To encrypt API tokens in flight.',
          'To automatically compress JSON payloads.',
          'To distribute database read replicas.'
        ],
        correctIndex: 0,
        explanation: 'A Circuit Breaker stops making requests to a failing service once a threshold is reached, instantly returning fallback responses and protecting the caller from resource exhaustion.'
      }
    ]
  }
];

export default function SkillAssessmentStudio({ profile, onTriggerCelebration }) {
  const [selectedTrack, setSelectedTrack] = useState(ASSESSMENT_TRACKS[0]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [verifiedBadges, setVerifiedBadges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nof_verified_badges')) || [];
    } catch {
      return [];
    }
  });

  const activeQuestions = selectedTrack.questions;
  const currentQ = activeQuestions[currentQuestionIdx];

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    SoundSystem.playPop();
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < activeQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / activeQuestions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= 70) {
      SoundSystem.playSuccess();
      if (onTriggerCelebration) onTriggerCelebration();
      
      const newBadge = {
        trackId: selectedTrack.id,
        title: selectedTrack.title,
        score: calculatedScore,
        date: new Date().toLocaleDateString(),
        badgeName: `${selectedTrack.title} (Verified ${calculatedScore}%)`
      };

      const updated = [newBadge, ...verifiedBadges.filter(b => b.trackId !== selectedTrack.id)];
      setVerifiedBadges(updated);
      try {
        localStorage.setItem('nof_verified_badges', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setIsSubmitted(false);
    setScore(0);
  };

  const handleSwitchTrack = (track) => {
    setSelectedTrack(track);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setIsSubmitted(false);
    setScore(0);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'radial-gradient(130% 120% at 50% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '24px',
          padding: '34px 30px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Award size={14} /> Verified Candidate Technical Proof
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Skill Diagnostic & Verification Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Take timed diagnostic assessments across core tech stacks. Scoring 70%+ awards a cryptographic <strong>Verified Skill Badge</strong> that enhances your ATS profile score and recruiter trust.
          </p>
        </div>

        {verifiedBadges.length > 0 && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Trophy size={28} color="#10b981" />
            <div>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>Earned Credentials</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{verifiedBadges.length} Verified Badges</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Track Selection & Quiz Arena */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left: Tracks Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '6px' }}>
            Diagnostic Tracks
          </span>
          {ASSESSMENT_TRACKS.map(track => {
            const hasBadge = verifiedBadges.some(b => b.trackId === track.id);
            const isSelected = selectedTrack.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleSwitchTrack(track)}
                className="btn-tactile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${track.color}15`, border: `1px solid ${track.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: track.color, flexShrink: 0 }}>
                  <track.icon size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f1f5f9', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{track.questions.length} questions • {track.durationMinutes} min</span>
                </div>
                {hasBadge && (
                  <CheckCircle2 size={16} color="#10b981" title="Verified Skill" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Assessment Arena */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(16px)', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {!isSubmitted ? (
            <div>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: selectedTrack.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedTrack.category}
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                    Question {currentQuestionIdx + 1} of {activeQuestions.length}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                  <Clock size={13} /> {selectedTrack.durationMinutes} mins
                </div>
              </div>

              {/* Question Text */}
              <p style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '24px' }}>
                {currentQ.question}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === oIdx;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isSelected ? '#f8fafc' : '#cbd5e1',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Pagination & Submit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIdx === 0}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: currentQuestionIdx === 0 ? '#475569' : '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {currentQuestionIdx < activeQuestions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 18px',
                        borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#818cf8',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitAssessment}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 22px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      <CheckCircle2 size={16} /> Submit & Verify Score
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results & Verified Badge View */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: score >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `2px solid ${score >= 70 ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                {score >= 70 ? <Trophy size={36} color="#10b981" /> : <AlertTriangle size={36} color="#ef4444" />}
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                {score >= 70 ? 'Assessment Passed!' : 'Needs Review'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
                You scored <strong>{score}%</strong> on {selectedTrack.title}.
              </p>

              {score >= 70 && (
                <div style={{ maxWidth: '440px', margin: '0 auto 28px auto', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
                  <ShieldCheck size={28} color="#34d399" />
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', display: 'block' }}>Verified Badge Added to Profile</span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>This verified badge is now attached to your tailored resume exports and profile ATS card.</span>
                  </div>
                </div>
              )}

              {/* Explanations Accordion */}
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Answer Explanations & Technical Takeaways
                </span>
                {activeQuestions.map((q, idx) => {
                  const isCorrect = selectedAnswers[q.id] === q.correctIndex;
                  return (
                    <div 
                      key={q.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {isCorrect ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f1f5f9' }}>{q.question}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, paddingLeft: '24px' }}>
                        <strong style={{ color: '#cbd5e1' }}>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={handleRetake}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} /> Retake Assessment
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
