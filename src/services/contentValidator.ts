import { CompetitionQuestion, ExamBlueprint } from '../types/competition';
import { COMPETITION_QUESTIONS, COMPETITION_BANK_VERSION } from '../data/competitionQuestions';
import { COMPETITION_SKILLS } from '../data/competitionTaxonomy';
import { EXAM_BLUEPRINTS } from '../data/competitionBlueprints';
import { READING_QUESTIONS, READING_PASSAGES, READING_SKILLS } from '../data/readingContent';
import { CONTENT_POLICY } from '../config/policy';
import { getAllQuestions as getCurriculumQuestions } from '../data/curriculum';
import type { Question } from '../types';
import { runKidBoxContentValidation } from './kidBoxValidator';

export type ValidationSeverity = 'ERROR' | 'WARNING';

export interface ValidationIssue {
  severity: ValidationSeverity;
  /** Where the problem lives, e.g. "competition:cq-math-01". */
  scope: string;
  code: string;
  message: string;
}

export interface ValidationReport {
  generatedAtVersion: number;
  totals: {
    competitionQuestions: number;
    readingQuestions: number;
    readingPassages: number;
    curriculumQuestions: number;
    /** Kid's Box Companion track (§28) — same gate, one report. */
    kidBoxUnits: number;
    kidBoxActivities: number;
    errors: number;
    warnings: number;
  };
  issues: ValidationIssue[];
  coverage: CoverageReport;
}

export interface CoverageCell {
  topic: string;
  skills: Record<string, { total: number; byDifficulty: Record<string, number>; byType: Record<string, number> }>;
}

export interface CoverageReport {
  /** Skills declared in the taxonomy that have zero questions. */
  skillsWithoutQuestions: string[];
  /** Skills with fewer than the configured minimum. */
  underSuppliedSkills: string[];
  /** Question types present in the bank. */
  questionTypesPresent: string[];
  /** Question types declared by the app but missing from the bank. */
  questionTypesMissing: string[];
  /** Skills holding more than the configured share of the bank. */
  overConcentratedSkills: string[];
  /** Highest share (0-1) held by any single skill. */
  maxSkillShare: number;
  matrix: CoverageCell[];
}

const ALL_QUESTION_TYPES = [
  'multiple-choice',
  'true-false',
  'fill-blank',
  'matching',
  'ordering',
  'drag-drop',
  'classify',
];

/**
 * Strips diacritics + punctuation and lowercases, so semantic duplicates that
 * differ only in accents/spacing are detected as duplicates.
 */
export function normalizeForDuplicateCheck(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

/** Jaccard similarity over word tokens, in the 0-1 range. */
export function semanticSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeForDuplicateCheck(a).split(' ').filter(Boolean));
  const tokensB = new Set(normalizeForDuplicateCheck(b).split(' ').filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const t of tokensA) if (tokensB.has(t)) intersection += 1;
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Validates a single competition question against the full contract (§10, §15).
 * Type-aware: choice types require the answer inside the options, structured
 * types require their structural payload instead.
 */
