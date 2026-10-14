import React, { useState, useEffect, useCallback } from 'react';
import { ActiveScreen, ChildProfile, DailyQuest, ReadingProfile, SubjectType } from '../../types';
import { sound } from '../../services/sound';
import { localDateKey } from '../../services/dateUtils';
import { fireCelebrationConfetti } from '../../services/confetti';
import { StorageService } from '../../services/storage';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { NextBestActionCard } from '../learning/NextBestActionCard';
import { Star, Sparkles, Gift, Check, ArrowRight, BookOpen, Target, Trophy, Gamepad2, Sparkle, RotateCcw } from 'lucide-react';
import { KidButton, KidCard, Pill, SectionTitle } from '../ui';
import type { DecisionRecommendation } from '../../types/decisionEngine';

interface HomeScreenProps {
  profile: ChildProfile;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectSubject: (sub: SubjectType) => void;
  onOpenGames: () => void;
  onOpenDailyReview: () => void;
  onOpenWeeklyChallenge: () => void;
  onProfileUpdate: () => void;
}

interface SubjectCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  border: string;
  progressColor: string;
  variant: 'subject-viet' | 'subject-math' | 'subject-english' | 'subject-life';
  locked?: boolean;
  subjectType?: SubjectType; // Only for unlocked subjects
}

interface ShortcutCard {
  screen: ActiveScreen;
  label: string;
  icon: string;
  desc: string;
  gradient: string;
  border: string;
}

const SUBJECT_CARDS: readonly SubjectCard[] = [
  {
    id: 'tieng-viet',
    title: 'Tiếng Việt',
    subtitle: 'Chữ cái · Dấu thanh · Vần ghép · Đọc truyện',
    icon: '📚',
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-300',
    progressColor: 'amber',
    variant: 'subject-viet',
    subjectType: 'tieng-viet',
  },
  {
    id: 'toan',
    title: 'Toán Học',
    subtitle: 'Đếm số 0–100 · Cộng trừ · Hình học · Đo lường',
    icon: '🔢',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-300',
    progressColor: 'blue',
    variant: 'subject-math',
    subjectType: 'toan',
  },
  {
    id: 'english',
    title: 'Tiếng Anh',
    subtitle: 'ABC Phonics · Numbers · Colors · Animals',
    icon: '🇬🇧',
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-300',
    progressColor: 'emerald',
    variant: 'subject-english',
    subjectType: 'english',
  },
  {
    id: 'em-cuoc-song',
    title: 'Em & Cuộc Sống',
    subtitle: 'Cảm xúc · An toàn · Kỹ năng sống · Nghệ thuật',
    icon: '💜',
    gradient: 'from-purple-500 to-violet-500',
    border: 'border-purple-300',
    progressColor: 'purple',
    variant: 'subject-life',
    locked: true,
  },
];

