import {
  Achievement,
  AvatarItem,
  ChildProfile,
  DailyQuest,
  LearningAnalytics,
  MasteryStatus,
  ParentSettings,
  SkillMastery,
  SubjectType,
} from '../types';
import { getAllSkills } from '../data/curriculum';

const STORAGE_KEYS = {
  CHILD_PROFILE: 'kho_bau_child_profile',
  ANALYTICS: 'kho_bau_analytics',
  PARENT_SETTINGS: 'kho_bau_parent_settings',
  DAILY_QUESTS: 'kho_bau_daily_quests',
  ACHIEVEMENTS: 'kho_bau_achievements',
};

export const AVATAR_SHOP_ITEMS: AvatarItem[] = [
  { id: 'hat_cap', name: 'Mũ Lưỡi Trai Năng Động', type: 'hat', emoji: '🧢', priceStars: 5, unlocked: true },
  { id: 'hat_crown', name: 'Vương Miện Trạng Nguyên', type: 'hat', emoji: '👑', priceStars: 20, unlocked: false },
  { id: 'hat_party', name: 'Mũ Sinh Nhật Vui Vẻ', type: 'hat', emoji: '🥳', priceStars: 10, unlocked: false },
  { id: 'hat_scholar', name: 'Mũ Tiến Sĩ Nhí', type: 'hat', emoji: '🎓', priceStars: 25, unlocked: false },
  { id: 'glasses_cool', name: 'Kính Râm Siêu Ngầu', type: 'glasses', emoji: '🕶️', priceStars: 10, unlocked: false },
  { id: 'glasses_nerd', name: 'Kính Tròn Tri Thức', type: 'glasses', emoji: '👓', priceStars: 8, unlocked: true },
  { id: 'shirt_super', name: 'Áo Choàng Siêu Nhân', type: 'shirt', emoji: '🦸', priceStars: 15, unlocked: false },
  { id: 'shirt_space', name: 'Bộ Đồ Phi Hành Gia', type: 'shirt', emoji: '🧑‍🚀', priceStars: 30, unlocked: false },
  { id: 'bag_dino', name: 'Balo Khủng Long Xanh', type: 'backpack', emoji: '🎒', priceStars: 12, unlocked: true },
  { id: 'pet_cat', name: 'Mèo Miu Miu Đồng Hành', type: 'pet', emoji: '🐱', priceStars: 25, unlocked: false },
  { id: 'pet_puppy', name: 'Cún Con Thông Minh', type: 'pet', emoji: '🐶', priceStars: 25, unlocked: false },
  { id: 'pet_dragon', name: 'Rồng Con May Mắn', type: 'pet', emoji: '🐲', priceStars: 50, unlocked: false },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_lesson',
    title: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên trên hành trình',
    icon: '🌟',
    unlocked: false,
    xpReward: 50,
  },
  {
    id: 'ach_viet_master',
    title: 'Bé Giỏi Tiếng Việt',
    description: 'Hoàn thành 3 bài học Tiếng Việt',
    icon: '📚',
    unlocked: false,
    xpReward: 80,
  },
  {
    id: 'ach_math_hero',
    title: 'Thần Đồng Toán Học',
    description: 'Hoàn thành 3 bài học Toán vui vẻ',
    icon: '🔢',
    unlocked: false,
    xpReward: 80,
  },
  {
    id: 'ach_english_star',
    title: 'English Explorer',
    description: 'Hoàn thành 3 bài học Tiếng Anh',
    icon: '🇬🇧',
    unlocked: false,
    xpReward: 80,
  },
  {
    id: 'ach_gamer_fun',
    title: 'Nhà Vô Địch Trò Chơi',
    description: 'Chơi và vượt qua 3 mini-game giáo dục',
    icon: '🎮',
    unlocked: false,
    xpReward: 60,
  },
  {
    id: 'ach_streak_3',
    title: 'Ngọn Lửa Chăm Chỉ',
    description: 'Duy trì chuỗi học 3 ngày liên tiếp',
    icon: '🔥',
    unlocked: false,
    xpReward: 100,
  },
  {
    id: 'ach_review_pro',
    title: 'Trí Nhớ Siêu Phàm',
    description: 'Hoàn thành 1 lượt Ôn Tập Thông Minh',
    icon: '💡',
    unlocked: false,
    xpReward: 75,
  },
  {
    id: 'ach_weekly_hero',
    title: 'Chiến Binh Tuần',
    description: 'Vượt qua bài Thử Thách Tuần Lớp 1',
    icon: '🏆',
    unlocked: false,
    xpReward: 120,
  },
];

