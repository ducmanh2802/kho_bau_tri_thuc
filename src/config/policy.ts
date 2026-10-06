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

/**
 * P39 LEARNING OS DECISION ENGINE POLICY
 *
 * Every weight, window and gate used by the Decision Engine lives here with a
 * documented rationale. Tests in tests/decision-engine.test.ts reference every
 * constant below — changing a number without updating tests is a red flag.
 *
 * Design rules encoded:
 *  - Learning Engine remains the source of truth; Decision Engine only reads.
 *  - UNAVAILABLE evidence is never treated as GOOD (§6).
 *  - Ancient activity is not used as if it were current ability (§7).
 *  - Faster wrong is never improvement (§18): speed requires accuracy stability.
 *  - Insufficient evidence → discovery, never fabricated weakness (§10/§24).
 *  - Every recommendation has machine-readable reason codes (§10).
 */
export const P39_DECISION_POLICY = {
  POLICY_VERSION: 'P39-v1',

  /** §7 — evidence freshness windows (ms). */
  FRESHNESS: {
    RECENT_MAX_MS: 7 * 24 * 3600 * 1000,
    OLDER_MAX_MS: 21 * 24 * 3600 * 1000,
    STALE_MAX_MS: 45 * 24 * 3600 * 1000,
  },

  /** §6 — evidence-quality confidence multipliers applied to priority scores. */
  QUALITY_MULTIPLIER: {
    VERIFIED: 1,
    PARTIAL: 0.7,
    STALE: 0.4,
    UNAVAILABLE: 0,
  } as Record<'VERIFIED' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE', number>,

  /** Freshness discount on priority contributions. */
  FRESHNESS_MULTIPLIER: {
    RECENT: 1,
    OLDER: 0.75,
    STALE: 0.4,
    UNKNOWN: 0.6,
  } as Record<'RECENT' | 'OLDER' | 'STALE' | 'UNKNOWN', number>,

  /**
   * §9 — named priority weights. Sum of positive weights is intentionally
   * larger than any single weight so multiple modest signals can outrank a
   * single weak signal without magic numbers appearing in the engine.
   */
  WEIGHT: {
    DISCOVERY_NEEDED: 30,
    // Schedule fact from Learning OS — not accuracy evidence, so it is
    // weighted above generic discovery and never decayed by freshness.
    SM2_DUE: 45,
    NEEDS_REVIEW: 20,
    FOUNDATION_GAP: 18,
    REPEATED_ERRORS: 15,
    RECOVERY_AFTER_ERROR: 14,
    CURRENT_UNIT: 14,
    RECENT_ACCURACY_DROP: 12,
    LOW_STABILITY: 12,
    NOT_PRACTICED_RECENTLY: 10,
    LOW_FLUENCY: 10,
    LOW_COMPREHENSION: 10,
    SUBJECT_BALANCE: 8,
    COMPETITION_READINESS: 8,
    IMPROVEMENT_OPPORTUNITY: 6,
    ACCURACY_BEFORE_SPEED: 5,
    FOUNDATION_BEFORE_DEPENDENT: 12,
    WEAK_BEFORE_MASTERED: 6,
    SPEED_SAFE: 4,
    AVAILABILITY_OK: 2,
    // Penalties
    RECENT_REPETITION: -20,
    OVERPRACTICE: -25,
    FATIGUE: -40,
  } as Record<string, number>,

  /** §14 — daily plan size (ÔN TẬP HÔM NAY). */
  DAILY_PLAN: {
    MIN_ITEMS: 3,
    MAX_ITEMS: 5,
    DEFAULT_MINUTES: 12,
  },

  /** §15 — session planner budgets (respect parent screen-time guidance). */
  SESSION: {
    QUICK_MAX_MINUTES: 5,
    STANDARD_MIN_MINUTES: 10,
    STANDARD_MAX_MINUTES: 15,
    FULL_MIN_MINUTES: 15,
    FULL_MAX_MINUTES: 20,
    RECOVERY_MAX_MINUTES: 5,
  },

  /** Cold start / insufficient evidence. */
  COLD_START_EVIDENCE_THRESHOLD: 3,
  MIN_ATTEMPTS_FOR_CONFIDENT_NEED: 3,

  /** §18/§21 — speed safety: accuracy must be stable before SPEED_PRACTICE. */
  SPEED: {
    ACCURACY_GATE: 80,
    STABILITY_GATE: 3,
    RESPONSE_TIME_MIN_SECONDS: 25,
  },

  /** Competition readiness mapping (P37 ladder → Decision Engine). */
  COMPETITION: {
    /** Accuracy below this OR consistency below this blocks mock/speed. */
    ACCURACY_STABILITY_GATE: 80,
    CONSISTENCY_GATE: 70,
  },

  /** §22 — practice repetition control. */
  REPETITION: {
    /** Suppress same skill+type unless recovery reasons apply. */
    COOLDOWN_MS: 4 * 3600 * 1000,
    RECOVERY_REASONS: ['NEEDS_REVIEW', 'RECOVERY_AFTER_ERROR', 'SM2_DUE'] as string[],
  },

  /** §13 — subject starvation prevention (evidence-driven, not blind rotation). */
  SUBJECT_BALANCE: {
    STARVATION_ATTEMPTS: 6,
    BOOST: 10,
  },

  /** §23 — only recommend activities the runtime can actually launch. */
  RECOMMEND_MAX: 5,

  /** Parent screen-time default when settings are unavailable. */
  DEFAULT_BUDGET_MINUTES: 20,
} as const;

