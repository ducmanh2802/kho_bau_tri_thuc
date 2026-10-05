import { Question, SkillMastery, SubjectType } from '../types';
import { getAllQuestions, getAllSkills } from '../data/curriculum';
import { StorageService } from './storage';

export interface SmartReviewSet {
  questions: Question[];
  focusSkills: string[];
  weakCount: number;
  practicingCount: number;
  masteredCount: number;
}

export interface ParentDiagnosticReport {
  overallAccuracy: number;
  totalAnswered: number;
  subjectMastery: Record<SubjectType, { percent: number; label: string }>;
  weakSkills: SkillMastery[];
  strongSkills: SkillMastery[];
  adviceList: string[];
}

export class AdaptiveService {
  /**
   * Generates a personalized daily review set of 5-10 questions.
   * Priority:
   * 1. Skills with status 'NEEDS_REVIEW' or recent errors
   * 2. Skills with status 'PRACTICING'
   * 3. Skills with status 'LEARNING'
   * 4. Random review from 'MASTERED' to combat forgetting curve
   */
  public static generateDailyReview(): SmartReviewSet {
    const analytics = StorageService.getAnalytics();
    const allQuestions = getAllQuestions();
    const masteryMap = analytics.skillMastery;

    const weakSkillIds = Object.values(masteryMap)
      .filter((s) => s.status === 'NEEDS_REVIEW')
      .map((s) => s.skillId);

    const practicingSkillIds = Object.values(masteryMap)
      .filter((s) => s.status === 'PRACTICING')
      .map((s) => s.skillId);

    const masteredSkillIds = Object.values(masteryMap)
      .filter((s) => s.status === 'MASTERED')
      .map((s) => s.skillId);

    const selectedQuestions: Question[] = [];
    const usedIds = new Set<string>();

    // 1. Pick 3 questions from weak skills (or recent errors)
    if (weakSkillIds.length > 0) {
      const candidates = allQuestions.filter((q) => weakSkillIds.includes(q.skillId));
      this.shuffle(candidates).slice(0, 3).forEach((q) => {
        if (!usedIds.has(q.id)) {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        }
      });
    }

    // 2. Pick 3 questions from practicing skills
    if (practicingSkillIds.length > 0) {
      const candidates = allQuestions.filter((q) => practicingSkillIds.includes(q.skillId));
      this.shuffle(candidates).slice(0, 3).forEach((q) => {
        if (!usedIds.has(q.id)) {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        }
      });
    }

    // 3. Pick 1 question from mastered skills to maintain memory retention
    if (masteredSkillIds.length > 0) {
      const candidates = allQuestions.filter((q) => masteredSkillIds.includes(q.skillId));
      this.shuffle(candidates).slice(0, 1).forEach((q) => {
        if (!usedIds.has(q.id)) {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        }
      });
    }

    // 4. If fewer than 6 questions, fill with balanced cross-subject questions
    if (selectedQuestions.length < 6) {
      const remaining = allQuestions.filter((q) => !usedIds.has(q.id));
      this.shuffle(remaining)
        .slice(0, 6 - selectedQuestions.length)
        .forEach((q) => {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        });
    }

    const focusSkills = Array.from(new Set(selectedQuestions.map((q) => q.skillId)));

    return {
      questions: selectedQuestions,
      focusSkills,
      weakCount: weakSkillIds.length,
      practicingCount: practicingSkillIds.length,
      masteredCount: masteredSkillIds.length,
    };
  }

  /**
   * Diagnostic assessment report for parents.
   */
  public static generateParentReport(): ParentDiagnosticReport {
    const analytics = StorageService.getAnalytics();
    const skills = Object.values(analytics.skillMastery);

    const totalAnswered = analytics.totalQuestionsAnswered;
    const overallAccuracy = totalAnswered > 0 ? Math.round((analytics.totalCorrect / totalAnswered) * 100) : 90;

    // Calculate percentage per subject
    const subjectStats: Record<SubjectType, { total: number; correct: number }> = {
      'tieng-viet': { total: 0, correct: 0 },
      'toan': { total: 0, correct: 0 },
      'english': { total: 0, correct: 0 },
    };

    skills.forEach((s) => {
      if (subjectStats[s.subject]) {
        subjectStats[s.subject].total += s.attempts;
        subjectStats[s.subject].correct += s.correctCount;
      }
    });

    const getSubjectPercent = (sub: SubjectType) => {
      const st = subjectStats[sub];
      if (st.total === 0) return 75; // Baseline starting estimation
      return Math.round((st.correct / st.total) * 100);
    };

    const subjectMastery: Record<SubjectType, { percent: number; label: string }> = {
      'tieng-viet': {
        percent: getSubjectPercent('tieng-viet'),
        label: getSubjectPercent('tieng-viet') >= 80 ? 'Rất Tốt' : 'Cần Rèn Thêm Vần',
      },
      'toan': {
        percent: getSubjectPercent('toan'),
        label: getSubjectPercent('toan') >= 80 ? 'Vững Vàng' : 'Cần Rèn Phép Trừ & Lời Văn',
      },
      'english': {
        percent: getSubjectPercent('english'),
        label: getSubjectPercent('english') >= 80 ? 'Phát Âm Tự Nhiên' : 'Tập Thêm Từ Vựng',
      },
    };

    // Filter weak skills
    const weakSkills = skills.filter((s) => s.status === 'NEEDS_REVIEW' || (s.attempts >= 2 && s.wrongCount > s.correctCount));
    const strongSkills = skills.filter((s) => s.status === 'MASTERED' || (s.attempts >= 3 && s.correctCount / s.attempts >= 0.8));

    // Generate actionable pedagogical advice
    const adviceList: string[] = [];

    if (weakSkills.length > 0) {
      adviceList.push(
        `Bé đang gặp một chút thử thách ở ${weakSkills.length} kỹ năng (đặc biệt là phân biệt chính tả hoặc bài toán có lời văn). Ba mẹ nên cho bé luyện tập thêm 5 phút mỗi ngày với mục "Ôn Tập Hôm Nay".`
      );
    } else {
      adviceList.push(
        'Bé có nền tảng tiếp thu rất tốt! Các kỹ năng chữ cái và tính toán cơ bản đều vững vàng.'
      );
    }

    if (subjectMastery['toan'].percent < 75) {
      adviceList.push(
        'Ở môn Toán: Bé cần được minh họa bằng đồ vật thật (ngón tay, que tính, kẹo) khi làm bài toán bớt đi (phép trừ) để trực quan hơn.'
      );
    }

    if (subjectMastery['tieng-viet'].percent < 75) {
      adviceList.push(
        'Ở môn Tiếng Việt: Bé nên luyện đọc to thành tiếng từng âm vần để tai nghe và miệng cùng ghi nhớ nhịp điệu.'
      );
    }

    adviceList.push(
      'Thời gian học lý tưởng: 15 - 20 phút mỗi ngày. Hãy khen ngợi sự kiên trì của bé bằng những lời động viên ấm áp thay vì chỉ chú trọng điểm số!'
    );

    return {
      overallAccuracy,
      totalAnswered,
      subjectMastery,
      weakSkills,
      strongSkills,
      adviceList,
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
