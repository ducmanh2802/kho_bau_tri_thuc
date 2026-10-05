/**
 * CENTRAL THRESHOLD POLICY — single source of truth for every magic number in the app.
 *
 * Rationale for placing these here (§34 "no magic numbers without documentation"):
 *  - Grade 1 (6–7 y/o) attention span is ~10–20 minutes, so mastery gates use a
 *    low minimum sample size (4 attempts) with a strict accuracy bar (85%).
 *  - A 6-year-old reading Vietnamese simple text averages 12–20 s per question,
 *    so "swift" starts at 18 s and "needs more time" at 30 s.
 *  - Speed must NEVER reduce a mastery score on its own (§9 fairness), therefore
 *    speed thresholds are only ever used to *label* a session, never to gate it.
 *
 * Every field is referenced by at least one automated test.
 */

/** Mastery status transitions for the legacy `LearningAnalytics.skillMastery` map. */
export const LEGACY_MASTERY_POLICY = {
  /** Minimum attempts before a skill can be considered mastered. */
  MASTERED_MIN_ATTEMPTS: 4,
  /** Accuracy (0-1) required to reach MASTERED. */
  MASTERED_MIN_ACCURACY: 0.85,
  /** Minimum attempts before a skill can be flagged for review. */
  REVIEW_MIN_ATTEMPTS: 3,
  /** Accuracy (0-1) below which a skill is flagged NEEDS_REVIEW. */
  REVIEW_MAX_ACCURACY: 0.6,
  /** Minimum attempts before a skill is considered PRACTICING. */
  PRACTICING_MIN_ATTEMPTS: 2,
} as const;


/** Speed / pacing thresholds in seconds per question (Grade 1). */
export const SPEED_POLICY = {
  /** At or below this many seconds per question with high accuracy => EXCELLENT. */
  EXCELLENT_MAX_SECONDS: 18,
  /** Above this many seconds per question => slower pace label. */
  STEADY_MAX_SECONDS: 25,
  /** Above this many seconds per question => NEEDS_TIME pacing support. */
  NEEDS_TIME_MIN_SECONDS: 30,
  /** At or below this many seconds per question with low accuracy => RUSHING. */
  RUSHING_MAX_SECONDS: 10,
  /** Above this many seconds per question with low accuracy => NEEDS_TIME. */
  SLOW_PACE_MIN_SECONDS: 10,
  /** Accuracy (0-100) below which a session is considered low accuracy. */
  LOW_ACCURACY_MAX: 60,
  /** Accuracy (0-100) required for the high-accuracy speed bands. */
  HIGH_ACCURACY_MIN: 80,
  /** Seconds per question above which a mastered skill earns a speed-practice action. */
  SPEED_PRACTICE_MIN_SECONDS: 25,
} as const;

/** Readiness (mock-exam readiness) thresholds. */
export const READINESS_POLICY = {
  /** Minimum number of exams before a "sufficient data" verdict is allowed. */
  MIN_EXAMS_FOR_SUFFICIENT_DATA: 1,
  /** Minimum number of exams before READY_FOR_MOCK can be granted. */
  MIN_EXAMS_FOR_READY: 3,
  /** Composite score needed for READY_FOR_MOCK. */
  READY_COMPOSITE_MIN: 85,
  /** Accuracy needed for READY_FOR_MOCK. */
  READY_ACCURACY_MIN: 85,
  /** Composite score needed for STRONG. */
  STRONG_COMPOSITE_MIN: 75,
  /** Accuracy needed for STRONG. */
  STRONG_ACCURACY_MIN: 75,
  /** Composite score needed for PRACTICING. */
  PRACTICING_COMPOSITE_MIN: 60,
  /** Number of most recent exams used for the readiness aggregate. */
  RECENT_WINDOW: 5,
  /** Weights of the readiness composite (must sum to 1). */
  WEIGHTS: {
    KNOWLEDGE: 0.4,
    SPEED: 0.2,
    CONSISTENCY: 0.2,
    SKILL_COVERAGE: 0.2,
  },
} as const;

