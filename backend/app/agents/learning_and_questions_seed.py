import datetime
import logging
from sqlalchemy.orm import Session
from backend.app.db.models import (
    LearningResourceModel, InterviewQuestionBankModel, 
    CodingQuestionModel, ResumeTemplateModel
)

logger = logging.getLogger(__name__)

LEARNING_RESOURCES_SEED = [
    # Pitch & Introduction
    {
        "resource_id": "lr_pitch_01",
        "field": "sde",
        "category_topic": "pitch",
        "resource_type": "youtube_video",
        "title": "How to Introduce Yourself in a Tech Interview (Self-Pitch)",
        "url": "https://www.youtube.com/watch?v=0793vM1zV0c",
        "topic_tags": ["introduction", "elevator_pitch", "soft_skills"],
        "difficulty_level": "entry",
        "added_reason": "Widely recommended breakdown for structuring a 90-second developer self-pitch.",
        "verified_date": "2026-08-04"
    },
    # STAR Behavioral
    {
        "resource_id": "lr_star_01",
        "field": "sde",
        "category_topic": "behavioral",
        "resource_type": "youtube_video",
        "title": "Mastering the STAR Method for Engineering Interviews",
        "url": "https://www.youtube.com/watch?v=8Qx5c_s6nK8",
        "topic_tags": ["star_method", "behavioral", "leadership"],
        "difficulty_level": "mid",
        "added_reason": "Standard framework for answering Situation, Task, Action, and Result behavioral questions.",
        "verified_date": "2026-08-04"
    },
    # System Design Basics
    {
        "resource_id": "lr_sysdes_01",
        "field": "sde",
        "category_topic": "system_design",
        "resource_type": "youtube_video",
        "title": "System Design Basics & Scalability Concepts",
        "url": "https://www.youtube.com/watch?v=m8Icp_Cid5o",
        "topic_tags": ["system_design", "scalability", "load_balancing"],
        "difficulty_level": "mid",
        "added_reason": "Core primer covering caching, load balancers, database sharding, and message queues.",
        "verified_date": "2026-08-04"
    },
    # SDE Technical Prep
    {
        "resource_id": "lr_sde_dsa_01",
        "field": "sde",
        "category_topic": "technical",
        "resource_type": "youtube_playlist",
        "title": "Complete Data Structures & Algorithms Roadmap (Striver A2Z)",
        "url": "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QLW-m21cQ1x--0WnU0d",
        "topic_tags": ["dsa", "arrays", "trees", "graphs", "dp"],
        "difficulty_level": "entry",
        "added_reason": "Comprehensive problem-solving series covering essential coding patterns.",
        "verified_date": "2026-08-04"
    },
    # ML/AI Technical Prep
    {
        "resource_id": "lr_ml_01",
        "field": "ml_ai",
        "category_topic": "technical",
        "resource_type": "youtube_playlist",
        "title": "StatQuest: Machine Learning Essentials",
        "url": "https://www.youtube.com/playlist?list=PLblhQ241XXrCcOFs5yL7g86wVp634027P",
        "topic_tags": ["machine_learning", "neural_networks", "regression", "transformers"],
        "difficulty_level": "mid",
        "added_reason": "Intuitive visual explanations of ML algorithms, bias-variance, and model evaluation.",
        "verified_date": "2026-08-04"
    },
    # DevOps Technical Prep
    {
        "resource_id": "lr_devops_01",
        "field": "devops",
        "category_topic": "technical",
        "resource_type": "youtube_video",
        "title": "DevOps Roadmap: Docker, Kubernetes & CI/CD Pipelines",
        "url": "https://www.youtube.com/watch?v=X48VuDVv0do",
        "topic_tags": ["docker", "kubernetes", "cicd", "terraform"],
        "difficulty_level": "mid",
        "added_reason": "Full architectural overview of modern cloud infrastructure and deployment automation.",
        "verified_date": "2026-08-04"
    },
    # Data Engineering Prep
    {
        "resource_id": "lr_data_01",
        "field": "data",
        "category_topic": "technical",
        "resource_type": "youtube_playlist",
        "title": "SQL & Data Engineering Masterclass",
        "url": "https://www.youtube.com/playlist?list=PLUaB-1hjhk8FE_XZ87vPPSfHqb6OcM0cF",
        "topic_tags": ["sql", "etl", "data_warehousing", "spark"],
        "difficulty_level": "entry",
        "added_reason": "Practical hands-on guide to advanced SQL queries, indexing, and data pipelines.",
        "verified_date": "2026-08-04"
    },
    # QA & Test Automation Prep
    {
        "resource_id": "lr_qa_01",
        "field": "qa",
        "category_topic": "technical",
        "resource_type": "youtube_playlist",
        "title": "Software Testing & Test Automation Strategy",
        "url": "https://www.youtube.com/playlist?list=PLacgSNvFMEwhB__-p_hB3nZ6s7H2g13g5",
        "topic_tags": ["qa", "automation", "selenium", "cypress", "api_testing"],
        "difficulty_level": "entry",
        "added_reason": "Comprehensive walkthrough of test planning, automation frameworks, and integration testing.",
        "verified_date": "2026-08-04"
    },
    # Official Docs - FastAPI
    {
        "resource_id": "lr_doc_fastapi",
        "field": "backend",
        "category_topic": "technical",
        "resource_type": "doc_guide",
        "title": "FastAPI Official Documentation & Async Guide",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "topic_tags": ["python", "fastapi", "async", "rest_api"],
        "difficulty_level": "entry",
        "added_reason": "Official production guide for non-blocking Python backend architectures.",
        "verified_date": "2026-08-04"
    },
    # Official Docs - React
    {
        "resource_id": "lr_doc_react",
        "field": "frontend",
        "category_topic": "technical",
        "resource_type": "doc_guide",
        "title": "React Documentation (Hooks, State & Performance)",
        "url": "https://react.dev/learn",
        "topic_tags": ["react", "frontend", "state_management"],
        "difficulty_level": "entry",
        "added_reason": "Official reference for modern React hooks, rendering optimization, and concurrent features.",
        "verified_date": "2026-08-04"
    }
]

