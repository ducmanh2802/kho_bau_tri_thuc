import React from 'react';
import { ActiveScreen, ChildProfile } from '../../types';
import { sound } from '../../services/sound';
import { Star, Sparkles, Flame, Volume2, VolumeX, Shield, ShoppingBag } from 'lucide-react';
import { KidButton, Pill } from '../ui';

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
  /** T01B/3 — ở 1024–1280 chỉ hiện icon (vừa khít, không tràn). */
  iconOnly?: boolean;
}> = ({ item, current, onNavigate, iconOnly = false }) => (
  <button
    onClick={() => {
      sound.playClick();
      onNavigate(item.screen);
    }}
    aria-current={current === item.screen ? 'page' : undefined}
    // T01B/11 — QA hook thống nhất cho mọi mục điều hướng.
    data-testid={`nav-${item.screen}`}
    aria-label={item.label}
    title={item.label}
    className={`min-h-[44px] ${iconOnly ? 'min-w-[44px] px-2.5 justify-center' : 'px-3'} rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
      current === item.screen
        ? 'bg-amber-100 text-amber-950 font-black shadow-xs'
        : 'text-slate-600 hover:text-amber-950 hover:bg-amber-50/60'
    }`}
  >
    <span aria-hidden="true">{item.icon}</span>
    {iconOnly ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
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

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-kb-card)]/95 backdrop-blur-md border-b-2 border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single text element wordmark */}
        <KidButton
          variant="secondary"
          size="md"
          className="gap-2 text-left shrink-0 min-w-0 min-w-[44px] min-h-[44px] justify-center sm:justify-start"
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          aria-label="Về trang chủ"
        >
          <span className="text-2xl" aria-hidden="true">🐻</span>
          <span className="hidden sm:inline text-lg xl:text-xl font-black text-amber-950 tracking-tight font-display truncate">
            Kho Báu Tri Thức
          </span>
          <span className="sm:hidden sr-only">Kho Báu Tri Thức — Về trang chủ</span>
        </KidButton>

        {/*
          Zone 2: navigation (T01/B11 + T01B/3).
          >= 1024px (lg) only the top nav shows; < 1024px only the bottom nav
          shows (see App.tsx). lg–2xl shows ALL 7 destinations as ICON-ONLY
          (hover/title + aria-label giữ tên đầy đủ) so the bar provably fits
          1024/1280/1440; 2xl+ shows the full set with labels.
        */}
        <nav aria-label="Điều hướng chính" className="hidden lg:flex 2xl:hidden items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.screen} item={item} current={currentScreen} onNavigate={onNavigate} iconOnly />
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
          <Pill
            variant="streak"
            size="sm"
            icon={<Flame className="w-4 h-4 fill-orange-500 text-orange-500" aria-hidden="true" />}
            className="hidden md:flex"
          >
            <span className="tabular-nums">{profile.streak}</span>
            <span className="sr-only">ngày liên tiếp</span>
          </Pill>

          {/* Stars indicator */}
          <Pill
            variant="star"
            size="sm"
            icon={<Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />}
            className="hidden sm:flex"
          >
            <span className="tabular-nums">{profile.stars}</span>
            <span className="sr-only">ngôi sao</span>
          </Pill>

          {/* XP counter — T01B/3: chỉ hiện từ xl (1280+) để không tràn ở 1024 */}
          <Pill
            variant="level"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />}
            className="hidden xl:flex"
          >
            <span className="tabular-nums">{profile.xp} XP</span>
          </Pill>

          {/* Avatar Shop Button */}
          <KidButton
            variant="secondary"
            size="md"
            className="min-w-[44px] min-h-[44px] px-3"
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            aria-label="Tủ đồ thời trang và Linh thú"
            leftIcon={<ShoppingBag className="w-4 h-4" aria-hidden="true" />}
          />

          {/* Sound Mute Toggle — hidden on extremely narrow widths (200% zoom):
              it duplicates the Parent Dashboard sound control and every game
              has its own mute toggle, so nothing becomes unreachable. */}
          <KidButton
            variant="secondary"
            size="md"
            className="min-w-[44px] min-h-[44px] max-[300px]:hidden px-3"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-pressed={isMuted}
            leftIcon={isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
          />

          {/* Parent Mode Gate button */}
          <KidButton
            variant="primary"
            size="md"
            className="min-h-[44px] min-w-[44px] px-3"
            onClick={() => {
              sound.playClick();
              onOpenParent();
            }}
            aria-label="Khu vực dành cho Ba Mẹ"
            leftIcon={<Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />}
            rightIcon={<span className="hidden lg:inline">Ba Mẹ</span>}
          />
        </div>
      </div>
    </header>
  );
};