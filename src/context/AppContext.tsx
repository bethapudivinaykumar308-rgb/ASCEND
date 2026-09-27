import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CareerPlan,
  UserGoal,
  UserProfile,
  ChatMessage,
  RoadmapLevel,
  DailyLesson,
  Topic,
  CareerDomain,
  LevelStatus,
} from '../types';
import { storageService } from '../services/storageService';
import { careerService } from '../services/careerService';
import { aiTrainerService } from '../services/aiTrainerService';
import { AIAgentStepStatus } from '../services/aiAgentService';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface LevelProgressStats {
  completedCount: number;
  totalCount: number;
  percent: number;
  isPassed: boolean;
  isUnlocked: boolean;
}

export interface OverallProgressStats {
  completedLessons: number;
  totalLessons: number;
  percent: number;
  passedLevels: number;
  totalLevels: number;
}

export interface AppContextType {
  userProfile: UserProfile;
  careerPlan: CareerPlan | null;
  activeLevelNumber: number;
  activeDayNumber: number;
  activeLesson: DailyLesson | null;
  activeTopic: Topic | null;
  activeLevel: RoadmapLevel | null;
  activeDomain: CareerDomain | null;
  toasts: Toast[];
  isTrainerOpen: boolean;
  trainerMessages: ChatMessage[];
  isGeneratingPlan: boolean;
  agentStep: AIAgentStepStatus | null;

  // Plan Management Actions
  createPlan: (goal: UserGoal) => Promise<CareerPlan>;
  loadDemoPlan: () => void;
  clearPlan: () => void;

  // Navigation
  selectDomain: (domainId: string) => void;
  selectLevel: (levelNumber: number) => void;
  selectDay: (dayNumber: number) => void;
  selectTopic: (topicId: string) => void;
  selectNextLesson: () => void;
  selectPrevLesson: () => void;

  // Stage-Gated Lock/Unlock Management
  isLevelLocked: (levelNumber: number) => boolean;
  isLevelUnlocked: (levelNumber: number) => boolean;
  isLevelCompleted: (levelNumber: number) => boolean;
  isLevelInReview: (levelNumber: number) => boolean;
  canTakeAssessment: (levelNumber: number) => boolean;
  canAccessLesson: (levelNumber: number, dayNumber: number) => boolean;
  unlockLevel: (levelNumber: number) => Promise<void>;
  lockLevel: (levelNumber: number) => Promise<void>;
  setLevelStatus: (levelNumber: number, status: LevelStatus) => Promise<void>;

  // Individual Lesson Completion Tracking
  completeLesson: (levelNumber: number, lessonId: string, code?: string) => Promise<void>;
  completePracticeTask: (levelNumber: number, lessonId: string, taskId: string, code?: string) => Promise<void>;
  uncompleteLesson: (levelNumber: number, lessonId: string) => Promise<void>;
  toggleLessonCompletion: (levelNumber: number, lessonId: string, code?: string) => Promise<void>;
  isLessonCompleted: (levelNumber: number, lessonId: string) => boolean;
  completeTopic: (levelNumber: number, topicId: string, code?: string) => Promise<void>;

  // Progress Metrics
  getLevelProgress: (levelNumber: number) => LevelProgressStats;
  getOverallProgress: () => OverallProgressStats;

