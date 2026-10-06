import {
  Achievement,
  AvatarItem,
  ChildProfile,
  CompetitionHistoryStore,
  DailyPlan,
  DailyQuest,
  KnowledgeState,
  LearningAnalytics,
  LearningEvidence,
  LearningOSStore,
  MasteryStatus,
  ParentSettings,
  SessionFatigueState,
  SkillMastery,
  SubjectType,
} from '../types';
import { getAllSkills } from '../data/curriculum';
import { LearningOS, LEARNING_OS_POLICY } from './learningOS';
import { ReadingEngine } from './readingEngine';
import { CompetitionEngine } from './competitionEngine';
import { getBlueprintById } from '../data/competitionBlueprints';
import { LEGACY_MASTERY_POLICY, READING_POLICY } from '../config/policy';
import type { EvidenceDifficulty } from '../types/learningOS';
import type { CompetitionExamResult, ErrorCategory, QuestionResponse } from '../types/competition';
import type { ReadingMetrics, ReadingProfile, ReadingSkillState, ReadingStage, ReadingStageState } from '../types/reading';

/** Fixed seed so the demo paper is byte-for-byte reproducible. */
const DEMO_SEED = 20250101;

const STORAGE_KEYS = {
  CHILD_PROFILE: 'kho_bau_child_profile',
  ANALYTICS: 'kho_bau_analytics',
  PARENT_SETTINGS: 'kho_bau_parent_settings',
  DAILY_QUESTS: 'kho_bau_daily_quests',
  ACHIEVEMENTS: 'kho_bau_achievements',
  COMPETITION_HISTORY: 'kho_bau_competition_history',
  LEARNING_OS_STORE: 'kho_bau_learning_os_store',
  READING_STORE: 'kho_bau_reading_store',
  KIDBOX_STORE: 'kho_bau_kidbox_store',
};

/**
 * Versioned persistence schema for every localStorage-backed store.
 * Bumping a version requires a matching migration entry in MIGRATIONS below.
 *
 * P30-v1 adds the Kid's Box Companion store. It lives in its own localStorage
 * key, so P29-v2 payloads keep working untouched — the migration only records
 * that the child has no Kid's Box course state yet.
 */
export const STORAGE_SCHEMA_VERSION = 'P30-v1';

/**
 * Ordered migration chain. Key = target schema version, value = upgrade function.
 * Each migration must be pure, defensive and idempotent (safe to re-run).
 */
const MIGRATIONS: Record<string, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  // P28-v1 stores had no `processedEvidenceIds`; rebuild the guard list from
  // the surviving evidence so historical events stay idempotent after upgrade.
  'P29-v2': (raw) => {
    const evidences = Array.isArray(raw.recentEvidences) ? (raw.recentEvidences as LearningEvidence[]) : [];
    return {
      ...raw,
      processedEvidenceIds: Array.isArray(raw.processedEvidenceIds)
        ? raw.processedEvidenceIds
        : evidences.map((e) => (e && typeof e.id === 'string' ? e.id : '')).filter(Boolean),
    };
  },
  // Kid's Box Companion state arrives in a separate key, so this step only has
  // to guarantee the Learning OS payload stays structurally valid.
  'P30-v1': (raw) => ({ ...raw }),
};

/**
 * Ordered migration chain, oldest target version first. A payload stored under
 * an older (or unknown, or missing) version is replayed through every step it
 * has not seen yet.
 */
const MIGRATION_ORDER = ['P29-v2', 'P30-v1'] as const;

/** Every schema version the app has ever written, oldest first. */
const SCHEMA_HISTORY = ['P28-v1', 'P29-v2', 'P30-v1'] as const;

const MAX_RECENT_EVIDENCES = 200;

function createDefaultFatigue(now: number): SessionFatigueState {
  return {
    sessionStartTime: now,
    questionsAnsweredThisSession: 0,
    sessionErrorsCount: 0,
    consecutiveErrorsInSession: 0,
    isFatigued: false,
  };
}

function createEmptyLearningOSStore(now: number = Date.now()): LearningOSStore {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    knowledgeStates: {},
    recentEvidences: [],
    dailyPlan: null,
    fatigue: createDefaultFatigue(now),
    recommendationHistory: [],
    processedEvidenceIds: [],
  };
}

function clampPercent(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function safeCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

/**
 * Reads an ErrorProfile defensively out of an unknown object.
 */
function sanitizeErrorProfile(source: unknown): KnowledgeState['errorProfile'] {
  const read = (key: string): number => {
    if (!source || typeof source !== 'object') return 0;
    const n = (source as Record<string, unknown>)[key];
    return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  };
  return {
    knowledgeGap: read('knowledgeGap'),
    careless: read('careless'),
    speed: read('speed'),
    misread: read('misread'),
    reasoning: read('reasoning'),
    unclassified: read('unclassified'),
  };
}

/**
 * Reads a `{attempts, correct}` bucket defensively out of an unknown object.
 */
function countPair(source: unknown, key: string): { attempts: number; correct: number } {
  if (!source || typeof source !== 'object') return { attempts: 0, correct: 0 };
  const bucket = (source as Record<string, unknown>)[key];
  if (!bucket || typeof bucket !== 'object') return { attempts: 0, correct: 0 };
  const b = bucket as Record<string, unknown>;
  const safe = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : 0);
  return { attempts: safe(b.attempts), correct: Math.min(safe(b.correct), safe(b.attempts)) };
}

/**
 * Reads and JSON-parses a key without ever throwing.
 * Returns `undefined` for missing keys, malformed JSON and non-object payloads.
 * Exported so sibling stores (Kid's Box Companion) reuse the same hardening
 * instead of re-implementing it.
 */
export function readJSONObject(key: string): Record<string, unknown> | undefined {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Writes a payload without ever throwing (private mode / quota exhaustion).
 * Exported for sibling stores that must survive the same hostile environments.
 */
export function writeJSON(key: string, value: unknown): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the app must keep running from defaults.
  }
}

/**
 * Runs the ordered migration chain until the payload reaches the current schema.
 * An unknown or missing version is treated as the oldest known schema, so a
 * payload written by any past build is upgraded rather than discarded.
 */
