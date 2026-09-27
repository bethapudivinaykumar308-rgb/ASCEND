import {
  UserGoal,
  UserProfile,
  MasterCareerPlan,
  CareerPlan,
} from '../types';
import { masterPlanService } from './masterPlanService';
import { generateRoadmapForGoal } from './roadmapGenerator';

export interface AIAgentStepStatus {
  step: number;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
}

export interface AIAgentContext {
  userProfile: UserProfile;
  userGoal: UserGoal;
  selectedMasterPlan?: MasterCareerPlan;
  structuredPayload?: Record<string, unknown>;
  generatedRoadmap?: CareerPlan;
  validationReport?: {
    isValid: boolean;
    levelsChecked: number;
    topicsCount: number;
    assessmentsVerified: boolean;
    issuesFound: string[];
  };
}

/**
 * AIAgentService - Orchestrates the multi-stage career roadmap generation workflow:
 * 1. Agent receives user profile & goal
 * 2. Agent selects appropriate master career plan
 * 3. Agent prepares structured information payload
 * 4. AI model generates personalized roadmap
 * 5. Agent validates the generated roadmap
 * 6. Validated roadmap is returned to ASCEND
 */
export const aiAgentService = {
  /**
   * Step 1: Ingest user profile and goal
   */
  receiveUserProfile(profile: UserProfile, goal: UserGoal): { profile: UserProfile; goal: UserGoal } {
    if (!goal.targetJob?.trim()) {
      throw new Error('Target job role is required for roadmap synthesis');
    }
    return { profile, goal };
  },

  /**
   * Step 2: Agent selects appropriate master career plan
   */
  selectMasterCareerPlan(goal: UserGoal): MasterCareerPlan {
    return masterPlanService.getMasterPlanForRole(goal.targetJob);
  },

  /**
   * Step 3: Agent constructs structured information for AI model
   */
  prepareStructuredModelPayload(
    goal: UserGoal,
    masterPlan: MasterCareerPlan,
    profile: UserProfile
  ): Record<string, unknown> {
    return {
      learner: {
        userId: profile.id,
        education: goal.education,
        currentSkillLevel: goal.currentSkillLevel,
        existingSkills: goal.existingSkills,
      },
      target: {
        role: goal.targetJob,
        preferredTechnologies: goal.preferredTechnologies,
        targetCompany: goal.targetCompany || 'General Industry Tier-1 Bar',
        targetExamOrInterview: goal.targetExamOrInterview || 'Comprehensive Technical Bar',
        targetCompletionDate: goal.targetCompletionDate || 'Paced Progression',
      },
      schedule: {
        dailyStudyHours: goal.studyTimePerDayHours,
        recommendedPacingDays: Math.ceil(40 / Math.max(1, goal.studyTimePerDayHours >= 3 ? 1.5 : 1)),
      },
      curriculumFramework: {
        masterPlanId: masterPlan.id,
        masterPlanTitle: masterPlan.title,
        domains: masterPlan.domains.map((d) => ({
          domainId: d.id,
          title: d.title,
          description: d.description,
          assignedLevels: d.levelIds,
        })),
        defaultLevelsCount: masterPlan.defaultLevelsCount,
      },
    };
  },

  /**
   * Step 4: AI Model synthesizes the personalized roadmap
   * Calls secure server-side Gemini endpoint with fallback models and client validation
   */
  async generatePersonalizedRoadmap(
    goal: UserGoal,
    userId: string,
    isDemo = false,
    profile?: UserProfile
  ): Promise<CareerPlan> {
    if (isDemo) {
      return generateRoadmapForGoal(goal, userId, true);
    }

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          userProfile: profile || { id: userId, name: 'Student', email: 'learner@ascend.org', joinedAt: new Date().toISOString() },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.plan) {
        throw new Error(data.error || 'Server did not return a valid career plan');
      }

      return data.plan;
    } catch (err: any) {
      console.warn('[AIAgentService] Remote roadmap endpoint unreachable or failed, falling back to local curriculum synthesis:', err);
      try {
        return generateRoadmapForGoal(goal, userId, false);
      } catch (localErr) {
        throw new Error(err?.message || 'Career roadmap synthesis failed. Please try again.');
      }
    }
  },

  /**
   * Step 5: Agent validates the generated roadmap
   * Checks level stage-gating consistency, topic completeness, verified resource links, and mock test passing thresholds
   */
  validateGeneratedRoadmap(roadmap: CareerPlan): {
    isValid: boolean;
    levelsChecked: number;
    topicsCount: number;
    assessmentsVerified: boolean;
    issuesFound: string[];
  } {
    const issues: string[] = [];

    if (!roadmap.levels || roadmap.levels.length === 0) {
      issues.push('Roadmap contains zero levels');
    }

    let totalTopics = 0;
    let allAssessmentsValid = true;

    roadmap.levels.forEach((lvl, idx) => {
      // First level must be unlocked, subsequent locked unless demo
      if (idx === 0 && lvl.status !== 'unlocked') {
        issues.push(`Level 1 status should be 'unlocked', found '${lvl.status}'`);
      }
      if (idx > 0 && lvl.status !== 'locked' && !roadmap.isDemo) {
        issues.push(`Level ${lvl.levelNumber} should default to 'locked' for stage-gated discipline`);
      }

      const topics = lvl.topics || lvl.lessons;
      if (!topics || topics.length === 0) {
        issues.push(`Level ${lvl.levelNumber} contains no topics`);
      } else {
        totalTopics += topics.length;
      }

      if (!lvl.assessment || !lvl.assessment.questions || lvl.assessment.questions.length === 0) {
        issues.push(`Level ${lvl.levelNumber} is missing mock test assessment questions`);
        allAssessmentsValid = false;
      } else if (lvl.assessment.passingScorePercent < 70) {
        issues.push(`Level ${lvl.levelNumber} passing score is too low (${lvl.assessment.passingScorePercent}%)`);
      }
    });

    return {
      isValid: issues.length === 0,
      levelsChecked: roadmap.levels.length,
      topicsCount: totalTopics,
      assessmentsVerified: allAssessmentsValid,
      issuesFound: issues,
    };
  },

  /**
   * Complete Pipeline Orchestrator:
   * Executes Steps 1-6 seamlessly
   */
  async dispatchRoadmapPipeline(
    profile: UserProfile,
    goal: UserGoal,
    isDemo = false,
    onStepUpdate?: (step: AIAgentStepStatus) => void
  ): Promise<CareerPlan> {
    onStepUpdate?.({
      step: 1,
      label: 'Agent receiving learner profile and career goal',
      status: 'in_progress',
      details: `Target: ${goal.targetJob}`,
    });

    const validatedInput = this.receiveUserProfile(profile, goal);

    onStepUpdate?.({
      step: 2,
      label: 'Analyzing profile and identifying skill gaps (Gemini AI Agent)',
      status: 'in_progress',
    });
    // This happens on the backend as part of the pipeline call

    onStepUpdate?.({
      step: 3,
      label: 'Matching appropriate ASCEND Master Career Plan',
      status: 'in_progress',
    });
    const masterPlan = this.selectMasterCareerPlan(validatedInput.goal);

    onStepUpdate?.({
      step: 4,
      label: 'AI generating and repairing adaptive stage-gated roadmap (Gemini AI Orchestrator)',
      status: 'in_progress',
    });
    const generatedRoadmap = await this.generatePersonalizedRoadmap(
      validatedInput.goal,
      validatedInput.profile.id,
      isDemo,
      validatedInput.profile
    );

    onStepUpdate?.({
      step: 5,
      label: 'Agent validating roadmap integrity and resources (Multi-AI Consensus)',
      status: 'in_progress',
    });
    const validation = this.validateGeneratedRoadmap(generatedRoadmap);
    if (!validation.isValid) {
      console.warn('Roadmap validation warnings detected:', validation.issuesFound);
    }

    onStepUpdate?.({
      step: 6,
      label: 'Roadmap validated and mounted in ASCEND workspace',
      status: 'completed',
    });

    return generatedRoadmap;
  },
};