export function validateCompetitionQuestion(q: CompetitionQuestion): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = `competition:${q.id}`;
  const push = (code: string, message: string, severity: ValidationSeverity = 'ERROR') =>
    issues.push({ severity, scope, code, message });

  if (!q.id || q.id.trim().length === 0) push('MISSING_ID', 'Câu hỏi thiếu id.');
  if (!q.topic || q.topic.trim().length === 0) push('MISSING_TOPIC', 'Câu hỏi thiếu topic.');
  if (!q.prompt || q.prompt.trim().length === 0) push('EMPTY_PROMPT', 'Câu hỏi thiếu nội dung.');
  if (!q.explanation || q.explanation.trim().length === 0)
    push('EMPTY_EXPLANATION', 'Câu hỏi thiếu giải thích.');
  if (!q.skillId) push('MISSING_SKILL', 'Câu hỏi thiếu skillId.');
  if (!COMPETITION_SKILLS.some((s) => s.skillId === q.skillId))
    push('UNKNOWN_SKILL', `skillId "${q.skillId}" không có trong taxonomy.`);
  if (!['EASY', 'MEDIUM', 'HARD', 'CHALLENGE'].includes(q.difficulty))
    push('BAD_DIFFICULTY', `difficulty "${q.difficulty}" không hợp lệ.`);
  if (!ALL_QUESTION_TYPES.includes(q.questionType))
    push('BAD_QUESTION_TYPE', `questionType "${q.questionType}" không hợp lệ.`);
  if (
    q.estimatedSeconds < CONTENT_POLICY.MIN_ESTIMATED_SECONDS ||
    q.estimatedSeconds > CONTENT_POLICY.MAX_ESTIMATED_SECONDS
  ) {
    push(
      'UNREALISTIC_ESTIMATE',
      `estimatedSeconds=${q.estimatedSeconds} nằm ngoài khoảng hợp lý ${CONTENT_POLICY.MIN_ESTIMATED_SECONDS}-${CONTENT_POLICY.MAX_ESTIMATED_SECONDS}s.`
    );
  }
  if (q.options.length < CONTENT_POLICY.MIN_OPTIONS)
    push('TOO_FEW_OPTIONS', `Cần tối thiểu ${CONTENT_POLICY.MIN_OPTIONS} phương án.`);
  if (q.options.length > CONTENT_POLICY.MAX_OPTIONS)
    push('TOO_MANY_OPTIONS', `Tối đa ${CONTENT_POLICY.MAX_OPTIONS} phương án cho lớp 1.`);
  if (new Set(q.options).size !== q.options.length)
    push('DUPLICATE_OPTIONS', 'Có phương án bị trùng nhau.');

  const accepted = [q.correctAnswer, ...(q.acceptedAnswers ?? [])];

  switch (q.questionType) {
    case 'multiple-choice':
    case 'true-false':
    case 'fill-blank': {
      if (!q.options.includes(q.correctAnswer))
        push('ANSWER_NOT_IN_OPTIONS', 'Đáp án đúng phải nằm trong danh sách phương án.');
      if (q.options.length !== 2 && q.options.length !== 4)
        push('OPTION_COUNT', 'Trắc nghiệm lớp 1 nên có 2 hoặc 4 phương án.', 'WARNING');
      break;
    }
    case 'matching': {
      if (!q.matchingPairs || q.matchingPairs.length < 2)
        push('MISSING_PAIRS', 'Câu nối hình cần ít nhất 2 cặp.');
      else {
        const lefts = q.matchingPairs.map((p) => p.left);
        if (new Set(lefts).size !== lefts.length)
          push('DUPLICATE_PAIR_LEFT', 'Có mục bên trái bị trùng nhau.');
        const expected = lefts.map((l) => `${l}=${q.matchingPairs!.find((p) => p.left === l)!.right}`).join('|');
        if (CompetitionEngineNormalize(q.correctAnswer) !== CompetitionEngineNormalize(expected))
          push('PAIR_ANSWER_MISMATCH', 'correctAnswer không khớp với matchingPairs.');
        for (const pair of q.matchingPairs) {
          if (!q.options.includes(pair.right))
            push('PAIR_OPTION_MISSING', `Phương án "${pair.right}" không có trong options.`);
        }
      }
      break;
    }
    case 'ordering': {
      const items = q.orderingItems ?? [];
      if (items.length < 2) push('MISSING_ORDER_ITEMS', 'Câu sắp xếp cần ít nhất 2 phần tử.');
      if (items.length !== q.options.length)
        push('ORDER_OPTIONS_MISMATCH', 'orderingItems và options phải cùng độ dài.');
      for (const item of items) {
        if (!q.options.includes(item)) push('ORDER_OPTION_MISSING', `Ô "${item}" không có trong options.`);
      }
      const canonical = q.correctAnswer.split('|').filter(Boolean);
      if (canonical.length !== items.length)
        push('ORDER_ANSWER_LENGTH', 'correctAnswer phải chứa đúng số phần tử của orderingItems.');
      if (new Set(canonical).size !== canonical.length)
        push('ORDER_ANSWER_DUPLICATE', 'correctAnswer của câu sắp xếp có phần tử lặp.');
      break;
    }
    case 'drag-drop':
    case 'classify': {
      if (!q.categoryBuckets || q.categoryBuckets.length < 2)
        push('MISSING_BUCKETS', 'Câu phân loại cần ít nhất 2 nhóm.');
      // Canonical answer for these formats is the BUCKET LABEL, not an option.
      if (!q.categoryBuckets?.includes(q.correctAnswer))
        push('ANSWER_NOT_IN_BUCKET', 'Đáp án đúng phải là một trong các nhóm đã khai báo.');
      break;
    }
    default:
      break;
  }

  if (accepted.some((a) => typeof a !== 'string' || a.trim().length === 0))
    push('EMPTY_ANSWER', 'Đáp án đúng không được rỗng.');

  return issues;
}

/** Local normaliser to avoid a circular import with the competition engine. */
function CompetitionEngineNormalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
}

