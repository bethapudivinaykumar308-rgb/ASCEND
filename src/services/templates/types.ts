import { LearningResource, VerificationStatus } from '../../types';

export interface LevelTemplate {
  levelNumber: number;
  title: string;
  description: string;
  topics: {
    topic: string;
    explanation: string;
    objectives: string[];
    practice: { description: string; starterCode: string; expectedOutput: string };
    resources: Array<Omit<LearningResource, 'verificationStatus'> & { verificationStatus?: VerificationStatus }>;
  }[];
  assessmentTitle: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    topic: string;
  }[];
}
