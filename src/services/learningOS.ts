import {
  ActionType,
  DailyPlan,
  DailyPlanItem,
  EvidenceDifficulty,
  KnowledgeState,
  KnowledgeStatus,
  LearningAction,
  LearningEvidence,
  RecommendationExplanation,
  SessionFatigueState,
} from '../types/learningOS';
import { SubjectType } from '../types';
import { getAllSkills } from '../data/curriculum';
import { COMPETITION_SKILLS } from '../data/competitionTaxonomy';
import { SPEED_POLICY } from '../config/policy';

export const LEARNING_OS_POLICY = {
  POLICY_VERSION: 'P28-v1',
  MIN_DAILY_MINUTES: 10,
  MAX_DAILY_MINUTES: 20,
  DEFAULT_DAILY_ITEMS: 3,
  MAX_DAILY_ITEMS: 4,
  RECENCY_WINDOW: 5,
  FATIGUE_MAX_QUESTIONS: 25,
  FATIGUE_MAX_CONSECUTIVE_ERRORS: 4,
  OVERPRACTICE_THRESHOLD: 15,
  MASTERY_HIGH_THRESHOLD: 85,
  MASTERY_LOW_THRESHOLD: 60,
  SPACED_INTERVAL_DAYS: 3,
};

export class LearningOS {
  /**
   * Initializes a pristine default knowledge state for a skill.
   */
  public static createInitialKnowledgeState(
    skillId: string,
    skillName: string,
    subject: SubjectType
  ): KnowledgeState {
    return {
      skillId,
      skillName,
      subject,
      status: 'NOT_STARTED',
      mastery: 0,
      confidence: 0,
      accuracy: 0,
      recentAccuracy: 0,
      attemptCount: 0,
      correctCount: 0,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      difficultyPerformance: {
        easy: { attempts: 0, correct: 0 },
        medium: { attempts: 0, correct: 0 },
        hard: { attempts: 0, correct: 0 },
        challenge: { attempts: 0, correct: 0 },
      },
      errorProfile: {
        knowledgeGap: 0,
        careless: 0,
        speed: 0,
        misread: 0,
        reasoning: 0,
        unclassified: 0,
      },
      evidenceVersion: 1,
    };
  }