INTERVIEW_QUESTIONS_SEED = [
    # SDE Questions
    {
        "question_id": "iq_sde_01",
        "field": "sde",
        "question_type": "technical_conceptual",
        "question_text": "Explain the difference between Process and Thread, and how race conditions occur in multi-threaded programs.",
        "difficulty_level": "mid",
        "topic_tags": ["operating_systems", "concurrency", "threading"],
        "suggested_answer_approach": "1) Define Process (isolated memory space) vs Thread (shared memory within a process). 2) Describe overhead differences in context switching. 3) Explain race condition when two threads mutate shared memory without synchronization. 4) Mention mutexes, semaphores, and atomic operations as solutions."
    },
    {
        "question_id": "iq_sde_02",
        "field": "sde",
        "question_type": "technical_conceptual",
        "question_text": "What are the SOLID principles of Object-Oriented Design, and how do they improve codebase maintainability?",
        "difficulty_level": "mid",
        "topic_tags": ["oop", "clean_code", "solid_principles"],
        "suggested_answer_approach": "1) Define each letter: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. 2) Provide a short real-world code example for one (e.g. Dependency Inversion via Dependency Injection). 3) Explain how it prevents rigid/fragile software architectures."
    },

    # ML/AI Questions
    {
        "question_id": "iq_ml_01",
        "field": "ml_ai",
        "question_type": "technical_conceptual",
        "question_text": "Explain the Bias-Variance Tradeoff and how L1 (Lasso) vs L2 (Ridge) regularization address high variance.",
        "difficulty_level": "mid",
        "topic_tags": ["machine_learning", "regularization", "overfitting"],
        "suggested_answer_approach": "1) Define Bias (underfitting error) and Variance (overfitting error). 2) Explain L1 (adds absolute value penalty, forces weights to 0 for feature selection). 3) Explain L2 (adds squared penalty, shrinks weights smoothly). 4) State when to choose L1 vs L2 based on dataset sparsity."
    },
    {
        "question_id": "iq_ml_02",
        "field": "ml_ai",
        "question_type": "technical_conceptual",
        "question_text": "How does the Self-Attention mechanism work in Transformer models compared to traditional Recurrent Neural Networks (RNNs)?",
        "difficulty_level": "senior",
        "topic_tags": ["deep_learning", "transformers", "nlp"],
        "suggested_answer_approach": "1) Explain RNN sequential bottleneck vs Transformer parallel processing. 2) Detail Query, Key, Value (Q, K, V) matrix multiplications. 3) Explain Softmax(QK^T / sqrt(d_k)) * V formula. 4) Highlight positional encoding necessity due to loss of sequential order."
    },

    # DevOps Questions
    {
        "question_id": "iq_devops_01",
        "field": "devops",
        "question_type": "technical_conceptual",
        "question_text": "What is the difference between a Docker Container and a Virtual Machine (VM)? How do their isolation mechanisms differ?",
        "difficulty_level": "entry",
        "topic_tags": ["docker", "containers", "virtualization"],
        "suggested_answer_approach": "1) Explain VM hardware-level virtualization using Hypervisor + Guest OS. 2) Explain Container OS-level virtualization sharing host Linux kernel via namespaces and cgroups. 3) Contrast startup times (seconds vs minutes) and resource overhead."
    },

    # QA Questions
    {
        "question_id": "iq_qa_01",
        "field": "qa",
        "question_type": "technical_conceptual",
        "question_text": "Explain the Pyramid of Testing (Unit, Integration, End-to-End) and why E2E tests should represent the smallest percentage.",
        "difficulty_level": "entry",
        "topic_tags": ["qa", "testing_strategy", "automation"],
        "suggested_answer_approach": "1) Define Unit (fast, isolated), Integration (module communication), and E2E (user flow automation). 2) Explain trade-offs in execution speed, maintenance cost, and test flakiness. 3) Recommend 70% Unit, 20% Integration, 10% E2E ratio."
    },

    # Data Questions
    {
        "question_id": "iq_data_01",
        "field": "data",
        "question_type": "technical_conceptual",
        "question_text": "Compare Data Warehouse (ETL) vs Data Lake (ELT). When would you choose one over the other?",
        "difficulty_level": "mid",
        "topic_tags": ["data_engineering", "etl", "data_warehouse"],
        "suggested_answer_approach": "1) Define Data Warehouse (structured schema-on-write, SQL optimized) vs Data Lake (raw schema-on-read, handles unstructured data). 2) Explain ETL (transform before load) vs ELT (load raw into cloud storage then transform via Spark/dbt). 3) Give practical usage scenarios for each."
    }
]