/** Competition error classification thresholds. */
export const ERROR_ANALYSIS_POLICY = {
  /** Answering faster than this (seconds) is flagged as a possible careless tap. */
  CARELESS_MAX_SECONDS: 6,
  /** Skill performance (0-1) below this is reported as a weak skill. */
  WEAK_SKILL_MAX_RATIO: 0.6,
} as const;

/**
 * READING FLUENCY POLICY
 *
 * Design rule (§7, §9): speed training is only unlocked once accuracy and
 * comprehension clear their gates, so a slow-but-accurate reader is never
 * penalised and a fast-but-inaccurate reader never gains mastery.
 */
export const READING_POLICY = {
  /** Accuracy (0-100) required to graduate from ACCURACY to FLUENCY. */
  ACCURACY_GATE: 80,
  /** Accuracy (0-100) required to unlock COMPREHENSION training. */
  COMPREHENSION_GATE: 70,
  /** Comprehension accuracy (0-100) required before PROCESSING SPEED. */
  COMPREHENSION_ACCURACY_GATE: 70,
  /** Words per minute considered comfortable for Vietnamese Grade 1. */
  TARGET_WPM: 60,
  /** Words per minute considered excellent for Vietnamese Grade 1. */
  EXCELLENT_WPM: 80,
  /** Seconds of hesitation before a tap counts as "hesitation". */
  HESITATION_SECONDS: 8,
  /** Minimum items in a session before metrics are considered reliable. */
  MIN_ITEMS_FOR_METRICS: 3,
  /** Maximum number of evidences retained for reading analytics. */
  MAX_RECENT_SESSIONS: 30,
  /** Reading skill ladder stages, ordered. */
  STAGES: ['ACCURACY', 'FLUENCY', 'COMPREHENSION', 'PROCESSING_SPEED', 'COMPETITION_SPEED'] as const,
} as const;

/** Content quality gates used by the automated question-bank validator (§15). */
export const CONTENT_POLICY = {
  /** Estimated seconds per question must stay inside this range. */
  MIN_ESTIMATED_SECONDS: 8,
  MAX_ESTIMATED_SECONDS: 90,
  /** Every option list must offer at least this many choices. */
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  /** Minimum questions required per taxonomy skill in the competition bank. */
  MIN_QUESTIONS_PER_SKILL: 2,
  /** Maximum share (0-1) of one skill allowed in a single exam. */
  MAX_SKILL_CONCENTRATION: 0.5,
  /** Normalised prompts closer than this (0-1) are treated as semantic duplicates. */
  DUPLICATE_PROMPT_SIMILARITY: 0.9,
} as const;

/** Deterministic seed defaults so every assembly path is reproducible. */
export const SEED_POLICY = {
  DEFAULT_EXAM_SEED: 20250101,
  /** Reading sessions derive their seed from the calendar day. */
  READING_SEED_SALT: 'kho-bau-doc-hieu',
} as const;

/**
 * KID'S BOX COMPANION POLICY (British English track)
 *
 * Every number that governs the companion track lives here so it can be
 * audited in one place. Design rules encoded below:
 *  - Grade 1 session length stays inside the 10–20 minute screen-time budget
 *    that SPEED_POLICY and ParentSettings already assume (§19).
 *  - A skill earns a star only from real evidence; the minimum samples are
 *    deliberately higher than the legacy mastery gates so parents are never
 *    shown a confident star from three lucky taps (§23).
 *  - Speaking never produces a pronunciation percentage (§14), so speaking
 *    thresholds only gate *labels*, never mastery.
 *  - "No premature speed pressure" (§37 Child E) means speed practice is only
 *    ever offered once accuracy is already secure.
 */