  /**
   * Pure deterministic reducer: consumes an existing KnowledgeState and a new LearningEvidence
   * and computes the updated KnowledgeState.
   */
  public static reduceEvidence(
    prev: KnowledgeState,
    evidence: LearningEvidence
  ): KnowledgeState {
    const isCorrect = evidence.correct;
    const attemptCount = prev.attemptCount + 1;
    const correctCount = isCorrect ? prev.correctCount + 1 : prev.correctCount;
    const consecutiveCorrect = isCorrect ? prev.consecutiveCorrect + 1 : 0;
    const consecutiveIncorrect = isCorrect ? 0 : prev.consecutiveIncorrect + 1;

    // Difficulty breakdown update
    const diffKey = (evidence.difficulty?.toLowerCase() || 'medium') as keyof typeof prev.difficultyPerformance;
    const currentDiff = prev.difficultyPerformance[diffKey] || { attempts: 0, correct: 0 };
    const difficultyPerformance = {
      ...prev.difficultyPerformance,
      [diffKey]: {
        attempts: currentDiff.attempts + 1,
        correct: isCorrect ? currentDiff.correct + 1 : currentDiff.correct,
      },
    };

    // Error profile update
    const errorProfile = { ...prev.errorProfile };
    if (!isCorrect && evidence.errorType) {
      if (evidence.errorType === 'CARELESS_ERROR') errorProfile.careless += 1;
      else if (evidence.errorType === 'REASONING_ERROR') errorProfile.reasoning += 1;
      else if (evidence.errorType === 'SPEED_ERROR') errorProfile.speed += 1;
      else if (evidence.errorType === 'MISREAD') errorProfile.misread += 1;
      else if (evidence.errorType === 'KNOWLEDGE_GAP') errorProfile.knowledgeGap += 1;
      else errorProfile.unclassified += 1;
    }

    // Response time rolling average
    let averageResponseTimeMs = prev.averageResponseTimeMs;
    if (evidence.responseTimeMs && evidence.responseTimeMs > 0) {
      if (!averageResponseTimeMs) {
        averageResponseTimeMs = evidence.responseTimeMs;
      } else {
        averageResponseTimeMs = Math.round(
          (averageResponseTimeMs * (attemptCount - 1) + evidence.responseTimeMs) / attemptCount
        );
      }
    }

    // Lifetime accuracy (0 - 100)
    const accuracy = Math.round((correctCount / attemptCount) * 100);

    // Recent accuracy with higher weight on recent events
    let recentAccuracy: number;
    if (attemptCount <= 3) {
      recentAccuracy = accuracy;
    } else {
      // Exponential moving average (alpha = 0.4)
      const prevRecent = prev.recentAccuracy || accuracy;
      recentAccuracy = Math.round(prevRecent * 0.6 + (isCorrect ? 100 : 0) * 0.4);
    }

    // Confidence metric (0 - 100): based on evidence sample size & consistency
    const sampleFactor = Math.min(1, attemptCount / 6); // 6 attempts reach full confidence
    const consistencyPenalty = consecutiveIncorrect >= 2 ? 0.8 : 1.0;
    const confidence = Math.round(sampleFactor * 100 * consistencyPenalty);

    // Blended mastery (0 - 100)
    // 40% lifetime accuracy, 40% recent accuracy, 20% consistency/confidence
    let mastery = Math.round(accuracy * 0.4 + recentAccuracy * 0.4 + confidence * 0.2);

    // Difficulty bonus for hard/challenge successes
    if (difficultyPerformance.hard.correct > 0 || difficultyPerformance.challenge.correct > 0) {
      mastery = Math.min(100, mastery + 5);
    }

    // Determine status deterministically
    let status: KnowledgeStatus = 'LEARNING';
    if (attemptCount === 0) {
      status = 'NOT_STARTED';
    } else if (consecutiveIncorrect >= 2 || (attemptCount >= 3 && recentAccuracy < LEARNING_OS_POLICY.MASTERY_LOW_THRESHOLD)) {
      status = 'NEEDS_REVIEW';
    } else if (attemptCount >= 4 && recentAccuracy >= LEARNING_OS_POLICY.MASTERY_HIGH_THRESHOLD && mastery >= 80) {
      status = 'MASTERED';
    } else if (attemptCount >= 2) {
      status = 'PRACTICING';
    } else {
      status = 'LEARNING';
    }

    // Schedule spaced review if mastered
    let nextReviewAt = prev.nextReviewAt;
    if (status === 'MASTERED') {
      nextReviewAt = evidence.timestamp + LEARNING_OS_POLICY.SPACED_INTERVAL_DAYS * 24 * 3600 * 1000;
    }

    return {
      skillId: prev.skillId,
      skillName: prev.skillName,
      subject: prev.subject,
      status,
      mastery,
      confidence,
      accuracy,
      recentAccuracy,
      attemptCount,
      correctCount,
      consecutiveCorrect,
      consecutiveIncorrect,
      lastPracticedAt: evidence.timestamp,
      lastCorrectAt: isCorrect ? evidence.timestamp : prev.lastCorrectAt,
      lastIncorrectAt: !isCorrect ? evidence.timestamp : prev.lastIncorrectAt,
      averageResponseTimeMs,
      difficultyPerformance,
      errorProfile,
      nextReviewAt,
      evidenceVersion: prev.evidenceVersion + 1,
    };
  }

