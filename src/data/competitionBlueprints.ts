import { ExamBlueprint } from '../types/competition';

export const EXAM_BLUEPRINTS: ExamBlueprint[] = [
  // --- TIẾNG VIỆT ---
  {
    id: 'bp-vn-mini-01',
    title: 'Tiếng Việt Mini Test 01',
    subtitle: 'Rèn luyện ngữ âm, dấu thanh và ghép vần cơ bản',
    subject: 'tieng-viet',
    mode: 'mini_test',
    difficulty: 'EASY',
    durationSeconds: 300, // 5 minutes
    questionCount: 6,
    badgeEmoji: '🌱',
    rewardXp: 50,
    rewardStars: 4,
  },
  {
    id: 'bp-vn-mini-02',
    title: 'Tiếng Việt Mini Test 02',
    subtitle: 'Thử sức chính tả c/k, g/gh và vốn từ chỉ hoạt động',
    subject: 'tieng-viet',
    mode: 'mini_test',
    difficulty: 'MEDIUM',
    durationSeconds: 360, // 6 minutes
    questionCount: 8,
    badgeEmoji: '🌿',
    rewardXp: 70,
    rewardStars: 5,
  },
  {
    id: 'bp-vn-full',
    title: 'Đấu Trường Tiếng Việt Toàn Diện',
    subtitle: 'Thử thách tổng hợp: Ngữ âm, Chính tả, Đọc hiểu và Đố chữ',
    subject: 'tieng-viet',
    mode: 'full_mock',
    difficulty: 'HARD',
    durationSeconds: 600, // 10 minutes
    questionCount: 12,
    badgeEmoji: '🏆',
    rewardXp: 120,
    rewardStars: 8,
  },

  // --- TOÁN HỌC ---
  {
    id: 'bp-math-mini-01',
    title: 'Toán Học Mini Test 01',
    subtitle: 'Số đếm 0 - 20, so sánh lớn bé và cộng trừ phạm vi 10',
    subject: 'toan',
    mode: 'mini_test',
    difficulty: 'EASY',
    durationSeconds: 300, // 5 minutes
    questionCount: 6,
    badgeEmoji: '🔢',
    rewardXp: 50,
    rewardStars: 4,
  },
  {
    id: 'bp-math-mini-02',
    title: 'Toán Học Mini Test 02',
    subtitle: 'Quy luật dãy số, hình học trực quan và đo lường',
    subject: 'toan',
    mode: 'mini_test',
    difficulty: 'MEDIUM',
    durationSeconds: 360, // 6 minutes
    questionCount: 8,
    badgeEmoji: '📐',
    rewardXp: 70,
    rewardStars: 5,
  },
  {
    id: 'bp-math-full',
    title: 'Đấu Trường Toán Học Toàn Diện',
    subtitle: 'Tổng hợp tính nhẩm nhanh, toán có lời văn và tư duy logic',
    subject: 'toan',
    mode: 'full_mock',
    difficulty: 'HARD',
    durationSeconds: 600, // 10 minutes
    questionCount: 12,
    badgeEmoji: '👑',
    rewardXp: 120,
    rewardStars: 8,
  },

  // --- ENGLISH ---
  {
    id: 'bp-eng-practice',
    title: 'English Challenge Practice',
    subtitle: 'Phonics sounds, numbers, colors and cute animals',
    subject: 'english',
    mode: 'mini_test',
    difficulty: 'EASY',
    durationSeconds: 300, // 5 minutes
    questionCount: 6,
    badgeEmoji: '🇬🇧',
    rewardXp: 60,
    rewardStars: 5,
  },

  // --- SPEED TRIALS ---
  {
    id: 'bp-speed-math',
    title: 'Thử Thách Tốc Độ: Phép Tính Nhanh',
    subtitle: 'Rèn luyện phản xạ tính nhẩm chuẩn xác trong thời gian ngắn',
    subject: 'toan',
    mode: 'speed_trial',
    difficulty: 'MEDIUM',
    durationSeconds: 180, // 3 minutes
    questionCount: 6,
    badgeEmoji: '⚡',
    rewardXp: 60,
    rewardStars: 4,
  },
  {
    id: 'bp-speed-viet',
    title: 'Thử Thách Tốc Độ: Nhận Diện Từ Nhanh',
    subtitle: 'Nhận biết âm vần và lỗi chính tả thần tốc',
    subject: 'tieng-viet',
    mode: 'speed_trial',
    difficulty: 'MEDIUM',
    durationSeconds: 180, // 3 minutes
    questionCount: 6,
    badgeEmoji: '🚀',
    rewardXp: 60,
    rewardStars: 4,
  },
];

export function getBlueprintById(id: string): ExamBlueprint | undefined {
  return EXAM_BLUEPRINTS.find((b) => b.id === id);
}

export function getBlueprintsBySubject(subject: string): ExamBlueprint[] {
  return EXAM_BLUEPRINTS.filter((b) => b.subject === subject);
}