function validateBlueprint(bp: ExamBlueprint): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = `blueprint:${bp.id}`;
  const push = (code: string, message: string, severity: ValidationSeverity = 'ERROR') =>
    issues.push({ severity, scope, code, message });

  if (!bp.title?.trim()) push('MISSING_TITLE', 'Blueprint thiếu tiêu đề.');
  if (bp.durationSeconds < 120)
    push('SHORT_DURATION', 'Thời lượng bài thi tối thiểu 120 giây cho lớp 1.');
  if (bp.questionCount < 4) push('TOO_FEW_QUESTIONS', 'Bài thi cần ít nhất 4 câu.');
  if (bp.rewardStars <= 0 || bp.rewardXp <= 0) push('BAD_REWARD', 'Phần thưởng phải lớn hơn 0.');
  if (!bp.sourceNote?.trim())
    push('MISSING_SOURCE_NOTE', 'Mỗi bộ đề phải ghi rõ nguồn/ghi chú nguồn gốc.');
  if (!bp.version || bp.version < 1) push('MISSING_VERSION', 'Blueprint phải có version.');
  if ((bp.maxScore ?? 10) <= 0) push('BAD_MAX_SCORE', 'maxScore phải lớn hơn 0.');

  if (bp.questionTypeDistribution) {
    const totalShare = Object.values(bp.questionTypeDistribution).reduce((a, b) => a + b, 0);
    if (Math.abs(totalShare - 1) > 0.001)
      push(
        'DISTRIBUTION_SUM',
        `questionTypeDistribution cộng lại ${totalShare.toFixed(2)} (phải bằng 1).`,
        'WARNING'
      );
  }

  if (bp.skillDistribution) {
    const requested = Object.values(bp.skillDistribution).reduce((a, b) => a + b, 0);
    if (requested > bp.questionCount)
      push(
        'SKILL_DISTRIBUTION_TOO_LARGE',
        `skillDistribution yêu cầu ${requested} câu > questionCount ${bp.questionCount}.`,
        'WARNING'
      );
    for (const skillId of Object.keys(bp.skillDistribution)) {
      if (!COMPETITION_SKILLS.some((s) => s.skillId === skillId))
        push('UNKNOWN_SKILL_IN_DISTRIBUTION', `skillDistribution tham chiếu skillId không tồn tại: ${skillId}`);
    }
    // A blueprint must never promise more items than the bank can supply (§16).
    for (const [skillId, count] of Object.entries(bp.skillDistribution)) {
      const available = COMPETITION_QUESTIONS.filter((q) => q.skillId === skillId).length;
      if (available < count)
        push(
          'SKILL_SUPPLY_SHORTFALL',
          `skillDistribution yêu cầu ${count} câu cho "${skillId}" nhưng ngân hàng chỉ có ${available} câu.`,
          'WARNING'
        );
    }
  }

  for (const section of bp.sections ?? []) {
    if (!section.title?.trim()) push('SECTION_NO_TITLE', `Phần "${section.id}" thiếu tiêu đề.`);
    for (const skillId of section.skillIds) {
      if (!COMPETITION_SKILLS.some((s) => s.skillId === skillId))
        push('SECTION_UNKNOWN_SKILL', `Phần "${section.id}" tham chiếu skillId không tồn tại: ${skillId}`);
    }
  }

  return issues;
}

function validateReadingQuestion(q: (typeof READING_QUESTIONS)[number]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = `reading:${q.id}`;
  const push = (code: string, message: string, severity: ValidationSeverity = 'ERROR') =>
    issues.push({ severity, scope, code, message });

  if (!READING_SKILLS.some((s) => s.skillId === q.skillId))
    push('UNKNOWN_SKILL', `skillId "${q.skillId}" không có trong reading taxonomy.`);
  if (!READING_PASSAGES.some((p) => p.id === q.passageId))
    push('UNKNOWN_PASSAGE', `passageId "${q.passageId}" không tồn tại.`);
  if (!q.options.includes(q.correctAnswer))
    push('ANSWER_NOT_IN_OPTIONS', 'Đáp án đúng phải nằm trong options.');
  if (new Set(q.options).size !== q.options.length) push('DUPLICATE_OPTIONS', 'Options bị trùng.');
  if (q.wordCount <= 0) push('BAD_WORD_COUNT', 'wordCount phải lớn hơn 0.');
  if (q.targetText && !q.options.includes(q.targetText))
    push('TARGET_NOT_IN_OPTIONS', 'targetText phải là một trong các options.');
  return issues;
}

