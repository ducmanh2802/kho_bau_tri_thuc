import React, { useState } from 'react';
import { ActiveScreen, ChildProfile, DailyQuest, SubjectType } from '../../types';
import { sound } from '../../services/sound';
import { fireCelebrationConfetti } from '../../services/confetti';
import { StorageService } from '../../services/storage';
import { Star, Sparkles, Gift, Check, ArrowRight } from 'lucide-react';

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
  const [chestClaimed, setChestClaimed] = useState(
    profile.dailyChestClaimedDate === new Date().toISOString().split('T')[0]
  );

  const completedQuestsCount = quests.filter((q) => q.completed).length;
  const canClaimChest = completedQuestsCount >= 3 && !chestClaimed;

  const handleClaimChest = () => {
    if (!canClaimChest) return;
    sound.playLevelUp();
    fireCelebrationConfetti();
    const updated = {
      ...profile,
      stars: profile.stars + 10,
      xp: profile.xp + 50,
      dailyChestClaimedDate: new Date().toISOString().split('T')[0],
    };
    StorageService.saveChildProfile(updated);
    setChestClaimed(true);
    onProfileUpdate();
    sound.speak('Bé đã mở rương kho báu thành công! Nhận thêm mười sao vàng!');
  };

  const playWelcomeVoice = () => {
    sound.speak(`Xin chào ${profile.name}! Hôm nay bé muốn học bài gì nào?`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 select-none">
      {/* Friendly Greeting & Mascot Hero Banner */}
      <div className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 md:p-8 shadow-xl text-white overflow-hidden border-4 border-amber-300">
        {/* Background shapes */}
        <div className="absolute top-2 right-4 text-7xl opacity-20 pointer-events-none">✨</div>
        <div className="absolute -bottom-6 -left-6 text-9xl opacity-15 pointer-events-none">⭐</div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
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
                <button
                  onClick={playWelcomeVoice}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white active:scale-95 transition-transform"
                  title="Nghe lời chào"
                >
                  🔊
                </button>
              </div>

              <p className="text-amber-100 text-xs md:text-sm font-bold mt-1 max-w-md">
                Hôm nay là một ngày tuyệt vời để khám phá thêm nhiều điều diệu kỳ!
              </p>

              {/* Stats pill */}
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black backdrop-blur-xs flex items-center gap-1">
                  ⭐ <span className="tabular-nums">{profile.stars}</span> Sao
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black backdrop-blur-xs flex items-center gap-1">
                  🔥 Chuỗi <span className="tabular-nums">{profile.streak}</span> ngày
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black backdrop-blur-xs flex items-center gap-1">
                  🎟️ <span className="tabular-nums">{profile.tickets}</span> Vé game
                </span>
              </div>
            </div>
          </div>

          {/* Quick World Map Button */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('world_map');
            }}
            className="w-full md:w-auto px-6 py-3.5 bg-white hover:bg-amber-50 text-amber-950 font-black rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer shrink-0 font-display"
          >
            <span>Bản Đồ Học Tập</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary Subjects Hub (Big, Friendly, Touch-First Cards) */}
      <div>
        <h2 className="text-lg md:text-xl font-black text-amber-950 mb-4 font-display flex items-center gap-2">
          <span>🎯</span> Hôm Nay Bé Học Gì?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Tiếng Việt */}
          <button
            onClick={() => {
              sound.playClick();
              onSelectSubject('tieng-viet');
            }}
            className="group relative bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left border-4 border-amber-300 flex flex-col justify-between min-h-[170px] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-amber-200">
                  Môn Học Lớp 1
                </span>
                <h3 className="text-2xl font-black font-display mt-0.5">Tiếng Việt</h3>
              </div>
              <span className="text-5xl group-hover:scale-110 transition-transform">📚</span>
            </div>

            <div>
              <p className="text-xs text-amber-100 font-bold mb-3">
                Chữ cái · Dấu thanh · Vần ghép · Đọc truyện ngắn
              </p>
              <div className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-center font-black text-xs md:text-sm tracking-wide">
                Bắt đầu học ➔
              </div>
            </div>
          </button>

          {/* Toán */}
          <button
            onClick={() => {
              sound.playClick();
              onSelectSubject('toan');
            }}
            className="group relative bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left border-4 border-blue-300 flex flex-col justify-between min-h-[170px] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-blue-200">
                  Môn Học Lớp 1
                </span>
                <h3 className="text-2xl font-black font-display mt-0.5">Toán Học</h3>
              </div>
              <span className="text-5xl group-hover:scale-110 transition-transform">🔢</span>
            </div>

            <div>
              <p className="text-xs text-blue-100 font-bold mb-3">
                Đếm số 0–20 · Phép cộng · Phép trừ · Hình học
              </p>
              <div className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-center font-black text-xs md:text-sm tracking-wide">
                Bắt đầu học ➔
              </div>
            </div>
          </button>

          {/* Tiếng Anh */}
          <button
            onClick={() => {
              sound.playClick();
              onSelectSubject('english');
            }}
            className="group relative bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left border-4 border-emerald-300 flex flex-col justify-between min-h-[170px] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-emerald-200">
                  Môn Học Lớp 1
                </span>
                <h3 className="text-2xl font-black font-display mt-0.5">Tiếng Anh</h3>
              </div>
              <span className="text-5xl group-hover:scale-110 transition-transform">🇬🇧</span>
            </div>

            <div>
              <p className="text-xs text-emerald-100 font-bold mb-3">
                ABC Phonics · Numbers · Colors · Animals
              </p>
              <div className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-center font-black text-xs md:text-sm tracking-wide">
                Bắt đầu học ➔
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Fast Action Row (Games, Daily Smart Review, Weekly Challenge) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Game Center */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenGames();
          }}
          className="p-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-3xl shadow-lg flex items-center justify-between transition-all hover:scale-102 active:scale-95 cursor-pointer border-3 border-purple-300"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎮</span>
            <div>
              <h4 className="font-black text-base md:text-lg font-display">Trung Tâm Game</h4>
              <p className="text-xs text-purple-200 font-semibold">10+ trò chơi thông minh</p>
            </div>
          </div>
          <span className="text-sm font-bold bg-white/20 px-3 py-1.5 rounded-xl">Chơi ngay</span>
        </button>

        {/* Daily Smart Review */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenDailyReview();
          }}
          className="p-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-3xl shadow-lg flex items-center justify-between transition-all hover:scale-102 active:scale-95 cursor-pointer border-3 border-amber-300"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">💡</span>
            <div>
              <h4 className="font-black text-base md:text-lg font-display">Ôn Tập Hôm Nay</h4>
              <p className="text-xs text-amber-900 font-semibold">Gợi ý câu hỏi cần nhớ</p>
            </div>
          </div>
          <span className="text-sm font-black bg-white/80 px-3 py-1.5 rounded-xl">Luyện tập</span>
        </button>

        {/* Weekly Challenge */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenWeeklyChallenge();
          }}
          className="p-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-3xl shadow-lg flex items-center justify-between transition-all hover:scale-102 active:scale-95 cursor-pointer border-3 border-rose-300"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <h4 className="font-black text-base md:text-lg font-display">Đấu Trường Tuần</h4>
              <p className="text-xs text-rose-200 font-semibold">Thử thách nhận cúp</p>
            </div>
          </div>
          <span className="text-sm font-bold bg-white/20 px-3 py-1.5 rounded-xl">Thi đấu</span>
        </button>
      </div>

      {/* Daily Quests & Treasure Chest */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-amber-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
          <div>
            <h3 className="text-lg font-black text-amber-950 font-display flex items-center gap-2">
              <span>🎯</span> Nhiệm Vụ Hôm Nay
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Hoàn thành 3 nhiệm vụ để mở Rương Kho Báu thần kỳ (+10 Sao, +50 XP)!
            </p>
          </div>

          {/* Treasure chest button */}
          <button
            onClick={handleClaimChest}
            disabled={!canClaimChest && chestClaimed}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all ${
              chestClaimed
                ? 'bg-slate-100 text-slate-400 cursor-default'
                : canClaimChest
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 shadow-md animate-bounce active:scale-95 cursor-pointer'
                : 'bg-amber-100/60 text-amber-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <Gift className="w-5 h-5 text-amber-600" />
            <span>
              {chestClaimed
                ? 'Đã Nhận Rương Hôm Nay'
                : canClaimChest
                ? 'Mở Rương Kho Báu!'
                : `Mở Rương (${completedQuestsCount}/3)`}
            </span>
          </button>
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

              <div className="flex items-center gap-1 text-[11px] font-black text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>+{q.rewardStars}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