  /**
   * Generates prioritized list of Next Best Actions based on knowledge states, fatigue, and policy.
   *
   * `trackActions` lets a learning track (e.g. the Kid's Box Companion) inject
   * its own evidence-driven recommendations into the same ranked list, instead
   * of running a second, parallel recommendation engine (§1, §26). A track
   * still cannot invent mastery: it only proposes actions from its own evidence.
   */
  public static getNextBestActions(
    knowledgeMap: Record<string, KnowledgeState>,
    fatigue?: SessionFatigueState,
    currentTime: number = Date.now(),
    trackActions: LearningAction[] = []
  ): LearningAction[] {
    const states = Object.values(knowledgeMap);
    const totalEvidenceCount = states.reduce((sum, s) => sum + s.attemptCount, 0);

    // Track actions lead the list while a track still has work to propose, so
    // the child sees the track's own next best step first (§19, §22).
    if (trackActions.length > 0) {
      return [...trackActions].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    }

    // ==========================================
    // 1. COLD START HANDLER (New child with 0 or < 3 total attempts)
    // ==========================================
    if (totalEvidenceCount < 3) {
      return [
        {
          id: 'action_cold_viet',
          type: 'LEARN',
          subject: 'tieng-viet',
          skillId: 'vn_alphabet',
          skillName: 'Bảng Chữ Cái Tiếng Việt',
          lessonId: 'vn-les-1',
          title: 'Khám Phá Chữ Cái A, B, C',
          description: 'Làm quen bảng chữ cái tiếng Việt cùng Gấu Bút Chì',
          reason: 'Bắt đầu hành trình lớp 1 với kiến thức chữ cái nền tảng vững chắc.',
          childExplanation: 'Cùng bạn Gấu Bút Chì học những chữ cái xinh xắn đầu tiên nhé!',
          estimatedMinutes: 5,
          priority: 95,
          badgeEmoji: '🔤',
        },
        {
          id: 'action_cold_math',
          type: 'LEARN',
          subject: 'toan',
          skillId: 'math_counting_10',
          skillName: 'Đếm Số Trong Phạm Vi 10',
          lessonId: 'math-les-1',
          title: 'Đếm Số 0 Đến 5 Kỳ Thú',
          description: 'Tập đếm đồ vật thân quen cùng Cáo Toán Học',
          reason: 'Làm quen số đếm cơ bản qua hình ảnh đồ vật trực quan sinh động.',
          childExplanation: 'Đếm xem có bao nhiêu bạn táo và ngôi sao đang chờ bé kìa!',
          estimatedMinutes: 5,
          priority: 90,
          badgeEmoji: '🔢',
        },
        {
          id: 'action_cold_game',
          type: 'GAME',
          subject: 'tieng-viet',
          gameId: 'catch_letters',
          gameTitle: 'Bắt Chữ Cái Bay',
          title: 'Trò Chơi: Bắt Chữ Cái Bay',
          description: 'Hứng những chữ cái rơi để làm quen phản xạ',
          reason: 'Tạo cảm xúc vui vẻ, hào hứng và làm quen thao tác trong ứng dụng.',
          childExplanation: 'Chơi một trò chơi hứng chữ cực vui để nhận điểm thưởng nhé!',
          estimatedMinutes: 3,
          priority: 85,
          badgeEmoji: '🎮',
        },
      ];
    }

    // ==========================================
    // 2. SESSION FATIGUE OVERRIDE
    // ==========================================
    if (fatigue && fatigue.isFatigued) {
      return [
        {
          id: 'action_fatigue_rest',
          type: 'GAME',
          subject: 'toan',
          gameId: 'memory_cards',
          gameTitle: 'Lật Thẻ Trí Nhớ Vàng',
          title: 'Thư Giãn Cùng Lật Thẻ Trí Nhớ',
          description: 'Trò chơi nhẹ nhàng giúp mắt bé nghỉ ngơi và thư giãn tinh thần',
          reason: 'Bé đã học liên tục trong thời gian dài. Hệ thống chuyển sang hoạt động thư giãn nhẹ nhàng.',
          childExplanation: 'Hôm nay con đã rất chăm chỉ rồi! Chơi một trò chơi nhẹ nhàng rồi nghỉ ngơi nhé.',
          estimatedMinutes: 3,
          priority: 99,
          badgeEmoji: '🌈',
        },
      ];
    }

    const candidateActions: LearningAction[] = [];

    // ==========================================
    // 3. PRIORITY PIPELINE
    // ==========================================
    for (const k of states) {
      // P0: Critical Knowledge Gap (NEEDS_REVIEW with high errors)
      if (k.status === 'NEEDS_REVIEW') {
        candidateActions.push({
          id: `remediate_${k.skillId}`,
          type: 'PRACTICE',
          subject: k.subject,
          skillId: k.skillId,
          skillName: k.skillName,
          title: `Củng Cố: ${k.skillName}`,
          description: `Luyện tập 5 câu hỏi trọng tâm giúp con nắm vững ${k.skillName}`,
          reason: `Độ chính xác gần đây ${k.recentAccuracy}% (${k.consecutiveIncorrect} lần chưa đúng). Cần củng cố ngay.`,
          childExplanation: `Đừng lo nhé! Chúng mình cùng bạn Gấu ôn lại ${k.skillName} một chút là nhớ ngay!`,
          estimatedMinutes: 5,
          priority: 90 + Math.min(8, k.consecutiveIncorrect * 2),
          badgeEmoji: '🎯',
        });
      }

      // P1: Spaced Repetition / Forgetting Risk
      else if (k.status === 'MASTERED' && k.nextReviewAt && k.nextReviewAt <= currentTime) {
        candidateActions.push({
          id: `review_${k.skillId}`,
          type: 'REVIEW',
          subject: k.subject,
          skillId: k.skillId,
          skillName: k.skillName,
          title: `Ôn Tập Định Kỳ: ${k.skillName}`,
          description: `Ôn nhanh 3 câu hỏi để kích hoạt trí nhớ dài hạn`,
          reason: `Đã làm chủ kỹ năng nhưng đã qua thời gian giãn cách ôn tập. Tránh nguy cơ quên.`,
          childExplanation: `Ôn lại bài cũ một chút xíu để giữ vững phong độ siêu nhân nào!`,
          estimatedMinutes: 3,
          priority: 80,
          badgeEmoji: '💡',
        });
      }

      // P2: Practicing (Normal progression)
      else if (k.status === 'PRACTICING') {
        const isOverpracticed = k.attemptCount >= LEARNING_OS_POLICY.OVERPRACTICE_THRESHOLD && k.accuracy >= 90;
        if (!isOverpracticed) {
          candidateActions.push({
            id: `practice_${k.skillId}`,
            type: 'PRACTICE',
            subject: k.subject,
            skillId: k.skillId,
            skillName: k.skillName,
            title: `Luyện Tập Nâng Cao: ${k.skillName}`,
            description: `Tăng cường độ thuần thục với các dạng bài đa dạng`,
            reason: `Kỹ năng đang tiến bộ tốt (${k.accuracy}%). Luyện thêm để đạt mốc Mastered.`,
            childExplanation: `Bé đang làm rất cừ! Luyện thêm một chút nữa để trở thành Trạng Nguyên nhé!`,
            estimatedMinutes: 5,
            priority: 65 + Math.round(k.mastery / 10),
            badgeEmoji: '⭐',
          });
        }
      }

      // P3: High accuracy but slow pace -> SPEED_PRACTICE
      if (k.accuracy >= 85 &&
        k.averageResponseTimeMs &&
        k.averageResponseTimeMs > SPEED_POLICY.SPEED_PRACTICE_MIN_SECONDS * 1000) {
        candidateActions.push({
          id: `speed_${k.skillId}`,
          type: 'SPEED_PRACTICE',
          subject: k.subject,
          skillId: k.skillId,
          skillName: k.skillName,
          title: `Rèn Tốc Độ: ${k.skillName}`,
          description: `Tập phản xạ nhẩm nhanh và dứt khoát`,
          reason: `Kiến thức chắc chắn (${k.accuracy}%) nhưng thời gian làm bài trung bình ${Math.round(k.averageResponseTimeMs / 1000)}s/câu. Rèn thêm tốc độ.`,
          childExplanation: `Thử tài phản xạ thần tốc xem bé có vượt qua kỷ lục của chính mình không nào!`,
          estimatedMinutes: 3,
          priority: 72,
          badgeEmoji: '⚡',
        });
      }
    }

    // Add Competition / Mock Exam suggestion if learner has strong base
    const masteredCount = states.filter((s) => s.status === 'MASTERED').length;
    if (masteredCount >= 3) {
      candidateActions.push({
        id: 'action_competition_mock',
        type: 'COMPETITION',
        subject: 'toan',
        examBlueprintId: 'bp-math-mini-01',
        title: 'Thử Sức Đấu Trường Toán Học',
        description: 'Bài thi thử 5 phút kiểm tra toàn diện kỹ năng đã học',
        reason: `Bé đã làm chủ ${masteredCount} kỹ năng. Đây là thời điểm tuyệt vời để trải nghiệm Đấu Trường thử thách.`,
        childExplanation: 'Bé đã rất giỏi rồi! Vào Đấu Trường thi thử 5 phút để rinh Cúp Vàng nào!',
        estimatedMinutes: 5,
        priority: 70,
        badgeEmoji: '🏆',
      });
    }

    // Add Gamified practice
    candidateActions.push({
      id: 'action_game_reinforce',
      type: 'GAME',
      subject: 'toan',
      gameId: 'color_balloon',
      gameTitle: 'Pop The Color Balloons!',
      title: 'Trò Chơi: Bóng Bay Màu Sắc',
      description: 'Bận vỡ bóng bay mang đúng màu sắc tiếng Anh',
      reason: 'Củng cố từ vựng thông qua tương tác phản xạ trò chơi giải trí có thưởng.',
      childExplanation: 'Thử tài nhanh tay tinh mắt bắn bóng bay màu sắc vui nhộn!',
      estimatedMinutes: 4,
      priority: 60,
      badgeEmoji: '🎈',
    });

    // ==========================================
    // 4. READING FLUENCY TRACK (P27.5)
    // ==========================================
    // Reading fluency is a first-class learning goal, not a side quest.
    // It is derived from real reading evidence only (never from a single score).
    const readingStates = states.filter((s) => s.skillId.startsWith('rf_'));
    if (readingStates.length > 0) {
      const readingAttempts = readingStates.reduce((sum, s) => sum + s.attemptCount, 0);
      const readingRecent = Math.round(
        readingStates.reduce((sum, s) => sum + s.recentAccuracy, 0) / readingStates.length
      );
      const weakest = [...readingStates].sort((a, b) => a.recentAccuracy - b.recentAccuracy)[0];

      if (readingRecent < LEARNING_OS_POLICY.MASTERY_HIGH_THRESHOLD && readingAttempts >= 3) {
        candidateActions.push({
          id: 'action_reading_fluency',
          type: 'PRACTICE',
          subject: 'tieng-viet',
          skillId: weakest.skillId,
          skillName: 'Luyện đọc chắc – đọc lưu loát',
          title: 'Luyện Đọc Chắc & Lưu Loát',
          description: 'Đọc đoạn văn ngắn rồi trả lời câu hỏi hiểu nội dung',
          reason: `Độ chính xác đọc hiểu gần đây ${readingRecent}%. Mỗi bài đọc ngắn giúp bé đọc vững hơn.`,
          childExplanation: 'Mình cùng đọc một đoạn ngắn rồi trả lời mấy câu nhé, bé đọc rất tốt rồi!',
          estimatedMinutes: 6,
          priority: 88,
          badgeEmoji: '📖',
        });
      } else if (readingRecent >= LEARNING_OS_POLICY.MASTERY_HIGH_THRESHOLD) {
        candidateActions.push({
          id: 'action_reading_speed',
          type: 'SPEED_PRACTICE',
          subject: 'tieng-viet',
          skillId: 'rf_read_aloud_speed',
          skillName: 'Đọc nhanh mà rõ',
          title: 'Rèn Đọc Nhanh Mà Vẫn Rõ',
          description: 'Đọc câu ngắn thật nhanh nhưng không bỏ sót chữ nào',
          reason: `Bé đọc hiểu đã ở mức ${readingRecent}%. Đã đủ nền để luyện thêm tốc độ đọc.`,
          childExplanation: 'Bé đọc chắc rồi, giờ mình thử đọc nhanh thêm chút nhé!',
          estimatedMinutes: 4,
          priority: 74,
          badgeEmoji: '⚡',
        });
      }
    } else {
      // Cold start for reading: introduce the ladder as a low-pressure habit.
      candidateActions.push({
        id: 'action_reading_intro',
        type: 'LEARN',
        subject: 'tieng-viet',
        skillId: 'rf_word_recognition',
        skillName: 'Nhận diện từ khi đọc',
        title: 'Làm Quen Luyện Đọc',
        description: 'Đọc đoạn văn thật ngắn và trả lời câu hỏi đơn giản',
        reason: 'Đọc lưu loát là nền tảng để đọc nhanh và hiểu nhanh sau này.',
        childExplanation: 'Mình cùng đọc một đoạn ngắn xem nhé, rất dễ!',
        estimatedMinutes: 5,
        priority: 76,
        badgeEmoji: '📖',
      });
    }

    // Sort deterministically by priority descending, then by id for stability
    candidateActions.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

    return candidateActions;
  }

