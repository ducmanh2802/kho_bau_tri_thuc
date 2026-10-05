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
    const overallAccuracy = totalAnswered > 0 ? Math.round((analytics.totalCorrect / totalAnswered) * 100) : 0;

    // Calculate percentage per subject based on REAL evidence
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

    const getSubjectStatus = (sub: SubjectType): { percent: number; label: string } => {
      const st = subjectStats[sub];
      if (st.total === 0) {
        return { percent: 0, label: 'Chưa làm bài' };
      }
      const pct = Math.round((st.correct / st.total) * 100);
      let label = 'Cần luyện thêm';
      if (pct >= 85) label = 'Rất vững vàng';
      else if (pct >= 70) label = 'Đạt yêu cầu';
      return { percent: pct, label };
    };

    const subjectMastery: Record<SubjectType, { percent: number; label: string }> = {
      'tieng-viet': getSubjectStatus('tieng-viet'),
      'toan': getSubjectStatus('toan'),
      'english': getSubjectStatus('english'),
    };

    // Filter weak skills
    const weakSkills = skills.filter((s) => s.status === 'NEEDS_REVIEW' || (s.attempts >= 2 && s.wrongCount > s.correctCount));
    const strongSkills = skills.filter((s) => s.status === 'MASTERED' || (s.attempts >= 3 && s.correctCount / s.attempts >= 0.8));

    // Generate actionable pedagogical advice with zero fake claims
    const adviceList: string[] = [];

    if (totalAnswered === 0) {
      adviceList.push(
        'Bé mới bắt đầu hành trình học tập! Ba mẹ hãy đồng hành cùng bé hoàn thành bài học Tiếng Việt hoặc Toán đầu tiên hôm nay.'
      );
      adviceList.push(
        'Thời gian học lý tưởng: 15–20 phút mỗi ngày. Hãy dành cho bé những lời khen ấm áp để xây dựng niềm yêu thích học tập!'
      );
    } else {
      if (weakSkills.length > 0) {
        adviceList.push(
          `Bé đang gặp một chút thử thách ở ${weakSkills.length} kỹ năng (${weakSkills.map((w) => w.skillName).slice(0, 2).join(', ')}). Ba mẹ nên cho bé luyện tập thêm 5 phút mỗi ngày với mục "Ôn Tập Hôm Nay".`
        );
      } else {
        adviceList.push(
          'Bé tiếp thu kiến thức rất tốt! Các câu hỏi đã học đều được giải quyết tự tin và chuẩn xác.'
        );
      }

      if (subjectStats['toan'].total > 0 && subjectMastery['toan'].percent < 75) {
        adviceList.push(
          'Ở môn Toán: Khi làm bài toán bớt đi (phép trừ) hoặc toán có lời văn, ba mẹ có thể dùng que tính hoặc kẹo thật để minh họa trực quan.'
        );
      }

      if (subjectStats['tieng-viet'].total > 0 && subjectMastery['tieng-viet'].percent < 75) {
        adviceList.push(
          'Ở môn Tiếng Việt: Bé nên đọc to thành tiếng từng âm vần để tai và miệng cùng ghi nhớ nhịp điệu phát âm.'
        );
      }

      adviceList.push(
        'Thời gian học khuyến nghị: 15–20 phút/ngày để giữ cho mắt sáng và tinh thần sảng khoái.'
      );
    }

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
