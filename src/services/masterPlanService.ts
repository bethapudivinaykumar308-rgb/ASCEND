import { MasterCareerPlan, CareerDomain } from '../types';

export const MASTER_CAREER_PLANS: MasterCareerPlan[] = [
  {
    id: 'master-py-dev',
    roleKey: 'python_developer',
    title: 'Python Developer',
    description: 'Master backend software engineering, algorithms, databases, API design, and production architecture using Python.',
    targetAudience: 'Software developers, computer science students, and career transitioners targeting backend roles.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 8,
    domains: [
      {
        id: 'dom-py-foundations',
        title: 'Python Fundamentals & Core Semantics',
        description: 'Execution models, memory mechanics, data types, control structures, and standard libraries.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-py-dsa',
        title: 'Data Structures & Algorithms',
        description: 'Time/space complexity, trees, stacks, hash tables, and search strategies.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-py-oop-db',
        title: 'OOP & Relational Databases',
        description: 'Dunder protocols, design patterns, SQL schemas, queries, and ACID transactions.',
        order: 3,
        levelIds: [3, 4],
      },
      {
        id: 'dom-py-systems',
        title: 'Git/GitHub & Production Engineering',
        description: 'Rebasing, asynchronous FastAPI services, Docker microservices, and testing.',
        order: 4,
        levelIds: [5, 6],
      },
      {
        id: 'dom-py-interviews',
        title: 'Interview Preparation & Assessments',
        description: 'System design trade-offs, behavioral STAR alignment, and technical mock screening.',
        order: 5,
        levelIds: [7, 8],
      },
    ],
  },
  {
    id: 'master-java-dev',
    roleKey: 'java_developer',
    title: 'Java Developer',
    description: 'Master enterprise backend engineering, Spring Boot microservices, multithreading, and distributed systems.',
    targetAudience: 'Engineers targeting enterprise software development, banking/fintech, and large-scale backend systems.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 8,
    domains: [
      {
        id: 'dom-java-foundations',
        title: 'Java Core & JVM Mechanics',
        description: 'JVM bytecode execution, memory layout, garbage collection, and language syntax.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-java-dsa',
        title: 'Collections & Concurrency',
        description: 'Java Collections Framework, multi-threading, synchronization, and executor services.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-java-oop',
        title: 'Object-Oriented Design & Patterns',
        description: 'SOLID principles, Gang of Four design patterns, and modular architecture.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-java-spring',
        title: 'Spring Boot & RESTful APIs',
        description: 'Dependency injection, Spring Data JPA, Hibernate, security, and OpenAPI documentation.',
        order: 4,
        levelIds: [4, 5],
      },
      {
        id: 'dom-java-systems',
        title: 'Microservices & Enterprise Projects',
        description: 'Kafka messaging, Docker containerization, cloud deployment, and integration testing.',
        order: 5,
        levelIds: [6],
      },
      {
        id: 'dom-java-interview',
        title: 'Enterprise Technical Interview & Mocks',
        description: 'Low-level design (LLD), concurrency corner-cases, and behavioral assessments.',
        order: 6,
        levelIds: [7, 8],
      },
    ],
  },
  {
    id: 'master-aiml-eng',
    roleKey: 'aiml_engineer',
    title: 'AI / Machine Learning Engineer',
    description: 'Transform mathematical models into production intelligence pipelines with PyTorch, Scikit-Learn, and MLOps.',
    targetAudience: 'Engineers and quantitative analysts looking to build generative and predictive AI applications.',
    typicalDurationMonths: 8,
    defaultLevelsCount: 6,
    domains: [
      {
        id: 'dom-ai-math',
        title: 'Applied Mathematics & Vectorization',
        description: 'Linear algebra, multivariate calculus, probability distributions, and NumPy strides.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-ai-ml',
        title: 'Classical Machine Learning',
        description: 'Regression, classification, decision trees, ensembles, and hyperparameter tuning.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-ai-dl',
        title: 'Deep Learning & Neural Architectures',
        description: 'Backpropagation, PyTorch tensors, CNNs, and Transformer self-attention.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-ai-llm',
        title: 'Modern Generative AI & NLP',
        description: 'Embeddings, vector stores, RAG architectures, prompt pipelines, and fine-tuning.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-ai-mlops',
        title: 'MLOps & Inference Serving',
        description: 'Containerized model deployment, quantization, latency monitoring, and model drift.',
        order: 5,
        levelIds: [5],
      },
      {
        id: 'dom-ai-capstone',
        title: 'AI Systems Portfolio & Interviews',
        description: 'End-to-end production AI deployment, latency benchmarks, and research interviews.',
        order: 6,
        levelIds: [6],
      },
    ],
  },
  {
    id: 'master-data-sci',
    roleKey: 'data_scientist',
    title: 'Data Scientist',
    description: 'Extract statistical insights, build predictive models, and guide executive decision-making with data.',
    targetAudience: 'Analytical thinkers, statistics students, and researchers entering modern industry analytics.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 6,
    domains: [
      {
        id: 'dom-ds-wrangling',
        title: 'Data Wrangling & Relational Queries',
        description: 'Pandas dataframes, PostgreSQL window functions, and data cleansing pipelines.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-ds-eda',
        title: 'Statistical Inference & EDA',
        description: 'Hypothesis testing, A/B experiment design, and visualization storytelling.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-ds-modeling',
        title: 'Applied Predictive Modeling',
        description: 'Supervised regression, classification, feature engineering, and cross-validation.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-ds-adv-ml',
        title: 'Advanced Machine Learning & Ensembles',
        description: 'XGBoost, clustering, dimensionality reduction (PCA), and time-series forecasting.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-ds-business',
        title: 'Decision Intelligence & Business Metrics',
        description: 'Translating business problems into statistical metrics and executive dashboards.',
        order: 5,
        levelIds: [5],
      },
      {
        id: 'dom-ds-capstone',
        title: 'Data Science Capstone & Screening',
        description: 'Empirical industry case study presentation and data technical screening.',
        order: 6,
        levelIds: [6],
      },
    ],
  },
  {
    id: 'master-data-analyst',
    roleKey: 'data_analyst',
    title: 'Data Analyst',
    description: 'Transform raw datasets into actionable business intelligence using Advanced SQL, Tableau/PowerBI, and Python.',
    targetAudience: 'Learners seeking high-demand business and operations data analytics roles.',
    typicalDurationMonths: 4,
    defaultLevelsCount: 5,
    domains: [
      {
        id: 'dom-da-excel-stats',
        title: 'Analytical Foundations & Business Math',
        description: 'KPI formulation, descriptive statistics, and exploratory analysis.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-da-sql',
        title: 'Advanced SQL for Analytics',
        description: 'Complex joins, window functions, CTEs, aggregation rollups, and subqueries.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-da-bi',
        title: 'BI Tools & Interactive Dashboards',
        description: 'PowerBI, Tableau, data modeling, DAX measures, and visual storytelling.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-da-python',
        title: 'Python for Data Automation',
        description: 'Pandas, Matplotlib/Seaborn, data cleaning, and automated reporting.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-da-case-studies',
        title: 'Business Case Studies & Screening',
        description: 'Real-world business case defense, executive presentation, and SQL live rounds.',
        order: 5,
        levelIds: [5],
      },
    ],
  },
  {
    id: 'master-web-dev',
    roleKey: 'web_developer',
    title: 'Web Developer (Full Stack)',
    description: 'Design responsive frontend interfaces and high-throughput backend services from browser to database.',
    targetAudience: 'Aspiring full-stack engineers building modern web applications.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 6,
    domains: [
      {
        id: 'dom-web-ui',
        title: 'Modern Frontend Architecture',
        description: 'TypeScript, DOM manipulation, responsive layouts, and accessible component trees.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-web-frameworks',
        title: 'React & Client State Systems',
        description: 'Hooks, virtual DOM reconciliation, component patterns, and cache queries.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-web-backend',
        title: 'Server APIs & Microservices',
        description: 'Node.js/Express, authentication, middleware, and rate-limiting.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-web-db',
        title: 'Databases & Persistent Caching',
        description: 'PostgreSQL, ORMs, indexing strategies, and Redis memory caching.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-web-deploy',
        title: 'Full Stack Deployment & Testing',
        description: 'CI/CD workflows, Docker packaging, and automated integration tests.',
        order: 5,
        levelIds: [5],
      },
      {
        id: 'dom-web-readiness',
        title: 'Full Stack Capstone & Interviewing',
        description: 'Production web application showcase and live frontend/backend coding mock tests.',
        order: 6,
        levelIds: [6],
      },
    ],
  },
  {
    id: 'master-devops-eng',
    roleKey: 'cloud_devops',
    title: 'Cloud & DevOps Engineer',
    description: 'Automate infrastructure, build resilient CI/CD pipelines, and manage cloud scalability.',
    targetAudience: 'Systems engineers, backend developers, and IT professionals transitioning to cloud operations.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 5,
    domains: [
      {
        id: 'dom-ops-linux',
        title: 'Linux Systems & Networking',
        description: 'Kernel cgroups, processes, bash automation, and TCP/IP routing.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-ops-containers',
        title: 'Containers & Kubernetes',
        description: 'Docker multi-stage builds, pods, deployments, services, and ingress.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-ops-iac',
        title: 'Infrastructure as Code (IaC) & Cloud',
        description: 'Terraform state management, AWS VPC architectures, and IAM governance.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-ops-cicd',
        title: 'Automated CI/CD & Observability',
        description: 'GitHub Actions pipelines, Prometheus metrics, and Grafana telemetry.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-ops-interview',
        title: 'DevOps Capstone & Technical Mock',
        description: 'High-availability cluster deployment and live operational troubleshooting.',
        order: 5,
        levelIds: [5],
      },
    ],
  },
  {
    id: 'master-cyber-sec',
    roleKey: 'cybersecurity_engineer',
    title: 'Cybersecurity Engineer',
    description: 'Secure enterprise networks, detect vulnerabilities, audit code, and build incident defense protocols.',
    targetAudience: 'Security enthusiasts, network engineers, and developers seeking offensive and defensive security careers.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 6,
    domains: [
      {
        id: 'dom-sec-foundations',
        title: 'Security Foundations & Network Defense',
        description: 'OSI model security, firewalls, TLS/SSL, PKI, and network packet analysis with Wireshark.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-sec-linux-scripting',
        title: 'Linux Hardening & Security Automation',
        description: 'Bash/Python scripting for security, system log auditing, and permissions hardening.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-sec-appsec',
        title: 'Application Security (AppSec) & OWASP',
        description: 'OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF, and static code auditing.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-sec-cloud',
        title: 'Cloud Security & IAM Architectures',
        description: 'AWS/GCP security controls, zero-trust network design, and least-privilege policies.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-sec-incident',
        title: 'SIEM, Threat Hunting & Incident Response',
        description: 'Log telemetry correlation, Splunk/Elastic detection rules, and forensic analysis.',
        order: 5,
        levelIds: [5],
      },
      {
        id: 'dom-sec-capstone',
        title: 'Security Auditing Capstone & Interview Mock',
        description: 'Full infrastructure penetration test report and technical security screening.',
        order: 6,
        levelIds: [6],
      },
    ],
  },
  {
    id: 'master-swe-gen',
    roleKey: 'software_engineer',
    title: 'Software Engineer',
    description: 'Master full-lifecycle software development, algorithm design, system architecture, database modeling, and production readiness.',
    targetAudience: 'Engineers, computer science students, and career transitioners preparing for general technical engineering interviews.',
    typicalDurationMonths: 6,
    defaultLevelsCount: 6,
    domains: [
      {
        id: 'dom-swe-foundations',
        title: 'Core Foundations & Computation',
        description: 'Language semantics, problem decomposition, data typing, and clean coding paradigms.',
        order: 1,
        levelIds: [1],
      },
      {
        id: 'dom-swe-dsa',
        title: 'Data Structures & Algorithms',
        description: 'Time/space complexity, linear and non-linear collections, search strategies, and recursion.',
        order: 2,
        levelIds: [2],
      },
      {
        id: 'dom-swe-arch',
        title: 'Modular Architecture & OOP',
        description: 'SOLID principles, design patterns, separation of concerns, and clean API boundaries.',
        order: 3,
        levelIds: [3],
      },
      {
        id: 'dom-swe-data',
        title: 'Data Storage & Persistence',
        description: 'Relational schemas, query optimization, indexing strategies, and caching layers.',
        order: 4,
        levelIds: [4],
      },
      {
        id: 'dom-swe-systems',
        title: 'Systems Engineering & CI/CD',
        description: 'Testing frameworks, Git collaboration, containerized deployment, and asynchronous services.',
        order: 5,
        levelIds: [5],
      },
      {
        id: 'dom-swe-capstone',
        title: 'Capstone & Technical Interviews',
        description: 'Production system implementation, system design trade-offs, and hiring screening simulation.',
        order: 6,
        levelIds: [6],
      },
    ],
  },
];

