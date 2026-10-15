import type { Lesson, Question, QuestionType } from '../../types';

export interface MathQuestionInit {
  id: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  skillId: string;
  prompt: string;
  correctAnswer: string | string[];
  options?: string[];
  audioPrompt?: string;
  mediaEmoji?: string;
  hint?: string;
  explanation?: string;
  matchingPairs?: { left: string; right: string }[];
  orderingItems?: string[];
  categoryBuckets?: string[];
  calc?: { a: number; op: '+' | '-'; b: number };
  visual?: {
    kind: 'TenFrame' | 'NumberLine' | 'PlaceValueBlocks' | 'Ruler' | 'ClockFace';
    props?: Record<string, unknown>;
  };
}

export function mathQ(topicId: string, init: MathQuestionInit): Question {
  const question: Question = {
    id: init.id,
    subject: 'toan',
    topicId,
    skillId: init.skillId,
    difficulty: init.difficulty,
    type: init.type,
    prompt: init.prompt,
    audioPrompt: init.audioPrompt ?? init.prompt,
    correctAnswer: init.correctAnswer,
  };
  if (init.options) question.options = init.options;
  if (init.mediaEmoji) question.mediaEmoji = init.mediaEmoji;
  if (init.hint) question.hint = init.hint;
  if (init.explanation) question.explanation = init.explanation;
  if (init.matchingPairs) question.matchingPairs = init.matchingPairs;
  if (init.orderingItems) question.orderingItems = init.orderingItems;
  if (init.categoryBuckets) question.categoryBuckets = init.categoryBuckets;
  if (init.calc) question.calc = init.calc;
  if (init.visual) question.visual = init.visual;
  return question;
}

export function mathLesson(
  topicId: string,
  id: string,
  title: string,
  description: string,
  mascotTip: string,
  questions: Question[],
  xpReward = 40,
  starReward = 3
): Lesson {
  return {
    id,
    topicId,
    subject: 'toan',
    title,
    description,
    mascotTip,
    questions,
    xpReward,
    starReward,
  };
}

export function checkNoCarryAdd(a: number, b: number): boolean {
  const onesA = a % 10;
  const onesB = b % 10;
  return onesA + onesB <= 9;
}

export function checkNoCarrySub(a: number, b: number): boolean {
  const onesA = a % 10;
  const onesB = b % 10;
  return onesA >= onesB;
}

export function makeCalc(a: number, op: '+' | '-', b: number) {
  return { a, op, b };
}