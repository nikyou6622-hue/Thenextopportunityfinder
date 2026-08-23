import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Code, 
  Plus, 
  X, 
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  Award,
  Zap,
  Target,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit3,
  Download,
  RefreshCw,
  Check,
  Building,
  Mail,
  Phone,
  Layers,
  ArrowRight,
  UploadCloud,
  Trash2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Wand2,
  History,
  Layout,
  FileDown,
  MoreVertical,
  Star,
  GitBranch,
  Copy,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Type,
  Palette,
  ShieldCheck,
  CheckSquare,
  Maximize,
  HelpCircle,
  Columns,
  ZoomIn,
  ZoomOut,
  WifiOff,
  RotateCcw
} from 'lucide-react';
import { 
  calculateAtsScore, 
  SCORE_WEIGHTS, 
  TIER_CONFIG, 
  ACTION_VERBS, 
  getTierConfig 
} from '../utils/resumeScoring';
import { 
  RESUME_TEMPLATES, 
  TEMPLATE_LIST, 
  DENSITY_STYLES 
} from '../utils/resumeTemplates';
import SoundSystem from './characters/SoundEffects';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';
import { LexiCharacter, NovaCharacter } from './characters/CharacterUniverse';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COMMON_SUGGESTED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "FastAPI",
  "Postgres", "Docker", "AWS", "GraphQL", "TailwindCSS", "REST API", "Machine Learning", 
  "Kubernetes", "Git"
];

const VIEW_MODES = {
  SPLIT: 'split',
  PREVIEW: 'preview',
  ATS_RAW: 'ats_raw'
};

const getInitialFormData = () => ({
  name: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  open_to_remote: true,
  summary: '',
  skills: [],
  experience_years: 0.0,
  experience_list: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  domains: [],
  template: 'modern',
  density: 'comfortable',
  section_order: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements']
});

const normalizeProfileData = (profile) => {
  if (!profile) return getInitialFormData();
  
  const rawExp = profile.experience_list || profile.experience || profile.past_roles || [];
  const expList = rawExp.length > 0 ? rawExp.map(item => ({
    title: item.title || item.role || item.job_title || 'Software Development Engineer',
    company: item.company || 'Enterprise Tech Solutions',
    dates: item.dates || item.duration || '2023 - Present',
    bullets: Array.isArray(item.bullets) 
      ? item.bullets.join('\n') 
      : (typeof item.bullets === 'string' ? item.bullets : (item.description || 'Engineered scalable web systems and API microservices.'))
  })) : [];

  const rawEdu = profile.education_list || profile.education || [];
  const eduList = rawEdu.length > 0 ? rawEdu.map(item => ({
    degree: item.degree || 'B.Tech in Computer Science & Engineering',
    field: item.field || item.major || 'Computer Science & Engineering',
    institution: item.institution || item.college || item.university || 'Institute of Technology',
    year: item.year || item.grad_year || '2023'
  })) : [];

  const rawProj = profile.projects || [];
  const projList = rawProj.length > 0 ? rawProj.map(item => ({
    title: item.title || item.name || 'AI Career Intelligence Platform',
    technologies: Array.isArray(item.technologies || item.tech_stack) 
      ? (item.technologies || item.tech_stack).join(', ') 
      : (item.technologies || item.tech_stack || 'React, Python, FastAPI, Docker'),
    description: item.description || item.summary || 'Multi-agent career intelligence and real-time ATS resume optimization suite'
  })) : [];

  return {
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    city: profile.location?.city || profile.city || 'Bengaluru',
    country: profile.location?.country || profile.country || 'India',
    open_to_remote: profile.location?.open_to_remote ?? profile.open_to_remote ?? true,
    summary: profile.summary || '',
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    experience_years: profile.experience_years || 2.0,
    experience: expList,
    experience_list: expList,
    education: eduList,
    projects: projList,
    certifications: profile.certifications || [],
    achievements: profile.achievements || [],
    domains: profile.domains || [],
    template: profile.template || 'modern',
    density: profile.density || 'comfortable',
    section_order: profile.section_order || ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements']
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ScoreRing = ({ score, color }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 10px' }}>
      <svg width="110" height="110" viewBox="0 0 120 120">
        <circle 
          cx="60" cy="60" r={radius} 
          stroke="rgba(255, 255, 255, 0.08)" 
          strokeWidth="10" 
          fill="transparent" 
        />
        <circle 
          cx="60" cy="60" r={radius} 
          stroke={color} 
          strokeWidth="10" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} 
        />
      </svg>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>OUT OF 100</span>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, max, color }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '3px' }}>
      <span>{label}</span>
      <strong>{score} / {max}</strong>
    </div>
    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
      <div 
        style={{ 
          width: `${Math.min(100, Math.max(0, (score / max) * 100))}%`,
          height: '100%',
          background: color,
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} 
      />
    </div>
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, type = 'text', icon: Icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {Icon && <Icon size={14} color="#818cf8" />} {label}
    </label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#f8fafc',
        fontSize: '0.84rem',
        outline: 'none',
        boxSizing: 'border-box'
      }}
    />
  </div>
);

const FormTextarea = ({ label, value, onChange, placeholder, rows = 3, icon: Icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
    {label && (
      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {Icon && <Icon size={14} color="#818cf8" />} {label}
      </label>
    )}
    <textarea 
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#f8fafc',
        fontSize: '0.84rem',
        lineHeight: 1.5,
        outline: 'none',
        resize: 'vertical',
        boxSizing: 'border-box'
      }}
    />
  </div>
);

