import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ActiveScreen, ChildProfile, SubjectType } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { HomeScreen } from './components/home/HomeScreen';
import { WorldMapScreen } from './components/world/WorldMapScreen';
import { SubjectScreen } from './components/subject/SubjectScreen';
import { DailyReviewScreen } from './components/review/DailyReviewScreen';

/**
 * CODE SPLITTING (P31)
 *
 * The home, map and subject screens are the first paint and stay in the main
 * chunk. Everything a child reaches later (14 mini-games, the competition hub,
 * reading fluency, parent mode, shops) is loaded on demand so first render does
 * not pay for the whole app.
 */
const GamesHubScreen = lazy(() =>
  import('./components/games/GamesHubScreen').then((m) => ({ default: m.GamesHubScreen }))
);
const WeeklyChallengeScreen = lazy(() =>
  import('./components/challenge/WeeklyChallengeScreen').then((m) => ({ default: m.WeeklyChallengeScreen }))
);
const AchievementsGardenScreen = lazy(() =>
  import('./components/achievements/AchievementsGardenScreen').then((m) => ({ default: m.AchievementsGardenScreen }))
);
const AvatarShopScreen = lazy(() =>
  import('./components/shop/AvatarShopScreen').then((m) => ({ default: m.AvatarShopScreen }))
);
const CompetitionHubScreen = lazy(() =>
  import('./components/competition/CompetitionHubScreen').then((m) => ({ default: m.CompetitionHubScreen }))
);
const ReadingFluencyScreen = lazy(() =>
  import('./components/reading/ReadingFluencyScreen').then((m) => ({ default: m.ReadingFluencyScreen }))
);
/** Kid's Box Companion (British English) — loaded on demand like the other tracks. */
const KidBoxCompanionScreen = lazy(() =>
  import('./components/english/KidBoxCompanionScreen').then((m) => ({ default: m.KidBoxCompanionScreen }))
);
const ParentDashboardModal = lazy(() =>
  import('./components/parent/ParentDashboardModal').then((m) => ({ default: m.ParentDashboardModal }))
);
const ScreenTimeModal = lazy(() =>
  import('./components/parent/ScreenTimeModal').then((m) => ({ default: m.ScreenTimeModal }))
);
const UpdateBanner = lazy(() =>
  import('./components/system/UpdateBanner').then((m) => ({ default: m.UpdateBanner }))
);

/** Accessible loading state for lazily loaded screens. */
const ScreenFallback: React.FC<{ label: string }> = ({ label }) => (
  <div
    role="status"
    aria-live="polite"
    className="w-full max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-3 text-center"
  >
    <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-2xl">
      📚
    </div>
    <p className="text-sm font-bold text-slate-600">Đang mở {label}…</p>
  </div>
);

