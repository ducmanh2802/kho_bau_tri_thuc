import {
  CompetitionDifficulty,
  CompetitionExamResult,
  CompetitionQuestion,
  CompetitionSubject,
  ErrorAnalysisItem,
  ErrorCategory,
  ExamBlueprint,
  QuestionResponse,
  ReadinessAssessment,
  ReadinessLevel,
  SpeedRating,
} from '../types/competition';
import { COMPETITION_QUESTIONS, getQuestionsBySkill, getQuestionsBySubject } from '../data/competitionQuestions';
import { COMPETITION_SKILLS, getSkillById } from '../data/competitionTaxonomy';

export class CompetitionEngine {
  /**
   * Deterministically assemble questions for an exam blueprint.
   * Guarantees:
   * - Correct subject match
   * - No duplicate questions
   * - Exactly blueprint.questionCount questions
   */
  public static assembleExamQuestions(
    blueprint: ExamBlueprint,
    seed: number = 42
  ): CompetitionQuestion[] {
    const candidates = getQuestionsBySubject(blueprint.subject);
    if (candidates.length === 0) {
      throw new Error(`No competition questions found for subject: ${blueprint.subject}`);
    }

    // Pseudo-random deterministic shuffle based on seed
    const shuffled = this.deterministicShuffle(candidates, seed);

    // Pick unique questions
    const selected: CompetitionQuestion[] = [];
    const usedIds = new Set<string>();

    for (const q of shuffled) {
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
        if (selected.length === blueprint.questionCount) break;
      }
    }

    // If candidate pool has fewer than requested, recycle without throwing
    if (selected.length < blueprint.questionCount) {
      for (const q of candidates) {
        selected.push({
          ...q,
          id: `${q.id}_copy_${selected.length}`,
        });
        if (selected.length === blueprint.questionCount) break;
      }
    }