  // Assessments & AI Trainer
  submitAssessment: (
    levelNumber: number,
    answers: Record<string, number>
  ) => Promise<{ passed: boolean; scorePercent: number; weakTopics: string[] }>;
  sendTrainerMessage: (content: string) => Promise<void>;
  toggleTrainer: (open?: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [careerPlan, setCareerPlan] = useState<CareerPlan | null>(() => storageService.getCareerPlan());
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(() => storageService.getCareerPlan()?.currentLevelNumber || 1);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(() => storageService.getCareerPlan()?.currentDayNumber || 1);
  const [activeDomainId, setActiveDomainId] = useState<string | undefined>(() => {
    const p = storageService.getCareerPlan();
    return p?.activeDomainId || p?.domains?.[0]?.id;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const [trainerMessages, setTrainerMessages] = useState<ChatMessage[]>(() => storageService.getChatHistory());
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [agentStep, setAgentStep] = useState<AIAgentStepStatus | null>(null);

  // Sync active level, day, & domain when plan loads or changes
  useEffect(() => {
    if (careerPlan) {
      const currentLvl = careerPlan.currentLevelNumber || 1;
      setActiveLevelNumber(currentLvl);

      const targetLvl = careerPlan.levels.find((l) => l.levelNumber === currentLvl);
      if (targetLvl?.domainId) {
        setActiveDomainId(targetLvl.domainId);
      } else if (careerPlan.domains && careerPlan.domains[0]) {
        setActiveDomainId(careerPlan.domains[0].id);
      }

      const levelDays = (targetLvl?.topics || targetLvl?.lessons)?.map((l) => l.dayNumber) || [];
      if (levelDays.length > 0 && !levelDays.includes(activeDayNumber)) {
        setActiveDayNumber(levelDays[0]);
      }
    }
  }, [careerPlan?.id]);

  // Keep activeDayNumber aligned with activeLevelNumber when switching levels
  useEffect(() => {
    if (careerPlan) {
      const currentLvl = careerPlan.levels.find((l) => l.levelNumber === activeLevelNumber);
      if (currentLvl) {
        const levelDays = (currentLvl.topics || currentLvl.lessons).map((l) => l.dayNumber);
        if (levelDays.length > 0 && !levelDays.includes(activeDayNumber)) {
          setActiveDayNumber(levelDays[0]);
        }
      }
    }
  }, [activeLevelNumber]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Plan generation through agent pipeline
  const createPlan = async (goal: UserGoal): Promise<CareerPlan> => {
    setIsGeneratingPlan(true);
    setAgentStep({
      step: 1,
      label: 'Initializing career agent intake...',
      status: 'in_progress',
    });

    try {
      const plan = await careerService.createCareerPlan(goal, (step) => {
        setAgentStep(step);
      });
      setCareerPlan(plan);
      setActiveLevelNumber(1);
      setActiveDayNumber(1);
      if (plan.domains && plan.domains[0]) {
        setActiveDomainId(plan.domains[0].id);
      }
      showToast(`Personalized roadmap generated for "${goal.targetJob}"`, 'success');
      return plan;
    } finally {
      setIsGeneratingPlan(false);
      setAgentStep(null);
    }
  };

  const loadDemoPlan = () => {
    const demo = storageService.loadDemoTrack();
    setCareerPlan(demo);
    setActiveLevelNumber(1);
    setActiveDayNumber(1);
    if (demo.domains && demo.domains[0]) {
      setActiveDomainId(demo.domains[0].id);
    }
    showToast('Loaded DEMO DATA roadmap (Python Developer track)', 'info');
  };

  const clearPlan = () => {
    careerService.clearPlan();
    setCareerPlan(null);
    setTrainerMessages([]);
    showToast('Career roadmap reset. You can set a new career goal anytime.', 'info');
  };

  // Navigation handlers
  const selectDomain = (domainId: string) => {
    if (!careerPlan) return;
    setActiveDomainId(domainId);
    const domain = careerPlan.domains.find((d) => d.id === domainId);
    if (domain && domain.levelIds.length > 0) {
      const firstLevelNum = domain.levelIds[0];
      const targetLvl = careerPlan.levels.find((l) => l.levelNumber === firstLevelNum);
      if (targetLvl && targetLvl.status !== 'locked') {
        selectLevel(firstLevelNum);
      }
    }
  };

  const selectLevel = (levelNumber: number) => {
    if (!careerPlan) return;
    const targetLvl = careerPlan.levels.find((l) => l.levelNumber === levelNumber);
    if (!targetLvl) return;

    if (targetLvl.status === 'locked') {
      showToast(`Level ${levelNumber} is locked. Pass previous level assessment first.`, 'warning');
      return;
    }

    setActiveLevelNumber(levelNumber);
    const domainId = targetLvl.domainId || activeDomainId;
    if (targetLvl.domainId) {
      setActiveDomainId(targetLvl.domainId);
    }

    const firstItem = (targetLvl.topics && targetLvl.topics[0]) || targetLvl.lessons[0];
    const newDay = firstItem ? firstItem.dayNumber : activeDayNumber;
    if (firstItem) {
      setActiveDayNumber(firstItem.dayNumber);
    }

    careerService.setCurrentNavigation(levelNumber, newDay, domainId);
  };

  const selectDay = (dayNumber: number) => {
    if (!careerPlan) return;
    const matchingLevel = careerPlan.levels.find((l) =>
      (l.topics || l.lessons).some((item) => item.dayNumber === dayNumber)
    );

    if (!matchingLevel) {
      showToast(`Day ${dayNumber} does not exist in this roadmap.`, 'warning');
      return;
    }

    if (matchingLevel.status === 'locked') {
      showToast(`Day ${dayNumber} is in Level ${matchingLevel.levelNumber} (Locked). Pass Level ${matchingLevel.levelNumber - 1} assessment first.`, 'warning');
      return;
    }

    setActiveDayNumber(dayNumber);
    setActiveLevelNumber(matchingLevel.levelNumber);
    const domainId = matchingLevel.domainId || activeDomainId;
    if (matchingLevel.domainId) {
      setActiveDomainId(matchingLevel.domainId);
    }

    careerService.setCurrentNavigation(matchingLevel.levelNumber, dayNumber, domainId);
  };

  const selectTopic = (topicId: string) => {
    if (!careerPlan) return;
    for (const lvl of careerPlan.levels) {
      const found = (lvl.topics || lvl.lessons).find((t) => t.id === topicId);
      if (found) {
        if (lvl.status === 'locked') {
          showToast(`Level ${lvl.levelNumber} is locked. Pass previous level assessment first.`, 'warning');
          return;
        }
        setActiveLevelNumber(lvl.levelNumber);
        setActiveDayNumber(found.dayNumber);
        const domainId = lvl.domainId || activeDomainId;
        if (lvl.domainId) setActiveDomainId(lvl.domainId);
        careerService.setCurrentNavigation(lvl.levelNumber, found.dayNumber, domainId);
        break;
      }
    }
  };

  const selectNextLesson = () => {
    if (!careerPlan) return;
    const allLessons = careerPlan.levels.flatMap((l) => l.topics || l.lessons);
    const currentIndex = allLessons.findIndex((l) => l.dayNumber === activeDayNumber);
    if (currentIndex >= 0 && currentIndex + 1 < allLessons.length) {
      const nextLesson = allLessons[currentIndex + 1];
      selectDay(nextLesson.dayNumber);
    }
  };

  const selectPrevLesson = () => {
    if (!careerPlan) return;
    const allLessons = careerPlan.levels.flatMap((l) => l.topics || l.lessons);
    const currentIndex = allLessons.findIndex((l) => l.dayNumber === activeDayNumber);
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      selectDay(prevLesson.dayNumber);
    }
  };

  // Stage-Gated Lock/Unlock Queries
  const isLevelLocked = (levelNumber: number): boolean => {
    const lvl = careerPlan?.levels.find((l) => l.levelNumber === levelNumber);
    return lvl ? lvl.status === 'locked' : true;
  };

  const isLevelUnlocked = (levelNumber: number): boolean => {
    const lvl = careerPlan?.levels.find((l) => l.levelNumber === levelNumber);
    return lvl ? lvl.status === 'unlocked' || lvl.status === 'in_progress' : false;
  };

  const isLevelCompleted = (levelNumber: number): boolean => {
    const lvl = careerPlan?.levels.find((l) => l.levelNumber === levelNumber);
    return lvl ? lvl.status === 'completed' : false;
  };

  const isLevelInReview = (levelNumber: number): boolean => {
    const lvl = careerPlan?.levels.find((l) => l.levelNumber === levelNumber);
    return lvl ? lvl.status === 'review_required' : false;
  };

  const canTakeAssessment = (levelNumber: number): boolean => {
    const lvl = careerPlan?.levels.find((l) => l.levelNumber === levelNumber);
    if (!lvl || lvl.status === 'locked') return false;
    return true;
  };

  const canAccessLesson = (levelNumber: number, _dayNumber: number): boolean => {
    const lvl = careerPlan?.levels.find((l) => l.levelNumber === levelNumber);
    return lvl ? lvl.status !== 'locked' : false;
  };

  const unlockLevel = async (levelNumber: number) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.unlockLevel(levelNumber);
      setCareerPlan(updated);
      showToast(`Level ${levelNumber} unlocked!`, 'success');
    } catch {
      showToast(`Failed to unlock Level ${levelNumber}`, 'error');
    }
  };

  const lockLevel = async (levelNumber: number) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.lockLevel(levelNumber);
      setCareerPlan(updated);
      showToast(`Level ${levelNumber} locked.`, 'info');
    } catch {
      showToast(`Failed to lock Level ${levelNumber}`, 'error');
    }
  };

  const setLevelStatus = async (levelNumber: number, status: LevelStatus) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.updateLevelStatus(levelNumber, status);
      setCareerPlan(updated);
      showToast(`Level ${levelNumber} status set to [${status}]`, 'info');
    } catch {
      showToast('Failed to update level status', 'error');
    }
  };

  // Individual Lesson Completion Tracking
  const completeLesson = async (levelNumber: number, lessonId: string, code?: string) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.completeLesson(levelNumber, lessonId, code);
      setCareerPlan(updated);
      showToast("Class marked as completed!", 'success');
    } catch {
      showToast('Failed to mark lesson completion', 'error');
    }
  };

  const completePracticeTask = async (levelNumber: number, lessonId: string, taskId: string, code?: string) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.completePracticeTask(levelNumber, lessonId, taskId, code);
      setCareerPlan(updated);
      showToast('Practice task completed!', 'success');
    } catch {
      showToast('Failed to record practice task completion', 'error');
    }
  };

  const uncompleteLesson = async (levelNumber: number, lessonId: string) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.uncompleteLesson(levelNumber, lessonId);
      setCareerPlan(updated);
      showToast('Class marked as pending', 'info');
    } catch {
      showToast('Failed to update lesson status', 'error');
    }
  };

  const toggleLessonCompletion = async (levelNumber: number, lessonId: string, code?: string) => {
    if (!careerPlan) return;
    try {
      const updated = await careerService.toggleLesson(levelNumber, lessonId, code);
      setCareerPlan(updated);
      const lvl = updated.levels.find((l) => l.levelNumber === levelNumber);
      const item = (lvl?.topics || lvl?.lessons)?.find(
        (t) => t.id === lessonId || t.id.endsWith(lessonId.split('-').pop() || '')
      );
      if (item?.isCompleted) {
        showToast("Class marked completed!", 'success');
      } else {
        showToast('Class unmarked', 'info');
      }
    } catch {
      showToast('Failed to toggle class status', 'error');
    }
  };

  const isLessonCompleted = (levelNumber: number, lessonId: string): boolean => {
    if (!careerPlan) return false;
    const lvl = careerPlan.levels.find((l) => l.levelNumber === levelNumber);
    if (!lvl) return false;
    const item = (lvl.topics || lvl.lessons).find(
      (t) => t.id === lessonId || t.id.endsWith(lessonId.split('-').pop() || '')
    );
    return item ? item.isCompleted : false;
  };

  const completeTopic = async (levelNumber: number, topicId: string, code?: string) => {
    return completeLesson(levelNumber, topicId, code);
  };

  // Progress calculations
  const getLevelProgress = (levelNumber: number): LevelProgressStats => {
    if (!careerPlan) {
      return { completedCount: 0, totalCount: 0, percent: 0, isPassed: false, isUnlocked: false };
    }
    const lvl = careerPlan.levels.find((l) => l.levelNumber === levelNumber);
    if (!lvl) {
      return { completedCount: 0, totalCount: 0, percent: 0, isPassed: false, isUnlocked: false };
    }
    const list = lvl.topics || lvl.lessons;
    const completed = list.filter((t) => t.isCompleted).length;
    const total = list.length;
    return {
      completedCount: completed,
      totalCount: total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      isPassed: lvl.status === 'completed',
      isUnlocked: lvl.status !== 'locked',
    };
  };

  const getOverallProgress = (): OverallProgressStats => {
    if (!careerPlan) {
      return { completedLessons: 0, totalLessons: 0, percent: 0, passedLevels: 0, totalLevels: 0 };
    }
    const totalLessons = careerPlan.levels.reduce((acc, l) => acc + (l.topics?.length || l.lessons.length), 0);
    const completedLessons = careerPlan.levels.reduce(
      (acc, l) => acc + (l.topics || l.lessons).filter((t) => t.isCompleted).length,
      0
    );
    const passedLevels = careerPlan.levels.filter((l) => l.status === 'completed').length;
    return {
      completedLessons,
      totalLessons,
      percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      passedLevels,
      totalLevels: careerPlan.levels.length,
    };
  };

  // Assessments
  const submitAssessment = async (levelNumber: number, answers: Record<string, number>) => {
    if (!careerPlan) throw new Error('No plan');
    const result = await careerService.submitAssessment(levelNumber, answers);
    setCareerPlan(result.plan);

    if (result.passed) {
      setActiveLevelNumber(result.plan.currentLevelNumber);
      setActiveDayNumber(result.plan.currentDayNumber);
      if (result.plan.activeDomainId) {
        setActiveDomainId(result.plan.activeDomainId);
      }
      showToast(`Level ${levelNumber} Passed (${result.scorePercent}%)! Next Level Unlocked.`, 'success');
    } else {
      showToast(`Score: ${result.scorePercent}%. Passing grade is 75%. Review required.`, 'warning');
    }

    return {
      passed: result.passed,
      scorePercent: result.scorePercent,
      weakTopics: result.weakTopics,
    };
  };

  const sendTrainerMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...trainerMessages, userMsg];
    setTrainerMessages(newHistory);
    storageService.saveChatHistory(newHistory);

    try {
      const assistantMsg = await aiTrainerService.respondToUser(content, careerPlan, newHistory, activeLesson);
      const updatedHistory = [...newHistory, assistantMsg];
      setTrainerMessages(updatedHistory);
      storageService.saveChatHistory(updatedHistory);
    } catch {
      showToast('Error communicating with Career Trainer', 'error');
    }
  };

  const toggleTrainer = (open?: boolean) => {
    setIsTrainerOpen((prev) => (open !== undefined ? open : !prev));
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    storageService.saveUserProfile(updated);
    showToast('Profile updated', 'success');
  };

  // Active level, lesson/topic, and active domain
  const activeLevel = careerPlan?.levels.find((l) => l.levelNumber === activeLevelNumber) || null;
  const activeLesson =
    (activeLevel?.topics || activeLevel?.lessons)?.find((les) => les.dayNumber === activeDayNumber) ||
    activeLevel?.topics?.[0] ||
    activeLevel?.lessons?.[0] ||
    null;

  const activeTopic = activeLesson as Topic | null;
  const activeDomain =
    careerPlan?.domains.find((d) => d.id === (activeDomainId || activeLevel?.domainId)) ||
    careerPlan?.domains?.[0] ||
    null;

  return (
    <AppContext.Provider
      value={{
        userProfile,
        careerPlan,
        activeLevelNumber,
        activeDayNumber,
        activeLesson,
        activeTopic,
        activeLevel,
        activeDomain,
        toasts,
        isTrainerOpen,
        trainerMessages,
        isGeneratingPlan,
        agentStep,
        createPlan,
        loadDemoPlan,
        clearPlan,
        selectDomain,
        selectLevel,
        selectDay,
        selectTopic,
        selectNextLesson,
        selectPrevLesson,
        isLevelLocked,
        isLevelUnlocked,
        isLevelCompleted,
        isLevelInReview,
        canTakeAssessment,
        canAccessLesson,
        unlockLevel,
        lockLevel,
        setLevelStatus,
        completeLesson,
        completePracticeTask,
        uncompleteLesson,
        toggleLessonCompletion,
        isLessonCompleted,
        completeTopic,
        getLevelProgress,
        getOverallProgress,
        submitAssessment,
        sendTrainerMessage,
        toggleTrainer,
        showToast,
        removeToast,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
