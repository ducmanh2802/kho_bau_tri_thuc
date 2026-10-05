import { SubjectType } from './index';

export type CompetitionSubject = SubjectType;

export type CompetitionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGE';

export interface SkillDefinition {
  skillId: string;
  skillName: string;
  subject: CompetitionSubject;
  category: string;
  description: string;
}

export interface CompetitionQuestion {
  id: string;
  subject: CompetitionSubject;
  skillId: string;
  difficulty: CompetitionDifficulty;
  prompt: string;
  mediaEmoji?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  estimatedSeconds: number;
}

export type ExamMode = 'mini_test' | 'full_mock' | 'speed_trial' | 'skill_practice';

export interface ExamBlueprint {
  id: string;
  title: string;
  subtitle: string;
  subject: CompetitionSubject;
  mode: ExamMode;
  difficulty: CompetitionDifficulty;
  durationSeconds: number;
  questionCount: number;
  badgeEmoji: string;
  rewardXp: number;
  rewardStars: number;
  skillDistribution?: Record<string, number>;
  difficultyDistribution?: Record<CompetitionDifficulty, number>;
}

export type CompetitionSessionState =
  | 'READY'
  | 'IN_PROGRESS'
  | 'SUBMITTING'
  | 'COMPLETED'
  | 'REVIEW';

export interface QuestionResponse {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  flagged?: boolean;
}

export type ErrorCategory =
  | 'KNOWLEDGE_GAP'
  | 'CARELESS_ERROR'
  | 'SPEED_ERROR'
  | 'MISREAD'
  | 'REASONING_ERROR'
  | 'UNCLASSIFIED';

export interface ErrorAnalysisItem {
  questionId: string;
  prompt: string;
  skillId: string;
  skillName: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  category: ErrorCategory;
  advice: string;
}

export type SpeedRating = 'EXCELLENT' | 'SWIFT' | 'STEADY' | 'RUSHING' | 'NEEDS_TIME';

export type ReadinessLevel =
  | 'FOUNDATION'
  | 'DEVELOPING'
  | 'PRACTICING'
  | 'STRONG'
  | 'READY_FOR_MOCK';

export interface ReadinessAssessment {
  overallLevel: ReadinessLevel;
  overallLabel: string;
  knowledgeScore: number;
  accuracyScore: number;
  speedScore: number;
  consistencyScore: number;
  skillCoverageScore: number;
  evidence: {
    totalExamsTaken: number;
    recentAccuracyAverage: number;
    medianSecondsPerQuestion: number;
    strongSkillsCount: number;
    weakSkillsCount: number;
    totalSkillsCovered: number;
  };
  recommendations: string[];
  isSufficientData: boolean;
}

export interface CompetitionExamResult {
  id: string;
  blueprintId: string;
  examTitle: string;
  subject: CompetitionSubject;
  timestamp: string;
  durationSeconds: number;
  timeUsedSeconds: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  score: number;
  speedRating: SpeedRating;
  speedLabel: string;
  averageSecondsPerQuestion: number;
  responses: QuestionResponse[];
  skillBreakdown: Record<string, { total: number; correct: number; skillName: string }>;
  strongSkills: string[];
  weakSkills: string[];
  errorAnalysis: ErrorAnalysisItem[];
  readinessSnapshot: ReadinessAssessment;
}

export interface CompetitionHistoryStore {
  examResults: CompetitionExamResult[];
  practicedSkills: Record<string, { attempts: number; correct: number; lastPracticed: string }>;
  speedTrialsCompleted: number;
  remediationPlans: {
    generatedDate: string;
    targetSkills: string[];
    completed: boolean;
  }[];
}