    return selected;
  }

  /**
   * Assemble questions for targeted practice on a single skill.
   */
  public static assembleSkillPractice(
    skillId: string,
    count: number = 5
  ): CompetitionQuestion[] {
    const pool = getQuestionsBySkill(skillId);
    if (pool.length === 0) {
      const skill = getSkillById(skillId);
      const subjectPool = skill ? getQuestionsBySubject(skill.subject) : COMPETITION_QUESTIONS;
      return subjectPool.slice(0, count);
    }

    return pool.slice(0, count);
  }

  /**
   * Assemble remediation practice questions for weak skills.
   */
  public static assembleAdaptiveRemediation(
    targetSkills: string[],
    count: number = 6
  ): CompetitionQuestion[] {
    const selected: CompetitionQuestion[] = [];
    const usedIds = new Set<string>();

    for (const skillId of targetSkills) {
      const skillQuestions = getQuestionsBySkill(skillId);
      for (const q of skillQuestions) {
        if (!usedIds.has(q.id)) {
          selected.push(q);
          usedIds.add(q.id);
          if (selected.length >= count) break;
        }
      }
      if (selected.length >= count) break;
    }

    if (selected.length < count) {
      for (const q of COMPETITION_QUESTIONS) {
        if (!usedIds.has(q.id)) {
          selected.push(q);
          usedIds.add(q.id);
          if (selected.length >= count) break;
        }
      }
    }

    return selected;
  }

  /**
   * Calculate accuracy-adjusted speed rating.
   */
  public static evaluateSpeed(
    accuracy: number,
    averageSeconds: number
  ): { rating: SpeedRating; label: string } {
    if (accuracy >= 80 && averageSeconds <= 18) {
      return { rating: 'EXCELLENT', label: 'Tốc độ xuất sắc & Chuẩn xác ⭐' };
    }
    if (accuracy >= 80 && averageSeconds > 18) {
      return { rating: 'STEADY', label: 'Vững vàng & Rất cẩn thận 🎯' };
    }
    if (accuracy < 60 && averageSeconds <= 10) {
      return { rating: 'RUSHING', label: 'Bé hơi vội vã, cần đọc kỹ đề bài 🐇' };
    }
    if (accuracy < 60 && averageSeconds > 10) {
      return { rating: 'NEEDS_TIME', label: 'Cần thêm thời gian luyện phản xạ 🐢' };
    }
    return { rating: 'SWIFT', label: 'Tiến độ đều đặn & Tự tin 🚀' };
  }

  /**
   * Perform comprehensive error analysis on missed questions.
   */
  public static analyzeErrors(
    responses: QuestionResponse[],
    questions: CompetitionQuestion[]
  ): ErrorAnalysisItem[] {
    const errorItems: ErrorAnalysisItem[] = [];

    responses.forEach((resp) => {
      if (!resp.isCorrect) {
        const question = questions.find((q) => q.id === resp.questionId);
        if (!question) return;

        const skill = getSkillById(question.skillId);
        const skillName = skill ? skill.skillName : question.skillId;

        let category: ErrorCategory = 'UNCLASSIFIED';
        let advice = 'Ba mẹ hãy cùng bé đọc lại câu hỏi và làm thêm ví dụ tương tự.';

        if (resp.timeSpentSeconds <= 6) {
          category = 'CARELESS_ERROR';
          advice = 'Bé thao tác hơi nhanh (dưới 6 giây). Nhắc bé đọc hết 4 phương án trước khi chọn nhé.';
        } else if (question.difficulty === 'HARD' || question.difficulty === 'CHALLENGE') {
          category = 'REASONING_ERROR';
          advice = 'Đây là câu hỏi tư duy nhiều bước. Bé có thể dùng que tính hoặc giấy nháp để thử từng bước.';
        } else if (question.skillId === 'TV-SPELLING') {
          category = 'KNOWLEDGE_GAP';
          advice = 'Quy tắc chính tả: k, gh, ngh luôn đi cùng các nguyên âm e, ê, i.';
        } else if (question.skillId === 'MATH-WORD-PROBLEM') {
          category = 'MISREAD';
          advice = 'Bài toán có lời văn: Chú ý từ khóa "thêm vào" (làm phép cộng) hay "bớt đi" (làm phép trừ).';
        } else {
          category = 'KNOWLEDGE_GAP';
          advice = `Kỹ năng "${skillName}" cần được ôn luyện lại trong mục Luyện Dạng Bài.`;
        }

        errorItems.push({
          questionId: question.id,
          prompt: question.prompt,
          skillId: question.skillId,
          skillName,
          userAnswer: resp.userAnswer || 'Chưa trả lời',
          correctAnswer: Array.isArray(question.correctAnswer)
            ? question.correctAnswer.join(', ')
            : question.correctAnswer,
          explanation: question.explanation,
          category,
          advice,
        });
      }
    });

    return errorItems;
  }

  /**
   * Score an exam session and construct full result document.
   */
  public static scoreSession(
    blueprint: ExamBlueprint,
    questions: CompetitionQuestion[],
    responses: QuestionResponse[],
    timeUsedSeconds: number,
    history: CompetitionExamResult[]
  ): CompetitionExamResult {
    let correctCount = 0;
    const skillStats: Record<string, { total: number; correct: number; skillName: string }> = {};

    questions.forEach((q) => {
      const resp = responses.find((r) => r.questionId === q.id);
      const isCorrect = resp ? resp.isCorrect : false;
      if (isCorrect) correctCount += 1;

      const skill = getSkillById(q.skillId);
      const skillName = skill ? skill.skillName : q.skillId;

      if (!skillStats[q.skillId]) {
        skillStats[q.skillId] = { total: 0, correct: 0, skillName };
      }
      skillStats[q.skillId].total += 1;
      if (isCorrect) skillStats[q.skillId].correct += 1;
    });

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 10) : 0;

    const averageSeconds = totalQuestions > 0 ? Math.round(timeUsedSeconds / totalQuestions) : 0;
    const speed = this.evaluateSpeed(accuracy, averageSeconds);

    const strongSkills: string[] = [];
    const weakSkills: string[] = [];

    Object.entries(skillStats).forEach(([sId, stat]) => {
      if (stat.total >= 1 && stat.correct === stat.total) {
        strongSkills.push(stat.skillName);
      } else if (stat.correct / stat.total < 0.6) {
        weakSkills.push(stat.skillName);
      }
    });

    const errorAnalysis = this.analyzeErrors(responses, questions);

    // Compute mock readiness snapshot
    const readinessSnapshot = this.assessReadiness([
      ...history,
      {
        id: `temp_${Date.now()}`,
        blueprintId: blueprint.id,
        examTitle: blueprint.title,
        subject: blueprint.subject,
        timestamp: new Date().toISOString(),
        durationSeconds: blueprint.durationSeconds,
        timeUsedSeconds,
        totalQuestions,
        correctCount,
        accuracy,
        score,
        speedRating: speed.rating,
        speedLabel: speed.label,
        averageSecondsPerQuestion: averageSeconds,
        responses,
        skillBreakdown: skillStats,
        strongSkills,
        weakSkills,
        errorAnalysis,
        readinessSnapshot: {} as ReadinessAssessment,
      },
    ]);

    return {
      id: `exam_res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      blueprintId: blueprint.id,
      examTitle: blueprint.title,
      subject: blueprint.subject,
      timestamp: new Date().toISOString(),
      durationSeconds: blueprint.durationSeconds,
      timeUsedSeconds,
      totalQuestions,
      correctCount,
      accuracy,
      score,
      speedRating: speed.rating,
      speedLabel: speed.label,
      averageSecondsPerQuestion: averageSeconds,
      responses,
      skillBreakdown: skillStats,
      strongSkills,
      weakSkills,
      errorAnalysis,
      readinessSnapshot,
    };
  }

  /**
   * Explainable multi-factor Readiness Assessment.
   */
  public static assessReadiness(history: CompetitionExamResult[]): ReadinessAssessment {
    if (!history || history.length === 0) {
      return {
        overallLevel: 'FOUNDATION',
        overallLabel: 'Bắt đầu hành trình thử sức 🌱',
        knowledgeScore: 0,
        accuracyScore: 0,
        speedScore: 0,
        consistencyScore: 0,
        skillCoverageScore: 0,
        evidence: {
          totalExamsTaken: 0,
          recentAccuracyAverage: 0,
          medianSecondsPerQuestion: 0,
          strongSkillsCount: 0,
          weakSkillsCount: 0,
          totalSkillsCovered: 0,
        },
        recommendations: [
          'Bé hãy thử sức với một bài Mini Test 5 phút môn Tiếng Việt hoặc Toán học đầu tiên nhé!',
          'Hãy làm quen với dạng bài có đồng hồ đếm ngược với tâm lý vui vẻ, thoải mái.',
        ],
        isSufficientData: false,
      };
    }

    const recent = history.slice(-5);
    const avgAccuracy = Math.round(
      recent.reduce((sum, h) => sum + h.accuracy, 0) / recent.length
    );

    const medianTime = Math.round(
      recent.reduce((sum, h) => sum + h.averageSecondsPerQuestion, 0) / recent.length
    );

    // Calculate score consistency: variance of accuracy
    const variance =
      recent.reduce((sum, h) => sum + Math.pow(h.accuracy - avgAccuracy, 2), 0) /
      recent.length;
    const consistencyScore = Math.max(20, Math.min(100, Math.round(100 - Math.sqrt(variance))));

    // Knowledge score based on accuracy
    const knowledgeScore = avgAccuracy;
    const accuracyScore = avgAccuracy;

    // Speed score: 12-20s per question is optimal for Grade 1
    let speedScore = 75;
    if (medianTime <= 18 && avgAccuracy >= 75) speedScore = 95;
    else if (medianTime <= 25 && avgAccuracy >= 65) speedScore = 80;
    else if (medianTime > 30) speedScore = 60;

    // Skill coverage: unique skills tested
    const testedSkills = new Set<string>();
    const strongSkillsSet = new Set<string>();
    const weakSkillsSet = new Set<string>();

    history.forEach((h) => {
      Object.keys(h.skillBreakdown || {}).forEach((s) => testedSkills.add(s));
      h.strongSkills.forEach((s) => strongSkillsSet.add(s));
      h.weakSkills.forEach((s) => weakSkillsSet.add(s));
    });

    const totalTaxonomySkills = COMPETITION_SKILLS.length;
    const skillCoverageScore = Math.min(
      100,
      Math.round((testedSkills.size / totalTaxonomySkills) * 100)
    );

    // Determine overall level
    let overallLevel: ReadinessLevel = 'DEVELOPING';
    let overallLabel = 'Đang phát triển kỹ năng 🌿';

    const overallComposite =
      knowledgeScore * 0.4 +
      speedScore * 0.2 +
      consistencyScore * 0.2 +
      skillCoverageScore * 0.2;

    if (history.length >= 3 && overallComposite >= 85 && avgAccuracy >= 85) {
      overallLevel = 'READY_FOR_MOCK';
      overallLabel = 'Sẵn sàng chinh phục Đấu Trường 🏆';
    } else if (overallComposite >= 75 && avgAccuracy >= 75) {
      overallLevel = 'STRONG';
      overallLabel = 'Vững vàng kiến thức ⭐';
    } else if (overallComposite >= 60) {
      overallLevel = 'PRACTICING';
      overallLabel = 'Tiến bộ rõ rệt qua từng bài 🚀';
    } else {
      overallLevel = 'DEVELOPING';
      overallLabel = 'Đang rèn luyện & khám phá 🌱';
    }

    const recommendations: string[] = [];

    if (weakSkillsSet.size > 0) {
      const topWeak = Array.from(weakSkillsSet).slice(0, 2).join(', ');
      recommendations.push(
        `Bé nên luyện thêm dạng bài: ${topWeak} trong mục Luyện Kỹ Năng để củng cố phản xạ.`
      );
    } else {
      recommendations.push('Bé nắm kiến thức rất chắc chắn ở các dạng bài đã thi!');
    }

    if (speedScore < 70) {
      recommendations.push(
        'Bé nên thử chế độ "Luyện Tốc Độ" (3 phút) để rèn sự nhanh nhạy khi làm bài trắc nghiệm.'
      );
    } else {
      recommendations.push('Tốc độ làm bài của bé rất nhịp nhàng và chuẩn xác.');
    }

    recommendations.push(
      `Bé đã thử sức ${history.length} bài thi. Ba mẹ hãy tiếp tục động viên bé rèn luyện đều đặn mỗi tuần!`
    );

    return {
      overallLevel,
      overallLabel,
      knowledgeScore,
      accuracyScore,
      speedScore,
      consistencyScore,
      skillCoverageScore,
      evidence: {
        totalExamsTaken: history.length,
        recentAccuracyAverage: avgAccuracy,
        medianSecondsPerQuestion: medianTime,
        strongSkillsCount: strongSkillsSet.size,
        weakSkillsCount: weakSkillsSet.size,
        totalSkillsCovered: testedSkills.size,
      },
      recommendations,
      isSufficientData: history.length >= 1,
    };
  }

  private static deterministicShuffle<T>(array: T[], seed: number): T[] {
    const arr = [...array];
    let s = seed;
    for (let i = arr.length - 1; i > 0; i--) {
      // Mulberry32-inspired PRNG
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      const rnd = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      const j = Math.floor(rnd * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