CODING_QUESTIONS_SEED = [
    # SDE Coding
    {
        "question_id": "cq_sde_01",
        "field": "sde",
        "difficulty": "easy",
        "title": "Two Sum Target Pair",
        "topic_tags": ["arrays", "hash_map"],
        "question_text": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        "constraints": "1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one valid answer exists.",
        "example_input_output": [
            {"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]", "explanation": "nums[0] + nums[1] == 9, so return [0, 1]."}
        ],
        "hint_progression": [
            "Hint 1: A brute-force nested loop takes O(N^2) time. Can you use extra space to achieve O(N)?",
            "Hint 2: As you iterate through `nums`, for each number `x`, you need to check if `target - x` has already been seen.",
            "Hint 3: Use a Hash Map to store `{ number: index }`. In one pass, check if `target - num` exists in the map."
        ],
        "explanation_of_approach": "Approach: Single-Pass Hash Map\n1. Initialize an empty hash map `seen = {}`.\n2. Loop through `nums` with index `i` and value `num`.\n3. Compute `complement = target - num`.\n4. If `complement` in `seen`, return `[seen[complement], i]`.\n5. Otherwise, store `seen[num] = i`.\n\nTime Complexity: O(N)\nSpace Complexity: O(N)"
    },
    {
        "question_id": "cq_sde_02",
        "field": "sde",
        "difficulty": "medium",
        "title": "LRU Cache Implementation",
        "topic_tags": ["data_structures", "hash_map", "doubly_linked_list"],
        "question_text": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache supporting `get(key)` and `put(key, value)` in O(1) time complexity.",
        "constraints": "Capacity >= 1. Both get and put must operate in O(1) average time complexity.",
        "example_input_output": [
            {"input": "LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);", "output": "get(1)->1, get(2)->-1 (evicted)", "explanation": "Key 2 was evicted because key 1 was recently accessed."}
        ],
        "hint_progression": [
            "Hint 1: A hash map gives O(1) lookup, but how do you track access order in O(1)?",
            "Hint 2: Combining a Hash Map with a Doubly Linked List allows O(1) removal and O(1) insertion at head.",
            "Hint 3: Map stores `{ key: Node }`. The head of the list represents Most Recently Used (MRU), tail represents LRU."
        ],
        "explanation_of_approach": "Approach: Hash Map + Doubly Linked List\n1. Create dummy `head` and `tail` nodes to simplify edge removals.\n2. Hash map maps `key -> Node(key, val)`.\n3. On `get(key)`: If exists, move node to head and return val. Else return -1.\n4. On `put(key, val)`: If exists, update val and move to head. If new and capacity exceeded, remove node at `tail.prev` and delete from map.\n\nTime Complexity: O(1) for both operations\nSpace Complexity: O(Capacity)"
    },

    # ML/AI Coding
    {
        "question_id": "cq_ml_01",
        "field": "ml_ai",
        "difficulty": "easy",
        "title": "Compute Confusion Matrix & F1-Score",
        "topic_tags": ["metrics", "python", "data_science"],
        "question_text": "Write a Python function `compute_metrics(y_true, y_pred)` that calculates True Positives, False Positives, False Negatives, Precision, Recall, and F1-Score without using scikit-learn.",
        "constraints": "y_true and y_pred are binary lists of equal length consisting of 0s and 1s.",
        "example_input_output": [
            {"input": "y_true = [1, 0, 1, 1, 0, 1], y_pred = [1, 0, 1, 0, 0, 1]", "output": "Precision: 1.0, Recall: 0.75, F1: 0.857", "explanation": "TP=3, FP=0, FN=1"}
        ],
        "hint_progression": [
            "Hint 1: Count TP (y_true=1 and y_pred=1), FP (y_true=0 and y_pred=1), FN (y_true=1 and y_pred=0).",
            "Hint 2: Precision = TP / (TP + FP). Recall = TP / (TP + FN). Handle division by zero gracefully.",
            "Hint 3: F1-Score = 2 * (Precision * Recall) / (Precision + Recall)."
        ],
        "explanation_of_approach": "Approach: Direct Mathematical Counting\n1. Iterate paired elements `(t, p)` in `zip(y_true, y_pred)`.\n2. Increment TP, FP, FN counters.\n3. Compute Precision = TP / (TP + FP) if (TP + FP) > 0 else 0.0.\n4. Compute Recall = TP / (TP + FN) if (TP + FN) > 0 else 0.0.\n5. Compute F1 = 2 * P * R / (P + R) if (P + R) > 0 else 0.0.\n\nTime Complexity: O(N)\nSpace Complexity: O(1)"
    },

    # DevOps Coding / Scripting
    {
        "question_id": "cq_devops_01",
        "field": "devops",
        "difficulty": "easy",
        "title": "Log IP Frequency Analyzer",
        "topic_tags": ["python", "string_parsing", "hash_map"],
        "question_text": "Write a function `top_ip_addresses(log_lines, k)` that parses Nginx web log lines and returns the top K IP addresses making requests.",
        "constraints": "Log format contains IP as the first whitespace-separated token.",
        "example_input_output": [
            {"input": "log_lines = ['192.168.1.1 - - [04/Aug...] GET /', '10.0.0.1 - - GET /', '192.168.1.1 - - POST /login'], k = 1", "output": "['192.168.1.1']", "explanation": "192.168.1.1 made 2 requests."}
        ],
        "hint_progression": [
            "Hint 1: Split each log line by whitespace to extract line.split()[0] as the IP address.",
            "Hint 2: Use `collections.Counter` or a hash map to aggregate IP counts.",
            "Hint 3: Use `counter.most_common(k)` to retrieve top K IPs sorted by count."
        ],
        "explanation_of_approach": "Approach: Hash Map Frequency Counting\n1. Parse the first token of each non-empty string line.\n2. Increment count in `collections.Counter`.\n3. Return `[ip for ip, count in counter.most_common(k)]`.\n\nTime Complexity: O(N + M log K) where N = number of log lines\nSpace Complexity: O(Unique IPs)"
    }
]

