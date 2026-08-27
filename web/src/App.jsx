import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import ShaderBackground from './components/ShaderBackground';
import MobileBottomNav from './components/MobileBottomNav';
import JobDetailsModal from './components/JobDetailsModal';
import ApplicationFlowModal from './components/ApplicationFlowModal';
import SearchFiltersModal from './components/SearchFiltersModal';
import CompanyProfileModal from './components/CompanyProfileModal';
import ConfettiEffect from './components/characters/ConfettiEffect';
import SoundSystem from './components/characters/SoundEffects';
import BrandedLoadingState from './components/characters/BrandedLoadingState';
import ProtectedRoute from './components/ProtectedRoute';
import ProPaywallModal from './components/ProPaywallModal';
import apiFetch, { safeJson } from './lib/apiClient';
import { saveProfileToSupabase, loadProfileFromLocal, fetchProfileFromSupabase } from './lib/supabaseClient';
import { extractPdfTextClient } from './utils/pdfExtractor';

function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasBeenReloaded = sessionStorage.getItem('nof_chunk_reloaded');
    try {
      const component = await componentImport();
      sessionStorage.removeItem('nof_chunk_reloaded');
      return component;
    } catch (error) {
      if (!pageHasBeenReloaded) {
        sessionStorage.setItem('nof_chunk_reloaded', 'true');
        window.location.reload(true);
        return { default: () => null };
      }
      throw error;
    }
  });
}