export const masterPlanService = {
  getMasterPlans(): MasterCareerPlan[] {
    return MASTER_CAREER_PLANS;
  },

  getMasterPlanForRole(targetJob: string): MasterCareerPlan {
    const query = targetJob.toLowerCase();

    if (query.includes('java') && !query.includes('javascript')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'java_developer')!;
    }
    if (query.includes('cyber') || query.includes('security') || query.includes('infosec') || query.includes('pentest')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'cybersecurity_engineer')!;
    }
    if (query.includes('analyst') && !query.includes('data sci')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'data_analyst')!;
    }
    if (query.includes('ai') || query.includes('machine learning') || query.includes('ml ') || query.endsWith('ml') || query.includes('deep learning')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'aiml_engineer')!;
    }
    if (query.includes('data sci') || query.includes('scientist')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'data_scientist')!;
    }
    if (query.includes('web') || query.includes('react') || query.includes('frontend') || query.includes('full stack') || query.includes('fullstack') || query.includes('node') || query.includes('javascript')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'web_developer')!;
    }
    if (query.includes('devops') || query.includes('cloud') || query.includes('kubernetes') || query.includes('sre')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'cloud_devops')!;
    }
    if (query.includes('python') || query.includes('django') || query.includes('fastapi') || query.includes('backend')) {
      return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'python_developer')!;
    }

    // Default to general software engineer track
    return MASTER_CAREER_PLANS.find((p) => p.roleKey === 'software_engineer') || MASTER_CAREER_PLANS[0];
  },
};
