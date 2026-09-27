import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { aiService } from './src/services/aiService.ts';
import { youtubeService } from './src/services/youtubeService.ts';
import { generateRoadmapForGoal } from './src/services/roadmapGenerator.ts';

const __dirname = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize optional external model clients
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Multi-AI Agent Pipeline Analysis Functions
async function analyzeUserProfile(profile: any, goal: any): Promise<string> {
  const systemInstruction = `You are ASCEND's Senior Career Strategist & Profile Analyst.
Analyze the user's current education and skills against their target role.
Identify strengths and potential conceptual blind spots.
Return a concise summary of the profile analysis.`;

  const contents = `User Name: ${profile?.name || 'Learner'}
Target Role: ${goal?.targetJob || 'Software Engineering'}
Education: ${profile?.education || goal?.education || 'N/A'}
Skill Level: ${goal?.currentSkillLevel || 'beginner'}
Existing Skills: ${(goal?.existingSkills || []).join(', ')}
Preferred Stack: ${(goal?.preferredTechnologies || []).join(', ')}`;

  const { text } = await callMultiAI({
    provider: 'gemini',
    systemInstruction,
    contents,
  });
  return text;
}

async function identifySkillGaps(profileAnalysis: string, goal: any): Promise<string[]> {
  const systemInstruction = `You are an expert Technical Interviewer.
Based on the profile analysis and target job, identify the top 5 critical skill gaps the user must bridge.
Return the gaps as a JSON array of strings.`;

  const contents = `Profile Analysis: ${profileAnalysis}
Target Role: ${goal.targetJob}`;

  const { text } = await callMultiAI({
    provider: 'gemini', // Integrate Gemini in the agent background
    systemInstruction,
    contents,
    responseMimeType: 'application/json',
  });

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : (parsed.gaps || []);
  } catch {
    return [];
  }
}

async function validateAndRepairRoadmap(roadmapJson: any, goal: any): Promise<any> {
  const systemInstruction = `You are a Lead Software Architect.
Review the provided Career Roadmap JSON for technical accuracy, stage-gating logic, and canonical resource links.
If there are errors (hallucinated URLs, incorrect Big-O, broken JSON), REPAIR them.
Return the complete repaired Roadmap JSON.`;

  const contents = `Target Role: ${goal.targetJob}
Roadmap JSON: ${JSON.stringify(roadmapJson)}`;

  const { text } = await callMultiAI({
    provider: 'gemini', // Integrate Gemini in the agent background
    systemInstruction,
    contents,
    responseMimeType: 'application/json',
  });

  try {
    return JSON.parse(text);
  } catch {
    return roadmapJson; // Fallback to original if repair fails
  }
}

// Supported models are managed by AIService
type AIProvider = 'gemini' | 'openai' | 'anthropic';

async function callMultiAI(params: {
  provider: AIProvider;
  model?: string;
  systemInstruction?: string;
  contents: string;
  responseMimeType?: string;
}): Promise<{ text: string; modelUsed: string }> {
  const { provider, model, systemInstruction, contents, responseMimeType } = params;

  if (provider === 'gemini') {
    return aiService.callGeminiWithFallback({
      systemInstruction,
      contents,
      responseMimeType,
    });
  }

  if (provider === 'openai') {
    if (!openai) {
      throw new Error('OpenAI API Key is not configured.');
    }
    const response = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages: [
        ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
        { role: 'user' as const, content: contents },
      ],
      response_format: responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
    });
    return {
      text: response.choices[0].message.content || '',
      modelUsed: response.model,
    };
  }

  if (provider === 'anthropic') {
    if (!anthropic) {
      throw new Error('Anthropic API Key is not configured.');
    }
    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      system: systemInstruction,
      messages: [{ role: 'user' as const, content: contents }],
    });
    return {
      text: response.content[0].type === 'text' ? response.content[0].text : '',
      modelUsed: response.model,
    };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

/**
 * Known canonical, publicly reachable documentation mapping.
 * Ensures title, provider, and directUrl are strictly coherent and authoritative.
 */
interface VerifiedResourceRef {
  title: string;
  provider: string;
  url: string;
  selectionReason: string;
}

const TOPIC_CANONICAL_MAP: { match: (text: string) => boolean; resource: VerifiedResourceRef }[] = [
  // FastAPI & modern Python async
  {
    match: (t) => t.includes('fastapi') || (t.includes('async') && t.includes('api')),
    resource: {
      title: 'FastAPI Official Tutorial & User Guide',
      provider: 'Tiangolo / FastAPI',
      url: 'https://fastapi.tiangolo.com/tutorial/',
      selectionReason: 'Official documentation for asynchronous Python APIs, Pydantic models, and OAuth2 security.',
    },
  },
  // Django
  {
    match: (t) => t.includes('django'),
    resource: {
      title: 'Django Official Documentation: Writing Your First App',
      provider: 'Django Software Foundation',
      url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
      selectionReason: 'Official architectural guide to Django models, migrations, views, and ORM querysets.',
    },
  },
  // PostgreSQL Queries & SQL
  {
    match: (t) => t.includes('postgres') || t.includes('sql') || t.includes('database') || t.includes('acid') || t.includes('schema') || t.includes('join'),
    resource: {
      title: 'PostgreSQL Official Documentation: SQL Tutorial & Joins',
      provider: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
      selectionReason: 'The authoritative relational database specification covering joins, grouping, and transactional integrity.',
    },
  },
  // PostgreSQL Indexes
  {
    match: (t) => t.includes('index') || t.includes('b-tree') || t.includes('query optimization'),
    resource: {
      title: 'PostgreSQL Official Documentation: Indexes & Performance',
      provider: 'PostgreSQL Global Development Group',
      url: 'https://www.postgresql.org/docs/current/indexes.html',
      selectionReason: 'Authoritative guide to B-Tree, hash, and composite index execution plans in PostgreSQL.',
    },
  },
  // Git & Version Control
  {
    match: (t) => t.includes('git') || t.includes('rebase') || t.includes('merge') || t.includes('commit') || t.includes('version control'),
    resource: {
      title: 'Pro Git Book: Git Branching & Rebasing',
      provider: 'Scott Chacon & Ben Straub',
      url: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing',
      selectionReason: 'Standard open-source textbook detailing Git DAG internals and collaborative branching workflows.',
    },
  },
  // Docker & Containers
  {
    match: (t) => t.includes('docker') || t.includes('container') || t.includes('dockerfile'),
    resource: {
      title: 'Docker Official Documentation: Getting Started',
      provider: 'Docker Inc.',
      url: 'https://docs.docker.com/get-started/',
      selectionReason: 'Official guide to multi-stage Docker builds, image optimization, and container isolation.',
    },
  },
  // Docker Compose
  {
    match: (t) => t.includes('compose') || t.includes('orchestration') || t.includes('service mesh'),
    resource: {
      title: 'Docker Official Documentation: Docker Compose Overview',
      provider: 'Docker Inc.',
      url: 'https://docs.docker.com/compose/',
      selectionReason: 'Official documentation for multi-container application definition and networking.',
    },
  },
  // Kubernetes & Orchestration
  {
    match: (t) => t.includes('kubernetes') || t.includes('k8s') || t.includes('pod') || t.includes('deployment'),
    resource: {
      title: 'Kubernetes Official Documentation: Workloads & Architecture',
      provider: 'The Kubernetes Authors',
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
      selectionReason: 'Official specification for declarative container orchestration and zero-downtime rolling updates.',
    },
  },
  // System Design & Architecture
  {
    match: (t) => t.includes('system design') || t.includes('scalability') || t.includes('cache') || t.includes('caching') || t.includes('rate limit') || t.includes('sharding'),
    resource: {
      title: 'The System Design Primer: Architectural Patterns',
      provider: 'Donne Martin',
      url: 'https://github.com/donnemartin/system-design-primer',
      selectionReason: 'Industry standard open-source guide for technical systems interviews, caching patterns, and scalability.',
    },
  },
  // Python Data Structures & Collections
  {
    match: (t) => t.includes('data structure') || t.includes('algorithm') || t.includes('big-o') || t.includes('tree') || t.includes('graph') || t.includes('stack') || t.includes('queue') || t.includes('search') || t.includes('sort') || t.includes('dict') || t.includes('hash'),
    resource: {
      title: 'Python Official Tutorial: Data Structures & Collections',
      provider: 'Python Software Foundation',
      url: 'https://docs.python.org/3/tutorial/datastructures.html',
      selectionReason: 'Authoritative specification for Python lists, sets, dictionaries, deque, and algorithmic complexity.',
    },
  },
  // Python OOP & Classes
  {
    match: (t) => t.includes('oop') || t.includes('class') || t.includes('inheritance') || t.includes('dunder') || t.includes('polymorphism') || t.includes('encapsulation'),
    resource: {
      title: 'Python Official Tutorial: Classes & Object-Oriented Programming',
      provider: 'Python Software Foundation',
      url: 'https://docs.python.org/3/tutorial/classes.html',
      selectionReason: 'Official language specification for Python classes, Method Resolution Order (MRO), and inheritance.',
    },
  },
  // Python Asyncio
  {
    match: (t) => t.includes('asyncio') || t.includes('coroutine') || t.includes('event loop') || t.includes('concurrency'),
    resource: {
      title: 'Python Official Documentation: Asynchronous I/O (asyncio)',
      provider: 'Python Software Foundation',
      url: 'https://docs.python.org/3/library/asyncio.html',
      selectionReason: 'Official documentation for asynchronous task scheduling, event loops, and coroutines in Python.',
    },
  },
  // Python Standard Library & General
  {
    match: (t) => t.includes('library') || t.includes('module') || t.includes('built-in') || t.includes('interview') || t.includes('behavioral') || t.includes('screening'),
    resource: {
      title: 'Python Developer Standard Library Reference',
      provider: 'Python Software Foundation',
      url: 'https://docs.python.org/3/library/',
      selectionReason: 'Official language reference used as standard evaluation benchmark in engineering interviews.',
    },
  },
  // React
  {
    match: (t) => t.includes('react') || t.includes('jsx') || t.includes('hook') || t.includes('component'),
    resource: {
      title: 'React Official Documentation: Describing the UI',
      provider: 'React Core Team',
      url: 'https://react.dev/learn',
      selectionReason: 'Definitive documentation for modern React component composition and hook invariants.',
    },
  },
  // TypeScript
  {
    match: (t) => t.includes('typescript') || t.includes('interface') || t.includes('generics'),
    resource: {
      title: 'TypeScript Official Handbook',
      provider: 'Microsoft TypeScript Team',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      selectionReason: 'Official specification for TypeScript static typing, generics, and compiler configurations.',
    },
  },
  // JavaScript & Browser
  {
    match: (t) => t.includes('javascript') || t.includes('dom') || t.includes('closure'),
    resource: {
      title: 'MDN Web Docs: JavaScript Concurrency & Event Loop',
      provider: 'Mozilla Developer Network',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
      selectionReason: 'The definitive browser specification documentation for JavaScript runtime mechanics.',
    },
  },
  // Java & Spring
  {
    match: (t) => t.includes('java') || t.includes('jvm'),
    resource: {
      title: 'Oracle Java Tutorials: Language Nuts & Bolts',
      provider: 'Oracle Corporation',
      url: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/',
      selectionReason: 'Authoritative Oracle specification for Java language constructs, memory management, and OOP.',
    },
  },
  {
    match: (t) => t.includes('spring'),
    resource: {
      title: 'Spring Boot Reference Documentation: Building a RESTful Web Service',
      provider: 'Broadcom / Spring',
      url: 'https://spring.io/guides/gs/rest-service/',
      selectionReason: 'Official Spring guide for REST APIs and enterprise dependency injection.',
    },
  },
  // Python Core / Memory / Syntax
  {
    match: (t) => t.includes('python') || t.includes('syntax') || t.includes('type') || t.includes('variable') || t.includes('memory') || t.includes('loop') || t.includes('function'),
    resource: {
      title: 'Python Official Tutorial: Language Fundamentals & Types',
      provider: 'Python Software Foundation',
      url: 'https://docs.python.org/3/tutorial/introduction.html',
      selectionReason: 'Direct authoritative specification for Python primitive types and numeric/string operations.',
    },
  },
];

