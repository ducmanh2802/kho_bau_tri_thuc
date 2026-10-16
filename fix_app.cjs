const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace world_map
content = content.replace(
  '{currentScreen === "world_map" && (\n          <WorldMapScreen\n            onNavigate={setCurrentScreen}\n            onSelectSubject={handleSelectSubject}\n          />\n        )}',
  '{currentScreen === "world_map" && (\n          <Suspense fallback={<ScreenFallback label="Bản đồ thế giới" />}>\n            <WorldMapScreen\n              onNavigate={setCurrentScreen}\n              onSelectSubject={handleSelectSubject}\n            />\n          </Suspense>\n        )}'
);

// Replace subject
content = content.replace(
  '{currentScreen === "subject" && (\n          <SubjectScreen\n            subject={selectedSubject}\n            onBack={() => setCurrentScreen("world_map")}\n            onProfileUpdate={refreshProfile}\n            onOpenKidBox={() => setCurrentScreen("kidbox_companion")}\n          />\n        )}',
  '{currentScreen === "subject" && (\n          <Suspense fallback={<ScreenFallback label="Màn hình bài học" />}>\n            <SubjectScreen\n              subject={selectedSubject}\n              onBack={() => setCurrentScreen("world_map")}\n              onProfileUpdate={refreshProfile}\n              onOpenKidBox={() => setCurrentScreen("kidbox_companion")}\n            />\n          </Suspense>\n        )}'
);

// Replace daily_review
content = content.replace(
  '{currentScreen === "daily_review" && (\n          <DailyReviewScreen\n            onBack={() => setCurrentScreen("home")}\n            onProfileUpdate={refreshProfile}\n          />\n        )}',
  '{currentScreen === "daily_review" && (\n          <Suspense fallback={<ScreenFallback label="Ôn tập hàng ngày" />}>\n            <DailyReviewScreen\n              onBack={() => setCurrentScreen("home")}\n              onProfileUpdate={refreshProfile}\n            />\n          </Suspense>\n        )}'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Done');