import { describe, it, expect } from 'vitest';
import { COMPETITION_QUESTIONS } from '../src/data/competitionQuestions';
import { COMPETITION_SKILLS } from '../src/data/competitionTaxonomy';
import { EXAM_BLUEPRINTS } from '../src/data/competitionBlueprints';

describe('Competition Question Bank & Blueprint Quality Gate', () => {
  it('validates that every competition question satisfies strict quality standards', () => {
    expect(COMPETITION_QUESTIONS.length).toBeGreaterThanOrEqual(30);

    const validSkillIds = new Set(COMPETITION_SKILLS.map((s) => s.skillId));

    for (const q of COMPETITION_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.prompt.trim().length).toBeGreaterThan(0);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
      expect(q.estimatedSeconds).toBeGreaterThan(0);
      expect(q.subject).toMatch(/^(tieng-viet|toan|english)$/);

      // Verify skill exists in taxonomy
      expect(validSkillIds.has(q.skillId)).toBe(true);

      // Verify options and unambiguous answer
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options).toContain(q.correctAnswer);

      // Zero duplicate options
      const uniqueOpts = new Set(q.options);
      expect(uniqueOpts.size).toBe(q.options.length);
    }
  });

  it('validates mathematical correctness of all math competition questions', () => {
    const mathQuestions = COMPETITION_QUESTIONS.filter((q) => q.subject === 'toan');
    for (const q of mathQuestions) {
      // 12 + 3 + 2 = ?
      const add3Match = q.prompt.match(/(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+)\s*=\s*\?/);
      if (add3Match) {
        const a = parseInt(add3Match[1], 10);
        const b = parseInt(add3Match[2], 10);
        const c = parseInt(add3Match[3], 10);
        expect(q.correctAnswer).toBe((a + b + c).toString());
      } else {
        // 6 + 4 = ?
        const addMatch = q.prompt.match(/(?:^|[^\d+])(\d+)\s*\+\s*(\d+)\s*=\s*\?/);
        if (addMatch) {
          const a = parseInt(addMatch[1], 10);
          const b = parseInt(addMatch[2], 10);
          expect(q.correctAnswer).toBe((a + b).toString());
        }
      }

      // 10 - 7 = ?
      const subMatch = q.prompt.match(/(\d+)\s*-\s*(\d+)\s*=\s*\?/);
      if (subMatch) {
        const a = parseInt(subMatch[1], 10);
        const b = parseInt(subMatch[2], 10);
        expect(q.correctAnswer).toBe((a - b).toString());
      }

      // 5 + ... = 10
      const fillAdd = q.prompt.match(/(\d+)\s*\+\s*\.\.\.\s*=\s*(\d+)/);
      if (fillAdd) {
        const a = parseInt(fillAdd[1], 10);
        const total = parseInt(fillAdd[2], 10);
        expect(q.correctAnswer).toBe((total - a).toString());
      }
    }
  });

  it('verifies that all blueprints define realistic durations, question counts and valid subjects', () => {
    expect(EXAM_BLUEPRINTS.length).toBeGreaterThanOrEqual(6);

    for (const bp of EXAM_BLUEPRINTS) {
      expect(bp.id).toBeDefined();
      expect(bp.title).toBeTruthy();
      expect(bp.durationSeconds).toBeGreaterThanOrEqual(120);
      expect(bp.questionCount).toBeGreaterThanOrEqual(4);
      expect(bp.rewardStars).toBeGreaterThan(0);
      expect(bp.rewardXp).toBeGreaterThan(0);
      expect(bp.subject).toMatch(/^(tieng-viet|toan|english)$/);
    }
  });
});