const SHORTCUT_CARDS: readonly ShortcutCard[] = [
  {
    screen: 'games',
    label: 'Trò Chơi',
    icon: '🎮',
    desc: `${GAMES_CATALOG.length} trò vui`,
    gradient: 'from-purple-500 to-indigo-600',
    border: 'border-purple-300',
  },
  {
    screen: 'reading_fluency',
    label: 'Luyện Đọc',
    icon: '📖',
    desc: 'Đọc fluently',
    gradient: 'from-sky-500 to-cyan-600',
    border: 'border-sky-300',
  },
  {
    screen: 'weekly_challenge',
    label: 'Thử Thách Tuần',
    icon: '🌟',
    desc: 'Nhận cúp danh dự',
    gradient: 'from-rose-500 to-pink-600',
    border: 'border-rose-300',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onNavigate,
  onSelectSubject,
  onOpenGames,
  onOpenDailyReview,
  onOpenWeeklyChallenge,
  onProfileUpdate,
}) => {
  const [quests, setQuests] = useState<DailyQuest[]>(StorageService.getDailyQuests());
  const [reading, setReading] = useState<ReadingProfile>(() => StorageService.getReadingProfile());
  const [chestClaimed, setChestClaimed] = useState(
    profile.dailyChestClaimedDate === localDateKey()
  );
  const [nextBestAction, setNextBestAction] = useState<DecisionRecommendation | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(true);

  const completedQuestsCount = quests.filter((q) => q.completed).length;
  const canClaimChest = completedQuestsCount >= 3 && !chestClaimed;

  const handleClaimChest = useCallback(() => {
    if (!canClaimChest) return;
    sound.playLevelUp();
    fireCelebrationConfetti();
    const freshProfile = StorageService.getChildProfile();
    const updated = {
      ...freshProfile,
      stars: freshProfile.stars + 10,
      xp: freshProfile.xp + 50,
      dailyChestClaimedDate: localDateKey(),
    };
    StorageService.saveChildProfile(updated);
    setChestClaimed(true);
    onProfileUpdate();
    sound.speak('Bé đã mở rương kho báu thành công! Nhận thêm mười sao vàng!');
  }, [canClaimChest, onProfileUpdate]);

  const playWelcomeVoice = useCallback(() => {
    sound.speak(`Xin chào ${profile.name}! Hôm nay mình tìm kho báu nào nào?`);
  }, [profile.name]);

  // Load next best action from DecisionEngine (async, non-blocking)
  useEffect(() => {
    let live = true;
    import('../../services/decisionEngine')
      .then((m) => {
        if (!live) return;
        try {
          const decision = m.DecisionEngine.decide();
          if (decision.nextBestAction) {
            setNextBestAction(decision.nextBestAction);
          }
        } catch {
          // Silently fail — the card is a recommendation, never a blocker
        } finally {
          setDecisionLoading(false);
        }
      })
      .catch(() => {
        if (live) setDecisionLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const handleNextBestAction = useCallback(() => {
    if (!nextBestAction?.launchRoute) return;
    sound.playClick();
    onNavigate(nextBestAction.launchRoute);
  }, [nextBestAction, onNavigate]);

  const handleShortcutClick = useCallback((screen: ActiveScreen) => {
    sound.playClick();
    onNavigate(screen);
  }, [onNavigate]);

  const handleSubjectClick = useCallback((subject: SubjectCard) => {
    if (subject.locked || !subject.subjectType) {
      sound.speak('Môn học này sắp mở. Bé hãy kiên nhẫn chờ nhé!');
      return;
    }
    sound.playClick();
    onSelectSubject(subject.subjectType);
  }, [onSelectSubject]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 space-y-6 select-none">
      {/* 1. HERO: Gấu Bút Chì (wave) + greeting bubble + 3 pills */}
      <div className="relative animate-gradient kb-hero-pattern bg-gradient-to-r from-amber-700 via-orange-700 to-rose-700 rounded-3xl p-5 md:p-6 shadow-xl text-white overflow-hidden border-4 border-amber-200">
        {/* Background decorative shapes */}
        <div className="absolute top-2 right-4 text-6xl opacity-20 pointer-events-none animate-pulse-slow">✨</div>
        <div className="absolute -bottom-4 -left-4 text-8xl opacity-15 pointer-events-none">⭐</div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Left: Mascot + Greeting + Stats */}
          <div className="flex flex-col min-[340px]:flex-row items-center gap-4 md:gap-5 text-center min-[340px]:text-left md:text-left">
            {/* Mascot Avatar with wave pose */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/95 rounded-3xl shadow-xl flex items-center justify-center text-6xl md:text-7xl border-4 border-amber-200 animate-float">
                {profile.avatarBase === 'bear' ? '🐻' : profile.avatarBase === 'fox' ? '🦊' : '🐰'}
              </div>
              {/* Wave animation indicator */}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs animate-bounce" aria-hidden="true">👋</span>
              <span className="absolute -top-1 -left-1 px-2 py-0.5 bg-amber-900 text-amber-100 text-[9px] font-black rounded-full shadow-sm">
                Lớp 1
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white drop-shadow-sm">
                  Chào {profile.name}! 👋
                </h1>
                <KidButton
                  variant="secondary"
                  size="md"
                  className="min-w-[44px] min-h-[44px]"
                  onClick={playWelcomeVoice}
                  aria-label="Nghe lời chào"
                  leftIcon="🔊"
                />
              </div>

              <p className="text-amber-50 text-xs md:text-sm font-bold mt-1 max-w-md">
                Hôm nay mình tìm kho báu nào nào?
              </p>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center md:justify-start">
                <Pill variant="star" size="sm" icon="⭐">
                  <span className="tabular-nums">{profile.stars}</span> Sao
                </Pill>
                <Pill variant="streak" size="sm" icon="🔥">
                  Chuỗi <span className="tabular-nums">{profile.streak}</span> ngày
                </Pill>
                <Pill variant="ticket" size="sm" icon="🎟️">
                  <span className="tabular-nums">{profile.tickets}</span> Vé
                </Pill>
              </div>
            </div>
          </div>

          {/* Right: Giant "Học tiếp" button */}
          <div className="w-full md:w-auto shrink-0 flex flex-col items-stretch md:items-end gap-2">
            <KidButton
              variant="primary"
              size="xl"
              fullWidth={false}
              className="min-h-[56px] md:min-h-[60px] min-w-[200px] text-base md:text-lg font-black gap-2 animate-pulse-subtle"
              onClick={handleNextBestAction}
              disabled={decisionLoading || !nextBestAction?.launchRoute}
              rightIcon={<ArrowRight className="w-6 h-6" />}
              aria-label={nextBestAction ? `Bắt đầu: ${nextBestAction.title}` : 'Đang tải gợi ý...'}
            >
              {decisionLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Đang tải...
                </span>
              ) : nextBestAction ? (
                <>
                  ▶ {nextBestAction.title}
                </>
              ) : (
                'Học tiếp'
              )}
            </KidButton>
            {/* "Vì sao?" link to Parent Dashboard */}
            {nextBestAction && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('home'); // Parent modal will be opened from header
                }}
                className="text-xs md:text-sm font-bold text-amber-100 hover:text-white underline underline-offset-2"
                aria-label="Xem lý do gợi ý này ở Bảng Phụ Huynh"
              >
                Vì sao gợi ý này?
              </button>
            )}
            {decisionLoading && (
              <p className="text-amber-50 text-[11px] font-medium text-center md:text-right">
                Đang tìm hoạt động tốt nhất cho bé...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. 4 SUBJECT CARDS with progress rings */}
      <div>
        <SectionTitle icon="🎯" size="lg">
          Hôm Nay Bé Học Gì?
        </SectionTitle>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {SUBJECT_CARDS.map((subject) => (
            <KidButton
              key={subject.id}
              variant={subject.variant}
              size="lg"
              fullWidth
              className={`min-h-[140px] md:min-h-[150px] text-left justify-between flex flex-col p-4 ${
                subject.locked ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={() => handleSubjectClick(subject)}
              disabled={subject.locked}
              aria-disabled={subject.locked}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/80">
                    Môn Học Lớp 1
                  </span>
                  <h3 className="text-xl font-black font-display mt-0.5 flex items-center gap-1.5">
                    {subject.title}
                    {subject.locked && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">🔒 Sắp mở</span>
                    )}
                  </h3>
                </div>
                <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform shrink-0">{subject.icon}</span>
              </div>

              <div className="mt-auto pt-2">
                <p className="text-[11px] text-white/90 font-bold mb-2">{subject.subtitle}</p>
                {/* Progress ring placeholder */}
                <div className="flex items-center gap-2">
                  <div className="relative w-14 h-14 flex-shrink-0" aria-hidden="true">
                    <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 28 28">
                      <circle
                        cx="14"
                        cy="14"
                        r="12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeOpacity="0.2"
                      />
                      <circle
                        cx="14"
                        cy="14"
                        r="12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeDasharray="75.4"
                        strokeDashoffset="37.7"
                        strokeLinecap="round"
                        className="text-white"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                      50%
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: '50%' }}
                      />
                    </div>
                    <p className="text-[10px] text-white/80 font-bold mt-1">Tiến độ: 50%</p>
                  </div>
                </div>
              </div>
            </KidButton>
          ))}
        </div>
      </div>

      {/* 3. "NHIỆM VỤ HÔM NAY" - 3 round quest icons + treasure chest */}
      <KidCard subjectBorder="none" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <SectionTitle icon="🎯" size="md" className="mb-0">
              Nhiệm Vụ Hôm Nay
            </SectionTitle>
            <p className="text-xs text-slate-500 font-bold">
              Hoàn thành 3 nhiệm vụ để mở Rương Kho Báu (+10 Sao, +50 XP)!
            </p>
          </div>

          {/* Treasure chest button */}
          <KidButton
            variant={chestClaimed ? 'secondary' : canClaimChest ? 'primary' : 'secondary'}
            size="md"
            disabled={!canClaimChest && chestClaimed}
            className={`min-h-[44px] ${chestClaimed ? '' : canClaimChest ? 'animate-bounce' : 'opacity-60 cursor-not-allowed'}`}
            leftIcon={<Gift className="w-5 h-5" />}
            onClick={handleClaimChest}
          >
            {chestClaimed
              ? 'Đã Nhận Rương'
              : canClaimChest
              ? 'Mở Rương Kho Báu!'
              : `Mở Rương (${completedQuestsCount}/3)`}
          </KidButton>
        </div>

        {/* Quest icons row - exactly 3 round icons */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          {quests.slice(0, 3).map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {}}
              disabled={q.completed}
              className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 transition-all ${
                q.completed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 cursor-default'
                  : 'bg-amber-50 border-amber-200 text-slate-700 hover:border-amber-400 hover:shadow-md cursor-pointer'
              }`}
              aria-label={q.completed ? `Nhiệm vụ ${idx + 1}: ${q.title} - đã hoàn thành` : `Nhiệm vụ ${idx + 1}: ${q.title}`}
            >
              <span className="text-3xl md:text-4xl" aria-hidden="true">
                {q.completed ? '✅' : idx === 0 ? '📚' : idx === 1 ? '🎮' : '📖'}
              </span>
              <span className="text-[10px] md:text-[11px] font-black text-center leading-tight px-1">
                {q.title.length > 10 ? q.title.slice(0, 10) + '…' : q.title}
              </span>
              <Pill variant="star" size="xs" className="absolute -top-1 -right-1">
                <span className="text-[9px]">+{q.rewardStars}</span>
              </Pill>
            </button>
          ))}
          {/* Treasure chest as 4th item when all 3 done or always show */}
          <button
            onClick={handleClaimChest}
            disabled={!canClaimChest || chestClaimed}
            className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 transition-all ${
              chestClaimed
                ? 'bg-amber-50 border-amber-200 text-slate-500 cursor-default'
                : canClaimChest
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-white animate-bounce cursor-pointer shadow-lg hover:shadow-xl'
                : 'bg-amber-50 border-amber-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
            aria-label={chestClaimed ? 'Rương kho báu đã nhận hôm nay' : canClaimChest ? 'Mở rương kho báu nhận thưởng' : `Rương kho báu - cần ${3 - completedQuestsCount} nhiệm vụ nữa`}
          >
            <span className="text-3xl md:text-4xl" aria-hidden="true">
              {chestClaimed ? '🎁' : canClaimChest ? '🧨' : '🔒'}
            </span>
            <span className="text-[10px] md:text-[11px] font-black text-center leading-tight px-1">
              {chestClaimed ? 'Đã mở' : 'Rương'}
            </span>
            {!chestClaimed && canClaimChest && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[9px] font-black animate-pulse">
                +
              </span>
            )}
          </button>
        </div>
      </KidCard>

      {/* 4. HORIZONTAL 3 SHORTCUTS: Trò chơi · Luyện đọc · Thử thách tuần */}
      <div>
        <SectionTitle icon="⚡" size="md">
          Lối Tắt Nhanh
        </SectionTitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {SHORTCUT_CARDS.map((shortcut) => (
            <KidButton
              key={shortcut.screen}
              variant="primary"
              size="md"
              fullWidth
              className={`min-h-[100px] text-center justify-center p-3 bg-gradient-to-br ${shortcut.gradient} ${shortcut.border} border-3 hover:scale-[1.02] active:scale-95 text-white`}
              onClick={() => handleShortcutClick(shortcut.screen)}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-3xl md:text-4xl">{shortcut.icon}</span>
                <h4 className="font-black text-sm md:text-base font-display">{shortcut.label}</h4>
                <p className="text-[11px] font-semibold opacity-90">{shortcut.desc}</p>
              </div>
            </KidButton>
          ))}
        </div>
      </div>

      {/* 5. NEXT BEST ACTION CARD (from DecisionEngine) - compact version for Home */}
      <NextBestActionCard onNavigate={onNavigate} />

      {/* 6. DAILY QUESTS LIST (compact, below the fold on mobile) */}
      <KidCard subjectBorder="none" className="space-y-3">
        <SectionTitle icon="📋" size="md">
          Danh Sách Nhiệm Vụ
        </SectionTitle>
        <div className="space-y-2">
          {quests.map((q) => (
            <div
              key={q.id}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                q.completed
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/40 border-amber-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    q.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {q.completed ? <Check className="w-4 h-4" /> : '•'}
                </div>
                <span className="text-xs font-bold">{q.title}</span>
              </div>

              <Pill variant="star" size="sm" className="gap-1">
                <span>+{q.rewardStars}</span>
              </Pill>
            </div>
          ))}
        </div>
      </KidCard>
    </div>
  );
};