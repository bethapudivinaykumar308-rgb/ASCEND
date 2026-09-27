import { CareerPlan } from '../types';
import { generateRoadmapForGoal } from '../services/roadmapGenerator';

/**
 * Clearly labeled DEMO DATA track for previewing the platform features.
 * Real users start with a clean empty slate ("No roadmap yet").
 */
export const DEMO_CAREER_PLAN: CareerPlan = generateRoadmapForGoal(
  {
    targetJob: 'Python Developer',
    education: 'B.Tech Computer Science',
    currentSkillLevel: 'beginner',
    existingSkills: ['Basic Programming', 'Problem Solving'],
    preferredTechnologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    studyTimePerDayHours: 2,
    targetCompany: 'High-growth Technology Ateliers & Product Startups',
    targetExamOrInterview: 'Full Backend Technical Screening',
    targetCompletionDate: '2026-12-15',
  },
  'user-demo',
  true // isDemo flag explicitly true
);