function migrateToCurrentSchema(raw: Record<string, unknown>): Record<string, unknown> {
  let payload = { ...raw };
  const from = typeof payload.schemaVersion === 'string' ? payload.schemaVersion : '';
  if (from === STORAGE_SCHEMA_VERSION) return payload;

  const knownIndex = SCHEMA_HISTORY.indexOf(from as (typeof SCHEMA_HISTORY)[number]);
  const startIndex = knownIndex >= 0 ? knownIndex : 0;
  payload.schemaVersion = SCHEMA_HISTORY[startIndex];

  for (let i = startIndex + 1; i < SCHEMA_HISTORY.length; i += 1) {
    const target = SCHEMA_HISTORY[i];
    const migrate = MIGRATIONS[target];
    if (!migrate) continue;
    payload = migrate(payload);
    payload.schemaVersion = target;
  }

  payload.schemaVersion = STORAGE_SCHEMA_VERSION;
  return payload;
}

export const AVATAR_SHOP_ITEMS: AvatarItem[] = [
  { id: 'hat_cap', name: 'Mũ Lưỡi Trai Năng Động', type: 'hat', emoji: '🧢', priceStars: 5, unlocked: true },
  { id: 'hat_crown', name: 'Vương Miện Trạng Nguyên', type: 'hat', emoji: '👑', priceStars: 20, unlocked: false },
  { id: 'hat_party', name: 'Mũ Sinh Nhật Vui Vẻ', type: 'hat', emoji: '🥳', priceStars: 10, unlocked: false },
  { id: 'hat_scholar', name: 'Mũ Tiến Sĩ Nhí', type: 'hat', emoji: '🎓', priceStars: 25, unlocked: false },
  { id: 'glasses_cool', name: 'Kính Râm Siêu Ngầu', type: 'glasses', emoji: '🕶️', priceStars: 10, unlocked: false },
  { id: 'glasses_nerd', name: 'Kính Tròn Tri Thức', type: 'glasses', emoji: '👓', priceStars: 8, unlocked: true },
  { id: 'shirt_super', name: 'Áo Choàng Siêu Nhân', type: 'shirt', emoji: '🦸', priceStars: 15, unlocked: false },
  { id: 'shirt_space', name: 'Bộ Đồ Phi Hành Gia', type: 'shirt', emoji: '🧑‍🚀', priceStars: 30, unlocked: false },
  { id: 'bag_dino', name: 'Balo Khủng Long Xanh', type: 'backpack', emoji: '🎒', priceStars: 12, unlocked: true },
  { id: 'pet_cat', name: 'Mèo Miu Miu Đồng Hành', type: 'pet', emoji: '🐱', priceStars: 25, unlocked: false },
  { id: 'pet_puppy', name: 'Cún Con Thông Minh', type: 'pet', emoji: '🐶', priceStars: 25, unlocked: false },
  { id: 'pet_dragon', name: 'Rồng Con May Mắn', type: 'pet', emoji: '🐲', priceStars: 50, unlocked: false },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_lesson',
    title: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên trên hành trình',
    icon: '🌟',
    unlocked: false,
    xpReward: 50,
  },
  {
    id: 'ach_viet_master',
    title: 'Bé Giỏi Tiếng Việt',
    description: 'Hoàn thành 3 bài học Tiếng Việt',
    icon: '📚',
    unlocked: false,
    xpReward: 80,
  },
  {
    id: 'ach_math_hero',
    title: 'Thần Đồng Toán Học',
    description: 'Hoàn thành 3 bài học Toán vui vẻ',
    icon: '🔢',
    unlocked: false,
    xpReward: 80,
  },
  {
    id: 'ach_english_star',
    title: 'English Explorer',
    description: 'Hoàn thành 3 bài học Tiếng Anh',
    icon: '🇬🇧',
    unlocked: false,
    xpReward: 80,
  },
  {
    id: 'ach_gamer_fun',
    title: 'Nhà Vô Địch Trò Chơi',
    description: 'Chơi và vượt qua 3 mini-game giáo dục',
    icon: '🎮',
    unlocked: false,
    xpReward: 60,
  },
  {
    id: 'ach_streak_3',
    title: 'Ngọn Lửa Chăm Chỉ',
    description: 'Duy trì chuỗi học 3 ngày liên tiếp',
    icon: '🔥',
    unlocked: false,
    xpReward: 100,
  },
  {
    id: 'ach_review_pro',
    title: 'Trí Nhớ Siêu Phàm',
    description: 'Hoàn thành 1 lượt Ôn Tập Thông Minh',
    icon: '💡',
    unlocked: false,
    xpReward: 75,
  },
  {
    id: 'ach_weekly_hero',
    title: 'Chiến Binh Tuần',
    description: 'Vượt qua bài Thử Thách Tuần Lớp 1',
    icon: '🏆',
    unlocked: false,
    xpReward: 120,
  },
];

const DEFAULT_CHILD_PROFILE: ChildProfile = {
  id: 'child_1',
  name: 'Bé Minh',
  grade: 1,
  avatarBase: 'bear',
  equipped: {
    hat: 'hat_cap',
    glasses: 'glasses_nerd',
    backpack: 'bag_dino',
  },
  xp: 0,
  stars: 0,
  gems: 0,
  tickets: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedItems: ['hat_cap', 'glasses_nerd', 'bag_dino'],
  completedLessons: [],
  completedWeeklyChallenges: [],
};

const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  dailyLimitMinutes: 20, // 20 minutes safe recommendation for 6-7 y/o
  soundEnabled: true,
  musicEnabled: true,
  voiceEnabled: true,
  difficultyScale: 'normal',
  questionAutoplay: true, // pre-readers need to hear questions; parents can switch off
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function createDefaultQuests(): DailyQuest[] {
  return [
    {
      id: 'quest_viet',
      title: 'Học 1 bài Tiếng Việt xinh',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 3,
      rewardXp: 30,
      completed: false,
      type: 'lesson_viet',
    },
    {
      id: 'quest_math',
      title: 'Làm quen 1 bài Toán kỳ thú',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 3,
      rewardXp: 30,
      completed: false,
      type: 'lesson_math',
    },
    {
      id: 'quest_english',
      title: 'Khám phá 1 bài English vui nhộn',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 3,
      rewardXp: 30,
      completed: false,
      type: 'lesson_english',
    },
    {
      id: 'quest_game',
      title: 'Thử sức 1 trò chơi thông minh',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 2,
      rewardXp: 20,
      completed: false,
      type: 'play_game',
    },
    {
      id: 'quest_review',
      title: 'Hoàn thành Ôn tập hôm nay',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 4,
      rewardXp: 40,
      completed: false,
      type: 'daily_review',
    },
  ];
}