const DEFAULT_CHILD_PROFILE: ChildProfile = {
  id: 'child_1',
  name: 'Bé Minh',
  grade: 1,
  avatarBase: 'bear',
  equipped: {
    hat: 'hat_cap',
    glasses: 'glasses_nerd',
    backpack: 'bag_dino',
  },
  xp: 0,
  stars: 0,
  gems: 0,
  tickets: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedItems: ['hat_cap', 'glasses_nerd', 'bag_dino'],
  completedLessons: [],
  completedWeeklyChallenges: [],
};

const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  dailyLimitMinutes: 20, // 20 minutes safe recommendation for 6-7 y/o
  soundEnabled: true,
  musicEnabled: true,
  voiceEnabled: true,
  difficultyScale: 'normal',
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function createDefaultQuests(): DailyQuest[] {
  return [
    {
      id: 'quest_viet',
      title: 'Học 1 bài Tiếng Việt xinh',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 3,
      rewardXp: 30,
      completed: false,
      type: 'lesson_viet',
    },
    {
      id: 'quest_math',
      title: 'Làm quen 1 bài Toán kỳ thú',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 3,
      rewardXp: 30,
      completed: false,
      type: 'lesson_math',
    },
    {
      id: 'quest_english',
      title: 'Khám phá 1 bài English vui nhộn',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 3,
      rewardXp: 30,
      completed: false,
      type: 'lesson_english',
    },
    {
      id: 'quest_game',
      title: 'Thử sức 1 trò chơi thông minh',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 2,
      rewardXp: 20,
      completed: false,
      type: 'play_game',
    },
    {
      id: 'quest_review',
      title: 'Hoàn thành Ôn tập hôm nay',
      targetCount: 1,
      currentCount: 0,
      rewardStars: 4,
      rewardXp: 40,
      completed: false,
      type: 'daily_review',
    },
  ];
}