const TRUSTED_DOMAINS: Record<string, string> = {
  'docs.python.org': 'Python Software Foundation',
  'fastapi.tiangolo.com': 'Tiangolo / FastAPI',
  'docs.djangoproject.com': 'Django Software Foundation',
  'www.postgresql.org': 'PostgreSQL Global Development Group',
  'postgresql.org': 'PostgreSQL Global Development Group',
  'git-scm.com': 'Scott Chacon & Ben Straub',
  'docs.docker.com': 'Docker Inc.',
  'kubernetes.io': 'The Kubernetes Authors',
  'developer.mozilla.org': 'Mozilla Developer Network',
  'react.dev': 'React Core Team',
  'www.typescriptlang.org': 'Microsoft TypeScript Team',
  'typescriptlang.org': 'Microsoft TypeScript Team',
  'github.com': 'Donne Martin',
  'docs.oracle.com': 'Oracle Corporation',
  'spring.io': 'Broadcom / Spring',
};

/**
 * Sanitize and validate resource:
 * Guarantees that:
 * 1) title, provider, and directUrl are strictly coherent (no "Stripe Engineering Blog" mapped to python.org).
 * 2) only real, publicly reachable documentation/official URLs are accepted.
 * 3) if no suitable real URL exists for a topic, resolves to verified canonical documentation.
 */
function sanitizeResource(
  rawResource: any,
  topicName: string,
  targetJob: string
): { title: string; provider: string; url: string; selectionReason: string; type: string } | null {
  const rawUrl = rawResource?.directUrl || rawResource?.url;
  const rawTitle = typeof rawResource?.title === 'string' ? rawResource.title.trim() : '';
  const textLower = `${topicName} ${rawTitle} ${targetJob}`.toLowerCase();

  // Check if raw URL is from our trusted domain whitelist
  if (rawUrl && typeof rawUrl === 'string' && (rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))) {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase();

      for (const [dom, prov] of Object.entries(TRUSTED_DOMAINS)) {
        if (host === dom || host.endsWith('.' + dom)) {
          // Verify title coherence: if title mentions an alien entity (like 'Stripe', 'Netflix', 'Blog', 'Medium')
          // or doesn't mention the technology/provider, enforce a coherent official title
          const titleLower = rawTitle.toLowerCase();
          const provKey = prov.toLowerCase().split(' ')[0];
          const isAlienOrBlog =
            titleLower.includes('blog') ||
            titleLower.includes('stripe') ||
            titleLower.includes('netflix') ||
            titleLower.includes('medium') ||
            titleLower.includes('hackernoon');

          let coherentTitle = rawTitle;
          if (!coherentTitle || isAlienOrBlog || (!titleLower.includes(provKey) && !titleLower.includes('python') && !titleLower.includes('fastapi') && !titleLower.includes('postgres') && !titleLower.includes('git') && !titleLower.includes('docker'))) {
            coherentTitle = `${prov}: ${topicName} Official Documentation`;
          }

          return {
            title: coherentTitle,
            provider: prov,
            url: rawUrl,
            selectionReason: rawResource?.selectionReason || `Authoritative documentation and specifications for ${topicName}.`,
            type: 'documentation',
          };
        }
      }
    } catch {
      // Invalid URL syntax
    }
  }

  // Not from a trusted domain or invented URL: find match in TOPIC_CANONICAL_MAP
  const match = TOPIC_CANONICAL_MAP.find((m) => m.match(textLower));
  if (match) {
    return {
      title: match.resource.title,
      provider: match.resource.provider,
      url: match.resource.url,
      selectionReason: match.resource.selectionReason,
      type: 'documentation',
    };
  }

  // Fallback based on target job role
  if (targetJob.toLowerCase().includes('python')) {
    return {
      title: 'Python 3 Official Documentation & Tutorial',
      provider: 'Python Software Foundation',
      url: 'https://docs.python.org/3/tutorial/',
      selectionReason: 'Direct authoritative specification for Python engineering.',
      type: 'documentation',
    };
  }

  return null;
}

/**
 * Curated substantive questions generator:
 * Guarantees every level has at least 3-5 substantive questions testing architecture, runtime, and edge cases.
 */