export class StorageService {
  // ==========================================================
  // Learning OS persistence (versioned, migratable, recoverable)
  // ==========================================================

  /**
   * Loads the Learning OS store. Any corruption, partial write or unknown
   * schema degrades to a pristine, fully usable store instead of crashing.
   */
  public static getLearningOSStore(): LearningOSStore {
    const raw = readJSONObject(STORAGE_KEYS.LEARNING_OS_STORE);
    if (!raw) return createEmptyLearningOSStore();
    return StorageService.sanitizeLearningOSStore(migrateToCurrentSchema(raw));
  }

  public static saveLearningOSStore(store: LearningOSStore) {
    writeJSON(STORAGE_KEYS.LEARNING_OS_STORE, store);
  }

  /**
   * Idempotently folds a LearningEvidence record into the Knowledge State.
   *
   * Returns true when the evidence was newly applied, false when it had
   * already been processed. Callers may therefore retry freely (double click,
   * refresh, back/forward, reopened session) without inflating mastery.
   */
  public static recordLearningEvidence(evidence: LearningEvidence): boolean {
    if (!evidence || typeof evidence.id !== 'string' || evidence.id.length === 0) return false;

    const store = StorageService.getLearningOSStore();
    if (store.processedEvidenceIds.includes(evidence.id)) return false;

    const skillMeta = getAllSkills().find((s) => s.skillId === evidence.skillId);
    const previous =
      store.knowledgeStates[evidence.skillId] ??
      LearningOS.createInitialKnowledgeState(
        evidence.skillId,
        skillMeta?.skillName || evidence.skillId,
        evidence.subject
      );

    store.knowledgeStates[evidence.skillId] = LearningOS.reduceEvidence(previous, evidence);

    store.recentEvidences.unshift(evidence);
    if (store.recentEvidences.length > MAX_RECENT_EVIDENCES) {
      store.recentEvidences.length = MAX_RECENT_EVIDENCES;
    }

    store.processedEvidenceIds.unshift(evidence.id);
    if (store.processedEvidenceIds.length > MAX_RECENT_EVIDENCES * 2) {
      store.processedEvidenceIds.length = MAX_RECENT_EVIDENCES * 2;
    }

    // Session fatigue tracking (drives the Learning OS rest recommendation).
    store.fatigue.questionsAnsweredThisSession += 1;
    if (evidence.correct) {
      store.fatigue.consecutiveErrorsInSession = 0;
    } else {
      store.fatigue.sessionErrorsCount += 1;
      store.fatigue.consecutiveErrorsInSession += 1;
    }
    store.fatigue.isFatigued =
      store.fatigue.questionsAnsweredThisSession >= LEARNING_OS_POLICY.FATIGUE_MAX_QUESTIONS ||
      store.fatigue.consecutiveErrorsInSession >= LEARNING_OS_POLICY.FATIGUE_MAX_CONSECUTIVE_ERRORS;

    StorageService.saveLearningOSStore(store);
    return true;
  }

  /** Convenience accessor used by the UI and parent reports. */
  public static getKnowledgeStates(): Record<string, KnowledgeState> {
    return StorageService.getLearningOSStore().knowledgeStates;
  }

  /** Regenerates and persists today's plan from current evidence. */
  public static refreshDailyPlan(dateString: string = getTodayString()): DailyPlan {
    const store = StorageService.getLearningOSStore();
    const plan = LearningOS.generateDailyPlan(
      store.knowledgeStates,
      dateString,
      store.fatigue,
      LEARNING_OS_POLICY.POLICY_VERSION
    );
    store.dailyPlan = plan;
    StorageService.saveLearningOSStore(store);
    return plan;
  }

  // ==========================================================
  // Reading fluency persistence
  // ==========================================================

  /** Loads the reading fluency profile, defaulting to a pristine ladder. */
  public static getReadingProfile(): ReadingProfile {
    const raw = readJSONObject(STORAGE_KEYS.READING_STORE);
    if (!raw) return ReadingEngine.emptyProfile();
    return StorageService.sanitizeReadingProfile(raw);
  }

  public static saveReadingProfile(profile: ReadingProfile) {
    const existing = readJSONObject(STORAGE_KEYS.READING_STORE);
    writeJSON(STORAGE_KEYS.READING_STORE, {
      ...(existing ?? {}),
      schemaVersion: STORAGE_SCHEMA_VERSION,
      profile,
    });
  }

  /**
   * Returns the retained reading session metrics, newest first.
   * Sessions already stored are de-duplicated by sessionId.
   */
  public static getReadingMetricsHistory(): ReadingMetrics[] {
    const raw = readJSONObject(STORAGE_KEYS.READING_STORE);
    const list = raw && Array.isArray(raw.metrics) ? (raw.metrics as ReadingMetrics[]) : [];
    const seen = new Set<string>();
    const out: ReadingMetrics[] = [];
    for (const m of list) {
      if (!m || typeof m !== 'object' || typeof m.sessionId !== 'string') continue;
      if (seen.has(m.sessionId)) continue;
      seen.add(m.sessionId);
      out.push(m);
    }
    return out;
  }

  /** Idempotently records one reading session's metrics. */
  public static saveReadingMetrics(metrics: ReadingMetrics) {
    const raw = readJSONObject(STORAGE_KEYS.READING_STORE);
    const existing = StorageService.getReadingMetricsHistory().filter(
      (m) => m.sessionId !== metrics.sessionId
    );
    existing.unshift(metrics);
    writeJSON(STORAGE_KEYS.READING_STORE, {
      ...(raw ?? {}),
      schemaVersion: STORAGE_SCHEMA_VERSION,
      metrics: existing.slice(0, READING_POLICY.MAX_RECENT_SESSIONS),
    });
  }

