import React from 'react';
import { ActiveScreen, ChildProfile } from '../../types';
import { sound } from '../../services/sound';
import { Star, Sparkles, Flame, Volume2, VolumeX, Shield, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  profile: ChildProfile;
  onOpenParent: () => void;
  onOpenShop: () => void;
}

type NavEntry = { screen: ActiveScreen; label: string; icon: string };

const NavLink: React.FC<{
  item: NavEntry;
  current: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}> = ({ item, current, onNavigate }) => (
  <button
    onClick={() => {
      sound.playClick();
      onNavigate(item.screen);
    }}
    aria-current={current === item.screen ? 'page' : undefined}
    className={`min-h-[44px] px-3 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
      current === item.screen
        ? 'bg-amber-100 text-amber-950 font-black shadow-xs'
        : 'text-slate-600 hover:text-amber-950 hover:bg-amber-50/60'
    }`}
  >
    <span aria-hidden="true">{item.icon}</span>
    <span>{item.label}</span>
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  profile,
  onOpenParent,
  onOpenShop,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playClick();
  };

  const navItems: NavEntry[] = [
    { screen: 'home', label: 'Trang Chủ', icon: '🏠' },
    { screen: 'world_map', label: 'Bản Đồ', icon: '🗺️' },
    { screen: 'reading_fluency', label: 'Luyện Đọc', icon: '📖' },
    { screen: 'competition', label: 'Đấu Trường', icon: '🏆' },
    { screen: 'games', label: 'Trò Chơi', icon: '🎮' },
    { screen: 'daily_review', label: 'Ôn Tập', icon: '💡' },
    { screen: 'achievements', label: 'Vườn Sao', icon: '🌳' },
  ];

  /** Subset that provably fits beside the action pills at the xl breakpoint. */
  const PRIMARY_NAV: NavEntry[] = navItems.filter((n) =>
    ['home', 'reading_fluency', 'competition', 'daily_review'].includes(n.screen)
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2 text-left cursor-pointer group shrink-0 min-w-0 min-w-[44px] min-h-[44px] justify-center sm:justify-start"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
            🐻
          </span>
          <span className="hidden sm:inline text-lg xl:text-xl font-black text-amber-950 tracking-tight font-display truncate">
            Kho Báu Tri Thức
          </span>
          <span className="sm:hidden sr-only">Kho Báu Tri Thức — Về trang chủ</span>
        </button>

        {/*
          Zone 2: navigation.
          Seven links plus the action pills cannot share one row below 2xl, so
          xl shows the four primary destinations and the sticky bottom bar
          carries the full set until 2xl.
        */}
        <nav aria-label="Điều hướng chính" className="hidden xl:flex 2xl:hidden items-center gap-1">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.screen} item={item} current={currentScreen} onNavigate={onNavigate} />
          ))}
        </nav>
        <nav aria-label="Điều hướng chính (đầy đủ)" className="hidden 2xl:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.screen} item={item} current={currentScreen} onNavigate={onNavigate} />
          ))}
        </nav>

        {/* Zone 3: primary actions & kid profile stats */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* Streak indicator */}
          <div
            title={`Chuỗi học ${profile.streak} ngày liên tiếp`}
            className="hidden md:flex items-center gap-1 px-2.5 min-h-[36px] bg-orange-50 border border-orange-200 rounded-full text-xs font-black text-orange-700"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" aria-hidden="true" />
            <span className="tabular-nums">{profile.streak}</span>
            <span className="sr-only">ngày liên tiếp</span>
          </div>

          {/* Stars indicator */}
          <div
            title={`Tổng số sao: ${profile.stars}`}
            className="hidden sm:flex items-center gap-1 px-2.5 min-h-[36px] bg-amber-50 border border-amber-200 rounded-full text-xs font-black text-amber-700"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
            <span className="tabular-nums">{profile.stars}</span>
            <span className="sr-only">ngôi sao</span>
          </div>

          {/* XP counter */}
          <div
            title={`Điểm kinh nghiệm: ${profile.xp} XP`}
            className="hidden lg:flex items-center gap-1 px-2.5 min-h-[36px] bg-purple-50 border border-purple-200 rounded-full text-xs font-black text-purple-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
            <span className="tabular-nums">{profile.xp} XP</span>
          </div>

          {/* Avatar Shop Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            aria-label="Tủ đồ thời trang và Linh thú"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Sound Mute Toggle — hidden on extremely narrow widths (200% zoom):
              it duplicates the Parent Dashboard sound control and every game
              has its own mute toggle, so nothing becomes unreachable. */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-pressed={isMuted}
            className="min-w-[44px] min-h-[44px] max-[300px]:hidden items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-transform active:scale-95 cursor-pointer flex"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {/* Parent Mode Gate button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenParent();
            }}
            aria-label="Khu vực dành cho Ba Mẹ"
            className="min-h-[44px] min-w-[44px] px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span className="hidden lg:inline">Ba Mẹ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
