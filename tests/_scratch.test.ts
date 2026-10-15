import { describe, it } from 'vitest';
import { findLessonById } from '../src/data/curriculum';

describe('scratch lesson sizes', () => {
  it('prints', () => {
    for (const id of ['vn-les-1', 'math-les-1', 'eng-les-1', 'life-les-1']) {
      const l = findLessonById(id);
      if (!l) { console.log(id, 'NOT FOUND'); continue; }
      console.log(`${id}: ${l.questions.length} cau, types=${Array.from(new Set(l.questions.map((q) => q.type))).join(',')}`);
      console.log('  counts:', JSON.stringify(l.questions.map((q) => q.type).reduce<Record<string, number>>((a, t) => { a[t] = (a[t] ?? 0) + 1; return a; }, {})));
    }
  });
});