const SectionCard = ({ title, icon: Icon, count, action, actionLabel, actionIcon: ActionIcon = Plus, children }) => (
  <div className="glass-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={17} color="#818cf8" />
        <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>{title}</h3>
        {count !== undefined && <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>({count})</span>}
      </div>
      {action && (
        <button 
          onClick={action}
          style={{
            background: 'rgba(99, 102, 241, 0.18)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ActionIcon size={13} /> {actionLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

// --- Controlled Overlay WYSIWYG Inline Editable Text ---
function InlineEditableText({ 
  value, 
  onChange, 
  onClick,
  placeholder = 'Click to edit...', 
  multiline = false,
  tag = 'div',
  style = {},
  inputStyle = {},
  className = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (typeof inputRef.current.select === 'function' && !multiline) {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleCommit = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setTempValue(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            color: 'inherit',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid #6366f1',
            borderRadius: '4px',
            padding: '4px 6px',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            ...style,
            ...inputStyle
          }}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid #6366f1',
          borderRadius: '4px',
          padding: '2px 6px',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
          ...inputStyle
        }}
      />
    );
  }

  const Tag = tag;

  return (
    <Tag
      onClick={(e) => {
        setIsEditing(true);
        if (onClick) onClick(e);
      }}
      title="Click to live-edit on preview sheet"
      className={className}
      style={{
        cursor: 'text',
        position: 'relative',
        borderRadius: '4px',
        padding: '2px 4px',
        margin: '-2px -4px',
        border: '1px dashed transparent',
        transition: 'all 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {value || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{placeholder}</span>}
    </Tag>
  );
}

// --- ATS Scorecard Panel ---
function AtsScoreCard({ atsEvaluation, selectedJobId, setSelectedJobId, matches, targetJobBenchmark, handleAddSkill }) {
  return (
    <div className="glass-panel" style={{ padding: '18px', width: '100%', boxSizing: 'border-box', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
          <Zap size={17} color="#818cf8" />
          Live ATS Quality Score
        </div>
        <span style={{ 
          background: atsEvaluation.tier.badgeBg, 
          color: atsEvaluation.tier.color,
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 800,
          border: `1px solid ${atsEvaluation.tier.color}40`
        }}>
          {atsEvaluation.totalScore}/100
        </span>
      </div>

      <ScoreRing score={atsEvaluation.totalScore} color={atsEvaluation.tier.color} />

      <div style={{ textAlign: 'center', color: atsEvaluation.tier.color, fontSize: '0.86rem', fontWeight: 800, marginBottom: '14px' }}>
        {atsEvaluation.tier.label}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <ScoreBar 
          label="Hard Tech Skills Density"
          score={atsEvaluation.skillsScore}
          max={30}
          color="#6366f1"
        />
        <ScoreBar 
          label={`Impact Metrics (${atsEvaluation.metricsCount || 0}) & Action Verbs (${atsEvaluation.foundVerbs?.length || 0})`}
          score={atsEvaluation.metricsAndVerbsScore}
          max={25}
          color="#8b5cf6"
        />
        <ScoreBar 
          label="ATS Structure & Formatting"
          score={atsEvaluation.structureScore}
          max={20}
          color="#ec4899"
        />
        <ScoreBar 
          label="Professional Summary Quality"
          score={atsEvaluation.summaryScore || 0}
          max={15}
          color="#38bdf8"
        />
        <ScoreBar 
          label="Contact Details & PII"
          score={atsEvaluation.contactScore}
          max={10}
          color="#10b981"
        />
      </div>

      {/* Target Job Selector */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
          <Target size={14} color="#818cf8" />
          Target Job Match Benchmark
        </div>
        <select 
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            fontSize: '0.78rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        >
          <option value="">-- Benchmark against a job match --</option>
          {matches.map(m => (
            <option key={m.job?.id} value={m.job?.id}>
              {m.job?.role_title} at {m.job?.company}
            </option>
          ))}
        </select>

        {targetJobBenchmark && (
          <div style={{ marginTop: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>{targetJobBenchmark.job.role_title}</span>
              <span style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#818cf8', padding: '2px 6px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>
                {targetJobBenchmark.matchPercent}% Match
              </span>
            </div>
            {targetJobBenchmark?.missingSkills?.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#f87171', fontWeight: 700, marginBottom: '4px' }}>
                  Missing Keywords (Tap to add):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {targetJobBenchmark.missingSkills.map((sk, i) => (
                    <button 
                      key={i}
                      onClick={() => handleAddSkill(sk)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '0.68rem',
                        cursor: 'pointer'
                      }}
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Items */}
      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
          <AlertCircle size={14} color="#fbbf24" />
          ATS Action Items
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {atsEvaluation.recommendations.slice(0, 3).map((rec, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', gap: '6px', lineHeight: 1.35 }}>
              <AlertCircle size={12} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: ResumeAnalyzer (Upgraded with Templates + WYSIWYG)
// ============================================================================

export default function ResumeAnalyzer({ 
  profile, 
  matches = [], 
  onUpload, 
  onUpdateProfile, 
  onResetProfile,
  onSeed, 
  onTailor, 
  loading,
  onTriggerCelebration
}) {
  const roundZoom = (val) => Math.round(val * 10) / 10;
  const [viewMode, setViewMode] = useState(VIEW_MODES.SPLIT);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [formData, setFormData] = useState(() => normalizeProfileData(profile));
  const [newSkillInput, setNewSkillInput] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('modern');
  const [density, setDensity] = useState('comfortable');
  const [customSectionOrder, setCustomSectionOrder] = useState(['summary', 'skills', 'experience', 'education', 'projects']);
  
  // 🎨 LIVE FORMATTING CONTROLS STATE
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [fontSize, setFontSize] = useState('0.84rem');
  const [headingSize, setHeadingSize] = useState('1.1rem');
  const [lineSpacing, setLineSpacing] = useState('1.35');
  const [bulletStyle, setBulletStyle] = useState('disc');
  const [dateFormat, setDateFormat] = useState('MMM YYYY');
  const [pageSize, setPageSize] = useState('A4');
  const [textAlign, setTextAlign] = useState('left');

  // 🔍 ZOOM & PAGE CONTROLS STATE
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ⚡ BIDIRECTIONAL CLICK-TO-EDIT FOCUS STATE
  const [activeFieldId, setActiveFieldId] = useState(null);
  const formFieldRefs = useRef({});

  // 🌐 OFFLINE PROTECTION STATE
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  // 🤖 AI REWRITE DIFF MODAL STATE
  const [aiDiffModalData, setAiDiffModalData] = useState(null); // { field, original, suggestion, onAccept }

  // State for autosave, modals, history
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [exportPreflightModal, setExportPreflightModal] = useState(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [mobileScoreOpen, setMobileScoreOpen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [toast, setToast] = useState(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowHeight, setOverflowHeight] = useState(0);

  // References
  const previewContainerRef = useRef(null);
  const pageContainerRef = useRef(null);
  const a4PreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastSavedStateRef = useRef(JSON.stringify(formData));
  const autoSaveDebounceRef = useRef(null);

  // Update form data when profile prop changes
  useEffect(() => {
    if (profile) {
      const normalized = normalizeProfileData(profile);
      setFormData(normalized);
      if (normalized.template) setSelectedTemplateId(normalized.template);
      if (normalized.density) setDensity(normalized.density);
      
      const baseOrder = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements'];
      const profileOrder = normalized.section_order || [];
      const mergedOrder = [...new Set([...profileOrder, ...baseOrder])];
      setCustomSectionOrder(mergedOrder);
      
      lastSavedStateRef.current = JSON.stringify(normalized);
    }
  }, [profile]);

  // Track overflow status in real time
  useEffect(() => {
    const checkOverflow = () => {
      const el = a4PreviewRef.current || pageContainerRef.current;
      if (el) {
        const height = el.scrollHeight;
        const pageMaxHeight = 1122; // ~A4 height in px @ 96DPI
        if (height > pageMaxHeight) {
          setIsOverflowing(true);
          setOverflowHeight(height - pageMaxHeight);
        } else {
          setIsOverflowing(false);
          setOverflowHeight(0);
        }
      }
    };
    checkOverflow();
    const timer = setTimeout(checkOverflow, 300);
    return () => clearTimeout(timer);
  }, [formData, selectedTemplateId, density, customSectionOrder]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Shared Canonical ATS Score calculation
  const atsEvaluation = useMemo(() => {
    return calculateAtsScore(formData);
  }, [formData]);

  // Trigger celebration on high score
  useEffect(() => {
    if (atsEvaluation.totalScore >= 85) {
      if (onTriggerCelebration) onTriggerCelebration();
    }
  }, [atsEvaluation.totalScore >= 85]);

  // Target Job Benchmark
  const targetJobBenchmark = useMemo(() => {
    if (!selectedJobId) return null;
    const match = matches.find(m => m.job?.id === parseInt(selectedJobId, 10));
    if (!match || !match.job) return null;

    const jobSkills = Array.isArray(match.job.required_skills) ? match.job.required_skills : [];
    const candidateSkills = (Array.isArray(formData.skills) ? formData.skills : [])
      .map(s => String(s || '').toLowerCase().trim())
      .filter(Boolean);
    
    const matchedSkills = jobSkills.filter(s => 
      candidateSkills.some(cs => cs === String(s || '').toLowerCase().trim())
    );
    const missingSkills = jobSkills.filter(s => 
      !candidateSkills.some(cs => cs === String(s || '').toLowerCase().trim())
    );

    const matchPercent = (jobSkills?.length || 0) > 0 
      ? Math.round(((matchedSkills?.length || 0) / jobSkills.length) * 100)
      : Math.round(match?.match_score || 75);

    return {
      job: match.job,
      matchPercent,
      matchedSkills,
      missingSkills
    };
  }, [selectedJobId, matches, formData.skills]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, formData]);
    setFormData(prevState);
  }, [undoStack, redoStack, formData]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, formData]);
    setFormData(nextState);
  }, [undoStack, redoStack, formData]);

  // Focus form field from Visual A4 Preview click (Bidirectional sync)
  const handleFocusFormField = useCallback((fieldId) => {
    setActiveFieldId(fieldId);
    const targetEl = formFieldRefs.current[fieldId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof targetEl.focus === 'function') targetEl.focus();
    }
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Online / Offline Connection Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online! Connected to cloud server.', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Connection lost. Recent changes safely backed up locally.', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Update form data and trigger debounced autosave
  const updateFormData = useCallback((updates) => {
    setUndoStack(prev => [...prev, formData]);
    setRedoStack([]);
    setFormData(prev => {
      const next = { ...prev, ...updates };
      
      // Trigger debounced autosave
      setSaveStatus('saving');
      if (autoSaveDebounceRef.current) clearTimeout(autoSaveDebounceRef.current);
      autoSaveDebounceRef.current = setTimeout(() => {
        const payload = {
          ...next,
          template: selectedTemplateId,
          density,
          section_order: customSectionOrder,
          location: {
            city: next.city,
            country: next.country,
            open_to_remote: next.open_to_remote
          },
          past_roles: next.experience_list,
          key_strengths: next.skills.slice(0, 5),
          ats_score: calculateAtsScore(next).totalScore
        };
        if (onUpdateProfile) onUpdateProfile(payload);
        setSaveStatus('saved');
      }, 2000);

      return next;
    });
  }, [formData, selectedTemplateId, density, customSectionOrder, onUpdateProfile]);

  // Save handler
  const handleSave = useCallback(() => {
    const payload = {
      ...formData,
      template: selectedTemplateId,
      density,
      section_order: customSectionOrder,
      location: {
        city: formData.city,
        country: formData.country,
        open_to_remote: formData.open_to_remote
      },
      past_roles: formData.experience_list,
      key_strengths: formData.skills.slice(0, 5),
      ats_score: atsEvaluation.totalScore
    };
    if (onUpdateProfile) onUpdateProfile(payload);
    setSaveStatus('saved');
    setSaveSuccessNotice(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaveSuccessNotice(false), 3000);
    showToast('Profile saved successfully! ATS scoring re-benchmarked.', 'success');
  }, [formData, selectedTemplateId, density, customSectionOrder, atsEvaluation.totalScore, onUpdateProfile, showToast]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if (isCtrlOrCmd && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave]);

  // Skill handlers
  const handleAddSkill = useCallback((skillToAdd) => {
    const targetSkill = (skillToAdd || newSkillInput).trim();
    if (!targetSkill) return;
    
    updateFormData({
      skills: formData.skills.some(s => s.toLowerCase() === targetSkill.toLowerCase())
        ? formData.skills
        : [...formData.skills, targetSkill]
    });
    setNewSkillInput('');
  }, [newSkillInput, formData.skills, updateFormData]);

  const handleRemoveSkill = useCallback((skillToRemove) => {
    updateFormData({
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  }, [formData.skills, updateFormData]);

  // Experience handlers
  const handleAddExperience = useCallback(() => {
    updateFormData({
      experience_list: [
        {
          title: 'Software Engineer',
          company: 'Enterprise Corp',
          duration_months: 12,
          description: 'Engineered high-performance cloud microservices, reducing query latency by 35%.',
          is_current: false
        },
        ...(formData.experience_list || [])
      ]
    });
  }, [formData.experience_list, updateFormData]);

  const handleUpdateExperience = useCallback((index, field, value) => {
    const updated = [...(formData.experience_list || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ experience_list: updated });
  }, [formData.experience_list, updateFormData]);

  const handleRemoveExperience = useCallback((index) => {
    updateFormData({
      experience_list: (formData.experience_list || []).filter((_, i) => i !== index)
    });
  }, [formData.experience_list, updateFormData]);

  // Education handlers
  const handleAddEducation = useCallback(() => {
    updateFormData({
      education: [
        {
          degree: 'Bachelor of Technology',
          field: 'Computer Science & Engineering',
          institution: 'University of Technology',
          year: new Date().getFullYear()
        },
        ...(formData.education || [])
      ]
    });
  }, [formData.education, updateFormData]);

  const handleUpdateEducation = useCallback((index, field, value) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ education: updated });
  }, [formData.education, updateFormData]);

  const handleRemoveEducation = useCallback((index) => {
    updateFormData({
      education: (formData.education || []).filter((_, i) => i !== index)
    });
  }, [formData.education, updateFormData]);

  // Projects Handlers
  const handleAddProject = useCallback(() => {
    updateFormData({
      projects: [
        {
          title: 'Distributed Microservices Platform',
          description: 'Engineered an async event bus processing 10k events/sec using FastAPI, Redis & Docker.',
          technologies: 'Python, FastAPI, Redis, Docker',
          url: 'https://github.com/example/project'
        },
        ...(formData.projects || [])
      ]
    });
  }, [formData.projects, updateFormData]);

  const handleUpdateProject = useCallback((index, field, value) => {
    const updated = [...(formData.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ projects: updated });
  }, [formData.projects, updateFormData]);

  const handleRemoveProject = useCallback((index) => {
    updateFormData({
      projects: (formData.projects || []).filter((_, i) => i !== index)
    });
  }, [formData.projects, updateFormData]);

  // Certifications Handlers
  const handleAddCertification = useCallback(() => {
    updateFormData({
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          organization: 'Amazon Web Services',
          date: '2025'
        },
        ...(formData.certifications || [])
      ]
    });
  }, [formData.certifications, updateFormData]);

  const handleUpdateCertification = useCallback((index, field, value) => {
    const updated = [...(formData.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ certifications: updated });
  }, [formData.certifications, updateFormData]);

  const handleRemoveCertification = useCallback((index) => {
    updateFormData({
      certifications: (formData.certifications || []).filter((_, i) => i !== index)
    });
  }, [formData.certifications, updateFormData]);

  // Achievements Handlers
  const handleAddAchievement = useCallback(() => {
    updateFormData({
      achievements: [
        {
          title: '1st Place Hackathon Winner',
          description: 'Built an AI ATS optimization agent among 200+ developer teams.',
          date: '2026'
        },
        ...(formData.achievements || [])
      ]
    });
  }, [formData.achievements, updateFormData]);

  const handleUpdateAchievement = useCallback((index, field, value) => {
    const updated = [...(formData.achievements || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ achievements: updated });
  }, [formData.achievements, updateFormData]);

  const handleRemoveAchievement = useCallback((index) => {
    updateFormData({
      achievements: (formData.achievements || []).filter((_, i) => i !== index)
    });
  }, [formData.achievements, updateFormData]);

  // Section Reordering
  const handleMoveSection = useCallback((sectionKey, direction) => {
    const currentOrder = [...customSectionOrder];
    const index = currentOrder.indexOf(sectionKey);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    setCustomSectionOrder(currentOrder);
    updateFormData({ section_order: currentOrder });
    showToast(`Reordered ${sectionKey.toUpperCase()} section`, 'info');
  }, [customSectionOrder, updateFormData, showToast]);

  // Upload handler
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  }, [onUpload]);

  // Export handlers
  const getMissingSections = useCallback(() => {
    const missing = [];
    if (!formData.name?.trim()) missing.push("Full Name");
    if (!formData.summary?.trim()) missing.push("Professional Summary");
    if (!formData.skills || formData.skills.length < 3) missing.push("Core Skills (≥3)");
    if (!formData.experience_list || formData.experience_list.length === 0) missing.push("Work Experience");
    if (!formData.education || formData.education.length === 0) missing.push("Education");
    return missing;
  }, [formData]);

  const handleTriggerExport = useCallback((format) => {
    const missing = getMissingSections();
    if (missing.length > 0) {
      setExportPreflightModal({ format, missing });
    } else {
      executeDownload(format);
    }
  }, [getMissingSections]);

  const executeDownload = useCallback((format) => {
    const fmt = (format || 'pdf').toLowerCase();
    const fileName = `${(formData.name || 'Candidate').replace(/\s+/g, '_')}_${selectedTemplateId.toUpperCase()}_ATS`;

    if (fmt === 'pdf') {
      // Direct print-to-PDF engine with @media print A4 formatting
      window.print();
    } else if (fmt === 'json') {
      const jsonContent = JSON.stringify(formData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (fmt === 'txt') {
      let txt = `${formData.name || 'Candidate Name'}\n${formData.email || ''} | ${formData.phone || ''} | ${formData.city || ''}, ${formData.country || ''}\n\n`;
      txt += `SUMMARY\n${formData.summary || ''}\n\nSKILLS\n${(formData.skills || []).join(', ')}\n\nEXPERIENCE\n`;
      (formData.experience_list || []).forEach(e => {
        txt += `${e.title || e.role} - ${e.company} (${e.dates || '2023 - Present'})\n${e.description || ''}\n\n`;
      });
      txt += `EDUCATION\n`;
      (formData.education || []).forEach(edu => {
        txt += `${edu.degree} in ${edu.field} - ${edu.institution}\n`;
      });
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      handleExportMarkdown();
    }
    setExportPreflightModal(null);
    showToast(`Exported ${fmt.toUpperCase()} Resume successfully!`, 'success');
  }, [formData, selectedTemplateId, handleExportMarkdown, showToast]);

  const handleExportMarkdown = useCallback(() => {
    let md = `# ${formData.name || '[Your Name]'}\n`;
    md += `**Email:** ${formData.email || '[Your Email]'} | **Phone:** ${formData.phone || '[Your Phone]'} | **Location:** ${formData.city || '[City]'}, ${formData.country || '[Country]'} (Remote: ${formData.open_to_remote ? 'Yes' : 'No'})\n\n`;
    md += `## Professional Summary\n${formData.summary || '[Add description]'}\n\n`;
    md += `## Core Skills\n${(formData.skills && formData.skills.length > 0 ? formData.skills.join(', ') : '[Add skills]')}\n\n`;
    md += `## Work Experience\n`;
    (formData.experience_list || []).forEach(exp => {
      md += `### ${exp.title || '[Role Title]'} — ${exp.company || '[Company Name]'} (${exp.duration_months || 0} mos)\n${exp.description || '[Add description]'}\n\n`;
    });
    md += `## Education\n`;
    (formData.education || []).forEach(edu => {
      md += `- **${edu.degree || '[Degree]'} in ${edu.field || '[Field of Study]'}** (${edu.institution || '[Institution]'})\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(formData.name || 'Resume').replace(/\s+/g, '_')}_${selectedTemplateId.toUpperCase()}_ATS.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [formData, selectedTemplateId]);

  // Load Template Sample Preset Data (From resume-templates configuration)
  const handleLoadSamplePreset = useCallback((sampleData, templateId) => {
    if (!sampleData) return;
    SoundSystem.playSuccess();

    const targetId = templateId || selectedTemplateId;
    const targetTmpl = RESUME_TEMPLATES[targetId];
    const defaultOrder = targetTmpl?.defaultSectionOrder || ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements'];

    setFormData((prev) => ({
      ...prev,
      name: sampleData.name || prev.name,
      email: sampleData.email || prev.email,
      phone: sampleData.phone || prev.phone,
      city: sampleData.city || prev.city,
      country: sampleData.country || prev.country,
      summary: sampleData.summary || prev.summary,
      skills: sampleData.skills && sampleData.skills.length > 0 ? sampleData.skills : prev.skills,
      experience_list: sampleData.experience_list && sampleData.experience_list.length > 0 ? sampleData.experience_list : prev.experience_list,
      education: sampleData.education && sampleData.education.length > 0 ? sampleData.education : prev.education,
      projects: sampleData.projects && sampleData.projects.length > 0 ? sampleData.projects : prev.projects,
      certifications: sampleData.certifications && sampleData.certifications.length > 0 ? sampleData.certifications : (prev.certifications || []),
      achievements: sampleData.achievements && sampleData.achievements.length > 0 ? sampleData.achievements : (prev.achievements || []),
      template: targetId
    }));

    setCustomSectionOrder([...new Set([...defaultOrder, 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements'])]);
    setUnsavedChanges(true);
  }, [selectedTemplateId]);

  // Current Active Template & Density config
  const activeTemplate = RESUME_TEMPLATES[selectedTemplateId] || RESUME_TEMPLATES.modern;
  const activeDensity = DENSITY_STYLES[density] || DENSITY_STYLES.comfortable;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🌟 LEXI LIVE ATS WORDSMITH COMMENTARY */}
      <CharacterSpeechBubble
        character="lexi"
        pose={atsEvaluation.totalScore >= 85 ? "celebrate" : "writing"}
        message={
          atsEvaluation.totalScore >= 85
            ? "Masterclass! Your resume has an exceptional ATS score (85+). Top MNC recruiters will notice your quantifiable metrics."
            : atsEvaluation.totalScore >= 70
            ? "Looking sharp! To push this past 85, ensure each work experience bullet includes a quantifiable % or ₹ metric."
            : "Lexi's Wordcraft Tip: Add 3+ technical skills and strong action verbs ('engineered', 'scaled', 'optimized') to boost your score."
        }
        subtitle={`Current Score: ${atsEvaluation.totalScore}/100 • Tier: ${atsEvaluation.tier.label}`}
        variant="coral"
      />

      {/* 🌟 HERO LIVE SCORE & ATS DASHBOARD BANNER */}
      <div className="glass-panel" style={{ padding: '18px 20px', background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.85), rgba(15, 23, 42, 0.95))', border: `1px solid ${atsEvaluation.tier.color}40`, boxShadow: `0 0 24px ${atsEvaluation.tier.color}15` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Score Ring & Tier Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
            <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0 }}>
              <svg width="76" height="76" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="45" cy="45" r="36" 
                  stroke={atsEvaluation.tier.color} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 36} 
                  strokeDashoffset={(2 * Math.PI * 36) - ((2 * Math.PI * 36) * atsEvaluation.totalScore) / 100} 
                  strokeLinecap="round" 
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }} 
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{atsEvaluation.totalScore}</span>
                <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800 }}>/ 100</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Zap size={16} color={atsEvaluation.tier.color} />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>ATS Resume Quality</span>
              </div>
              <span style={{ 
                background: atsEvaluation.tier.badgeBg, 
                color: atsEvaluation.tier.color, 
                padding: '2px 8px', 
                borderRadius: '8px', 
                fontSize: '0.74rem', 
                fontWeight: 800,
                display: 'inline-block'
              }}>
                {atsEvaluation.tier.label}
              </span>
            </div>
          </div>

          {/* 5 Live Pillar Progress Meters */}
          <div style={{ flex: 1, minWidth: '260px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Skills</span>
                <strong style={{ color: '#818cf8' }}>{atsEvaluation.skillsScore}/35</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(atsEvaluation.skillsScore / 35) * 100}%`, height: '100%', background: '#6366f1' }}></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Metrics</span>
                <strong style={{ color: '#c084fc' }}>{atsEvaluation.metricsAndVerbsScore}/25</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(atsEvaluation.metricsAndVerbsScore / 25) * 100}%`, height: '100%', background: '#a855f7' }}></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Contact</span>
                <strong style={{ color: '#38bdf8' }}>{atsEvaluation.contactScore}/15</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(atsEvaluation.contactScore / 15) * 100}%`, height: '100%', background: '#38bdf8' }}></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Structure</span>
                <strong style={{ color: '#f472b6' }}>{atsEvaluation.structureScore}/15</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(atsEvaluation.structureScore / 15) * 100}%`, height: '100%', background: '#ec4899' }}></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Keywords</span>
                <strong style={{ color: '#34d399' }}>{atsEvaluation.keywordScore}/10</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(atsEvaluation.keywordScore / 10) * 100}%`, height: '100%', background: '#10b981' }}></div>
              </div>
            </div>
          </div>

          {/* Quick Action Item Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setMobileScoreOpen(!mobileScoreOpen)}
              style={{
                background: mobileScoreOpen ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Target size={14} color="#818cf8" />
              <span>{mobileScoreOpen ? 'Hide Full Audit' : 'Target Job Benchmark'}</span>
              {mobileScoreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

        </div>

        {/* Expandable Benchmark & Action Items Section */}
        {mobileScoreOpen && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <AtsScoreCard 
              atsEvaluation={atsEvaluation}
              selectedJobId={selectedJobId}
              setSelectedJobId={setSelectedJobId}
              matches={matches}
              targetJobBenchmark={targetJobBenchmark}
              handleAddSkill={handleAddSkill}
            />
          </div>
        )}

      </div>

      {/* Top Header & Action Control Bar */}
      <div className="glass-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Title Row with Autosave, History & Undo/Redo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Resume & ATS Studio</h2>
                
                {/* Autosave live indicator */}
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: saveStatus === 'saving' ? '#fbbf24' : '#34d399', 
                  background: saveStatus === 'saving' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(52, 211, 153, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {saveStatus === 'saving' ? '⚡ Autosaving...' : '✓ All changes saved'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.74rem' }}>
                WYSIWYG live editing, 5 multi-ATS templates, drag-and-drop section ordering & instant exports.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={() => setDiffModalOpen(true)}
              title="Compare with original baseline"
              style={{ padding: '6px 10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <GitBranch size={13} /> Compare Baseline
            </button>

            <button 
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo change (Ctrl+Z)"
              style={{ padding: '6px 9px', background: 'rgba(255, 255, 255, 0.05)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer', opacity: undoStack.length === 0 ? 0.4 : 1 }}
            >
              <RefreshCw size={13} />
            </button>
            <button 
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo change (Ctrl+Y)"
              style={{ padding: '6px 9px', background: 'rgba(255, 255, 255, 0.05)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer', opacity: redoStack.length === 0 ? 0.4 : 1, transform: 'scaleX(-1)' }}
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* 🎨 LIVE FORMATTING & ZOOM CONTROLS TOOLBAR */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left Group: Font, Margin & Spacing controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Font Family Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Type size={14} color="#818cf8" />
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="'Inter', sans-serif">Inter (Clean Tech)</option>
                <option value="'Roboto', sans-serif">Roboto (Modern)</option>
                <option value="'Playfair Display', serif">Playfair (Executive)</option>
                <option value="'Garamond', serif">Garamond (Academic)</option>
                <option value="'Fira Code', monospace">Fira Code (Dev)</option>
              </select>
            </div>

            {/* Margin Spacing Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sliders size={13} color="#38bdf8" />
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Margin:</span>
              <select
                value={density}
                onChange={(e) => {
                  setDensity(e.target.value);
                  updateFormData({ density: e.target.value });
                }}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="compact">Compact (16px)</option>
                <option value="comfortable">Comfortable (24px)</option>
                <option value="spacious">Spacious (32px)</option>
              </select>
            </div>

            {/* Line Spacing Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Line:</span>
              {['1.15', '1.35', '1.50'].map(sp => (
                <button
                  key={sp}
                  onClick={() => setLineSpacing(sp)}
                  style={{
                    background: lineSpacing === sp ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                    color: lineSpacing === sp ? '#fff' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          {/* Right Group: Zoom Controls & Real-Time Page Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* Offline Alert Indicator */}
            {isOffline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700 }}>
                <WifiOff size={12} />
                <span>Offline Mode (Local Backup Active)</span>
              </div>
            )}

            {/* Zoom Control Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(30, 41, 59, 0.6)', padding: '2px 6px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, roundZoom(prev - 0.1)))}
                title="Zoom Out (-10%)"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                <ZoomOut size={13} />
              </button>

              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc', minWidth: '38px', textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, roundZoom(prev + 0.1)))}
                title="Zoom In (+10%)"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                <ZoomIn size={13} />
              </button>

              <button
                onClick={() => setZoomLevel(1.0)}
                title="Reset Zoom to 100%"
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#818cf8', borderRadius: '4px', fontSize: '0.66rem', padding: '1px 5px', fontWeight: 800, cursor: 'pointer', marginLeft: '2px' }}
              >
                100%
              </button>
            </div>

            {/* Real-time Page Navigation & Page Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 700 }}>
              <span style={{ background: isOverflowing ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', border: isOverflowing ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)', color: isOverflowing ? '#f59e0b' : '#34d399', padding: '2px 8px', borderRadius: '6px' }}>
                {isOverflowing ? 'Pages: 2 (Multi-page)' : 'Page 1 / 1'}
              </span>
            </div>

          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="mobile-nowrap-scroll" style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setViewMode(VIEW_MODES.SPLIT)}
              style={{
                background: viewMode === VIEW_MODES.SPLIT ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: viewMode === VIEW_MODES.SPLIT ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <Edit3 size={13} /> Split Form & ATS
            </button>
            <button 
              onClick={() => setViewMode(VIEW_MODES.PREVIEW)}
              style={{
                background: viewMode === VIEW_MODES.PREVIEW ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: viewMode === VIEW_MODES.PREVIEW ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <Eye size={13} /> WYSIWYG Visual A4
            </button>
            <button 
              onClick={() => setViewMode(VIEW_MODES.ATS_RAW)}
              style={{
                background: viewMode === VIEW_MODES.ATS_RAW ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: viewMode === VIEW_MODES.ATS_RAW ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <Code size={13} /> Raw ATS Parser
            </button>
          </div>
        </div>

        {/* Primary Actions & Export Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              type="file" 
              accept=".pdf,.docx,.doc,.odt,.txt" 
              id="builder-file-upload" 
              ref={fileInputRef}
              onChange={handleFileInputChange} 
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="builder-file-upload"
              style={{
                background: 'rgba(99, 102, 241, 0.18)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <UploadCloud size={14} /> Upload
            </label>

            <button 
              onClick={handleSave}
              disabled={loading}
              title="Save Profile (Ctrl+S)"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              {loading ? (
                <img src="/loading.svg" alt="Saving" style={{ width: '14px', height: '14px' }} />
              ) : (
                <Save size={14} />
              )}
              <span>{loading ? 'Analyzing ATS...' : 'Save & Match'}</span>
            </button>

            {onSeed && (
              <button 
                onClick={onSeed}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Wand2 size={13} /> Load Sample
              </button>
            )}
          </div>

          {/* Export Formats Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Export:</span>
            
            <button 
              onClick={() => handleTriggerExport('pdf')}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <FileDown size={12} /> PDF
            </button>

            <button 
              onClick={() => handleTriggerExport('tex')}
              style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Code size={12} /> LaTeX
            </button>

            <button 
              onClick={() => handleTriggerExport('docx')}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <FileText size={12} /> DOCX
            </button>

            <button 
              onClick={() => handleTriggerExport('md')}
              style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px 11px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              MD
            </button>
          </div>

        </div>

      </div>

      {/* Mode 1: Editor & ATS Split View */}
      {viewMode === VIEW_MODES.SPLIT && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '16px', alignItems: 'start' }} className="resume-studio-split-grid">
          
          {/* Left Form Inputs Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Personal Details */}
            <SectionCard title="Personal & Contact Details" icon={Mail}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <FormInput 
                  label="Full Name" 
                  value={formData.name} 
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g. Aditya Tamta" 
                />
                <FormInput 
                  label="Email" 
                  value={formData.email} 
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  placeholder="aditya@example.com" 
                />
                <FormInput 
                  label="Phone Number" 
                  value={formData.phone} 
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  placeholder="+91 9876543210" 
                />
                <FormInput 
                  label="City / Region" 
                  value={formData.city} 
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  placeholder="Bengaluru" 
                />
                <FormInput 
                  label="Country" 
                  value={formData.country} 
                  onChange={(e) => updateFormData({ country: e.target.value })}
                  placeholder="India" 
                />
              </div>
            </SectionCard>

            {/* Professional Summary */}
            <SectionCard title="Professional Summary" icon={FileText}>
              <FormTextarea 
                value={formData.summary}
                onChange={(e) => updateFormData({ summary: e.target.value })}
                placeholder="Results-driven Software Engineer with 2+ years of experience engineering distributed microservices and scalable cloud platforms..."
                rows={3}
              />
            </SectionCard>

            {/* Technical Skills */}
            <SectionCard title="Core Skills & Competencies" icon={Award} count={(formData?.skills || []).length}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add skill (e.g. FastAPI, Docker, Kubernetes)..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                />
                <button 
                  onClick={() => handleAddSkill()}
                  style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(formData?.skills || []).map((skill, idx) => (
                  <span key={idx} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 8px', borderRadius: '10px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    {skill}
                    <X 
                      size={12} 
                      style={{ cursor: 'pointer', opacity: 0.7 }}
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </span>
                ))}
              </div>

              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                  ⚡ Quick Add High-Demand Keywords:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {COMMON_SUGGESTED_SKILLS
                    .filter(s => !(formData?.skills || []).includes(s))
                    .slice(0, 8)
                    .map((skill, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleAddSkill(skill)}
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 7px', borderRadius: '8px', fontSize: '0.68rem', cursor: 'pointer' }}
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
            </SectionCard>

            {/* Experience */}
            <SectionCard 
              title="Experience" 
              icon={Building}
              count={(formData?.experience_list || formData?.experience || []).length}
              action={handleAddExperience}
              actionLabel="Add Role"
            >
              {(formData?.experience_list || formData?.experience || []).map((exp, idx) => {
                const descLower = String(exp.description || exp.bullets || '').toLowerCase();
                const hasVerbs = ACTION_VERBS.some(v => descLower.includes(v));
                const hasMetrics = /\b\d+(?:[\.,]\d+)?%?|[₹$]\d+|\b\d+\+\b/.test(descLower);

                return (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        value={exp.title || exp.role || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                        placeholder="Job Title"
                        style={{ flex: 1, minWidth: '110px', padding: '7px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }}
                      />
                      <input 
                        type="text" 
                        value={exp.company || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        placeholder="Company"
                        style={{ flex: 1, minWidth: '110px', padding: '7px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }}
                      />
                      <button 
                        onClick={() => handleRemoveExperience(idx)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '0 8px', borderRadius: '6px', cursor: 'pointer', height: '32px' }}
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <textarea 
                      rows={2}
                      value={exp.description || (Array.isArray(exp.bullets) ? exp.bullets.join('\n') : exp.bullets || '')}
                      onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                      placeholder="Achievements... (e.g. Engineered REST APIs with FastAPI, reducing latency by 35%.)"
                      style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.8rem', lineHeight: 1.4, resize: 'vertical', boxSizing: 'border-box' }}
                    />

                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.7rem' }}>
                      <span style={{ color: hasVerbs ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>
                        {hasVerbs ? '✓ Action Verb' : '⚠️ Missing Verb'}
                      </span>
                      <span style={{ color: hasMetrics ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>
                        {hasMetrics ? '✓ Metric Found' : '⚠️ Add % or ₹ metric'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </SectionCard>

            {/* Education */}
            <SectionCard 
              title="Education" 
              icon={GraduationCap}
              count={(formData?.education || []).length}
              action={handleAddEducation}
              actionLabel="Add Education"
            >
              {(formData.education || []).map((edu, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      value={edu.degree || ''}
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      placeholder="Degree"
                      style={{ flex: 1, minWidth: '100px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <input 
                      type="text" 
                      value={edu.field || ''}
                      onChange={(e) => handleUpdateEducation(idx, 'field', e.target.value)}
                      placeholder="Field"
                      style={{ flex: 1, minWidth: '100px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <button 
                      onClick={() => handleRemoveEducation(idx)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '0 7px', borderRadius: '6px', cursor: 'pointer', height: '30px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={edu.institution || ''}
                    onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                    placeholder="Institution Name"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.78rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </SectionCard>

            {/* Projects Section Card */}
            <SectionCard 
              title="Key Projects" 
              icon={Code}
              count={(formData.projects || []).length}
              action={handleAddProject}
              actionLabel="Add Project"
            >
              {(formData.projects || []).map((proj, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      value={proj.title || ''}
                      onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                      placeholder="Project Title"
                      style={{ flex: 1, minWidth: '120px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <input 
                      type="text" 
                      value={proj.technologies || ''}
                      onChange={(e) => handleUpdateProject(idx, 'technologies', e.target.value)}
                      placeholder="Technologies Used"
                      style={{ flex: 1, minWidth: '120px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <button 
                      onClick={() => handleRemoveProject(idx)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '0 7px', borderRadius: '6px', cursor: 'pointer', height: '30px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <textarea 
                    rows={2}
                    value={proj.description || ''}
                    onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                    placeholder="Project description, architecture & key impact metrics..."
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.78rem', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
              ))}
            </SectionCard>

            {/* Certifications Section Card */}
            <SectionCard 
              title="Certifications & Credentials" 
              icon={Award}
              count={(formData.certifications || []).length}
              action={handleAddCertification}
              actionLabel="Add Certification"
            >
              {(formData.certifications || []).map((cert, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      value={cert.name || ''}
                      onChange={(e) => handleUpdateCertification(idx, 'name', e.target.value)}
                      placeholder="Certification Name (e.g. AWS Solutions Architect)"
                      style={{ flex: 1, minWidth: '130px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <input 
                      type="text" 
                      value={cert.organization || ''}
                      onChange={(e) => handleUpdateCertification(idx, 'organization', e.target.value)}
                      placeholder="Issuing Org (e.g. Amazon)"
                      style={{ flex: 1, minWidth: '100px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <button 
                      onClick={() => handleRemoveCertification(idx)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '0 7px', borderRadius: '6px', cursor: 'pointer', height: '30px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </SectionCard>

            {/* Key Achievements Section Card */}
            <SectionCard 
              title="Honors & Achievements" 
              icon={Star}
              count={(formData.achievements || []).length}
              action={handleAddAchievement}
              actionLabel="Add Achievement"
            >
              {(formData.achievements || []).map((ach, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      value={ach.title || ''}
                      onChange={(e) => handleUpdateAchievement(idx, 'title', e.target.value)}
                      placeholder="Achievement Title"
                      style={{ flex: 1, minWidth: '120px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <button 
                      onClick={() => handleRemoveAchievement(idx)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '0 7px', borderRadius: '6px', cursor: 'pointer', height: '30px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={ach.description || ''}
                    onChange={(e) => handleUpdateAchievement(idx, 'description', e.target.value)}
                    placeholder="Short description of honor / award..."
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.78rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </SectionCard>
            {/* Live Visual A4 Resume Paper Preview Container */}
            <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95))', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '0.9rem', fontWeight: 800 }}>
                  <Eye size={16} color="#818cf8" />
                  <span>Live Visual A4 Resume Paper Preview</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Template: <strong style={{ color: activeTemplate.badgeColor }}>{activeTemplate.label}</strong>
                </span>
              </div>

              {/* Live A4 Sheet */}
              <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '4px 0' }}>
                <div 
                  ref={a4PreviewRef}
                  style={{ 
                    minWidth: '680px', 
                    maxWidth: '820px', 
                    margin: '0 auto', 
                    background: '#ffffff', 
                    color: '#1e293b', 
                    padding: activeDensity.pagePadding, 
                    borderRadius: '8px', 
                    boxShadow: '0 20px 45px rgba(0,0,0,0.55)', 
                    fontFamily: fontFamily || activeTemplate.fontFamily, 
                    lineHeight: lineSpacing || activeDensity.lineHeight,
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease, font-family 0.2s ease',
                    boxSizing: 'border-box',
                    position: 'relative'
                  }}
                >
                  {/* Header Block */}
                  <div style={{ 
                    borderBottom: activeTemplate.headerBorder, 
                    paddingBottom: activeDensity.itemGap, 
                    marginBottom: activeDensity.sectionGap,
                    textAlign: activeTemplate.headerAlignment 
                  }}>
                    <InlineEditableText
                      tag="h1"
                      value={formData.name}
                      onChange={(val) => updateFormData({ name: val })}
                      placeholder="Your Full Name"
                      style={{ 
                        fontSize: activeDensity.titleSize, 
                        fontWeight: 900, 
                        margin: 0, 
                        color: activeTemplate.accentColor, 
                        fontFamily: activeTemplate.headingFont,
                        letterSpacing: activeTemplate.headingStyle === 'spaced-caps' ? '0.12em' : '-0.02em'
                      }}
                    />
                    
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: activeTemplate.secondaryColor, 
                      marginTop: '4px', 
                      display: 'flex', 
                      gap: '8px', 
                      flexWrap: 'wrap',
                      justifyContent: activeTemplate.headerAlignment === 'center' ? 'center' : 'flex-start'
                    }}>
                      <InlineEditableText
                        value={formData.email}
                        onChange={(val) => updateFormData({ email: val })}
                        placeholder="email@example.com"
                      />
                      <span>•</span>
                      <InlineEditableText
                        value={formData.phone}
                        onChange={(val) => updateFormData({ phone: val })}
                        placeholder="+91 9876543210"
                      />
                      <span>•</span>
                      <InlineEditableText
                        value={formData.city}
                        onChange={(val) => updateFormData({ city: val })}
                        placeholder="City"
                      />
                      <span>,</span>
                      <InlineEditableText
                        value={formData.country}
                        onChange={(val) => updateFormData({ country: val })}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  {/* Dynamic Section Ordering */}
                  {customSectionOrder.map((sectionKey, sectionIdx) => {
                    const isFirst = sectionIdx === 0;
                    const isLast = sectionIdx === customSectionOrder.length - 1;
                    const isSpaced = activeTemplate.headingStyle === 'spaced-caps';

                    const renderSectionHeader = (titleText) => (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: activeTemplate.sectionBorder, paddingBottom: '3px', marginBottom: activeDensity.itemGap }}>
                        <h2 style={{ 
                          fontSize: activeDensity.headingSize, 
                          textTransform: isSpaced || activeTemplate.headingStyle === 'plain-caps' || activeTemplate.headingStyle === 'uppercase-underline' ? 'uppercase' : 'none', 
                          letterSpacing: isSpaced ? '0.18em' : '0.05em', 
                          color: activeTemplate.accentColor, 
                          margin: 0, 
                          fontFamily: activeTemplate.headingFont, 
                          fontWeight: 800 
                        }}>
                          {titleText}
                        </h2>

                        <div style={{ display: 'flex', gap: '2px', opacity: 0.6 }} className="print:hidden">
                          <button 
                            onClick={() => handleMoveSection(sectionKey, 'up')}
                            disabled={isFirst}
                            title="Move section up"
                            style={{ border: 'none', background: 'transparent', cursor: isFirst ? 'default' : 'pointer', color: '#64748B', padding: '1px 3px', opacity: isFirst ? 0.2 : 1 }}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button 
                            onClick={() => handleMoveSection(sectionKey, 'down')}
                            disabled={isLast}
                            title="Move section down"
                            style={{ border: 'none', background: 'transparent', cursor: isLast ? 'default' : 'pointer', color: '#64748B', padding: '1px 3px', opacity: isLast ? 0.2 : 1 }}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>
                    );

                    if (sectionKey === 'summary') {
                      return (
                        <div key="summary" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Professional Summary')}
                          <InlineEditableText
                            multiline
                            value={formData.summary}
                            onChange={(val) => updateFormData({ summary: val })}
                            placeholder="Click to add your executive professional summary..."
                            style={{ 
                              fontSize: activeDensity.baseFontSize, 
                              lineHeight: activeDensity.lineHeight, 
                              color: '#334155', 
                              margin: 0 
                            }}
                          />
                        </div>
                      );
                    }

                    if (sectionKey === 'skills') {
                      return (
                        <div key="skills" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Core Technical Competencies')}
                          
                          {activeTemplate.skillFormat === 'chips' ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {(formData?.skills || []).map((skill, sIdx) => (
                                <span 
                                  key={sIdx}
                                  style={{
                                    background: activeTemplate.noColor ? '#f1f5f9' : `${activeTemplate.accentColor}15`,
                                    color: activeTemplate.noColor ? '#000000' : activeTemplate.accentColor,
                                    border: `1px solid ${activeTemplate.accentColor}30`,
                                    borderRadius: '4px',
                                    padding: '2px 7px',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <InlineEditableText
                                    value={skill}
                                    onChange={(newSkill) => {
                                      const updated = [...(formData?.skills || [])];
                                      updated[sIdx] = newSkill;
                                      updateFormData({ skills: updated });
                                    }}
                                  />
                                  <X 
                                    size={10} 
                                    style={{ cursor: 'pointer', opacity: 0.6 }} 
                                    onClick={() => handleRemoveSkill(skill)}
                                  />
                                </span>
                              ))}
                              <button
                                onClick={() => handleAddSkill('New Skill')}
                                style={{
                                  background: 'transparent',
                                  border: '1px dashed #94a3b8',
                                  borderRadius: '4px',
                                  padding: '2px 7px',
                                  fontSize: '0.72rem',
                                  color: '#64748b',
                                  cursor: 'pointer'
                                }}
                              >
                                + Add Skill
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: activeDensity.baseFontSize, color: '#334155', lineHeight: activeDensity.lineHeight }}>
                              <InlineEditableText
                                multiline
                                value={(formData?.skills || []).join(' • ')}
                                onChange={(val) => {
                                  const parsed = val.split('•').map(s => s.trim()).filter(Boolean);
                                  updateFormData({ skills: parsed });
                                }}
                                placeholder="Python • React • FastAPI • Docker • Postgres"
                              />
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (sectionKey === 'experience') {
                      return (
                        <div key="experience" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Professional Experience')}
                          
                          {(formData?.experience_list || formData?.experience || []).map((exp, expIdx) => (
                            <div key={expIdx} style={{ marginBottom: activeDensity.itemGap }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <InlineEditableText
                                    value={exp.title}
                                    onChange={(val) => handleUpdateExperience(expIdx, 'title', val)}
                                    placeholder="Job Title"
                                    style={{ fontWeight: 800, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                                  />
                                  <span>—</span>
                                  <InlineEditableText
                                    value={exp.company}
                                    onChange={(val) => handleUpdateExperience(expIdx, 'company', val)}
                                    placeholder="Company Name"
                                    style={{ fontWeight: 600, fontSize: activeDensity.baseFontSize, color: '#334155' }}
                                  />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {exp.duration_months ? `${exp.duration_months} mos` : 'Full-time'}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveExperience(expIdx)}
                                    title="Remove experience"
                                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              </div>

                              <InlineEditableText
                                multiline
                                value={exp.description}
                                onChange={(val) => handleUpdateExperience(expIdx, 'description', val)}
                                placeholder="Add quantifiable achievements and impact..."
                                style={{ 
                                  fontSize: activeDensity.baseFontSize, 
                                  lineHeight: activeDensity.lineHeight, 
                                  color: '#334155', 
                                  marginTop: '2px' 
                                }}
                              />
                            </div>
                          ))}

                          <button
                            onClick={handleAddExperience}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              color: activeTemplate.accentColor,
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={11} /> Add Experience Role
                          </button>
                        </div>
                      );
                    }

                    if (sectionKey === 'education') {
                      return (
                        <div key="education" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Education & Credentials')}
                          
                          {(formData.education || []).map((edu, eduIdx) => (
                            <div key={eduIdx} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <InlineEditableText
                                  value={edu.degree}
                                  onChange={(val) => handleUpdateEducation(eduIdx, 'degree', val)}
                                  placeholder="Degree"
                                  style={{ fontWeight: 700, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                                />
                                <span>in</span>
                                <InlineEditableText
                                  value={edu.field}
                                  onChange={(val) => handleUpdateEducation(eduIdx, 'field', val)}
                                  placeholder="Field of Study"
                                  style={{ fontWeight: 600, fontSize: activeDensity.baseFontSize, color: '#334155' }}
                                />
                                <span>—</span>
                                <InlineEditableText
                                  value={edu.institution}
                                  onChange={(val) => handleUpdateEducation(eduIdx, 'institution', val)}
                                  placeholder="Institution Name"
                                  style={{ fontSize: activeDensity.baseFontSize, color: '#475569' }}
                                />
                              </div>

                              <button
                                onClick={() => handleRemoveEducation(eduIdx)}
                                title="Remove education"
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={handleAddEducation}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              color: activeTemplate.accentColor,
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={11} /> Add Education
                          </button>
                        </div>
                      );
                    }

                    if (sectionKey === 'projects') {
                      return (
                        <div key="projects" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Key Projects & Portfolio')}
                          
                          {(formData.projects || []).map((proj, projIdx) => (
                            <div key={projIdx} style={{ marginBottom: activeDensity.itemGap }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <InlineEditableText
                                    value={proj.title}
                                    onChange={(val) => handleUpdateProject(projIdx, 'title', val)}
                                    placeholder="Project Name"
                                    style={{ fontWeight: 800, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                                  />
                                  {proj.technologies && (
                                    <>
                                      <span>|</span>
                                      <InlineEditableText
                                        value={proj.technologies}
                                        onChange={(val) => handleUpdateProject(projIdx, 'technologies', val)}
                                        placeholder="Tech Stack"
                                        style={{ fontWeight: 600, fontSize: '0.76rem', color: activeTemplate.accentColor }}
                                      />
                                    </>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleRemoveProject(projIdx)}
                                  title="Remove project"
                                  style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                                >
                                  <X size={11} />
                                </button>
                              </div>

                              <InlineEditableText
                                multiline
                                value={proj.description}
                                onChange={(val) => handleUpdateProject(projIdx, 'description', val)}
                                placeholder="Describe architecture, user scale and quantifiable metrics..."
                                style={{ 
                                  fontSize: activeDensity.baseFontSize, 
                                  lineHeight: activeDensity.lineHeight, 
                                  color: '#334155', 
                                  marginTop: '2px' 
                                }}
                              />
                            </div>
                          ))}

                          <button
                            onClick={handleAddProject}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              color: activeTemplate.accentColor,
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={11} /> Add Project
                          </button>
                        </div>
                      );
                    }

                    if (sectionKey === 'certifications') {
                      return (
                        <div key="certifications" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Certifications & Licenses')}
                          
                          {(formData.certifications || []).map((cert, certIdx) => (
                            <div key={certIdx} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <InlineEditableText
                                  value={cert.name}
                                  onChange={(val) => handleUpdateCertification(certIdx, 'name', val)}
                                  placeholder="Certification Name"
                                  style={{ fontWeight: 700, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                                />
                                <span>—</span>
                                <InlineEditableText
                                  value={cert.organization}
                                  onChange={(val) => handleUpdateCertification(certIdx, 'organization', val)}
                                  placeholder="Issuing Organization"
                                  style={{ fontSize: activeDensity.baseFontSize, color: '#334155' }}
                                />
                              </div>

                              <button
                                onClick={() => handleRemoveCertification(certIdx)}
                                title="Remove certification"
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={handleAddCertification}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              color: activeTemplate.accentColor,
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={11} /> Add Certification
                          </button>
                        </div>
                      );
                    }

                    if (sectionKey === 'achievements') {
                      return (
                        <div key="achievements" style={{ marginBottom: activeDensity.sectionGap }}>
                          {renderSectionHeader('Honors & Key Achievements')}
                          
                          {(formData.achievements || []).map((ach, achIdx) => (
                            <div key={achIdx} style={{ marginBottom: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <InlineEditableText
                                  value={ach.title}
                                  onChange={(val) => handleUpdateAchievement(achIdx, 'title', val)}
                                  placeholder="Achievement Title"
                                  style={{ fontWeight: 800, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                                />
                                <button
                                  onClick={() => handleRemoveAchievement(achIdx)}
                                  title="Remove achievement"
                                  style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                                >
                                  <X size={11} />
                                </button>
                              </div>

                              <InlineEditableText
                                multiline
                                value={ach.description}
                                onChange={(val) => handleUpdateAchievement(achIdx, 'description', val)}
                                placeholder="Describe the honor, rank, award or competitive achievement..."
                                style={{ fontSize: activeDensity.baseFontSize, color: '#334155', marginTop: '2px' }}
                              />
                            </div>
                          ))}

                          <button
                            onClick={handleAddAchievement}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              color: activeTemplate.accentColor,
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={11} /> Add Achievement
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })}

                </div>
              </div>
            </div>

          </div>

          {/* Right Desktop Score Column */}
          <div className="resume-studio-desktop-score-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '16px' }}>
            <AtsScoreCard 
              atsEvaluation={atsEvaluation}
              selectedJobId={selectedJobId}
              setSelectedJobId={setSelectedJobId}
              matches={matches}
              targetJobBenchmark={targetJobBenchmark}
              handleAddSkill={handleAddSkill}
            />
          </div>

        </div>
      )}

      {/* Mode 2: Visual A4 Preview (WYSIWYG + 5 Templates + Drag-and-Drop) */}
      {viewMode === VIEW_MODES.PREVIEW && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
          
          {/* Template Picker Strip */}
          <div className="glass-panel" style={{ width: '100%', padding: '14px 18px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={16} color="#818cf8" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>Choose Resume Style & Template</span>
              </div>

              {/* Density Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Density:</span>
                {['compact', 'comfortable', 'spacious'].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDensity(d);
                      updateFormData({ density: d });
                    }}
                    style={{
                      background: density === d ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                      color: density === d ? '#fff' : '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {TEMPLATE_LIST.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id);
                      updateFormData({ template: tmpl.id });
                      if (tmpl.sampleData) {
                        handleLoadSamplePreset(tmpl.sampleData, tmpl.id);
                      }
                    }}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? `2px solid ${tmpl.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 0 16px ${tmpl.badgeColor}30` : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.84rem', color: isSelected ? '#fff' : '#e2e8f0' }}>
                          {tmpl.label}
                        </span>
                        <span style={{ 
                          fontSize: '0.62rem', 
                          fontWeight: 800, 
                          background: `${tmpl.badgeColor}25`, 
                          color: tmpl.badgeColor, 
                          padding: '1px 6px', 
                          borderRadius: '6px',
                          border: `1px solid ${tmpl.badgeColor}40`
                        }}>
                          {tmpl.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, lineHeight: 1.35 }}>
                        {tmpl.description}
                      </p>
                    </div>

                    {isSelected && tmpl.sampleData && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.66rem', color: '#38bdf8', fontWeight: 700 }}>
                          ✓ Format Active
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadSamplePreset(tmpl.sampleData);
                          }}
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Load sample content formatted for this template"
                        >
                          <Sparkles size={10} /> Load Preset Data
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Page Overflow Warning Indicator */}
          {isOverflowing && (
            <div style={{ width: '100%', maxWidth: '800px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '8px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                <AlertCircle size={15} />
                <span>Page Overflow Warning: Content length (~{Math.round(overflowHeight)}px) exceeds standard 1-page A4 (~1123px).</span>
              </div>
              <button
                onClick={() => {
                  setDensity('compact');
                  updateFormData({ density: 'compact' });
                }}
                style={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Tighten Spacing
              </button>
            </div>
          )}

          {/* Live WYSIWYG A4 Preview Sheet */}
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '6px 0' }}>
            <div 
              ref={a4PreviewRef}
              className="printable-resume-paper"
              style={{ 
                minWidth: '720px', 
                maxWidth: '820px', 
                margin: '0 auto', 
                background: '#ffffff', 
                color: '#1e293b', 
                padding: activeDensity.pagePadding, 
                borderRadius: '8px', 
                boxShadow: '0 20px 45px rgba(0,0,0,0.55)', 
                fontFamily: activeTemplate.fontFamily, 
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              {/* Header Block */}
              <div style={{ 
                borderBottom: activeTemplate.headerBorder, 
                paddingBottom: activeDensity.itemGap, 
                marginBottom: activeDensity.sectionGap,
                textAlign: activeTemplate.headerAlignment 
              }}>
                <InlineEditableText
                  tag="h1"
                  value={formData.name}
                  onChange={(val) => updateFormData({ name: val })}
                  placeholder="Your Full Name"
                  style={{ 
                    fontSize: activeDensity.titleSize, 
                    fontWeight: 900, 
                    margin: 0, 
                    color: activeTemplate.accentColor, 
                    fontFamily: activeTemplate.headingFont,
                    letterSpacing: activeTemplate.headingStyle === 'spaced-caps' ? '0.12em' : '-0.02em'
                  }}
                />
                
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: activeTemplate.secondaryColor, 
                  marginTop: '4px', 
                  display: 'flex', 
                  gap: '8px', 
                  flexWrap: 'wrap',
                  justifyContent: activeTemplate.headerAlignment === 'center' ? 'center' : 'flex-start'
                }}>
                  <InlineEditableText
                    value={formData.email}
                    onChange={(val) => updateFormData({ email: val })}
                    placeholder="email@example.com"
                  />
                  <span>•</span>
                  <InlineEditableText
                    value={formData.phone}
                    onChange={(val) => updateFormData({ phone: val })}
                    placeholder="+91 9876543210"
                  />
                  <span>•</span>
                  <InlineEditableText
                    value={formData.city}
                    onChange={(val) => updateFormData({ city: val })}
                    placeholder="City"
                  />
                  <span>,</span>
                  <InlineEditableText
                    value={formData.country}
                    onChange={(val) => updateFormData({ country: val })}
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Dynamic Section Ordering */}
              {customSectionOrder.map((sectionKey, sectionIdx) => {
                const isFirst = sectionIdx === 0;
                const isLast = sectionIdx === customSectionOrder.length - 1;
                const isSpaced = activeTemplate.headingStyle === 'spaced-caps';

                const renderSectionHeader = (titleText) => (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: activeTemplate.sectionBorder, paddingBottom: '3px', marginBottom: activeDensity.itemGap }}>
                    <h2 style={{ 
                      fontSize: activeDensity.headingSize, 
                      textTransform: isSpaced || activeTemplate.headingStyle === 'plain-caps' || activeTemplate.headingStyle === 'uppercase-underline' ? 'uppercase' : 'none', 
                      letterSpacing: isSpaced ? '0.18em' : '0.05em', 
                      color: activeTemplate.accentColor, 
                      margin: 0, 
                      fontFamily: activeTemplate.headingFont, 
                      fontWeight: 800 
                    }}>
                      {titleText}
                    </h2>

                    {/* Section Reorder Controls (Hover / subtle) */}
                    <div style={{ display: 'flex', gap: '2px', opacity: 0.6 }} className="print:hidden">
                      <button 
                        onClick={() => handleMoveSection(sectionKey, 'up')}
                        disabled={isFirst}
                        title="Move section up"
                        style={{ border: 'none', background: 'transparent', cursor: isFirst ? 'default' : 'pointer', color: '#64748B', padding: '1px 3px', opacity: isFirst ? 0.2 : 1 }}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button 
                        onClick={() => handleMoveSection(sectionKey, 'down')}
                        disabled={isLast}
                        title="Move section down"
                        style={{ border: 'none', background: 'transparent', cursor: isLast ? 'default' : 'pointer', color: '#64748B', padding: '1px 3px', opacity: isLast ? 0.2 : 1 }}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                );

                // Section 1: Professional Summary
                if (sectionKey === 'summary') {
                  return (
                    <div key="summary" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Professional Summary')}
                      <InlineEditableText
                        multiline
                        value={formData.summary}
                        onChange={(val) => updateFormData({ summary: val })}
                        placeholder="Click to add your 2-3 sentence executive professional summary..."
                        style={{ 
                          fontSize: activeDensity.baseFontSize, 
                          lineHeight: activeDensity.lineHeight, 
                          color: '#334155', 
                          margin: 0 
                        }}
                      />
                    </div>
                  );
                }

                // Section 2: Skills
                if (sectionKey === 'skills') {
                  return (
                    <div key="skills" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Core Technical Competencies')}
                      
                      {activeTemplate.skillFormat === 'chips' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {(formData?.skills || []).map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              style={{
                                background: activeTemplate.noColor ? '#f1f5f9' : `${activeTemplate.accentColor}15`,
                                color: activeTemplate.noColor ? '#000000' : activeTemplate.accentColor,
                                border: `1px solid ${activeTemplate.accentColor}30`,
                                borderRadius: '4px',
                                padding: '2px 7px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <InlineEditableText
                                value={skill}
                                onChange={(newSkill) => {
                                  const updated = [...(formData?.skills || [])];
                                  updated[sIdx] = newSkill;
                                  updateFormData({ skills: updated });
                                }}
                              />
                              <X 
                                size={10} 
                                style={{ cursor: 'pointer', opacity: 0.6 }} 
                                onClick={() => handleRemoveSkill(skill)}
                              />
                            </span>
                          ))}
                          <button
                            onClick={() => handleAddSkill('New Skill')}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #94a3b8',
                              borderRadius: '4px',
                              padding: '2px 7px',
                              fontSize: '0.72rem',
                              color: '#64748b',
                              cursor: 'pointer'
                            }}
                          >
                            + Add Skill
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: activeDensity.baseFontSize, color: '#334155', lineHeight: activeDensity.lineHeight }}>
                          <InlineEditableText
                            multiline
                            value={(formData?.skills || []).join(' • ')}
                            onChange={(val) => {
                              const parsed = val.split('•').map(s => s.trim()).filter(Boolean);
                              updateFormData({ skills: parsed });
                            }}
                            placeholder="Python • React • FastAPI • Docker • Postgres"
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                // Section 3: Experience
                if (sectionKey === 'experience') {
                  return (
                    <div key="experience" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Professional Experience')}
                      
                      {(formData?.experience_list || formData?.experience || []).map((exp, expIdx) => (
                        <div key={expIdx} style={{ marginBottom: activeDensity.itemGap }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <InlineEditableText
                                value={exp.title}
                                onChange={(val) => handleUpdateExperience(expIdx, 'title', val)}
                                placeholder="Job Title"
                                style={{ fontWeight: 800, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                              />
                              <span>—</span>
                              <InlineEditableText
                                value={exp.company}
                                onChange={(val) => handleUpdateExperience(expIdx, 'company', val)}
                                placeholder="Company Name"
                                style={{ fontWeight: 600, fontSize: activeDensity.baseFontSize, color: '#334155' }}
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {exp.duration_months ? `${exp.duration_months} mos` : 'Full-time'}
                              </span>
                              <button
                                onClick={() => handleRemoveExperience(expIdx)}
                                title="Remove experience"
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          </div>

                          <InlineEditableText
                            multiline
                            value={exp.description}
                            onChange={(val) => handleUpdateExperience(expIdx, 'description', val)}
                            placeholder="Add quantifiable achievements and impact (e.g. Scaled database throughput by 40%)..."
                            style={{ 
                              fontSize: activeDensity.baseFontSize, 
                              lineHeight: activeDensity.lineHeight, 
                              color: '#334155', 
                              marginTop: '2px' 
                            }}
                          />
                        </div>
                      ))}

                      <button
                        onClick={handleAddExperience}
                        style={{
                          background: 'transparent',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: activeTemplate.accentColor,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={11} /> Add Experience Role
                      </button>
                    </div>
                  );
                }

                // Section 4: Education
                if (sectionKey === 'education') {
                  return (
                    <div key="education" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Education & Credentials')}
                      
                      {(formData.education || []).map((edu, eduIdx) => (
                        <div key={eduIdx} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <InlineEditableText
                              value={edu.degree}
                              onChange={(val) => handleUpdateEducation(eduIdx, 'degree', val)}
                              placeholder="Degree"
                              style={{ fontWeight: 700, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                            />
                            <span>in</span>
                            <InlineEditableText
                              value={edu.field}
                              onChange={(val) => handleUpdateEducation(eduIdx, 'field', val)}
                              placeholder="Field of Study"
                              style={{ fontWeight: 600, fontSize: activeDensity.baseFontSize, color: '#334155' }}
                            />
                            <span>—</span>
                            <InlineEditableText
                              value={edu.institution}
                              onChange={(val) => handleUpdateEducation(eduIdx, 'institution', val)}
                              placeholder="Institution Name"
                              style={{ fontSize: activeDensity.baseFontSize, color: '#475569' }}
                            />
                          </div>

                          <button
                            onClick={() => handleRemoveEducation(eduIdx)}
                            title="Remove education"
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={handleAddEducation}
                        style={{
                          background: 'transparent',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: activeTemplate.accentColor,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={11} /> Add Education
                      </button>
                    </div>
                  );
                }

                // Section 5: Projects
                if (sectionKey === 'projects') {
                  return (
                    <div key="projects" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Key Projects & Portfolio')}
                      
                      {(formData.projects || []).map((proj, projIdx) => (
                        <div key={projIdx} style={{ marginBottom: activeDensity.itemGap }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <InlineEditableText
                                value={proj.title}
                                onChange={(val) => handleUpdateProject(projIdx, 'title', val)}
                                placeholder="Project Name"
                                style={{ fontWeight: 800, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                              />
                              {proj.technologies && (
                                <>
                                  <span>|</span>
                                  <InlineEditableText
                                    value={proj.technologies}
                                    onChange={(val) => handleUpdateProject(projIdx, 'technologies', val)}
                                    placeholder="Tech Stack"
                                    style={{ fontWeight: 600, fontSize: '0.76rem', color: activeTemplate.accentColor }}
                                  />
                                </>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemoveProject(projIdx)}
                              title="Remove project"
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                            >
                              <X size={11} />
                            </button>
                          </div>

                          <InlineEditableText
                            multiline
                            value={proj.description}
                            onChange={(val) => handleUpdateProject(projIdx, 'description', val)}
                            placeholder="Describe architecture, user scale and quantifiable metrics..."
                            style={{ 
                              fontSize: activeDensity.baseFontSize, 
                              lineHeight: activeDensity.lineHeight, 
                              color: '#334155', 
                              marginTop: '2px' 
                            }}
                          />
                        </div>
                      ))}

                      <button
                        onClick={handleAddProject}
                        style={{
                          background: 'transparent',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: activeTemplate.accentColor,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={11} /> Add Project
                      </button>
                    </div>
                  );
                }

                // Section 6: Certifications
                if (sectionKey === 'certifications') {
                  return (
                    <div key="certifications" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Certifications & Licenses')}
                      
                      {(formData.certifications || []).map((cert, certIdx) => (
                        <div key={certIdx} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <InlineEditableText
                              value={cert.name}
                              onChange={(val) => handleUpdateCertification(certIdx, 'name', val)}
                              placeholder="Certification Name"
                              style={{ fontWeight: 700, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                            />
                            <span>—</span>
                            <InlineEditableText
                              value={cert.organization}
                              onChange={(val) => handleUpdateCertification(certIdx, 'organization', val)}
                              placeholder="Issuing Organization"
                              style={{ fontSize: activeDensity.baseFontSize, color: '#334155' }}
                            />
                          </div>

                          <button
                            onClick={() => handleRemoveCertification(certIdx)}
                            title="Remove certification"
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={handleAddCertification}
                        style={{
                          background: 'transparent',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: activeTemplate.accentColor,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={11} /> Add Certification
                      </button>
                    </div>
                  );
                }

                // Section 7: Achievements
                if (sectionKey === 'achievements') {
                  return (
                    <div key="achievements" style={{ marginBottom: activeDensity.sectionGap }}>
                      {renderSectionHeader('Honors & Key Achievements')}
                      
                      {(formData.achievements || []).map((ach, achIdx) => (
                        <div key={achIdx} style={{ marginBottom: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <InlineEditableText
                              value={ach.title}
                              onChange={(val) => handleUpdateAchievement(achIdx, 'title', val)}
                              placeholder="Achievement Title"
                              style={{ fontWeight: 800, fontSize: activeDensity.baseFontSize, color: '#0f172a' }}
                            />
                            <button
                              onClick={() => handleRemoveAchievement(achIdx)}
                              title="Remove achievement"
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}
                            >
                              <X size={11} />
                            </button>
                          </div>

                          <InlineEditableText
                            multiline
                            value={ach.description}
                            onChange={(val) => handleUpdateAchievement(achIdx, 'description', val)}
                            placeholder="Describe the honor, rank, award or competitive achievement..."
                            style={{ fontSize: activeDensity.baseFontSize, color: '#334155', marginTop: '2px' }}
                          />
                        </div>
                      ))}

                      <button
                        onClick={handleAddAchievement}
                        style={{
                          background: 'transparent',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: activeTemplate.accentColor,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={11} /> Add Achievement
                      </button>
                    </div>
                  );
                }

                return null;
              })}

            </div>
          </div>

        </div>
      )}

      {/* Mode 3: Raw ATS Parser Inspector */}
      {viewMode === VIEW_MODES.ATS_RAW && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Normalized ATS Profile JSON Schema
              </h3>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                showToast('ATS Schema copied to clipboard!', 'info');
              }}
              style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Copy size={12} /> Copy JSON
            </button>
          </div>

          <pre style={{ background: 'rgba(0, 0, 0, 0.45)', padding: '16px', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '500px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}

      {/* Export Pre-flight Validation Modal */}
      {exportPreflightModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.95), rgba(15, 23, 42, 0.98))', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <AlertCircle size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Incomplete Sections Detected
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: '14px' }}>
              Your resume is missing essential sections that may negatively impact ATS parser score:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              {exportPreflightModal.missing.map((sec, i) => (
                <div key={i} style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={12} color="#f87171" />
                  <span>Missing: <strong>{sec}</strong></span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setExportPreflightModal(null)}
                style={{ padding: '8px 14px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Back to Edit
              </button>
              <button 
                onClick={() => executeDownload(exportPreflightModal.format)}
                style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Download Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Baseline Diff Comparison Modal */}
      {diffModalOpen && initialProfileRef.current && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '24px', background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.95), rgba(15, 23, 42, 0.98))', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitBranch size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Version Comparison vs Baseline
                </h3>
              </div>
              <button 
                onClick={() => setDiffModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Score comparison */}
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Baseline Score</div>
                  <strong style={{ fontSize: '1rem', color: '#e2e8f0' }}>{calculateAtsScore(initialProfileRef.current).totalScore}/100</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Current Working Score</div>
                  <strong style={{ fontSize: '1rem', color: '#34d399' }}>{atsEvaluation.totalScore}/100</strong>
                </div>
              </div>

              {/* Skills diff */}
              <div>
                <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>Skills Diff</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {(formData?.skills || []).map((s, i) => {
                    const isNew = !(initialProfileRef.current?.skills || []).includes(s);
                    return (
                      <span key={i} style={{ background: isNew ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)', color: isNew ? '#4ade80' : '#cbd5e1', border: `1px solid ${isNew ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem' }}>
                        {isNew ? `+ ${s}` : s}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Summary word count */}
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                <strong>Summary length:</strong> {formData?.summary?.length || 0} chars (Baseline: {initialProfileRef.current?.summary?.length || 0} chars)
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDiffModalOpen(false)}
                style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toast && (
        <div style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          background: toast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : (toast.type === 'info' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#ef4444'), 
          color: '#ffffff', 
          padding: '10px 18px', 
          borderRadius: '10px', 
          fontSize: '0.82rem', 
          fontWeight: 700, 
          zIndex: 1100, 
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
