/**
 * resumeScoring.js - Shared Canonical ATS Scoring Engine
 * Synchronized with backend agent1_parser.py scoring weights.
 */

export const SCORE_WEIGHTS = {
  SKILLS: { max: 35, label: 'Skills Density' },
  METRICS_VERBS: { max: 25, label: 'Metrics & Action Verbs' },
  CONTACT: { max: 15, label: 'Contact Information' },
  STRUCTURE: { max: 15, label: 'Structure & Formatting' },
  KEYWORDS: { max: 10, label: 'Keyword Alignment' }
};

export const ACTION_VERBS = [
  "built", "led", "engineered", "scaled", "spearheaded", "developed", "optimized",
  "architected", "implemented", "deployed", "designed", "created", "reduced",
  "increased", "transformed", "streamlined", "launched", "automated", "orchestrated",
  "accelerated", "pioneered", "championed", "delivered", "mentored", "programmed"
];

export const TIER_CONFIG = {
  excellent: {
    minScore: 82,
    label: 'A+ ATS Benchmark Ready 🌟',
    color: '#22c55e',
    badgeBg: 'rgba(34, 197, 94, 0.18)'
  },
  good: {
    minScore: 68,
    label: 'Good Alignment 👍',
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)'
  },
  needs_work: {
    minScore: 0,
    label: 'Needs Optimization ⚠️',
    color: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)'
  }
};

export function getTierConfig(score) {
  if (score >= TIER_CONFIG.excellent.minScore) return TIER_CONFIG.excellent;
  if (score >= TIER_CONFIG.good.minScore) return TIER_CONFIG.good;
  return TIER_CONFIG.needs_work;
}

export function calculateAtsScore(formData) {
  const skills = Array.isArray(formData?.skills) 
    ? formData.skills.map(s => String(s || '')) 
    : [];
  const summary = String(formData?.summary || '');
  const expList = Array.isArray(formData?.experience_list) 
    ? formData.experience_list 
    : (Array.isArray(formData?.experience) ? formData.experience : (Array.isArray(formData?.past_roles) ? formData.past_roles : []));
  const eduList = Array.isArray(formData?.education) 
    ? formData.education 
    : (Array.isArray(formData?.education_list) ? formData.education_list : []);
  const domains = Array.isArray(formData?.domains) ? formData.domains : [];

  let textForAnalysis = `${summary}`.toLowerCase();
  expList.forEach(exp => {
    if (typeof exp === 'string') {
      textForAnalysis += ` ${exp}`.toLowerCase();
    } else if (exp && typeof exp === 'object') {
      const bulletsStr = Array.isArray(exp.bullets) 
        ? exp.bullets.join(' ') 
        : String(exp.bullets || exp.description || '');
      textForAnalysis += ` ${exp.title || exp.role || ''} ${exp.company || ''} ${bulletsStr}`.toLowerCase();
    }
  });

  // 1. Hard Tech Skills Density (Max 30)
  const numSkills = skills.length;
  const skillsScore = Math.min(30, Math.round(numSkills * 3.75));

  // 2. Metrics & Lead Action Verbs (Max 25)
  const metricsMatches = textForAnalysis.match(/\b\d+(?:[\.,]\d+)?%?|[₹$]\d+|\b\d+\+\b|\b\d+x\b/g) || [];
  const metricsCount = metricsMatches.length;
  const foundVerbs = ACTION_VERBS.filter(v => textForAnalysis.includes(v));
  const verbCount = foundVerbs.length;

  const metricsScore = Math.min(15, Math.round(metricsCount * 3.0));
  const verbScore = Math.min(10, Math.round(verbCount * 2.0));
  const metricsAndVerbsScore = Math.round(metricsScore + verbScore);

  // 3. ATS Structure & Formatting (Max 20)
  let structureScore = 10;
  if (expList.length >= 1) structureScore += 5;
  if (eduList.length >= 1) structureScore += 3;
  if (domains.length >= 1) structureScore += 2;

  // 4. Professional Summary Quality (Max 15)
  let summaryScore = 0;
  if (summary.trim().split(/\s+/).length >= 15) summaryScore = 15;
  else if (summary.trim().length > 0) summaryScore = 8;

  // 5. Contact Information & PII (Max 10)
  let contactScore = 0;
  if (formData?.name && formData.name.toLowerCase() !== 'candidate' && formData.name.trim().length > 0) contactScore += 3;
  if (formData?.email && formData.email.includes('@')) contactScore += 3;
  if (formData?.phone && formData.phone.trim().length >= 5) contactScore += 2;
  if (formData?.city || formData?.country) contactScore += 2;

  const rawTotal = skillsScore + metricsAndVerbsScore + structureScore + summaryScore + contactScore;
  const totalScore = Math.min(99, Math.max(15, Math.round(rawTotal)));
  
  const tier = getTierConfig(totalScore);

  const recommendations = [];
  if (numSkills < 8) {
    recommendations.push(`Skill Coverage: Add ${8 - numSkills} more core technical skills to reach top ATS keyword density.`);
  }
  if (metricsCount < 3) {
    recommendations.push("Quantified Impact: Include at least 3 numerical metrics (e.g., 'Boosted API throughput by 40%', 'Managed $50K budget').");
  }
  if (verbCount < 4) {
    recommendations.push("Lead Action Verbs: Lead bullet points with strong verbs like Engineered, Architected, Spearheaded, or Scaled.");
  }
  if (summaryScore < 10) {
    recommendations.push("Professional Summary: Write a 2-3 sentence technical summary at the top of your resume.");
  }
  if (contactScore < 8) {
    recommendations.push("Contact Details: Add complete email and phone for automated candidate parsing.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Outstanding Profile! Your resume meets high-benchmark ATS standards.");
  }

  return {
    totalScore,
    tier,
    skillsScore,
    metricsAndVerbsScore,
    contactScore,
    structureScore,
    summaryScore,
    foundVerbs,
    metricsCount,
    recommendations
  };
}