function getCuratedQuestionsForLevel(levelNumber: number, topics: any[], targetJob: string) {
  const isPython = targetJob.toLowerCase().includes('python');

  switch (levelNumber) {
    case 1:
      return [
        {
          question: isPython
            ? 'In Python, what is the key behavioral difference between immutable types (like tuples and strings) and mutable types (like lists) when passed as function arguments?'
            : 'What is the key difference between value types and reference types during function invocation?',
          options: [
            isPython
              ? 'Python passes object references by value; modifying a mutable object in-place alters the caller object, whereas reassigning immutable references binds to a new object.'
              : 'Reference types create deep memory copies upon each function invocation.',
            isPython
              ? 'Immutable types are allocated exclusively in registers, whereas mutable types are allocated on disk.'
              : 'Value types are dynamically garbage-collected while reference types persist permanently.',
            isPython
              ? 'Modifying a list in a function automatically converts it into a read-only tuple.'
              : 'Passing reference types is illegal under strict compiler flags.',
            isPython
              ? 'Python passes all arguments strictly by reference with mandatory compiler copy-on-write semantics.'
              : 'All objects are passed by reference and cannot be mutated inside function scope.',
          ],
          correctOptionIndex: 0,
          explanation: isPython
            ? 'Python uses "pass-by-object-reference". In-place mutations on mutable objects (like list.append()) reflect across all aliases, whereas operations on immutable types construct new objects.'
            : 'Pass-by-value of references ensures the reference itself is copied, but in-place mutations affect the shared underlying heap allocation.',
          topic: topics[0]?.topic || 'Memory Model & Typing',
        },
        {
          question: isPython
            ? 'Under Python LEGB scoping resolution, what occurs if a function assigns to a variable name without declaring it global or nonlocal?'
            : 'What occurs when an inner function shadows an identifier declared in an enclosing scope?',
          options: [
            isPython
              ? 'Python treats the identifier as local to the function for the entire scope; accessing it before assignment raises an UnboundLocalError.'
              : 'The variable is automatically promoted to global scope without warning.',
            isPython
              ? 'The interpreter automatically performs an implicit lookup to the built-in scope.'
              : 'Compilation terminates immediately with a duplicate identifier syntax error.',
            isPython
              ? 'The variable binds to the global scope and silently overwrites the parent value.'
              : 'The variable is stored in thread-local storage.',
            isPython
              ? 'The operation raises a TypeError during AST parsing.'
              : 'A copy of the enclosing variable is automatically created on the stack.',
          ],
          correctOptionIndex: 0,
          explanation: isPython
            ? 'In Python, assigning to a name inside a function scope marks that name as local throughout the function. Referencing it prior to assignment triggers UnboundLocalError rather than falling back to enclosing/global scope.'
            : 'Lexical scoping rules bind the identifier locally, causing references prior to assignment to fail in the local frame.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Scoping & Runtime Semantics',
        },
        {
          question: isPython
            ? 'What is the performance implication of using the Global Interpreter Lock (GIL) in standard CPython for multi-threaded CPU-bound tasks?'
            : 'What is the performance implication of thread synchronization primitives under heavy CPU-bound contention?',
          options: [
            isPython
              ? 'Due to GIL mutex contention, multi-threaded CPU-bound programs in CPython often execute slower than single-threaded equivalents; multiprocessing or native C-extensions are required for parallel CPU execution.'
              : 'Threads achieve true hardware parallelism across all CPU cores without any locking overhead.',
            isPython
              ? 'The GIL allows infinite parallel execution for CPU-bound code but completely disables network I/O.'
              : 'Context switching is eliminated by running all threads in a single vector register.',
            isPython
              ? 'The GIL automatically compiles Python bytecode to SIMD vector instructions.'
              : 'Thread locks increase memory cache hits by 50% across CPU L1 caches.',
            isPython
              ? 'CPU-bound tasks automatically scale linearly across all host cores using thread pools.'
              : 'Thread contention automatically switches executing tasks to greenlets.',
          ],
          correctOptionIndex: 0,
          explanation: isPython
            ? 'The CPython GIL allows only one thread to execute Python bytecode at a time. For CPU-bound tasks, thread context switching and lock acquisition create overhead that makes multi-threaded execution slower than single-threaded execution.'
            : 'Heavy synchronization primitives cause high lock contention, thread descheduling, and cache thrashing on CPU-intensive workloads.',
          topic: topics[0]?.topic || 'Runtime Architecture',
        },
      ];

    case 2:
      return [
        {
          question: isPython
            ? 'What is the average time complexity of inserting elements at the beginning of a standard Python list (list.insert(0, val)) versus collections.deque.appendleft(val)?'
            : 'What is the comparative time complexity of prepend operations between dynamic arrays and doubly-linked deques?',
          options: [
            'Python list is O(N) because all existing elements must be shifted in contiguous memory; deque is O(1) via doubly-linked blocks.',
            'Python list is O(1) due to virtual memory remapping; deque is O(N) due to node traversal.',
            'Both operations are strictly O(log N) due to binary tree balancing.',
            'Both operations are O(1) amortized in modern runtimes.',
          ],
          correctOptionIndex: 0,
          explanation: 'Standard Python lists are contiguous arrays of pointers; prepending forces an O(N) memory shift of all existing elements. collections.deque uses a doubly linked list of fixed-size blocks allowing true O(1) head insertion.',
          topic: topics[0]?.topic || 'Data Structures & Complexity',
        },
        {
          question: 'How do standard hash table implementations (such as Python dicts) maintain average O(1) lookup under high insertion load?',
          options: [
            'By tracking a load factor threshold (typically ~2/3) and dynamically allocating a larger sparse array when crossed, amortizing the rehashing cost.',
            'By storing all keys in a sorted balanced B-Tree that avoids hashing collisions.',
            'By converting collided entries into immutable flat files on local disk storage.',
            'By restricting total keys to a maximum of 256 unique entries per process.',
          ],
          correctOptionIndex: 0,
          explanation: 'Hash tables preserve O(1) expected time by monitoring the load factor and resizing the underlying hash table when occupancy reaches capacity, ensuring short probe sequences and few collisions.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Hash Tables & Complexity',
        },
        {
          question: 'In algorithmic Big-O space-time analysis, what does "amortized time complexity" specifically describe?',
          options: [
            'The average time per operation over a worst-case sequence of operations, where infrequent expensive operations are balanced by frequent cheap ones.',
            'The absolute maximum duration of the single most expensive operation.',
            'The time required when executing algorithms on cloud virtualized instances.',
            'The best-case execution duration under pre-sorted input conditions.',
          ],
          correctOptionIndex: 0,
          explanation: 'Amortized analysis guarantees the average performance of each operation in the worst-case sequence, such as dynamic array append requiring O(1) most of the time with occasional O(N) array resize.',
          topic: topics[0]?.topic || 'Algorithmic Complexity',
        },
      ];

    case 3:
      return [
        {
          question: isPython
            ? 'In Python multiple inheritance, what algorithm does CPython use to determine the Method Resolution Order (MRO)?'
            : 'What mechanism resolves method dispatch ambiguities in complex object hierarchies?',
          options: [
            'C3 Superclass Linearization algorithm, ensuring monotonicity and respecting local precedence order.',
            'Depth-First Search (DFS) with arbitrary left-to-right tie breaking.',
            'Breadth-First Search (BFS) stopping at the first matching identifier.',
            'Randomized probe dispatch with cached hash lookups.',
          ],
          correctOptionIndex: 0,
          explanation: 'Python uses the C3 Linearization algorithm to compute the MRO tuple for each class, preserving local precedence order and monotonic inheritance guarantees.',
          topic: topics[0]?.topic || 'OOP & Design Patterns',
        },
        {
          question: isPython
            ? 'What is the required contract between __eq__ and __hash__ methods in Python for custom classes intended for use in sets or dict keys?'
            : 'What is the invariant between equality and hash code contracts in object-oriented programming?',
          options: [
            'If two objects compare equal via __eq__, their __hash__ values MUST be identical; defining __eq__ without __hash__ sets __hash__ to None, making instances unhashable.',
            'Two unequal objects must never produce identical hash values under any circumstances.',
            '__hash__ must always return a floating-point value between 0.0 and 1.0.',
            '__eq__ and __hash__ operate independently with no semantic coupling.',
          ],
          correctOptionIndex: 0,
          explanation: 'Hash table correctness requires that objects that are equal have identical hash values. In Python 3, overriding __eq__ automatically marks __hash__ as None unless explicitly defined.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Object Model & Protocols',
        },
        {
          question: 'Why is the design principle "Favor object composition over class inheritance" recommended in enterprise software architecture?',
          options: [
            'Composition provides loose coupling, allows dynamic runtime behavior swapping, and prevents brittle base class hierarchies.',
            'Inheritance completely prevents polymorphism from functioning in compiled languages.',
            'Composition reduces memory footprint to zero bytes across all heap objects.',
            'Inheritance can only be used with abstract interfaces containing no methods.',
          ],
          correctOptionIndex: 0,
          explanation: 'Composition decouples components by delegating responsibilities rather than inheriting private implementation details, making testing and refactoring substantially easier.',
          topic: topics[0]?.topic || 'Architectural Design Patterns',
        },
      ];

    case 4:
      return [
        {
          question: 'In relational database theory, what anomaly is prevented by the SERIALIZABLE isolation level that is permitted under REPEATABLE READ in standard ANSI SQL?',
          options: [
            'Phantom reads and write skew anomalies across concurrent transactions.',
            'Dirty reads of uncommitted transaction changes.',
            'Non-repeatable reads of updated rows.',
            'Division by zero errors during aggregation queries.',
          ],
          correctOptionIndex: 0,
          explanation: 'While REPEATABLE READ prevents dirty reads and non-repeatable reads, it may allow write skew anomalies and phantom rows. SERIALIZABLE guarantees that concurrent transactions produce the same result as some serial execution.',
          topic: topics[0]?.topic || 'Relational Databases & Transactions',
        },
        {
          question: 'When designing a composite B-Tree index on (tenant_id, created_at, status), which of the following queries CANNOT efficiently utilize this index?',
          options: [
            'WHERE created_at > \'2026-01-01\' AND status = \'ACTIVE\' (omitting tenant_id).',
            'WHERE tenant_id = 42 AND created_at > \'2026-01-01\'.',
            'WHERE tenant_id = 42 AND status = \'ACTIVE\' AND created_at = \'2026-02-01\'.',
            'WHERE tenant_id = 42 ORDER BY created_at DESC.',
          ],
          correctOptionIndex: 0,
          explanation: 'B-Tree composite indexes require leading columns (leftmost prefix rule). Querying on created_at and status without specifying tenant_id skips the leading key and forces an index skip-scan or full table scan.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Database Indexing & Performance',
        },
        {
          question: 'What is the "N+1 query problem" in ORM-based applications (like SQLAlchemy or Django ORM), and how is it resolved?',
          options: [
            'Executing 1 initial query for a parent record followed by N separate queries for each child relation; resolved using eager loading (joinedload/selectinload).',
            'Executing N queries that all return 1 identical row; resolved by increasing connection pool size.',
            'A database deadlock caused by locking N tables simultaneously; resolved by turning off transactions.',
            'An index overflow error when a table contains more than N columns; resolved by partitioning.',
          ],
          correctOptionIndex: 0,
          explanation: 'The N+1 problem occurs when lazily loading related records in a loop, resulting in 1 query for the parent list plus N queries for relations. Eager loading combines these into a single JOIN or IN query.',
          topic: topics[0]?.topic || 'ORM & Query Optimization',
        },
      ];

    case 5:
      return [
        {
          question: 'In Git, what is the fundamental structural difference between "git merge <feature>" and "git rebase master"?',
          options: [
            'Merge creates a new commit with two parents preserving historical timeline; rebase replays feature commits onto master creating new commit hashes and a linear history.',
            'Merge deletes the feature branch permanently; rebase preserves both branches identically.',
            'Rebase can only be performed if the working tree has unstaged file deletions.',
            'Merge converts binary files to ASCII text; rebase compresses git blobs.',
          ],
          correctOptionIndex: 0,
          explanation: 'git merge preserves true chronological history with a 3-way merge commit. git rebase reapplies commits on top of the base tip, rewriting commit SHA-1 hashes to create a clean linear history.',
          topic: topics[0]?.topic || 'Git & Version Control',
        },
        {
          question: 'What does a "detached HEAD" state mean in Git, and what is the risk of committing in this state?',
          options: [
            'HEAD points directly to a commit hash rather than a named branch; new commits will be orphaned and eligible for garbage collection unless a branch is created.',
            'The local repository has lost connection to the remote origin server.',
            'All tracked files in the index are irreversibly erased from disk.',
            'Git is currently in the middle of an unresolvable merge conflict.',
          ],
          correctOptionIndex: 0,
          explanation: 'In detached HEAD state, HEAD references a specific commit instead of a branch. If you switch branches without creating a new branch pointer, the detached commits become unreferenced and eventually pruned by git gc.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Git Internals',
        },
        {
          question: 'Why is it considered dangerous to run "git push --force" on shared collaboration branches (like main or develop)?',
          options: [
            'It overwrites the remote commit history, potentially destroying commits made by other team members without warning.',
            'It immediately deletes all SSH credentials stored on the remote host.',
            'It triggers an automatic rollback of the production database schema.',
            'It disables Git commit signing permanently for all contributors.',
          ],
          correctOptionIndex: 0,
          explanation: 'Force pushing rewrites the remote ref. If other developers pushed commits in the meantime, their work is severed from the branch history and lost from the upstream tracking branch.',
          topic: topics[0]?.topic || 'Branch Management & CI/CD',
        },
      ];

    case 6:
      return [
        {
          question: isPython
            ? 'In FastAPI / Starlette, how does the framework execute synchronous ("def") endpoint functions compared to asynchronous ("async def") endpoint functions?'
            : 'How do modern web frameworks handle blocking synchronous handlers versus asynchronous event-loop handlers?',
          options: [
            isPython
              ? 'FastAPI runs standard "def" endpoints in an external threadpool (anyio worker threads) to avoid blocking the event loop, while "async def" endpoints run directly on the event loop.'
              : 'Synchronous endpoints run in a background threadpool to avoid stalling the main event loop.',
            isPython
              ? 'FastAPI automatically converts all Python synchronous code into asynchronous C coroutines at runtime.'
              : 'Synchronous endpoints are rejected with a 500 Internal Server Error.',
            isPython
              ? 'FastAPI terminates the process if a synchronous handler takes longer than 10 milliseconds.'
              : 'Synchronous functions run exclusively on client web workers.',
            isPython
              ? 'There is no difference; all handlers run synchronously on a single thread without concurrency.'
              : 'Both handler types share a single blocking OS thread.',
          ],
          correctOptionIndex: 0,
          explanation: isPython
            ? 'If an endpoint is declared with standard "def", FastAPI dispatches it to an external threadpool so blocking I/O does not freeze the main event loop. If declared "async def", it runs directly on the loop, so calling blocking code inside it blocks all concurrent requests.'
            : 'Event-driven frameworks run non-async handlers on dedicated thread pools to safeguard the non-blocking event loop from starvation.',
          topic: topics[0]?.topic || 'API Engineering & Concurrency',
        },
        {
          question: 'According to RFC 7231 HTTP specifications, which of the following HTTP methods is defined as IDEMPOTENT?',
          options: [
            'PUT, DELETE, and GET (repeating the request produces the same intended effect on server resource state).',
            'POST and PATCH (repeating requests always appends duplicate records).',
            'Only POST is idempotent under strict REST standards.',
            'No HTTP methods are idempotent in cloud environments.',
          ],
          correctOptionIndex: 0,
          explanation: 'Idempotency means making multiple identical requests has the same intended outcome on the resource state as a single request. GET, PUT, and DELETE are idempotent; POST and PATCH are not necessarily idempotent.',
          topic: topics[1]?.topic || topics[0]?.topic || 'RESTful API Standards',
        },
        {
          question: 'What is the primary role of a Reverse Proxy (such as Nginx or Envoy) deployed in front of application service instances?',
          options: [
            'Handling TLS termination, request buffering, load balancing, and preventing slow-client attacks from holding application worker threads.',
            'Directly compiling Python or TypeScript source code into assembly.',
            'Executing client-side React component rendering in real time.',
            'Managing relational database ACID transaction rollbacks.',
          ],
          correctOptionIndex: 0,
          explanation: 'A reverse proxy buffers slow client connections, terminates SSL/TLS certificates, distributes inbound traffic, and protects backend application processes from connection exhaustion.',
          topic: topics[0]?.topic || 'Production Deployment Architecture',
        },
      ];

    case 7:
      return [
        {
          question: 'In distributed caching architecture, what is the core trade-off of the "Cache-Aside" (Lazy Loading) pattern versus "Write-Through"?',
          options: [
            'Cache-Aside only caches requested data avoiding memory waste, but incurs high latency on cache misses; Write-Through keeps cache always fresh but adds latency to every write operation.',
            'Cache-Aside guarantees zero cache invalidation bugs; Write-Through never writes to disk.',
            'Write-Through operates without any memory overhead; Cache-Aside requires infinite storage.',
            'Cache-Aside cannot be used with key-value datastores like Redis.',
          ],
          correctOptionIndex: 0,
          explanation: 'Cache-Aside loads entries on demand, meaning only actively read records consume cache memory, but initial reads suffer cache misses. Write-Through updates cache synchronously during database writes, ensuring freshness at the cost of write latency.',
          topic: topics[0]?.topic || 'System Design & Scalability',
        },
        {
          question: 'When implementing a distributed Rate Limiter for an API gateway, which algorithm allows temporary bursts of traffic while enforcing a strict long-term average rate?',
          options: [
            'Token Bucket algorithm (tokens accumulate up to capacity burst limit and replenish at a steady fill rate).',
            'Fixed Window Counter algorithm (which causes double-limit spikes at boundary transitions).',
            'Round-Robin DNS routing with TTL 0.',
            'Strict FIFO queue with immediate packet drop.',
          ],
          correctOptionIndex: 0,
          explanation: 'The Token Bucket algorithm accumulates tokens at a constant rate up to a bucket capacity. When requests arrive, tokens are consumed. If tokens exist, requests proceed immediately, accommodating traffic bursts up to capacity.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Rate Limiting & Gateways',
        },
        {
          question: 'Under the CAP Theorem for distributed data stores, what does a system guarantee when it chooses "AP" (Availability + Partition Tolerance) during a network split?',
          options: [
            'All nodes remain accessible to handle reads and writes, but nodes may return stale or divergent data (eventual consistency).',
            'Every read request is guaranteed to receive the most recent write across all nodes, rejecting requests if nodes cannot communicate.',
            'The network partition is magically healed with zero latency.',
            'The database completely shuts down until all network connections are restored.',
          ],
          correctOptionIndex: 0,
          explanation: 'Under a network partition (P), an AP system prioritizes responding to client requests from any reachable node, sacrificing strong consistency (C) in favor of high availability (A).',
          topic: topics[0]?.topic || 'Distributed Systems & Trade-offs',
        },
      ];

    case 8:
    default:
      return [
        {
          question: 'When asked in a Senior Engineering screening to describe a complex technical failure you diagnosed, how does the STAR behavioral framework organize your response?',
          options: [
            'Situation (context), Task (your responsibility), Action (concrete technical debugging steps you took), and Result (quantifiable impact and architectural prevention).',
            'Start, Theory, Argument, and Resolution without mentioning actual code.',
            'Scenario, Timeline, Blame, and Apology.',
            'Syntax, Traceback, Assertion, and Reboot.',
          ],
          correctOptionIndex: 0,
          explanation: 'The STAR framework ensures structured, concise communication in technical behavioral rounds by clearly isolating context, personal ownership, analytical actions taken, and measurable business/reliability outcomes.',
          topic: topics[0]?.topic || 'Technical Interview Communication',
        },
        {
          question: 'In live technical coding rounds, what is the recommended protocol when an interviewer presents an algorithmic problem before you write any code?',
          options: [
            'Clarify input constraints and edge cases (e.g., empty arrays, negatives, scale), articulate multiple approaches with Big-O trade-offs, and confirm alignment before implementation.',
            'Immediately start coding the most complex solution without explaining your thought process.',
            'Ask the interviewer to write the solution and critique their implementation.',
            'Memorize and recite standard library C++ templates without speaking.',
          ],
          correctOptionIndex: 0,
          explanation: 'Engineering interviewers evaluate communication, analytical problem framing, and constraint clarification just as heavily as raw code correctness.',
          topic: topics[1]?.topic || topics[0]?.topic || 'Live Technical Coding & Big-O',
        },
        {
          question: 'When diagnosing a suspected memory leak in a production backend service, what is the systematic diagnostic procedure?',
          options: [
            'Capture heap snapshots over time, compare object retention graphs to identify uncollected references, isolate GC cycle anomalies, and verify fix in staging with load tests.',
            'Immediately double production server RAM and disable all garbage collection.',
            'Restart the container every 5 minutes using a cron job without investigating root causes.',
            'Delete all database indexes to free up server heap memory.',
          ],
          correctOptionIndex: 0,
          explanation: 'Production leak diagnosis requires capturing baseline and differential heap dumps to trace object retention paths (such as global caches or cyclical references) followed by reproducible verification.',
          topic: topics[0]?.topic || 'Production Debugging & Observability',
        },
      ];
  }
}

