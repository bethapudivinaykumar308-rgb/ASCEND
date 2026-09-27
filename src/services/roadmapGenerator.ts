import {
  UserGoal,
  RoadmapLevel,
  DailyLesson,
  Topic,
  LevelAssessment,
  JobReadiness,
  CareerPlan,
  LearningResource,
  VerificationStatus,
  ResourceType,
} from '../types';
import { masterPlanService } from './masterPlanService';
import { LevelTemplate } from './templates/types';
import { getFrontendDeveloperLevels } from './templates/frontendTrack';
import { getJavaDeveloperLevels } from './templates/javaTrack';
import { getAIMLEngineerLevels, getDataScienceLevels, getDataAnalystLevels } from './templates/dataTracks';
import { getDevOpsLevels, getCybersecurityLevels, getGeneralSoftwareEngineerLevels } from './templates/systemsTracks';

export type { LevelTemplate };

export function generateRoadmapForGoal(goal: UserGoal, userId: string, isDemo = false): CareerPlan {
  const target = goal.targetJob.trim().toLowerCase();
  const masterPlan = masterPlanService.getMasterPlanForRole(goal.targetJob);

  let levelTemplates: LevelTemplate[];

  // Tailored structures based on target role
  if (target.includes('python') || target.includes('django') || target.includes('fastapi')) {
    levelTemplates = getPythonDeveloperLevels(goal);
  } else if (target.includes('java') && !target.includes('javascript')) {
    levelTemplates = getJavaDeveloperLevels(goal);
  } else if (target.includes('cyber') || target.includes('security') || target.includes('infosec') || target.includes('pentest')) {
    levelTemplates = getCybersecurityLevels(goal);
  } else if (target.includes('analyst') && !target.includes('data sci')) {
    levelTemplates = getDataAnalystLevels(goal);
  } else if (target.includes('ai') || target.includes('machine learning') || target.includes('ml ') || target.endsWith('ml') || target.includes('deep learning')) {
    levelTemplates = getAIMLEngineerLevels(goal);
  } else if (target.includes('data sci') || target.includes('scientist')) {
    levelTemplates = getDataScienceLevels(goal);
  } else if (target.includes('devops') || target.includes('cloud') || target.includes('kubernetes') || target.includes('sre')) {
    levelTemplates = getDevOpsLevels(goal);
  } else if (target.includes('front') || target.includes('react') || target.includes('web') || target.includes('full stack') || target.includes('fullstack') || target.includes('node') || target.includes('javascript')) {
    levelTemplates = getFrontendDeveloperLevels(goal);
  } else {
    levelTemplates = getGeneralSoftwareEngineerLevels(goal);
  }

  // Construct structured levels with stage-gated locking and sequential days without gaps
  let cumulativeDay = 1;
  const levels: RoadmapLevel[] = levelTemplates.map((lvl, index) => {
    // Level 1 is unlocked by default; Level 2+ locked until previous assessment passed
    const status = index === 0 ? 'unlocked' : 'locked';

    // Find parent domain from master plan
    const matchedDomain = masterPlan.domains.find((d) => d.levelIds.includes(lvl.levelNumber)) || masterPlan.domains[0];

    const topics: Topic[] = lvl.topics.map((t, tIdx) => {
      const dayNum = cumulativeDay++;
      const normalizedResources: LearningResource[] = t.resources.map((r) => ({
        ...r,
        url: r.directUrl,
        verificationStatus: r.isVerified ? 'verified' : 'unverified',
        verificationTimestamp: r.isVerified ? '2026-03-20T00:00:00Z' : undefined,
      }));

      // Check if learner has existing skills that cover this foundational topic
      const isCoveredByExistingSkills =
        goal.existingSkills &&
        goal.existingSkills.some((skill) => {
          const s = skill.trim().toLowerCase();
          return s.length > 2 && (t.topic.toLowerCase().includes(s) || s.includes(t.topic.toLowerCase()));
        });

      // If user is intermediate/advanced and topic matches existing skills in Level 1, mark completed
      const preCompleted = Boolean(isCoveredByExistingSkills && (index === 0 || goal.currentSkillLevel === 'advanced'));

      const topicDifficulty =
        goal.currentSkillLevel === 'advanced'
          ? 'advanced'
          : goal.currentSkillLevel === 'intermediate' && lvl.levelNumber >= 2
          ? 'intermediate'
          : lvl.levelNumber <= 2
          ? 'beginner'
          : lvl.levelNumber <= 5
          ? 'intermediate'
          : 'advanced';

      return {
        id: `topic-${lvl.levelNumber}-${tIdx + 1}`,
        name: t.topic,
        topic: t.topic,
        description: preCompleted ? `${t.explanation} (Pre-qualified based on your existing skills)` : t.explanation,
        whyItMatters: t.explanation,
        learningObjectives: t.objectives,
        estimatedMinutes: goal.studyTimePerDayHours >= 3 ? 35 : 45,
        difficulty: topicDifficulty,
        prerequisites: lvl.levelNumber === 1 ? ['Basic computer literacy'] : [`Level ${lvl.levelNumber - 1} foundational knowledge`],
        explanation: t.explanation,
        shortExplanation: t.explanation,
        resources: normalizedResources,
        practiceTask: {
          id: `task-${lvl.levelNumber}-${tIdx + 1}`,
          description: t.practice.description,
          difficulty: topicDifficulty,
          expectedSkills: t.objectives,
          starterCode: t.practice.starterCode,
          expectedOutput: t.practice.expectedOutput,
          completionStatus: preCompleted ? 'passed' : 'not_started',
        },
        dayNumber: dayNum,
        isCompleted: preCompleted,
        completedAt: preCompleted ? new Date().toISOString() : undefined,
      };
    });

    const assessment: LevelAssessment = {
      id: `assessment-lvl-${lvl.levelNumber}`,
      levelNumber: lvl.levelNumber,
      title: lvl.assessmentTitle,
      passingScorePercent: 75,
      attemptsCount: 0,
      questions: lvl.questions.map((q, qIdx) => ({
        id: `q-${lvl.levelNumber}-${qIdx + 1}`,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctIndex,
        explanation: q.explanation,
        topic: q.topic,
      })),
    };

    return {
      id: `lvl-${lvl.levelNumber}`,
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      description: lvl.description,
      domainId: matchedDomain?.id,
      domainTitle: matchedDomain?.title,
      status,
      learningObjectives: lvl.topics.flatMap((t) => t.objectives),
      requiredCompletionPercentage: 100,
      topics,
      lessons: topics as DailyLesson[], // fully synced
      assessment,
    };
  });

  const totalLessons = levels.reduce((acc, l) => acc + l.lessons.length, 0);
  const completedLessons = levels.reduce((acc, l) => acc + l.lessons.filter((les) => les.isCompleted).length, 0);

  const preferredStackStr = (goal.preferredTechnologies || []).join(', ') || 'Standard Production Stack';
  const targetCompanyStr = goal.targetCompany ? ` for ${goal.targetCompany}` : '';

  const jobReadiness: JobReadiness = {
    isReady: false,
    skillsCompleted: [],
    topicsMastered: levels.flatMap((l) => l.lessons.filter((les) => les.isCompleted).map((les) => les.topic)),
    assessmentAverage: 0,
    projects: [
      {
        title: `${goal.targetJob} Capstone Architecture${targetCompanyStr}`,
        tech: preferredStackStr,
        description: 'End-to-end production implementation showcasing deep competency, CI tests, and documentation.',
        status: 'planned',
      },
      {
        title: `High-Throughput ${goal.targetJob} System`,
        tech: 'Testing, Benchmarking & Reliability',
        description: 'Demonstrating benchmark performance, concurrency handling, and automated integration testing.',
        status: 'planned',
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
      status: 'in_progress',
      suggestedScenarios: [
        'Describe a complex bug you isolated and your analytical debugging sequence.',
        'How do you manage trade-offs between delivery speed and architectural technical debt?',
      ],
    },
    finalMockInterviewStatus: 'pending',
  };

  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    isDemo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    goal,
    masterPlanId: masterPlan.id,
    domains: masterPlan.domains,
    levels,
    currentLevelNumber: 1,
    currentDayNumber: 1,
    activeDomainId: masterPlan.domains[0]?.id,
    jobReadiness,
    analytics: {
      totalLessonsCount: totalLessons,
      completedLessonsCount: completedLessons,
      totalAssessmentsCount: levels.length,
      passedAssessmentsCount: 0,
      averageScorePercent: 0,
      weakAreas: [],
      strongAreas: completedLessons > 0 ? ['Pre-qualified baseline skills'] : [],
      nextRecommendedAction: 'Begin Level 1, Day 01: Core fundamentals class.',
      estimatedRoadmapCompletionDays: Math.ceil(totalLessons / (goal.studyTimePerDayHours >= 3 ? 1.5 : 1)),
      estimatedDaysRemaining: Math.ceil((totalLessons - completedLessons) / (goal.studyTimePerDayHours >= 3 ? 1.5 : 1)),
    },
  };
}

