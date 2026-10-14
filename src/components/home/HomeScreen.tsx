import React, { useState } from 'react';
import { ActiveScreen, ChildProfile, DailyQuest, ReadingProfile, SubjectType } from '../../types';
import { sound } from '../../services/sound';
import { localDateKey } from '../../services/dateUtils';
import { fireCelebrationConfetti } from '../../services/confetti';
import { StorageService } from '../../services/storage';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { NextBestActionCard } from '../learning/NextBestActionCard';
import { Star, Sparkles, Gift, Check, ArrowRight, BookOpen } from 'lucide-react';
import { KidButton, KidCard, Pill, SectionTitle, ProgressStars } from '../ui';

interface HomeScreenProps {
  profile: ChildProfile;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectSubject: (sub: SubjectType) => void;
  onOpenGames: () => void;
  onOpenDailyReview: () => void;
  onOpenWeeklyChallenge: () => void;
  onProfileUpdate: () => void;
}

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

  const completedQuestsCount = quests.filter((q) => q.completed).length;
  const canClaimChest = completedQuestsCount >= 3 && !chestClaimed;

  const handleClaimChest = () => {
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
  };

  const playWelcomeVoice = () => {
    sound.speak(`Xin chào ${profile.name}! Hôm nay bé muốn học bài gì nào?`);
  };

  const subjectCards = [
    {
      id: 'tieng-viet' as SubjectType,
      title: 'Tiếng Việt',
      subtitle: 'Chữ cái · Dấu thanh · Vần ghép · Đọc truyện ngắn',
      emoji: '📚',
      gradient: 'from-amber-500 to-orange-500',
      border: 'border-amber-300',
      hoverShadow: 'hover:shadow-amber-500/40',
      variant: 'subject-viet' as const,
    },
    {
      id: 'toan' as SubjectType,
      title: 'Toán Học',
      subtitle: 'Đếm số 0–20 · Phép cộng · Phép trừ · Hình học',
      emoji: '🔢',
      gradient: 'from-blue-500 to-cyan-500',
      border: 'border-blue-300',
      hoverShadow: 'hover:shadow-blue-500/40',
      variant: 'subject-math' as const,
    },
    {
      id: 'english' as SubjectType,
      title: 'Tiếng Anh',
      subtitle: 'ABC Phonics · Numbers · Colors · Animals',
      emoji: '🇬🇧',
      gradient: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-300',
      hoverShadow: 'hover:shadow-emerald-500/40',
      variant: 'subject-english' as const,
    },
  ];

  const actionCards = [
    {
      label: 'Luyện Đọc',
      desc: `Chỉ số đọc: ${reading.readingIndex}/100`,
      emoji: '📖',
      gradient: 'from-sky-500 to-cyan-600',
      border: 'border-sky-300',
      pillText: 'Luyện',
      onClick: () => onNavigate('reading_fluency'),
    },
    {
      label: 'Đấu Trường',
      desc: 'Thi thử & Tốc độ',
      emoji: '🏆',
      gradient: 'from-amber-500 to-orange-600',
      border: 'border-amber-300',
      pillText: 'Vào thi',
      onClick: () => onNavigate('competition'),
    },
    {
      label: 'Khu Trò Chơi',
      desc: `${GAMES_CATALOG.length} mini-games vui • 6 màn/game`,
      emoji: '🎮',
      gradient: 'from-purple-500 to-indigo-600',
      border: 'border-purple-300',
      pillText: 'Chơi ngay',
      onClick: () => onOpenGames(),
    },
    {
      label: 'Ôn Tập Ngày',
      desc: 'Chống quên kiến thức',
      emoji: '💡',
      gradient: 'from-yellow-400 to-amber-500',
      border: 'border-amber-300',
      pillText: 'Ôn ngay',
      textColor: 'text-slate-950',
      onClick: () => onOpenDailyReview(),
    },
    {
      label: 'Thử Thách Tuần',
      desc: 'Nhận cúp danh dự',
      emoji: '🌟',
      gradient: 'from-rose-500 to-pink-600',
      border: 'border-rose-300',
      pillText: 'Thử sức',
      onClick: () => onOpenWeeklyChallenge(),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 select-none">
      {/* Friendly Greeting & Mascot Hero Banner */}
      {/*
        T01B/6 — chữ trắng ≥ 4,5:1: gradient đậm (amber-700/orange-700/rose-700,
        tương phản trắng 5,0–6,3:1) thay cho 400 (chỉ 1,7–2,7:1). Pill chuyển
        sang nền đen mờ để chữ trắng vẫn đạt chuẩn.
      */}
      <div className="relative animate-gradient kb-hero-pattern bg-gradient-to-r from-amber-700 via-orange-700 to-rose-700 rounded-3xl p-6 md:p-8 shadow-xl text-white overflow-hidden border-4 border-amber-200">
        {/* Background shapes */}
        <div className="absolute top-2 right-4 text-7xl opacity-20 pointer-events-none">✨</div>
        <div className="absolute -bottom-6 -left-6 text-9xl opacity-15 pointer-events-none">⭐</div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Stacks vertically on extremely narrow widths (200% zoom): the
              96px mascot plus a text-2xl greeting cannot share one 195px row. */}
          <div className="flex flex-col min-[340px]:flex-row items-center gap-4 md:gap-5 text-center min-[340px]:text-left md:text-left">
            {/* Mascot Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/95 rounded-3xl shadow-xl flex items-center justify-center text-5xl md:text-6xl border-4 border-amber-200 animate-float">
                {profile.avatarBase === 'bear' ? '🐻' : profile.avatarBase === 'fox' ? '🦊' : '🐰'}
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-amber-900 text-amber-100 text-[10px] font-black rounded-full shadow-sm">
                Lớp 1
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-4xl font-black font-display tracking-tight text-white drop-shadow-sm">
                  Xin chào {profile.name}! 👋
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
                Hôm nay là một ngày tuyệt vời để khám phá thêm nhiều điều diệu kỳ!
              </p>

              {/* Stats pill */}
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center md:justify-start">
                <Pill variant="star" size="sm" icon="⭐">
                  <span className="tabular-nums">{profile.stars}</span> Sao
                </Pill>
                <Pill variant="streak" size="sm" icon="🔥">
                  Chuỗi <span className="tabular-nums">{profile.streak}</span> ngày
                </Pill>
                <Pill variant="ticket" size="sm" icon="🎟️">
                  <span className="tabular-nums">{profile.tickets}</span> Vé game
                </Pill>
              </div>
            </div>
          </div>

          {/* Quick World Map Button */}
          <KidButton
            variant="secondary"
            size="lg"
            fullWidth={false}
            className="w-full md:w-auto shrink-0"
            onClick={() => {
              sound.playClick();
              onNavigate('world_map');
            }}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Bản Đồ Học Tập
          </KidButton>
        </div>
      </div>

      {/* Reading fluency headline — supportive, never negative (§8) */}
      <KidCard subjectBorder="none" className="bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-3xl shrink-0" aria-hidden="true">
            <BookOpen className="w-8 h-8 text-sky-600" />
          </span>
          <div className="flex-1">
            <p className="text-sm md:text-base font-black text-sky-950">{reading.headline}</p>
            <p className="text-xs text-sky-900 font-medium">{reading.encouragement}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-sky-200">
              <span className="block text-[10px] font-black text-sky-700">CHÍNH XÁC</span>
              <span className="text-base font-black text-sky-950 tabular-nums">{reading.accuracyIndex}%</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-sky-200">
              <span className="block text-[10px] font-black text-sky-700">HIỂU BÀI</span>
              <span className="text-base font-black text-sky-950 tabular-nums">
                {reading.comprehensionIndex}%
              </span>
            </div>
          </div>
        </div>
      </KidCard>

      {/* Primary Subjects Hub (Big, Friendly, Touch-First Cards) */}
      <div>
        <SectionTitle icon="🎯" size="lg">
          Hôm Nay Bé Học Gì?
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {subjectCards.map((subject) => (
            <KidButton
              key={subject.id}
              variant={subject.variant}
              size="lg"
              fullWidth
              className="min-h-[170px] text-left justify-between flex flex-col p-6"
              onClick={() => {
                sound.playClick();
                onSelectSubject(subject.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase font-black tracking-widest text-white/80">
                    Môn Học Lớp 1
                  </span>
                  <h3 className="text-2xl font-black font-display mt-0.5">{subject.title}</h3>
                </div>
                <span className="text-5xl group-hover:scale-110 transition-transform">{subject.emoji}</span>
              </div>

              <div>
                <p className="text-xs text-white/90 font-bold mb-3">{subject.subtitle}</p>
                <div className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-center font-black text-xs md:text-sm tracking-wide">
                  Bắt đầu học ➔
                </div>
              </div>
            </KidButton>
          ))}
        </div>
      </div>

      {/* Secondary Fast Action Row (Games, Daily Smart Review, Competition Arena, Weekly Challenge) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actionCards.map((action, idx) => (
          <KidButton
            key={idx}
            variant="primary"
            size="lg"
            fullWidth
            className={`min-h-[120px] text-left justify-between p-4 bg-gradient-to-br ${action.gradient} ${action.border} border-3 hover:scale-[1.02] active:scale-95 ${action.textColor || 'text-white'}`}
            onClick={() => {
              sound.playClick();
              action.onClick();
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{action.emoji}</span>
              <div className="text-left">
                <h4 className="font-black text-sm md:text-base font-display">{action.label}</h4>
                <p className="text-[11px] font-semibold opacity-90">{action.desc}</p>
              </div>
            </div>
            <Pill variant="default" size="sm" className="bg-white/20 shrink-0">
              {action.pillText}
            </Pill>
          </KidButton>
        ))}
      </div>

      {/* Evidence-driven "next best action" from the Learning OS */}
      <NextBestActionCard onNavigate={onNavigate} />

      {/* Daily Quests & Treasure Chest */}
      <KidCard subjectBorder="none" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
          <div>
            <SectionTitle icon="🎯" size="md" className="mb-0">
              Nhiệm Vụ Hôm Nay
            </SectionTitle>
            <p className="text-xs text-slate-500 font-bold">
              Hoàn thành 3 nhiệm vụ để mở Rương Kho Báu thần kỳ (+10 Sao, +50 XP)!
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
              ? 'Đã Nhận Rương Hôm Nay'
              : canClaimChest
              ? 'Mở Rương Kho Báu!'
              : `Mở Rương (${completedQuestsCount}/3)`}
          </KidButton>
        </div>

        {/* Quest List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {quests.map((q) => (
            <div
              key={q.id}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
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