/** Launchable game ids the runtime can actually open (§23 availability). */
export const LAUNCHABLE_GAME_IDS = [
  'catch_letters',
  'syllable_builder',
  'rhyme_hunter',
  'sentence_scramble',
  'listen_pick',
  'falling_numbers',
  'speed_racing',
  'number_tower',
  'ocean_fishing',
  'shape_sorting',
  'animal_safari',
  'color_balloon',
  'memory_cards',
  'coloring_canvas',
  'kidbox_word_safari',
] as const;

/** Deterministic seed defaults so every assembly path is reproducible. */
export const SEED_POLICY = {
  DEFAULT_EXAM_SEED: 20250101,
  /** Reading sessions derive their seed from the calendar day. */
  READING_SEED_SALT: 'kho-bau-doc-hieu',
} as const;

/**
 * P36 COMPETITION BANK POLICY — depth + distribution gates for the expanded
 * Grade-1 competition bank (target: 360+ validated canonical items).
 *
 * Every threshold below is referenced by tests/competition-p36.test.ts.
 * Forensic basis (132-item legacy bank, Oct 2026 audit):
 *  - legacy answer-position bias was 96% at options[0] (§5 defect, fixed by
 *    deterministic rotation + round-robin placement of new items)
 *  - legacy EASY prompts peaked at 17 words; manipulative EASY types
 *    (ordering/matching) legitimately need up to 45s
 *  - thinnest legacy types were drag-drop (2) and classify (4)
 */
export const P36_BANK_POLICY = {
  /** Minimum genuinely validated canonical items for PASS (§25). */
  MIN_BANK_ITEMS: 300,
  /** Preferred depth when the architecture supports it cleanly. */
  PREFERRED_BANK_ITEMS: 360,
  /** Minimum items per taxonomy skill (legacy minimum was 3). */
  MIN_ITEMS_PER_SKILL: 8,
  /** Minimum items per question type (legacy drag-drop had 2). */
  MIN_ITEMS_PER_TYPE: 10,
  /** Minimum items per difficulty band. */
  MIN_ITEMS_PER_DIFFICULTY: 30,
  /** Minimum items per subject (legacy English had 27). */
  MIN_ITEMS_PER_SUBJECT: 60,
  /** No single answer position may exceed this share of 4-option items. */
  MAX_ANSWER_POSITION_SHARE: 0.35,
  /** True/False verdicts must stay inside this [min, max] share band. */
  TF_MIN_SHARE: 0.35,
  TF_MAX_SHARE: 0.65,
  /** EASY prompts stay short enough for Grade-1 decoding (legacy max: 17). */
  EASY_MAX_PROMPT_WORDS: 30,
  /** EASY choice items must be answerable quickly (legacy max: 25s). */
  EASY_CHOICE_MAX_SECONDS: 30,
  /** EASY manipulative items (ordering/matching) may take longer (max: 45s). */
  EASY_MANIPULATIVE_MAX_SECONDS: 50,
  /** MEDIUM items peak at 40s in the legacy bank. */
  MEDIUM_MAX_SECONDS: 50,
  /** HARD/CHALLENGE floor: multi-step reasoning needs deliberation time. */
  HARD_MIN_SECONDS: 15,
  /** Explanations shorter than this cannot teach (legacy minimum: 19). */
  MIN_EXPLANATION_CHARS: 12,
  /** Answer-leak scan only applies to distinctive answers (avoids "Chi"). */
  LEAK_MIN_ANSWER_CHARS: 8,
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

