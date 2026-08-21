/**
 * resumeTemplates.js - Pure Configuration Model for Resume & ATS Studio
 * Defines 11 distinctive templates, including official templates extracted from /resume-templates:
 * - Doc 10: Corporate HR & Leadership
 * - Doc 5: Clinical Practitioner & Two-Column Sidebar
 * - Doc 6: Legal & Paralegal Split Grid
 * - Doc 7: GAAP Accounting & Finance
 * - Doc 8: UI/UX & Product Design Split Banner
 * - Doc 9: Ivy League / FAANG Tech Software Engineer
 * - Modern Tech
 * - Classic Serif
 * - Minimalist Clean
 * - Executive Leadership
 * - ATS-Safe Enterprise
 */

export const RESUME_TEMPLATES = {
  // --- 🌟 OFFICIAL IMPORTED TEMPLATES FROM /resume-templates ---
  doc9_tech: {
    id: 'doc9_tech',
    label: 'Ivy League / FAANG Tech (Doc 9)',
    badge: 'SDE / Big Tech',
    badgeColor: '#2563eb',
    description: 'Clean centered header, Education-first, Project impact metrics, and categorical skills.',
    fontFamily: "'Inter', -apple-system, sans-serif",
    headingFont: "'Inter', -apple-system, sans-serif",
    accentColor: '#1e293b',
    secondaryColor: '#475569',
    headingStyle: 'uppercase-underline',
    defaultSectionOrder: ['education', 'experience', 'projects', 'skills'],
    layout: 'single-column',
    density: 'compact',
    headerAlignment: 'center',
    headerBorder: 'none',
    sectionBorder: '1px solid #cbd5e1',
    skillFormat: 'inline-bullet',
    sampleData: {
      name: "Aditya Sharma",
      email: "aditya.sharma@example.com",
      phone: "+91 98765 43210",
      city: "Bengaluru",
      country: "India",
      summary: "Full Stack Engineer with 3+ years of experience building distributed microservices, low-latency REST APIs, and responsive web applications.",
      skills: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "AWS", "Redis", "Kafka", "Git"],
      experience_list: [
        {
          title: "Senior Full Stack Engineer",
          company: "Unicorn Scaleup",
          location: "Bengaluru, India",
          duration: "2023 - Present",
          description: "Architected real-time event streaming pipeline processing 12M+ events daily with 99.98% uptime. Optimized SQL queries, cutting p99 query latency by 42% across core database clusters."
        },
        {
          title: "Software Engineer",
          company: "CloudTech Solutions",
          location: "Hyderabad, India",
          duration: "2021 - 2023",
          description: "Built scalable backend services using Python FastAPI and React frontend dashboards. Mentored 4 junior engineers in test-driven development and CI/CD best practices."
        }
      ],
      education: [
        {
          degree: "Bachelor of Technology",
          field: "Computer Science & Engineering",
          institution: "National Institute of Technology",
          year: "2021"
        }
      ],
      projects: [
        {
          title: "Distributed Task Scheduler",
          description: "Engineered a fault-tolerant async worker queue handling 50k jobs/sec with Redis and Go."
        }
      ]
    }
  },

  doc10_corporate: {
    id: 'doc10_corporate',
    label: 'Corporate HR & Leadership (Doc 10)',
    badge: 'Executive / HR',
    badgeColor: '#4f46e5',
    description: 'Spaced uppercase headers (O B J E C T I V E, E X P E R I E N C E), pipe header, leadership callouts.',
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFont: "'Inter', system-ui, sans-serif",
    accentColor: '#312e81',
    secondaryColor: '#475569',
    headingStyle: 'spaced-caps',
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills', 'projects'],
    layout: 'single-column',
    density: 'comfortable',
    headerAlignment: 'left',
    headerBorder: '1px solid #e2e8f0',
    sectionBorder: '1px solid #cbd5e1',
    skillFormat: 'chips',
    sampleData: {
      name: "CALEB FOSTER",
      email: "caleb.foster@example.com",
      phone: "+91 98111 22334",
      city: "Mumbai",
      country: "India",
      summary: "Results-driven Chief People Officer & Engineering HR Director with 8+ years leading talent acquisition, organizational design, and engineering retention across high-growth startups.",
      skills: ["Talent Acquisition", "HR Operations", "Compensation Design", "Performance Management", "Leadership Coaching", "DPDP Compliance"],
      experience_list: [
        {
          title: "Chief Human Resources Officer",
          company: "Olson Harris Ltd.",
          location: "Mumbai, India",
          duration: "Feb 2021 - Present",
          description: "Spearheaded organizational scaling from 120 to 650+ tech employees. Implemented structured retention strategies that reduced voluntary engineering attrition by 28%."
        },
        {
          title: "Supervisor - Human Resources",
          company: "Olson Harris Ltd.",
          location: "Pune, India",
          duration: "Jul 2018 - Jan 2021",
          description: "Led the technical talent hiring team, closing 180+ niche SDE & ML requisitions within an average turnaround of 22 days."
        }
      ],
      education: [
        {
          degree: "MBA in Human Resources",
          field: "Organizational Leadership",
          institution: "Symbiosis Institute of Management",
          year: "2018"
        }
      ],
      projects: []
    }
  },

  doc5_clinical: {
    id: 'doc5_clinical',
    label: 'Clinical & Sidebar Pro (Doc 5)',
    badge: 'Medical / Healthcare',
    badgeColor: '#0d9488',
    description: 'Modern two-column layout: Left sidebar for Contact, Skills & Education; Right for Summary & Experience.',
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFont: "'Inter', system-ui, sans-serif",
    accentColor: '#0f766e',
    secondaryColor: '#334155',
    sidebarBg: '#f0fdfa',
    headingStyle: 'plain-caps',
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills'],
    layout: 'two-column-sidebar',
    density: 'comfortable',
    headerAlignment: 'left',
    headerBorder: '3px solid #0d9488',
    sectionBorder: '1px solid #ccfbf1',
    skillFormat: 'bullet-list',
    sampleData: {
      name: "DR. KAI CARTER",
      email: "kai.carter@healthcare.org",
      phone: "+91 98444 55667",
      city: "Bengaluru",
      country: "India",
      summary: "Experienced and compassionate Medical Consultant & HealthTech Specialist dedicated to patient care excellence, telemedicine workflows, and clinical data systems.",
      skills: ["Clinical Diagnosis", "Patient Care", "Chronic Disease Management", "Electronic Health Records", "Telemedicine Systems", "Medical Research"],
      experience_list: [
        {
          title: "Senior Medical Consultant",
          company: "Lamna Healthcare",
          location: "Bengaluru, India",
          duration: "2020 - Present",
          description: "Implemented evidence-based clinical protocols and digital health diagnostics, delivering care to over 1,500 patients annually."
        },
        {
          title: "Resident Medical Officer",
          company: "City Hospital",
          location: "New Delhi, India",
          duration: "2017 - 2020",
          description: "Provided emergency critical care and coordinated multidisciplinary specialist consultations to improve patient recovery outcomes."
        }
      ],
      education: [
        {
          degree: "Doctor of Medicine (MD)",
          field: "Internal Medicine",
          institution: "All India Institute of Medical Sciences (AIIMS)",
          year: "2017"
        }
      ],
      projects: []
    }
  },

  doc6_legal: {
    id: 'doc6_legal',
    label: 'Legal & Paralegal Grid (Doc 6)',
    badge: 'Legal / Corporate',
    badgeColor: '#1e3a8a',
    description: 'Career objective callout block + 2-column side-by-side Experience vs Education & Skills.',
    fontFamily: "Georgia, 'Times New Roman', serif",
    headingFont: "'Inter', sans-serif",
    accentColor: '#1e3a8a',
    secondaryColor: '#334155',
    headingStyle: 'serif-bold',
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills', 'projects'],
    layout: 'two-column-grid',
    density: 'comfortable',
    headerAlignment: 'left',
    headerBorder: '2px solid #1e3a8a',
    sectionBorder: '1px solid #e2e8f0',
    skillFormat: 'bullet-list',
    sampleData: {
      name: "ROBIN ZUPANC",
      email: "robin.zupanc@legalservices.com",
      phone: "+91 99000 11223",
      city: "New Delhi",
      country: "India",
      summary: "Detail-oriented Corporate Paralegal & Legal Compliance Specialist with expertise in contract lifecycle management, regulatory filings, and DPDP data compliance.",
      skills: ["Contract Management", "Due Diligence", "Legal Research", "Corporate Governance", "Litigation Support", "Regulatory Filings"],
      experience_list: [
        {
          title: "Senior Corporate Paralegal",
          company: "Aegis Legal & Partners",
          location: "New Delhi, India",
          duration: "2021 - Present",
          description: "Drafted, reviewed, and negotiated 400+ commercial vendor contracts and non-disclosure agreements with zero non-compliance penalties."
        },
        {
          title: "Legal Associate",
          company: "Trey Legal Advisory",
          location: "Gurugram, India",
          duration: "2019 - 2021",
          description: "Prepared detailed legal research memorandums and managed corporate documentation for cross-border M&A transactions."
        }
      ],
      education: [
        {
          degree: "Bachelor of Laws (LL.B)",
          field: "Corporate Law",
          institution: "National Law School of India University",
          year: "2019"
        }
      ],
      projects: []
    }
  },

  doc7_finance: {
    id: 'doc7_finance',
    label: 'GAAP Accounting & Finance (Doc 7)',
    badge: 'Finance / Audit',
    badgeColor: '#334155',
    description: 'Two-line bold header, detailed GAAP summary block, underlined section dividers with crisp sub-roles.',
    fontFamily: "Georgia, 'Times New Roman', serif",
    headingFont: "Georgia, serif",
    accentColor: '#0f172a',
    secondaryColor: '#334155',
    headingStyle: 'uppercase-underline',
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills'],
    layout: 'single-column',
    density: 'comfortable',
    headerAlignment: 'left',
    headerBorder: '2px solid #0f172a',
    sectionBorder: '1px solid #cbd5e1',
    skillFormat: 'chips',
    sampleData: {
      name: "LIANE CORMIER",
      email: "liane.cormier@financepro.com",
      phone: "+91 97777 88990",
      city: "Mumbai",
      country: "India",
      summary: "Analytical, organized, and detail-oriented Senior Accountant with GAAP/IFRS expertise and 6+ years managing financial forecasting, tax filings, and ledger audits.",
      skills: ["GAAP & IFRS Standards", "Financial Modeling", "Corporate Tax Planning", "SAP ERP", "Cashflow Analysis", "Audit & Risk Management"],
      experience_list: [
        {
          title: "Senior Financial Accountant",
          company: "Trey Research Capital",
          location: "Mumbai, India",
          duration: "2021 - Present",
          description: "Oversaw quarterly financial reconciliations and prepared GAAP-compliant financial statements for ₹180Cr annual revenue enterprise."
        },
        {
          title: "Corporate Bookkeeper & Analyst",
          company: "Bandter Real Estate",
          location: "Pune, India",
          duration: "2018 - 2021",
          description: "Streamlined vendor invoicing and accounts payable processes, saving 15 hours per monthly close cycle."
        }
      ],
      education: [
        {
          degree: "Chartered Accountant (CA) & B.Com",
          field: "Accounting & Finance",
          institution: "Institute of Chartered Accountants of India (ICAI)",
          year: "2018"
        }
      ],
      projects: []
    }
  },

  doc8_creative: {
    id: 'doc8_creative',
    label: 'UI/UX & Product Design (Doc 8)',
    badge: 'Design / Product',
    badgeColor: '#ec4899',
    description: 'Left dark accent banner for Objective & Skills, Right hero profile with project impact bullet points.',
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFont: "'Inter', system-ui, sans-serif",
    accentColor: '#db2777',
    secondaryColor: '#475569',
    sidebarBg: '#fdf2f8',
    headingStyle: 'plain-caps',
    defaultSectionOrder: ['summary', 'experience', 'projects', 'education', 'skills'],
    layout: 'banner-split',
    density: 'comfortable',
    headerAlignment: 'left',
    headerBorder: '3px solid #ec4899',
    sectionBorder: '1px solid #fce7f3',
    skillFormat: 'chips',
    sampleData: {
      name: "JORDAN MITCHELL",
      email: "jordan.mitchell@designstudio.io",
      phone: "+91 96666 77889",
      city: "Bengaluru",
      country: "India",
      summary: "Passionate Lead UI/UX & Product Designer dedicated to crafting intuitive, delightful digital interfaces, design systems, and mobile experiences.",
      skills: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "Interaction Design", "Usability Testing", "React Basics"],
      experience_list: [
        {
          title: "Lead Product Designer",
          company: "Proseware FinTech",
          location: "Bengaluru, India",
          duration: "2021 - Present",
          description: "Spearheaded the redesign of the core checkout flow, driving a 25% increase in conversion rate across 2M+ active monthly users."
        },
        {
          title: "UI/UX Designer",
          company: "Relecloud Mobile",
          location: "Hyderabad, India",
          duration: "2019 - 2021",
          description: "Built and maintained comprehensive cross-platform Figma design system adopted by 14 frontend engineering squads."
        }
      ],
      education: [
        {
          degree: "Bachelor of Design (B.Des)",
          field: "Interaction & Industrial Design",
          institution: "National Institute of Design (NID)",
          year: "2019"
        }
      ],
      projects: [
        {
          title: "NeoBank Mobile App Design",
          description: "End-to-end UX architecture for personal finance management with 4.8-star App Store rating."
        }
      ]
    }
  },

  // --- 🌟 CLASSIC & CORE SUITE ---
  modern: {
    id: 'modern',
    label: 'Modern Tech',
    badge: 'Popular',
    badgeColor: '#6366f1',
    description: 'Clean sans-serif design with vibrant indigo accents and crisp dividers.',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    headingFont: "'Inter', system-ui, -apple-system, sans-serif",
    accentColor: '#6366f1',
    secondaryColor: '#475569',
    headingStyle: 'uppercase-underline',
    defaultSectionOrder: ['summary', 'skills', 'experience', 'education', 'projects'],
    layout: 'single-column',
    density: 'comfortable',
    headerAlignment: 'left',
    headerBorder: '2px solid #6366f1',
    sectionBorder: '1px solid #e2e8f0',
    skillFormat: 'chips'
  },
  classic: {
    id: 'classic',
    label: 'Classic Serif',
    badge: 'Academic / Law',
    badgeColor: '#0f172a',
    description: 'Timeless Georgia serif typography with traditional horizontal rules.',
    fontFamily: "Georgia, 'Times New Roman', serif",
    headingFont: "'Inter', system-ui, -apple-system, sans-serif",
    accentColor: '#0f172a',
    secondaryColor: '#334155',
    headingStyle: 'uppercase-underline',
    defaultSectionOrder: ['summary', 'experience', 'education', 'skills', 'projects'],
    layout: 'single-column',
    density: 'comfortable',
    headerAlignment: 'center',
    headerBorder: '2px solid #0f172a',
    sectionBorder: '1px solid #cbd5e1',
    skillFormat: 'bullet-list'
  },
  minimal: {
    id: 'minimal',
    label: 'Minimalist Clean',
    badge: 'Modern UI',
    badgeColor: '#475569',
    description: 'Ultra-clean layout with compact spacing and subtle slate accents.',
    fontFamily: "'Inter', -apple-system, sans-serif",
    headingFont: "'Inter', -apple-system, sans-serif",
    accentColor: '#334155',
    secondaryColor: '#64748b',
    headingStyle: 'plain-caps',
    defaultSectionOrder: ['summary', 'experience', 'skills', 'education', 'projects'],
    layout: 'single-column',
    density: 'compact',
    headerAlignment: 'left',
    headerBorder: 'none',
    sectionBorder: '1px solid #f1f5f9',
    skillFormat: 'inline-bullet'
  },
  executive: {
    id: 'executive',
    label: 'Executive Leadership',
    badge: 'Senior Roles',
    badgeColor: '#7c2d12',
    description: 'Authoritative serif layout with warm burgundy accents and elegant borders.',
    fontFamily: "Georgia, serif",
    headingFont: "Georgia, serif",
    accentColor: '#7c2d12',
    secondaryColor: '#451a03',
    headingStyle: 'bordered',
    defaultSectionOrder: ['summary', 'experience', 'skills', 'education', 'projects'],
    layout: 'single-column',
    density: 'spacious',
    headerAlignment: 'center',
    headerBorder: '3px double #7c2d12',
    sectionBorder: '1px solid #fed7aa',
    skillFormat: 'chips'
  },
  ats_safe: {
    id: 'ats_safe',
    label: 'ATS-Safe Enterprise',
    badge: 'Workday & Taleo Certified',
    badgeColor: '#059669',
    description: 'Strict monochrome Arial layout with zero graphics — highest parsing success for enterprise ATS.',
    fontFamily: "Arial, Helvetica, sans-serif",
    headingFont: "Arial, Helvetica, sans-serif",
    accentColor: '#000000',
    secondaryColor: '#000000',
    headingStyle: 'plain-caps',
    defaultSectionOrder: ['summary', 'skills', 'experience', 'education', 'projects'],
    layout: 'single-column',
    density: 'compact',
    noColor: true,
    headerAlignment: 'left',
    headerBorder: '1px solid #000000',
    sectionBorder: '1px solid #000000',
    skillFormat: 'inline-bullet'
  }
};

export const TEMPLATE_LIST = Object.values(RESUME_TEMPLATES);

export const DENSITY_STYLES = {
  compact: {
    pagePadding: '24px 20px',
    sectionGap: '10px',
    itemGap: '6px',
    lineHeight: '1.35',
    baseFontSize: '0.78rem',
    titleSize: '1.45rem',
    headingSize: '0.82rem'
  },
  comfortable: {
    pagePadding: '32px 28px',
    sectionGap: '16px',
    itemGap: '10px',
    lineHeight: '1.5',
    baseFontSize: '0.84rem',
    titleSize: '1.75rem',
    headingSize: '0.9rem'
  },
  spacious: {
    pagePadding: '38px 34px',
    sectionGap: '20px',
    itemGap: '14px',
    lineHeight: '1.6',
    baseFontSize: '0.88rem',
    titleSize: '1.9rem',
    headingSize: '0.95rem'
  }
};