// Dynamically code-split studio tabs to keep initial JS bundle under 200KB
const OverviewDashboard = lazyWithRetry(() => import('./components/OverviewDashboard'));
const ResumeAnalyzer = lazyWithRetry(() => import('./components/ResumeAnalyzer'));
const JobDiscovery = lazyWithRetry(() => import('./components/JobDiscovery'));
const IndiaInternshipHub = lazyWithRetry(() => import('./components/IndiaInternshipHub'));
const MncOpportunityHub = lazyWithRetry(() => import('./components/MncOpportunityHub'));
const TailoringHub = lazyWithRetry(() => import('./components/TailoringHub'));
const ApplicationPipeline = lazyWithRetry(() => import('./components/ApplicationPipeline'));
const InterviewPrepStudio = lazyWithRetry(() => import('./components/InterviewPrepStudio'));
const CodingSandboxStudio = lazyWithRetry(() => import('./components/CodingSandboxStudio'));
const RecruiterOutreachStudio = lazyWithRetry(() => import('./components/RecruiterOutreachStudio'));
const LearningRoadmapStudio = lazyWithRetry(() => import('./components/LearningRoadmapStudio'));
const SavedJobsView = lazyWithRetry(() => import('./components/SavedJobsView'));
const UserProfileView = lazyWithRetry(() => import('./components/UserProfileView'));
const SettingsPrivacy = lazyWithRetry(() => import('./components/SettingsPrivacy'));
const AuthView = lazyWithRetry(() => import('./components/AuthView'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./components/PrivacyPolicyPage'));
const TermsOfServicePage = lazyWithRetry(() => import('./components/TermsOfServicePage'));
const SystemStatusPage = lazyWithRetry(() => import('./components/SystemStatusPage'));
const SkillAssessmentStudio = lazyWithRetry(() => import('./components/SkillAssessmentStudio'));
const CommunityForumView = lazyWithRetry(() => import('./components/CommunityForumView'));
const AdminDashboard = lazyWithRetry(() => import('./components/AdminDashboard'));
const SalaryIntelligenceStudio = lazyWithRetry(() => import('./components/SalaryIntelligenceStudio'));

const DEFAULT_FALLBACK_PROFILE = {
  id: 'usr_sample_01',
  name: 'Aditya Tamta',
  email: 'aditya.tamta@dev.io',
  phone: '+91 98765 43210',
  city: 'Bengaluru',
  country: 'India',
  summary: 'Experienced tech professional specializing in full-stack web applications, scalable backend microservices, and system architecture.',
  skills: ['React', 'JavaScript', 'Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
  experience_list: [
    {
      title: 'Backend & Systems Engineer',
      company: 'Enterprise Tech Solutions',
      dates: '2023 - Present',
      description: 'Engineered REST APIs with FastAPI, reducing latency by 35%. Architected high-throughput microservices using React, Python, and PostgreSQL.'
    }
  ],
  education: [
    {
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Institute of Technology',
      year: '2023'
    }
  ],
  projects: [
    {
      title: 'React AI Career Intelligence Platform',
      description: 'High-throughput real-time resume optimization and ATS scanner built with React, Python, and FastAPI.'
    }
  ],
  ats_score: 91
};

export default function App() {
  const getInitialTab = () => {
    try {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get('tab')?.toLowerCase();
      const target = path || hash || queryTab;
      if (target === 'admin') return 'admin';
      if (target && target !== 'index.html') return target;
    } catch {}
    return 'home';
  };

  // ALL STATE DECLARATIONS AT THE VERY TOP (Prevents TDZ ReferenceError on minified variable access)
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nof_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    return loadProfileFromLocal() || DEFAULT_FALLBACK_PROFILE;
  });
  const [matches, setMatches] = useState([]);
  const [matchesError, setMatchesError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [selectedPrepAppId, setSelectedPrepAppId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState(() => {
    try {
      const saved = localStorage.getItem('nof_user_sub');
      return saved ? JSON.parse(saved) : { tier: 'free', is_pro: false, scrapes_used: 0, scrapes_remaining: 5, free_limit: 5 };
    } catch {
      return { tier: 'free', is_pro: false, scrapes_used: 0, scrapes_remaining: 5, free_limit: 5 };
    }
  });
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [selectedJobApply, setSelectedJobApply] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchFiltersOpen, setSearchFiltersOpen] = useState(false);
  const [selectedProblemForSandbox, setSelectedProblemForSandbox] = useState(null);
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('nof_saved_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const setActiveTab = (tab, keepQuery = false) => {
    setActiveTabState(tab);
    try {
      if (tab === 'home') {
        window.history.replaceState(null, '', '/');
      } else {
        const search = (keepQuery || tab === 'auth') ? window.location.search : '';
        window.history.replaceState(null, '', `/${tab}${search}`);
      }
    } catch {}
  };

  // Synchronize on popstate, hashchange, and auth expiration events
  useEffect(() => {
    const handleUrlChange = () => {
      const tab = getInitialTab();
      setActiveTabState(tab);
    };

    const handleAuthExpired = (e) => {
      setCurrentUser(null);
      setProfile(null);
      setMatches([]);
      setApplications([]);
      setMetrics(null);
      const redirectTab = e.detail?.redirectTab || 'overview';
      const targetUrl = `/auth?redirect=${encodeURIComponent(redirectTab)}`;
      window.history.replaceState(null, '', targetUrl);
      setActiveTabState('auth');
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('nof_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('nof_auth_expired', handleAuthExpired);
    };
  }, []);

  const handleTriggerCelebration = () => {
    SoundSystem.playSuccess();
    setConfettiActive(true);
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await apiFetch('/api/subscription/status');
      if (res && res.ok) {
        const subData = await safeJson(res);
        if (subData) {
          setUserSubscription(subData);
          localStorage.setItem('nof_user_sub', JSON.stringify(subData));
        }
      }
    } catch (e) {
      console.warn("Could not fetch subscription status:", e);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const handleScrapeTriggered = async () => {
    if (userSubscription.is_pro) return true;

    try {
      const res = await apiFetch('/api/subscription/scrape', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.allowed || data.ok)) {
          const updated = {
            ...userSubscription,
            scrapes_used: data.scrapes_used ?? userSubscription.scrapes_used,
            scrapes_remaining: data.scrapes_remaining ?? userSubscription.scrapes_remaining,
            is_pro: data.is_pro ?? userSubscription.is_pro
          };
          setUserSubscription(updated);
          localStorage.setItem('nof_user_sub', JSON.stringify(updated));
          return true;
        }
      }
    } catch (err) {
      if (err.status === 402 || (err.message && err.message.includes('limit reached'))) {
        setIsPaywallOpen(true);
        return false;
      }
    }

    if (userSubscription.scrapes_remaining <= 0) {
      setIsPaywallOpen(true);
      return false;
    }

    return true;
  };

  const handleUpgradeSuccess = (res) => {
    const updated = {
      ...userSubscription,
      tier: 'pro',
      is_pro: true,
      scrapes_remaining: 999999
    };
    setUserSubscription(updated);
    localStorage.setItem('nof_user_sub', JSON.stringify(updated));
    handleTriggerCelebration();
  };

  // NextDream / NextOppr UI Handlers

  const handleToggleSaveJob = (job) => {
    setSavedJobs((prev) => {
      const exists = prev.some(j => j.id === job.id || (j.title === job.title && j.company === job.company));
      const updated = exists 
        ? prev.filter(j => !(j.id === job.id || (j.title === job.title && j.company === job.company)))
        : [...prev, {
            id: job.id || `saved-${Date.now()}`,
            title: job.title || job.role_title,
            company: job.company,
            location: job.location || 'Remote',
            job_type: job.job_type || job.role_type || 'Full-time',
            experience_level: job.experience_level || '1-3 years exp',
            salary_range: job.salary_range || '$50K/mo',
            theme: job.theme || (job.company?.toLowerCase().includes('spotify') ? 'card-next-amber' : job.company?.toLowerCase().includes('airbnb') ? 'card-next-coral' : 'card-next-purple')
          }];
      try {
        localStorage.setItem('nof_saved_jobs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveSavedJob = (jobId) => {
    setSavedJobs((prev) => {
      const updated = prev.filter(j => j.id !== jobId);
      try {
        localStorage.setItem('nof_saved_jobs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };



  const loadData = async () => {
    try {
      // 1. Profile
      const profRes = await apiFetch('/api/profile');
      if (profRes && profRes.ok) {
        const profData = await safeJson(profRes);
        if (profData && (profData.name || profData.skills)) {
          setProfile(profData);
        } else {
          const cloudProf = await fetchProfileFromSupabase();
          const localProf = cloudProf || loadProfileFromLocal();
          setProfile(localProf || DEFAULT_FALLBACK_PROFILE);
        }
      } else {
        const cloudProf = await fetchProfileFromSupabase();
        const localProf = cloudProf || loadProfileFromLocal();
        setProfile(localProf || DEFAULT_FALLBACK_PROFILE);
      }

      // 2. Matches
      try {
        setMatchesError(null);
        const matchRes = await apiFetch('/api/matches?limit=1000');
        if (matchRes && matchRes.ok) {
          const matchData = await safeJson(matchRes, []);
          if (Array.isArray(matchData)) setMatches(matchData);
        } else {
          setMatchesError('Failed to fetch job matches from server.');
        }
      } catch (err) {
        setMatchesError(err.message || 'Error connecting to opportunity server.');
      }

      // 3. Applications
      const appRes = await apiFetch('/api/applications');
      if (appRes && appRes.ok) {
        const appData = await safeJson(appRes, []);
        if (Array.isArray(appData) && appData.length > 0) setApplications(appData);
      }

      // 4. Metrics
      const metRes = await apiFetch('/api/dashboard/metrics');
      if (metRes && metRes.ok) {
        const metData = await safeJson(metRes);
        if (metData) setMetrics(metData);
      }
    } catch (e) {
      console.error("API error loading data:", e);
    }
  };

  useEffect(() => {
    // Initial fetch without auto-seeding dummy data
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, []);

  const parseResumeFileClient = async (file) => {
    let fileText = '';
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        fileText = await extractPdfTextClient(arrayBuffer);
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        fileText = await file.text();
      } else {
        const arrayBuffer = await file.arrayBuffer();
        fileText = await extractPdfTextClient(arrayBuffer);
      }
    } catch {
      fileText = '';
    }

    const textLines = fileText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => 
        l.length >= 2 && 
        !l.startsWith('%PDF') && 
        !l.startsWith('<<') && 
        !l.startsWith('>>') && 
        !/^(obj|endobj|stream|endstream|xref|trailer|startxref|Font|MediaBox|Catalog)/i.test(l) &&
        !/^\d{10,}/.test(l)
      );

    // 1. Extract Email
    const emailMatch = fileText.match(/\b[A-Za-z0-9._%+-]+(?:\s*@\s*|\s+at\s+)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i);
    let email = emailMatch ? emailMatch[0].replace(/\s+/g, '').replace(/\bat\b/i, '@').toLowerCase() : '';
    if (!email && currentUser?.email && !currentUser.email.includes('google') && !currentUser.email.includes('candidate')) {
      email = currentUser.email;
    }

    // 2. Extract Phone (Ignore creation timestamps starting with 202)
    const phoneMatches = fileText.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/g);
    let phone = '';
    if (phoneMatches) {
      const validPhone = phoneMatches.find(p => {
        const cleaned = p.replace(/\D/g, '');
        return cleaned.length >= 8 && cleaned.length <= 13 && !cleaned.startsWith('202');
      });
      if (validPhone) phone = validPhone.trim();
    }

    // 3. Extract Name from Header or Clean File Name
    const fn = file.name || '';
    const cleanedFileBasename = fn
      .split('.')[0]
      .replace(/[-_]/g, ' ')
      .replace(/resume|cv|curriculum|vitae|profile|pdf|doc|docx/gi, '')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();

    const headerNameLine = textLines.find(l => 
      !l.includes('@') && 
      !/\d{3,}/.test(l) && 
      !/resume|cv|curriculum|profile|sample|document|pdf|page|education|skills|experience|summary|projects|contact|technical|frameworks|tools/i.test(l) && 
      l.length >= 3 && 
      l.length <= 40 &&
      /^[A-Za-z\s.'-]+$/.test(l) &&
      l.split(/\s+/).length >= 1 &&
      l.split(/\s+/).length <= 4
    );

    let name = '';
    if (headerNameLine) {
      name = headerNameLine;
    } else if (cleanedFileBasename && cleanedFileBasename.length >= 3) {
      name = cleanedFileBasename;
    } else if (currentUser?.full_name && !currentUser.full_name.includes('Google') && !currentUser.full_name.includes('Candidate')) {
      name = currentUser.full_name;
    } else {
      name = 'Candidate Name';
    }

    // 4. Dynamic Skills Extraction
    const TECH_KEYWORDS = [
      'React', 'React.js', 'Next.js', 'JavaScript', 'TypeScript', 'Python', 'FastAPI', 'Django', 'Flask',
      'Node.js', 'Express', 'Java', 'Spring Boot', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
      'TailwindCSS', 'Redux', 'GraphQL', 'REST API', 'Git', 'Linux', 'Terraform', 'CI/CD', 'Machine Learning',
      'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-Learn', 'OpenCV', 'LangChain', 'SQL', 'HTML5', 'CSS3',
      'System Design', 'Microservices', 'Kafka', 'Android', 'iOS', 'Swift', 'Kotlin', 'Flutter', 'React Native'
    ];

    const foundSkills = [];
    const lowerText = fileText.toLowerCase();
    TECH_KEYWORDS.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) {
        foundSkills.push(kw);
      }
    });

    const finalSkills = Array.from(new Set(foundSkills));

    // 5. City & Country
    let city = '';
    let country = 'India';
    if (/bengaluru|bangalore/i.test(fileText)) city = 'Bengaluru';
    else if (/mumbai/i.test(fileText)) city = 'Mumbai';
    else if (/delhi|noida|gurugram|gurgaon/i.test(fileText)) city = 'Gurugram';
    else if (/hyderabad/i.test(fileText)) city = 'Hyderabad';
    else if (/pune/i.test(fileText)) city = 'Pune';
    else if (/san francisco|seattle|austin|new york/i.test(fileText)) { city = 'San Francisco'; country = 'USA'; }

    // 6. Section Parsing (Experience, Education, Projects)
    const expMatches = [];
    const expRegex = /([A-Z][A-Za-z0-9\s&/.-]+(?:Engineer|Developer|Architect|Manager|Lead|Intern|Analyst|Consultant))\s*(?:at|@|,|-|–)\s*([A-Z][A-Za-z0-9\s&.]+)/g;
    let match;
    while ((match = expRegex.exec(fileText)) !== null) {
      const roleTitle = match[1].trim();
      const compName = match[2].trim().split('\n')[0];
      if (roleTitle.length >= 4 && compName.length >= 2 && !/\b[a-z]\s+[a-z]\b/i.test(compName)) {
        expMatches.push({
          title: roleTitle,
          role: roleTitle,
          company: compName,
          dates: '2023 - Present',
          description: `Delivered engineering milestones using ${finalSkills.slice(0, 3).join(', ') || 'core technologies'}.`
        });
      }
    }

    const eduMatches = [];
    const eduRegex = /(B\.?Tech|B\.?E\.?|B\.?S\.?|M\.?Tech|M\.?S\.?|MBA|Ph\.?D|Bachelor|Master)[\s,]+(?:of\s+|in\s+)?([A-Za-z\s&]{3,40})/gi;
    const INVALID_EDU_KEYWORDS = ['skills', 'apis', 'resumes', 'technical', 'projects', 'experience', 'scores', 'tools', 'frameworks'];
    while ((match = eduRegex.exec(fileText)) !== null) {
      const deg = match[1].trim();
      const rawField = match[2].trim().split('\n')[0].trim();
      const cleanField = rawField.replace(/\s+/g, ' ');
      const lowerField = cleanField.toLowerCase();
      
      const containsInvalid = INVALID_EDU_KEYWORDS.some(kw => lowerField.includes(kw));
      if (!containsInvalid && cleanField.length >= 3 && !/\b[a-z]\s+[a-z]\s+[a-z]\b/i.test(cleanField)) {
        if (!eduMatches.some(e => e.degree.toLowerCase() === deg.toLowerCase())) {
          eduMatches.push({
            degree: deg,
            field: cleanField,
            institution: 'University / Institute',
            year: '2023'
          });
        }
      }
    }

    const githubMatch = fileText.match(/https?:\/\/(?:www\.)?github\.com\/[^\s\)]+/);
    const projMatches = [];
    const projRegex = /(?:project|portfolio)\s*[:\-–]?\s*\n?([A-Z0-9][A-Za-z0-9\s\-_]{3,40})/gi;
    while ((match = projRegex.exec(fileText)) !== null) {
      projMatches.push({
        title: match[1].trim(),
        description: `Project built with ${finalSkills.slice(0, 3).join(', ') || 'software stack'}.`,
        technologies: finalSkills.slice(0, 4).join(', '),
        link: githubMatch ? githubMatch[0] : null
      });
    }

    // 7. Extract Authored Summary or Generate Professional Technical Summary
    const summaryMatch = fileText.match(/(?:summary|profile|objective|about me)\s*[:\-–]?\s*\n(.*?)(?=\n\s*(?:skills|experience|education|projects)|$)/is);
    let summary = '';
    if (summaryMatch && summaryMatch[1].trim().length > 20) {
      summary = summaryMatch[1].trim().replace(/\s+/g, ' ').slice(0, 500);
    } else if (finalSkills.length > 0) {
      summary = `Experienced software engineering professional specializing in ${finalSkills.slice(0, 5).join(', ')}. Proven track record in technical architecture, clean code delivery, and scalable systems.`;
    } else {
      summary = `Software engineering professional with proven technical capabilities and project delivery experience.`;
    }

    return {
      id: `usr_${Date.now()}`,
      name: name,
      email: email,
      phone: phone,
      city: city,
      country: country,
      summary: summary,
      skills: finalSkills,
      experience_list: expMatches,
      experience: expMatches,
      past_roles: expMatches,
      education: eduMatches,
      education_list: eduMatches,
      projects: projMatches,
      section_order: ['summary', 'skills', 'experience', 'projects', 'education'],
      ats_score: Math.min(98, Math.max(60, 65 + finalSkills.length * 2))
    };
  };

  const handleUploadResume = async (file, consentGiven = true) => {
    setLoading(true);
    try {
      // 1. Client-Side Parsing via Mozilla PDF.js engine
      const parsedProfile = await parseResumeFileClient(file);
      
      // 2. Sync Extracted Resume Profile to Supabase & Backend API
      if (parsedProfile) {
        setProfile(parsedProfile);
        await saveProfileToSupabase(parsedProfile);

        try {
          await apiFetch('/api/profile/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedProfile),
            credentials: 'include'
          });
        } catch (err) {
          console.warn("API profile sync notice:", err);
        }
      }

      // 3. Scrape fresh matching jobs for newly extracted candidate skills & refresh matches
      try {
        const activeSkills = parsedProfile?.skills || profile?.skills || [];
        await apiFetch('/api/jobs/discover', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: activeSkills }) 
        });
      } catch {}

      await loadData();
      try { SoundSystem.playSuccess(); } catch {}
      return parsedProfile;
    } catch (e) {
      console.warn("Upload notice:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    setLoading(true);
    try {
      await saveProfileToSupabase(updatedProfile);
      setProfile(updatedProfile);
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error("Update profile error:", e);
      await saveProfileToSupabase(updatedProfile);
      setProfile(updatedProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/jobs/discover', { method: 'POST' });
      if (res && res.ok) {
        await loadData();
      }
      setActiveTab('jobs');
    } catch (e) {
      console.warn("Discover jobs notice:", e);
      setActiveTab('jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleTailor = async (matchId) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/applications/tailor/${matchId}`, { method: 'POST' });
      if (res && res.ok) {
        await loadData();
      }
      setActiveTab('tailor');
    } catch (e) {
      console.warn("Tailor application notice:", e);
      setActiveTab('tailor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await apiFetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error("Update status error:", e);
    }
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      await loadData();
    } catch (e) {
      console.error("Seed error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = async () => {
    setLoading(true);
    try {
      await fetch('/api/profile/reset', { 
        method: 'POST',
        credentials: 'include'
      });
      setProfile(null);
      setMatches([]);
      setApplications([]);
      setMetrics(null);
      localStorage.removeItem('nof_auth_token');
      localStorage.removeItem('nof_user');
      setCurrentUser(null);
      await loadData();
      setActiveTab('home');
    } catch (e) {
      console.error("Reset error:", e);
    }
  };

  const handleAuthSuccess = async (user, token, meta = {}) => {
    setCurrentUser(user);
    if (token) localStorage.setItem('nof_auth_token', token);
    localStorage.setItem('nof_user', JSON.stringify(user));
    SoundSystem.playSuccess();
    setConfettiActive(true);

    if (meta?.isNewSignUp) {
      sessionStorage.setItem('nof_just_signed_up', 'true');
    }

    // Refresh profile, matches, applications & metrics for candidate session
    setLoading(true);
    try {
      await loadData();
    } catch (e) {
      console.warn("Post-auth data load error:", e);
    } finally {
      setLoading(false);
    }

    // Check for return-URL query parameter (e.g. /auth?redirect=/jobs)
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectTab = params.get('redirect')?.toLowerCase();
      if (redirectTab && redirectTab !== 'auth' && redirectTab !== 'home') {
        setActiveTab(redirectTab);
        return;
      }
    } catch {}

    if (user?.is_admin || user?.email === 'adityanikt@gmail.com') {
      setActiveTab('admin');
    } else {
      setActiveTab('overview');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('nof_auth_token');
    localStorage.removeItem('nof_user');
    setCurrentUser(null);
    setProfile(null);
    window.history.replaceState(null, '', '/auth');
    setActiveTab('auth');
  };

  return (
    <div className="glazzed-app-wrapper">
      <ShaderBackground />

      {/* Celebratory Confetti Burst */}
      <ConfettiEffect active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Sidebar: Only rendered for signed-in authenticated candidates */}
      {currentUser && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          profile={profile} 
          currentUser={currentUser}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          isPro={userSubscription.is_pro}
          scrapesRemaining={userSubscription.scrapes_remaining}
          freeLimit={userSubscription.free_limit || 5}
        />
      )}
      
      <div className="glazzed-main-content">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          profile={profile} 
          currentUser={currentUser}
          onLogout={handleLogout}
          onToggleMenu={() => setMobileMenuOpen(prev => !prev)}
          onDiscover={handleDiscover}
          loading={loading}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          isPro={userSubscription.is_pro}
          scrapesRemaining={userSubscription.scrapes_remaining}
          freeLimit={userSubscription.free_limit || 5}
        />
        
        <main className="glazzed-main-body">
          {loading && (
            <div style={{
              position: 'fixed',
              top: 20,
              right: 24,
              background: 'rgba(6, 78, 59, 0.92)',
              border: '1px solid rgba(16, 185, 129, 0.6)',
              color: '#34d399',
              padding: '8px 18px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 700,
              zIndex: 9999,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backdropFilter: 'blur(12px)'
            }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981, 0 0 20px #10b981',
                animation: 'pulse 1.5s infinite'
              }}></span>
              <span>Processing...</span>
            </div>
          )}

          <Suspense fallback={
            <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <BrandedLoadingState title="Loading Studio Engine..." />
            </div>
          }>
            {activeTab === 'home' && (
              <HomePage 
                onNavigate={(tab) => setActiveTab(tab)}
                currentUser={currentUser}
                onTriggerCelebration={handleTriggerCelebration}
                onOpenPaywall={() => setIsPaywallOpen(true)}
                isPro={userSubscription.is_pro}
              />
            )}

            {activeTab === 'auth' && (
              <AuthView 
                onAuthSuccess={handleAuthSuccess}
                onContinueAsGuest={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'overview' && (
              <ProtectedRoute targetTab="overview" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <OverviewDashboard 
                  metrics={metrics} 
                  matches={matches}
                  applications={applications}
                  profile={profile}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectJob={(j, m) => setSelectedJobDetails(j || m?.job)}
                  onApplyJob={(j, m) => setSelectedJobApply(j || m?.job)}
                  onToggleSave={handleToggleSaveJob}
                  savedJobs={savedJobs}
                  onOpenFilters={() => setSearchFiltersOpen(true)}
                  onQuickSearch={(q) => setActiveTab('jobs')}
                  onOpenCompany={(comp) => setSelectedCompany(comp)}
                  onTriggerCelebration={handleTriggerCelebration}
                  onUploadResume={handleUploadResume}
                  onSeedDemo={handleSeedDemo}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'saved' && (
              <ProtectedRoute targetTab="saved" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <SavedJobsView 
                  savedJobs={savedJobs}
                  onSelectJob={(j) => setSelectedJobDetails(j)}
                  onRemoveJob={handleRemoveSavedJob}
                  onTailor={handleTailor}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'user-profile' && (
              <ProtectedRoute targetTab="user-profile" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <UserProfileView 
                  profile={profile}
                  applications={applications}
                  savedJobs={savedJobs}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onResetProfile={handleResetProfile}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'profile' && (
              <ProtectedRoute targetTab="profile" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <ResumeAnalyzer 
                  profile={profile} 
                  matches={matches}
                  onUpload={handleUploadResume}
                  onUpdateProfile={handleUpdateProfile}
                  onResetProfile={handleResetProfile}
                  onSeed={handleSeedDemo}
                  onTailor={handleTailor}
                  loading={loading}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'jobs' && (
              <ProtectedRoute targetTab="jobs" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <JobDiscovery 
                  matches={matches} 
                  profile={profile}
                  onTailor={handleTailor}
                  onDiscover={handleDiscover}
                  onRefreshData={loadData}
                  loading={loading}
                  error={matchesError}
                  onSelectJob={(j) => setSelectedJobDetails(j)}
                  onApplyJob={(j) => setSelectedJobApply(j)}
                  onOpenFilters={() => setSearchFiltersOpen(true)}
                  onScrapeTriggered={handleScrapeTriggered}
                  onOpenPaywall={() => setIsPaywallOpen(true)}
                  isPro={userSubscription.is_pro}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'internships' && (
              <ProtectedRoute targetTab="internships" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <IndiaInternshipHub 
                  profile={profile}
                  onTailor={handleTailor}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onScrapeTriggered={handleScrapeTriggered}
                  onOpenPaywall={() => setIsPaywallOpen(true)}
                  isPro={userSubscription.is_pro}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'mnc' && (
              <ProtectedRoute targetTab="mnc" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <MncOpportunityHub 
                  profile={profile}
                  onTailor={handleTailor}
                  loading={loading}
                  onScrapeTriggered={handleScrapeTriggered}
                  onOpenPaywall={() => setIsPaywallOpen(true)}
                  isPro={userSubscription.is_pro}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'salary' && (
              <SalaryIntelligenceStudio profile={profile} />
            )}

            {activeTab === 'tailor' && (
              <ProtectedRoute targetTab="tailor" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <TailoringHub 
                  applications={applications} 
                  onUpdateAppStatus={handleUpdateAppStatus}
                  onLaunchInterviewPrep={(appId) => {
                    setSelectedPrepAppId(appId);
                    setActiveTab('interview-prep');
                  }}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'interview-prep' && (
              <ProtectedRoute targetTab="interview-prep" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <InterviewPrepStudio 
                  applications={applications}
                  profile={profile}
                  selectedAppId={selectedPrepAppId}
                  onSelectApplication={(appId) => setSelectedPrepAppId(appId)}
                  onLaunchSandboxWithProblem={(prob) => {
                    setSelectedProblemForSandbox(prob);
                    setActiveTab('coding');
                  }}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'pipeline' && (
              <ProtectedRoute targetTab="pipeline" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <ApplicationPipeline 
                  applications={applications} 
                  onUpdateAppStatus={handleUpdateAppStatus}
                  onLaunchInterviewPrep={(appId) => {
                    setSelectedPrepAppId(appId);
                    setActiveTab('interview-prep');
                  }}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'coding' && (
              <ProtectedRoute targetTab="coding" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <CodingSandboxStudio 
                  profile={profile}
                  initialProblem={selectedProblemForSandbox}
                  onTriggerCelebration={handleTriggerCelebration}
                  onOpenPaywall={() => setIsPaywallOpen(true)}
                  isPro={userSubscription.is_pro}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'outreach' && (
              <ProtectedRoute targetTab="outreach" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <RecruiterOutreachStudio 
                  profile={profile}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'roadmaps' && (
              <ProtectedRoute targetTab="roadmaps" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <LearningRoadmapStudio 
                  profile={profile}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'settings' && (
              <ProtectedRoute targetTab="settings" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <SettingsPrivacy 
                  profile={profile}
                  onProfileReset={handleResetProfile}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'privacy' && (
              <PrivacyPolicyPage 
                onNavigate={(tab) => setActiveTab(tab)}
                onTriggerCelebration={handleTriggerCelebration}
              />
            )}

            {activeTab === 'terms' && (
              <TermsOfServicePage 
                onNavigate={(tab) => setActiveTab(tab)}
                onTriggerCelebration={handleTriggerCelebration}
              />
            )}

            {activeTab === 'status' && (
              <SystemStatusPage 
                onTriggerCelebration={handleTriggerCelebration}
              />
            )}

            {activeTab === 'assessment' && (
              <ProtectedRoute targetTab="assessment" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <SkillAssessmentStudio 
                  profile={profile}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'community' && (
              <ProtectedRoute targetTab="community" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <CommunityForumView 
                  onNavigate={(tab) => setActiveTab(tab)}
                  onTriggerCelebration={handleTriggerCelebration}
                />
              </ProtectedRoute>
            )}

            {activeTab === 'changelog' && (
              <ChangelogPage />
            )}

            {activeTab === 'admin' && (
              <ProtectedRoute targetTab="admin" activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} setCurrentUser={setCurrentUser}>
                <AdminDashboard 
                  currentUser={currentUser}
                  onAuthSuccess={handleAuthSuccess}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              </ProtectedRoute>
            )}
          </Suspense>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenMenu={() => setMobileMenuOpen(true)} 
      />

      {/* 03. Job Details Full Modal (Screen 03) */}
      <JobDetailsModal 
        job={selectedJobDetails}
        isOpen={Boolean(selectedJobDetails)}
        onClose={() => setSelectedJobDetails(null)}
        onApply={(j, m) => {
          setSelectedJobDetails(null);
          setSelectedJobApply(j || m?.job);
        }}
        onToggleSave={handleToggleSaveJob}
        isSaved={(savedJobs || []).some(s => s.id === selectedJobDetails?.id || (s.title === selectedJobDetails?.title && s.company === selectedJobDetails?.company))}
        onOpenCompany={(comp) => {
          setSelectedJobDetails(null);
          setSelectedCompany(comp);
        }}
      />

      {/* 04. Multi-Step Application Flow Modal (Screen 04) */}
      <ApplicationFlowModal 
        job={selectedJobApply}
        profile={profile}
        isOpen={Boolean(selectedJobApply)}
        onClose={() => setSelectedJobApply(null)}
        onSubmitSuccess={() => {
          loadData();
          SoundSystem.playSuccess();
          handleTriggerCelebration();
        }}
      />

      {/* 05. Search & Filters Modal (Screen 05) */}
      <SearchFiltersModal 
        isOpen={searchFiltersOpen}
        onClose={() => setSearchFiltersOpen(false)}
        onApplyFilters={(filters) => {
          setActiveTab('jobs');
        }}
        totalResultsCount={matches.length || 120}
      />

      {/* 08. Company Profile Modal (Screen 08) */}
      <CompanyProfileModal 
        companyName={selectedCompany || "Spotify"}
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        onSelectJob={(j) => {
          setSelectedCompany(null);
          setSelectedJobDetails(j);
        }}
      />

      {/* 09. Pro Paywall & Payment Modal (₹99 One-Time Lifetime Upgrade) */}
      <ProPaywallModal 
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        scrapesUsed={userSubscription.scrapes_used}
        freeLimit={userSubscription.free_limit || 5}
      />

      {/* 📱 Locked Mobile Bottom Navigation Bar (Rendered on candidate views) */}
      {activeTab !== 'auth' && (
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}