RESUME_TEMPLATES_SEED = [
    {
        "template_id": "tpl_sde_entry",
        "name": "SDE Entry-Level (MNC Pattern)",
        "category": "mnc_pattern",
        "target_role": "SDE",
        "template_source_pattern": "Reverse-chronological, single-column, ATS-safe format prioritizing top technical skills and quantified engineering project impact for entry-level candidates.",
        "structure_json": {
            "font_family": "Calibri, Arial, sans-serif",
            "section_order": ["summary", "skills", "projects", "experience", "education"],
            "ats_compatibility_rating": "99%"
        }
    },
    {
        "template_id": "tpl_sde_senior",
        "name": "SDE Mid/Senior Architect (MNC Pattern)",
        "category": "mnc_pattern",
        "target_role": "SDE",
        "template_source_pattern": "Single-column format emphasizing system design leadership, action-verb bullet points, latency/throughput metrics, and microservice achievements.",
        "structure_json": {
            "font_family": "Arial, Helvetica, sans-serif",
            "section_order": ["summary", "experience", "skills", "projects", "education"],
            "ats_compatibility_rating": "98%"
        }
    },
    {
        "template_id": "tpl_ml_specialist",
        "name": "ML / Data Science Specialist (MNC Pattern)",
        "category": "mnc_pattern",
        "target_role": "ML",
        "template_source_pattern": "ATS-friendly structure highlighting ML model deployment, dataset scale, evaluation metrics (F1/AUC), PyTorch/TensorFlow stack, and research publications.",
        "structure_json": {
            "font_family": "Times New Roman, Georgia, serif",
            "section_order": ["summary", "skills", "experience", "projects", "education"],
            "ats_compatibility_rating": "97%"
        }
    },
    {
        "template_id": "tpl_devops_infra",
        "name": "DevOps & Cloud Infra Engineer (MNC Pattern)",
        "category": "mnc_pattern",
        "target_role": "DevOps",
        "template_source_pattern": "Clean single-column template focusing on Kubernetes, Terraform, AWS infrastructure uptime, CI/CD deployment frequency, and security compliance.",
        "structure_json": {
            "font_family": "Segoe UI, Roboto, sans-serif",
            "section_order": ["summary", "skills", "experience", "projects", "education"],
            "ats_compatibility_rating": "99%"
        }
    }
]