function validateCurriculumQuestion(q: Question): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = `curriculum:${q.id}`;
  const push = (code: string, message: string, severity: ValidationSeverity = 'ERROR') =>
    issues.push({ severity, scope, code, message });

  if (!q.prompt?.trim()) push('EMPTY_PROMPT', 'Câu hỏi thiếu nội dung.');
  if (!q.skillId) push('MISSING_SKILL', 'Câu hỏi thiếu skillId.');
  if (Array.isArray(q.correctAnswer)) {
    for (const item of q.correctAnswer) {
      if (!q.options?.includes(item)) push('ANSWER_NOT_IN_OPTIONS', `Đáp án "${item}" không có trong options.`);
    }
  } else if (!q.options?.includes(q.correctAnswer)) {
    push('ANSWER_NOT_IN_OPTIONS', 'Đáp án đúng phải nằm trong options.');
  }
  if (q.options && new Set(q.options).size !== q.options.length)
    push('DUPLICATE_OPTIONS', 'Options bị trùng.');
  return issues;
}

/** Builds the coverage matrix (Subject → Topic → Skill → Difficulty → Type). */
export function buildCoverageReport(): CoverageReport {
  const bySkill: Record<string, { total: number; byDifficulty: Record<string, number>; byType: Record<string, number> }> = {};
  const byTopic: Record<string, CoverageCell['skills']> = {};

  for (const q of COMPETITION_QUESTIONS) {
    if (!bySkill[q.skillId]) {
      bySkill[q.skillId] = { total: 0, byDifficulty: {}, byType: {} };
    }
    const cell = bySkill[q.skillId];
    cell.total += 1;
    cell.byDifficulty[q.difficulty] = (cell.byDifficulty[q.difficulty] ?? 0) + 1;
    cell.byType[q.questionType] = (cell.byType[q.questionType] ?? 0) + 1;

    byTopic[q.topic] = byTopic[q.topic] ?? {};
    byTopic[q.topic][q.skillId] = cell;
  }

  const total = COMPETITION_QUESTIONS.length;
  const skillShares = Object.entries(bySkill).map(([id, s]) => ({ id, share: s.total / Math.max(1, total) }));
  const maxSkillShare = skillShares.length ? Math.max(...skillShares.map((s) => s.share)) : 0;

  const typesPresent = Array.from(new Set<string>(COMPETITION_QUESTIONS.map((q) => q.questionType)));

  return {
    skillsWithoutQuestions: COMPETITION_SKILLS.filter((s) => !bySkill[s.skillId]).map((s) => s.skillId),
    underSuppliedSkills: skillShares
      .filter((s) => Math.round(s.share * total) < CONTENT_POLICY.MIN_QUESTIONS_PER_SKILL)
      .map((s) => s.id),
    questionTypesPresent: typesPresent,
    questionTypesMissing: ALL_QUESTION_TYPES.filter((t) => !typesPresent.includes(t)),
    overConcentratedSkills: skillShares
      .filter((s) => s.share > CONTENT_POLICY.MAX_SKILL_CONCENTRATION)
      .map((s) => s.id),
    maxSkillShare: Math.round(maxSkillShare * 100) / 100,
    matrix: Object.entries(byTopic).map(([topic, skills]) => ({ topic, skills })),
  };
}

/**
 * Full repository content audit (§15).
 * Returns every issue found; callers decide how to fail.
 */