/** Quick-access destinations for the sticky bottom navigation bar. */
const BOTTOM_NAV: { screen: ActiveScreen; label: string; shortLabel: string; icon: string }[] = [
  { screen: 'home', label: 'Trang Chủ', shortLabel: 'Trang Chủ', icon: '🏠' },
  { screen: 'world_map', label: 'Bản Đồ', shortLabel: 'Bản Đồ', icon: '🗺️' },
  { screen: 'reading_fluency', label: 'Luyện Đọc', shortLabel: 'L.Đọc', icon: '📖' },
  { screen: 'competition', label: 'Đấu Trường', shortLabel: 'Đ.Trường', icon: '🏆' },
  { screen: 'games', label: 'Trò Chơi', shortLabel: 'T.Chơi', icon: '🎮' },
  { screen: 'daily_review', label: 'Ôn Tập', shortLabel: 'Ôn Tập', icon: '💡' },
  { screen: 'achievements', label: 'Vườn Sao', shortLabel: 'V.Sao', icon: '🌳' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('tieng-viet');
  const [profile, setProfile] = useState<ChildProfile>(StorageService.getChildProfile());

  // Parent modal state
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);

  // Screen time tracking
  const [isScreenTimeAlertOpen, setIsScreenTimeAlertOpen] = useState(false);
  const [minutesSpentToday, setMinutesSpentToday] = useState(
    StorageService.getAnalytics().minutesToday
  );

  // Screen time interval tracker (1 min ticks)
  useEffect(() => {
    const timer = setInterval(() => {
      StorageService.addMinutesSpent(1);
      const analytics = StorageService.getAnalytics();
      const settings = StorageService.getParentSettings();
      setMinutesSpentToday(analytics.minutesToday);

      if (
        settings.dailyLimitMinutes > 0 &&
        analytics.minutesToday >= settings.dailyLimitMinutes &&
        !isScreenTimeAlertOpen
      ) {
        setIsScreenTimeAlertOpen(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [isScreenTimeAlertOpen]);

  const refreshProfile = () => {
    setProfile(StorageService.getChildProfile());
  };

  const handleSelectSubject = (sub: SubjectType) => {
    setSelectedSubject(sub);
    setCurrentScreen('subject');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-100/40 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        profile={profile}
        onOpenParent={() => setIsParentModalOpen(true)}
        onOpenShop={() => setCurrentScreen('avatar_shop')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16 md:pb-6">
        {currentScreen === 'home' && (
          <HomeScreen
            profile={profile}
            onNavigate={setCurrentScreen}
            onSelectSubject={handleSelectSubject}
            onOpenGames={() => setCurrentScreen('games')}
            onOpenDailyReview={() => setCurrentScreen('daily_review')}
            onOpenWeeklyChallenge={() => setCurrentScreen('weekly_challenge')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'world_map' && (
          <WorldMapScreen
            onNavigate={setCurrentScreen}
            onSelectSubject={handleSelectSubject}
          />
        )}

        {currentScreen === 'subject' && (
          <SubjectScreen
            subject={selectedSubject}
            onBack={() => setCurrentScreen('world_map')}
            onProfileUpdate={refreshProfile}
            onOpenKidBox={() => setCurrentScreen('kidbox_companion')}
          />
        )}

        {currentScreen === 'kidbox_companion' && (
          <Suspense fallback={<ScreenFallback label="Kid's Box Companion" />}>
            <KidBoxCompanionScreen
              onBack={() => setCurrentScreen('subject')}
              onOpenParentMode={() => setIsParentModalOpen(true)}
            />
          </Suspense>
        )}

        {currentScreen === 'games' && (
          <Suspense fallback={<ScreenFallback label="Khu Trò Chơi" />}>
            <GamesHubScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}

        {currentScreen === 'daily_review' && (
          <DailyReviewScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'reading_fluency' && (
          <Suspense fallback={<ScreenFallback label="chuyên đề Luyện Đọc" />}>
            <ReadingFluencyScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}

        {currentScreen === 'weekly_challenge' && (
          <Suspense fallback={<ScreenFallback label="Thử Thách Tuần" />}>
            <WeeklyChallengeScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}

        {currentScreen === 'competition' && (
          <Suspense fallback={<ScreenFallback label="Đấu Trường" />}>
            <CompetitionHubScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}

        {currentScreen === 'achievements' && (
          <Suspense fallback={<ScreenFallback label="Vườn Sao" />}>
            <AchievementsGardenScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}

        {currentScreen === 'avatar_shop' && (
          <Suspense fallback={<ScreenFallback label="Tủ Đồ" />}>
            <AvatarShopScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}
      </main>

      {/*
        T01/B11 — sticky bottom nav ONLY below lg (1024px). At lg+ the Header
        top nav is the single navigation. 7 compact tabs fit 375px without
        clipping: flex-1 + min-w-0, short labels, 44px+ touch targets.
      */}
      <nav
        aria-label="Điều hướng nhanh"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-amber-200 flex items-stretch gap-0.5 px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] z-30 shadow-lg"
      >
        {BOTTOM_NAV.map((tab) => (
          <button
            key={tab.screen}
            onClick={() => setCurrentScreen(tab.screen)}
            aria-current={currentScreen === tab.screen ? 'page' : undefined}
            title={tab.label}
            className={`flex-1 min-w-0 min-h-[48px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold rounded-xl transition-all px-0.5 ${
              currentScreen === tab.screen
                ? 'text-amber-600 font-black bg-amber-50'
                : 'text-slate-500'
            }`}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="truncate max-w-full leading-tight">{tab.shortLabel}</span>
          </button>
        ))}
      </nav>

      {/* Parent Dashboard Modal */}
      <Suspense fallback={null}>
        <ParentDashboardModal
          isOpen={isParentModalOpen}
          onClose={() => setIsParentModalOpen(false)}
          onDataReset={refreshProfile}
        />
      </Suspense>

      {/* Service-worker update notice (§11): reload offered, never forced. */}
      <Suspense fallback={null}>
        <UpdateBanner />
      </Suspense>

      {/* Daily Screen Time Break Reminder Modal */}
      <Suspense fallback={null}>
        <ScreenTimeModal
          isOpen={isScreenTimeAlertOpen}
          minutesSpent={minutesSpentToday}
          onTakeBreak={() => setIsScreenTimeAlertOpen(false)}
          onExtend={() => {
            setIsScreenTimeAlertOpen(false);
            // Allow extra 10 minutes
            const settings = StorageService.getParentSettings();
            StorageService.saveParentSettings({
              ...settings,
              dailyLimitMinutes: settings.dailyLimitMinutes + 10,
            });
          }}
        />
      </Suspense>
    </div>
  );
}