  /**
   * Rebuilds a valid reading profile from an arbitrary payload.
   */
  private static sanitizeReadingProfile(raw: Record<string, unknown>): ReadingProfile {
    const base = ReadingEngine.emptyProfile();
    const p = (raw.profile && typeof raw.profile === 'object' ? raw.profile : raw) as Partial<ReadingProfile>;

    const stageStates = { ...base.stageStates };
    if (p.stageStates && typeof p.stageStates === 'object' && !Array.isArray(p.stageStates)) {
      for (const [stage, value] of Object.entries(p.stageStates as Record<string, unknown>)) {
        if (!Object.prototype.hasOwnProperty.call(stageStates, stage)) continue;
        if (!value || typeof value !== 'object') continue;
        const v = value as Partial<ReadingStageState>;
        const safe = stageStates[stage as ReadingStage];
        stageStates[stage as ReadingStage] = {
          stage: safe.stage,
          accuracy: clampPercent(v.accuracy, safe.accuracy),
          accuracyGate: typeof v.accuracyGate === 'number' ? v.accuracyGate : safe.accuracyGate,
          isUnlocked: Boolean(v.isUnlocked),
          isCompleted: Boolean(v.isCompleted),
          attempts: safeCount(v.attempts),
        };
      }
    }

    const skillStates: Record<string, ReadingSkillState> = {};
    if (p.skillStates && typeof p.skillStates === 'object' && !Array.isArray(p.skillStates)) {
      for (const [skillId, value] of Object.entries(p.skillStates as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue;
        const v = value as Partial<ReadingSkillState>;
        skillStates[skillId] = {
          skillId: (typeof v.skillId === 'string' ? v.skillId : skillId) as ReadingSkillState['skillId'],
          skillName: typeof v.skillName === 'string' ? v.skillName : skillId,
          accuracy: clampPercent(v.accuracy, 0),
          attempts: safeCount(v.attempts),
          correctCount: safeCount(v.correctCount),
          averageResponseMs: typeof v.averageResponseMs === 'number' ? Math.max(0, v.averageResponseMs) : 0,
          status: (['NOT_STARTED', 'LEARNING', 'PRACTICING', 'STRONG'] as const).includes(v.status as never)
            ? (v.status as ReadingSkillState['status'])
            : 'NOT_STARTED',
          lastPracticedAt: typeof v.lastPracticedAt === 'number' ? v.lastPracticedAt : undefined,
        };
      }
    }

    const currentStage = (['ACCURACY', 'FLUENCY', 'COMPREHENSION', 'PROCESSING_SPEED', 'COMPETITION_SPEED'] as const).includes(
      p.currentStage as never
    )
      ? (p.currentStage as ReadingStage)
      : 'ACCURACY';

    return {
      currentStage,
      stageStates,
      skillStates,
      readingIndex: clampPercent(p.readingIndex, 0),
      accuracyIndex: clampPercent(p.accuracyIndex, 0),
      fluencyIndex: clampPercent(p.fluencyIndex, 0),
      comprehensionIndex: clampPercent(p.comprehensionIndex, 0),
      headline: typeof p.headline === 'string' ? p.headline : base.headline,
      encouragement: typeof p.encouragement === 'string' ? p.encouragement : base.encouragement,
      lastSessionAt: typeof p.lastSessionAt === 'number' ? p.lastSessionAt : undefined,
    };
  }

  /**
   * Rebuilds a structurally valid store from an arbitrary (possibly hostile)
   * payload. Every field is type-checked and coerced to a safe default.
   */
  private static sanitizeLearningOSStore(raw: Record<string, unknown>): LearningOSStore {
    const now = Date.now();
    const store = createEmptyLearningOSStore(now);
    store.schemaVersion = STORAGE_SCHEMA_VERSION;

    const states = raw.knowledgeStates;
    if (states && typeof states === 'object' && !Array.isArray(states)) {
      for (const [skillId, value] of Object.entries(states as Record<string, unknown>)) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        const v = value as Partial<KnowledgeState>;
        const subject: SubjectType =
          v.subject === 'toan' || v.subject === 'english' ? v.subject : 'tieng-viet';
        const num = (n: unknown, fallback = 0) =>
          typeof n === 'number' && Number.isFinite(n) ? n : fallback;
        const count = (n: unknown) => Math.max(0, Math.round(num(n, 0)));

        store.knowledgeStates[skillId] = {
          ...LearningOS.createInitialKnowledgeState(
            skillId,
            typeof v.skillName === 'string' && v.skillName ? v.skillName : skillId,
            subject
          ),
          status: (['NOT_STARTED', 'LEARNING', 'PRACTICING', 'MASTERED', 'NEEDS_REVIEW'] as const).includes(
            v.status as never
          )
            ? (v.status as KnowledgeState['status'])
            : 'NOT_STARTED',
          mastery: Math.min(100, Math.max(0, num(v.mastery))),
          confidence: Math.min(100, Math.max(0, num(v.confidence))),
          accuracy: Math.min(100, Math.max(0, num(v.accuracy))),
          recentAccuracy: Math.min(100, Math.max(0, num(v.recentAccuracy))),
          attemptCount: count(v.attemptCount),
          correctCount: count(v.correctCount),
          consecutiveCorrect: count(v.consecutiveCorrect),
          consecutiveIncorrect: count(v.consecutiveIncorrect),
          lastPracticedAt: typeof v.lastPracticedAt === 'number' ? v.lastPracticedAt : undefined,
          lastCorrectAt: typeof v.lastCorrectAt === 'number' ? v.lastCorrectAt : undefined,
          lastIncorrectAt: typeof v.lastIncorrectAt === 'number' ? v.lastIncorrectAt : undefined,
          averageResponseTimeMs:
            typeof v.averageResponseTimeMs === 'number' && v.averageResponseTimeMs > 0
              ? v.averageResponseTimeMs
              : undefined,
          difficultyPerformance:
            v.difficultyPerformance && typeof v.difficultyPerformance === 'object'
              ? {
                  easy: countPair(v.difficultyPerformance, 'easy'),
                  medium: countPair(v.difficultyPerformance, 'medium'),
                  hard: countPair(v.difficultyPerformance, 'hard'),
                  challenge: countPair(v.difficultyPerformance, 'challenge'),
                }
              : { easy: { attempts: 0, correct: 0 }, medium: { attempts: 0, correct: 0 }, hard: { attempts: 0, correct: 0 }, challenge: { attempts: 0, correct: 0 } },
          errorProfile:
            v.errorProfile && typeof v.errorProfile === 'object'
              ? sanitizeErrorProfile(v.errorProfile as unknown)
              : { knowledgeGap: 0, careless: 0, speed: 0, misread: 0, reasoning: 0, unclassified: 0 },
          nextReviewAt: typeof v.nextReviewAt === 'number' ? v.nextReviewAt : undefined,
          evidenceVersion: Math.max(1, count(v.evidenceVersion) || 1),
        };
      }
    }

    if (Array.isArray(raw.recentEvidences)) {
      store.recentEvidences = (raw.recentEvidences as LearningEvidence[])
        .filter((e): e is LearningEvidence => !!e && typeof e === 'object' && typeof e.id === 'string')
        .slice(0, MAX_RECENT_EVIDENCES);
    }

    if (Array.isArray(raw.processedEvidenceIds)) {
      store.processedEvidenceIds = (raw.processedEvidenceIds as unknown[])
        .filter((id): id is string => typeof id === 'string')
        .slice(0, MAX_RECENT_EVIDENCES * 2);
    }

    if (raw.dailyPlan && typeof raw.dailyPlan === 'object' && !Array.isArray(raw.dailyPlan)) {
      const plan = raw.dailyPlan as Partial<DailyPlan>;
      if (Array.isArray(plan.items)) {
        store.dailyPlan = {
          date: typeof plan.date === 'string' ? plan.date : getTodayString(),
          estimatedMinutes: typeof plan.estimatedMinutes === 'number' ? plan.estimatedMinutes : 0,
          items: plan.items.filter((i) => i && typeof i === 'object') as DailyPlan['items'],
          generatedFrom: {
            knowledgeVersion: 1,
            policyVersion: LEARNING_OS_POLICY.POLICY_VERSION,
            generatedAt: now,
          },
        };
      }
    }

    const fatigue = raw.fatigue;
    if (fatigue && typeof fatigue === 'object' && !Array.isArray(fatigue)) {
      const f = fatigue as Partial<SessionFatigueState>;
      store.fatigue = {
        sessionStartTime: typeof f.sessionStartTime === 'number' ? f.sessionStartTime : now,
        questionsAnsweredThisSession: Math.max(0, Math.round(Number(f.questionsAnsweredThisSession) || 0)),
        sessionErrorsCount: Math.max(0, Math.round(Number(f.sessionErrorsCount) || 0)),
        consecutiveErrorsInSession: Math.max(0, Math.round(Number(f.consecutiveErrorsInSession) || 0)),
        // Strict boolean: a truthy string like 'yes' must NOT enable fatigue.
        isFatigued: f.isFatigued === true,
      };
    }

    if (Array.isArray(raw.recommendationHistory)) {
      store.recommendationHistory = (raw.recommendationHistory as LearningOSStore['recommendationHistory'])
        .filter((r) => r && typeof r === 'object' && typeof r.actionId === 'string')
        .slice(0, 100);
    }

    return store;
  }

