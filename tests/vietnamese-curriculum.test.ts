import { describe, it, expect } from 'vitest';
import { VIETNAMESE_TOPICS } from '../src/data/vietnameseCurriculum';

describe('Vietnamese Curriculum Quality & Deterministic Invariants', () => {
  it('contains 10 comprehensive topics covering primary Grade 1 milestones', () => {
    expect(VIETNAMESE_TOPICS.length).toBe(10);
    const expectedIds = [
      'vn-chu-cai',
      'vn-dau-thanh',
      'vn-van-co-ban',
      'vn-ghep-am',
      'vn-chinh-ta',
      'vn-tu-va-vat',
      'vn-hoat-dong',
      'vn-xep-cau',
      'vn-doc-hieu-1',
      'vn-doc-hieu-2',
    ];
    for (const id of expectedIds) {
      const topic = VIETNAMESE_TOPICS.find((t) => t.id === id);
      expect(topic).toBeDefined();
      expect(topic!.lessons.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('validates that every Vietnamese question has valid options and unambiguous correct answers', () => {
    for (const topic of VIETNAMESE_TOPICS) {
      for (const lesson of topic.lessons) {
        expect(lesson.questions.length).toBeGreaterThanOrEqual(2);
        for (const q of lesson.questions) {
          expect(q.prompt).toBeTruthy();
          expect(q.correctAnswer).toBeDefined();

          if (q.type === 'multiple-choice' || q.type === 'image-choice') {
            expect(Array.isArray(q.options)).toBe(true);
            expect(q.options!.length).toBeGreaterThanOrEqual(2);
            expect(q.options).toContain(q.correctAnswer);
            // Verify uniqueness of options
            const unique = new Set(q.options);
            expect(unique.size).toBe(q.options!.length);
          }

          if (q.type === 'ordering') {
            expect(Array.isArray(q.options)).toBe(true);
            expect(Array.isArray(q.correctAnswer)).toBe(true);
            for (const item of q.correctAnswer as string[]) {
              expect(q.options).toContain(item);
            }
          }
        }
      }
    }
  });

  it('ensures spelling rules (c/k, g/gh) are linguistically correct', () => {
    const spellingTopic = VIETNAMESE_TOPICS.find((t) => t.id === 'vn-chinh-ta');
    expect(spellingTopic).toBeDefined();
    for (const lesson of spellingTopic!.lessons) {
      for (const q of lesson.questions) {
        // e.g. "k" goes with e, ê, i; "c" goes with a, o, ô, u, ư
        if (q.prompt.includes('kính') || q.prompt.includes('kim')) {
          expect(q.correctAnswer).toBe('k');
        }
        if (q.prompt.includes('cá') || q.prompt.includes('cam')) {
          expect(q.correctAnswer).toBe('c');
        }
      }
    }
  });

  it('checks vn-q1-4 for strict single-match invariant (no duplicate B-initial words)', () => {
    const topic = VIETNAMESE_TOPICS.find((t) => t.id === 'vn-chu-cai');
    const lesson = topic?.lessons.find((l) => l.id === 'vn-les-1');
    const q4 = lesson?.questions.find((q) => q.id === 'vn-q1-4');
    expect(q4).toBeDefined();
    const bWords = q4!.options!.filter((opt) => opt.startsWith('B'));
    expect(bWords.length).toBe(1);
    expect(bWords[0]).toBe('Búp bê 🪆');
  });
});