export const KIDBOX_POLICY = {
  /** Target age band for Level 1 (the track is designed for 6–7 y/o). */
  AGE_MIN: 6,
  AGE_MAX: 7,

  /** §19 — "English hôm nay" plan budget, aligned with the daily screen limit. */
  MIN_DAILY_MINUTES: 4,
  MAX_DAILY_MINUTES: 12,
  /**
   * Budget by age. A 6-year-old gets a shorter English slice than a 7-year-old,
   * which is how the plan respects both the screen-time limit and attention
   * span without the parent having to configure anything.
   */
  DAILY_MINUTES_BY_AGE: { 6: 8, 7: 10, 8: 12 } as Record<number, number>,
  /** Minutes allocated to each focus family inside the daily plan. */
  PLAN_WEAKNESS_MINUTES: 3,
  PLAN_REVIEW_MINUTES: 2,
  PLAN_UNIT_MINUTES: 4,
  PLAN_LISTENING_MINUTES: 2,
  PLAN_SPEAKING_MINUTES: 2,
  PLAN_GAME_MINUTES: 2,

  /** §37 Child D — a new learner gets a gentle baseline exploration first. */
  COLD_START_EVIDENCE_THRESHOLD: 3,

  /** §23 — star gates: attempts needed for 1★ … 5★, plus the accuracy bar. */
  STAR_MIN_ATTEMPTS: [1, 3, 6, 10, 16] as const,
  STAR_MIN_ACCURACY: [0, 60, 70, 78, 85] as const,
  /** Below this accuracy a star is withheld and the skill is flagged. */
  STAR_WEAK_ACCURACY: 60,

  /** §18 — a strand is "weak" once it has this many attempts and this accuracy. */
  WEAK_MIN_ATTEMPTS: 3,
  WEAK_MAX_ACCURACY: 70,
  /** Stride lead needed before a strand counts as the child's strength. */
  STRONG_MIN_ACCURACY: 85,
  STRONG_MIN_ATTEMPTS: 4,

  /** §25 SPACED REPETITION — intervals in days by consecutive-correct count. */
  REVIEW_INTERVAL_DAYS: [1, 2, 4, 7, 15, 30] as const,
  /** §25 — forgetting risk rises with the number of lapses. */
  REVIEW_LAPSE_WEIGHT: 0.15,
  /** §25 — priority weights (normalised internally). */
  REVIEW_WEIGHT_ERROR_RATE: 1,
  REVIEW_WEIGHT_RECENCY: 1,
  REVIEW_WEIGHT_DIFFICULTY: 0.6,
  REVIEW_WEIGHT_CONSECUTIVE_CORRECT: 0.8,
  /** A single miss must never wipe progress (§25). */
  REVIEW_MASTERY_DECAY_CAP: 10,

  /** §12 LISTENING — replay is free; these caps only bound the UI, not the child. */
  MAX_REPLAY_HINT: 3,
  SLOW_REPLAY_RATE: 0.6,

  /** §13 SPEAKING — recognition is optional, so keep sessions short. */
  SPEAKING_MAX_ATTEMPTS_PER_ITEM: 3,

  /** §15 READING — speed training waits for accuracy (§37 Child E). */
  READING_MIN_ACCURACY_FOR_SPEED: 85,

  /** §30 — caps keep localStorage small and the bundle light (§34). */
  MAX_RECENT_ATTEMPTS: 300,
  MAX_REVIEW_STATES: 400,
  MAX_WEEKLY_DAYS: 60,

  /** §28 — content validation gates. */
  MIN_ITEMS_PER_ACTIVITY: 2,
  MAX_ITEMS_PER_ACTIVITY: 6,
  MIN_ESTIMATED_SECONDS: 8,
  MAX_ESTIMATED_SECONDS: 90,
  /** §28 — options must not be so similar that two answers both look right. */
  MAX_OPTION_SIMILARITY: 0.85,

  /** §26 — competition isolation marker. */
  COMPETITION_EXCLUDED: true,
} as const;

/**
 * §7/§13/§14 — the exact wording the UI is allowed to show for speaking.
 * `pronunciation` is listed only as a banned claim so a test can enforce it.
 */
export const SPEECH_REPORTING_POLICY = {
  RECOGNITION_LABEL: 'speech recognition match',
  SELF_CHECK_LABEL: 'self-check',
  PARENT_CHECK_LABEL: 'parent-assisted check',
  BANNED_CLAIMS: ['pronunciation =', 'pronunciation score', 'phát âm chuẩn', 'pronunciation quality'],
  /** Voice preference chain (§7). */
  VOICE_PREFERENCE: ['en-GB', 'en-GB-*', 'en-*'],
} as const;

