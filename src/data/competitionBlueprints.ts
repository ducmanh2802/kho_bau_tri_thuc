import { ExamBlueprint } from '../types/competition';

/**
 * EXAM BLUEPRINTS (P27.5 §11)
 *
 * These presets are ORIGINAL and exam-like. The app deliberately does NOT claim
 * to be an "official replica" of any Vietnamese primary-school competition paper
 * and contains no copied or scraped questions. Every preset states this.
 */
const ORIGINAL_SOURCE_NOTE =
  'Bộ đề luyện tập do ứng dụng tự soạn theo cấu trúc thi tiểu học — không phải đề thi chính thức.';

export const EXAM_BLUEPRINTS: ExamBlueprint[] = [
  // --- TIẾNG VIỆT ---
  {
    id: 'bp-vn-mini-01',
    title: 'Tiếng Việt Mini Test 01',
    subtitle: 'Rèn luyện ngữ âm, dấu thanh và ghép vần cơ bản',
    subject: 'tieng-viet',
    mode: 'mini_test',
    difficulty: 'EASY',
    durationSeconds: 300,
    questionCount: 6,
    badgeEmoji: '🌱',
    rewardXp: 50,
    rewardStars: 4,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },
  {
    id: 'bp-vn-mini-02',
    title: 'Tiếng Việt Mini Test 02',
    subtitle: 'Thử sức chính tả c/k, g/gh và vốn từ chỉ hoạt động',
    subject: 'tieng-viet',
    mode: 'mini_test',
    difficulty: 'MEDIUM',
    durationSeconds: 360,
    questionCount: 8,
    badgeEmoji: '🌿',
    rewardXp: 70,
    rewardStars: 5,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },
  {
    id: 'bp-vn-full',
    title: 'Đấu Trường Tiếng Việt Toàn Diện',
    subtitle: 'Bài thi thử có phân phối dạng bài như một bài thi thật',
    subject: 'tieng-viet',
    mode: 'full_mock',
    difficulty: 'HARD',
    durationSeconds: 900,
    questionCount: 12,
    badgeEmoji: '🏆',
    rewardXp: 120,
    rewardStars: 8,
    maxScore: 20,
    difficultyDistribution: {
      EASY: 0.25,
      MEDIUM: 0.5,
      HARD: 0.25,
      CHALLENGE: 0,
    },
    questionTypeDistribution: {
      'multiple-choice': 0.5,
      matching: 0.08,
      ordering: 0.08,
      'fill-blank': 0.08,
      'true-false': 0.08,
      'drag-drop': 0.09,
      classify: 0.09,
    },
    sections: [
      {
        id: 'sec-vn-a',
        title: 'Phần 1 — Ngữ âm & Chính tả',
        instruction: 'Đọc kỹ từng câu và chọn hoặc điền đáp án đúng.',
        skillIds: ['TV-PHONICS', 'TV-TONES', 'TV-SYLLABLE', 'TV-SPELLING'],
      },
      {
        id: 'sec-vn-b',
        title: 'Phần 2 — Từ vựng & Câu',
        instruction: 'Ghép đôi và sắp xếp từ thành câu đúng ngữ pháp.',
        skillIds: ['TV-WORD', 'TV-SENTENCE', 'TV-RHYME'],
      },
      {
        id: 'sec-vn-c',
        title: 'Phần 3 — Đọc hiểu & Tư duy',
        instruction: 'Đọc đoạn văn và suy luận câu trả lời.',
        skillIds: ['TV-READING', 'TV-LANGUAGE-LOGIC'],
      },
    ],
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },

  // --- TOÁN HỌC ---
  {
    id: 'bp-math-mini-01',
    title: 'Toán Học Mini Test 01',
    subtitle: 'Số đếm 0 - 20, so sánh lớn bé và cộng trừ phạm vi 10',
    subject: 'toan',
    mode: 'mini_test',
    difficulty: 'EASY',
    durationSeconds: 300,
    questionCount: 6,
    badgeEmoji: '🔢',
    rewardXp: 50,
    rewardStars: 4,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },
  {
    id: 'bp-math-mini-02',
    title: 'Toán Học Mini Test 02',
    subtitle: 'Quy luật dãy số, hình học trực quan và đo lường',
    subject: 'toan',
    mode: 'mini_test',
    difficulty: 'MEDIUM',
    durationSeconds: 360,
    questionCount: 8,
    badgeEmoji: '📐',
    rewardXp: 70,
    rewardStars: 5,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },
  {
    id: 'bp-math-full',
    title: 'Đấu Trường Toán Học Toàn Diện',
    subtitle: 'Bài thi thử có phân phối dạng bài như một bài thi thật',
    subject: 'toan',
    mode: 'full_mock',
    difficulty: 'HARD',
    durationSeconds: 900,
    questionCount: 12,
    badgeEmoji: '👑',
    rewardXp: 120,
    rewardStars: 8,
    maxScore: 20,
    difficultyDistribution: {
      EASY: 0.25,
      MEDIUM: 0.5,
      HARD: 0.25,
      CHALLENGE: 0,
    },
    questionTypeDistribution: {
      'multiple-choice': 0.5,
      'fill-blank': 0.17,
      matching: 0.08,
      'true-false': 0.08,
      classify: 0.09,
      'drag-drop': 0.08,
    },
    sections: [
      {
        id: 'sec-math-a',
        title: 'Phần 1 — Số học & So sánh',
        instruction: 'Đếm cẩn thận và so sánh từng cặp số.',
        skillIds: ['MATH-NUMBER', 'MATH-COMPARISON', 'MATH-SEQUENCE'],
      },
      {
        id: 'sec-math-b',
        title: 'Phần 2 — Phép tính',
        instruction: 'Tính nhẩm và điền kết quả vào chỗ trống.',
        skillIds: ['MATH-ADDITION', 'MATH-SUBTRACTION'],
      },
      {
        id: 'sec-math-c',
        title: 'Phần 3 — Hình học & Giải toán',
        instruction: 'Quan sát hình và đọc kỹ đề bài có lời văn.',
        skillIds: ['MATH-SHAPE', 'MATH-MEASUREMENT', 'MATH-WORD-PROBLEM', 'MATH-PATTERN', 'MATH-LOGIC'],
      },
    ],
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },

  // --- ENGLISH ---
  {
    id: 'bp-eng-practice',
    title: 'English Challenge Practice',
    subtitle: 'Phonics sounds, numbers, colors and cute animals',
    subject: 'english',
    mode: 'mini_test',
    difficulty: 'EASY',
    durationSeconds: 300,
    questionCount: 6,
    badgeEmoji: '🇬🇧',
    rewardXp: 60,
    rewardStars: 5,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },

  // --- SPEED TRIALS ---
  {
    id: 'bp-speed-math',
    title: 'Thử Thách Tốc Độ: Phép Tính Nhanh',
    subtitle: 'Rèn luyện phản xạ tính nhẩm chuẩn xác trong thời gian ngắn',
    subject: 'toan',
    mode: 'speed_trial',
    difficulty: 'MEDIUM',
    durationSeconds: 180,
    questionCount: 8,
    badgeEmoji: '⚡',
    rewardXp: 60,
    rewardStars: 4,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },
  {
    id: 'bp-speed-viet',
    title: 'Thử Thách Tốc Độ: Nhận Diện Từ Nhanh',
    subtitle: 'Nhận biết âm vần và lỗi chính tả thần tốc',
    subject: 'tieng-viet',
    mode: 'speed_trial',
    difficulty: 'MEDIUM',
    durationSeconds: 180,
    questionCount: 8,
    badgeEmoji: '🚀',
    rewardXp: 60,
    rewardStars: 4,
    maxScore: 10,
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },

  // --- READING-HEAVY EXAM (exam-like reading section, §31 golden path) ---
  {
    id: 'bp-vn-reading',
    title: 'Bài Thi Thử Có Phần Đọc Hiểu',
    subtitle: 'Phần đọc đoạn văn ngắn và trả lời câu hỏi tìm thông tin',
    subject: 'tieng-viet',
    mode: 'mini_test',
    difficulty: 'MEDIUM',
    durationSeconds: 420,
    questionCount: 8,
    badgeEmoji: '📖',
    rewardXp: 80,
    rewardStars: 6,
    maxScore: 10,
    skillDistribution: {
      'TV-READING': 4,
      'TV-SENTENCE': 2,
    },
    sourceNote: ORIGINAL_SOURCE_NOTE,
    version: 2,
  },
];

export function getBlueprintById(id: string): ExamBlueprint | undefined {
  return EXAM_BLUEPRINTS.find((b) => b.id === id);
}

export function getBlueprintsBySubject(subject: string): ExamBlueprint[] {
  return EXAM_BLUEPRINTS.filter((b) => b.subject === subject);
}

export function getSpeedTrialBlueprints(): ExamBlueprint[] {
  return EXAM_BLUEPRINTS.filter((b) => b.mode === 'speed_trial');
}