export class StorageService {
  public static getChildProfile(): ChildProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHILD_PROFILE);
      if (data) {
        const raw = JSON.parse(data);
        if (raw && typeof raw === 'object') {
          // Defensively sanitize and merge with defaults
          const sanitized: ChildProfile = {
            id: typeof raw.id === 'string' ? raw.id : DEFAULT_CHILD_PROFILE.id,
            name: typeof raw.name === 'string' ? raw.name : DEFAULT_CHILD_PROFILE.name,
            grade: 1,
            avatarBase: ['bear', 'fox', 'rabbit', 'owl'].includes(raw.avatarBase)
              ? raw.avatarBase
              : DEFAULT_CHILD_PROFILE.avatarBase,
            equipped: raw.equipped && typeof raw.equipped === 'object' ? raw.equipped : {},
            xp: typeof raw.xp === 'number' && !isNaN(raw.xp) && raw.xp >= 0 ? raw.xp : 0,
            stars: typeof raw.stars === 'number' && !isNaN(raw.stars) && raw.stars >= 0 ? raw.stars : 0,
            gems: typeof raw.gems === 'number' && !isNaN(raw.gems) && raw.gems >= 0 ? raw.gems : 0,
            tickets: typeof raw.tickets === 'number' && !isNaN(raw.tickets) && raw.tickets >= 0 ? raw.tickets : 0,
            streak: typeof raw.streak === 'number' && !isNaN(raw.streak) && raw.streak >= 1 ? raw.streak : 1,
            lastActiveDate: typeof raw.lastActiveDate === 'string' ? raw.lastActiveDate : getTodayString(),
            unlockedItems: Array.isArray(raw.unlockedItems)
              ? raw.unlockedItems
              : [...DEFAULT_CHILD_PROFILE.unlockedItems],
            completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
            completedWeeklyChallenges: Array.isArray(raw.completedWeeklyChallenges)
              ? raw.completedWeeklyChallenges
              : [],
            dailyChestClaimedDate: raw.dailyChestClaimedDate,
          };

          // Verify streak progression
          const today = getTodayString();
          if (sanitized.lastActiveDate !== today) {
            const lastDate = new Date(sanitized.lastActiveDate);
            const currDate = new Date(today);
            const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays === 1) {
              sanitized.streak += 1;
            } else if (diffDays > 1) {
              sanitized.streak = 1;
            }
            sanitized.lastActiveDate = today;
            StorageService.saveChildProfile(sanitized);
          }
          return sanitized;
        }
      }
    } catch {
      // Ignore parse error and recover safely
    }
    StorageService.saveChildProfile(DEFAULT_CHILD_PROFILE);
    return DEFAULT_CHILD_PROFILE;
  }

  public static saveChildProfile(profile: ChildProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHILD_PROFILE, JSON.stringify(profile));
    } catch {
      // Storage full or private mode handled safely
    }
  }

  public static getParentSettings(): ParentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARENT_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return {
            dailyLimitMinutes: typeof parsed.dailyLimitMinutes === 'number' ? parsed.dailyLimitMinutes : 20,
            soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
            musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
            voiceEnabled: typeof parsed.voiceEnabled === 'boolean' ? parsed.voiceEnabled : true,
            difficultyScale: ['easy', 'normal', 'advanced'].includes(parsed.difficultyScale)
              ? parsed.difficultyScale
              : 'normal',
          };
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_PARENT_SETTINGS;
  }

  public static saveParentSettings(settings: ParentSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARENT_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }

  public static getAnalytics(): LearningAnalytics {
    const today = getTodayString();
    let analytics: LearningAnalytics = {
      totalMinutesSpent: 0,
      minutesToday: 0,
      todayDate: today,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      lessonsCompletedCount: 0,
      gamesPlayedCount: 0,
      skillMastery: {},
      recentErrors: [],
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          analytics = {
            totalMinutesSpent: typeof parsed.totalMinutesSpent === 'number' ? parsed.totalMinutesSpent : 0,
            minutesToday: parsed.todayDate === today && typeof parsed.minutesToday === 'number' ? parsed.minutesToday : 0,
            todayDate: today,
            totalQuestionsAnswered: typeof parsed.totalQuestionsAnswered === 'number' ? parsed.totalQuestionsAnswered : 0,
            totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
            lessonsCompletedCount: typeof parsed.lessonsCompletedCount === 'number' ? parsed.lessonsCompletedCount : 0,
            gamesPlayedCount: typeof parsed.gamesPlayedCount === 'number' ? parsed.gamesPlayedCount : 0,
            skillMastery: parsed.skillMastery && typeof parsed.skillMastery === 'object' ? parsed.skillMastery : {},
            recentErrors: Array.isArray(parsed.recentErrors) ? parsed.recentErrors : [],
          };
        }
      }
    } catch {
      // Ignore
    }

    // Ensure all curriculum skills have mastery records
    const allSkills = getAllSkills();
    for (const s of allSkills) {
      if (!analytics.skillMastery[s.skillId]) {
        analytics.skillMastery[s.skillId] = {
          skillId: s.skillId,
          skillName: s.skillName,
          subject: s.subject,
          attempts: 0,
          correctCount: 0,
          wrongCount: 0,
          status: 'NOT_STARTED',
          lastPracticed: new Date().toISOString(),
        };
      }
    }

    return analytics;
  }

  public static saveAnalytics(analytics: LearningAnalytics) {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    } catch {
      // Ignore
    }
  }

  public static getDailyQuests(): DailyQuest[] {
    const today = getTodayString();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today && Array.isArray(parsed.quests)) {
          return parsed.quests;
        }
      }
    } catch {
      // Ignore
    }

    const newQuests = createDefaultQuests();
    StorageService.saveDailyQuests(newQuests);
    return newQuests;
  }

  public static saveDailyQuests(quests: DailyQuest[]) {
    try {
      const today = getTodayString();
      localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify({ date: today, quests }));
    } catch {
      // Ignore
    }
  }

  public static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return INITIAL_ACHIEVEMENTS;
  }

  public static saveAchievements(achs: Achievement[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achs));
    } catch {
      // Ignore
    }
  }

  // Record an answered question for adaptive learning & mastery
  public static recordQuestionAnswer(
    skillId: string,
    isCorrect: boolean,
    questionId: string,
    prompt: string,
    subject: SubjectType
  ) {
    const analytics = StorageService.getAnalytics();
    analytics.totalQuestionsAnswered += 1;
    if (isCorrect) {
      analytics.totalCorrect += 1;
    } else {
      analytics.recentErrors.unshift({
        questionId,
        subject,
        prompt,
        timestamp: new Date().toISOString(),
      });
      if (analytics.recentErrors.length > 20) {
        analytics.recentErrors.pop();
      }
    }

    let mastery = analytics.skillMastery[skillId];
    if (!mastery) {
      mastery = {
        skillId,
        skillName: skillId,
        subject,
        attempts: 0,
        correctCount: 0,
        wrongCount: 0,
        status: 'NOT_STARTED',
        lastPracticed: new Date().toISOString(),
      };
      analytics.skillMastery[skillId] = mastery;
    }

    mastery.attempts += 1;
    if (isCorrect) {
      mastery.correctCount += 1;
    } else {
      mastery.wrongCount += 1;
    }
    mastery.lastPracticed = new Date().toISOString();

    // Determine mastery status
    const accuracy = mastery.attempts > 0 ? mastery.correctCount / mastery.attempts : 0;
    if (mastery.attempts >= 4 && accuracy >= 0.85) {
      mastery.status = 'MASTERED';
    } else if (mastery.attempts >= 3 && accuracy < 0.6) {
      mastery.status = 'NEEDS_REVIEW';
    } else if (mastery.attempts >= 2) {
      mastery.status = 'PRACTICING';
    } else {
      mastery.status = 'LEARNING';
    }

    StorageService.saveAnalytics(analytics);
  }

  // Increment screen time
  public static addMinutesSpent(minutes: number) {
    const analytics = StorageService.getAnalytics();
    analytics.minutesToday += minutes;
    analytics.totalMinutesSpent += minutes;
    StorageService.saveAnalytics(analytics);
  }

  // Record completed lesson
  public static completeLesson(lessonId: string, subject: SubjectType, xp: number, stars: number) {
    const profile = StorageService.getChildProfile();
    const isFirstTime = !profile.completedLessons.includes(lessonId);

    if (isFirstTime) {
      profile.completedLessons.push(lessonId);
      profile.xp += xp;
      profile.stars += stars;
      profile.tickets += 1; // Earn 1 arcade ticket per new lesson!
    } else {
      // Retaking an already completed lesson grants practice review XP (+5 XP)
      // but does NOT duplicate stars/tickets (anti-farming reward integrity)
      profile.xp += 5;
    }
    StorageService.saveChildProfile(profile);

    const analytics = StorageService.getAnalytics();
    analytics.lessonsCompletedCount += 1;
    StorageService.saveAnalytics(analytics);

    // Update daily quests
    const quests = StorageService.getDailyQuests();
    const questType =
      subject === 'tieng-viet' ? 'lesson_viet' : subject === 'toan' ? 'lesson_math' : 'lesson_english';
    quests.forEach((q) => {
      if (q.type === questType && !q.completed) {
        q.currentCount += 1;
        if (q.currentCount >= q.targetCount) {
          q.completed = true;
          profile.stars += q.rewardStars;
          profile.xp += q.rewardXp;
          StorageService.saveChildProfile(profile);
        }
      }
    });
    StorageService.saveDailyQuests(quests);

    // Check achievements
    StorageService.checkAchievements();
  }

  // Record played mini game
  public static recordGamePlayed(xpReward: number = 15, starReward: number = 1) {
    const profile = StorageService.getChildProfile();
    profile.xp += xpReward;
    profile.stars += starReward;
    StorageService.saveChildProfile(profile);

    const analytics = StorageService.getAnalytics();
    analytics.gamesPlayedCount += 1;
    StorageService.saveAnalytics(analytics);

    // Update quest
    const quests = StorageService.getDailyQuests();
    quests.forEach((q) => {
      if (q.type === 'play_game' && !q.completed) {
        q.currentCount += 1;
        if (q.currentCount >= q.targetCount) {
          q.completed = true;
          profile.stars += q.rewardStars;
          profile.xp += q.rewardXp;
          StorageService.saveChildProfile(profile);
        }
      }
    });
    StorageService.saveDailyQuests(quests);

    StorageService.checkAchievements();
  }

  public static checkAchievements() {
    const profile = StorageService.getChildProfile();
    const analytics = StorageService.getAnalytics();
    const achs = StorageService.getAchievements();
    let updated = false;

    for (const a of achs) {
      if (a.unlocked) continue;

      let shouldUnlock = false;
      if (a.id === 'ach_first_lesson' && profile.completedLessons.length >= 1) shouldUnlock = true;
      if (a.id === 'ach_viet_master' && profile.completedLessons.filter((l) => l.startsWith('vn-')).length >= 3)
        shouldUnlock = true;
      if (a.id === 'ach_math_hero' && profile.completedLessons.filter((l) => l.startsWith('math-')).length >= 3)
        shouldUnlock = true;
      if (a.id === 'ach_english_star' && profile.completedLessons.filter((l) => l.startsWith('eng-')).length >= 3)
        shouldUnlock = true;
      if (a.id === 'ach_gamer_fun' && analytics.gamesPlayedCount >= 3) shouldUnlock = true;
      if (a.id === 'ach_streak_3' && profile.streak >= 3) shouldUnlock = true;

      if (shouldUnlock) {
        a.unlocked = true;
        a.unlockedAt = new Date().toISOString();
        profile.xp += a.xpReward;
        updated = true;
      }
    }

    if (updated) {
      StorageService.saveAchievements(achs);
      StorageService.saveChildProfile(profile);
    }
  }

  public static resetProgress() {
    localStorage.removeItem(STORAGE_KEYS.CHILD_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_QUESTS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  }

  /**
   * Seeds realistic demo data for evaluators/parents to test diagnostic reports
   * without affecting initial clean profile creation for new users.
   */
  public static seedDemoProfile() {
    const today = getTodayString();
    const demoProfile: ChildProfile = {
      id: 'child_1',
      name: 'Bé Minh',
      grade: 1,
      avatarBase: 'bear',
      equipped: {
        hat: 'hat_cap',
        glasses: 'glasses_nerd',
        backpack: 'bag_dino',
      },
      xp: 220,
      stars: 18,
      gems: 5,
      tickets: 4,
      streak: 4,
      lastActiveDate: today,
      unlockedItems: ['hat_cap', 'glasses_nerd', 'bag_dino', 'hat_party'],
      completedLessons: ['vn-les-1', 'vn-les-2', 'math-les-1', 'math-les-2', 'eng-les-1'],
      completedWeeklyChallenges: ['week_1'],
    };
    StorageService.saveChildProfile(demoProfile);

    const analytics = StorageService.getAnalytics();
    analytics.totalMinutesSpent = 45;
    analytics.minutesToday = 15;
    analytics.totalQuestionsAnswered = 24;
    analytics.totalCorrect = 19;
    analytics.lessonsCompletedCount = 5;
    analytics.gamesPlayedCount = 4;

    // Seed skill masteries
    if (analytics.skillMastery['vn_alphabet']) {
      analytics.skillMastery['vn_alphabet'].attempts = 6;
      analytics.skillMastery['vn_alphabet'].correctCount = 6;
      analytics.skillMastery['vn_alphabet'].status = 'MASTERED';
    }
    if (analytics.skillMastery['math_counting_10']) {
      analytics.skillMastery['math_counting_10'].attempts = 5;
      analytics.skillMastery['math_counting_10'].correctCount = 5;
      analytics.skillMastery['math_counting_10'].status = 'MASTERED';
    }
    if (analytics.skillMastery['math_subtraction_10']) {
      analytics.skillMastery['math_subtraction_10'].attempts = 5;
      analytics.skillMastery['math_subtraction_10'].correctCount = 1;
      analytics.skillMastery['math_subtraction_10'].wrongCount = 4;
      analytics.skillMastery['math_subtraction_10'].status = 'NEEDS_REVIEW';
    }
    if (analytics.skillMastery['eng_phonics_letters']) {
      analytics.skillMastery['eng_phonics_letters'].attempts = 4;
      analytics.skillMastery['eng_phonics_letters'].correctCount = 3;
      analytics.skillMastery['eng_phonics_letters'].wrongCount = 1;
      analytics.skillMastery['eng_phonics_letters'].status = 'PRACTICING';
    }

    analytics.recentErrors = [
      {
        questionId: 'math-q4-2',
        subject: 'toan',
        prompt: '10 - 4 = ...',
        timestamp: new Date().toISOString(),
      },
    ];

    StorageService.saveAnalytics(analytics);
  }
}