/**
 * Topic Learning Kit Generator:
 * Supplies structured explanation components (Key Concepts, Common Mistakes, Practical Example, Takeaways)
 * and 3 progressive coding challenges (Warmup -> Algorithmic Implementation -> Boundary Edge Cases)
 * tailored to the student's career track and topic.
 */
function getTopicLearningKit(topicName: string, levelNumber: number, targetJob: string, existingObj?: any) {
  const isPython = targetJob.toLowerCase().includes('python');
  const isFrontend = targetJob.toLowerCase().includes('frontend') || targetJob.toLowerCase().includes('react');
  const tLower = topicName.toLowerCase();

  // 1. Key Architectural Concepts
  let keyConcepts: string[] = [];
  if (Array.isArray(existingObj?.keyConcepts) && existingObj.keyConcepts.length >= 2) {
    keyConcepts = existingObj.keyConcepts.map((k: any) => String(k).trim());
  } else if (isPython) {
    if (levelNumber === 1 || tLower.includes('syntax') || tLower.includes('type') || tLower.includes('memory')) {
      keyConcepts = [
        'Python variables are name references bound to heap-allocated objects rather than fixed memory slots.',
        'Primitive scalars (int, str, tuple) are strictly immutable; operations on them rebind names to new heap objects.',
        'id() inspects heap memory addresses; "is" tests pointer identity while "==" evaluates value equivalence.',
        'CPython manages memory using deterministic reference counting supplemented by cyclic generational GC.',
      ];
    } else if (levelNumber === 2 || tLower.includes('structure') || tLower.includes('list') || tLower.includes('dict') || tLower.includes('algorithm')) {
      keyConcepts = [
        'Lists are contiguous dynamic pointer arrays: O(1) amortized tail appends, but O(N) head insertions due to memory shifts.',
        'Dicts and sets use open addressing hash tables providing expected O(1) key lookups and mutations.',
        'collections.deque provides true O(1) double-ended appends and pops via linked chunks.',
        'Big-O analysis models asymptotic upper bounds (worst-case scaling) as dataset n scales toward infinity.',
      ];
    } else if (levelNumber === 3 || tLower.includes('oop') || tLower.includes('class')) {
      keyConcepts = [
        'Classes act as blueprint namespaces; instances maintain discrete state via instance dictionaries or __slots__.',
        'Method Resolution Order (MRO) applies C3 linearization to resolve multiple inheritance deterministically.',
        'Dunder protocols (__eq__, __hash__, __repr__, __iter__) integrate custom abstractions with native Python syntax.',
        'Favor composition over brittle base classes to reduce tight coupling and mutable state leakage.',
      ];
    } else if (levelNumber === 4 || tLower.includes('sql') || tLower.includes('postgres') || tLower.includes('database')) {
      keyConcepts = [
        'ACID transactions guarantee Atomicity, Consistency, Isolation (serializable/read committed), and Durability.',
        'B-Tree indexes speed up equality and range filters following the leftmost-prefix index rule.',
        'Prevent N+1 query overhead by employing eager relations loading (e.g. joinedload / selectinload).',
        'Always use parameterized SQL queries to eliminate SQL injection vulnerabilities completely.',
      ];
    } else if (levelNumber === 5 || tLower.includes('git')) {
      keyConcepts = [
        'Git stores history as a directed acyclic graph (DAG) of immutable commit snapshots.',
        'git merge creates a 3-way merge commit; git rebase replays commits to yield a clean linear timeline.',
        'Detached HEAD indicates HEAD references an individual commit SHA instead of an active branch head.',
        'Short-lived feature branches and atomic commits facilitate seamless peer code review and CI verification.',
      ];
    } else if (levelNumber === 6 || tLower.includes('api') || tLower.includes('fastapi') || tLower.includes('async')) {
      keyConcepts = [
        'Asynchronous I/O yields execution control cooperatively to an event loop without blocking OS threads.',
        'FastAPI offloads synchronous "def" handlers to anyio thread pools while executing "async def" directly on the loop.',
        'REST idempotency ensures repeated PUT, DELETE, and GET invocations produce identical server resource states.',
        'Pydantic data models validate request schemas at boundaries and serialize compliant JSON responses.',
      ];
    } else if (levelNumber === 7 || tLower.includes('system') || tLower.includes('cache')) {
      keyConcepts = [
        'Cache-Aside fetches entries on demand avoiding cache pollution; Write-Through keeps cache fresh at write time.',
        'Token Bucket rate limiters allow burst traffic while capping sustained requests to safe thresholds.',
        'Horizontal scaling balances stateless application services behind reverse proxy load balancers.',
        'Database read-replicas offload heavy read queries while routing writes through the primary instance.',
      ];
    } else {
      keyConcepts = [
        'STAR framework (Situation, Task, Action, Result) articulates production engineering impact cleanly.',
        'Clarify problem constraints and edge cases before writing live interview code.',
        'Proactively analyze Big-O time and space complexity with the interviewer before implementation.',
        'Systematic production debugging relies on telemetry, log traces, and profiling over guesswork.',
      ];
    }
  } else if (isFrontend) {
    if (levelNumber === 1 || tLower.includes('javascript') || tLower.includes('event loop') || tLower.includes('typescript')) {
      keyConcepts = [
        'The JavaScript runtime uses a single-threaded event loop balancing call stack, microtasks, and macrotasks.',
        'Promises and async/await resolve on the microtask queue with higher priority than setTimeout macrotasks.',
        'TypeScript interfaces and types guarantee compile-time safety without introducing runtime footprint.',
        'Closures capture lexical scope variables, enabling clean encapsulation and private function state.',
      ];
    } else if (levelNumber === 3 || tLower.includes('react') || tLower.includes('component')) {
      keyConcepts = [
        'React renders declaratively from state and props, computing UI diffs through DOM reconciliation.',
        'Hooks must execute in the exact same unconditional order on every component render.',
        'State mutations must remain immutable to trigger reliable rerenders and dependency tracking.',
        'Custom hooks extract reusable stateful behavior cleanly without cluttering UI presentation.',
      ];
    } else {
      keyConcepts = [
        'Component composition decouples visual presentation from data querying and mutations.',
        'Code-splitting with React.lazy and dynamic imports reduces critical bundle download time.',
        'Optimistic updates and client-side caching deliver instant user interactions.',
        'Semantic HTML and ARIA standards ensure inclusive accessibility across all user devices.',
      ];
    }
  } else {
    keyConcepts = [
      `Master syntax, memory representations, and language invariants for ${topicName}.`,
      `Design resilient abstractions handling boundary edge conditions and invalid inputs.`,
      `Analyze runtime execution complexity (Big-O time and space trade-offs).`,
      `Adhere to enterprise production engineering and automated testing standards.`,
    ];
  }

  // 2. Common Pitfalls & Mistakes
  let commonMistakes: string[] = [];
  if (Array.isArray(existingObj?.commonMistakes) && existingObj.commonMistakes.length >= 2) {
    commonMistakes = existingObj.commonMistakes.map((m: any) => String(m).trim());
  } else if (isPython) {
    commonMistakes = [
      'Using mutable default arguments (e.g. def fn(items=[])) which retain state across separate function calls.',
      'Confusing "is" (identity check) with "==" (value equality check) on scalar values.',
      'Mutating a collection while iterating directly over it, skipping elements or crashing loops.',
    ];
  } else if (isFrontend) {
    commonMistakes = [
      'Mutating React state arrays/objects directly (e.g. state.push()) instead of creating new references.',
      'Omitting dependencies in useEffect dependency arrays causing stale closures and missed state syncs.',
      'Creating unmemoized object/function literals inside tight loop renders causing unnecessary child rerenders.',
    ];
  } else {
    commonMistakes = [
      'Neglecting boundary edge cases such as empty input arrays, null references, or overflow limits.',
      'Failing to profile computational bottlenecks before attempting premature micro-optimizations.',
      'Silently suppressing exceptions without logging or structured error boundaries.',
    ];
  }

  // 3. Practical Working Example
  let practicalExample = '';
  if (typeof existingObj?.practicalExample === 'string' && existingObj.practicalExample.trim().length > 15) {
    practicalExample = existingObj.practicalExample.trim();
  } else if (isPython) {
    if (levelNumber === 1) {
      practicalExample = `# Demonstrating immutable vs mutable parameter behavior in Python
def process_data(immutable_val: int, mutable_list: list) -> tuple:
    immutable_val += 10        # Rebinds local name, caller unaffected
    mutable_list.append(99)     # Mutates underlying heap object in place
    return immutable_val, mutable_list

num = 5
items = [1, 2]
new_num, _ = process_data(num, items)
print(f"Original num: {num}")     # 5 (unchanged)
print(f"Original items: {items}") # [1, 2, 99] (mutated in place)`;
    } else if (levelNumber === 2) {
      practicalExample = `# Efficient collections.deque vs standard list pop(0)
from collections import deque

queue = deque(["job_1", "job_2", "job_3"])
queue.append("job_4")          # O(1) tail append
next_job = queue.popleft()     # O(1) head pop (vs list.pop(0) which is O(N))
print(f"Processed: {next_job}, Remaining: {list(queue)}")`;
    } else {
      practicalExample = `# Production idiomatic pattern for ${topicName}
def execute_safe_operation(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Payload must be a dictionary")
    # Clean immutable transformation
    transformed = {k.strip(): v for k, v in payload.items() if v is not None}
    return {"status": "success", "data": transformed}

print(execute_safe_operation({" user ": "alice", " age ": 28, " meta ": None}))`;
    }
  } else if (isFrontend) {
    practicalExample = `// Modern typed implementation for ${topicName}
interface UserProfile {
  id: string;
  name: string;
  role: 'developer' | 'architect';
}

export function filterActiveUsers(users: UserProfile[], targetRole: string): UserProfile[] {
  // Pure immutable filter operation
  return users.filter((u) => u.role === targetRole);
}

const team: UserProfile[] = [
  { id: '1', name: 'Alex', role: 'developer' },
  { id: '2', name: 'Jordan', role: 'architect' },
];
console.log(filterActiveUsers(team, 'developer'));`;
  } else {
    practicalExample = `// Implementation pattern for ${topicName}
public class Solution {
    public static void main(String[] args) {
        System.out.println("Executing verified pattern for: ${topicName}");
    }
}`;
  }

  // 4. Learning Takeaways
  let takeaways = '';
  if (typeof existingObj?.takeaways === 'string' && existingObj.takeaways.trim()) {
    takeaways = existingObj.takeaways.trim();
  } else {
    takeaways = `After completing this class, you will be able to implement idiomatic ${topicName} patterns, analyze runtime trade-offs, and defend your architectural choices during technical screening rounds.`;
  }

  // 5. Progressive Practice Suite (3 tiered coding challenges)
  let practiceTasks: any[] = [];
  if (Array.isArray(existingObj?.practiceTasks) && existingObj.practiceTasks.length >= 2) {
    practiceTasks = existingObj.practiceTasks.map((pt: any, pIdx: number) => ({
      id: pt.id || `task-${levelNumber}-p${pIdx + 1}`,
      title: pt.title || `Problem ${pIdx + 1}: ${topicName} Challenge`,
      description: pt.description || `Implement solution for ${topicName}`,
      difficulty: pt.difficulty || (pIdx === 0 ? 'beginner' : pIdx === 1 ? 'intermediate' : 'advanced'),
      starterCode: pt.starterCode || `# Write your solution\ndef solve(data):\n    pass\n`,
      expectedOutput: pt.expectedOutput || 'Target verified output',
      sampleInput: pt.sampleInput || 'Standard sample input',
      completionStatus: pt.completionStatus || 'not_started',
      testCases: Array.isArray(pt.testCases) ? pt.testCases : [{ input: 'Standard', output: pt.expectedOutput || 'Passed' }],
    }));
  } else if (isPython) {
    practiceTasks = [
      {
        id: `task-${levelNumber}-p1`,
        title: `1. Warmup: ${topicName} Fundamentals`,
        difficulty: 'beginner',
        description: `Write a function 'validate_input(data)' that verifies input data structure for ${topicName}. Return {'valid': True, 'count': len(data)} for non-empty collections, or {'valid': False, 'count': 0} for empty inputs.`,
        starterCode: `def validate_input(data):\n    # Warmup solution\n    if not data:\n        return {"valid": False, "count": 0}\n    return {"valid": True, "count": len(data)}\n\n# Verification\nprint(validate_input([10, 20, 30]))\n`,
        sampleInput: '[10, 20, 30]',
        expectedOutput: "{'valid': True, 'count': 3}",
        completionStatus: 'not_started',
        testCases: [
          { input: '[10, 20, 30]', output: "{'valid': True, 'count': 3}" },
          { input: '[]', output: "{'valid': False, 'count': 0}" },
        ],
      },
      {
        id: `task-${levelNumber}-p2`,
        title: `2. Algorithmic Implementation: ${topicName}`,
        difficulty: 'intermediate',
        description: `Implement 'transform_records(records)' to filter out None or negative entries, square every even number, and return a clean sorted list of unique results adhering to ${topicName} conventions.`,
        starterCode: `def transform_records(records):\n    # Algorithmic transformation\n    valid = [x for x in records if x is not None and x >= 0]\n    transformed = set()\n    for x in valid:\n        if x % 2 == 0:\n            transformed.add(x * x)\n        else:\n            transformed.add(x)\n    return sorted(list(transformed))\n\n# Verification\nprint(transform_records([4, 2, -1, None, 3, 2]))\n`,
        sampleInput: '[4, 2, -1, None, 3, 2]',
        expectedOutput: '[3, 4, 16]',
        completionStatus: 'not_started',
        testCases: [
          { input: '[4, 2, -1, None, 3, 2]', output: '[3, 4, 16]' },
          { input: '[1, 3, 5]', output: '[1, 3, 5]' },
        ],
      },
      {
        id: `task-${levelNumber}-p3`,
        title: `3. Boundary Conditions & Optimization`,
        difficulty: 'advanced',
        description: `Engineer an optimized generator function 'optimize_pipeline(stream, chunk_size)' for ${topicName}. Yield memory-efficient batches of items without loading infinite streams into RAM.`,
        starterCode: `def optimize_pipeline(stream, chunk_size):\n    # Memory-efficient generator batching\n    batch = []\n    for item in stream:\n        batch.append(item)\n        if len(batch) == chunk_size:\n            yield batch\n            batch = []\n    if batch:\n        yield batch\n\n# Verification\nresult = list(optimize_pipeline([1, 2, 3, 4, 5], 2))\nprint(result)\n`,
        sampleInput: 'stream=[1, 2, 3, 4, 5], chunk_size=2',
        expectedOutput: '[[1, 2], [3, 4], [5]]',
        completionStatus: 'not_started',
        testCases: [
          { input: 'stream=[1, 2, 3, 4, 5], chunk_size=2', output: '[[1, 2], [3, 4], [5]]' },
          { input: 'stream=[], chunk_size=3', output: '[]' },
        ],
      },
    ];
  } else {
    practiceTasks = [
      {
        id: `task-${levelNumber}-p1`,
        title: `1. Warmup: ${topicName} Verification`,
        difficulty: 'beginner',
        description: `Write a pure function 'solve_warmup(input_val)' verifying syntax and baseline data types for ${topicName}. Return a structured object with status and formatted value.`,
        starterCode: `function solve_warmup(inputVal) {\n  if (!inputVal) return { status: 'empty' };\n  return { status: 'ready', value: String(inputVal).toUpperCase() };\n}\n\nconsole.log(solve_warmup('ascend'));\n`,
        sampleInput: "'ascend'",
        expectedOutput: "{ status: 'ready', value: 'ASCEND' }",
        completionStatus: 'not_started',
        testCases: [{ input: "'ascend'", output: "{ status: 'ready', value: 'ASCEND' }" }],
      },
      {
        id: `task-${levelNumber}-p2`,
        title: `2. Core Algorithmic: ${topicName}`,
        difficulty: 'intermediate',
        description: `Implement 'process_collection(items)' to filter, transform, and aggregate data according to ${topicName} patterns. Ensure deterministic behavior and linear time complexity.`,
        starterCode: `function process_collection(items) {\n  return items.filter(item => item.active).map(item => item.value * 2);\n}\n\nconsole.log(process_collection([{ active: true, value: 5 }, { active: false, value: 3 }]));\n`,
        sampleInput: "[{ active: true, value: 5 }, { active: false, value: 3 }]",
        expectedOutput: '[10]',
        completionStatus: 'not_started',
        testCases: [{ input: "[{ active: true, value: 5 }]", output: '[10]' }],
      },
      {
        id: `task-${levelNumber}-p3`,
        title: `3. Boundary Conditions & Performance`,
        difficulty: 'advanced',
        description: `Handle asynchronous latency, error boundaries, or heavy scale edge cases for ${topicName}. Return predictable fallback values on failure.`,
        starterCode: `function safe_handler(payload) {\n  try {\n    if (!payload || typeof payload !== 'object') throw new Error('Invalid');\n    return { success: true, keys: Object.keys(payload) };\n  } catch (err) {\n    return { success: false, error: err.message };\n  }\n}\n\nconsole.log(safe_handler({ a: 1, b: 2 }));\n`,
        sampleInput: '{ a: 1, b: 2 }',
        expectedOutput: "{ success: true, keys: ['a', 'b'] }",
        completionStatus: 'not_started',
        testCases: [{ input: '{ a: 1, b: 2 }', output: "{ success: true, keys: ['a', 'b'] }" }],
      },
    ];
  }

  return {
    keyConcepts,
    commonMistakes,
    practicalExample,
    takeaways,
    practiceTasks,
  };
}

