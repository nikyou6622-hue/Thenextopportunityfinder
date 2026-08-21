/**
 * 100 Interview Questions: Behavioral, Company-Style, and CS Fundamentals
 * with Verified Model Answers, STAR Framework Breakdowns, and Key Recruiter Insights.
 */

export const ORAL_INTERVIEW_CATEGORIES = [
  { id: 'universal_hr', label: 'A. Universal HR / Behavioral (25)', count: 25, color: '#6366f1' },
  { id: 'big_tech', label: 'B. Big Tech / Product Style (25)', count: 25, color: '#38bdf8' },
  { id: 'it_services', label: 'C. Indian IT Services & Consulting (25)', count: 25, color: '#10b981' },
  { id: 'cs_fundamentals', label: 'D. CS Fundamentals & Concepts (25)', count: 25, color: '#f59e0b' }
];

export const ORAL_INTERVIEW_QUESTIONS = [
  // ==========================================
  // SECTION A: UNIVERSAL HR / BEHAVIORAL (25)
  // ==========================================
  {
    id: 'a1',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 1,
    question: 'Tell me about yourself.',
    tags: ['HR Round', 'Universal', 'Opening'],
    recruiterObjective: 'Testing communication conciseness, career trajectory narrative, and relevance to the open role. Should take 60-90 seconds.',
    modelAnswer: `I'm a Full Stack Software Engineer with strong foundations in React, Python, and distributed backend architectures. Over the past few years, I've built scalable web applications, designed high-throughput RESTful APIs, and optimized database queries that improved page load speeds by 40%. Recently, I've focused on integrating AI capabilities into developer workflows and adhering to modern data privacy standards like the DPDP Act. I'm excited about this role because your team's mission aligns with my passion for building high-impact, user-centric systems.`,
    starStructure: {
      situation: 'Present: Full Stack developer with focus on modern frontend & high-concurrency APIs.',
      task: 'Past: Built responsive applications, reduced latency, led architecture enhancements.',
      action: 'Skills: React, FastAPI, SQL/NoSQL, automated CI/CD, and system design.',
      result: 'Future: Bringing scalability expertise to accelerate product delivery in this team.'
    },
    keyPoints: [
      'Use the Present-Past-Future formula (60-90 seconds max).',
      'Mention 1-2 quantified metrics (e.g. 40% latency reduction).',
      'Tie your narrative directly to why you want this specific role.'
    ],
    pitfalls: 'Do not recite your entire high school and college bio chronologically.'
  },
  {
    id: 'a2',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 2,
    question: 'Walk me through your resume.',
    tags: ['HR Round', 'Resume Walkthrough'],
    recruiterObjective: 'Looking for a cohesive story, intentional career choices, and major milestones.',
    modelAnswer: `Starting with my technical foundation in Computer Science, I prioritized real-world software engineering early on. In my previous role, I spearheaded the frontend migration to React 18, which reduced our bundle size by 35% and increased Lighthouse performance to 98. On the backend, I built asynchronous microservices in FastAPI with PostgreSQL pooling. My resume highlights my progressive ownership from writing clean components to architecting full pipelines and mentoring teammates.`,
    starStructure: {
      situation: 'Computer science foundation + hands-on engineering.',
      task: 'Spearheading migrations and API architectures.',
      action: 'Delivered measurable performance and reliability gains.',
      result: 'Ready for senior engineering ownership.'
    },
    keyPoints: ['Highlight career progression', 'Quantify impact with numbers', 'Explain the "why" behind transitions'],
    pitfalls: 'Reading bullets word-for-word from the resume.'
  },
  {
    id: 'a3',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 3,
    question: 'Why do you want to work here?',
    tags: ['Culture', 'Company Fit'],
    recruiterObjective: 'Testing whether you researched the company and have genuine alignment with their product/culture.',
    modelAnswer: `I've been following your engineering team's work on low-latency data pipelines and developer tools. What resonates with me is your focus on engineering velocity and customer-first architecture. Given my experience building modular full-stack systems with FastAPI and React, I know I can contribute immediately to your product roadmap while learning from your experienced engineering leaders.`,
    starStructure: {
      situation: 'Company reputation in high-scale tech.',
      task: 'Opportunity to contribute to their real challenges.',
      action: 'Leveraging my full-stack and API experience.',
      result: 'Mutual growth and immediate productivity.'
    },
    keyPoints: ['Mention specific products, blogs, or tech stack details', 'Connect their problems to your strengths'],
    pitfalls: 'Saying "I just need a job" or giving a generic canned praise.'
  },
  {
    id: 'a4',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 4,
    question: 'Why should we hire you?',
    tags: ['Value Proposition'],
    recruiterObjective: 'Testing your unique value proposition and confidence in solving their specific bottlenecks.',
    modelAnswer: `You should hire me because I bridge the gap between technical rigor and rapid execution. I don't just write clean, tested code—I obsess over user experience, system latency, and maintainability. When our API suffered under peak load in my previous project, I diagnosed the query bottleneck and implemented Redis caching within 24 hours, restoring 99.9% uptime. I will bring that same proactive ownership and problem-solving to your team.`,
    starStructure: {
      situation: 'High standards for engineering quality and execution speed.',
      task: 'Solve critical user and architecture problems proactively.',
      action: 'Demonstrated track record of debugging and shipping.',
      result: 'High velocity and immediate positive ROI for the team.'
    },
    keyPoints: ['Focus on ROI and problem-solving velocity', 'Provide concrete proof of past ownership'],
    pitfalls: 'Sounding arrogant or claiming to know everything without proof.'
  },
  {
    id: 'a5',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 5,
    question: 'What are your strengths?',
    tags: ['Self-Awareness'],
    recruiterObjective: 'Assessing genuine core competencies backed by real work examples.',
    modelAnswer: `My greatest strength is deep problem-solving under ambiguity combined with strong cross-functional communication. In my last project, when the product requirements for our data ingestion service were still shifting, I created modular interface contracts that allowed the frontend and backend to develop in parallel without blocking each other. This reduced sprint turnaround by 30%.`,
    starStructure: {
      situation: 'Navigating ambiguous requirements.',
      task: 'Keep engineering moving without architectural regressions.',
      action: 'Designed decoupled interface contracts.',
      result: '30% reduction in delivery cycle time.'
    },
    keyPoints: ['State 2-3 tangible technical strengths', 'Back up with a short STAR mini-story'],
    pitfalls: 'Listing 10 adjectives without any supporting evidence.'
  },
  {
    id: 'a6',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 6,
    question: 'What are your weaknesses?',
    tags: ['Self-Awareness', 'Growth Mindset'],
    recruiterObjective: 'Testing honesty, humility, and active remediation steps.',
    modelAnswer: `In the past, I tended to over-engineer solutions upfront by trying to anticipate edge cases that were months away. While it ensured robustness, it sometimes slowed down early prototype validation. To improve, I adopted the "Build for Today, Architect for Tomorrow" philosophy—shipping MVPs quickly to gather real user metrics before investing in heavy abstractions.`,
    starStructure: {
      situation: 'Tendency toward premature optimization.',
      task: 'Balance thoroughness with delivery speed.',
      action: 'Adopted metric-driven MVP iteration cycles.',
      result: 'Faster shipping speed with cleaner, purposeful refactors.'
    },
    keyPoints: ['Pick a real professional weakness', 'Focus 70% of the answer on the concrete steps you take to overcome it'],
    pitfalls: 'Saying "I am a perfectionist" or "I work too hard".'
  },
  {
    id: 'a7',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 7,
    question: 'Where do you see yourself in 5 years?',
    tags: ['Ambition', 'Retention'],
    recruiterObjective: 'Checking career ambition, stability, and whether the role supports your trajectory.',
    modelAnswer: `In 5 years, I see myself as a Senior Staff Engineer or Technical Lead who drives major architectural decisions and mentors upcoming engineers. I want to build deep domain expertise in distributed systems and AI integration while continuing to champion clean code, automated testing, and developer productivity across the organization.`,
    starStructure: {
      situation: 'Long-term commitment to engineering craft.',
      task: 'Evolve from individual contributor to high-impact technical leader.',
      action: 'Deepen architecture skills and mentor junior talent.',
      result: 'Driving major platform initiatives that scale.'
    },
    keyPoints: ['Demonstrate commitment to continuous learning', 'Show desire to mentor and elevate others'],
    pitfalls: 'Saying you want the interviewer’s job or plan to leave for an MBA in 1 year.'
  },
  {
    id: 'a8',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 8,
    question: 'Why this field / why are you leaving your current role?',
    tags: ['Motivation'],
    recruiterObjective: 'Assessing professional motivations without badmouthing past employers.',
    modelAnswer: `I love software engineering because of the instant feedback loop—translating complex logical ideas into software that empowers thousands of users daily. I am seeking this transition because I've mastered my current scope and am eager to tackle larger scale, higher concurrency challenges and deeper architectural problems that your team is actively solving.`,
    starStructure: {
      situation: 'Thriving in software engineering problem-solving.',
      task: 'Seek greater scale and technical scope.',
      action: 'Targeting companies solving complex distributed problems.',
      result: 'Ready to contribute at a higher level.'
    },
    keyPoints: ['Stay 100% positive about past experiences', 'Frame transition in terms of seeking growth, scale, and new challenges'],
    pitfalls: 'Complaining about past managers, pay, or toxic team members.'
  },
  {
    id: 'a9',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 9,
    question: 'Describe a time you faced a conflict with a teammate and how you resolved it.',
    tags: ['STAR Method', 'Collaboration'],
    recruiterObjective: 'Testing emotional intelligence, professional disagreement handling, and data-driven alignment.',
    modelAnswer: `During an API redesign, a senior backend engineer and I disagreed on whether to use GraphQL or REST with pagination. Instead of debating subjectively, I suggested running a 2-day benchmark using our top 3 client query patterns. We measured payload size, caching feasibility, and latency. The data clearly showed REST with HTTP caching cut bandwidth by 45% for mobile users. We both aligned on REST and shipped ahead of schedule.`,
    starStructure: {
      situation: 'Disagreement on GraphQL vs REST API architecture.',
      task: 'Find the optimal engineering choice without stalling the sprint.',
      action: 'Constructed an objective 2-day benchmark testing real payload patterns.',
      result: 'Data resolved the dispute; REST delivered 45% lower mobile bandwidth.'
    },
    keyPoints: ['Use objective data to resolve technical opinions', 'Focus on shared team goals over personal ego'],
    pitfalls: 'Describing personal animosity or saying you just gave in without discussion.'
  },
  {
    id: 'a10',
    category: 'universal_hr',
    section: 'A. Universal HR / Behavioral',
    questionNumber: 10,
    question: 'Describe a time you failed. What did you learn?',
    tags: ['STAR Method', 'Accountability'],
    recruiterObjective: 'Looking for accountability, root-cause analysis, and post-mortem improvements.',
    modelAnswer: `Early in my career, I pushed a database migration script that didn't include an index on a foreign key in production, causing response times to spike during peak morning traffic. I immediately owned the issue, coordinated with our DevOps lead to apply a concurrent index, and restored normal latency in 15 minutes. To prevent recurrence, I added an automated linter in our CI pipeline that flags unindexed foreign keys in PRs.`,
    starStructure: {
      situation: 'Unindexed migration caused latency spike.',
      task: 'Remediate immediately and safeguard against future occurrences.',
      action: 'Owned mistake, resolved within 15 min, built automated CI linter.',
      result: 'Zero recurrence of migration performance issues across 40+ subsequent releases.'
    },
    keyPoints: ['Own the mistake without blaming others', 'Highlight the permanent automated guardrail you built'],
    pitfalls: 'Claiming you have never failed or making up a trivial non-failure.'
  },

  // ==========================================
  // SECTION B: BIG TECH / PRODUCT STYLE (25)
  // ==========================================
  {
    id: 'b1',
    category: 'big_tech',
    section: 'B. Big Tech / Product Style',
    questionNumber: 1,
    question: '(Amazon-style) Tell me about a time you went above and beyond for a customer.',
    tags: ['Customer Obsession', 'Amazon LP'],
    recruiterObjective: 'Evaluating Amazon LP: Customer Obsession — working backwards from customer pain points.',
    modelAnswer: `When several enterprise customers reported intermittent timeouts while exporting large CSV analytics reports, the standard backlog timeline was two sprints away. Knowing this impacted their end-of-month executive reporting, I investigated after hours and discovered that synchronous in-memory file generation was choking worker processes. I converted the workflow into an asynchronous background job with presigned S3 URLs and progress polling. Customers got their reports 10x faster with 0 timeouts.`,
    starStructure: {
      situation: 'Customers experiencing timeout errors on report exports.',
      task: 'Prevent customer disruption during month-end closes.',
      action: 'Architected async worker queue with S3 presigned downloads.',
      result: '10x faster export delivery and 100% customer satisfaction rating.'
    },
    keyPoints: ['Identify the customer impact clearly', 'Show initiative to fix the root cause rather than applying a temporary band-aid'],
    pitfalls: 'Focusing solely on the code without mentioning the customer outcome.'
  },
  {
    id: 'b2',
    category: 'big_tech',
    section: 'B. Big Tech / Product Style',
    questionNumber: 2,
    question: '(Amazon-style) Describe a time you took ownership of a problem outside your direct responsibility.',
    tags: ['Ownership', 'Amazon LP'],
    recruiterObjective: 'Evaluating Amazon LP: Ownership — thinking long term and never saying "that\'s not my job".',
    modelAnswer: `While working on frontend features, I noticed our team’s automated test suite took over 45 minutes to run in CI, causing significant developer bottlenecks. Even though CI infrastructure was managed by DevOps, I spent a weekend profiling the pipeline, implemented parallelized test sharding in Docker, and cached npm dependencies. This dropped CI runtime from 45 minutes to 9 minutes, saving the entire engineering team roughly 50 engineering hours every sprint.`,
    starStructure: {
      situation: '45-minute CI build pipeline stalling developer momentum.',
      task: 'Accelerate the deployment loop for the whole organization.',
      action: 'Profiled pipeline, implemented test sharding and Docker caching.',
      result: 'Reduced build time by 80% (9 minutes), saving 50 engineering hours/sprint.'
    },
    keyPoints: ['Demonstrate proactivity beyond job description', 'Quantify time or money saved for the team'],
    pitfalls: 'Taking credit for work done entirely by another team.'
  },
  {
    id: 'b3',
    category: 'big_tech',
    section: 'B. Big Tech / Product Style',
    questionNumber: 3,
    question: '(Amazon-style) Tell me about a time you made a decision with incomplete information.',
    tags: ['Bias for Action', 'Amazon LP'],
    recruiterObjective: 'Evaluating Amazon LP: Bias for Action — two-way door vs one-way door decision making.',
    modelAnswer: `During an unexpected surge in user traffic, our main PostgreSQL database CPU hit 92%. We had incomplete telemetry on which specific endpoint was causing the surge. Recognizing this was a reversible, two-way door decision, I immediately implemented a 60-second read-through TTL cache on our top 3 read-heavy public endpoints. This immediately dropped DB CPU load to 45%, giving us the breathing room to properly analyze query logs without user downtime.`,
    starStructure: {
      situation: 'Database CPU crisis during traffic spike with incomplete logs.',
      task: 'Mitigate risk of complete service outage immediately.',
      action: 'Implemented reversible 60s read cache on top endpoints.',
      result: 'CPU dropped from 92% to 45%; service stayed 100% available.'
    },
    keyPoints: ['Distinguish between two-way (reversible) and one-way decisions', 'Show calculated risk management'],
    pitfalls: 'Paralysis by analysis while production is burning.'
  },
  {
    id: 'b4',
    category: 'big_tech',
    section: 'B. Big Tech / Product Style',
    questionNumber: 4,
    question: '(Google-style) Tell me about a time you had to influence someone without direct authority.',
    tags: ['Googleyness', 'Influence'],
    recruiterObjective: 'Testing persuasion via data, empathy, and constructive communication.',
    modelAnswer: `I wanted our engineering team to adopt TypeScript for a new micro-frontend to eliminate runtime type errors. Since I wasn't the team lead, I didn't mandate it. Instead, I built a prototype module in TypeScript, integrated strict linting, and demonstrated that it caught 12 edge-case bugs at compile time that had previously escaped into QA. Seeing the concrete developer experience and reduction in bug tickets, the tech lead approved the standard team-wide.`,
    starStructure: {
      situation: 'Team skeptical about migrating codebase to TypeScript.',
      task: 'Build consensus on type safety without managerial authority.',
      action: 'Built working proof-of-concept proving 12 bugs caught in compile step.',
      result: 'Team unanimously adopted TypeScript; bug reports dropped 28% next quarter.'
    },
    keyPoints: ['Influence via prototypes and hard data', 'Respect peer concerns and listen to friction points'],
    pitfalls: 'Trying to push decisions through politics or complaining to superiors.'
  },
  {
    id: 'b5',
    category: 'big_tech',
    section: 'B. Big Tech / Product Style',
    questionNumber: 5,
    question: '(Microsoft-style) Tell me about a growth-mindset moment — learning from failure.',
    tags: ['Growth Mindset', 'Microsoft Style'],
    recruiterObjective: 'Assessing Satya Nadella’s core Microsoft philosophy: Learn-it-all vs Know-it-all.',
    modelAnswer: `When transitioning to async Python with FastAPI, I initially wrote database queries using synchronous blocking libraries, thinking it wouldn't impact performance at moderate scale. Under load testing, thread starvation caused latency to climb to 4 seconds. Rather than being defensive, I recognized my knowledge gap, dove deep into the asyncio event loop and connection pooling with asyncpg, and rewritten the data access layer. Throughput increased by 600%.`,
    starStructure: {
      situation: 'Underestimated async event loop constraints in early architecture.',
      task: 'Identify root cause of thread starvation and re-skill.',
      action: 'Mastered non-blocking IO and restructured code with asyncpg.',
      result: '600% throughput increase; conducted knowledge-share session for team.'
    },
    keyPoints: ['Embrace knowledge gaps openly', 'Transform mistakes into team-wide learning assets'],
    pitfalls: 'Blaming the language or framework instead of personal learning curve.'
  },

  // ==========================================
  // SECTION C: INDIAN IT SERVICES & CONSULTING (25)
  // ==========================================
  {
    id: 'c1',
    category: 'it_services',
    section: 'C. Indian IT Services & Consulting',
    questionNumber: 1,
    question: 'What is OOP? Explain its four pillars with real examples.',
    tags: ['TCS NQT', 'Infosys', 'OOP Pillars'],
    recruiterObjective: 'Testing foundational Computer Science concepts required for campus/off-campus hiring.',
    modelAnswer: `Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' containing data and methods. Its 4 core pillars are:
1. Encapsulation: Bundling data and methods inside a single class and restricting direct access via access modifiers (e.g. private fields with getters/setters in a BankAccount class).
2. Abstraction: Hiding internal implementation details and exposing only essential interfaces (e.g. driving a car by using accelerator/brake without knowing internal combustion mechanics).
3. Inheritance: Reusing properties and behaviors from a parent class in a child class (e.g. ElectricCar extending Vehicle).
4. Polymorphism: Performing a single action in different ways—either through Method Overloading (compile-time) or Method Overriding (runtime).`,
    starStructure: {
      situation: 'Foundational CS concept test.',
      task: 'Deliver crisp definitions with memorable real-world examples.',
      action: 'Structured response across Encapsulation, Abstraction, Inheritance, Polymorphism.',
      result: 'Demonstrates rock-solid software engineering foundations.'
    },
    keyPoints: ['Define all 4 pillars clearly', 'Provide short, everyday real-world examples for each'],
    pitfalls: 'Confusing Abstraction (hiding complexity) with Encapsulation (data hiding).'
  },
  {
    id: 'c2',
    category: 'it_services',
    section: 'C. Indian IT Services & Consulting',
    questionNumber: 2,
    question: "What's the difference between a process and a thread?",
    tags: ['Operating Systems', 'TCS', 'Wipro'],
    recruiterObjective: 'Assessing OS concurrency memory model understanding.',
    modelAnswer: `A Process is an independent program in execution with its own dedicated memory space (code, data, heap, stack). A Thread is the smallest unit of CPU execution within a process, often called a lightweight process.
Key differences:
1. Memory Sharing: Threads within the same process share heap memory and code, whereas processes have isolated memory address spaces.
2. Creation & Context Switch Cost: Creating and switching between threads is significantly faster with lower CPU overhead compared to processes.
3. Crash Impact: If one thread crashes due to a segmentation fault, it can crash the entire parent process. If one process crashes, other processes remain unaffected.`,
    starStructure: {
      situation: 'OS fundamentals question.',
      task: 'Compare memory isolation, context switching overhead, and IPC.',
      action: 'Highlighted memory sharing, overhead, and crash isolation.',
      result: 'Accurate and comprehensive response.'
    },
    keyPoints: ['Process = separate address space, Thread = shared address space', 'Discuss context-switch overhead and failure isolation'],
    pitfalls: 'Saying threads do not have their own stack (each thread has its own call stack and program counter).'
  },
  {
    id: 'c3',
    category: 'it_services',
    section: 'C. Indian IT Services & Consulting',
    questionNumber: 3,
    question: 'What is normalization in DBMS? Explain with an example.',
    tags: ['DBMS', 'SQL', 'Normalization'],
    recruiterObjective: 'Testing database schema design and data integrity knowledge.',
    modelAnswer: `Normalization is the systematic process of organizing data in a relational database to minimize data redundancy and prevent insertion, update, and deletion anomalies.
Key Normal Forms:
• 1NF (First Normal Form): Every column contains atomic (indivisible) values and each record is unique.
• 2NF (Second Normal Form): Table is in 1NF and contains no Partial Dependency (all non-key attributes must depend on the whole primary key).
• 3NF (Third Normal Form): Table is in 2NF and contains no Transitive Dependency (non-key attributes must not depend on other non-key attributes).
Example: If an Employee table stores DepartmentName alongside DepartmentID, updating the dept name requires changing multiple rows. Normalizing it into separate Employee and Department tables linked by Foreign Key resolves the anomaly.`,
    starStructure: {
      situation: 'Relational database integrity test.',
      task: 'Define 1NF, 2NF, 3NF and demonstrate with concrete schema example.',
      action: 'Explained atomicity, partial dependencies, and transitive dependencies.',
      result: 'Clear articulation of clean database design.'
    },
    keyPoints: ['Explain anomalies (Insert, Update, Delete)', 'Give concise definition of 1NF, 2NF, and 3NF'],
    pitfalls: 'Failing to mention why normalization is needed (anomalies and redundancy).'
  },
  {
    id: 'c4',
    category: 'it_services',
    section: 'C. Indian IT Services & Consulting',
    questionNumber: 4,
    question: 'What are the ACID properties in a database?',
    tags: ['DBMS', 'Transactions', 'ACID'],
    recruiterObjective: 'Testing database transaction safety fundamentals.',
    modelAnswer: `ACID properties ensure that database transactions are processed reliably:
• Atomicity: 'All or nothing'. If any operation within a transaction fails, the entire transaction is rolled back (e.g. transferring money between accounts).
• Consistency: A transaction must transition the database from one valid state to another, maintaining all integrity constraints and foreign keys.
• Isolation: Concurrent transactions execute independently without interfering with each other (managed via isolation levels like Read Committed or Serializable).
• Durability: Once a transaction commits, its changes are permanently written to non-volatile storage, even in the event of a server crash or power failure.`,
    starStructure: {
      situation: 'Database reliability concept question.',
      task: 'Define Atomicity, Consistency, Isolation, Durability with money transfer example.',
      action: 'Delivered structured breakdown with real-world banking scenario.',
      result: 'Demonstrates deep understanding of transaction guarantees.'
    },
    keyPoints: ['Use the classic bank transfer example (debit + credit)', 'Mention commit logs for Durability and locks for Isolation'],
    pitfalls: 'Mumbling through definitions without practical examples.'
  },
  {
    id: 'c5',
    category: 'it_services',
    section: 'C. Indian IT Services & Consulting',
    questionNumber: 5,
    question: 'Explain the difference between HTTP and HTTPS.',
    tags: ['Computer Networks', 'Security', 'Protocols'],
    recruiterObjective: 'Testing basic network protocol and encryption knowledge.',
    modelAnswer: `HTTP (Hypertext Transfer Protocol) transmits data across the web in plaintext over port 80. Anyone intercepting the network packets can read the data (vulnerable to Man-in-the-Middle attacks).
HTTPS (HTTP Secure) runs HTTP over an encrypted TLS/SSL connection on port 443. It provides:
1. Encryption: Encrypts data in transit using asymmetric encryption during the TLS handshake and symmetric encryption for session data.
2. Authentication: Verifies server identity via trusted Digital Certificates (issued by Certificate Authorities).
3. Data Integrity: Uses hashing algorithms (HMAC) to ensure packets are not tampered with during transmission.`,
    starStructure: {
      situation: 'Web networking and security question.',
      task: 'Compare ports, encryption, and TLS handshake mechanism.',
      action: 'Highlighted plaintext vs TLS encryption, ports (80 vs 443), and certificates.',
      result: 'Clear and secure networking explanation.'
    },
    keyPoints: ['Mention ports: Port 80 (HTTP) vs Port 443 (HTTPS)', 'Explain the 3 pillars: Encryption, Authentication, Integrity'],
    pitfalls: 'Saying HTTPS only protects passwords rather than the entire session payload.'
  },

  // ==========================================
  // SECTION D: CS FUNDAMENTALS (25)
  // ==========================================
  {
    id: 'd1',
    category: 'cs_fundamentals',
    section: 'D. CS Fundamentals & Concepts',
    questionNumber: 1,
    question: "What's the difference between an array and a linked list?",
    tags: ['Data Structures', 'Memory', 'Big-O'],
    recruiterObjective: 'Testing low-level memory allocation and algorithmic trade-offs.',
    modelAnswer: `Arrays store elements in contiguous memory blocks, allowing O(1) random access by index. However, insertions and deletions at arbitrary positions take O(n) because subsequent elements must be shifted, and resizing a static array requires allocating a new block.
Linked Lists store elements (nodes) non-contiguously in memory, where each node contains data and a pointer to the next node. Insertions and deletions at known pointer locations take O(1) time without shifting. However, access by index requires O(n) sequential traversal, and they require extra memory overhead for storing pointers.`,
    starStructure: {
      situation: 'Fundamental data structure comparison.',
      task: 'Compare memory layout, lookup time, insertion/deletion cost, and cache locality.',
      action: 'Compared contiguous memory vs pointer nodes and Big-O trade-offs.',
      result: 'Accurate technical answer highlighting CPU cache locality.'
    },
    keyPoints: ['Array = contiguous memory + O(1) lookup + cache-friendly', 'Linked list = dynamic pointers + O(1) insertion at pointer + O(n) search'],
    pitfalls: 'Forgetting to mention CPU cache locality (arrays benefit from CPU pre-fetching).'
  },
  {
    id: 'd2',
    category: 'cs_fundamentals',
    section: 'D. CS Fundamentals & Concepts',
    questionNumber: 2,
    question: 'Explain how a hash map works internally.',
    tags: ['Data Structures', 'Hashing', 'Collisions'],
    recruiterObjective: 'Testing hash functions, bucket indexing, collision resolution, and load factor.',
    modelAnswer: `A Hash Map stores key-value pairs using an underlying array of buckets.
1. Hashing & Indexing: When a key is inserted, a hash function converts the key into an integer, which is mapped to a bucket index using modulo operator: index = hash(key) % array_length.
2. Collision Resolution: When two distinct keys hash to the same bucket index, collisions are resolved via:
   • Chaining: Storing colliding nodes in a linked list or self-balancing BST (e.g. Red-Black Tree in Java 8+).
   • Open Addressing: Probing for the next open slot (Linear, Quadratic, or Double Hashing).
3. Resizing & Load Factor: When the ratio of stored items to bucket count exceeds the Load Factor (typically 0.75), the array capacity doubles and all items are rehashed to maintain O(1) average time complexity.`,
    starStructure: {
      situation: 'Core data structure internal mechanics.',
      task: 'Explain hash functions, collision handling, and dynamic resizing.',
      action: 'Detailed hashing step, chaining vs open addressing, and load factor resizing.',
      result: 'Proves deep internal mastery of standard library data structures.'
    },
    keyPoints: ['Explain hash(key) % capacity indexing', 'Discuss Chaining vs Open Addressing', 'Mention Load Factor (0.75) and rehashing'],
    pitfalls: 'Saying HashMaps are always O(1) without mentioning worst-case O(n) when all keys collide.'
  },
  {
    id: 'd3',
    category: 'cs_fundamentals',
    section: 'D. CS Fundamentals & Concepts',
    questionNumber: 3,
    question: 'What is dynamic programming, and when would you use it over plain recursion?',
    tags: ['Algorithms', 'DP', 'Optimization'],
    recruiterObjective: 'Checking dynamic programming prerequisites: optimal substructure and overlapping subproblems.',
    modelAnswer: `Dynamic Programming (DP) is an algorithmic optimization technique that solves complex problems by breaking them down into simpler subproblems, solving each subproblem once, and storing their solutions to avoid redundant computations.
You use DP when a problem satisfies two conditions:
1. Overlapping Subproblems: The same subproblems are computed repeatedly (e.g. in naive Fibonacci recursion, fib(3) is recomputed multiple times).
2. Optimal Substructure: The optimal solution to the global problem can be constructed from the optimal solutions of its subproblems.
Approaches:
• Top-Down with Memoization: Recursion with cache.
• Bottom-Up Tabulation: Iteratively filling a DP table.`,
    starStructure: {
      situation: 'Algorithmic efficiency evaluation.',
      task: 'Define DP conditions and compare against plain exponential recursion.',
      action: 'Identified Overlapping Subproblems and Optimal Substructure.',
      result: 'Reduces time complexity from exponential O(2^n) to polynomial O(n).'
    },
    keyPoints: ['Define 2 mandatory conditions: Overlapping Subproblems & Optimal Substructure', 'Explain Top-Down (Memoization) vs Bottom-Up (Tabulation)'],
    pitfalls: 'Trying to use DP for problems without overlapping subproblems (e.g. Merge Sort uses Divide & Conquer, not DP).'
  },
  {
    id: 'd4',
    category: 'cs_fundamentals',
    section: 'D. CS Fundamentals & Concepts',
    questionNumber: 4,
    question: "What's the difference between synchronous and asynchronous programming?",
    tags: ['Concurrency', 'Async/Await', 'Event Loop'],
    recruiterObjective: 'Testing non-blocking IO and modern application concurrency models.',
    modelAnswer: `Synchronous programming executes operations sequentially; the execution thread blocks and waits for an operation (like database query or network request) to finish before moving to the next line of code.
Asynchronous programming allows non-blocking execution; when a slow I/O task is initiated, the thread delegates the operation to the operating system / event loop and continues executing other tasks. When the I/O completes, a callback, Promise, or async/await handler resumes the task.
Key benefit: Asynchronous architectures (e.g. Node.js, FastAPI with asyncio) can handle tens of thousands of concurrent client connections with minimal threads and memory footprint.`,
    starStructure: {
      situation: 'Modern backend & frontend runtime architecture.',
      task: 'Compare thread blocking vs event-driven non-blocking I/O.',
      action: 'Explained thread blocking vs event loop delegation.',
      result: 'Clear explanation of high-concurrency architectures.'
    },
    keyPoints: ['Blocking vs non-blocking I/O', 'Event loop & Promises/async-await', 'Concurrency at scale with fewer threads'],
    pitfalls: 'Equating asynchronous with multithreading (Node.js is single-threaded async).'
  },
  {
    id: 'd5',
    category: 'cs_fundamentals',
    section: 'D. CS Fundamentals & Concepts',
    questionNumber: 5,
    question: "What's the difference between authentication and authorization?",
    tags: ['Security', 'Auth', 'Web Architecture'],
    recruiterObjective: 'Assessing web security and access control fundamentals.',
    modelAnswer: `Authentication (AuthN) verifies WHO you are (Identity verification).
Authorization (AuthZ) verifies WHAT you are allowed to do (Permission & Access Control).
Example:
• Authentication: When you enter your username and password or authenticate with Google OAuth2, the server verifies your credentials and issues a JWT token.
• Authorization: When you attempt to delete a user account, the server inspects your JWT role claims (e.g. 'Admin' vs 'Guest') to determine whether you have permissions to perform that action.
Authentication always precedes authorization.`,
    starStructure: {
      situation: 'Web security architecture question.',
      task: 'Differentiate identity verification from permission management.',
      action: 'Explained AuthN (who you are) vs AuthZ (permissions) with JWT token example.',
      result: 'Precise and accurate security response.'
    },
    keyPoints: ['AuthN = Who you are (Login / Biometrics / Tokens)', 'AuthZ = What you can access (RBAC / Roles / Permissions)'],
    pitfalls: 'Using the terms interchangeably.'
  }
];