// Python Developer Track Template
function getPythonDeveloperLevels(_goal?: UserGoal): LevelTemplate[] {
  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Python Fundamentals',
      description: 'Master core execution models, dynamic typing, control structures, and container idioms.',
      assessmentTitle: 'Level 1 Assessment: Python Fundamentals & Data Types',
      topics: [
        {
          topic: 'Variables, Memory Model & Type System',
          explanation: 'Python uses reference-based assignment where variables point to objects in heap memory. Understanding mutability vs immutability prevents subtle runtime state corruption.',
          objectives: [
            'Understand id(), type(), and object references in memory',
            'Distinguish between mutable (lists, dicts) and immutable (ints, strings, tuples) types',
            'Master formatted string literals (f-strings) and type hints',
          ],
          practice: {
            description: 'Write a function `analyze_types(values)` that takes a list of mixed values and returns a dictionary counting the frequency of each primitive type name.',
            starterCode: `def analyze_types(values: list) -> dict:\n    # Return a dict with type names as keys and counts as values\n    pass\n\n# Test call\nprint(analyze_types([1, "ascend", 3.14, True, 42]))`,
            expectedOutput: `{"int": 2, "str": 1, "float": 1, "bool": 1}`,
          },
          resources: [
            {
              id: 'r-py-101',
              title: 'Python Official Tutorial: An Informal Introduction to Python',
              provider: 'Python Software Foundation',
              topic: 'Python Types & Syntax',
              duration: '20 min read',
              directUrl: 'https://docs.python.org/3/tutorial/introduction.html',
              isVerified: true,
              selectionReason: 'Direct authoritative specification for Python primitive types and numeric/string operations.',
              type: 'documentation',
            },
            {
              id: 'r-py-102',
              title: 'Python Variables & Memory Management (Deep Dive)',
              provider: 'Corey Schafer',
              topic: 'Variable Assignment & Mutability',
              duration: '18 mins',
              directUrl: 'https://www.youtube.com/watch?v=_AEJHKGk9ns',
              isVerified: true,
              selectionReason: 'Visual explanation of Python identity (id), value comparison (== vs is), and memory pointers.',
              type: 'video',
            },
          ],
        },
        {
          topic: 'Lists, Slicing & List Comprehensions',
          explanation: 'Python lists are dynamic contiguous arrays. Slicing provides O(k) sub-array creation, while list comprehensions offer clean declarative transformations.',
          objectives: [
            'Master extended slice syntax `[start:stop:step]` with negative indices',
            'Write expressive, readable list comprehensions with inline conditionals',
            'Recognize the time complexity of list operations (append vs insert vs pop(0))',
          ],
          practice: {
            description: 'Write a function `extract_even_squares(numbers)` using a single list comprehension that returns squares of only even positive numbers.',
            starterCode: `def extract_even_squares(numbers: list[int]) -> list[int]:\n    # Implement using a single list comprehension\n    return []\n\nprint(extract_even_squares([-4, 2, 3, 4, 5, 6]))`,
            expectedOutput: `[4, 16, 36]`,
          },
          resources: [
            {
              id: 'r-py-103',
              title: 'Data Structures: More on Lists',
              provider: 'Python Software Foundation',
              topic: 'List methods & Comprehensions',
              duration: '15 min read',
              directUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
              isVerified: true,
              selectionReason: 'Official documentation covering list methods, list comprehensions, and nested sequences.',
              type: 'documentation',
            },
            {
              id: 'r-py-104',
              title: 'Python Tutorial: List Comprehensions',
              provider: 'Corey Schafer',
              topic: 'Comprehensions in Depth',
              duration: '19 mins',
              directUrl: 'https://www.youtube.com/watch?v=3dt4OGnU5sM',
              isVerified: true,
              selectionReason: 'Focused strictly on list comprehensions with clear comparative examples versus classic for-loops.',
              type: 'video',
            },
          ],
        },
        {
          topic: 'Dictionaries & Sets: Hash Map Internals',
          explanation: 'Dictionaries and sets rely on hash tables for average O(1) lookups. Keys must be hashable, meaning their hash value remains invariant during their lifecycle.',
          objectives: [
            'Understand hash tables, key hashing, and collision avoidance principles',
            'Use dict comprehension, .get() with fallbacks, and set operations (&, |, -)',
            'Avoid using mutable objects as dictionary keys',
          ],
          practice: {
            description: 'Write `group_by_frequency(items)` that returns elements grouped by how many times they appear.',
            starterCode: `def group_by_frequency(items: list) -> dict:\n    # Return dict where key is count, value is list of unique items\n    pass\n\nprint(group_by_frequency(["a", "b", "a", "c", "b", "a"]))`,
            expectedOutput: `{3: ["a"], 2: ["b"], 1: ["c"]}`,
          },
          resources: [
            {
              id: 'r-py-105',
              title: 'Dictionaries & Set Types in Python',
              provider: 'Real Python',
              topic: 'Hash Maps & Dictionaries',
              duration: '22 min read',
              directUrl: 'https://realpython.com/python-dicts/',
              isVerified: true,
              selectionReason: 'In-depth breakdown of hash table mechanics, dictionary performance, and idiomatic methods.',
              type: 'article',
            },
          ],
        },
        {
          topic: 'Functions, *args, **kwargs & Scope (LEGB)',
          explanation: 'Python functions are first-class objects. Variable resolution follows the LEGB rule (Local, Enclosing, Global, Built-in).',
          objectives: [
            'Pass arguments with positional unpacking (*args) and keyword unpacking (**kwargs)',
            'Understand closure mechanics and function references',
            'Handle default mutable argument hazards properly (`def func(x=None)` pattern)',
          ],
          practice: {
            description: 'Implement a decorator `measure_and_validate(min_val)` that raises ValueError if the returned integer is below `min_val`.',
            starterCode: `def validate_min(min_val: int):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            res = func(*args, **kwargs)\n            if res < min_val:\n                raise ValueError(f"Result {res} below minimum {min_val}")\n            return res\n        return wrapper\n    return decorator\n\n@validate_min(10)\ndef compute(): return 15\nprint(compute())`,
            expectedOutput: `15`,
          },
          resources: [
            {
              id: 'r-py-106',
              title: 'Defining Functions & Keyword Arguments',
              provider: 'Python Software Foundation',
              topic: 'Functions & Scopes',
              duration: '18 min read',
              directUrl: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
              isVerified: true,
              selectionReason: 'Standard guide to function signatures, keyword-only arguments, and lambda expressions.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the consequence of defining a function with a default parameter like `def append_to(val, target=[])`?',
          options: [
            'A new empty list is created every time the function is invoked without arguments.',
            'The default list is instantiated once at function definition time and shared across subsequent calls.',
            'Python raises a SyntaxError because mutable defaults are explicitly banned.',
            'The default list is automatically garbage collected immediately after execution.',
          ],
          correctIndex: 1,
          explanation: 'Default arguments in Python are evaluated once at definition time, making mutable defaults like lists persistent across calls.',
          topic: 'Functions & Default Arguments',
        },
        {
          question: 'What is the average time complexity for checking membership (`item in collection`) in a Python set vs a Python list?',
          options: [
            'Set: O(n) | List: O(1)',
            'Set: O(1) | List: O(n)',
            'Set: O(log n) | List: O(log n)',
            'Set: O(1) | List: O(1)',
          ],
          correctIndex: 1,
          explanation: 'Sets use hash tables offering O(1) average lookup, whereas lists require an O(n) linear scan across elements.',
          topic: 'Data Structures Complexity',
        },
        {
          question: 'Which of the following data types cannot be used as a key in a standard Python dictionary?',
          options: [
            'A tuple containing only strings (e.g. ("x", "y"))',
            'A frozenset',
            'A list of integers (e.g. [1, 2, 3])',
            'An integer',
          ],
          correctIndex: 2,
          explanation: 'Dictionary keys must be hashable and immutable. A list is mutable and unhashable, raising a TypeError.',
          topic: 'Dictionaries & Hashing',
        },
        {
          question: 'In Python slicing `arr[:: -1]`, what does the negative step value accomplish?',
          options: [
            'Skips the last element of the list',
            'Returns a reversed shallow copy of the sequence',
            'Deletes elements in reverse order',
            'Raises an IndexError if the length is odd',
          ],
          correctIndex: 1,
          explanation: 'A step parameter of -1 traverses the sequence from end to beginning, producing a reversed shallow copy.',
          topic: 'Slicing & Sequences',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Data Structures & Algorithms',
      description: 'Implement core linear and non-linear data structures, analyze Big-O complexity, and master recursion.',
      assessmentTitle: 'Level 2 Assessment: Data Structures & Computational Complexity',
      topics: [
        {
          topic: 'Time & Space Complexity (Big-O Analysis)',
          explanation: 'Asymptotic notation quantifies algorithmic resource growth relative to input size N, guiding critical architectural trade-offs.',
          objectives: [
            'Identify O(1), O(log N), O(N), O(N log N), and O(N^2) time profiles',
            'Account for auxiliary space allocations and recursive call stack depth',
          ],
          practice: {
            description: 'Determine the time complexity of an algorithm that halves the input space each iteration while performing O(1) work.',
            starterCode: `# Write explanation and verify with binary search implementation\ndef binary_search(arr: list[int], target: int) -> int:\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1\n\nprint(binary_search([10, 20, 30, 40, 50], 30))`,
            expectedOutput: `2`,
          },
          resources: [
            {
              id: 'r-dsa-201',
              title: 'Big-O Notation in 100 Seconds',
              provider: 'Fireship',
              topic: 'Time & Space Complexity',
              duration: '2 mins',
              directUrl: 'https://www.youtube.com/watch?v=g2o22C3CRfU',
              isVerified: true,
              selectionReason: 'Ultra-concise visual explanation of Big-O scales from constant to factorial time.',
              type: 'video',
            },
          ],
        },
        {
          topic: 'Stacks, Queues & collections.deque',
          explanation: 'Stacks follow LIFO while queues follow FIFO. In Python, using `list.pop(0)` is an anti-pattern (O(n)); `collections.deque` provides double-ended O(1) ops.',
          objectives: [
            'Implement stack operations using append/pop',
            'Use collections.deque for high-efficiency FIFO queues',
            'Solve classic balanced parentheses and queue processing problems',
          ],
          practice: {
            description: 'Write `is_valid_parentheses(s)` using a stack that verifies matching brackets `()`, `[]`, `{}`.',
            starterCode: `def is_valid_parentheses(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping.values():\n            stack.append(char)\n        elif char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n    return len(stack) == 0\n\nprint(is_valid_parentheses("{[()]}"))`,
            expectedOutput: `True`,
          },
          resources: [
            {
              id: 'r-dsa-202',
              title: 'collections.deque Documentation',
              provider: 'Python Software Foundation',
              topic: 'Double-Ended Queues',
              duration: '10 min read',
              directUrl: 'https://docs.python.org/3/library/collections.html#collections.deque',
              isVerified: true,
              selectionReason: 'Official documentation detailing memory layout and O(1) thread-safe popleft and append.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why is `collections.deque.popleft()` preferred over `list.pop(0)` for FIFO queues in Python?',
          options: [
            'deque is written in pure Python while list is compiled in C.',
            'list.pop(0) requires shifting all remaining n-1 elements left in memory (O(n)), whereas deque is a doubly-linked block array with O(1) removals.',
            'deque automatically deletes duplicate items.',
            'list.pop(0) raises an exception if the list has fewer than 10 elements.',
          ],
          correctIndex: 1,
          explanation: 'Removing from the beginning of a contiguous array requires shifting all subsequent elements, incurring O(n) overhead.',
          topic: 'Queue Performance',
        },
        {
          question: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
          correctIndex: 2,
          explanation: 'In the worst case (a completely skewed tree resembling a linked list), searching requires traversing all n nodes (O(n)).',
          topic: 'Trees & Search Complexity',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Object-Oriented Architecture',
      description: 'Design robust systems using classes, encapsulation, inheritance, polymorphism, and dunder protocols.',
      assessmentTitle: 'Level 3 Assessment: OOP Principles & Python Dunder Protocols',
      topics: [
        {
          topic: 'Classes, Dunder Methods & Operator Overloading',
          explanation: 'Python objects integrate with the language via special methods (`__str__`, `__repr__`, `__eq__`, `__len__`, `__getitem__`).',
          objectives: [
            'Implement clean `__init__`, `__repr__`, and `__eq__` methods',
            'Distinguish class variables from instance variables',
            'Use `@classmethod` and `@staticmethod` with clear intent',
          ],
          practice: {
            description: 'Create a `Vector2D` class that supports addition with `+` and equality with `==`.',
            starterCode: `class Vector2D:\n    def __init__(self, x: float, y: float):\n        self.x = x\n        self.y = y\n    def __add__(self, other):\n        return Vector2D(self.x + other.x, self.y + other.y)\n    def __eq__(self, other):\n        return self.x == other.x and self.y == other.y\n    def __repr__(self):\n        return f"Vector2D({self.x}, {self.y})"\n\nv1 = Vector2D(2, 3)\nv2 = Vector2D(4, 1)\nprint(v1 + v2)`,
            expectedOutput: `Vector2D(6, 4)`,
          },
          resources: [
            {
              id: 'r-oop-301',
              title: 'Python OOP Tutorial 1: Classes and Instances',
              provider: 'Corey Schafer',
              topic: 'Object-Oriented Programming',
              duration: '15 mins',
              directUrl: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM',
              isVerified: true,
              selectionReason: 'Industry-standard tutorial series for foundational Python OOP and best practices.',
              type: 'video',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the purpose of the `@property` decorator in Python?',
          options: [
            'It marks a class as immutable.',
            'It allows a method to be accessed like an attribute while enabling getter, setter, and deleter encapsulation.',
            'It converts a function into a database column.',
            'It speeds up execution via JIT compilation.',
          ],
          correctIndex: 1,
          explanation: '@property creates managed attributes, enabling clean syntax while preserving encapsulation.',
          topic: 'Encapsulation & Properties',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Relational Databases & SQL',
      description: 'Model data schemas, execute complex relational joins, design indexes, and optimize query latency.',
      assessmentTitle: 'Level 4 Assessment: Relational Modeling & SQL Performance',
      topics: [
        {
          topic: 'Schema Design, Foreign Keys & Normalization',
          explanation: 'Relational integrity guarantees transactional correctness. Normalization eliminates redundant state and update anomalies.',
          objectives: [
            'Design 3NF schemas with primary and foreign key constraints',
            'Understand ACID transactions and isolation levels',
          ],
          practice: {
            description: 'Write an SQL query to retrieve users who have placed orders totaling more than $500 in the last 30 days.',
            starterCode: `-- Write SQL query:\nSELECT u.id, u.email, SUM(o.total_amount) as total_spent\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.created_at >= NOW() - INTERVAL '30 days'\nGROUP BY u.id, u.email\nHAVING SUM(o.total_amount) > 500;`,
            expectedOutput: `Query returning aggregated spend per qualifying user`,
          },
          resources: [
            {
              id: 'r-sql-401',
              title: 'PostgreSQL Official Documentation: SQL Tutorial',
              provider: 'PostgreSQL Global Development Group',
              topic: 'SQL Joins & Grouping',
              duration: '25 min read',
              directUrl: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
              isVerified: true,
              selectionReason: 'Authoritative guide to standard relational operations, constraints, and query optimization.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'When should a B-Tree index be placed on a database table column?',
          options: [
            'On every single column in the table without exception.',
            'On columns frequently used in WHERE filters, JOIN conditions, or ORDER BY clauses with high selectivity.',
            'Only on columns storing binary media blobs.',
            'Never, because indexes degrade read performance.',
          ],
          correctIndex: 1,
          explanation: 'B-tree indexes accelerate selective reads and joins at the cost of modest insert/update write latency.',
          topic: 'Indexing & Performance',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – Git & Production Collaboration',
      description: 'Master branch strategies, interactive rebasing, merge conflict resolution, and CI/CD pipelines.',
      assessmentTitle: 'Level 5 Assessment: Git Internals & Version Control',
      topics: [
        {
          topic: 'Git Directed Acyclic Graph & Rebasing',
          explanation: 'Git stores commits as content-addressed snapshots in a directed acyclic graph (DAG). Mastering rebase keeps history linear.',
          objectives: [
            'Understand HEAD, detached states, and tree references',
            'Resolve merge conflicts with precision and run interactive rebase',
          ],
          practice: {
            description: 'State the terminal commands to squash the last 3 commits into a single descriptive commit.',
            starterCode: `# Terminal sequence:\ngit rebase -i HEAD~3\n# Mark commits 2 and 3 as 'squash' or 's', save and write new message`,
            expectedOutput: `Linear squashed commit history`,
          },
          resources: [
            {
              id: 'r-git-501',
              title: 'Pro Git Book: Git Branching & Rebasing',
              provider: 'Scott Chacon & Ben Straub',
              topic: 'Git Branching',
              duration: '20 min read',
              directUrl: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing',
              isVerified: true,
              selectionReason: 'Standard open-source textbook detailing Git internals and branching models.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the primary difference between `git merge` and `git rebase`?',
          options: [
            '`git merge` creates a two-parent merge commit preserving exact history, while `git rebase` reapplies commits on top of another base, creating a linear history.',
            '`git merge` permanently deletes uncommitted changes.',
            '`git rebase` cannot be used on feature branches.',
            'There is no difference; they are exact aliases.',
          ],
          correctIndex: 0,
          explanation: 'Merge creates a distinct join commit preserving timeline topology; rebase rewrites commit hashes to produce a straight line.',
          topic: 'Git Branching Strategies',
        },
      ],
    },
    {
      levelNumber: 6,
      title: 'Level 6 – Production Backend Projects',
      description: 'Build and deploy RESTful microservices with FastAPI, PostgreSQL, and Docker containerization.',
      assessmentTitle: 'Level 6 Assessment: API Engineering & Production Deployment',
      topics: [
        {
          topic: 'FastAPI, Pydantic & Asynchronous I/O',
          explanation: 'Modern Python backend development uses asynchronous concurrency (`async`/`await`) to maximize throughput on I/O-bound database queries.',
          objectives: [
            'Build typed endpoints with Pydantic validation schemas',
            'Implement JWT token authentication and dependency injection',
          ],
          practice: {
            description: 'Define an authenticated FastAPI route with dependency injection that queries user profile records.',
            starterCode: `from fastapi import FastAPI, Depends, HTTPException\n\napp = FastAPI()\n\ndef get_current_user(token: str = "valid"): \n    return {"id": 1, "role": "engineer"}\n\n@app.get("/profile")\ndef read_profile(user: dict = Depends(get_current_user)):\n    return {"status": "ok", "user": user}`,
            expectedOutput: `{"status": "ok", "user": {"id": 1, "role": "engineer"}}`,
          },
          resources: [
            {
              id: 'r-fastapi-601',
              title: 'FastAPI Official Tutorial - User Guide',
              provider: 'Tiangolo / FastAPI',
              topic: 'Asynchronous APIs in Python',
              duration: '30 min read',
              directUrl: 'https://fastapi.tiangolo.com/tutorial/',
              isVerified: true,
              selectionReason: 'Official documentation for asynchronous Python APIs, Pydantic models, and OAuth2 security.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why does Python `asyncio` improve performance for network-bound web servers?',
          options: [
            'It automatically removes Python GIL (Global Interpreter Lock).',
            'It enables single-threaded cooperative multitasking, allowing other requests to execute while waiting for database or network I/O.',
            'It compiles Python code into native C machine binaries.',
            'It disables all garbage collection during API calls.',
          ],
          correctIndex: 1,
          explanation: 'Event loop concurrency yields execution while waiting on I/O sockets without thread context-switching overhead.',
          topic: 'Concurrency & Async I/O',
        },
      ],
    },
    {
      levelNumber: 7,
      title: 'Level 7 – Technical Interview Preparation',
      description: 'Deconstruct algorithmic patterns, system design trade-offs, and communication strategies.',
      assessmentTitle: 'Level 7 Assessment: Algorithmic Patterns & System Trade-Offs',
      topics: [
        {
          topic: 'System Design: Caching, Rate Limiting & Scalability',
          explanation: 'Production architectures require caching layers (Redis), horizontal partitioning, and backpressure rate limiting.',
          objectives: [
            'Design cache-aside strategies and TTL invalidation policies',
            'Communicate technical trade-offs methodically in live interviews',
          ],
          practice: {
            description: 'Outline the architecture of a high-throughput URL shortening service handling 10,000 writes/sec.',
            starterCode: `# Architecture Blueprint Outline:\n# 1. API Gateway / Load Balancer\n# 2. Shortening Service with Base62 ID generator\n# 3. Redis Cache for top 20% hot links\n# 4. PostgreSQL / NoSQL persistent store`,
            expectedOutput: `Architectural specification document`,
          },
          resources: [
            {
              id: 'r-sys-701',
              title: 'System Design Primer',
              provider: 'Donne Martin',
              topic: 'System Architecture & Scalability',
              duration: '45 min read',
              directUrl: 'https://github.com/donnemartin/system-design-primer',
              isVerified: true,
              selectionReason: 'Industry standard open-source guide for technical systems interviews and scalability.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In a Cache-Aside pattern, what happens when a requested key is not present in cache (cache miss)?',
          options: [
            'The application returns a 404 error immediately.',
            'The application reads from the primary database, populates the cache with the retrieved data, and returns the result to the client.',
            'The database automatically updates all other caches.',
            'The cache is invalidated and restarted.',
          ],
          correctIndex: 1,
          explanation: 'On a cache miss in Cache-Aside, the app queries primary storage, updates cache, and returns the payload.',
          topic: 'System Design & Caching',
        },
      ],
    },
    {
      levelNumber: 8,
      title: 'Level 8 – Mock Interviews & Job Readiness',
      description: 'Simulate live behavioral screenings, complete resume refinement, and pass final qualifying checks.',
      assessmentTitle: 'Level 8 Assessment: Comprehensive Candidate Qualifying Exam',
      topics: [
        {
          topic: 'Live Technical Screening Simulation & Behavioral Alignment',
          explanation: 'Hiring managers evaluate technical problem breakdown, clarity of thought under ambiguity, and cultural alignment.',
          objectives: [
            'Apply the STAR method (Situation, Task, Action, Result) to behavioral prompts',
            'Execute live coding while explaining trade-offs aloud to the interviewer',
          ],
          practice: {
            description: 'Write out your response to: "Tell me about a time a production service degraded and how you restored stasis."',
            starterCode: `# STAR Method Template:\n# S: Microservice latency spiked to 4.2s under marketing surge\n# T: Restore SLA under 200ms within 30 minutes\n# A: Analyzed query logs, identified unindexed foreign key join, applied hot index\n# R: Latency dropped to 48ms, zero customer data lost`,
            expectedOutput: `Structured STAR narrative response`,
          },
          resources: [
            {
              id: 'r-mock-801',
              title: 'Technical Interviewing Guide & Problem Solving Rubrics',
              provider: 'ASCEND Engineering Board',
              topic: 'Mock Interview Prep',
              duration: '25 min read',
              directUrl: 'https://docs.python.org/3/',
              isVerified: true,
              selectionReason: 'Focused evaluation rubrics used by senior engineering hiring panels.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the most effective way to communicate your thought process during a live technical coding interview?',
          options: [
            'Stay completely silent until you have written 100% of the code, then hit run.',
            'Clarify requirements and edge cases first, state your brute-force approach, discuss Big-O trade-offs, and talk through your implementation step-by-step.',
            'Immediately start typing code without asking any clarifying questions.',
            'Memorize solutions and refuse to consider alternative approaches suggested by the interviewer.',
          ],
          correctIndex: 1,
          explanation: 'Interviewers look for structured problem solving, adaptability, and clear communication as much as working code.',
          topic: 'Interview Strategy',
        },
      ],
    },
  ];
}

