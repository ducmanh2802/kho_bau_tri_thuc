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

  const navItems: { screen: ActiveScreen; label: string; icon: string }[] = [
    { screen: 'home', label: 'Trang Chủ', icon: '🏠' },
    { screen: 'world_map', label: 'Bản Đồ', icon: '🗺️' },
    { screen: 'games', label: 'Trò Chơi', icon: '🎮' },
    { screen: 'daily_review', label: 'Ôn Tập', icon: '💡' },
    { screen: 'achievements', label: 'Vườn Sao', icon: '🌳' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🐻</span>
          <span className="text-lg md:text-xl font-black text-amber-950 tracking-tight font-display">
            Kho Báu Tri Thức
          </span>
        </button>

        {/* Zone 2: Clean 4-6 navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => {
                sound.playClick();
                onNavigate(item.screen);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                currentScreen === item.screen
                  ? 'bg-amber-100 text-amber-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-amber-950 hover:bg-amber-50/60'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions & kid profile stats */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Streak indicator */}
          <div
            title={`Chuỗi học ${profile.streak} ngày liên tiếp`}
            className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-black text-orange-700"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span className="tabular-nums">{profile.streak}</span>
          </div>

          {/* Stars indicator */}
          <div
            title={`Tổng số sao: ${profile.stars}`}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-black text-amber-700"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="tabular-nums">{profile.stars}</span>
          </div>

          {/* XP counter */}
          <div
            title={`Điểm kinh nghiệm: ${profile.xp} XP`}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-black text-purple-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="tabular-nums">{profile.xp} XP</span>
          </div>

          {/* Avatar Shop Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            title="Tủ đồ thời trang & Linh thú"
            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-transform active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Parent Mode Gate button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenParent();
            }}
            title="Dành cho Ba Mẹ"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ba Mẹ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