  /**
   * Assembles a balanced Daily Learning Plan of 12 - 18 minutes (Grade 1 target).
   */
  public static generateDailyPlan(
    knowledgeMap: Record<string, KnowledgeState>,
    dateString: string = new Date().toISOString().split('T')[0],
    fatigue?: SessionFatigueState,
    policyVersion: string = LEARNING_OS_POLICY.POLICY_VERSION,
    trackActions: LearningAction[] = []
  ): DailyPlan {
    const actions = this.getNextBestActions(knowledgeMap, fatigue, Date.now(), trackActions);

    const selectedItems: DailyPlanItem[] = [];
    let totalMinutes = 0;
    const usedSubjects = new Set<SubjectType>();

    // Pass 1: Select up to 3-4 distinct interleaved actions
    for (const act of actions) {
      if (totalMinutes + act.estimatedMinutes > LEARNING_OS_POLICY.MAX_DAILY_MINUTES) {
        continue;
      }

      // Interleaving check: avoid repeating the same skill or action type consecutively
      const isDuplicateSkill = act.skillId && selectedItems.some((item) => item.action.skillId === act.skillId);
      if (isDuplicateSkill) continue;

      selectedItems.push({
        id: `plan_item_${act.id}_${selectedItems.length}`,
        action: act,
        estimatedMinutes: act.estimatedMinutes,
        priority: act.priority,
        reason: act.reason,
        completed: false,
      });

      totalMinutes += act.estimatedMinutes;
      usedSubjects.add(act.subject);

      if (selectedItems.length >= LEARNING_OS_POLICY.MAX_DAILY_ITEMS) break;
    }

    // Pass 2: Ensure minimum daily duration (>= 10 minutes)
    if (totalMinutes < LEARNING_OS_POLICY.MIN_DAILY_MINUTES && actions.length > selectedItems.length) {
      for (const act of actions) {
        if (!selectedItems.some((i) => i.action.id === act.id)) {
          selectedItems.push({
            id: `plan_item_fill_${act.id}`,
            action: act,
            estimatedMinutes: act.estimatedMinutes,
            priority: act.priority,
            reason: act.reason,
            completed: false,
          });
          totalMinutes += act.estimatedMinutes;
          if (totalMinutes >= LEARNING_OS_POLICY.MIN_DAILY_MINUTES) break;
        }
      }
    }

    return {
      date: dateString,
      estimatedMinutes: totalMinutes,
      items: selectedItems,
      generatedFrom: {
        knowledgeVersion: 1,
        policyVersion,
        generatedAt: Date.now(),
      },
    };
  }

