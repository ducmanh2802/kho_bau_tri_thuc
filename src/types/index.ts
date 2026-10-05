export type SubjectType = 'tieng-viet' | 'toan' | 'english';

export type MasteryStatus = 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'MASTERED' | 'NEEDS_REVIEW';

export type QuestionType =
  | 'multiple-choice'
  | 'drag-drop'
  | 'fill-blank'
  | 'matching'
  | 'ordering'
  | 'image-choice'
  | 'audio-choice'
  | 'math-expression'
  | 'true-false';

export interface Question {
  id: string;
  subject: SubjectType;
  topicId: string;
  skillId: string;
  difficulty: 1 | 2 | 3;
  type: QuestionType;
  prompt: string;
  audioPrompt?: string; // Text to be read by TTS
  mediaEmoji?: string;
  options?: string[];
  correctAnswer: string | string[]; // Can be string or array for ordering/matching
  pairs?: { left: string; right: string }[];
  hint?: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  subject: SubjectType;
  title: string;
  description: string;
  mascotTip: string;
  questions: Question[];
  xpReward: number;
  starReward: number;
}

export interface Topic {
  id: string;
  subject: SubjectType;
  title: string;
  subtitle: string;
  iconEmoji: string;
  color: string;
  skills: string[];
  lessons: Lesson[];
}

export interface SkillMastery {
  skillId: string;
  skillName: string;
  subject: SubjectType;
  attempts: number;
  correctCount: number;
  wrongCount: number;
  status: MasteryStatus;
  lastPracticed: string; // ISO string
}

export interface DailyQuest {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  rewardStars: number;
  rewardXp: number;
  completed: boolean;
  type: 'lesson_viet' | 'lesson_math' | 'lesson_english' | 'play_game' | 'daily_review';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface AvatarItem {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'shirt' | 'backpack' | 'pet';
  emoji: string;
  priceStars: number;
  unlocked: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  grade: number; // 1
  avatarBase: 'bear' | 'fox' | 'rabbit' | 'owl';
  equipped: {
    hat?: string;
    glasses?: string;
    shirt?: string;
    backpack?: string;
    pet?: string;
  };
  xp: number;
  stars: number;
  gems: number;
  tickets: number;
  streak: number;
  lastActiveDate: string;
  unlockedItems: string[];
  completedLessons: string[];
  completedWeeklyChallenges: string[];
  dailyChestClaimedDate?: string;
  /**
   * True when the profile was populated by the parent-only demo seeder.
   * Demo figures are fabricated for showcasing reports and must never be
   * presented to the child (or to parents) as real learner progress.
   */
  isDemoData?: boolean;
}

export interface LearningAnalytics {
  totalMinutesSpent: number;
  minutesToday: number;
  todayDate: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  lessonsCompletedCount: number;
  gamesPlayedCount: number;
  skillMastery: Record<string, SkillMastery>;
  recentErrors: {
    questionId: string;
    subject: SubjectType;
    prompt: string;
    timestamp: string;
  }[];
}

export interface ParentSettings {
  dailyLimitMinutes: number; // 10, 15, 20, 30, 0 = unlimited
  soundEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  difficultyScale: 'easy' | 'normal' | 'advanced';
}

export type ActiveScreen =
  | 'home'
  | 'world_map'
  | 'subject'
  | 'games'
  | 'daily_review'
  | 'reading_fluency'
  | 'weekly_challenge'
  | 'competition'
  | 'achievements'
  | 'avatar_shop'
  | 'kidbox_companion';

export * from './competition';
export * from './reading';
export * from './learningOS';
