"""
skill_normalizer.py — Shared Skill Taxonomy & Normalization Engine
Provides a single canonical taxonomy used across resume parsing, job scraping,
and deterministic set-intersection matchmaking.
"""

import re
from typing import List, Set, Iterable, Dict, Any

SKILL_SYNONYMS: Dict[str, str] = {
    # JavaScript & Ecosystem
    "js": "javascript",
    "javascript": "javascript",
    "ecmascript": "javascript",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    "next": "next.js",
    "nextjs": "next.js",
    "next.js": "next.js",
    "next js": "next.js",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "node js": "node.js",
    "express": "express",
    "expressjs": "express",
    "express.js": "express",
    "ts": "typescript",
    "typescript": "typescript",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "vue.js": "vue.js",
    "angular": "angular",
    "angularjs": "angular",
    "tailwind": "tailwindcss",
    "tailwindcss": "tailwindcss",
    "html": "html",
    "html5": "html",
    "css": "css",
    "css3": "css",
    
    # Python & Data / ML / AI
    "py": "python",
    "python3": "python",
    "python": "python",
    "fastapi": "fastapi",
    "fast api": "fastapi",
    "django": "django",
    "flask": "flask",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "llm": "llms",
    "llms": "llms",
    "large language models": "llms",
    "langchain": "langchain",
    "pytorch": "pytorch",
    "tensorflow": "tensorflow",
    "scikit-learn": "scikit-learn",
    "pandas": "pandas",
    "numpy": "numpy",
    
    # Core Languages
    "golang": "go",
    "go": "go",
    "go lang": "go",
    "java": "java",
    "spring": "spring boot",
    "springboot": "spring boot",
    "spring boot": "spring boot",
    "c++": "c++",
    "cpp": "c++",
    "c#": "c#",
    "csharp": "c#",
    "ruby": "ruby",
    "rust": "rust",
    "php": "php",
    
    # Databases & Queues
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "psql": "postgresql",
    "postgres db": "postgresql",
    "mysql": "mysql",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "redis": "redis",
    "elasticsearch": "elasticsearch",
    "kafka": "kafka",
    "apache kafka": "kafka",
    "sql": "sql",

    # Cloud & DevOps Infrastructure
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "azure": "azure",
    "microsoft azure": "azure",
    "docker": "docker",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "terraform": "terraform",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "devops": "devops",
    "linux": "linux",
    "cloud infrastructure": "cloud infrastructure",

    # Architecture & Concepts
    "system design": "system design",
    "system architecture": "system design",
    "microservices": "microservices",
    "microservice architecture": "microservices",
    "distributed systems": "distributed systems",
    "rest": "rest api",
    "rest api": "rest api",
    "rest apis": "rest api",
    "restful api": "rest api",
    "graphql": "graphql",
    "graphql api": "graphql",
    "cyber security": "cyber security",
    "network security": "cyber security",
    "algorithms": "algorithms",
    "problem solving": "problem solving"
}

SKILL_DISPLAY_MAP: Dict[str, str] = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "react": "React",
    "react.js": "React.js",
    "next.js": "Next.js",
    "node.js": "Node.js",
    "express": "Express",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "tailwindcss": "TailwindCSS",
    "html": "HTML",
    "css": "CSS",
    "python": "Python",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "machine learning": "Machine Learning",
    "artificial intelligence": "Artificial Intelligence",
    "llms": "LLMs",
    "langchain": "LangChain",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "go": "Go",
    "java": "Java",
    "spring boot": "Spring Boot",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "rust": "Rust",
    "php": "PHP",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "kafka": "Kafka",
    "sql": "SQL",
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",
    "ci/cd": "CI/CD",
    "devops": "DevOps",
    "linux": "Linux",
    "system design": "System Design",
    "microservices": "Microservices",
    "distributed systems": "Distributed Systems",
    "rest api": "REST API",
    "graphql": "GraphQL",
    "cyber security": "Cyber Security",
    "algorithms": "Algorithms",
    "problem solving": "Problem Solving"
}

def format_skill_display(canonical: str) -> str:
    """Formats canonical skill string into clean display string."""
    if not canonical:
        return ""
    return SKILL_DISPLAY_MAP.get(canonical.lower(), canonical.capitalize())

def normalize_skill(raw: str) -> str:
    """
    Normalizes a single raw skill string into its canonical taxonomy representation.
    """
    if not raw or not isinstance(raw, str):
        return ""
    cleaned = raw.strip().lower()
    return SKILL_SYNONYMS.get(cleaned, cleaned)

