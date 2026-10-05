import { SubjectType } from './index';
import { ErrorCategory } from './competition';

export type EvidenceSource =
  | 'LESSON'
  | 'PRACTICE'
  | 'GAME'
  | 'COMPETITION'
  | 'MOCK_EXAM'
  | 'REVIEW';

export type EvidenceDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGE';

export interface LearningEvidence {
  id: string;
  learnerId: string;
  source: EvidenceSource;
  skillId: string;
  subject: SubjectType;
  questionId?: string;
  timestamp: number;
  correct: boolean;
  responseTimeMs?: number;
  difficulty?: EvidenceDifficulty;
  errorType?: ErrorCategory;
}

export type KnowledgeStatus =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'PRACTICING'
  | 'MASTERED'
  | 'NEEDS_REVIEW';

export interface DifficultyBreakdown {
  easy: { attempts: number; correct: number };
  medium: { attempts: number; correct: number };
  hard: { attempts: number; correct: number };
  challenge: { attempts: number; correct: number };
}

export interface ErrorProfile {
  knowledgeGap: number;
  careless: number;
  speed: number;
  misread: number;
  reasoning: number;
  unclassified: number;
}

export interface KnowledgeState {
  skillId: string;
  skillName: string;
  subject: SubjectType;
  status: KnowledgeStatus;
  mastery: number; // 0 - 100
  confidence: number; // 0 - 100 (based on evidence volume & consistency)
  accuracy: number; // 0 - 100
  recentAccuracy: number; // 0 - 100 (last 5 attempts)
  attemptCount: number;
  correctCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  lastPracticedAt?: number;
  lastCorrectAt?: number;
  lastIncorrectAt?: number;
  averageResponseTimeMs?: number;
  difficultyPerformance: DifficultyBreakdown;
  errorProfile: ErrorProfile;
  nextReviewAt?: number;
  evidenceVersion: number;
}

export type ActionType =
  | 'LEARN'
  | 'PRACTICE'
  | 'REVIEW'
  | 'SPEED_PRACTICE'
  | 'GAME'
  | 'COMPETITION'
  | 'MOCK_EXAM'
  | 'MAINTENANCE';

export interface LearningAction {
  id: string;
  type: ActionType;
  subject: SubjectType;
  skillId?: string;
  skillName?: string;
  gameId?: string;
  gameTitle?: string;
  examBlueprintId?: string;
  lessonId?: string;
  title: string;
  description: string;
  reason: string; // Parent & diagnostic explanation
  childExplanation: string; // Encouraging child-friendly wording
  estimatedMinutes: number;
  priority: number; // 1-100, higher = higher priority
  badgeEmoji: string;
}

export interface DailyPlanItem {
  id: string;
  action: LearningAction;
  estimatedMinutes: number;
  priority: number;
  reason: string;
  completed: boolean;
  completedAt?: number;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  estimatedMinutes: number;
  items: DailyPlanItem[];
  generatedFrom: {
    knowledgeVersion: number;
    policyVersion: string;
    generatedAt: number;
  };
}

export interface SessionFatigueState {
  sessionStartTime: number;
  questionsAnsweredThisSession: number;
  sessionErrorsCount: number;
  consecutiveErrorsInSession: number;
  isFatigued: boolean;
}

export interface RecommendationExplanation {
  actionId: string;
  recommendation: string;
  reason: string;
  evidence: string[];
  suggestedDurationMinutes: number;
  expectedGoal: string;
}

export interface LearningOSStore {
  schemaVersion: string;
  knowledgeStates: Record<string, KnowledgeState>;
  recentEvidences: LearningEvidence[];
  dailyPlan: DailyPlan | null;
  fatigue: SessionFatigueState;
  recommendationHistory: {
    timestamp: number;
    actionId: string;
    actionType: ActionType;
    skillId?: string;
    reason: string;
    completed: boolean;
  }[];
}
