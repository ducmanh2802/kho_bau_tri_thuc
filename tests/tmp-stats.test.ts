import { describe, it } from 'vitest';
import { MATH_TOPICS } from '../src/data/mathCurriculum';
import { getAllQuestions } from '../src/data/curriculum';

describe('temp stats', () => {
  it('prints', () => {
    const lessons = MATH_TOPICS.flatMap((t) => t.lessons);
    const questions = MATH_TOPICS.flatMap((t) => t.lessons.flatMap((l) => l.questions));
    const small = lessons.filter((l) => l.questions.length < 10).map((l) => `${l.id}=${l.questions.length}`);
    const noDiff = lessons
      .filter((l) => {
        const ds = new Set(l.questions.map((q) => q.difficulty));
        return !(ds.has(1) && ds.has(2) && ds.has(3));
      })
      .map((l) => l.id);
    console.log('topics', MATH_TOPICS.length);
    console.log('lessons', lessons.length);
    console.log('questions', questions.length);
    console.log('all curriculum questions', getAllQuestions().length);
    console.log('small lessons', JSON.stringify(small));
    console.log('lessons missing a difficulty level', JSON.stringify(noDiff));
    console.log('calc questions', questions.filter((q) => q.calc).length);
    console.log('visual questions', questions.filter((q) => q.visual).length);
    console.log('types', JSON.stringify(questions.reduce<Record<string, number>>((acc, q) => ({ ...acc, [q.type]: (acc[q.type] ?? 0) + 1 }), {})));
  });
});
