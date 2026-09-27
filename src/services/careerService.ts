import { CareerPlan, UserGoal, LevelStatus, LevelAssessment } from '../types';
import { storageService } from './storageService';
import { aiAgentService } from './aiAgentService';

export const careerService = {
  async getCareerPlan(): Promise<CareerPlan | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storageService.getCareerPlan();
  },

  async createCareerPlan(
    goal: UserGoal,
    onStepUpdate?: (step: import('./aiAgentService').AIAgentStepStatus) => void
  ): Promise<CareerPlan> {
    const profile = storageService.getUserProfile();
    // Route through AI Agent pipeline
    const newPlan = await aiAgentService.dispatchRoadmapPipeline(profile, goal, false, onStepUpdate);

    storageService.saveCareerPlan(newPlan);
    storageService.saveUserProfile({ ...profile, currentGoalTitle: goal.targetJob });
    return newPlan;
  },

  async completeLesson(levelNumber: number, lessonId: string, submissionCode?: string): Promise<CareerPlan> {
    const plan = storageService.getCareerPlan();
    if (!plan) throw new Error('No active career plan found');

    const updatedLevels = plan.levels.map((lvl) => {
      if (lvl.levelNumber !== levelNumber) return lvl;

      const sourceList = lvl.topics && lvl.topics.length > 0 ? lvl.topics : lvl.lessons;

      const updatedTopics = sourceList.map((item) => {
        const matches =
          item.id === lessonId ||
          item.id === `topic-${lvl.levelNumber}-${lessonId.split('-').pop()}` ||
          item.id === `lesson-${lvl.levelNumber}-${lessonId.split('-').pop()}`;

        if (matches) {
          const updatedTasks = (item.practiceTasks || []).map((t) => ({
            ...t,
            completionStatus: 'passed' as const,
          }));
          return {
            ...item,
            isCompleted: true,
            userSubmissionCode: submissionCode || item.userSubmissionCode,
            completedAt: new Date().toISOString(),
            practiceTasks: updatedTasks.length > 0 ? updatedTasks : item.practiceTasks,
            practiceTask: {
              ...item.practiceTask,
              completionStatus: 'passed' as const,
            },
          };
        }
        return item;
      });

      // If level was previously 'unlocked' and has lessons in progress, keep status active
      const allLessonsDone = updatedTopics.every((t) => t.isCompleted);
      let updatedStatus = lvl.status;
      if (lvl.status === 'unlocked' && !allLessonsDone) {
        updatedStatus = 'in_progress';
      }

      return {
        ...lvl,
        status: updatedStatus,
        topics: updatedTopics,
        lessons: updatedTopics as any,
      };
    });

    const totalLessons = updatedLevels.reduce((acc, l) => acc + (l.topics?.length || l.lessons.length), 0);
    const completedLessons = updatedLevels.reduce(
      (acc, l) => acc + (l.topics || l.lessons).filter((les) => les.isCompleted).length,
      0
    );

    const updatedPlan: CareerPlan = {
      ...plan,
      levels: updatedLevels,
      updatedAt: new Date().toISOString(),
      analytics: {
        ...plan.analytics,
        completedLessonsCount: completedLessons,
        estimatedDaysRemaining: Math.ceil(
          Math.max(0, totalLessons - completedLessons) / (plan.goal.studyTimePerDayHours >= 3 ? 1.5 : 1)
        ),
      },
    };

    storageService.saveCareerPlan(updatedPlan);
    return updatedPlan;
  },

  async completePracticeTask(
    levelNumber: number,
    lessonId: string,
    taskId: string,
    submissionCode?: string
  ): Promise<CareerPlan> {
    const plan = storageService.getCareerPlan();
    if (!plan) throw new Error('No active career plan found');

    const updatedLevels = plan.levels.map((lvl) => {
      if (lvl.levelNumber !== levelNumber) return lvl;

      const sourceList = lvl.topics && lvl.topics.length > 0 ? lvl.topics : lvl.lessons;

      const updatedTopics = sourceList.map((item) => {
        const matches =
          item.id === lessonId ||
          item.id === `topic-${lvl.levelNumber}-${lessonId.split('-').pop()}` ||
          item.id === `lesson-${lvl.levelNumber}-${lessonId.split('-').pop()}`;

        if (!matches) return item;

        const tasks = item.practiceTasks || [item.practiceTask];
        const updatedTasks = tasks.map((t) => {
          if (t.id === taskId || tasks.length === 1) {
            return {
              ...t,
              completionStatus: 'passed' as const,
            };
          }
          return t;
        });

        const allPassed = updatedTasks.every((t) => t.completionStatus === 'passed');

        return {
          ...item,
          practiceTasks: updatedTasks,
          practiceTask: updatedTasks[0] || item.practiceTask,
          userSubmissionCode: submissionCode || item.userSubmissionCode,
          isCompleted: allPassed ? true : item.isCompleted,
          completedAt: allPassed ? (item.completedAt || new Date().toISOString()) : item.completedAt,
        };
      });

      return {
        ...lvl,
        topics: updatedTopics,
        lessons: updatedTopics as any,
      };
    });

    const totalLessons = updatedLevels.reduce((acc, l) => acc + (l.topics?.length || l.lessons.length), 0);
    const completedLessons = updatedLevels.reduce(
      (acc, l) => acc + (l.topics || l.lessons).filter((les) => les.isCompleted).length,
      0
    );

    const updatedPlan: CareerPlan = {
      ...plan,
      levels: updatedLevels,
      updatedAt: new Date().toISOString(),
      analytics: {
        ...plan.analytics,
        completedLessonsCount: completedLessons,
        estimatedDaysRemaining: Math.ceil(
          Math.max(0, totalLessons - completedLessons) / (plan.goal.studyTimePerDayHours >= 3 ? 1.5 : 1)
        ),
      },
    };

    storageService.saveCareerPlan(updatedPlan);
    return updatedPlan;
  },

  async uncompleteLesson(levelNumber: number, lessonId: string): Promise<CareerPlan> {
    const plan = storageService.getCareerPlan();
    if (!plan) throw new Error('No active career plan found');

    const updatedLevels = plan.levels.map((lvl) => {
      if (lvl.levelNumber !== levelNumber) return lvl;

      const sourceList = lvl.topics && lvl.topics.length > 0 ? lvl.topics : lvl.lessons;

      const updatedTopics = sourceList.map((item) => {
        const matches =
          item.id === lessonId ||
          item.id === `topic-${lvl.levelNumber}-${lessonId.split('-').pop()}` ||
          item.id === `lesson-${lvl.levelNumber}-${lessonId.split('-').pop()}`;

        if (matches) {
          return {
            ...item,
            isCompleted: false,
            completedAt: undefined,
          };
        }
        return item;
      });

      return {
        ...lvl,
        topics: updatedTopics,
        lessons: updatedTopics as any,
      };
    });

    const totalLessons = updatedLevels.reduce((acc, l) => acc + (l.topics?.length || l.lessons.length), 0);
    const completedLessons = updatedLevels.reduce(
      (acc, l) => acc + (l.topics || l.lessons).filter((les) => les.isCompleted).length,
      0
    );

    const updatedPlan: CareerPlan = {
      ...plan,
      levels: updatedLevels,
      updatedAt: new Date().toISOString(),
      analytics: {
        ...plan.analytics,
        completedLessonsCount: completedLessons,
        estimatedDaysRemaining: Math.ceil(
          Math.max(0, totalLessons - completedLessons) / (plan.goal.studyTimePerDayHours >= 3 ? 1.5 : 1)
        ),
      },
    };

    storageService.saveCareerPlan(updatedPlan);
    return updatedPlan;
  },

  async toggleLesson(levelNumber: number, lessonId: string, submissionCode?: string): Promise<CareerPlan> {
    const plan = storageService.getCareerPlan();
    if (!plan) throw new Error('No active career plan found');

    const lvl = plan.levels.find((l) => l.levelNumber === levelNumber);
    if (!lvl) throw new Error(`Level ${levelNumber} not found`);

    const sourceList = lvl.topics && lvl.topics.length > 0 ? lvl.topics : lvl.lessons;
    const targetItem = sourceList.find(
      (item) =>
        item.id === lessonId ||
        item.id === `topic-${lvl.levelNumber}-${lessonId.split('-').pop()}` ||
        item.id === `lesson-${lvl.levelNumber}-${lessonId.split('-').pop()}`
    );

    if (targetItem?.isCompleted) {
      return this.uncompleteLesson(levelNumber, lessonId);
    } else {
      return this.completeLesson(levelNumber, lessonId, submissionCode);
    }
  },

  async submitAssessment(
    levelNumber: number,
    answers: Record<string, number>
  ): Promise<{
    plan: CareerPlan;
    passed: boolean;
    scorePercent: number;
    weakTopics: string[];
    recommendedLessonIds: string[];
  }> {
    const plan = storageService.getCareerPlan();
    if (!plan) throw new Error('No active career plan found');

    const levelIndex = plan.levels.findIndex((l) => l.levelNumber === levelNumber);
    if (levelIndex < 0) throw new Error(`Level ${levelNumber} not found`);

    const currentLevel = plan.levels[levelIndex];
    const assessment = currentLevel.assessment;

    let correctCount = 0;
    const weakTopics: string[] = [];

    assessment.questions.forEach((q) => {
      const selectedIndex = answers[q.id];
      if (selectedIndex === q.correctOptionIndex) {
        correctCount++;
      } else {
        if (!weakTopics.includes(q.topic)) {
          weakTopics.push(q.topic);
        }
      }
    });

    const scorePercent = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = scorePercent >= assessment.passingScorePercent;

    // Identify recommended lessons from weak topics
    const recommendedLessonIds: string[] = [];
    currentLevel.lessons.forEach((l) => {
      if (weakTopics.some((w) => l.topic.toLowerCase().includes(w.toLowerCase()))) {
        recommendedLessonIds.push(l.id);
      }
    });

    // Update current level and assessment record
    const updatedAssessment: LevelAssessment = {
      ...assessment,
      attemptsCount: assessment.attemptsCount + 1,
      latestScorePercent: scorePercent,
      passed,
      weakTopics,
      recommendedLessonIds,
      completedAt: new Date().toISOString(),
    };

    const updatedLevels = [...plan.levels];

    if (passed) {
      updatedLevels[levelIndex] = {
        ...currentLevel,
        status: 'completed',
        assessment: updatedAssessment,
      };

      // Stage-Gating Logic: Unlock next level automatically if previously locked
      if (levelIndex + 1 < updatedLevels.length) {
        const nextLevel = updatedLevels[levelIndex + 1];
        if (nextLevel.status === 'locked') {
          updatedLevels[levelIndex + 1] = {
            ...nextLevel,
            status: 'unlocked',
          };
        }
      }
    } else {
      updatedLevels[levelIndex] = {
        ...currentLevel,
        status: 'review_required',
        assessment: updatedAssessment,
      };
      // Next levels strictly remain locked!
    }

    // Check overall job readiness if all levels completed
    const allCompleted = updatedLevels.every((l) => l.status === 'completed');
    const completedSkills = updatedLevels
      .filter((l) => l.status === 'completed')
      .map((l) => l.title);

    const masteredTopics = updatedLevels.flatMap((l) =>
      (l.topics || l.lessons).filter((les) => les.isCompleted).map((les) => les.topic)
    );

    const totalAssessmentsTaken = updatedLevels.filter((l) => l.assessment.latestScorePercent !== undefined).length;
    const totalScoreSum = updatedLevels.reduce((acc, l) => acc + (l.assessment.latestScorePercent || 0), 0);
    const averageScore = totalAssessmentsTaken > 0 ? Math.round(totalScoreSum / totalAssessmentsTaken) : 0;

    const nextLevelObj = passed && levelIndex + 1 < updatedLevels.length ? updatedLevels[levelIndex + 1] : null;
    const nextFirstDay = nextLevelObj
      ? (nextLevelObj.topics?.[0]?.dayNumber || nextLevelObj.lessons?.[0]?.dayNumber || plan.currentDayNumber)
      : plan.currentDayNumber;

    const updatedPlan: CareerPlan = {
      ...plan,
      levels: updatedLevels,
      currentLevelNumber: nextLevelObj ? nextLevelObj.levelNumber : levelNumber,
      currentDayNumber: nextFirstDay,
      activeDomainId: nextLevelObj?.domainId || plan.activeDomainId,
      updatedAt: new Date().toISOString(),
      jobReadiness: {
        ...plan.jobReadiness,
        isReady: allCompleted,
        skillsCompleted: completedSkills,
        topicsMastered: masteredTopics,
        assessmentAverage: averageScore,
        technicalInterviewPreparation: {
          ...plan.jobReadiness.technicalInterviewPreparation,
          readinessScore: Math.round((completedSkills.length / updatedLevels.length) * 100),
          topicsPrepared: masteredTopics.slice(0, 8),
        },
      },
      analytics: {
        ...plan.analytics,
        totalAssessmentsCount: updatedLevels.length,
        passedAssessmentsCount: updatedLevels.filter((l) => l.status === 'completed').length,
        averageScorePercent: averageScore,
        weakAreas: passed
          ? plan.analytics.weakAreas.filter((w) => !(currentLevel.topics || currentLevel.lessons).some((les) => les.topic.toLowerCase().includes(w.toLowerCase())))
          : Array.from(new Set([...plan.analytics.weakAreas, ...weakTopics])).slice(0, 5),
        strongAreas: passed
          ? Array.from(new Set([...plan.analytics.strongAreas, currentLevel.title]))
          : plan.analytics.strongAreas,
        nextRecommendedAction: passed
          ? levelIndex + 1 < updatedLevels.length
            ? `Level ${levelNumber} Passed. Advance to Level ${levelNumber + 1}.`
            : 'All Roadmap Levels Completed! Proceed to Job Readiness verification.'
          : `Review required for Level ${levelNumber}. Review weak topics: ${weakTopics.join(', ')}.`,
      },
    };

    storageService.saveCareerPlan(updatedPlan);

    return {
      plan: updatedPlan,
      passed,
      scorePercent,
      weakTopics,
      recommendedLessonIds,
    };
  },

  setCurrentNavigation(levelNumber: number, dayNumber: number, domainId?: string): CareerPlan | null {
    const plan = storageService.getCareerPlan();
    if (!plan) return null;
    const updatedPlan: CareerPlan = {
      ...plan,
      currentLevelNumber: levelNumber,
      currentDayNumber: dayNumber,
      activeDomainId: domainId || plan.activeDomainId,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveCareerPlan(updatedPlan);
    return updatedPlan;
  },

  async updateLevelStatus(levelNumber: number, status: LevelStatus): Promise<CareerPlan> {
    const plan = storageService.getCareerPlan();
    if (!plan) throw new Error('No active career plan found');

    const updatedLevels = plan.levels.map((lvl) => {
      if (lvl.levelNumber === levelNumber) {
        return { ...lvl, status };
      }
      return lvl;
    });

    const updatedPlan: CareerPlan = {
      ...plan,
      levels: updatedLevels,
      updatedAt: new Date().toISOString(),
    };

    storageService.saveCareerPlan(updatedPlan);
    return updatedPlan;
  },

  async unlockLevel(levelNumber: number): Promise<CareerPlan> {
    return this.updateLevelStatus(levelNumber, 'unlocked');
  },

  async lockLevel(levelNumber: number): Promise<CareerPlan> {
    return this.updateLevelStatus(levelNumber, 'locked');
  },

  async clearPlan(): Promise<void> {
    storageService.clearAllData();
  },
};
