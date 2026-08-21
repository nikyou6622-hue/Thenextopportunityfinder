import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Building2,
  HelpCircle,
  PlayCircle,
  BookOpen,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Award,
  TrendingUp,
  MessageSquare,
  Compass,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ShieldCheck,
  Zap,
  Youtube,
  Bookmark,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Search,
  Check,
  Database
} from 'lucide-react';
import SoundSystem from './characters/SoundEffects';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';
import { ZenithCharacter } from './characters/CharacterUniverse';
import { ORAL_INTERVIEW_QUESTIONS, ORAL_INTERVIEW_CATEGORIES } from '../utils/interviewOralQuestions';
import { TOP_COMPANIES_LIST, LEETCODE_COMPANY_QUESTIONS } from '../utils/leetcodeCompanyQuestions';

const CURATED_INTERVIEW_RESOURCES = [
  // 1. Data Structures & Algorithms (Coding Rounds)
  {
    id: 'neetcode-yt',
    title: 'NeetCode — YouTube Channel',
    creator: 'NeetCode (Ex-Google Engineer)',
    category: 'dsa',
    categoryLabel: '1. DSA & Coding',
    type: 'youtube',
    badge: 'NeetCode 150',
    color: '#6366f1',
    videoId: 'KLlXCFG5TnA',
    thumbnail: 'https://img.youtube.com/vi/KLlXCFG5TnA/hqdefault.jpg',
    url: 'https://www.youtube.com/@NeetCode',
    companionUrl: 'https://neetcode.io/',
    companionLabel: 'NeetCode.io Structured Practice Platform',
    description: 'Concise, pattern-based problem walkthroughs by a former Google engineer. Start with the "NeetCode 150" playlist for the highest-yield problem set.'
  },
  {
    id: 'striver-yt',
    title: 'take U forward (Striver) — YouTube Channel',
    creator: 'Raj Vikramaditya (Ex-Google / Amazon)',
    category: 'dsa',
    categoryLabel: '1. DSA & Coding',
    type: 'youtube',
    badge: 'Striver A2Z Sheet 🇮🇳',
    color: '#10b981',
    videoId: 'EAR7De6Gpd4',
    thumbnail: 'https://img.youtube.com/vi/EAR7De6Gpd4/hqdefault.jpg',
    url: 'https://www.youtube.com/@takeUforward',
    companionUrl: 'https://takeuforward.org/',
    companionLabel: 'takeuforward.org DSA Sheets & Notes',
    description: 'India-focused, deeply structured DSA course (Striver\'s A2Z DSA Sheet) taught by an ex-Google/Amazon engineer. Strong choice for MNC and India-startup interview prep.'
  },
  // 2. System Design
  {
    id: 'bytebytego-yt',
    title: 'ByteByteGo — YouTube Channel',
    creator: 'Alex Xu (Author, System Design Interview)',
    category: 'system-design',
    categoryLabel: '2. System Design',
    type: 'youtube',
    badge: 'System Design 2.0',
    color: '#3b82f6',
    videoId: 'i53Gi_K3o7I',
    thumbnail: 'https://img.youtube.com/vi/i53Gi_K3o7I/hqdefault.jpg',
    url: 'https://www.youtube.com/@ByteByteGo',
    companionUrl: 'https://bytebytego.com/',
    companionLabel: 'ByteByteGo Visual Platform',
    description: 'Run by the authors of the System Design Interview book series. Clear, diagram-heavy breakdowns of real-world large-scale systems — excellent for mid-to-senior interview prep.'
  },
  {
    id: 'sys-design-primer',
    title: 'The System Design Primer — GitHub',
    creator: 'Donne Martin',
    category: 'system-design',
    categoryLabel: '2. System Design',
    type: 'github',
    badge: 'GitHub Star ⭐️',
    color: '#8b5cf6',
    videoId: 'xpDnVSmNFX0',
    thumbnail: 'https://img.youtube.com/vi/xpDnVSmNFX0/hqdefault.jpg',
    url: 'https://github.com/donnemartin/system-design-primer',
    description: 'The most-starred open-source system design reference on GitHub. Covers scalability fundamentals, case studies, and a large interview-question bank with sample solutions, free.'
  },
  // 3. Behavioral & HR Round
  {
    id: 'star-method-yt',
    title: 'STAR Method Interview: How to Answer Behavioral Questions',
    creator: 'Career Success & Interview Prep',
    category: 'behavioral',
    categoryLabel: '3. Behavioral & HR',
    type: 'youtube',
    badge: 'STAR Framework',
    color: '#ec4899',
    videoId: 'dRqN4BuhCHU',
    thumbnail: 'https://img.youtube.com/vi/dRqN4BuhCHU/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dRqN4BuhCHU',
    description: 'Clear walkthrough of structuring behavioral answers using the Situation-Task-Action-Result framework, with worked examples.'
  },
  {
    id: 'tech-interview-handbook',
    title: 'Tech Interview Handbook — GitHub',
    creator: 'Yangshun Tay (Ex-Meta Staff)',
    category: 'behavioral',
    categoryLabel: '3. Behavioral & HR',
    type: 'github',
    badge: 'Handbook',
    color: '#f43f5e',
    videoId: 'yXzWp7iV5VU',
    thumbnail: 'https://img.youtube.com/vi/yXzWp7iV5VU/hqdefault.jpg',
    url: 'https://github.com/yangshun/tech-interview-handbook',
    description: 'Free, curated guide covering the full interview lifecycle: behavioral questions, resume tips, algorithm study plans, and offer negotiation — not just coding.'
  },
  // 4. Frontend / Web Development Specific
  {
    id: 'frontend-interview-handbook',
    title: 'Front End Interview Handbook — GitHub',
    creator: 'Yangshun Tay',
    category: 'frontend',
    categoryLabel: '4. Frontend & Web',
    type: 'github',
    badge: 'Web & React',
    color: '#06b6d4',
    videoId: 'N89k_0LgqM8',
    thumbnail: 'https://img.youtube.com/vi/N89k_0LgqM8/hqdefault.jpg',
    url: 'https://github.com/yangshun/front-end-interview-handbook',
    description: 'Companion to the Tech Interview Handbook, focused specifically on JavaScript, CSS, React, and front-end system design questions.'
  },
  // 5. Free Mock Interview Practice
  {
    id: 'pramp-mock',
    title: 'Pramp (via Exponent Practice) — Peer Mocks',
    creator: 'Exponent & Pramp Team',
    category: 'mock',
    categoryLabel: '5. Mock Practice',
    type: 'platform',
    badge: '5 Free Credits/Mo',
    color: '#f59e0b',
    videoId: '6Q_Psmv5ZzA',
    thumbnail: 'https://img.youtube.com/vi/6Q_Psmv5ZzA/hqdefault.jpg',
    url: 'https://www.pramp.com/',
    description: 'Free peer-to-peer live mock interviews — you interview a peer, then they interview you. Covers DSA, system design, behavioral, and (beta) frontend & data science tracks.'
  }
];

