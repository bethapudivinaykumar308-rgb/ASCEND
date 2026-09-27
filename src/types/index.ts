export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserGoal {
  targetJob: string;
  education: string;
  currentSkillLevel: SkillLevel;
  existingSkills: string[];
  preferredTechnologies: string[];
  studyTimePerDayHours: number;
  targetCompany?: string;
  targetExamOrInterview?: string;
  targetCompletionDate?: string;
}

export type ResourceType =
  | 'youtube_video'
  | 'official_documentation'
  | 'official_course'
  | 'book'
  | 'tutorial'
  | 'practice_platform'
  | 'video'
  | 'documentation'
  | 'article'
  | 'interactive';

export type VerificationStatus = 'verified' | 'unverified' | 'pending_verification' | 'needs_review';

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  topic: string;
  duration?: string;
  estimatedDuration?: string;
  directUrl: string;
  url?: string;
  language?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationTimestamp?: string;
  selectionReason: string;
  description?: string;
  type: ResourceType;
}

export interface PracticeTask {
  id?: string;
  title?: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  expectedSkills?: string[];
  testCases?: { input: string; output: string }[];
  starterCode?: string;
  sampleInput?: string;
  expectedOutput?: string;
  solutionExplanation?: string;
  completionStatus?: 'not_started' | 'in_progress' | 'passed';
}

export interface Topic {
  id: string;
  name: string;
  topic: string;
  description: string;
  shortExplanation: string;
  whyItMatters: string;
  learningObjectives: string[];
  estimatedMinutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  explanation: string;
  keyConcepts?: string[];
  commonMistakes?: string[];
  practicalExample?: string;
  takeaways?: string;
  resources: LearningResource[];
  practiceTask: PracticeTask;
  practiceTasks?: PracticeTask[];
  dayNumber: number;
  isCompleted: boolean;
  completedAt?: string;
  userSubmissionCode?: string;
}

// DailyLesson alias for component interoperability
export type DailyLesson = Topic;

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  topic: string;
}

export interface LevelAssessment {
  id: string;
  levelNumber: number;
  title: string;
  questions: AssessmentQuestion[];
  passingScorePercent: number; // e.g. 75
  latestScorePercent?: number;
  passed?: boolean;
  attemptsCount: number;
  weakTopics?: string[];
  recommendedLessonIds?: string[];
  completedAt?: string;
}

export type LevelStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'review_required';

export interface RoadmapLevel {
  id?: string;
  levelNumber: number;
  title: string;
  description: string;
  domainId?: string;
  domainTitle?: string;
  status: LevelStatus;
  learningObjectives?: string[];
  requiredCompletionPercentage?: number;
  topics: Topic[];
  lessons: DailyLesson[]; // synced with topics for full backward compatibility
  assessment: LevelAssessment;
}

export interface CareerDomain {
  id: string;
  title: string;
  description: string;
  order: number;
  levelIds: number[];
}

export interface MasterCareerPlan {
  id: string;
  roleKey: string;
  title: string;
  description: string;
  targetAudience: string;
  typicalDurationMonths: number;
  domains: CareerDomain[];
  defaultLevelsCount: number;
}

export interface ProjectMilestone {
  title: string;
  tech: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface JobReadiness {
  isReady: boolean;
  skillsCompleted: string[];
  topicsMastered: string[];
  assessmentAverage: number;
  projects: ProjectMilestone[];
  resumePreparation: {
    ready: boolean;
    tailoredRole: string;
    bulletHighlights: string[];
    suggestedImprovements: string[];
  };
  technicalInterviewPreparation: {
    readinessScore: number;
    topicsPrepared: string[];
    criticalCheckpoints: string[];
  };
  hrBehavioralPreparation: {
    status: 'in_progress' | 'ready';
    suggestedScenarios: string[];
  };
  finalMockInterviewStatus: 'pending' | 'passed' | 'scheduled';
}

export interface CareerPlanAnalytics {
  totalLessonsCount: number;
  completedLessonsCount: number;
  totalAssessmentsCount: number;
  passedAssessmentsCount: number;
  averageScorePercent: number;
  weakAreas: string[];
  strongAreas: string[];
  nextRecommendedAction: string;
  estimatedRoadmapCompletionDays: number;
  estimatedDaysRemaining?: number;
}

export interface CareerPlan {
  id: string;
  userId: string;
  isDemo: boolean;
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
  goal: UserGoal;
  masterPlanId?: string;
  domains: CareerDomain[];
  levels: RoadmapLevel[];
  currentLevelNumber: number;
  currentDayNumber: number;
  activeDomainId?: string;
  jobReadiness: JobReadiness;
  analytics: CareerPlanAnalytics;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentGoalTitle?: string;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topicRef?: string;
  suggestedAction?: string;
}

