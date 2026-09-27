import { UserGoal } from '../../types';
import { LevelTemplate } from './types';

// Cloud & DevOps Engineer (5 Levels matching master-devops-eng)
export function getDevOpsLevels(goal?: UserGoal): LevelTemplate[] {
  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Linux Internals & Containerization (Docker)',
      description: 'Filesystems, process signals, networking namespaces, multi-stage Docker builds, and security.',
      assessmentTitle: 'Level 1 Assessment: Linux Systems & Container Runtimes',
      topics: [
        {
          topic: 'cgroups, Namespaces & Container Isolation',
          explanation: 'Containers are not virtual machines; they are standard host processes constrained by kernel cgroups and isolated namespaces.',
          objectives: ['Write multi-stage Dockerfiles with minimal attack surfaces', 'Debug networking with netstat/curl/nslookup inside containers'],
          practice: {
            description: 'Write a multi-stage Dockerfile that builds an application binary and copies it into a scratch or alpine runtime.',
            starterCode: `FROM golang:1.22-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN go build -o main .\n\nFROM alpine:3.19\nCOPY --from=builder /app/main /main\nCMD ["/main"]`,
            expectedOutput: 'Minimal production container image',
          },
          resources: [
            {
              id: 'r-ops-101',
              title: 'Docker Multi-stage Builds Documentation',
              provider: 'Docker Inc.',
              topic: 'Container Optimization',
              duration: '15 min read',
              directUrl: 'https://docs.docker.com/build/building/multi-stage/',
              isVerified: true,
              selectionReason: 'Official documentation for reducing image sizes and stripping compilation build tools from production.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What Linux kernel mechanism is responsible for limiting CPU and memory resources for a Docker container?',
          options: ['chroot', 'cgroups (Control Groups)', 'Namespaces', 'iptables'],
          correctIndex: 1,
          explanation: 'cgroups throttle and meter resource usage (RAM, CPU, I/O), while namespaces provide process and network isolation.',
          topic: 'Linux Container Internals',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Kubernetes Orchestration & Cluster Architecture',
      description: 'Pods, Deployments, Services (ClusterIP/NodePort/LoadBalancer), Ingress controllers, and Helm charts.',
      assessmentTitle: 'Level 2 Assessment: Kubernetes Architecture & Deployments',
      topics: [
        {
          topic: 'Pod Lifecycle, ReplicaSets & Rolling Deployments',
          explanation: 'Kubernetes control plane reconciles desired cluster state against actual state. Deployments provide zero-downtime rolling updates.',
          objectives: ['Author declarative Kubernetes manifests', 'Configure liveness, readiness, and startup probes'],
          practice: {
            description: 'Define a Kubernetes Deployment manifest with readiness and liveness probes.',
            starterCode: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-api\nspec:\n  replicas: 3\n  selector:\n    matchLabels: { app: web }\n  template:\n    metadata: { labels: { app: web } }\n    spec:\n      containers:\n        - name: api\n          image: web-api:v1\n          ports: [{ containerPort: 8080 }]\n          readinessProbe:\n            httpGet: { path: /healthz, port: 8080 }`,
            expectedOutput: 'Kubernetes deployment manifest with probes',
          },
          resources: [
            {
              id: 'r-ops-201',
              title: 'Kubernetes Documentation: Deployments',
              provider: 'Cloud Native Computing Foundation',
              topic: 'Kubernetes Deployments',
              duration: '25 min read',
              directUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
              isVerified: true,
              selectionReason: 'Official documentation for managing rolling updates and pod lifecycle in K8s.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the consequence if a container fails its Kubernetes Readiness Probe?',
          options: [
            'Kubernetes terminates the node immediately.',
            'The pod is removed from Service endpoints so no traffic is routed to it until it becomes ready again.',
            'The container is deleted permanently.',
            'Kubernetes reverts all git commits.',
          ],
          correctIndex: 1,
          explanation: 'Readiness probes signal when a pod is initialized to receive traffic; failures isolate the pod from the Service load balancer without restarting it.',
          topic: 'Kubernetes Probes',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Infrastructure as Code (IaC) & Cloud Networking',
      description: 'Automate cloud provisioning with Terraform (HCL), remote state locking (S3/DynamoDB), and AWS VPC architectures.',
      assessmentTitle: 'Level 3 Assessment: Terraform State & Cloud Infrastructure',
      topics: [
        {
          topic: 'Terraform State Management, Providers & Modularity',
          explanation: 'Terraform maps real-world cloud resources to declared configuration code via remote state backends, computing execution plans via DAGs.',
          objectives: ['Manage remote state with S3 backend and DynamoDB locking', 'Author reusable, parameterized Terraform modules'],
          practice: {
            description: 'Write a Terraform module block declaring an AWS S3 bucket with private ACL and versioning.',
            starterCode: `resource "aws_s3_bucket" "data_bucket" {\n  bucket = "ascend-prod-data-store"\n}\nresource "aws_s3_bucket_versioning" "versioning" {\n  bucket = aws_s3_bucket.data_bucket.id\n  versioning_configuration {\n    status = "Enabled"\n  }\n}`,
            expectedOutput: 'Terraform HCL resource block',
          },
          resources: [
            {
              id: 'r-ops-301',
              title: 'HashiCorp Terraform Documentation: State',
              provider: 'HashiCorp',
              topic: 'IaC State Management',
              duration: '20 min read',
              directUrl: 'https://developer.hashicorp.com/terraform/language/state',
              isVerified: true,
              selectionReason: 'Authoritative guide to state locking, workspace isolation, and drift detection.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why is distributed state locking (e.g. via DynamoDB) essential when using remote Terraform state in a team?',
          options: [
            'It accelerates download speeds.',
            'It prevents multiple team members from running concurrent terraform apply executions, which could corrupt the state file or cause race conditions.',
            'It encrypts developer laptops.',
            'It converts HCL to JSON.',
          ],
          correctIndex: 1,
          explanation: 'State locking acquires a mutual exclusion lock during plan/apply, preventing concurrent operations from corrupting shared infrastructure state.',
          topic: 'Terraform State Locking',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Automated CI/CD Pipelines & Observability',
      description: 'GitHub Actions deployment workflows, Prometheus metrics scraping, Alertmanager rules, and Grafana dashboards.',
      assessmentTitle: 'Level 4 Assessment: CI/CD Automation & Telemetry',
      topics: [
        {
          topic: 'Prometheus Metrics (RED Method) & Alert Routing',
          explanation: 'Observability requires capturing Rate, Errors, and Duration (RED) across services, triggering alerts before user SLAs degrade.',
          objectives: ['Instrument services with Prometheus client libraries', 'Configure SLO/SLI alerts and PagerDuty notification channels'],
          practice: {
            description: 'Write an alert rule configuration in Prometheus for high HTTP 5xx error rates.',
            starterCode: `groups:\n  - name: api_alerts\n    rules:\n      - alert: HighErrorRate\n        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05\n        for: 2m\n        labels: { severity: critical }\n        annotations: { summary: "HTTP 5xx error rate exceeded 5%" }`,
            expectedOutput: 'Prometheus alert rule configuration',
          },
          resources: [
            {
              id: 'r-ops-401',
              title: 'Prometheus Official Documentation: Alerting Rules',
              provider: 'Prometheus Authors',
              topic: 'Prometheus Metrics & Alerts',
              duration: '20 min read',
              directUrl: 'https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/',
              isVerified: true,
              selectionReason: 'Official documentation for writing PromQL alerting expressions.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What are the three pillars of the RED method in service reliability monitoring?',
          options: [
            'RAM, Ethernet, Disk',
            'Rate (requests/sec), Errors (failed requests/sec), and Duration (latency per request)',
            'Read, Execute, Delete',
            'Restart, Evict, Drain',
          ],
          correctIndex: 1,
          explanation: 'The RED method monitors Rate, Errors, and Duration as the fundamental service-level indicators for request-driven architectures.',
          topic: 'Observability RED Method',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – DevOps Capstone & Incident Troubleshooting',
      description: 'Troubleshoot live production incident simulations, conduct blameless postmortems, and pass SRE technical interviews.',
      assessmentTitle: 'Level 5 Assessment: SRE Incident Resolution & Candidate Qualifying Bar',
      topics: [
        {
          topic: 'Live Outage Triage, MTTR Reduction & Blameless Postmortems',
          explanation: 'SRE and cloud engineering loops test live debugging sequences under pressure: inspecting ingress logs, isolating network partitions, and diagnosing OOMKilled pods.',
          objectives: ['Isolate pod crash loops and memory leaks under pressure', 'Author comprehensive blameless incident postmortems'],
          practice: {
            description: 'Write the chronological triage sequence for a production Kubernetes service returning HTTP 502 errors.',
            starterCode: `// Triage Sequence:\n// 1. kubectl get pods -l app=api (Check status, restart counts, CrashLoopBackOff)\n// 2. kubectl describe pod <name> (Inspect LastState, OOMKilled, probe failures)\n// 3. kubectl logs -p <name> (Review previous container stderr before crash)\n// 4. Check cluster ingress controller logs and endpoint routing table`,
            expectedOutput: 'SRE incident triage checklist',
          },
          resources: [
            {
              id: 'r-ops-501',
              title: 'Google SRE Book: Incident Management & Postmortem Culture',
              provider: 'Google Engineering',
              topic: 'SRE Principles',
              duration: '35 min read',
              directUrl: 'https://sre.google/sre-book/incident-management/',
              isVerified: true,
              selectionReason: 'The benchmark industry guide for modern Site Reliability Engineering and incident response.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In Kubernetes, what does an exit code of 137 on a terminated container indicate?',
          options: [
            'The container successfully finished its task.',
            'The container was killed with SIGKILL by the Linux Out-Of-Memory (OOM) killer because it exceeded its configured memory limit (128 + 9 = 137).',
            'There was a network DNS resolution error.',
            'The container had an invalid license key.',
          ],
          correctIndex: 1,
          explanation: 'Exit code 137 indicates termination by signal 9 (SIGKILL), usually triggered by the Linux kernel OOM killer when a container breaches memory limits.',
          topic: 'Kubernetes Container Exit Codes',
        },
      ],
    },
  ];
}

// Cybersecurity Engineer (6 Levels matching master-cyber-sec)
export function getCybersecurityLevels(goal?: UserGoal): LevelTemplate[] {
  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Network Security & Traffic Analysis',
      description: 'Master packet inspection, TLS handshake validation, firewalls, and Wireshark protocol analysis.',
      assessmentTitle: 'Level 1 Assessment: Network Protocols & Security Controls',
      topics: [
        {
          topic: 'TCP/IP Handshake, TLS/SSL & Cryptographic Ciphers',
          explanation: 'Securing network communications requires understanding SYN-ACK state machines, public key infrastructure (PKI), and cipher suites.',
          objectives: [
            'Inspect TCP flags and identify port scanning signatures (SYN flood, NULL scan)',
            'Understand symmetric (AES) vs asymmetric (RSA, ECC) encryption roles in TLS session establishment',
          ],
          practice: {
            description: 'Identify the protocol layer responsible for end-to-end data encryption in the OSI stack.',
            starterCode: `# Analysis question:\n# TLS operates primarily at Layer 4 (Transport) and Layer 5/6 (Session/Presentation)\n# Answer: Presentation/Transport layer`,
            expectedOutput: 'Presentation / Transport layer verification',
          },
          resources: [
            {
              id: 'r-sec-101',
              title: 'OWASP Top 10 Web Application Security Risks',
              provider: 'OWASP Foundation',
              topic: 'Security Vulnerability Analysis',
              duration: '35 min read',
              directUrl: 'https://owasp.org/www-project-top-ten/',
              isVerified: true,
              selectionReason: 'The globally recognized standard reference for application security vulnerabilities.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What type of cryptographic algorithm is used to exchange symmetric session keys during a secure TLS handshake?',
          options: [
            'ROT13 cipher',
            'Asymmetric key cryptography (such as Diffie-Hellman or RSA)',
            'Base64 encoding',
            'MD5 hashing',
          ],
          correctIndex: 1,
          explanation: 'Asymmetric cryptography securely negotiates a shared secret, which is then used for high-speed symmetric payload encryption.',
          topic: 'Cryptographic Key Exchange',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Linux Hardening & Security Automation',
      description: 'Kernel sysctl hardening, SSH bastion controls, auditd telemetry, and automated security scripts in Python/Bash.',
      assessmentTitle: 'Level 2 Assessment: Linux Hardening & System Auditing',
      topics: [
        {
          topic: 'File Permissions, SUID Hazards & Auditd Logging',
          explanation: 'Linux privilege escalation often exploits misconfigured SUID binaries, permissive sudoers entries, or world-writable files.',
          objectives: ['Identify and remediate SUID escalation vulnerabilities', 'Configure auditd rules monitoring unauthorized file access'],
          practice: {
            description: 'Write a bash command finding all SUID binaries on the filesystem.',
            starterCode: `find / -perm -u=s -type f 2>/dev/null`,
            expectedOutput: 'List of binaries running with SUID root privileges',
          },
          resources: [
            {
              id: 'r-sec-201',
              title: 'CIS Linux Benchmarks Overview',
              provider: 'Center for Internet Security',
              topic: 'System Hardening',
              duration: '25 min read',
              directUrl: 'https://www.cisecurity.org/benchmark/ubuntu_linux',
              isVerified: true,
              selectionReason: 'The globally accepted security baseline benchmark for Linux OS hardening.',
              type: 'article',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why does setting the SUID bit on a binary executable pose a potential security hazard?',
          options: [
            'It slows down execution by 50%.',
            'The program executes with the permissions of the file owner (often root) rather than the invoking user, allowing privilege escalation if vulnerable.',
            'It permanently locks the file from being edited.',
            'It disables all logging.',
          ],
          correctIndex: 1,
          explanation: 'SUID programs run with the file owner permissions; any buffer overflow or command injection flaw can yield instantaneous root access.',
          topic: 'Linux SUID Permissions',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Application Security (AppSec) & OWASP Top 10',
      description: 'Audit code for SQL injection, Cross-Site Scripting (XSS), CSRF, SSRF, and implement Content Security Policies (CSP).',
      assessmentTitle: 'Level 3 Assessment: Web Application Vulnerabilities & Remediation',
      topics: [
        {
          topic: 'SQL Injection, XSS Defense & Parameterized Queries',
          explanation: 'Untrusted user input must never be directly concatenated into database queries or reflected unescaped into HTML responses.',
          objectives: ['Remediate SQL injection using parameterized prepared statements', 'Implement strict Content Security Policies (CSP) and HttpOnly cookies'],
          practice: {
            description: 'Refactor a vulnerable dynamic SQL query to use parameterized bindings.',
            starterCode: `// Vulnerable: db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'")\n// Refactored secure version:\ndb.query("SELECT * FROM users WHERE email = $1", [req.body.email]);`,
            expectedOutput: 'Parameterized query preventing SQL injection',
          },
          resources: [
            {
              id: 'r-sec-301',
              title: 'OWASP Prevention Cheat Sheet: SQL Injection',
              provider: 'OWASP Foundation',
              topic: 'Injection Defense',
              duration: '20 min read',
              directUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
              isVerified: true,
              selectionReason: 'Definitive developer guide for mitigating relational injection attacks.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the most effective and primary defense against SQL Injection vulnerabilities?',
          options: [
            'Using blacklists to strip quotes from inputs.',
            'Using parameterized prepared statements (bind variables) or trusted ORM abstractions across all database queries.',
            'Running the database on a non-standard port.',
            'Hiding the website domain name.',
          ],
          correctIndex: 1,
          explanation: 'Prepared statements treat user inputs strictly as literal data rather than executable SQL syntax, rendering injection impossible.',
          topic: 'SQL Injection Defense',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Cloud Security & IAM Architectures',
      description: 'Zero Trust principles, least-privilege IAM policies, AWS KMS encryption, metadata service protection, and secrets vaults.',
      assessmentTitle: 'Level 4 Assessment: Cloud IAM & Zero Trust Architecture',
      topics: [
        {
          topic: 'IAM Least Privilege, Role Assumption & IMDSv2',
          explanation: 'Cloud compromises frequently stem from overly permissive IAM roles. Enforcing IMDSv2 mitigates SSRF credential theft on cloud instances.',
          objectives: ['Author granular IAM JSON policy documents', 'Enforce cloud encryption-at-rest with customer-managed KMS keys'],
          practice: {
            description: 'Write an AWS IAM policy granting read-only access strictly to a specific S3 bucket prefix.',
            starterCode: `{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": ["s3:GetObject"],\n    "Resource": "arn:aws:s3:::company-logs/production/*"\n  }]\n}`,
            expectedOutput: 'Least-privilege IAM policy document',
          },
          resources: [
            {
              id: 'r-sec-401',
              title: 'AWS Security Best Practices: Identity and Access Management',
              provider: 'Amazon Web Services',
              topic: 'Cloud Security',
              duration: '25 min read',
              directUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
              isVerified: true,
              selectionReason: 'Official security guide for cloud access control and least-privilege enforcement.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'How does requiring AWS IMDSv2 (Instance Metadata Service v2) protect cloud servers against Server-Side Request Forgery (SSRF)?',
          options: [
            'It disables all internet access.',
            'It requires a session-oriented PUT request with a custom token header before metadata can be read, which standard SSRF cannot easily forge.',
            'It encrypts hard drives.',
            'It changes server passwords daily.',
          ],
          correctIndex: 1,
          explanation: 'IMDSv2 introduces session tokens via PUT headers, neutralizing basic GET-based SSRF vectors from stealing instance credentials.',
          topic: 'Cloud SSRF & Metadata Security',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – SIEM, Threat Hunting & Incident Response',
      description: 'Correlate telemetry in Splunk/Elastic, write detection rules (Sigma/YARA), triage alerts, and conduct memory forensics.',
      assessmentTitle: 'Level 5 Assessment: Threat Hunting & SOC Detection Engineering',
      topics: [
        {
          topic: 'MITRE ATT&CK Matrix & Sigma Detection Rules',
          explanation: 'Modern SOC teams map attacker tactics, techniques, and procedures (TTPs) across the MITRE ATT&CK matrix to build resilient detection logic.',
          objectives: ['Map adversary behaviors to MITRE ATT&CK techniques', 'Author Sigma detection rules for suspicious PowerShell/Bash process execution'],
          practice: {
            description: 'Draft a Sigma rule detecting suspicious base64 encoded PowerShell execution.',
            starterCode: `title: Suspicious Encoded PowerShell Execution\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    Image|endswith: '\\powershell.exe'\n    CommandLine|contains: [' -enc ', ' -EncodedCommand ']\n  condition: selection`,
            expectedOutput: 'Sigma detection engineering rule',
          },
          resources: [
            {
              id: 'r-sec-501',
              title: 'MITRE ATT&CK Framework Documentation',
              provider: 'MITRE Corporation',
              topic: 'Threat Intelligence',
              duration: '30 min read',
              directUrl: 'https://attack.mitre.org/',
              isVerified: true,
              selectionReason: 'The globally standard knowledge base of adversary tactics and techniques.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the primary objective of mapping enterprise security alerts to the MITRE ATT&CK framework?',
          options: [
            'To replace antivirus software.',
            'To identify gaps in defensive detection coverage across the full cyber kill chain from initial access to data exfiltration.',
            'To track developer working hours.',
            'To delete firewall rules.',
          ],
          correctIndex: 1,
          explanation: 'MITRE ATT&CK provides a structured taxonomy to assess whether security monitoring covers all phases of real adversary behavior.',
          topic: 'MITRE ATT&CK Methodology',
        },
      ],
    },
    {
      levelNumber: 6,
      title: 'Level 6 – Security Capstone & Penetration Test Defense',
      description: 'Author a professional penetration testing report, defend security architectural findings, and pass candidate interviews.',
      assessmentTitle: 'Level 6 Assessment: Cybersecurity Candidate Qualifying Exam',
      topics: [
        {
          topic: 'Penetration Test Reporting & Executive Vulnerability Defense',
          explanation: 'Senior security engineers must translate critical CVEs into quantified business risk for executives while giving engineers exact remediation steps.',
          objectives: ['Author professional penetration test audit deliverables', 'Defend threat models in live technical interviews'],
          practice: {
            description: 'Structure an executive vulnerability finding report with CVSS scoring and remediation steps.',
            starterCode: `// Pentest Report Template:\n// 1. Finding Title: Remote Code Execution via Insecure Deserialization\n// 2. CVSS 3.1 Score: 9.8 (Critical)\n// 3. Technical Proof-of-Concept & Reproduction Steps\n// 4. Concrete Remediation & Compensating Controls`,
            expectedOutput: 'Executive vulnerability report deliverable',
          },
          resources: [
            {
              id: 'r-sec-601',
              title: 'SANS Institute Security Policy & Audit Templates',
              provider: 'SANS Institute',
              topic: 'Security Auditing',
              duration: '30 min read',
              directUrl: 'https://www.sans.org/',
              isVerified: true,
              selectionReason: 'The world standard for cybersecurity training and enterprise auditing frameworks.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In CVSS 3.1 vulnerability scoring, what does a score of 9.8 indicate?',
          options: [
            'Informational risk with zero impact.',
            'A Critical vulnerability, typically remotely exploitable without authentication and resulting in total loss of confidentiality, integrity, and availability.',
            'A physical building security issue.',
            'An unread email notification.',
          ],
          correctIndex: 1,
          explanation: 'CVSS scores between 9.0 and 10.0 represent Critical severity, demanding immediate emergency incident response and patching.',
          topic: 'CVSS Scoring Matrix',
        },
      ],
    },
  ];
}

// General Software Engineer (6 Levels matching master-swe-gen)
export function getGeneralSoftwareEngineerLevels(goal: UserGoal | string): LevelTemplate[] {
  const jobName = typeof goal === 'string' ? goal : goal.targetJob;

  return [
    {
      levelNumber: 1,
      title: `Level 1 – ${jobName} Core Foundations`,
      description: `Understand the fundamental technologies, paradigm concepts, and problem-solving patterns for ${jobName}.`,
      assessmentTitle: `Level 1 Assessment: ${jobName} Fundamentals`,
      topics: [
        {
          topic: 'Core Syntax & Problem Decomposition',
          explanation: 'Systematic problem decomposition allows complex software requirements to be divided into testable, verifiable units.',
          objectives: ['Analyze computational specifications', 'Implement clean data modeling and types'],
          practice: {
            description: 'Implement a verification function that validates domain invariants.',
            starterCode: `def solve_domain_problem(data: dict) -> bool:\n    return bool(data and data.get("ready"))\n\nprint(solve_domain_problem({"ready": True}))`,
            expectedOutput: 'True',
          },
          resources: [
            {
              id: 'r-gen-101',
              title: 'Clean Code & Architectural Fundamentals',
              provider: 'Engineering Standard Reference',
              topic: 'Code Quality',
              duration: '20 min read',
              directUrl: 'https://docs.python.org/3/',
              isVerified: true,
              selectionReason: 'Verified principles of computational clarity, test-driven validation, and low coupling.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: `What is the primary benefit of maintaining pure functions and clear separation of concerns in ${jobName} architecture?`,
          options: [
            'Eliminates the need for any unit tests.',
            'Makes code predictable, easily testable in isolation, and free from unintended side effects.',
            'Reduces storage usage on developer hard drives.',
            'Forces all code to run on a single CPU core.',
          ],
          correctIndex: 1,
          explanation: 'Separation of concerns and purity minimize hidden side effects, making systems significantly easier to reason about and test.',
          topic: 'Software Architecture Principles',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Data Structures & Computational Complexity',
      description: 'Master time/space complexity analysis (Big-O), linear collections, hash tables, and search algorithms.',
      assessmentTitle: 'Level 2 Assessment: Data Structures & Algorithms',
      topics: [
        {
          topic: 'Asymptotic Analysis & Hash Maps',
          explanation: 'Selecting the appropriate data structure dictates system performance at scale. Hash tables offer O(1) lookups vs O(N) array scans.',
          objectives: ['Analyze Big-O time and space bounds', 'Utilize hash tables and sets for optimal lookup speed'],
          practice: {
            description: 'Write an optimal two-sum solver using a hash map in O(N) time.',
            starterCode: `def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen: return [seen[diff], i]\n        seen[num] = i\n    return []`,
            expectedOutput: 'Indices of the two numbers matching target',
          },
          resources: [
            {
              id: 'r-gen-201',
              title: 'Algorithmic Complexity & Big-O Guide',
              provider: 'Computer Science Faculty',
              topic: 'Big-O Analysis',
              duration: '25 min read',
              directUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
              isVerified: true,
              selectionReason: 'Authoritative guide to data structure complexity and computational efficiency.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the time complexity of looking up a key in a hash table with good hashing and low load factor?',
          options: ['O(N²)', 'O(1) average case', 'O(N log N)', 'O(log N) always'],
          correctIndex: 1,
          explanation: 'Hash tables calculate array bucket indices directly from hash codes, executing lookups in average O(1) constant time.',
          topic: 'Hash Table Complexity',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Modular Architecture & Clean Design',
      description: 'Apply SOLID design principles, dependency injection, interface abstractions, and design patterns.',
      assessmentTitle: 'Level 3 Assessment: SOLID Principles & Modularity',
      topics: [
        {
          topic: 'Dependency Inversion & Interface Segregation',
          explanation: 'Loosely coupled software architectures depend on abstractions rather than concrete implementations, enabling testability.',
          objectives: ['Decouple business logic from external I/O', 'Implement factory and strategy design patterns'],
          practice: {
            description: 'Refactor a monolithic class to use dependency injection for external data access.',
            starterCode: `class Service:\n    def __init__(self, repository):\n        self.repository = repository\n    def get_data(self, key):\n        return self.repository.fetch(key)`,
            expectedOutput: 'Decoupled service with injected dependency',
          },
          resources: [
            {
              id: 'r-gen-301',
              title: 'Software Design Principles and Patterns',
              provider: 'Engineering Standards Board',
              topic: 'Software Architecture',
              duration: '30 min read',
              directUrl: 'https://docs.python.org/3/',
              isVerified: true,
              selectionReason: 'Standard principles for building maintainable, evolvable software systems.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the primary purpose of the Open/Closed Principle (OCP)?',
          options: [
            'Software entities should be open for extension, but closed for modification.',
            'Code must never be edited once committed to git.',
            'All classes must be declared private.',
            'Only open-source libraries may be used.',
          ],
          correctIndex: 0,
          explanation: 'OCP encourages designs where new functionality can be added via new classes or plugins without modifying existing, tested code.',
          topic: 'SOLID Open/Closed Principle',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Relational Modeling & Persistence Layers',
      description: 'Model relational schemas, write optimized SQL queries, manage database transactions, and configure caching.',
      assessmentTitle: 'Level 4 Assessment: Relational Schemas & Query Optimization',
      topics: [
        {
          topic: 'ACID Transactions & Database Indexing',
          explanation: 'Relational databases enforce consistency through ACID transactions. Proper indexing accelerates read queries while balancing write costs.',
          objectives: ['Design 3NF relational schemas', 'Analyze query execution plans and index selectivity'],
          practice: {
            description: 'Write an SQL query with aggregation and filtering over indexed customer order records.',
            starterCode: `SELECT customer_id, COUNT(*) as order_count, SUM(total) as lifetime_value\nFROM orders\nWHERE status = 'completed'\nGROUP BY customer_id\nHAVING SUM(total) > 1000;`,
            expectedOutput: 'Aggregated lifetime value dataset',
          },
          resources: [
            {
              id: 'r-gen-401',
              title: 'PostgreSQL Tutorial: Relational Queries',
              provider: 'PostgreSQL Global Development Group',
              topic: 'Relational Databases',
              duration: '25 min read',
              directUrl: 'https://www.postgresql.org/docs/current/',
              isVerified: true,
              selectionReason: 'The standard reference for transactional databases and SQL optimization.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In database ACID transactions, what does Atomicity guarantee?',
          options: [
            'Queries run in parallel on all CPU cores.',
            'All operations within the transaction succeed together, or if any fails, the entire transaction is rolled back with zero partial state saved.',
            'Data is stored in atomic particles.',
            'The database is indestructible.',
          ],
          correctIndex: 1,
          explanation: 'Atomicity ensures "all-or-nothing" execution: either all operations in a transaction commit, or none do.',
          topic: 'Database ACID Properties',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – Testing, CI/CD & Production Engineering',
      description: 'Write unit and integration tests, containerize applications with Docker, and configure automated GitHub Actions.',
      assessmentTitle: 'Level 5 Assessment: Automated Testing & Continuous Integration',
      topics: [
        {
          topic: 'Test-Driven Development (TDD) & CI Pipelines',
          explanation: 'Automated test suites run on every commit in CI pipelines to catch regressions before deployments reach staging or production.',
          objectives: ['Write deterministic unit tests with mocks', 'Author automated test and build workflows'],
          practice: {
            description: 'Write a unit test with assertions verifying edge case handling on an authentication helper.',
            starterCode: `def test_auth_empty_token():\n    assert authenticate("") is False\n    assert authenticate(None) is False`,
            expectedOutput: 'Passing automated unit tests',
          },
          resources: [
            {
              id: 'r-gen-501',
              title: 'Pro Git & Continuous Integration Handbook',
              provider: 'Git SCM Community',
              topic: 'Git Workflows',
              duration: '20 min read',
              directUrl: 'https://git-scm.com/book/en/v2',
              isVerified: true,
              selectionReason: 'Standard reference for professional version control and deployment pipelines.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the primary role of a mock object in unit testing?',
          options: [
            'To test internet connectivity.',
            'To simulate external dependencies (like databases or third-party APIs) so the unit under test can be verified deterministically in isolation.',
            'To run code in production.',
            'To delete broken code automatically.',
          ],
          correctIndex: 1,
          explanation: 'Mocks isolate the code being tested from external side effects, making tests fast, deterministic, and offline-compatible.',
          topic: 'Unit Testing & Mocks',
        },
      ],
    },
    {
      levelNumber: 6,
      title: `Level 6 – ${jobName} Capstone & Technical Screening`,
      description: 'Ship an end-to-end production software system, pass system design technical rounds, and verify candidate readiness.',
      assessmentTitle: `Level 6 Assessment: ${jobName} Qualifying Bar`,
      topics: [
        {
          topic: 'System Design Trade-offs & Behavioral Defense',
          explanation: 'Hiring interviews evaluate clarity of thought under ambiguity: defining APIs, communicating trade-offs, and explaining architecture aloud.',
          objectives: ['Deliver complete production capstone implementation', 'Pass live technical interview screening simulations'],
          practice: {
            description: 'Write out your architectural trade-off narrative for an asynchronous job processing system.',
            starterCode: `// Architecture Blueprint:\n// 1. API Endpoint receives job & enqueues message into queue\n// 2. Worker nodes poll queue & process tasks asynchronously\n// 3. Status updates recorded in persistent store with notification webhook`,
            expectedOutput: 'Asynchronous system architecture specification',
          },
          resources: [
            {
              id: 'r-gen-601',
              title: 'System Design & Technical Interviewing Rubrics',
              provider: 'ASCEND Engineering Board',
              topic: 'Interview Screening',
              duration: '35 min read',
              directUrl: 'https://docs.python.org/3/',
              isVerified: true,
              selectionReason: 'Standardized evaluation rubrics used by senior engineering hiring panels.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'During a technical interview, what should you do first when presented with an ambiguous problem statement?',
          options: [
            'Immediately start coding the first solution that comes to mind.',
            'Ask clarifying questions to identify requirements, constraints, input/output types, and edge cases before designing or coding.',
            'Refuse to answer.',
            'Memorize code from online forums.',
          ],
          correctIndex: 1,
          explanation: 'Clarifying constraints and edge cases demonstrates structured engineering discipline and prevents solving the wrong problem.',
          topic: 'Technical Interview Strategy',
        },
      ],
    },
  ];
}
