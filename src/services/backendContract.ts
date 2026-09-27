import {
  UserGoal,
  UserProfile,
  MasterCareerPlan,
  CareerPlan,
  RoadmapLevel,
  Topic,
  LearningResource,
  PracticeTask,
  LevelAssessment,
  JobReadiness,
  CareerPlanAnalytics,
} from '../types';

/**
 * Backend Service Contracts.
 * These interfaces define the API signatures for future remote microservices
 * (e.g. Firebase Auth, Cloud Firestore, Gemini LLM agent workers, YouTube API verifier).
 * Current local implementations allow development without external network dependencies.
 */

export interface IUserService {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
}

export interface ICareerGoalService {
  saveGoal(userId: string, goal: UserGoal): Promise<UserGoal>;
  getGoal(userId: string): Promise<UserGoal | null>;
}

export interface IMasterPlanService {
  listMasterPlans(): Promise<MasterCareerPlan[]>;
  getMasterPlanById(id: string): Promise<MasterCareerPlan | null>;
  matchPlanForGoal(goal: UserGoal): Promise<MasterCareerPlan>;
}

export interface IAIAgentService {
  dispatchRoadmapAgent(userId: string, goal: UserGoal, masterPlan: MasterCareerPlan): Promise<CareerPlan>;
  consultTrainer(userId: string, prompt: string, currentTopicId?: string): Promise<string>;
}

export interface IRoadmapGenerationService {
  generatePersonalizedPlan(goal: UserGoal, userId: string, isDemo?: boolean): Promise<CareerPlan>;
}

export interface IResourceVerificationService {
  verifyResource(resourceUrl: string): Promise<{ isVerified: boolean; verificationStatus: string; provider: string }>;
  fetchTargetedResources(topicName: string, roleKey: string): Promise<LearningResource[]>;
}

export interface ILearningService {
  getDailyTopic(planId: string, dayNumber: number): Promise<Topic | null>;
  markTopicComplete(planId: string, topicId: string, submissionCode?: string): Promise<{ isCompleted: boolean; completedAt: string }>;
}

export interface IPracticeService {
  submitPracticeCode(topicId: string, code: string): Promise<{ passed: boolean; logs: string }>;
  getPracticeTask(topicId: string): Promise<PracticeTask | null>;
}

export interface IAssessmentService {
  getLevelAssessment(levelId: number): Promise<LevelAssessment>;
  evaluateAnswers(levelId: number, answers: Record<string, number>): Promise<{
    passed: boolean;
    scorePercent: number;
    weakTopics: string[];
    recommendedTopicIds: string[];
  }>;
}

export interface IProgressService {
  calculateAnalytics(plan: CareerPlan): Promise<CareerPlanAnalytics>;
  getStageGatedStatus(plan: CareerPlan): Promise<{ unlockedLevels: number[]; lockedLevels: number[] }>;
}

export interface IJobReadinessService {
  evaluateReadiness(plan: CareerPlan): Promise<JobReadiness>;
}