def seed_learning_resources_and_questions(db: Session):
    """
    Populates database with initial verified learning resources, interview questions,
    coding questions, and MNC resume templates.
    """
    # 1. Seed Learning Resources
    for lr in LEARNING_RESOURCES_SEED:
        existing = db.query(LearningResourceModel).filter(LearningResourceModel.resource_id == lr["resource_id"]).first()
        if not existing:
            db.add(LearningResourceModel(**lr))

    # 2. Seed Interview Questions
    for iq in INTERVIEW_QUESTIONS_SEED:
        existing = db.query(InterviewQuestionBankModel).filter(InterviewQuestionBankModel.question_id == iq["question_id"]).first()
        if not existing:
            db.add(InterviewQuestionBankModel(**iq))

    # 3. Seed Coding Questions
    for cq in CODING_QUESTIONS_SEED:
        existing = db.query(CodingQuestionModel).filter(CodingQuestionModel.question_id == cq["question_id"]).first()
        if not existing:
            db.add(CodingQuestionModel(**cq))

    # 4. Seed Resume Templates
    for tpl in RESUME_TEMPLATES_SEED:
        existing = db.query(ResumeTemplateModel).filter(ResumeTemplateModel.template_id == tpl["template_id"]).first()
        if not existing:
            db.add(ResumeTemplateModel(**tpl))

    db.commit()
    logger.info("Successfully seeded CS/Tech learning resources, questions, and MNC templates.")