  public static getChildProfile(): ChildProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHILD_PROFILE);
      if (data) {
        const raw = JSON.parse(data);
        if (raw && typeof raw === 'object') {
          // Defensively sanitize and merge with defaults
          const sanitized: ChildProfile = {
            id: typeof raw.id === 'string' ? raw.id : DEFAULT_CHILD_PROFILE.id,
            name: typeof raw.name === 'string' ? raw.name : DEFAULT_CHILD_PROFILE.name,
            grade: 1,
            avatarBase: ['bear', 'fox', 'rabbit', 'owl'].includes(raw.avatarBase)
              ? raw.avatarBase
              : DEFAULT_CHILD_PROFILE.avatarBase,
            equipped: raw.equipped && typeof raw.equipped === 'object' ? raw.equipped : {},
            xp: typeof raw.xp === 'number' && !isNaN(raw.xp) && raw.xp >= 0 ? raw.xp : 0,
            stars: typeof raw.stars === 'number' && !isNaN(raw.stars) && raw.stars >= 0 ? raw.stars : 0,
            gems: typeof raw.gems === 'number' && !isNaN(raw.gems) && raw.gems >= 0 ? raw.gems : 0,
            tickets: typeof raw.tickets === 'number' && !isNaN(raw.tickets) && raw.tickets >= 0 ? raw.tickets : 0,
            streak: typeof raw.streak === 'number' && !isNaN(raw.streak) && raw.streak >= 1 ? raw.streak : 1,
            lastActiveDate: typeof raw.lastActiveDate === 'string' ? raw.lastActiveDate : getTodayString(),
            unlockedItems: Array.isArray(raw.unlockedItems)
              ? raw.unlockedItems
              : [...DEFAULT_CHILD_PROFILE.unlockedItems],
            completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
            completedWeeklyChallenges: Array.isArray(raw.completedWeeklyChallenges)
              ? raw.completedWeeklyChallenges
              : [],
            dailyChestClaimedDate: raw.dailyChestClaimedDate,
            isDemoData: raw.isDemoData === true,
          };

          // Verify streak progression
          const today = getTodayString();
          if (sanitized.lastActiveDate !== today) {
            const lastDate = new Date(sanitized.lastActiveDate);
            const currDate = new Date(today);
            const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays === 1) {
              sanitized.streak += 1;
            } else if (diffDays > 1) {
              sanitized.streak = 1;
            }
            sanitized.lastActiveDate = today;
            StorageService.saveChildProfile(sanitized);
          }
          return sanitized;
        }
      }
    } catch {
      // Ignore parse error and recover safely
    }
    // Never hand out the shared module constant: callers mutate the returned
    // object, which would otherwise corrupt the "pristine profile" baseline.
    const fresh: ChildProfile = {
      ...DEFAULT_CHILD_PROFILE,
      equipped: { ...DEFAULT_CHILD_PROFILE.equipped },
      unlockedItems: [...DEFAULT_CHILD_PROFILE.unlockedItems],
      completedLessons: [],
      completedWeeklyChallenges: [],
      lastActiveDate: getTodayString(),
      isDemoData: false,
    };
    StorageService.saveChildProfile(fresh);
    return fresh;
  }

  public static saveChildProfile(profile: ChildProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHILD_PROFILE, JSON.stringify(profile));
    } catch {
      // Storage full or private mode handled safely
    }
  }

  public static getParentSettings(): ParentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARENT_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return {
            dailyLimitMinutes: typeof parsed.dailyLimitMinutes === 'number' ? parsed.dailyLimitMinutes : 20,
            soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
            musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
            voiceEnabled: typeof parsed.voiceEnabled === 'boolean' ? parsed.voiceEnabled : true,
            difficultyScale: ['easy', 'normal', 'advanced'].includes(parsed.difficultyScale)
              ? parsed.difficultyScale
              : 'normal',
            questionAutoplay:
              typeof parsed.questionAutoplay === 'boolean' ? parsed.questionAutoplay : true,
          };
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_PARENT_SETTINGS;
  }

  public static saveParentSettings(settings: ParentSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARENT_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }

  public static getAnalytics(): LearningAnalytics {
    const today = getTodayString();
    let analytics: LearningAnalytics = {
      totalMinutesSpent: 0,
      minutesToday: 0,
      todayDate: today,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      lessonsCompletedCount: 0,
      gamesPlayedCount: 0,
      skillMastery: {},
      recentErrors: [],
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          analytics = {
            totalMinutesSpent: typeof parsed.totalMinutesSpent === 'number' ? parsed.totalMinutesSpent : 0,
            minutesToday: parsed.todayDate === today && typeof parsed.minutesToday === 'number' ? parsed.minutesToday : 0,
            todayDate: today,
            totalQuestionsAnswered: typeof parsed.totalQuestionsAnswered === 'number' ? parsed.totalQuestionsAnswered : 0,
            totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
            lessonsCompletedCount: typeof parsed.lessonsCompletedCount === 'number' ? parsed.lessonsCompletedCount : 0,
            gamesPlayedCount: typeof parsed.gamesPlayedCount === 'number' ? parsed.gamesPlayedCount : 0,
            skillMastery: parsed.skillMastery && typeof parsed.skillMastery === 'object' ? parsed.skillMastery : {},
            recentErrors: Array.isArray(parsed.recentErrors) ? parsed.recentErrors : [],
          };
        }
      }
    } catch {
      // Ignore
    }

    // Ensure all curriculum skills have mastery records
    const allSkills = getAllSkills();
    for (const s of allSkills) {
      if (!analytics.skillMastery[s.skillId]) {
        analytics.skillMastery[s.skillId] = {
          skillId: s.skillId,
          skillName: s.skillName,
          subject: s.subject,
          attempts: 0,
          correctCount: 0,
          wrongCount: 0,
          status: 'NOT_STARTED',
          lastPracticed: new Date().toISOString(),
        };
      }
    }

    return analytics;
  }

  public static saveAnalytics(analytics: LearningAnalytics) {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    } catch {
      // Ignore
    }
  }

  public static getDailyQuests(): DailyQuest[] {
    const today = getTodayString();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today && Array.isArray(parsed.quests)) {
          return parsed.quests;
        }
      }
    } catch {
      // Ignore
    }

    const newQuests = createDefaultQuests();
    StorageService.saveDailyQuests(newQuests);
    return newQuests;
  }

  public static saveDailyQuests(quests: DailyQuest[]) {
    try {
      const today = getTodayString();
      localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify({ date: today, quests }));
    } catch {
      // Ignore
    }
  }

  public static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return INITIAL_ACHIEVEMENTS;
  }

  public static saveAchievements(achs: Achievement[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achs));
    } catch {
      // Ignore
    }
  }

  // Record an answered question for adaptive learning & mastery
  public static recordQuestionAnswer(
    skillId: string,
    isCorrect: boolean,
    questionId: string,
    prompt: string,
    subject: SubjectType,
    options: {
      responseTimeMs?: number;
      difficulty?: EvidenceDifficulty;
      errorType?: ErrorCategory;
      source?: LearningEvidence['source'];
      /** Stable id so retries of the same item never double-count evidence. */
      evidenceId?: string;
    } = {}
  ) {
    const analytics = StorageService.getAnalytics();
    analytics.totalQuestionsAnswered += 1;
    if (isCorrect) {
      analytics.totalCorrect += 1;
    } else {
      analytics.recentErrors.unshift({
        questionId,
        subject,
        prompt,
        timestamp: new Date().toISOString(),
      });
      if (analytics.recentErrors.length > 20) {
        analytics.recentErrors.pop();
      }
    }

    // Emit evidence into Learning OS (idempotent: replays return false).
    StorageService.recordLearningEvidence({
      id: options.evidenceId ?? `ev_${subject}_${skillId}_${questionId}_${Date.now()}`,
      learnerId: StorageService.getChildProfile().id,
      source: options.source ?? 'LESSON',
      skillId,
      subject,
      questionId,
      timestamp: Date.now(),
      correct: isCorrect,
      responseTimeMs: options.responseTimeMs,
      difficulty: options.difficulty,
      errorType: options.errorType,
    });

    let mastery = analytics.skillMastery[skillId];
    if (!mastery) {
      mastery = {
        skillId,
        skillName: skillId,
        subject,
        attempts: 0,
        correctCount: 0,
        wrongCount: 0,
        status: 'NOT_STARTED',
        lastPracticed: new Date().toISOString(),
      };
      analytics.skillMastery[skillId] = mastery;
    }

    mastery.attempts += 1;
    if (isCorrect) {
      mastery.correctCount += 1;
    } else {
      mastery.wrongCount += 1;
    }
    mastery.lastPracticed = new Date().toISOString();

    // Determine mastery status (thresholds live in the central policy module)
    const accuracy = mastery.attempts > 0 ? mastery.correctCount / mastery.attempts : 0;
    if (
      mastery.attempts >= LEGACY_MASTERY_POLICY.MASTERED_MIN_ATTEMPTS &&
      accuracy >= LEGACY_MASTERY_POLICY.MASTERED_MIN_ACCURACY
    ) {
      mastery.status = 'MASTERED';
    } else if (
      mastery.attempts >= LEGACY_MASTERY_POLICY.REVIEW_MIN_ATTEMPTS &&
      accuracy < LEGACY_MASTERY_POLICY.REVIEW_MAX_ACCURACY
    ) {
      mastery.status = 'NEEDS_REVIEW';
    } else if (mastery.attempts >= LEGACY_MASTERY_POLICY.PRACTICING_MIN_ATTEMPTS) {
      mastery.status = 'PRACTICING';
    } else {
      mastery.status = 'LEARNING';
    }

    StorageService.saveAnalytics(analytics);
  }

  // Increment screen time
  public static addMinutesSpent(minutes: number) {
    const analytics = StorageService.getAnalytics();
    analytics.minutesToday += minutes;
    analytics.totalMinutesSpent += minutes;
    StorageService.saveAnalytics(analytics);
  }

  // Record completed lesson
  public static completeLesson(lessonId: string, subject: SubjectType, xp: number, stars: number) {
    const profile = StorageService.getChildProfile();
    const isFirstTime = !profile.completedLessons.includes(lessonId);

    if (isFirstTime) {
      profile.completedLessons.push(lessonId);
      profile.xp += xp;
      profile.stars += stars;
      profile.tickets += 1; // Earn 1 arcade ticket per new lesson!
    } else {
      // Retaking an already completed lesson grants practice review XP (+5 XP)
      // but does NOT duplicate stars/tickets (anti-farming reward integrity)
      profile.xp += 5;
    }
    StorageService.saveChildProfile(profile);

    const analytics = StorageService.getAnalytics();
    analytics.lessonsCompletedCount += 1;
    StorageService.saveAnalytics(analytics);

    // Update daily quests
    const quests = StorageService.getDailyQuests();
    const questType =
      subject === 'tieng-viet' ? 'lesson_viet' : subject === 'toan' ? 'lesson_math' : 'lesson_english';
    quests.forEach((q) => {
      if (q.type === questType && !q.completed) {
        q.currentCount += 1;
        if (q.currentCount >= q.targetCount) {
          q.completed = true;
          profile.stars += q.rewardStars;
          profile.xp += q.rewardXp;
          StorageService.saveChildProfile(profile);
        }
      }
    });
    StorageService.saveDailyQuests(quests);

    // Check achievements
    StorageService.checkAchievements();
  }

  // Record played mini game
  public static recordGamePlayed(xpReward: number = 15, starReward: number = 1) {
    const profile = StorageService.getChildProfile();
    profile.xp += xpReward;
    profile.stars += starReward;
    StorageService.saveChildProfile(profile);

    const analytics = StorageService.getAnalytics();
    analytics.gamesPlayedCount += 1;
    StorageService.saveAnalytics(analytics);

    // Update quest
    const quests = StorageService.getDailyQuests();
    quests.forEach((q) => {
      if (q.type === 'play_game' && !q.completed) {
        q.currentCount += 1;
        if (q.currentCount >= q.targetCount) {
          q.completed = true;
          profile.stars += q.rewardStars;
          profile.xp += q.rewardXp;
          StorageService.saveChildProfile(profile);
        }
      }
    });
    StorageService.saveDailyQuests(quests);

    StorageService.checkAchievements();
  }

  public static checkAchievements() {
    const profile = StorageService.getChildProfile();
    const analytics = StorageService.getAnalytics();
    const achs = StorageService.getAchievements();
    let updated = false;

    for (const a of achs) {
      if (a.unlocked) continue;

      let shouldUnlock = false;
      if (a.id === 'ach_first_lesson' && profile.completedLessons.length >= 1) shouldUnlock = true;
      if (a.id === 'ach_viet_master' && profile.completedLessons.filter((l) => l.startsWith('vn-')).length >= 3)
        shouldUnlock = true;
      if (a.id === 'ach_math_hero' && profile.completedLessons.filter((l) => l.startsWith('math-')).length >= 3)
        shouldUnlock = true;
      if (a.id === 'ach_english_star' && profile.completedLessons.filter((l) => l.startsWith('eng-')).length >= 3)
        shouldUnlock = true;
      if (a.id === 'ach_gamer_fun' && analytics.gamesPlayedCount >= 3) shouldUnlock = true;
      if (a.id === 'ach_streak_3' && profile.streak >= 3) shouldUnlock = true;

      if (shouldUnlock) {
        a.unlocked = true;
        a.unlockedAt = new Date().toISOString();
        profile.xp += a.xpReward;
        updated = true;
      }
    }

    if (updated) {
      StorageService.saveAchievements(achs);
      StorageService.saveChildProfile(profile);
    }
  }

  public static getCompetitionHistory(): CompetitionHistoryStore {
    const emptyStore: CompetitionHistoryStore = {
      examResults: [],
      practicedSkills: {},
      speedTrialsCompleted: 0,
      remediationPlans: [],
    };
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPETITION_HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return {
            examResults: Array.isArray(parsed.examResults) ? parsed.examResults : [],
            practicedSkills: parsed.practicedSkills && typeof parsed.practicedSkills === 'object' ? parsed.practicedSkills : {},
            speedTrialsCompleted: typeof parsed.speedTrialsCompleted === 'number' ? parsed.speedTrialsCompleted : 0,
            remediationPlans: Array.isArray(parsed.remediationPlans) ? parsed.remediationPlans : [],
          };
        }
      }
    } catch {
      // Safe fallback
    }
    return emptyStore;
  }

  public static saveCompetitionHistory(store: CompetitionHistoryStore) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPETITION_HISTORY, JSON.stringify(store));
    } catch {
      // Storage full handled safely
    }
  }

  /**
   * Idempotently records an exam result and awards profile rewards.
   */
  public static recordCompetitionResult(
    result: CompetitionExamResult,
    xpReward: number,
    starsReward: number
  ) {
    const store = StorageService.getCompetitionHistory();
    const existingIndex = store.examResults.findIndex((e) => e.id === result.id);

    if (existingIndex >= 0) {
      // Already recorded: avoid duplicate rewards
      store.examResults[existingIndex] = result;
      StorageService.saveCompetitionHistory(store);
      return;
    }

    // Append new result
    store.examResults.unshift(result);
    if (store.examResults.length > 30) {
      store.examResults.pop();
    }

    if (result.blueprintId.includes('speed')) {
      store.speedTrialsCompleted += 1;
    }

    // Track practiced skills
    Object.keys(result.skillBreakdown).forEach((sId) => {
      const st = result.skillBreakdown[sId];
      if (!store.practicedSkills[sId]) {
        store.practicedSkills[sId] = { attempts: 0, correct: 0, lastPracticed: new Date().toISOString() };
      }
      store.practicedSkills[sId].attempts += st.total;
      store.practicedSkills[sId].correct += st.correct;
      store.practicedSkills[sId].lastPracticed = new Date().toISOString();
    });

    StorageService.saveCompetitionHistory(store);

    // Reward child profile
    const profile = StorageService.getChildProfile();
    profile.xp += xpReward;
    profile.stars += starsReward;
    StorageService.saveChildProfile(profile);

    // Update analytics
    const analytics = StorageService.getAnalytics();
    analytics.totalQuestionsAnswered += result.totalQuestions;
    analytics.totalCorrect += result.correctCount;

    // Check errors
    result.errorAnalysis.forEach((err) => {
      analytics.recentErrors.unshift({
        questionId: err.questionId,
        subject: result.subject,
        prompt: err.prompt,
        timestamp: new Date().toISOString(),
      });
      if (analytics.recentErrors.length > 20) {
        analytics.recentErrors.pop();
      }
    });

    StorageService.saveAnalytics(analytics);
    StorageService.checkAchievements();
  }

  public static resetProgress() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CHILD_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
      localStorage.removeItem(STORAGE_KEYS.DAILY_QUESTS);
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      localStorage.removeItem(STORAGE_KEYS.COMPETITION_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.LEARNING_OS_STORE);
      localStorage.removeItem(STORAGE_KEYS.READING_STORE);
      localStorage.removeItem(STORAGE_KEYS.KIDBOX_STORE);
    } catch {
      // Storage unavailable: nothing to clear.
    }
  }

  /**
   * Seeds realistic demo data for evaluators/parents to test diagnostic reports
   * without affecting initial clean profile creation for new users.
   *
   * SAFETY (§1.2): the resulting profile is explicitly flagged with
   * `isDemoData: true` so the UI can label every screen that shows these
   * fabricated numbers, and so parents are never misled into believing a real
   * learner produced them.
   */
  public static seedDemoProfile() {
    const today = getTodayString();
    const demoProfile: ChildProfile = {
      id: 'child_demo',
      name: 'Bé Minh',
      grade: 1,
      avatarBase: 'bear',
      equipped: {
        hat: 'hat_cap',
        glasses: 'glasses_nerd',
        backpack: 'bag_dino',
      },
      xp: 220,
      stars: 18,
      gems: 5,
      tickets: 4,
      streak: 4,
      lastActiveDate: today,
      unlockedItems: ['hat_cap', 'glasses_nerd', 'bag_dino', 'hat_party'],
      completedLessons: ['vn-les-1', 'vn-les-2', 'math-les-1', 'math-les-2', 'eng-les-1'],
      completedWeeklyChallenges: ['week_1'],
      isDemoData: true,
    };
    StorageService.saveChildProfile(demoProfile);

    const analytics = StorageService.getAnalytics();
    analytics.totalMinutesSpent = 45;
    analytics.minutesToday = 15;
    analytics.totalQuestionsAnswered = 24;
    analytics.totalCorrect = 19;
    analytics.lessonsCompletedCount = 5;
    analytics.gamesPlayedCount = 4;

    // Seed skill masteries
    if (analytics.skillMastery['vn_alphabet']) {
      analytics.skillMastery['vn_alphabet'].attempts = 6;
      analytics.skillMastery['vn_alphabet'].correctCount = 6;
      analytics.skillMastery['vn_alphabet'].status = 'MASTERED';
    }
    if (analytics.skillMastery['math_counting_10']) {
      analytics.skillMastery['math_counting_10'].attempts = 5;
      analytics.skillMastery['math_counting_10'].correctCount = 5;
      analytics.skillMastery['math_counting_10'].status = 'MASTERED';
    }
    if (analytics.skillMastery['math_subtraction_10']) {
      analytics.skillMastery['math_subtraction_10'].attempts = 5;
      analytics.skillMastery['math_subtraction_10'].correctCount = 1;
      analytics.skillMastery['math_subtraction_10'].wrongCount = 4;
      analytics.skillMastery['math_subtraction_10'].status = 'NEEDS_REVIEW';
    }
    if (analytics.skillMastery['eng_phonics_letters']) {
      analytics.skillMastery['eng_phonics_letters'].attempts = 4;
      analytics.skillMastery['eng_phonics_letters'].correctCount = 3;
      analytics.skillMastery['eng_phonics_letters'].wrongCount = 1;
      analytics.skillMastery['eng_phonics_letters'].status = 'PRACTICING';
    }

    analytics.recentErrors = [
      {
        questionId: 'math-q4-2',
        subject: 'toan',
        prompt: '10 - 4 = ...',
        timestamp: new Date().toISOString(),
      },
    ];

    StorageService.saveAnalytics(analytics);

    // Seed a sample competition exam result.
    // IMPORTANT: the demo paper is produced by the real CompetitionEngine from
    // scripted demo answers, so it can never drift from production scoring logic.
    const demoBlueprint = getBlueprintById('bp-math-mini-01');
    let sampleExam: CompetitionExamResult | null = null;
    if (demoBlueprint) {
      const demoQuestions = CompetitionEngine.assembleExamQuestions(demoBlueprint, DEMO_SEED);
      const demoResponses: QuestionResponse[] = demoQuestions.map((q, idx) => {
        // 5 of 6 answered correctly on purpose so reports show a realistic mix.
        const isCorrect = idx !== 3;
        return {
          questionId: q.id,
          userAnswer: isCorrect ? q.correctAnswer : q.options[q.options.length - 1],
          isCorrect,
          timeSpentSeconds: isCorrect ? 12 + idx : 26,
        };
      });
      sampleExam = CompetitionEngine.scoreSession(
        demoBlueprint,
        demoQuestions,
        demoResponses,
        110,
        [],
        DEMO_SEED
      );
      sampleExam.id = 'demo_exam_01';
    }

    const compStore: CompetitionHistoryStore = {
      examResults: sampleExam ? [sampleExam] : [],
      practicedSkills: sampleExam
        ? Object.entries(sampleExam.skillBreakdown).reduce<
            Record<string, { attempts: number; correct: number; lastPracticed: string }>
          >((acc, [skillId, stat]) => {
            acc[skillId] = { attempts: stat.total, correct: stat.correct, lastPracticed: today };
            return acc;
          }, {})
        : {},
      speedTrialsCompleted: 0,
      remediationPlans: [
        {
          generatedDate: today,
          targetSkills: ['MATH-SUBTRACTION'],
          completed: false,
        },
      ],
    };

    StorageService.saveCompetitionHistory(compStore);
  }
}