export function runContentValidation(): ValidationReport {
  const issues: ValidationIssue[] = [];

  // --- Competition bank ----------------------------------------------------
  const seenIds = new Set<string>();
  const seenPrompts: { id: string; prompt: string }[] = [];

  for (const q of COMPETITION_QUESTIONS) {
    if (seenIds.has(q.id)) {
      issues.push({
        severity: 'ERROR',
        scope: `competition:${q.id}`,
        code: 'DUPLICATE_ID',
        message: `id "${q.id}" bị trùng trong ngân hàng câu hỏi.`,
      });
    }
    seenIds.add(q.id);

    issues.push(...validateCompetitionQuestion(q));

    for (const prev of seenPrompts) {
      if (prev.id === q.id) continue;
      const sim = semanticSimilarity(prev.prompt, q.prompt);
      if (sim >= CONTENT_POLICY.DUPLICATE_PROMPT_SIMILARITY) {
        issues.push({
          severity: 'ERROR',
          scope: `competition:${q.id}`,
          code: 'SEMANTIC_DUPLICATE',
          message: `Câu trùng ý với "${prev.id}" (độ tương đồng ${sim.toFixed(2)}).`,
        });
      } else if (sim >= 0.75) {
        issues.push({
          severity: 'WARNING',
          scope: `competition:${q.id}`,
          code: 'NEAR_DUPLICATE',
          message: `Câu gần giống "${prev.id}" (độ tương đồng ${sim.toFixed(2)}).`,
        });
      }
    }
    seenPrompts.push({ id: q.id, prompt: q.prompt });
  }

  // --- Blueprints ----------------------------------------------------------
  for (const bp of EXAM_BLUEPRINTS) issues.push(...validateBlueprint(bp));

  // --- Reading bank --------------------------------------------------------
  const readingIds = new Set<string>();
  for (const q of READING_QUESTIONS) {
    if (readingIds.has(q.id)) {
      issues.push({
        severity: 'ERROR',
        scope: `reading:${q.id}`,
        code: 'DUPLICATE_ID',
        message: `id "${q.id}" bị trùng trong ngân hàng đọc hiểu.`,
      });
    }
    readingIds.add(q.id);
    issues.push(...validateReadingQuestion(q));
  }

  for (const passage of READING_PASSAGES) {
    if (passage.wordCount <= 0) {
      issues.push({
        severity: 'ERROR',
        scope: `reading-passage:${passage.id}`,
        code: 'BAD_WORD_COUNT',
        message: 'wordCount của đoạn đọc phải lớn hơn 0.',
      });
    }
    for (const qid of passage.questionIds) {
      if (!READING_QUESTIONS.some((q) => q.id === qid)) {
        issues.push({
          severity: 'ERROR',
          scope: `reading-passage:${passage.id}`,
          code: 'DANGLING_QUESTION_REF',
          message: `Tham chiếu câu hỏi không tồn tại: ${qid}`,
        });
      }
    }
  }

  // --- Curriculum bank -----------------------------------------------------
  for (const q of getCurriculumQuestions()) issues.push(...validateCurriculumQuestion(q));

  // --- Kid's Box Companion (§28) ------------------------------------------
  // The companion track reuses this report format so there is exactly one
  // content gate for the whole repository.
  const kidBox = runKidBoxContentValidation();
  issues.push(
    ...kidBox.issues.map((i) => ({
      severity: i.severity,
      scope: i.scope,
      code: i.code,
      message: i.message,
    }))
  );

  const errors = issues.filter((i) => i.severity === 'ERROR').length;
  const warnings = issues.filter((i) => i.severity === 'WARNING').length;

  return {
    generatedAtVersion: COMPETITION_BANK_VERSION,
    totals: {
      competitionQuestions: COMPETITION_QUESTIONS.length,
      readingQuestions: READING_QUESTIONS.length,
      readingPassages: READING_PASSAGES.length,
      curriculumQuestions: getCurriculumQuestions().length,
      kidBoxUnits: kidBox.totals.units,
      kidBoxActivities: kidBox.totals.activities,
      errors,
      warnings,
    },
    issues,
    coverage: buildCoverageReport(),
  };
}

/** Human-readable summary used by docs and the dev diagnostics panel. */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push(`Question bank version: v${report.generatedAtVersion}`);
  lines.push(
    `Competition: ${report.totals.competitionQuestions} | Reading: ${report.totals.readingQuestions} (${report.totals.readingPassages} đoạn) | Curriculum: ${report.totals.curriculumQuestions} | Kid's Box: ${report.totals.kidBoxUnits} unit / ${report.totals.kidBoxActivities} hoạt động`
  );
  lines.push(`ERROR: ${report.totals.errors} | WARNING: ${report.totals.warnings}`);
  lines.push(
    `Coverage — dạng bài có mặt: ${report.coverage.questionTypesPresent.join(', ') || 'không có'}`
  );
  if (report.coverage.questionTypesMissing.length > 0) {
    lines.push(`Dạng bài còn thiếu: ${report.coverage.questionTypesMissing.join(', ')}`);
  }
  if (report.coverage.skillsWithoutQuestions.length > 0) {
    lines.push(`Kỹ năng chưa có câu: ${report.coverage.skillsWithoutQuestions.join(', ')}`);
  }
  if (report.coverage.underSuppliedSkills.length > 0) {
    lines.push(`Kỹ năng quá ít câu: ${report.coverage.underSuppliedSkills.join(', ')}`);
  }
  for (const issue of report.issues) {
    lines.push(`[${issue.severity}] ${issue.scope} ${issue.code}: ${issue.message}`);
  }
  return lines.join('\n');
}