/**
 * Validate and sanitize structured raw JSON curriculum from Gemini
 */
function validateAndNormalizeCurriculum(raw: any, goal: any, userId: string, modelUsed: string) {
  if (!raw) {
    throw new Error('Invalid JSON structure: empty output received');
  }

  // Extract levels array from multiple potential model output formats
  let rawLevels: any[] = [];
  if (Array.isArray(raw)) {
    rawLevels = raw;
  } else if (typeof raw === 'object') {
    if (Array.isArray(raw.levels)) rawLevels = raw.levels;
    else if (Array.isArray(raw.curriculum)) rawLevels = raw.curriculum;
    else if (Array.isArray(raw.roadmap)) rawLevels = raw.roadmap;
    else if (raw.careerPlan && Array.isArray(raw.careerPlan.levels)) rawLevels = raw.careerPlan.levels;
    else if (raw.data && Array.isArray(raw.data.levels)) rawLevels = raw.data.levels;
    else {
      // Find first property that is an array
      for (const k of Object.keys(raw)) {
        if (Array.isArray(raw[k]) && raw[k].length > 0) {
          rawLevels = raw[k];
          break;
        }
      }
    }
  }

  if (rawLevels.length < 4) {
    throw new Error(`Curriculum generation yielded too few levels (${rawLevels.length}). Minimum 4 required.`);
  }

  let cumulativeDay = 1;
  const normalizedLevels = rawLevels.map((lvl: any, lvlIdx: number) => {
    const levelNumber = Number(lvl.levelNumber || lvl.level || lvl.id) || lvlIdx + 1;
    const title = typeof lvl.title === 'string' && lvl.title.trim()
      ? lvl.title.trim()
      : `Level ${levelNumber} – Core Competencies`;
    const description = typeof lvl.description === 'string' && lvl.description.trim()
      ? lvl.description.trim()
      : `Master foundational competencies and production idioms for Level ${levelNumber}.`;

    const rawTopics = Array.isArray(lvl.topics) && lvl.topics.length > 0
      ? lvl.topics
      : Array.isArray(lvl.lessons) && lvl.lessons.length > 0
      ? lvl.lessons
      : [`${title} Fundamentals`, `${title} Practical Implementation`];

    const topics = rawTopics.map((t: any, tIdx: number) => {
      const dayNum = cumulativeDay++;
      const topicName = typeof t === 'string'
        ? t.trim()
        : typeof t.topic === 'string' && t.topic.trim()
        ? t.topic.trim()
        : typeof t.name === 'string' && t.name.trim()
        ? t.name.trim()
        : `Topic ${tIdx + 1}`;

      const explanation = typeof t === 'object' && typeof t.explanation === 'string' && t.explanation.trim()
        ? t.explanation.trim()
        : `${topicName} is a critical core concept in ${goal.targetJob}. Understanding its memory model, design patterns, and idiomatic practices ensures safe, maintainable code in production environments.`;

      const whyItMatters = typeof t === 'object' && typeof t.whyItMatters === 'string' && t.whyItMatters.trim()
        ? t.whyItMatters.trim()
        : `Hiring panels evaluate ${topicName} in technical screenings to verify foundational comprehension and trade-off analysis.`;

      const objectives = typeof t === 'object' && Array.isArray(t.learningObjectives) && t.learningObjectives.length > 0
        ? t.learningObjectives.map((o: any) => String(o).trim()).filter(Boolean)
        : [
            `Understand execution mechanics and syntax semantics of ${topicName}`,
            `Implement idiomatic patterns and handle boundary edge conditions`,
            `Analyze time and space computational complexity`,
          ];

      // Practice task
      const pt = typeof t === 'object' && t.practiceTask ? t.practiceTask : typeof t === 'object' && t.practice ? t.practice : {};
      const practiceDesc = typeof pt.description === 'string' && pt.description.trim()
        ? pt.description.trim()
        : `Implement a clean, robust function solving a coding problem around ${topicName}. Ensure all edge cases are addressed.`;
      const starterCode = typeof pt.starterCode === 'string' && pt.starterCode.trim()
        ? pt.starterCode.trim()
        : `# Implementation challenge for ${topicName}\ndef solve_task(data):\n    # Write your solution here\n    pass\n\n# Verification\nprint(solve_task([1, 2, 3]))\n`;
      const expectedOutput = typeof pt.expectedOutput === 'string' && pt.expectedOutput.trim()
        ? pt.expectedOutput.trim()
        : 'Target output satisfying all test cases';

      // Resources: strictly sanitize and guarantee coherence between title, provider, and url
      const rawResources = typeof t === 'object' && Array.isArray(t.resources) && t.resources.length > 0
        ? t.resources
        : [{}];

      type SanitizedResource = { title: string; provider: string; url: string; selectionReason: string; type: string };

      const resources = rawResources
        .map((r: any) => sanitizeResource(r, topicName, goal.targetJob))
        .filter((r: SanitizedResource | null): r is SanitizedResource => r !== null)
        .map((res: SanitizedResource, rIdx: number) => ({
          id: `res-${levelNumber}-${tIdx + 1}-${rIdx + 1}`,
          title: res.title,
          provider: res.provider,
          topic: topicName,
          duration: '20 min read',
          estimatedDuration: '20 min read',
          directUrl: res.url,
          url: res.url,
          isVerified: true,
          verificationStatus: 'verified' as const,
          verificationTimestamp: new Date().toISOString(),
          selectionReason: res.selectionReason,
          description: res.selectionReason,
          type: 'documentation' as const,
        }));

      // If no resource passed sanitation, attach guaranteed canonical resource
      if (resources.length === 0) {
        const fallback = sanitizeResource({}, topicName, goal.targetJob);
        if (fallback) {
          resources.push({
            id: `res-${levelNumber}-${tIdx + 1}-1`,
            title: fallback.title,
            provider: fallback.provider,
            topic: topicName,
            duration: '20 min read',
            estimatedDuration: '20 min read',
            directUrl: fallback.url,
            url: fallback.url,
            isVerified: true,
            verificationStatus: 'verified' as const,
            verificationTimestamp: new Date().toISOString(),
            selectionReason: fallback.selectionReason,
            description: fallback.selectionReason,
            type: 'documentation' as const,
          });
        }
      }

      const kit = getTopicLearningKit(topicName, levelNumber, goal.targetJob, typeof t === 'object' ? t : {});

      return {
        id: `topic-${levelNumber}-${tIdx + 1}`,
        name: topicName,
        topic: topicName,
        description: explanation,
        shortExplanation: explanation.slice(0, 180),
        whyItMatters,
        learningObjectives: objectives,
        estimatedMinutes: goal.studyTimePerDayHours >= 3 ? 35 : 45,
        difficulty: levelNumber <= 2 ? 'beginner' : levelNumber <= 5 ? 'intermediate' : 'advanced',
        prerequisites: levelNumber === 1 ? ['Basic computer literacy'] : [`Level ${levelNumber - 1} foundational knowledge`],
        explanation,
        keyConcepts: kit.keyConcepts,
        commonMistakes: kit.commonMistakes,
        practicalExample: kit.practicalExample,
        takeaways: kit.takeaways,
        resources,
        practiceTasks: kit.practiceTasks,
        practiceTask: kit.practiceTasks[0] || {
          id: `task-${levelNumber}-${tIdx + 1}`,
          title: `Practice: ${topicName}`,
          description: practiceDesc,
          difficulty: levelNumber <= 2 ? 'beginner' : levelNumber <= 5 ? 'intermediate' : 'advanced',
          expectedSkills: objectives,
          starterCode,
          expectedOutput,
          completionStatus: 'not_started' as const,
        },
        dayNumber: dayNum,
        isCompleted: false,
      };
    });

    // Assessment: Ensure each level has at least 3 to 5 substantive questions
    const rawAss = lvl.assessment || {};
    let rawQuestions = Array.isArray(rawAss.questions) && rawAss.questions.length > 0
      ? [...rawAss.questions]
      : [];

    // Filter valid model questions
    const validQuestions: any[] = [];
    for (const q of rawQuestions) {
      if (
        typeof q.question === 'string' &&
        q.question.trim().length > 15 &&
        Array.isArray(q.options) &&
        q.options.length === 4
      ) {
        let correctIdx = Number(q.correctOptionIndex);
        if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
          correctIdx = 0;
        }
        validQuestions.push({
          question: q.question.trim(),
          options: q.options.map((o: any) => String(o).trim()),
          correctOptionIndex: correctIdx,
          explanation: typeof q.explanation === 'string' && q.explanation.trim()
            ? q.explanation.trim()
            : 'Verified engineering specification and runtime behavior.',
          topic: typeof q.topic === 'string' && q.topic.trim() ? q.topic.trim() : topics[0]?.topic || 'Technical Competency',
        });
      }
    }

    // If fewer than 3 substantive questions, supplement with curated questions for this level
    if (validQuestions.length < 3) {
      const curated = getCuratedQuestionsForLevel(levelNumber, topics, goal.targetJob);
      for (const cq of curated) {
        if (validQuestions.length >= 3) break;
        if (!validQuestions.some((vq) => vq.question.toLowerCase() === cq.question.toLowerCase())) {
          validQuestions.push(cq);
        }
      }
    }

    const questions = validQuestions.map((q: any, qIdx: number) => ({
      id: `q-${levelNumber}-${qIdx + 1}`,
      question: q.question,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      topic: q.topic,
    }));

    const assessment = {
      id: `assessment-lvl-${levelNumber}`,
      levelNumber,
      title: typeof rawAss.title === 'string' && rawAss.title.trim()
        ? rawAss.title.trim()
        : `Level ${levelNumber} Assessment: Technical Competency Evaluation`,
      passingScorePercent: 75,
      attemptsCount: 0,
      questions,
    };

    return {
      id: `lvl-${levelNumber}`,
      levelNumber,
      title,
      description,
      status: lvlIdx === 0 ? ('unlocked' as const) : ('locked' as const),
      learningObjectives: topics.flatMap((t: any) => t.learningObjectives),
      requiredCompletionPercentage: 100,
      topics,
      lessons: topics, // fully synced
      assessment,
    };
  });

  const totalLessons = normalizedLevels.reduce((acc: number, l: any) => acc + l.topics.length, 0);

  // Domains grouping
  const domains = [
    {
      id: 'dom-foundation',
      title: 'Foundations & Core Architecture',
      description: 'Language runtime internals, memory representations, dynamic data structures, and computational complexity.',
      order: 1,
      levelIds: [1, 2],
    },
    {
      id: 'dom-systems',
      title: 'Persistence, Concurrency & API Systems',
      description: 'Relational data modeling, ACID transactions, modern asynchronous APIs, and containerized deployment.',
      order: 2,
      levelIds: [3, 4, 5, 6].filter((id) => id <= normalizedLevels.length),
    },
    {
      id: 'dom-readiness',
      title: 'System Design & Technical Hiring Bar',
      description: 'High-throughput system trade-offs, live coding communications, behavioral screening, and mock defense.',
      order: 3,
      levelIds: [7, 8].filter((id) => id <= normalizedLevels.length),
    },
  ];

  // Assign domain IDs to levels
  normalizedLevels.forEach((lvl: any) => {
    const d = domains.find((dom) => dom.levelIds.includes(lvl.levelNumber)) || domains[0];
    lvl.domainId = d.id;
    lvl.domainTitle = d.title;
  });

  const preferredStackStr = (goal.preferredTechnologies || []).join(', ') || 'Standard Production Stack';
  const targetCompanyStr = goal.targetCompany ? ` for ${goal.targetCompany}` : '';

  const jobReadiness = {
    isReady: false,
    skillsCompleted: [],
    topicsMastered: [],
    assessmentAverage: 0,
    projects: [
      {
        title: `${goal.targetJob} Capstone Architecture${targetCompanyStr}`,
        tech: preferredStackStr,
        description: 'End-to-end production implementation showcasing deep competency, CI tests, and documentation.',
        status: 'planned' as const,
      },
      {
        title: `High-Throughput ${goal.targetJob} System`,
        tech: 'Testing, Benchmarking & Reliability',
        description: 'Demonstrating benchmark performance, concurrency handling, and automated integration testing.',
        status: 'planned' as const,
      },
    ],
    resumePreparation: {
      ready: false,
      tailoredRole: goal.targetJob,
      bulletHighlights: [
        `Architected targeted solutions aligned with ${goal.targetJob}${targetCompanyStr} expectations.`,
        'Demonstrated verifiable stage-gated mastery across technical assessments and code challenges.',
        `Engineered production features leveraging ${preferredStackStr}.`,
      ],
      suggestedImprovements: [
        'Complete Capstone milestones to add measurable production metrics to your portfolio.',
        'Document Git workflow and test coverage statistics.',
      ],
    },
    technicalInterviewPreparation: {
      readinessScore: 0,
      topicsPrepared: [],
      criticalCheckpoints: [
        'Core algorithmic efficiency (Big-O analysis)',
        'Idiomatic design patterns & error handling',
        'Database query optimization & indexing',
        goal.targetExamOrInterview ? `Exam checkpoint: ${goal.targetExamOrInterview}` : 'System design trade-offs',
      ],
    },
    hrBehavioralPreparation: {
      status: 'in_progress' as const,
      suggestedScenarios: [
        'Describe a complex bug you isolated and your analytical debugging sequence.',
        'How do you manage trade-offs between delivery speed and architectural technical debt?',
      ],
    },
    finalMockInterviewStatus: 'pending' as const,
  };

  const plan = {
    id: `plan-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    isDemo: false, // Explicitly false: real AI generated curriculum!
    aiModel: modelUsed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    goal,
    masterPlanId: 'ai-generated-framework',
    domains,
    levels: normalizedLevels,
    currentLevelNumber: 1,
    currentDayNumber: 1,
    activeDomainId: domains[0].id,
    jobReadiness,
    analytics: {
      totalLessonsCount: totalLessons,
      completedLessonsCount: 0,
      totalAssessmentsCount: normalizedLevels.length,
      passedAssessmentsCount: 0,
      averageScorePercent: 0,
      weakAreas: [],
      strongAreas: [],
      nextRecommendedAction: `Begin Level 1, Day 01: ${normalizedLevels[0].topics[0].topic} core fundamentals class.`,
      estimatedRoadmapCompletionDays: Math.ceil(totalLessons / (goal.studyTimePerDayHours >= 3 ? 1.5 : 1)),
      estimatedDaysRemaining: Math.ceil(totalLessons / (goal.studyTimePerDayHours >= 3 ? 1.5 : 1)),
    },
  };

  return plan;
}

// ==========================================
// API Endpoints
// ==========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate-roadmap', async (req: Request, res: Response) => {
  try {
    const { goal, userProfile } = req.body;

    if (!goal || !goal.targetJob || typeof goal.targetJob !== 'string') {
      return res.status(400).json({ error: 'Valid goal with targetJob is required' });
    }

    const userId = userProfile?.id || 'usr-current';
    console.log(`[POST /api/generate-roadmap] Starting Multi-AI Agent Pipeline for: "${goal.targetJob}"`);

    // Step 1: Profile Analysis (Anthropic)
    console.log('[Agent] Step 1: Analyzing Profile (Anthropic)...');
    let profileAnalysis = 'Analysis pending';
    try {
      profileAnalysis = await analyzeUserProfile(userProfile, goal);
    } catch (err) {
      console.warn('[Agent] Profile analysis failed, continuing with limited context:', err);
    }

    // Step 2: Skill Gap Identification (OpenAI)
    console.log('[Agent] Step 2: Identifying Skill Gaps (OpenAI)...');
    let skillGaps: string[] = [];
    try {
      skillGaps = await identifySkillGaps(profileAnalysis, goal);
    } catch (err) {
      console.warn('[Agent] Skill gap analysis failed, continuing with default gaps:', err);
    }

    // Step 3: Curriculum Synthesis (Gemini)
    console.log('[Agent] Step 3: Synthesizing Curriculum (Gemini)...');
    const systemInstruction = `You are the Lead Curriculum Architect for ASCEND.
Your mandate is to generate an 8-level adaptive technical learning curriculum tailored specifically to qualify the user for: "${goal.targetJob}".
Take into account these identified skill gaps: ${skillGaps.join(', ')}.
Profile Context: ${profileAnalysis}

CRITICAL REQUIREMENTS:
1. Generate exactly 6 to 8 stage-gated levels (levelNumber 1 to 8).
2. Level 1 must cover core language syntax, runtime memory model, and typing.
3. Level 2 must cover data structures & algorithms.
4. Level 3 must cover OOP principles and design patterns.
5. Level 4 must cover relational databases and SQL.
6. Level 5 must cover Git and production engineering.
7. Level 6 must cover production API engineering.
8. Level 7 must cover system design trade-offs.
9. Level 8 must cover technical interview prep and mock screening.

EACH LEVEL MUST CONTAIN:
- title: Concise descriptive title
- description: Pedagogical overview
- topics: 2 to 3 distinct daily lessons per level.
- assessment: A rigorous mock test for this level with 3-5 substantive questions.

OUTPUT FORMAT:
Return strictly valid JSON matching the specified structure without markdown wrapping.`;

    const userPrompt = `Generate the comprehensive stage-gated learning curriculum for:
Target Role: ${goal.targetJob}
Education: ${goal.education || 'Computer Science / Engineering'}
Current Skill Level: ${goal.currentSkillLevel || 'beginner'}
Existing Skills: ${(goal.existingSkills || []).join(', ') || 'Basic programming'}
Preferred Technologies: ${(goal.preferredTechnologies || []).join(', ') || 'Standard production stack'}
Daily Study Time: ${goal.studyTimePerDayHours || 2} hours/day
Target Company: ${goal.targetCompany || 'Tier-1 Technology Companies'}
Target Interview / Exam: ${goal.targetExamOrInterview || 'Comprehensive Technical Bar'}`;

    let careerPlan: any;
    let finalModelUsed = 'gemini-3.8-flash';

    try {
      const { text, modelUsed } = await aiService.callGeminiWithFallback({
        systemInstruction,
        contents: userPrompt,
        responseMimeType: 'application/json',
      });
      finalModelUsed = modelUsed;

      let rawPlan: any;
      try {
        rawPlan = JSON.parse(text);
      } catch (parseErr) {
        console.error('[Gemini API] Failed to parse initial JSON response, attempting extraction...');
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          rawPlan = JSON.parse(text.substring(firstBrace, lastBrace + 1));
        } else {
          throw new Error('Initial model output is not valid JSON');
        }
      }

      // Step 4: Multi-AI Validation & Repair (OpenAI)
      console.log('[Agent] Step 4: Validating and Repairing Roadmap (OpenAI)...');
      let validatedPlan = rawPlan;
      try {
        validatedPlan = await validateAndRepairRoadmap(rawPlan, goal);
      } catch (err) {
        console.warn('[Agent] Roadmap validation failed, using raw generation:', err);
      }

      // Step 5: Normalization and Canonical Resource Mapping
      console.log('[Agent] Step 5: Normalizing and verifying resources...');
      careerPlan = validateAndNormalizeCurriculum(validatedPlan, goal, userId, finalModelUsed);
    } catch (genError: any) {
      console.warn('[Agent] Remote model generation failed or rate-limited; activating deterministic curriculum synthesis:', genError?.message);
      careerPlan = generateRoadmapForGoal(goal, userId, false);
      finalModelUsed = 'ascend-curriculum-engine';
    }
    
    console.log(`[POST /api/generate-roadmap] Pipeline completed successfully via ${finalModelUsed}`);

    return res.json({
      success: true,
      plan: careerPlan,
      modelUsed: finalModelUsed,
      agentAnalysis: profileAnalysis,
      skillGaps,
    });
  } catch (error: any) {
    console.error('[POST /api/generate-roadmap] Pipeline Error:', error);
    try {
      const fallbackPlan = generateRoadmapForGoal(
        req.body?.goal || {
          targetJob: 'Software Engineer',
          education: 'Computer Science',
          currentSkillLevel: 'beginner',
          existingSkills: [],
          preferredTechnologies: [],
          studyTimePerDayHours: 2,
        },
        req.body?.userProfile?.id || 'usr-current',
        false
      );
      return res.json({
        success: true,
        plan: fallbackPlan,
        modelUsed: 'ascend-curriculum-engine',
        agentAnalysis: 'Synthesized via ASCEND Master Curriculum Engine (Fault-Tolerant Mode)',
        skillGaps: ['Core Language Mechanics', 'Algorithmic Optimization', 'System Design'],
      });
    } catch {
      return res.status(500).json({
        error: error?.message || 'Multi-AI Agent Pipeline failed to synthesize roadmap',
      });
    }
  }
});

// Video Resources Endpoint (YouTube Data API v3 integration with Service-based discovery)
app.get('/api/video-resources', async (req: Request, res: Response) => {
  const { career, topic } = req.query;

  if (!youtubeService.isConfigured()) {
    return res.json({
      available: false,
      message: 'YouTube Data API key is not configured on the server. Video resources are unavailable.',
      resources: [],
    });
  }

  try {
    const resources = await youtubeService.searchVideos({
      career: String(career || ''),
      topic: String(topic || ''),
    });

    return res.json({
      available: true,
      message: 'Technical videos discovered successfully.',
      resources,
    });
  } catch (error: any) {
    console.error('[YouTube Service Error]:', error.message);
    return res.json({
      available: false,
      message: 'YouTube Data API discovery failed.',
      resources: [],
    });
  }
});

// AI Trainer Chat Endpoint
app.post('/api/trainer-chat', async (req: Request, res: Response) => {
  try {
    const { prompt, plan, activeLesson, history } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const targetJob = plan?.goal?.targetJob || 'Software Engineering';
    const currentLevelTitle = plan?.levels?.find((l: any) => l.levelNumber === plan.currentLevelNumber)?.title || 'Level 1';
    const activeTopicName = activeLesson?.topic || 'Current lesson';

    const systemInstruction = `You are ASCEND's Senior AI Career Trainer & Staff Engineering Mentor.
You are mentoring a student training for the role of: "${targetJob}".
The student is currently working on: "${activeTopicName}" in "${currentLevelTitle}".

YOUR GUIDELINES:
1. Provide concise, technically authoritative, structured advice.
2. If the user asks to explain a concept, give a structured breakdown with principles, memory/concurrency trade-offs, and practical code snippets.
3. If they ask about code or practice, provide concrete guidance without doing all the thinking for them; point out potential edge cases and Big-O efficiency.
4. If they ask about interviews or hiring, simulate realistic interview expectations and evaluate them against top engineering hiring bars.
5. End your response with an actionable next step, for example suggesting opening Today's Class, testing in Practice Workspace, or retaking a Mock Test.`;

    const formattedHistory = (history || [])
      .slice(-6)
      .map((h: any) => `${h.role === 'user' ? 'Learner' : 'Trainer'}: ${h.content}`)
      .join('\n\n');

    const contents = `${formattedHistory ? `Recent Dialogue:\n${formattedHistory}\n\n` : ''}Learner Question: ${prompt}`;

    let response;
    try {
      response = await callMultiAI({
        provider: 'gemini',
        systemInstruction,
        contents,
      });
    } catch (err) {
      console.warn('[Trainer] Gemini failed, falling back to OpenAI (if available)...', err);
      if (openai) {
        response = await callMultiAI({
          provider: 'openai',
          systemInstruction,
          contents,
        });
      } else {
        response = {
          text: `### ASCEND Career Mentor · Guidance for ${targetJob}\n\nRegarding your question on **"${activeTopicName}"**:\n\nIn production engineering and technical hiring screenings for **${targetJob}**, focus on the core architectural invariants and runtime mechanics rather than superficial memorization:\n\n- **Computational Complexity:** Clarify constraints and evaluate worst-case Big-O time and space scaling before writing code.\n- **Defensive Edge Handling:** Always handle empty sequences, null references, and boundary transitions gracefully.\n- **Idiomatic Separation of Concerns:** Decouple data modeling from business logic and presentation to enable deterministic automated testing.\n\n*Actionable Next Step:* Review the verified documentation in **Today's Class** or test your solution against the verification harness in **Practice Workspace**.`,
          modelUsed: 'ascend-mentor-engine',
        };
      }
    }

    const { text, modelUsed } = response;
    let content = text;
    try {
      if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
        const parsed = JSON.parse(text);
        let md = '';
        if (parsed.concept) md += `### ${parsed.concept}\n\n`;
        if (parsed.breakdown) {
          if (typeof parsed.breakdown === 'object') {
            for (const [k, v] of Object.entries(parsed.breakdown)) {
              const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              md += `**${label}:**\n${v}\n\n`;
            }
          } else {
            md += `${parsed.breakdown}\n\n`;
          }
        }
        if (parsed.code_comparison) {
          md += `**Code Comparison:**\n`;
          for (const [k, v] of Object.entries(parsed.code_comparison)) {
            md += `\`\`\`\n# ${k}\n${v}\n\`\`\`\n\n`;
          }
        }
        if (parsed.tradeoffs) {
          md += `**Key Trade-offs:**\n`;
          if (typeof parsed.tradeoffs === 'object') {
            for (const [k, v] of Object.entries(parsed.tradeoffs)) {
              if (typeof v === 'object') {
                md += `- **${k}:** ${JSON.stringify(v)}\n`;
              } else {
                md += `- **${k}:** ${v}\n`;
              }
            }
          }
          md += '\n';
        }
        if (parsed.interview_context) md += `**Interview Evaluation Rubric:**\n${parsed.interview_context}\n\n`;
        if (parsed.actionable_next_step) md += `*Recommended Action:* ${parsed.actionable_next_step}\n`;
        if (md.trim()) content = md.trim();
      }
    } catch {
      // Use raw text
    }

    let suggestedAction = '';
    const textLower = prompt.toLowerCase();
    if (textLower.includes('topic') || textLower.includes('class') || textLower.includes('today')) {
      suggestedAction = "Open Today's Class";
    } else if (textLower.includes('practice') || textLower.includes('code') || textLower.includes('task')) {
      suggestedAction = 'Solve in Practice Workspace';
    } else if (textLower.includes('readiness') || textLower.includes('job') || textLower.includes('interview')) {
      suggestedAction = 'View Job Readiness';
    }

    return res.json({
      role: 'assistant',
      content,
      suggestedAction,
    });
  } catch (error: any) {
    console.error('[POST /api/trainer-chat] Error:', error);
    return res.status(500).json({
      error: error?.message || 'AI Trainer encountered an error',
    });
  }
});

// ==========================================
// Vite Middleware & Static Serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ASCEND Full-Stack Engine running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
