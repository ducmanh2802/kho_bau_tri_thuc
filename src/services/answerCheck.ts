import type { Question, QuestionType } from '../types';

/**
 * Unified answer checking for lesson questions.
 * Normalises Unicode to NFC, trims whitespace, compares arrays for matching/ordering.
 */
export function checkAnswer(
  question: Question,
  userAnswer: string | string[] | null
): boolean {
  if (userAnswer === null || userAnswer === undefined) return false;

  const type = question.type;
  const correct = question.correctAnswer;

  switch (type) {
    case 'ordering': {
      if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false;
      const normUser = userAnswer.map(normalizeForCompare);
      const normCorrect = (correct as string[]).map(normalizeForCompare);
      return arraysEqual(normUser, normCorrect);
    }

    case 'matching': {
      if (typeof userAnswer !== 'string' || typeof correct !== 'string') return false;
      // Parse and normalize each pair separately for order-independent comparison
      const userPairs = parseMatchingAnswer(userAnswer);
      const correctPairs = parseMatchingAnswer(correct);
      // Sort pairs by left side for consistent comparison
      userPairs.sort((a, b) => a.left.localeCompare(b.left));
      correctPairs.sort((a, b) => a.left.localeCompare(b.left));
      return arraysEqual(userPairs.map(p => `${p.left}=${p.right}`), correctPairs.map(p => `${p.left}=${p.right}`));
    }

    case 'drag-drop':
    case 'classify': {
      if (typeof userAnswer !== 'string' || typeof correct !== 'string') return false;
      return normalizeForCompare(userAnswer) === normalizeForCompare(correct);
    }

    case 'fill-blank': {
      if (typeof userAnswer !== 'string' || typeof correct !== 'string') return false;
      return normalizeForCompare(userAnswer) === normalizeForCompare(correct);
    }

    case 'true-false': {
      if (typeof userAnswer !== 'string' || typeof correct !== 'string') return false;
      return normalizeForCompare(userAnswer) === normalizeForCompare(correct);
    }

    case 'math-expression': {
      if (typeof userAnswer !== 'string' || typeof correct !== 'string') return false;
      return normalizeMathExpression(userAnswer) === normalizeMathExpression(correct);
    }

    case 'multiple-choice':
    case 'image-choice':
    case 'audio-choice': {
      if (typeof userAnswer !== 'string' || typeof correct !== 'string') return false;
      return normalizeForCompare(userAnswer) === normalizeForCompare(correct);
    }

    default:
      return false;
  }
}

/**
 * Normalise a string for comparison: NFC, trim, collapse whitespace.
 */
export function normalizeForCompare(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ');
}

/**
 * Normalise math expression: remove all whitespace, NFC.
 * Note: We don't evaluate mathematically, just compare canonical string forms.
 * The question author must provide the canonical form in correctAnswer.
 */
export function normalizeMathExpression(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, '');
}

/**
 * Compare two arrays for equality (same length, same elements in same order).
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/**
 * Parse a matching answer string (format: "left=right|left=right") into pairs.
 */
export function parseMatchingAnswer(answer: string): { left: string; right: string }[] {
  if (!answer) return [];
  return answer.split('|').map((pair) => {
    const [left, right] = pair.split('=');
    return { left: normalizeForCompare(left), right: normalizeForCompare(right) };
  });
}

/**
 * Parse an ordering answer string (format: "item|item|item") into array.
 */
export function parseOrderingAnswer(answer: string): string[] {
  if (!answer) return [];
  return answer.split('|').map(normalizeForCompare).filter(Boolean);
}

/**
 * Build a matching answer string from pairs.
 */
export function buildMatchingAnswer(pairs: { left: string; right: string }[]): string {
  return pairs
    .map((p) => `${normalizeForCompare(p.left)}=${normalizeForCompare(p.right)}`)
    .join('|');
}

/**
 * Build an ordering answer string from items.
 */
export function buildOrderingAnswer(items: string[]): string {
  return items.map(normalizeForCompare).join('|');
}

/**
 * Get the expected answer format description for a question type.
 */
export function getAnswerFormatDescription(type: QuestionType): string {
  switch (type) {
    case 'ordering':
      return 'Các phần tử cách nhau bằng "|" theo thứ tự đúng (VD: "Bé|Lan|học|bài")';
    case 'matching':
      return 'Các cặp "trái=phải" cách nhau bằng "|" (VD: "ga=bò|chó=chó")';
    case 'drag-drop':
    case 'classify':
      return 'Nhãn nhóm đúng (VD: "Động vật")';
    case 'fill-blank':
      return 'Từ/đáp án điền vào chỗ trống';
    case 'true-false':
      return '"Đúng" hoặc "Sai"';
    case 'math-expression':
      return 'Biểu thức toán học (VD: "5+3=8")';
    case 'multiple-choice':
    case 'image-choice':
    case 'audio-choice':
      return 'Một trong các phương án cho sẵn';
    default:
      return 'Đáp án';
  }
}