  /**
   * Generates detailed explainability document for parents & educators.
   */
  public static explainRecommendation(
    action: LearningAction,
    knowledgeState?: KnowledgeState
  ): RecommendationExplanation {
    const evidenceList: string[] = [];

    if (knowledgeState) {
      evidenceList.push(`Tổng số lượt làm bài: ${knowledgeState.attemptCount} lượt.`);
      evidenceList.push(`Độ chính xác hiện tại: ${knowledgeState.accuracy}%.`);
      evidenceList.push(`Độ chính xác gần đây: ${knowledgeState.recentAccuracy}%.`);
      if (knowledgeState.averageResponseTimeMs) {
        evidenceList.push(
          `Thời gian trả lời trung bình: ${Math.round(knowledgeState.averageResponseTimeMs / 1000)} giây/câu.`
        );
      }
      if (knowledgeState.errorProfile.knowledgeGap > 0) {
        evidenceList.push(`Phát hiện ${knowledgeState.errorProfile.knowledgeGap} lỗi hổng kiến thức căn bản.`);
      }
      if (knowledgeState.errorProfile.careless > 0) {
        evidenceList.push(`Phát hiện ${knowledgeState.errorProfile.careless} lỗi bất cẩn do bấm nhanh.`);
      }
    } else {
      evidenceList.push('Hồ sơ học tập mới khởi tạo (Cold Start) theo chương trình phổ thông lớp 1.');
    }

    let expectedGoal = 'Củng cố kiến thức và xây dựng sự tự tin.';
    if (action.type === 'PRACTICE' || action.type === 'LEARN') {
      expectedGoal = 'Nâng độ chính xác lên $\\ge 85\\%$ trong 2 buổi liên tiếp để đạt chuẩn Mastered.';
    } else if (action.type === 'REVIEW') {
      expectedGoal = 'Kích hoạt trí nhớ dài hạn và ngăn ngừa đường cong lãng quên.';
    } else if (action.type === 'SPEED_PRACTICE') {
      expectedGoal = 'Tối ưu thời gian làm bài dưới 18 giây/câu mà vẫn giữ vững độ chuẩn xác.';
    } else if (action.type === 'COMPETITION') {
      expectedGoal = 'Rèn luyện bản lĩnh phòng thi và tâm lý bình tĩnh dưới áp lực thời gian.';
    }

    return {
      actionId: action.id,
      recommendation: action.title,
      reason: action.reason,
      evidence: evidenceList,
      suggestedDurationMinutes: action.estimatedMinutes,
      expectedGoal,
    };
  }
}
