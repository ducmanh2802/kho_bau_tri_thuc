import React, { useState, useEffect } from 'react';
import { ActiveScreen, ChildProfile, SubjectType } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { HomeScreen } from './components/home/HomeScreen';
import { WorldMapScreen } from './components/world/WorldMapScreen';
import { SubjectScreen } from './components/subject/SubjectScreen';
import { GamesHubScreen } from './components/games/GamesHubScreen';
import { DailyReviewScreen } from './components/review/DailyReviewScreen';
import { WeeklyChallengeScreen } from './components/challenge/WeeklyChallengeScreen';
import { AchievementsGardenScreen } from './components/achievements/AchievementsGardenScreen';
import { AvatarShopScreen } from './components/shop/AvatarShopScreen';
import { CompetitionHubScreen } from './components/competition/CompetitionHubScreen';
import { ParentDashboardModal } from './components/parent/ParentDashboardModal';
import { ScreenTimeModal } from './components/parent/ScreenTimeModal';

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
          />
        )}

        {currentScreen === 'games' && (
          <GamesHubScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'daily_review' && (
          <DailyReviewScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'weekly_challenge' && (
          <WeeklyChallengeScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'competition' && (
          <CompetitionHubScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'achievements' && (
          <AchievementsGardenScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentScreen === 'avatar_shop' && (
          <AvatarShopScreen
            onBack={() => setCurrentScreen('home')}
            onProfileUpdate={refreshProfile}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb-friendly for kids on tablet/mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-amber-200 py-2 px-4 flex items-center justify-around z-30 shadow-lg">
        {[
          { screen: 'home' as ActiveScreen, label: 'Trang Chủ', icon: '🏠' },
          { screen: 'world_map' as ActiveScreen, label: 'Bản Đồ', icon: '🗺️' },
          { screen: 'games' as ActiveScreen, label: 'Trò Chơi', icon: '🎮' },
          { screen: 'daily_review' as ActiveScreen, label: 'Ôn Tập', icon: '💡' },
          { screen: 'achievements' as ActiveScreen, label: 'Vườn Sao', icon: '🌳' },
        ].map((tab) => (
          <button
            key={tab.screen}
            onClick={() => setCurrentScreen(tab.screen)}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold py-1 px-2 rounded-xl transition-all ${
              currentScreen === tab.screen
                ? 'text-amber-600 font-black scale-105'
                : 'text-slate-500'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Parent Dashboard Modal */}
      <ParentDashboardModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        onDataReset={refreshProfile}
      />

      {/* Daily Screen Time Break Reminder Modal */}
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
    </div>
  );
}
