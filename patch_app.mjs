{currentScreen === 'world_map' && (
          <Suspense fallback={<ScreenFallback label="Bản đồ thế giới" />}>
            <WorldMapScreen
              onNavigate={setCurrentScreen}
              onSelectSubject={handleSelectSubject}
            />
          </Suspense>
        )}

        {currentScreen === 'subject' && (
          <Suspense fallback={<ScreenFallback label="Màn hình bài học" />}>
            <SubjectScreen
              subject={selectedSubject}
              onBack={() => setCurrentScreen('world_map')}
              onProfileUpdate={refreshProfile}
              onOpenKidBox={() => setCurrentScreen('kidbox_companion')}
            />
          </Suspense>
        )}

        {currentScreen === 'daily_review' && (
          <Suspense fallback={<ScreenFallback label="Ôn tập hàng ngày" />}>
            <DailyReviewScreen
              onBack={() => setCurrentScreen('home')}
              onProfileUpdate={refreshProfile}
            />
          </Suspense>
        )}