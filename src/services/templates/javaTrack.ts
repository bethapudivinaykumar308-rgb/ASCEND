import { UserGoal } from '../../types';
import { LevelTemplate } from './types';

export function getJavaDeveloperLevels(goal?: UserGoal): LevelTemplate[] {
  const preferredTech = goal?.preferredTechnologies?.join(', ') || 'Spring Boot, PostgreSQL, Docker';

  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Java Core & JVM Architecture',
      description: 'Master primitive types, memory regions (Heap, Stack, Metaspace), garbage collection, and compilation lifecycle.',
      assessmentTitle: 'Level 1 Assessment: Java Memory Model & Core Syntax',
      topics: [
        {
          topic: 'JVM Execution Model, Bytecode & ClassLoaders',
          explanation: 'Java bytecode is compiled by javac and executed by the JVM JIT compiler. Understanding Heap vs Stack memory allocation prevents leaks.',
          objectives: [
            'Understand ClassLoader delegation hierarchy (Bootstrap, Platform, Application)',
            'Distinguish Heap memory objects from Stack frame primitive variables',
            'Master pass-by-value semantics in Java reference passing',
          ],
          practice: {
            description: 'Demonstrate String Constant Pool vs Heap object allocation behavior.',
            starterCode: `public class MemoryDemo {\n    public static void main(String[] args) {\n        String s1 = "ascend";\n        String s2 = "ascend";\n        String s3 = new String("ascend");\n        System.out.println(s1 == s2);\n        System.out.println(s1 == s3);\n    }\n}`,
            expectedOutput: 'true\nfalse',
          },
          resources: [
            {
              id: 'r-java-101',
              title: 'The Java Tutorials: Language Basics',
              provider: 'Oracle Corporation',
              topic: 'Java Syntax & Primitive Types',
              duration: '25 min read',
              directUrl: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/',
              isVerified: true,
              selectionReason: 'Authoritative official Oracle specification for Java fundamentals.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In Java, how does the JVM handle parameter passing to methods?',
          options: [
            'Primitives are passed by reference; objects are passed by value.',
            'Everything in Java is strictly passed by value. For objects, the value passed is the reference address.',
            'Methods use pass-by-name.',
            'Java randomly switches passing mode based on JIT optimization.',
          ],
          correctIndex: 1,
          explanation: 'Java is strictly pass-by-value. When an object is passed, a copy of the reference address is passed by value.',
          topic: 'Java Parameter Passing',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Java Collections & Concurrency',
      description: 'Master ArrayList vs LinkedList, HashMap collision trees, synchronize blocks, and java.util.concurrent Executors.',
      assessmentTitle: 'Level 2 Assessment: Java Collections & Multi-Threading',
      topics: [
        {
          topic: 'HashMap Internals & Concurrent Collections',
          explanation: 'Java 8+ HashMap converts linked lists into red-black trees when a bucket exceeds TREEIFY_THRESHOLD (8). ConcurrentHashMap uses striped bucket locking.',
          objectives: [
            'Understand hashCode() and equals() contract in hash-based collections',
            'Use ConcurrentHashMap and CopyOnWriteArrayList for thread safety',
            'Master thread pools via ExecutorService',
          ],
          practice: {
            description: 'Implement a thread-safe counter using AtomicInteger.',
            starterCode: `import java.util.concurrent.atomic.AtomicInteger;\npublic class Counter {\n    private final AtomicInteger count = new AtomicInteger(0);\n    public void inc() { count.incrementAndGet(); }\n    public int get() { return count.get(); }\n}`,
            expectedOutput: 'Thread-safe counter',
          },
          resources: [
            {
              id: 'r-java-201',
              title: 'Java Concurrency in Practice Guide',
              provider: 'Oracle Documentation',
              topic: 'Java Concurrency Utilities',
              duration: '30 min read',
              directUrl: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/',
              isVerified: true,
              selectionReason: 'Authoritative guide to thread lifecycle, locks, and atomic variables.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What happens if two unequal Java objects return the exact same hashCode() value?',
          options: [
            'The JVM throws a RuntimeException.',
            'A hash collision occurs; the second object is placed in the same bucket and compared with equals().',
            'The first object is overwritten and destroyed.',
            'The HashMap capacity resets to 1.',
          ],
          correctIndex: 1,
          explanation: 'Collisions are handled within buckets via linked nodes or red-black tree nodes, using equals() for item differentiation.',
          topic: 'HashMap Collision Handling',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Object-Oriented Design & SOLID Patterns',
      description: 'Implement enterprise design patterns (Factory, Strategy, Observer, Builder) and enforce SOLID architectural principles.',
      assessmentTitle: 'Level 3 Assessment: SOLID Principles & Design Patterns',
      topics: [
        {
          topic: 'SOLID Principles & Behavioral Design Patterns',
          explanation: 'Enterprise Java systems rely on dependency inversion and interface segregation to allow decoupled module evolution and unit testing.',
          objectives: ['Apply Strategy and Factory patterns', 'Enforce Single Responsibility and Liskov Substitution'],
          practice: {
            description: 'Implement a PaymentStrategy interface with CreditCard and Crypto implementations.',
            starterCode: `public interface PaymentStrategy {\n    void pay(double amount);\n}\npublic class CardPayment implements PaymentStrategy {\n    public void pay(double amount) { System.out.println("Paid " + amount); }\n}`,
            expectedOutput: 'Decoupled payment strategy',
          },
          resources: [
            {
              id: 'r-java-301',
              title: 'Design Patterns in Java Tutorial',
              provider: 'Refactoring.Guru',
              topic: 'Design Patterns',
              duration: '25 min read',
              directUrl: 'https://refactoring.guru/design-patterns/java',
              isVerified: true,
              selectionReason: 'Visual and code-first breakdown of Gang of Four patterns in Java.',
              type: 'article',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'According to the Dependency Inversion Principle (DIP), high-level modules should depend on what?',
          options: [
            'Low-level concrete implementation classes directly.',
            'Abstractions (interfaces or abstract classes), not concrete details.',
            'Global static variables.',
            'Database table row locks.',
          ],
          correctIndex: 1,
          explanation: 'DIP states that both high and low-level modules should depend on abstractions, enabling modular flexibility and testing.',
          topic: 'SOLID Principles',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Spring Boot & RESTful Microservices',
      description: `Build REST APIs with Dependency Injection, Spring Data JPA repositories, and ${preferredTech}.`,
      assessmentTitle: 'Level 4 Assessment: Spring Boot IoC & REST Architecture',
      topics: [
        {
          topic: 'Spring Inversion of Control & RestController',
          explanation: 'Spring IoC container instantiates and injects beans via constructor injection, decoupling components and facilitating unit test mocks.',
          objectives: ['Design clean REST controllers with validation', 'Implement Spring Data JPA repositories'],
          practice: {
            description: 'Write a Spring Service using constructor injection for a UserRepository.',
            starterCode: `@Service\npublic class UserService {\n    private final UserRepository userRepo;\n    public UserService(UserRepository userRepo) {\n        this.userRepo = userRepo;\n    }\n}`,
            expectedOutput: 'Constructor injected Spring Service',
          },
          resources: [
            {
              id: 'r-java-401',
              title: 'Building a RESTful Web Service with Spring Boot',
              provider: 'VMware Spring Team',
              topic: 'Spring Boot REST',
              duration: '20 min read',
              directUrl: 'https://spring.io/guides/gs/rest-service/',
              isVerified: true,
              selectionReason: 'Official Spring guide for building production RESTful endpoints.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why is constructor injection preferred over field injection (@Autowired on fields) in modern Spring?',
          options: [
            'Constructor injection makes classes immutable, prevents NullPointerExceptions, and allows easy unit testing without reflection.',
            'Field injection was removed in Java 8.',
            'Constructor injection disables transactions.',
            'Field injection creates duplicate database tables.',
          ],
          correctIndex: 0,
          explanation: 'Constructor injection guarantees non-null dependencies at construction time and allows trivial instantiation in unit tests.',
          topic: 'Spring Dependency Injection',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – Spring Data JPA, Hibernate & Transactions',
      description: 'Master ORM entity relationships, lazy vs eager loading, N+1 query optimization, and @Transactional isolation.',
      assessmentTitle: 'Level 5 Assessment: JPA Persistence & Transaction Isolation',
      topics: [
        {
          topic: 'N+1 Problem, Fetch Joins & ACID Isolation',
          explanation: 'The N+1 select problem occurs when querying parent entities triggers N individual child queries. JOIN FETCH eliminates this overhead in a single query.',
          objectives: ['Optimize queries with JOIN FETCH and EntityGraphs', 'Configure @Transactional propagation and isolation levels'],
          practice: {
            description: 'Write a JPQL query with JOIN FETCH to load orders with their customer details.',
            starterCode: `@Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.status = :status")\nList<Order> findOrdersWithCustomer(@Param("status") String status);`,
            expectedOutput: 'Single query fetching parent and child records',
          },
          resources: [
            {
              id: 'r-java-501',
              title: 'Spring Data JPA Reference Documentation',
              provider: 'VMware Spring Team',
              topic: 'Spring Data JPA',
              duration: '25 min read',
              directUrl: 'https://docs.spring.io/spring-data/jpa/docs/current/reference/html/',
              isVerified: true,
              selectionReason: 'Authoritative documentation for custom queries and JPA transaction boundaries.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'How does JOIN FETCH solve the Hibernate N+1 select problem?',
          options: [
            'It disables all database caching.',
            'It forces Hibernate to initialize the associated collection or entity in the same initial SQL SELECT query.',
            'It deletes unreferenced child rows.',
            'It converts the database into MongoDB.',
          ],
          correctIndex: 1,
          explanation: 'JOIN FETCH instructs the persistence provider to retrieve parent and related children in a single join query.',
          topic: 'Hibernate Query Optimization',
        },
      ],
    },
    {
      levelNumber: 6,
      title: 'Level 6 – Distributed Systems & Event Messaging (Kafka)',
      description: 'Implement distributed event streaming with Apache Kafka, consumer group partitioning, and resilient microservices.',
      assessmentTitle: 'Level 6 Assessment: Distributed Messaging & Resilience',
      topics: [
        {
          topic: 'Kafka Topics, Consumer Groups & Exactly-Once Semantics',
          explanation: 'Kafka decouples producers and consumers via partitioned append-only commit logs, allowing horizontal scaling and fault-tolerant streaming.',
          objectives: ['Publish and consume Kafka event messages', 'Handle consumer rebalances and idempotency'],
          practice: {
            description: 'Write a Kafka consumer listener with error backoff in Spring Boot.',
            starterCode: `@KafkaListener(topics = "orders", groupId = "order-group")\npublic void handleOrder(OrderEvent event) {\n    System.out.println("Processing event: " + event.getOrderId());\n}`,
            expectedOutput: 'Kafka message listener processing event payload',
          },
          resources: [
            {
              id: 'r-java-601',
              title: 'Apache Kafka Official Documentation: Core Concepts',
              provider: 'Apache Software Foundation',
              topic: 'Kafka Architecture',
              duration: '30 min read',
              directUrl: 'https://kafka.apache.org/documentation/',
              isVerified: true,
              selectionReason: 'Official documentation for Kafka topics, consumer groups, and partition offsets.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What guarantees does Kafka provide regarding message order?',
          options: [
            'Global ordering across all topics and partitions at all times.',
            'Strict ordering within a single partition, but not across multiple partitions.',
            'Zero ordering guarantee; messages are received completely randomly.',
            'Ordering only on Mondays.',
          ],
          correctIndex: 1,
          explanation: 'Kafka guarantees total order within a partition. Messages with identical partition keys are guaranteed to be read in order.',
          topic: 'Kafka Partition Ordering',
        },
      ],
    },
    {
      levelNumber: 7,
      title: 'Level 7 – Enterprise System Design & Low-Level Design (LLD)',
      description: 'Architect scalable enterprise backends, design distributed caches, circuit breakers, and database sharding schemes.',
      assessmentTitle: 'Level 7 Assessment: Distributed Architecture & Resilience Patterns',
      topics: [
        {
          topic: 'Circuit Breaker (Resilience4j) & Distributed Caching',
          explanation: 'Cascading failures in distributed systems are mitigated through circuit breakers that fail fast and degrade gracefully when dependencies fail.',
          objectives: ['Implement CircuitBreaker and RateLimiter patterns', 'Design cache invalidation and distributed lock schemes with Redis'],
          practice: {
            description: 'Apply a Resilience4j circuit breaker with fallback method in Spring Boot.',
            starterCode: `@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")\npublic PaymentResult processPayment(PaymentRequest req) {\n    return remotePaymentClient.charge(req);\n}\npublic PaymentResult paymentFallback(PaymentRequest req, Throwable t) {\n    return new PaymentResult("DEFERRED", "Service degraded, queued for retry");\n}`,
            expectedOutput: 'Resilient service with graceful fallback',
          },
          resources: [
            {
              id: 'r-java-701',
              title: 'Resilience4j Documentation: Circuit Breaker',
              provider: 'Resilience4j Team',
              topic: 'Fault Tolerance',
              duration: '20 min read',
              directUrl: 'https://resilience4j.readme.io/docs/circuitbreaker',
              isVerified: true,
              selectionReason: 'Standard fault tolerance framework specification for enterprise Java systems.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What are the three core states of a Circuit Breaker pattern?',
          options: [
            'Start, Run, Stop',
            'Closed (normal), Open (failing fast), and Half-Open (trial recovery)',
            'Read, Write, Execute',
            'Synchronous, Asynchronous, Parallel',
          ],
          correctIndex: 1,
          explanation: 'Closed passes calls normally. Open fails immediately to protect downstream systems. Half-Open admits trial calls to test recovery.',
          topic: 'Circuit Breaker States',
        },
      ],
    },
    {
      levelNumber: 8,
      title: 'Level 8 – Enterprise Qualifying Exam & Behavioral Screening',
      description: 'Simulate high-stakes technical architecture defenses, behavioral STAR reviews, and live hiring bar assessments.',
      assessmentTitle: 'Level 8 Assessment: Enterprise Candidate Qualifying Exam',
      topics: [
        {
          topic: 'Enterprise Architecture Defense & STAR Behavioral',
          explanation: 'Staff and Senior Java engineering loops evaluate systematic failure domain isolation, concurrency edge cases, and architectural clarity.',
          objectives: ['Defend low-level system designs against interviewer scrutiny', 'Communicate technical trade-offs using STAR structure'],
          practice: {
            description: 'Draft an architectural defense for handling duplicate transaction webhooks idempotently.',
            starterCode: `// Idempotency Pattern Blueprint:\n// 1. Extract unique idempotency key from header\n// 2. Insert into Redis / DB with unique constraint\n// 3. If duplicate key exists, return recorded result without re-executing business logic`,
            expectedOutput: 'Idempotency design specification',
          },
          resources: [
            {
              id: 'r-java-801',
              title: 'Designing Data-Intensive Applications Summary',
              provider: 'Martin Kleppmann Reference',
              topic: 'System Reliability',
              duration: '35 min read',
              directUrl: 'https://docs.oracle.com/en/java/',
              isVerified: true,
              selectionReason: 'Definitive reference material for enterprise distributed data reliability.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In distributed enterprise transactions, how is idempotency most reliably guaranteed for non-idempotent operations like payment charges?',
          options: [
            'By never retrying failed network requests.',
            'By requiring client requests to supply a unique Idempotency Key, verified atomically in a distributed store before execution.',
            'By increasing server memory size.',
            'By running only one server instance in the entire company.',
          ],
          correctIndex: 1,
          explanation: 'Atomic idempotency key verification ensures that retried network requests return the cached result of the original transaction without re-execution.',
          topic: 'Distributed Idempotency',
        },
      ],
    },
  ];
}