export default function InterviewPrepStudio({
  applications = [],
  profile = null,
  selectedAppId = null,
  onSelectApplication = null,
  onLaunchSandboxWithProblem = null,
  onTriggerCelebration,
  onOpenPaywall,
  isPro = false
}) {
  const [activeAppId, setActiveAppId] = useState(selectedAppId || applications[0]?.id || null);
  const [studioTab, setStudioTab] = useState('brief'); // brief, questions, mock, study, coding
  const [prepData, setPrepData] = useState(null);
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [prepError, setPrepError] = useState(null);

  // Mock Simulator State
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);

  // Study Materials State
  const [studyMaterials, setStudyMaterials] = useState(null);
  const [loadingStudy, setLoadingStudy] = useState(false);

  // Coding Studio State
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [selectedCodingQ, setSelectedCodingQ] = useState(null);
  const [codingCode, setCodingCode] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showApproach, setShowApproach] = useState(false);
  const [codingAttemptResult, setCodingAttemptResult] = useState(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Question Filter
  const [questionCategory, setQuestionCategory] = useState('all');

  // Curated Resource Hub Filter & Video Player Modal State
  const [selectedResourceCategory, setSelectedResourceCategory] = useState('all');
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // 100 Oral Interview Questions State
  const [oralCategory, setOralCategory] = useState('all');
  const [oralSearch, setOralSearch] = useState('');
  const [expandedModelAnswerId, setExpandedModelAnswerId] = useState(null);
  const [isSpeakingId, setIsSpeakingId] = useState(null);
  const [isRecordingId, setIsRecordingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Company-Wise LeetCode Bank State
  const [selectedTargetCompany, setSelectedTargetCompany] = useState('all');
  const [companyTimeFrame, setCompanyTimeFrame] = useState('all');
  const [companyDifficulty, setCompanyDifficulty] = useState('all');
  const [companySearch, setCompanySearch] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Copy Problem & Starter Code to Clipboard
  const handleCopyProblemCode = (q) => {
    const codeText = q.starter_code?.python || q.starter_code?.javascript || `# ${q.title}\n# LeetCode: ${q.url}\n# Approach: ${q.hint}`;
    const fullText = `/* LeetCode #${q.leetcodeId}: ${q.title} */\n/* Target Companies: ${q.companies?.join(', ')} */\n/* Pattern: ${q.pattern || q.hint} */\n\n${codeText}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCodeId(q.id);
    SoundSystem.playPop();
    setTimeout(() => setCopiedCodeId(null), 2200);
  };

  // Audio Text-to-Speech (TTS) Voice Prompt
  const handleSpeakQuestion = (text, qId) => {
    if ('speechSynthesis' in window) {
      if (isSpeakingId === qId) {
        window.speechSynthesis.cancel();
        setIsSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeakingId(null);
      utterance.onerror = () => setIsSpeakingId(null);
      setIsSpeakingId(qId);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported on this browser.");
    }
  };

  // Copy Answer Helper
  const handleCopyAnswer = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice Mic Recording (STT) into Mock Simulator
  const handleRecordAnswerForMock = (q) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type your response in the simulator.");
      setActiveQuestion({ id: q.id, question: q.question, category: q.category });
      setStudioTab('mock');
      return;
    }
    if (isRecordingId === q.id) {
      setIsRecordingId(null);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsRecordingId(q.id);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        setActiveQuestion({ id: q.id, question: q.question, category: q.category });
        setStudioTab('mock');
        setIsRecordingId(null);
      };
      recognition.onerror = () => setIsRecordingId(null);
      recognition.onend = () => setIsRecordingId(null);
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecordingId(null);
    }
  };

  // Sync active app
  useEffect(() => {
    if (selectedAppId && selectedAppId !== activeAppId) {
      setActiveAppId(selectedAppId);
    } else if (!activeAppId && applications.length > 0) {
      setActiveAppId(applications[0].id);
    }
  }, [selectedAppId, applications]);

  const activeApp = applications.find(a => a.id === activeAppId) || applications[0];

  // Fetch Interview Prep for Active Application
  const fetchPrepData = async (appId) => {
    if (!appId) return;
    setLoadingPrep(true);
    setPrepError(null);
    try {
      const res = await fetch(`/api/interview-prep/${appId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setPrepData(data);
        // Default first question for simulator
        const techQ = data.question_bank?.technical_questions || [];
        const behQ = data.question_bank?.behavioral_questions || [];
        const allQ = [...techQ, ...behQ];
        if (allQ.length > 0 && !activeQuestion) {
          setActiveQuestion(allQ[0]);
        }
      } else {
        const err = await res.json();
        setPrepError(err.detail || 'Failed to load interview preparation packet.');
      }
    } catch (e) {
      console.error('Error fetching interview prep:', e);
      setPrepError('Network error loading interview prep.');
    } finally {
      setLoadingPrep(false);
    }
  };

  useEffect(() => {
    if (activeAppId) {
      fetchPrepData(activeAppId);
    }
  }, [activeAppId]);

  // Fetch Coding Questions
  useEffect(() => {
    const fetchCoding = async () => {
      try {
        const res = await fetch('/api/coding-questions');
        if (res.ok) {
          const list = await res.json();
          setCodingQuestions(list);
          if (list.length > 0 && !selectedCodingQ) {
            setSelectedCodingQ(list[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching coding questions:', e);
      }
    };
    fetchCoding();
  }, []);

  // Fetch Study Materials for Role/Skills
  const fetchStudyMaterials = async () => {
    setLoadingStudy(true);
    try {
      const job = activeApp?.job || {};
      const skills = activeApp?.tailored_skills || profile?.skills || job.required_skills || ['Python', 'System Design'];
      const res = await fetch('/api/interview-prep/study-materials', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          field: job.domain || 'sde',
          role_title: job.role_title || 'Software Engineer',
          skills: skills.slice(0, 5)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStudyMaterials(data);
      }
    } catch (e) {
      console.error('Error fetching study materials:', e);
    } finally {
      setLoadingStudy(false);
    }
  };

  useEffect(() => {
    if (studioTab === 'study' && !studyMaterials) {
      fetchStudyMaterials();
    }
  }, [studioTab, activeAppId]);

  // Submit Mock Answer for Live Evaluation
  const handleEvaluateAnswer = async () => {
    if (!activeQuestion || !userAnswer.trim()) {
      alert('Please type an answer to evaluate.');
      return;
    }
    setEvaluating(true);
    try {
      const res = await fetch(`/api/interview-prep/${activeAppId}/mock-session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question_id: activeQuestion.id || 'q_1',
          question_text: activeQuestion.question,
          question_type: activeQuestion.category || 'technical',
          user_answer: userAnswer
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLastEvaluation(data.feedback);
        SoundSystem.playSuccess();
        if (onTriggerCelebration) onTriggerCelebration();
        // Refresh prep to get updated session log
        fetchPrepData(activeAppId);
      } else {
        const err = await res.json();
        alert(`Evaluation error: ${err.detail || 'Failed to evaluate answer'}`);
      }
    } catch (e) {
      console.error('Error submitting mock answer:', e);
      alert('Network error submitting response.');
    } finally {
      setEvaluating(false);
    }
  };

  // Submit Coding Attempt
  const handleSubmitCodingAttempt = async (status = 'solved') => {
    if (!selectedCodingQ) return;
    setSubmittingAttempt(true);
    try {
      const res = await fetch(`/api/coding-questions/${selectedCodingQ.question_id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_snippet: codingCode || '# Code solution',
          status: status,
          hints_viewed: hintsRevealed
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCodingAttemptResult(data);
      }
    } catch (e) {
      console.error('Error submitting coding attempt:', e);
    } finally {
      setSubmittingAttempt(false);
    }
  };

  // Filtered Question Bank
  const allQuestions = [
    ...(prepData?.question_bank?.technical_questions || []).map(q => ({ ...q, category: 'technical' })),
    ...(prepData?.question_bank?.behavioral_questions || []).map(q => ({ ...q, category: 'behavioral' }))
  ];

  const filteredQuestions = allQuestions.filter(q => {
    if (questionCategory === 'all') return true;
    if (questionCategory === 'technical') return q.category === 'technical';
    if (questionCategory === 'behavioral') return q.category === 'behavioral' && !q.india_specific;
    if (questionCategory === 'india') return q.india_specific;
    return true;
  });

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
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
              <Zap size={18} color="#ec4899" /> AI Voice & STAR Behavioral Mock Coach (Pro Feature)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
              Upgrade to Pro for ₹99 to unlock unlimited voice AI mock interviews and STAR framework scoring!
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

      {/* 🌟 ZENITH SENSEI MOCK COACH GUIDANCE */}
      <CharacterSpeechBubble
        character="zenith"
        pose="listening"
        message="I am Zenith, your Voice & Behavioral Interview Coach. Ready to rehearse under real pressure?"
        subtitle="Tip: Structure answers using STAR (Situation, Task, Action, Result) for highest recruiter marks."
        actionLabel="Jump to Voice Mock Simulator →"
        onAction={() => {
          SoundSystem.playPop();
          setStudioTab('mock');
        }}
        variant="emerald"
      />

      {/* Studio Header Card */}
      <div className="glass-panel" style={{ padding: '26px', position: 'relative', overflow: 'hidden' }}>
        {/* Background Holographic Studio Glow */}
        <div style={{
          position: 'absolute', right: '0', top: '0', bottom: '0',
          width: '320px',
          opacity: 0.3,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)'
        }}>
          <img 
            src="/thumbnails/interview_studio_banner.png" 
            alt="Interview Studio Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
                <BrainCircuit size={22} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Interview Prep Studio
                </h1>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>ZERO-HALLUCINATION AGENT 8</span>
                  <span>•</span>
                  <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={13} /> Grounded in Verified Data
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Target Role:</span>
            <select
              value={activeAppId || ''}
              onChange={(e) => {
                const newId = parseInt(e.target.value);
                setActiveAppId(newId);
                if (onSelectApplication) onSelectApplication(newId);
              }}
              style={{
                padding: '8px 14px',
                background: '#121826',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                minWidth: '240px'
              }}
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.job?.company} — {app.job?.role_title}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchPrepData(activeAppId)}
              disabled={loadingPrep}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Refresh preparation packet"
            >
              <RefreshCw size={14} className={loadingPrep ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Selected Role Meta Strip */}
        {activeApp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
              <Building2 size={13} style={{ marginRight: '4px' }} />
              {activeApp.job?.company || 'Target Company'}
            </span>
            <span style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>
              {activeApp.job?.role_title}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              • {activeApp.job?.location || 'Remote'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              • Match Score: <strong style={{ color: '#34d399' }}>{activeApp.match?.match_score || 85}%</strong>
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
              Status: {activeApp.status?.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '2px', overflowX: 'auto' }}>
          {[
            { id: 'brief', label: 'Company Brief & Intel', icon: Building2 },
            { id: 'leetcode', label: 'Company LeetCode Bank 🏢', icon: Database, count: LEETCODE_COMPANY_QUESTIONS.length, isProOnly: true },
            { id: 'oral', label: '100 Oral Prep & Model Answers 🎙️', icon: Mic, count: ORAL_INTERVIEW_QUESTIONS.length, isProOnly: true },
            { id: 'questions', label: 'Grounded Question Bank', icon: HelpCircle, count: allQuestions.length, isProOnly: true },
            { id: 'mock', label: 'Mock Interview Simulator', icon: PlayCircle, isProOnly: true },
            { id: 'study', label: 'Study Materials & Guides', icon: BookOpen },
            { id: 'coding', label: 'Coding Prep Challenges', icon: Code2, count: codingQuestions.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = studioTab === tab.id;
            const isTabLocked = !isPro && tab.isProOnly;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isTabLocked && onOpenPaywall) {
                    onOpenPaywall();
                  } else {
                    setStudioTab(tab.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isTabLocked ? '#ec4899' : (isActive ? '#ffffff' : '#94a3b8'),
                  border: 'none',
                  borderBottom: isActive ? '3px solid #6366f1' : '3px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {isTabLocked ? <span style={{ fontSize: '0.75rem' }}>🔒</span> : <Icon size={16} />}
                <span>{tab.label}</span>
                {isTabLocked && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, background: '#ec4899', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                    PRO
                  </span>
                )}
                {tab.count !== undefined && !isTabLocked && (
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    color: '#cbd5e1'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {loadingPrep && !prepData && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 16px' }}>
            <img src="/loading.svg" alt="Synthesizing Prep" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Synthesizing Grounded Interview Intelligence...
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            Customizing company brief, behavioral matrix & live mock simulator.
          </div>
        </div>
      )}

      {prepError && (
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} color="#f87171" />
          <span>{prepError}</span>
        </div>
      )}

      {/* TAB 1: COMPANY BRIEF & INTEL */}
      {studioTab === 'brief' && prepData?.company_brief && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Zero-Fabrication Disclaimer Banner */}
          <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#6ee7b7' }}>
            <img src="/Success.svg" alt="Zero-Fabrication Guarantee" style={{ width: '20px', height: '20px' }} />
            <span>
              <strong>Zero-Fabrication Guarantee:</strong> {prepData.company_brief.disclaimer || 'Company details inferred from verified job postings only. Never fabricated.'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Card 1: Product & Business Domain */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#818cf8" /> Product & Business Core
                </h3>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  {prepData.company_brief.product_confidence || 'inferred'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {prepData.company_brief.product_description || 'Product details grounded in role domain requirements.'}
              </p>
              <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#94a3b8' }}>
                Domain Category: <strong style={{ color: '#fff' }}>{prepData.company_brief.domain || 'Technology'}</strong>
              </div>
            </div>

            {/* Card 2: Funding & Growth Stage */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#10b981" /> Stage & Scale
                </h3>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  {prepData.company_brief.funding_stage_confidence || 'inferred'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {prepData.company_brief.funding_stage || 'Unknown - Verify during interview'}
              </p>
              <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#94a3b8' }}>
                Recommendation: Ask about team growth runway and business unit milestones during Q&A.
              </div>
            </div>

            {/* Card 3: Team Structure */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#a855f7" /> Team Structure & Pods
                </h3>
                <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                  {prepData.company_brief.team_confidence || 'inferred'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {prepData.company_brief.team_structure}
              </p>
            </div>

            {/* Card 4: Recent News & Hiring Context */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} color="#38bdf8" /> Hiring & Search Context
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {prepData.company_brief.recent_news}
              </p>
            </div>

          </div>

          {/* Missing Data Diagnostic Banner if any */}
          {prepData.company_brief.missing_company_data?.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fbbf24', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> Missing Information Detected in Job Listing
              </div>
              <p style={{ fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.5 }}>
                The original job listing omitted: <strong>{prepData.company_brief.missing_company_data.join(', ')}</strong>.
                Per our Zero-Hallucination standard, this data was marked as unknown rather than simulated.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🌟 TAB: COMPANY-WISE LEETCODE QUESTION BANK */}
      {studioTab === 'leetcode' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.92), rgba(15, 23, 42, 0.98))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '14px', marginBottom: '8px' }}>
                  <Database size={14} color="#818cf8" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#818cf8', letterSpacing: '0.04em' }}>
                    CURATED COMPANY-WISE LEETCODE QUESTION BANK
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                  Company-Specific Technical Coding Questions
                </h2>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                  Sourced from real technical interview rounds with recency tracking (<strong>Last 30 Days</strong>, <strong>Last 3 Months</strong>, <strong>Last 6 Months</strong>), frequency scoring, and verified YouTube solutions.
                </p>
              </div>

              {/* Quick Search */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search problem, company, or pattern..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Company Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', overflowX: 'auto', paddingBottom: '6px' }}>
              {TOP_COMPANIES_LIST.map(comp => {
                const isSelected = selectedTargetCompany === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => {
                      SoundSystem.playPop();
                      setSelectedTargetCompany(comp.id);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      background: isSelected ? comp.color : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#fff' : '#94a3b8',
                      border: isSelected ? `1px solid ${comp.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{comp.name}</span>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(0,0,0,0.25)' }}>
                      {comp.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Recency & Difficulty Filter Row */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Recency Filter */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Recency:</span>
                {['all', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months'].map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      SoundSystem.playPop();
                      setCompanyTimeFrame(time);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: companyTimeFrame === time ? 800 : 500,
                      background: companyTimeFrame === time ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                      color: companyTimeFrame === time ? '#a5b4fc' : '#94a3b8',
                      border: companyTimeFrame === time ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    {time === 'all' ? 'All Recency' : time}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Difficulty:</span>
                {['all', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => {
                      SoundSystem.playPop();
                      setCompanyDifficulty(diff);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: companyDifficulty === diff ? 800 : 500,
                      background: companyDifficulty === diff ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                      color: companyDifficulty === diff ? '#6ee7b7' : '#94a3b8',
                      border: companyDifficulty === diff ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    {diff === 'all' ? 'All' : diff}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Company LeetCode Question Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {LEETCODE_COMPANY_QUESTIONS
              .filter(q => {
                const matchesCompany = selectedTargetCompany === 'all' || 
                  q.companies.some(c => c.toLowerCase().includes(selectedTargetCompany.toLowerCase()));
                const matchesTime = companyTimeFrame === 'all' || q.timeFrame === companyTimeFrame;
                const matchesDiff = companyDifficulty === 'all' || q.difficulty === companyDifficulty;
                const matchesSearch = !companySearch.trim() ||
                  q.title.toLowerCase().includes(companySearch.toLowerCase()) ||
                  q.category.toLowerCase().includes(companySearch.toLowerCase()) ||
                  q.pattern?.toLowerCase().includes(companySearch.toLowerCase()) ||
                  q.companies.some(c => c.toLowerCase().includes(companySearch.toLowerCase()));
                return matchesCompany && matchesTime && matchesDiff && matchesSearch;
              })
              .map((q, idx) => {
                const isQuestionLocked = !isPro && idx >= 3;
                return (
                  <div
                    key={q.id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      border: isQuestionLocked ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(15, 23, 42, 0.75)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isQuestionLocked && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(3px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        textAlign: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🔒 PRO LOCKED QUESTION & ANSWER
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#f472b6' }}>
                          First 3 questions are free. Company interview solutions and video walkthroughs are blurred for Free users.
                        </div>
                        <button
                          onClick={onOpenPaywall}
                          className="btn-tactile btn-tactile-emerald"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 900, marginTop: '2px' }}
                        >
                          Unlock Question (₹99) →
                        </button>
                      </div>
                    )}

                    <div style={{
                      filter: isQuestionLocked ? 'blur(6px)' : 'none',
                      userSelect: isQuestionLocked ? 'none' : 'auto',
                      pointerEvents: isQuestionLocked ? 'none' : 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                    
                    {/* Header Row: Difficulty + Recency + Frequency */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: q.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : q.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: q.difficulty === 'Easy' ? '#34d399' : q.difficulty === 'Medium' ? '#fbbf24' : '#f87171',
                          border: `1px solid ${q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'}40`
                        }}>
                          {q.difficulty}
                        </span>

                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                          🕒 {q.timeFrame}
                        </span>
                      </div>

                      {/* Frequency Badge */}
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        🔥 {q.frequency} Freq
                      </span>
                    </div>

                    {/* Problem Title & ID */}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                        #{q.leetcodeId}. {q.title}
                      </h3>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
                        Category: <strong>{q.category}</strong> &bull; Acceptance: <strong>{q.acceptance}</strong>
                      </div>
                    </div>

                    {/* Company Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {q.companies.map((comp, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99, 102, 241, 0.25)'
                          }}
                        >
                          🏢 {comp}
                        </span>
                      ))}
                    </div>

                    {/* Pattern / Approach Hint */}
                    {q.hint && (
                      <div style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '0.76rem',
                        color: '#cbd5e1',
                        lineHeight: 1.4
                      }}>
                        <strong style={{ color: '#818cf8' }}>💡 Pattern: </strong>
                        {q.hint}
                      </div>
                    )}

                    {/* Actions Row */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px', flexWrap: 'wrap' }}>
                      {q.videoId && (
                        <button
                          onClick={() => {
                            setActiveVideoModal({
                              title: `${q.title} - Video Solution`,
                              creator: q.videoChannel,
                              videoId: q.videoId,
                              description: q.hint
                            });
                          }}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            background: 'rgba(244, 63, 94, 0.15)',
                            color: '#f43f5e',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            borderRadius: '8px',
                            padding: '7px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                          }}
                        >
                          <Youtube size={14} /> Solution Video
                        </button>
                      )}

                      {/* ⚡ Send & Solve in Sandbox Button */}
                      <button
                        onClick={() => {
                          SoundSystem.playPop();
                          if (onLaunchSandboxWithProblem) {
                            onLaunchSandboxWithProblem(q);
                          } else {
                            setActiveCodingQ({
                              id: q.id,
                              title: q.title,
                              category: q.category,
                              difficulty: q.difficulty,
                              description: q.description || q.hint,
                              starter_code: q.starter_code || {
                                python: `# LeetCode #${q.leetcodeId}: ${q.title}\n# Target Companies: ${q.companies?.join(', ')}\n\n${q.hint}`,
                                javascript: `// LeetCode #${q.leetcodeId}: ${q.title}\n// Target Companies: ${q.companies?.join(', ')}\n\n// ${q.hint}`
                              },
                              test_cases: q.test_cases || [{ input: 'Input sample', expected: 'Target output' }]
                            });
                            setStudioTab('coding');
                          }
                        }}
                        style={{
                          flex: 1,
                          minWidth: '130px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 12px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                        title="Load this problem directly into the Coding Sandbox"
                      >
                        <Code2 size={14} /> Solve in Sandbox ⚡
                      </button>

                      {/* 📋 Copy Problem & Code to Clipboard Button */}
                      <button
                        onClick={() => handleCopyProblemCode(q)}
                        style={{
                          flex: 1,
                          minWidth: '110px',
                          background: copiedCodeId === q.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          color: copiedCodeId === q.id ? '#34d399' : '#cbd5e1',
                          border: copiedCodeId === q.id ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '7px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                        title="Copy problem and starter code to clipboard"
                      >
                        {copiedCodeId === q.id ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedCodeId === q.id ? 'Copied Code!' : 'Copy Code'}</span>
                      </button>

                      <a
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: '#94a3b8',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '7px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <ExternalLink size={13} /> LeetCode #{q.leetcodeId}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 🌟 TAB: 100 ORAL QUESTIONS & MODEL ANSWERS */}
      {studioTab === 'oral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.92), rgba(15, 23, 42, 0.98))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '14px', marginBottom: '8px' }}>
                  <Mic size={14} color="#818cf8" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#818cf8', letterSpacing: '0.04em' }}>
                    100 INTERVIEW QUESTIONS WITH VERIFIED MODEL ANSWERS
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                  Oral Technical & Behavioral Rehearsal Studio
                </h2>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                  Master 100 core oral questions spanning <strong>Universal HR</strong>, <strong>Big Tech (Google/Amazon)</strong>, <strong>IT Services (TCS/Infosys)</strong>, and <strong>CS Fundamentals</strong> with STAR breakdowns and voice playback.
                </p>
              </div>

              {/* Quick Search */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search questions by keyword..."
                  value={oralSearch}
                  onChange={(e) => setOralSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  SoundSystem.playPop();
                  setOralCategory('all');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: oralCategory === 'all' ? 800 : 600,
                  background: oralCategory === 'all' ? '#6366f1' : 'rgba(255, 255, 255, 0.04)',
                  color: oralCategory === 'all' ? '#fff' : '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Sections (100)
              </button>

              {ORAL_INTERVIEW_CATEGORIES.map(cat => {
                const isSelected = oralCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      SoundSystem.playPop();
                      setOralCategory(cat.id);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      background: isSelected ? cat.color : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#fff' : '#94a3b8',
                      border: isSelected ? `1px solid ${cat.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {ORAL_INTERVIEW_QUESTIONS
              .filter(q => {
                const matchesCategory = oralCategory === 'all' || q.category === oralCategory;
                const matchesSearch = !oralSearch.trim() || 
                  q.question.toLowerCase().includes(oralSearch.toLowerCase()) ||
                  q.modelAnswer?.toLowerCase().includes(oralSearch.toLowerCase()) ||
                  q.tags?.some(t => t.toLowerCase().includes(oralSearch.toLowerCase()));
                return matchesCategory && matchesSearch;
              })
              .map((q, idx) => {
                const isExpanded = expandedModelAnswerId === q.id;
                const isSpeakingThis = isSpeakingId === q.id;
                const isRecordingThis = isRecordingId === q.id;
                const isQuestionLocked = !isPro && idx >= 3;
return (
                  <div
                    key={q.id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      borderRadius: '18px',
                      border: isQuestionLocked ? '1px solid rgba(236, 72, 153, 0.4)' : (isExpanded ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'),
                      background: isExpanded ? 'rgba(20, 26, 48, 0.75)' : 'rgba(15, 23, 42, 0.8)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isQuestionLocked && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(3px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        textAlign: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🔒 PRO LOCKED ORAL QUESTION & MODEL ANSWER
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#f472b6' }}>
                          First 3 oral questions are free. Model STAR answers and voice preparation are blurred for Free users.
                        </div>
                        <button
                          onClick={onOpenPaywall}
                          className="btn-tactile btn-tactile-emerald"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 900, marginTop: '2px' }}
                        >
                          Unlock Question (₹99) →
                        </button>
                      </div>
                    )}

                    <div style={{
                      filter: isQuestionLocked ? 'blur(6px)' : 'none',
                      userSelect: isQuestionLocked ? 'none' : 'auto',
                      pointerEvents: isQuestionLocked ? 'none' : 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {/* Header Row: Section Badge + Tag + Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          color: '#818cf8',
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {q.section} &bull; Q{q.questionNumber}
                        </span>

                        {q.tags?.map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.66rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Oral Interaction Buttons */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        
                        {/* Audio Speak TTS Button */}
                        <button
                          onClick={() => handleSpeakQuestion(q.question, q.id)}
                          style={{
                            background: isSpeakingThis ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                            color: isSpeakingThis ? '#fff' : '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Listen to Question Prompt"
                        >
                          {isSpeakingThis ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span>{isSpeakingThis ? 'Stop Audio' : 'Listen'}</span>
                        </button>

                        {/* Voice Recording STT Button */}
                        <button
                          onClick={() => handleRecordAnswerForMock(q)}
                          style={{
                            background: isRecordingThis ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
                            color: isRecordingThis ? '#fff' : '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Record your answer with your microphone"
                        >
                          {isRecordingThis ? <MicOff size={14} /> : <Mic size={14} />}
                          <span>{isRecordingThis ? 'Listening...' : 'Voice Practice'}</span>
                        </button>

                        {/* Model Answer Toggle */}
                        <button
                          onClick={() => {
                            SoundSystem.playPop();
                            setExpandedModelAnswerId(isExpanded ? null : q.id);
                          }}
                          className="btn-tactile btn-tactile-primary"
                          style={{ padding: '5px 12px', fontSize: '0.74rem' }}
                        >
                          <Lightbulb size={13} />
                          <span>{isExpanded ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.4 }}>
                      {q.question}
                    </div>

                    {/* Recruiter Objective Sneak-Peek */}
                    {q.recruiterObjective && (
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#818cf8', fontWeight: 700 }}>🎯 Recruiter Evaluates:</span>
                        <span>{q.recruiterObjective}</span>
                      </div>
                    )}

                    {/* EXPANDABLE MODEL ANSWER & STAR ACCORDION */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '10px',
                        padding: '18px 20px',
                        borderRadius: '14px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}>
                        
                        {/* Model Answer Card */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Sparkles size={14} /> RECRUITER-APPROVED MODEL ANSWER
                            </span>

                            <button
                              onClick={() => handleCopyAnswer(q.modelAnswer, q.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: copiedId === q.id ? '#34d399' : '#818cf8',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {copiedId === q.id ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedId === q.id ? 'Copied!' : 'Copy Answer'}</span>
                            </button>
                          </div>

                          <div style={{
                            padding: '14px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            borderLeft: '4px solid #6366f1',
                            borderRadius: '8px',
                            color: '#e0e7ff',
                            fontSize: '0.86rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line'
                          }}>
                            "{q.modelAnswer}"
                          </div>
                        </div>

                        {/* STAR Framework Matrix */}
                        {q.starStructure && (
                          <div>
                            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              📐 STAR Framework Breakdown
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '8px' }}>
                              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <strong style={{ color: '#38bdf8', fontSize: '0.74rem' }}>S — Situation:</strong>
                                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0' }}>{q.starStructure.situation}</p>
                              </div>
                              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <strong style={{ color: '#fbbf24', fontSize: '0.74rem' }}>T — Task:</strong>
                                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0' }}>{q.starStructure.task}</p>
                              </div>
                              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <strong style={{ color: '#a855f7', fontSize: '0.74rem' }}>A — Action:</strong>
                                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0' }}>{q.starStructure.action}</p>
                              </div>
                              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <strong style={{ color: '#34d399', fontSize: '0.74rem' }}>R — Result:</strong>
                                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0' }}>{q.starStructure.result}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Key Points & Pitfalls */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                          {q.keyPoints && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <strong style={{ color: '#34d399', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={13} /> Must-Hit Talking Points:
                              </strong>
                              <ul style={{ margin: '6px 0 0', paddingLeft: '16px', fontSize: '0.78rem', color: '#d1fae5', lineHeight: 1.5 }}>
                                {q.keyPoints.map((pt, pIdx) => (
                                  <li key={pIdx}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {q.pitfalls && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                              <strong style={{ color: '#f87171', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={13} /> Common Pitfalls to Avoid:
                              </strong>
                              <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#fecaca', lineHeight: 1.5 }}>
                                {q.pitfalls}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action: Send to Live Simulator */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            onClick={() => {
                              SoundSystem.playPop();
                              setActiveQuestion({ id: q.id, question: q.question, category: q.category });
                              setStudioTab('mock');
                            }}
                            className="btn-tactile btn-tactile-emerald"
                            style={{ padding: '7px 16px', fontSize: '0.78rem' }}
                          >
                            <PlayCircle size={14} /> Practice in AI Mock Simulator →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
          </div>

        </div>
      )}

      {/* TAB 2: GROUNDED QUESTION BANK */}
      {studioTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Question Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Questions', count: allQuestions.length },
              { id: 'technical', label: 'Technical & Architecture', count: prepData?.question_bank?.technical_questions?.length || 0 },
              { id: 'behavioral', label: 'Behavioral & Leadership', count: (prepData?.question_bank?.behavioral_questions?.filter(q => !q.india_specific) || []).length },
              { id: 'india', label: 'India-Specific 🇮🇳', count: (prepData?.question_bank?.behavioral_questions?.filter(q => q.india_specific) || []).length }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setQuestionCategory(f.id)}
                className={questionCategory === f.id ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{f.label}</span>
                <span style={{ fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)' }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Question Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredQuestions.map((q, idx) => {
              const isTech = q.category === 'technical';
              const isIndia = q.india_specific;
              const isQuestionLocked = !isPro && idx >= 3;

              return (
                <div
                  key={q.id || idx}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderLeft: isIndia ? '4px solid #ff9933' : isTech ? '4px solid #6366f1' : '4px solid #10b981',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isQuestionLocked && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 10,
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(3px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      textAlign: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔒 PRO LOCKED GROUNDED QUESTION
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#f472b6' }}>
                        Role-grounded questions, STAR breakdowns, and sample responses are blurred for Free users.
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenPaywall) onOpenPaywall();
                        }}
                        className="btn-tactile btn-tactile-emerald"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 900, marginTop: '2px' }}
                      >
                        Unlock Question (₹99) →
                      </button>
                    </div>
                  )}

                  <div style={{
                    filter: isQuestionLocked ? 'blur(6px)' : 'none',
                    userSelect: isQuestionLocked ? 'none' : 'auto',
                    pointerEvents: isQuestionLocked ? 'none' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge ${isIndia ? 'badge-amber' : isTech ? 'badge-indigo' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
                        {isIndia ? 'India-Specific 🇮🇳' : isTech ? 'Technical Mastery' : 'Behavioral STAR'}
                      </span>
                      {q.target_competency && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                          • {q.target_competency}
                        </span>
                      )}
                      {q.grounded && (
                        <span style={{ fontSize: '0.68rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                          Grounded in Experience
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveQuestion(q);
                        setUserAnswer('');
                        setLastEvaluation(null);
                        setStudioTab('mock');
                      }}
                      className="btn-primary"
                      style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <PlayCircle size={14} /> Practice in Simulator
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.5 }}>
                    {q.question}
                  </h4>

                  {q.context_hint && (
                    <div style={{ fontSize: '0.82rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.08)', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Lightbulb size={15} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Strategy Hint:</strong> {q.context_hint}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MOCK INTERVIEW SIMULATOR */}
      {studioTab === 'mock' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '24px' }}>
          
          {/* Left Column: Question Picker */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '720px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <HelpCircle size={16} color="#6366f1" /> Practice Questions ({allQuestions.length})
            </h3>

            {allQuestions.map((q, idx) => {
              const isSelected = activeQuestion?.id === q.id || activeQuestion?.question === q.question;
              return (
                <div
                  key={q.id || idx}
                  onClick={() => {
                    setActiveQuestion(q);
                    setUserAnswer('');
                    setLastEvaluation(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {!isPro && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
                    <span className={`badge ${q.india_specific ? 'badge-amber' : q.category === 'technical' ? 'badge-indigo' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                      {q.india_specific ? 'India 🇮🇳' : q.category}
                    </span>
                    {!isPro && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, background: '#ec4899', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                        PRO
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: isSelected ? '#fff' : '#cbd5e1',
                    lineHeight: 1.4,
                    filter: !isPro ? 'blur(5px)' : 'none',
                    userSelect: !isPro ? 'none' : 'auto',
                    opacity: !isPro ? 0.45 : 1
                  }}>
                    {q.question.length > 70 ? q.question.substring(0, 70) + '...' : q.question}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Answer Box & Live Evaluator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Active Question Banner */}
            {activeQuestion ? (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`badge ${activeQuestion.india_specific ? 'badge-amber' : activeQuestion.category === 'technical' ? 'badge-indigo' : 'badge-emerald'}`}>
                    {activeQuestion.india_specific ? 'India Behavioral 🇮🇳' : activeQuestion.category === 'technical' ? 'Technical Architecture' : 'Behavioral STAR'}
                  </span>
                  {activeQuestion.target_competency && (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                      • {activeQuestion.target_competency}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.45, marginBottom: '10px' }}>
                  {activeQuestion.question}
                </h3>

                {activeQuestion.context_hint && (
                  <div style={{ fontSize: '0.84rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.08)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                    <strong>Coach Tip:</strong> {activeQuestion.context_hint}
                  </div>
                )}

                {/* Textarea for Candidate Answer */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type or paste your interview response here (English or Hinglish supported, e.g., 'Maine production latency 40% kam kiya using Redis caching...'). Aim for 30-250 words with specific metrics."
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: wordCount < 15 ? '#fbbf24' : wordCount > 250 ? '#f87171' : '#34d399', fontWeight: 600 }}>
                      Word Count: {wordCount} words {wordCount < 15 ? '(Aim for 30+ words)' : wordCount > 250 ? '(A bit verbose)' : '✓ Good length'}
                    </span>

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={evaluating || !userAnswer.trim()}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {evaluating ? (
                        <>
                          <img src="/loading.svg" alt="Evaluating" style={{ width: '16px', height: '16px' }} /> Evaluating Response...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Evaluate Response
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Select a practice question from the left column to begin simulation.
              </div>
            )}

            {/* Live Evaluation Results Card */}
            {lastEvaluation && (
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} color="#818cf8" /> Evaluation Feedback
                  </h3>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      background: lastEvaluation.overall_rating?.includes('Excellent') ? 'rgba(16, 185, 129, 0.2)' : lastEvaluation.overall_rating?.includes('Good') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: lastEvaluation.overall_rating?.includes('Excellent') ? '#34d399' : lastEvaluation.overall_rating?.includes('Good') ? '#fbbf24' : '#f87171',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {lastEvaluation.overall_rating}
                  </span>
                </div>

                {/* Score Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>CLARITY SCORE</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#818cf8', marginTop: '4px' }}>
                      {lastEvaluation.clarity_score?.toFixed(0)}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>SPECIFICITY SCORE</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
                      {lastEvaluation.specificity_score?.toFixed(0)}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
                    </div>
                  </div>

                  {lastEvaluation.star_method_score !== null && (
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>STAR STRUCTURE</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
                        {lastEvaluation.star_method_score?.toFixed(0)}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Strengths & Improvements */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {lastEvaluation.strengths?.length > 0 && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} /> Key Strengths
                      </div>
                      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {lastEvaluation.strengths.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lastEvaluation.areas_for_improvement?.length > 0 && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lightbulb size={15} /> Recommendations to Improve
                      </div>
                      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {lastEvaluation.areas_for_improvement.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sample Improved Response */}
                {lastEvaluation.sample_improved_response && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '16px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={15} /> Sample Answer Blueprint
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#e0e7ff', lineHeight: 1.6, margin: 0 }}>
                      "{lastEvaluation.sample_improved_response}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Session History Log */}
            {prepData?.mock_session_log?.length > 0 && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} /> Practice Session History ({prepData.mock_session_log.length} turns)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {prepData.mock_session_log.slice(-5).reverse().map((turn, idx) => (
                    <div key={turn.turn_id || idx} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: '#818cf8' }}>Q: {turn.question_text?.substring(0, 60)}...</span>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>{turn.feedback?.overall_rating || 'Evaluated'}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                        "{turn.user_answer?.substring(0, 90)}..."
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 4: STUDY MATERIALS & CURATED RESOURCE HUB */}
      {studioTab === 'study' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.85), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 10px', borderRadius: '12px', marginBottom: '8px' }}>
                <Youtube size={14} color="#f43f5e" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.04em' }}>
                  CURATED YOUTUBE CHANNELS & INDUSTRY PLAYBOOKS
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Interview Prep Resource Hub
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0', lineHeight: 1.4 }}>
                Handpicked, link-checked YouTube deep-dives, DSA sheets, system design primers, and behavioral guides.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={fetchStudyMaterials}
                disabled={loadingStudy}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {loadingStudy ? (
                  <img src="/loading.svg" alt="Syncing" style={{ width: '15px', height: '15px' }} />
                ) : (
                  <RefreshCw size={14} />
                )}
                {loadingStudy ? 'Syncing Live Topics...' : 'Sync Live Topics'}
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'All Curated Resources', count: CURATED_INTERVIEW_RESOURCES.length },
              { id: 'dsa', label: '1. DSA & Coding Rounds', count: CURATED_INTERVIEW_RESOURCES.filter(r => r.category === 'dsa').length },
              { id: 'system-design', label: '2. System Design', count: CURATED_INTERVIEW_RESOURCES.filter(r => r.category === 'system-design').length },
              { id: 'behavioral', label: '3. Behavioral & HR Round', count: CURATED_INTERVIEW_RESOURCES.filter(r => r.category === 'behavioral').length },
              { id: 'frontend', label: '4. Frontend & Web', count: CURATED_INTERVIEW_RESOURCES.filter(r => r.category === 'frontend').length },
              { id: 'mock', label: '5. Mock Practice', count: CURATED_INTERVIEW_RESOURCES.filter(r => r.category === 'mock').length }
            ].map(cat => {
              const isSelected = selectedResourceCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedResourceCategory(cat.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: '0.66rem', padding: '1px 6px', borderRadius: '10px', background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: isSelected ? '#fff' : '#cbd5e1' }}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Curated Grid of Resource Cards with Thumbnails */}
          <div className="video-cards-grid">
            {CURATED_INTERVIEW_RESOURCES
              .filter(r => selectedResourceCategory === 'all' || r.category === selectedResourceCategory)
              .map(res => {
                return (
                  <div
                    key={res.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${res.color}35`,
                      background: 'rgba(15, 23, 42, 0.85)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = `0 14px 30px rgba(0,0,0,0.6), 0 0 20px ${res.color}25`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                    }}
                  >
                    {/* Video Thumbnail with Play Button Overlay */}
                    <div 
                      style={{ position: 'relative', width: '100%', height: '190px', background: '#0b0f19', cursor: 'pointer', overflow: 'hidden' }}
                      onClick={() => setActiveVideoModal(res)}
                    >
                      <img 
                        src={res.thumbnail} 
                        alt={res.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, transition: 'transform 0.3s ease' }}
                        onError={(e) => {
                          e.target.src = '/thumbnails/interview_studio_banner.png';
                        }}
                      />
                      
                      {/* Gradient Bottom Shadow */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)' }} />

                      {/* Play Button Hover Halo */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(244, 63, 94, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 0 25px rgba(244, 63, 94, 0.7)',
                        transition: 'transform 0.2s ease'
                      }}>
                        <Play size={22} style={{ marginLeft: '3px' }} />
                      </div>

                      {/* Category & Badge Pills */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                        <span style={{ background: 'rgba(0, 0, 0, 0.75)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                          {res.categoryLabel}
                        </span>
                      </div>

                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <span style={{ background: `${res.color}cc`, color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                          {res.badge}
                        </span>
                      </div>

                      {/* Creator overlay on bottom */}
                      <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                          {res.creator}
                        </span>
                        <span style={{ fontSize: '0.66rem', color: '#94a3b8', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                          Verified 2026
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '14px' }}>
                      
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px', lineHeight: 1.3 }}>
                          {res.title}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                          {res.description}
                        </p>
                      </div>

                      {/* Action Links & Companion Platform */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                        
                        {res.companionUrl && (
                          <a
                            href={res.companionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              color: '#38bdf8',
                              fontSize: '0.74rem',
                              fontWeight: 700
                            }}
                          >
                            <span>🔗 {res.companionLabel}</span>
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setActiveVideoModal(res)}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                              color: '#fff',
                              border: 'none',
                              padding: '9px 12px',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 0 14px rgba(244, 63, 94, 0.35)'
                            }}
                          >
                            <Play size={14} /> Watch Tutorial
                          </button>

                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '9px 12px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '8px',
                              color: '#f8fafc',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Open URL</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
          </div>

          {/* Dynamic Role-Specific Recommended Materials (From Backend API) */}
          {studyMaterials && (studyMaterials.videos?.length > 0 || studyMaterials.guides?.length > 0) && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" /> Dynamic Role-Specific Deep Dives for {activeApp?.job?.role_title || 'Target Role'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {studyMaterials.videos?.map((vid, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>{vid.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{vid.relevance}</div>
                    </div>
                    <a href={vid.url} target="_blank" rel="noopener noreferrer" style={{ color: '#f43f5e', padding: '6px' }}>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 🌟 INTERACTIVE YOUTUBE VIDEO THEATER MODAL */}
      {activeVideoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '850px',
            background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.98), rgba(15, 23, 42, 0.99))',
            border: `1px solid ${activeVideoModal.color || '#6366f1'}60`,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Youtube size={18} color="#f43f5e" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Embedded Video Player Iframe */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.videoId}?autoplay=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer with Notes & Companion Links */}
            <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.9)' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Instructor / Channel:</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>{activeVideoModal.creator}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {activeVideoModal.companionUrl && (
                  <a
                    href={activeVideoModal.companionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#818cf8',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{activeVideoModal.companionLabel}</span>
                    <ExternalLink size={13} />
                  </a>
                )}

                <a
                  href={activeVideoModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Open in YouTube</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CODING STUDIO CHALLENGES */}
      {studioTab === 'coding' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '24px' }}>
          
          {/* Coding Question Selector */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '720px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Code2 size={16} color="#10b981" /> Coding Problems ({codingQuestions.length})
            </h3>

            {codingQuestions.map((cq) => {
              const isSelected = selectedCodingQ?.question_id === cq.question_id;
              const diffColor = cq.difficulty === 'easy' ? '#34d399' : cq.difficulty === 'medium' ? '#fbbf24' : '#f87171';

              return (
                <div
                  key={cq.question_id}
                  onClick={() => {
                    setSelectedCodingQ(cq);
                    setHintsRevealed(0);
                    setShowApproach(false);
                    setCodingAttemptResult(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: diffColor }}>
                      {cq.difficulty}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {cq.field?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#fff' : '#e2e8f0' }}>
                    {cq.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Problem Details & Scratchpad */}
          {selectedCodingQ ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                      {selectedCodingQ.title}
                    </h3>
                    <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                      {selectedCodingQ.difficulty}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '16px' }}>
                  {selectedCodingQ.question_text}
                </p>

                {selectedCodingQ.constraints && (
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '16px' }}>
                    <strong>Constraints:</strong> {selectedCodingQ.constraints}
                  </div>
                )}

                {/* Progressive Hints Button */}
                {selectedCodingQ.hint_progression?.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <button
                        onClick={() => setHintsRevealed(prev => Math.min(prev + 1, selectedCodingQ.hint_progression.length))}
                        disabled={hintsRevealed >= selectedCodingQ.hint_progression.length}
                        className="btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Lightbulb size={14} color="#fbbf24" />
                        {hintsRevealed === 0 ? 'Reveal First Hint' : hintsRevealed < selectedCodingQ.hint_progression.length ? `Reveal Hint (${hintsRevealed + 1}/${selectedCodingQ.hint_progression.length})` : 'All Hints Revealed'}
                      </button>

                      <button
                        onClick={() => setShowApproach(prev => !prev)}
                        className="btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        {showApproach ? 'Hide Approach' : 'View Approach Explanation'}
                      </button>
                    </div>

                    {/* Revealed Hints */}
                    {hintsRevealed > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        {selectedCodingQ.hint_progression.slice(0, hintsRevealed).map((hint, idx) => (
                          <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#fde68a' }}>
                            <strong>Hint {idx + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    )}

                    {showApproach && selectedCodingQ.explanation_of_approach && (
                      <div style={{ marginTop: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '14px', borderRadius: '8px', fontSize: '0.84rem', color: '#e0e7ff', lineHeight: 1.5 }}>
                        <strong>Optimal Solution Strategy:</strong> {selectedCodingQ.explanation_of_approach}
                      </div>
                    )}
                  </div>
                )}

                {/* Code Scratchpad Box */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Python / Solution Workspace:
                  </label>
                  <textarea
                    rows={8}
                    value={codingCode}
                    onChange={(e) => setCodingCode(e.target.value)}
                    placeholder="def solve(nums):\n    # Write your optimal algorithm implementation here...\n    pass"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#34d399',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.5,
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button
                      onClick={() => handleSubmitCodingAttempt('attempted')}
                      disabled={submittingAttempt}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                    >
                      Save Draft Attempt
                    </button>
                    <button
                      onClick={() => handleSubmitCodingAttempt('solved')}
                      disabled={submittingAttempt}
                      className="btn-primary"
                      style={{ fontSize: '0.82rem', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} /> Mark Solved & Log
                    </button>
                  </div>
                </div>

                {codingAttemptResult && (
                  <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.84rem' }}>
                    ✓ {codingAttemptResult.message}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Select a coding problem to view description and code.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
