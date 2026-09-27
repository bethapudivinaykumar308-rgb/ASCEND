import { CareerPlan, UserProfile, ChatMessage } from '../types';
import { DEMO_CAREER_PLAN } from '../data/demoCareerPlan';

const STORAGE_KEYS = {
  USER_PROFILE: 'ascend_user_profile_v2',
  CAREER_PLAN: 'ascend_career_plan_v2',
  CHAT_MESSAGES: 'ascend_ai_trainer_chat_v2',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-current',
  name: 'Student',
  email: 'learner@ascend.org',
  currentGoalTitle: undefined,
  joinedAt: new Date().toISOString(),
};

export const storageService = {
  getUserProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      this.saveUserProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getCareerPlan(): CareerPlan | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CAREER_PLAN);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveCareerPlan(plan: CareerPlan | null): void {
    if (!plan) {
      localStorage.removeItem(STORAGE_KEYS.CAREER_PLAN);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.CAREER_PLAN, JSON.stringify(plan));
  },

  getChatHistory(): ChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveChatHistory(messages: ChatMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  },

  loadDemoTrack(): CareerPlan {
    const demo = { ...DEMO_CAREER_PLAN, updatedAt: new Date().toISOString() };
    this.saveCareerPlan(demo);
    const profile = this.getUserProfile();
    this.saveUserProfile({ ...profile, currentGoalTitle: demo.goal.targetJob });
    return demo;
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CAREER_PLAN);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    const profile = this.getUserProfile();
    this.saveUserProfile({ ...profile, currentGoalTitle: undefined });
  },
};