def normalize_skill_list(raw_list: Iterable[str]) -> Set[str]:
    """
    Normalizes a list of skill strings into a set of canonical skills.
    """
    if not raw_list:
        return set()
    result = set()
    for s in raw_list:
        if s and isinstance(s, str):
            norm = normalize_skill(s)
            if norm:
                result.add(norm)
    return result

SHORT_AMBIGUOUS_SKILL_PATTERNS = {
    "go": [
        r"\bgolang\b",
        r"\bgo\s+(programming|language|developer|engineer|backend|coding|code)\b",
        r"\b(backend|software|systems?)\s+go\b",
        r"\bgo\s*,\s*(python|java|c\+\+|rust|docker|kubernetes|postgres|sql)\b",
        r"\b(python|java|c\+\+|rust|docker|kubernetes|postgres|sql)\s*,\s*go\b"
    ],
    "c": [
        r"\bc\s+(programming|language|code|developer|engineer)\b",
        r"\bc\s*/\s*c\+\+\b",
        r"\bc\+\+\s*/\s*c\b",
        r"\b(embedded|low-level|systems?)\s+c\b"
    ],
    "r": [
        r"\br\s+(programming|language|stats|statistics|analytics)\b",
        r"\br-project\b",
        r"\br\s*,\s*(python|spss|sas|stata)\b"
    ],
    "py": [
        r"\bpython\b", r"\bpy3\b", r"\bpython3\b"
    ],
    "js": [
        r"\bjavascript\b", r"\bjs\b\s*(developer|framework|library|code)"
    ],
    "ts": [
        r"\btypescript\b", r"\bts\b\s*(developer|framework|code)"
    ]
}

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extracts and normalizes skills found in job descriptions or resume text,
    returning display-formatted canonical skill names with strict context guards
    for short/ambiguous English words (e.g., 'go', 'c', 'r').
    """
    if not text:
        return []
    text_lower = text.lower()
    extracted = set()

    for raw_skill, canonical in SKILL_SYNONYMS.items():
        if raw_skill in SHORT_AMBIGUOUS_SKILL_PATTERNS:
            guards = SHORT_AMBIGUOUS_SKILL_PATTERNS[raw_skill]
            if any(re.search(g_pat, text_lower) for g_pat in guards):
                extracted.add(format_skill_display(canonical))
        else:
            pattern = r'\b' + re.escape(raw_skill) + r'\b'
            if re.search(pattern, text_lower):
                extracted.add(format_skill_display(canonical))
                
    return sorted(list(extracted))

def get_db_skill_normalization_stats(db_path: str = "nextoppr.db") -> Dict[str, Any]:
    """
    Analyzes all raw required_skills from jobs and skills from profiles in the database
    and returns metrics comparing unique raw strings before vs after normalization.
    """
    import os, sqlite3, json
    
    if not os.path.exists(db_path):
        return {
            "total_job_raw_entries": 0,
            "total_profile_raw_entries": 0,
            "unique_raw_skills": 0,
            "unique_canonical_skills": 0,
            "collapsed_count": 0
        }
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    raw_job_skills = []
    try:
        cursor.execute("SELECT required_skills FROM jobs WHERE required_skills IS NOT NULL")
        for row in cursor.fetchall():
            try:
                val = json.loads(row[0]) if isinstance(row[0], str) else row[0]
                if isinstance(val, list):
                    raw_job_skills.extend(val)
            except Exception:
                pass
    except Exception:
        pass

    raw_profile_skills = []
    try:
        cursor.execute("SELECT skills FROM profiles WHERE skills IS NOT NULL")
        for row in cursor.fetchall():
            try:
                val = json.loads(row[0]) if isinstance(row[0], str) else row[0]
                if isinstance(val, list):
                    raw_profile_skills.extend(val)
            except Exception:
                pass
    except Exception:
        pass
    finally:
        conn.close()

    all_raw = {s for s in raw_job_skills + raw_profile_skills if s and isinstance(s, str) and s.strip()}
    canonical_set = {normalize_skill(s) for s in all_raw}
    
    return {
        "total_job_raw_entries": len(raw_job_skills),
        "total_profile_raw_entries": len(raw_profile_skills),
        "unique_raw_skills": len(all_raw),
        "unique_canonical_skills": len(canonical_set),
        "collapsed_count": len(all_raw) - len(canonical_set)
    }

