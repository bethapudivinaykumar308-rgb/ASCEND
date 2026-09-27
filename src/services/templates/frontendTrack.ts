import { UserGoal } from '../../types';
import { LevelTemplate } from './types';

export function getFrontendDeveloperLevels(goal?: UserGoal): LevelTemplate[] {
  const preferred = goal?.preferredTechnologies?.join(', ') || 'React, TypeScript, Tailwind CSS, Node.js';

  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Modern JavaScript & DOM Architecture',
      description: 'Master ES6+ semantics, event loop mechanics, closures, asynchronous execution, and modern browser APIs.',
      assessmentTitle: 'Level 1 Assessment: Modern JavaScript & Async Mechanics',
      topics: [
        {
          topic: 'Event Loop, Microtasks & Asynchronous Execution',
          explanation: 'JavaScript runs on a single thread. The event loop prioritizes the call stack, microtask queue (Promises), and macrotask queue (setTimeout).',
          objectives: ['Master Promises, async/await, and microtask scheduling', 'Prevent UI thread blocking'],
          practice: {
            description: 'Implement a promise-based delay and retry utility function.',
            starterCode: `async function retryOperation(fn, retries = 3, delayMs = 1000) {\n  for (let i = 0; i < retries; i++) {\n    try { return await fn(); }\n    catch (err) { if (i === retries - 1) throw err; await new Promise(r => setTimeout(r, delayMs)); }\n  }\n}`,
            expectedOutput: 'Resolved value after retry',
          },
          resources: [
            {
              id: 'r-fe-101',
              title: 'MDN Web Docs: The Event Loop',
              provider: 'Mozilla Developer Network',
              topic: 'Event Loop & Concurrency',
              duration: '20 min read',
              directUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
              isVerified: true,
              selectionReason: 'The definitive browser specification documentation for JavaScript concurrency.',
              type: 'documentation',
            },
          ],
        },
        {
          topic: 'Closures, Lexical Scope & Prototype Chain',
          explanation: 'Functions in JavaScript retain lexical scope references to outer enclosing scopes. Prototypal inheritance governs object property lookups.',
          objectives: ['Understand closures for encapsulation', 'Master prototype delegation and ES6 classes'],
          practice: {
            description: 'Implement a memoize function using closures to cache computation results.',
            starterCode: `function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
            expectedOutput: 'Cached result without re-computation',
          },
          resources: [
            {
              id: 'r-fe-102',
              title: 'MDN Web Docs: Closures',
              provider: 'Mozilla Developer Network',
              topic: 'Closures & Scopes',
              duration: '15 min read',
              directUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures',
              isVerified: true,
              selectionReason: 'Authoritative guide to lexical scoping and memory management in closures.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In what order will console.log output: 1: console.log("A"), 2: setTimeout(() => console.log("B"), 0), 3: Promise.resolve().then(() => console.log("C"))?',
          options: ['A, B, C', 'A, C, B', 'B, A, C', 'C, A, B'],
          correctIndex: 1,
          explanation: 'Synchronous statements run first (A), followed by microtasks from resolved Promises (C), then macrotasks like timers (B).',
          topic: 'Event Loop Execution Order',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – React Fundamentals & State Systems',
      description: 'Master component composition, virtual DOM reconciliation, custom hooks, and clean state modeling.',
      assessmentTitle: 'Level 2 Assessment: React Architecture & Custom Hooks',
      topics: [
        {
          topic: 'Reconciliation, Keys & Hook Invariants',
          explanation: 'React compares fiber node trees. Stable keys prevent unnecessary DOM mutations and preserve state integrity.',
          objectives: ['Implement robust custom hooks with cleanup effects', 'Prevent stale closures in useEffect and useMemo'],
          practice: {
            description: 'Write a custom hook useDebounce(value, delay) that debounces rapid user inputs.',
            starterCode: `import { useState, useEffect } from 'react';\nexport function useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}`,
            expectedOutput: 'Debounced state value update',
          },
          resources: [
            {
              id: 'r-fe-201',
              title: 'React Official Documentation: Describing the UI',
              provider: 'React Core Team',
              topic: 'Component Architecture',
              duration: '25 min read',
              directUrl: 'https://react.dev/learn',
              isVerified: true,
              selectionReason: 'Official documentation for modern functional React and hooks best practices.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why should array indices not be used as React key props when items can be reordered or filtered?',
          options: [
            'React throws a compile-time syntax error.',
            'Index keys tie component state to position rather than identity, causing visual glitches and corrupted inputs.',
            'Keys must always be integers greater than 100.',
            'Index keys disable browser cache.',
          ],
          correctIndex: 1,
          explanation: 'Reconciliation relies on keys to track elements across renders. Array indices break identity tracking when arrays mutate.',
          topic: 'React Reconciliation & Keys',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Server APIs & Microservices (Node.js)',
      description: 'Build robust REST APIs with Express, middleware chains, token authentication, and validation schemas.',
      assessmentTitle: 'Level 3 Assessment: Backend APIs & Asynchronous I/O',
      topics: [
        {
          topic: 'Express Middleware & JWT Authentication',
          explanation: 'Express pipelines process requests through layered middleware functions. Authentication verifies signed JWT bearer tokens.',
          objectives: ['Build typed API endpoints with input validation', 'Implement error-handling middleware'],
          practice: {
            description: 'Write an Express authentication middleware that verifies authorization headers.',
            starterCode: `function authMiddleware(req, res, next) {\n  const authHeader = req.headers['authorization'];\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Unauthorized' });\n  }\n  req.user = { id: 1, role: 'developer' };\n  next();\n}`,
            expectedOutput: 'Request proceeds or returns 401',
          },
          resources: [
            {
              id: 'r-fe-301',
              title: 'Express.js Documentation: Using Middleware',
              provider: 'OpenJS Foundation',
              topic: 'Express Middleware',
              duration: '20 min read',
              directUrl: 'https://expressjs.com/en/guide/using-middleware.html',
              isVerified: true,
              selectionReason: 'Official guide to middleware flow, error handlers, and router modules.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the role of next() in Express.js middleware functions?',
          options: [
            'It terminates the HTTP connection.',
            'It passes control to the next middleware function in the execution stack.',
            'It restarts the Node process.',
            'It commits the database transaction.',
          ],
          correctIndex: 1,
          explanation: 'next() passes control down the middleware chain; omitting it leaves the request hanging without resolution.',
          topic: 'Express Middleware Flow',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Databases, ORMs & Persistent Caching',
      description: 'Model relational data with PostgreSQL, execute optimized queries, and accelerate read traffic with Redis caching.',
      assessmentTitle: 'Level 4 Assessment: Relational Schemas & Cache Strategies',
      topics: [
        {
          topic: 'Relational Modeling & Cache-Aside Invalidation',
          explanation: 'Relational databases enforce foreign key constraints, while Redis memory stores cache hot queries to reduce database latency.',
          objectives: ['Design normalized schemas with indexes', 'Implement Cache-Aside read/write invalidation'],
          practice: {
            description: 'Write a cached user lookup pattern querying memory before falling back to database.',
            starterCode: `async function getUser(id, db, cache) {\n  const cached = await cache.get(\`user:\${id}\`);\n  if (cached) return JSON.parse(cached);\n  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);\n  if (user) await cache.set(\`user:\${id}\`, JSON.stringify(user), 'EX', 3600);\n  return user;\n}`,
            expectedOutput: 'User data returned from cache or DB',
          },
          resources: [
            {
              id: 'r-fe-401',
              title: 'PostgreSQL Documentation: SQL Commands',
              provider: 'PostgreSQL Global Development Group',
              topic: 'Relational SQL',
              duration: '25 min read',
              directUrl: 'https://www.postgresql.org/docs/current/sql-commands.html',
              isVerified: true,
              selectionReason: 'Authoritative specification for schema queries and transactional operations.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In a Cache-Aside pattern, what action should happen when an entity record is updated in the database?',
          options: [
            'The cache is ignored completely.',
            'The cached key is deleted or refreshed to prevent stale data reads.',
            'The database is rolled back.',
            'All database indexes are rebuilt.',
          ],
          correctIndex: 1,
          explanation: 'When writing updates, invalidating or updating the cache entry prevents serving stale reads to clients.',
          topic: 'Cache Invalidation',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – Full Stack Deployment, CI/CD & Testing',
      description: 'Dockerize applications, automate integration test suites with GitHub Actions, and deploy production containers.',
      assessmentTitle: 'Level 5 Assessment: Containerization & Continuous Delivery',
      topics: [
        {
          topic: 'Docker Multi-Stage Builds & Automated CI',
          explanation: 'Multi-stage builds eliminate compiler toolchains from production images, minimizing bundle size and vulnerability attack surfaces.',
          objectives: ['Author multi-stage Dockerfiles', 'Configure automated test workflows on PR branches'],
          practice: {
            description: 'Draft a GitHub Actions workflow step executing test suites on push.',
            starterCode: `name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm test`,
            expectedOutput: 'Automated CI test workflow',
          },
          resources: [
            {
              id: 'r-fe-501',
              title: 'Docker Documentation: Multi-stage builds',
              provider: 'Docker Inc.',
              topic: 'Container Packaging',
              duration: '15 min read',
              directUrl: 'https://docs.docker.com/build/building/multi-stage/',
              isVerified: true,
              selectionReason: 'Standard guide to building slim, secure production container images.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the main advantage of a multi-stage Docker build for a frontend application?',
          options: [
            'It enables containers to run without Docker installed.',
            'It allows compiling assets with Node and serving only static files with Nginx, keeping images lightweight and secure.',
            'It automatically writes unit tests.',
            'It replaces the need for a web server.',
          ],
          correctIndex: 1,
          explanation: 'Multi-stage builds keep build-time tools out of the final container image, reducing attack surface and image size.',
          topic: 'Docker Multi-stage Architecture',
        },
      ],
    },
    {
      levelNumber: 6,
      title: 'Level 6 – Full Stack Capstone & Technical Mock Interviews',
      description: 'Ship an end-to-end production application, pass live system design reviews, and demonstrate candidate readiness.',
      assessmentTitle: 'Level 6 Assessment: Comprehensive Full Stack Engineering Bar',
      topics: [
        {
          topic: 'Frontend/Backend System Architecture & Trade-Offs',
          explanation: 'Senior engineering screening focuses on trade-off communication: SSR vs CSR, optimistic UI updates, and database indexing.',
          objectives: ['Explain architectural trade-offs to interviewers', 'Deliver end-to-end capstone demo'],
          practice: {
            description: 'Design the schema and API contract for a high-traffic notification stream.',
            starterCode: `// Architecture blueprint:\n// 1. WebSockets / SSE for live alerts\n// 2. Redis Pub/Sub backplane\n// 3. PostgreSQL persistent audit logs`,
            expectedOutput: 'Full system architecture specification',
          },
          resources: [
            {
              id: 'r-fe-601',
              title: 'System Design Primer',
              provider: 'Donne Martin',
              topic: 'System Design Architecture',
              duration: '40 min read',
              directUrl: 'https://github.com/donnemartin/system-design-primer',
              isVerified: true,
              selectionReason: 'Industry-standard open-source reference for distributed systems design and interview prep.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'When choosing between Server-Side Rendering (SSR) and Client-Side Rendering (CSR), what is the key trade-off?',
          options: [
            'CSR has zero CPU usage on client devices.',
            'SSR provides faster initial meaningful paint and SEO at the expense of higher server compute and caching complexity.',
            'SSR does not support JavaScript.',
            'CSR is forbidden in modern enterprise production.',
          ],
          correctIndex: 1,
          explanation: 'SSR sends pre-rendered HTML for fast initial load and SEO, while CSR offloads rendering computation to client browsers.',
          topic: 'Rendering Architecture Trade-Offs',
        },
      ],
    },
  ];
}
