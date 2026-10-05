import React, { useState } from 'react';
import { sound } from '../../services/sound';
import { ArrowLeft, Play, Gamepad2 } from 'lucide-react';
import { CatchFallingLettersGame } from './CatchFallingLettersGame';
import { SyllableBuilderGame } from './SyllableBuilderGame';
import { RhymeHunterGame } from './RhymeHunterGame';
import { SentenceScrambleGame } from './SentenceScrambleGame';
import { ListenPickPhonicsGame } from './ListenPickPhonicsGame';
import { FallingNumbersMathGame } from './FallingNumbersMathGame';
import { MathSpeedRacingGame } from './MathSpeedRacingGame';
import { NumberTowerGame } from './NumberTowerGame';
import { OceanFishingGame } from './OceanFishingGame';
import { ShapeSortingGame } from './ShapeSortingGame';
import { EnglishAnimalSoundGame } from './EnglishAnimalSoundGame';
import { EnglishColorBalloonGame } from './EnglishColorBalloonGame';
import { MemoryCardsGame } from './MemoryCardsGame';
import { ColoringCanvasGame } from './ColoringCanvasGame';

type GameCategory = 'all' | 'viet' | 'math' | 'english' | 'fun';

interface GameInfo {
  id: string;
  title: string;
  category: GameCategory;
  categoryLabel: string;
  emoji: string;
  mascot: string;
  description: string;
  skillTag: string;
  color: string;
}

const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'catch_letters',
    title: 'Bắt Chữ Cái Bay',
    category: 'viet',
    categoryLabel: 'Tiếng Việt',
    emoji: '🔤',
    mascot: '🐻 Gấu Bút Chì',
    description: 'Chạm vào các bóng bóng mang đúng chữ cái đang rơi từ trên cao.',
    skillTag: 'Nhận diện bảng chữ cái',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'syllable_builder',
    title: 'Xưởng Ghép Tiếng Lớp 1',
    category: 'viet',
    categoryLabel: 'Tiếng Việt',
    emoji: '🧩',
    mascot: '🦊 Cáo Tinh Nhanh',
    description: 'Ghép âm đầu, nguyên âm và dấu thanh để tạo thành từ có nghĩa.',
    skillTag: 'Ghép âm & Dấu thanh',
    color: 'from-orange-400 to-amber-600',
  },
  {
    id: 'rhyme_hunter',
    title: 'Săn Vần Trong Vườn Cây',
    category: 'viet',
    categoryLabel: 'Tiếng Việt',
    emoji: '🍎',
    mascot: '🐰 Thỏ Trắng',
    description: 'Hái những trái cây ngọt ngào mang vần "an", "on", "at" vào giỏ.',
    skillTag: 'Nhận biết vần lớp 1',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'sentence_scramble',
    title: 'Đoàn Tàu Xếp Câu',
    category: 'viet',
    categoryLabel: 'Tiếng Việt',
    emoji: '🚂',
    mascot: '🐻 Gấu Bút Chì',
    description: 'Bấm các toa tàu theo đúng thứ tự ngữ pháp để đoàn tàu lăn bánh.',
    skillTag: 'Cấu trúc câu hoàn chỉnh',
    color: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'listen_pick',
    title: 'Đôi Tai Thính — Nghe & Chọn',
    category: 'viet',
    categoryLabel: 'Tiếng Việt',
    emoji: '🦉',
    mascot: '🦉 Cú Thông Thái',
    description: 'Lắng nghe phát âm của máy và chọn đúng bức tranh tương ứng.',
    skillTag: 'Luyện nghe & Nhận diện từ',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'falling_numbers',
    title: 'Hứng Số Rơi Rộn Ràng',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '🔢',
    mascot: '🦊 Cáo Toán',
    description: 'Hứng các quả bóng có số lớn hơn 5, bé hơn 6 hoặc số chẵn.',
    skillTag: 'So sánh số & Nhận diện số',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'speed_racing',
    title: 'Đường Đua Thần Tốc',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '🏎️',
    mascot: '🏁 Tay Đua Nhí',
    description: 'Tính nhanh phép cộng trừ để nạp Nitro cho xe đua về đích.',
    skillTag: 'Tính nhẩm trong 10',
    color: 'from-amber-500 to-red-500',
  },
  {
    id: 'number_tower',
    title: 'Xây Tháp Số Lên Mây',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '🏰',
    mascot: '🦊 Cáo Toán',
    description: 'Tìm viên gạch số còn thiếu trong phép cộng để tháp cao vút.',
    skillTag: 'Cộng gộp trong 10',
    color: 'from-sky-400 to-blue-600',
  },
  {
    id: 'ocean_fishing',
    title: 'Câu Cá Đại Dương Xanh',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '🎣',
    mascot: '⛵ Thuyền Trưởng Cáo',
    description: 'Thả cần câu bắt những chú cá mang kết quả đúng của phép trừ.',
    skillTag: 'Phép trừ trong 10',
    color: 'from-teal-400 to-cyan-600',
  },
  {
    id: 'shape_sorting',
    title: 'Phân Loại Hình Học',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '📦',
    mascot: '🦉 Cú Thông Thái',
    description: 'Phân chia các đồ vật quanh em vào giỏ hình tròn, vuông, tam giác.',
    skillTag: 'Hình học trực quan',
    color: 'from-lime-500 to-emerald-600',
  },
  {
    id: 'animal_safari',
    title: 'Safari Tiếng Anh — Animals',
    category: 'english',
    categoryLabel: 'Tiếng Anh',
    emoji: '🦁',
    mascot: '🐰 Thỏ English',
    description: 'Khám phá sở thú, nghe tên và tìm đúng các bạn động vật dễ thương.',
    skillTag: 'Từ vựng động vật English',
    color: 'from-emerald-500 to-green-600',
  },
  {
    id: 'color_balloon',
    title: 'Pop The Color Balloons!',
    category: 'english',
    categoryLabel: 'Tiếng Anh',
    emoji: '🎈',
    mascot: '🐰 Thỏ English',
    description: 'Đập vỡ những quả bóng bay đúng màu sắc tiếng Anh theo yêu cầu.',
    skillTag: 'Màu sắc tiếng Anh',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'memory_cards',
    title: 'Lật Thẻ Trí Nhớ Vàng',
    category: 'fun',
    categoryLabel: 'Giải Trí',
    emoji: '🧠',
    mascot: '⭐ Trí Tuệ Nhí',
    description: 'Lật tìm các cặp hình giống nhau giúp rèn luyện khả năng ghi nhớ.',
    skillTag: 'Trí nhớ ngắn hạn & Tập trung',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'coloring_canvas',
    title: 'Bé Tập Vẽ & Tô Màu Diệu Kỳ',
    category: 'fun',
    categoryLabel: 'Giải Trí',
    emoji: '🎨',
    mascot: '🌈 Họa Sĩ Nhí',
    description: 'Thỏa sức vẽ tranh, tô màu và dán sticker đáng yêu lên tác phẩm.',
    skillTag: 'Sáng tạo & Khéo léo',
    color: 'from-yellow-400 to-orange-500',
  },
];

export const GamesHubScreen: React.FC<{ onBack: () => void; onProfileUpdate: () => void }> = ({
  onBack,
  onProfileUpdate,
}) => {
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const filteredGames =
    activeCategory === 'all'
      ? GAMES_CATALOG
      : GAMES_CATALOG.filter((g) => g.category === activeCategory);

  const handleLaunchGame = (gameId: string) => {
    sound.playClick();
    setActiveGameId(gameId);
  };

  const handleCloseGame = () => {
    setActiveGameId(null);
    onProfileUpdate();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl font-bold text-xs md:text-sm text-amber-950 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </button>

        <div className="flex items-center gap-2 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-200">
          <Gamepad2 className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-black text-purple-900 font-display">
            {GAMES_CATALOG.length} Trò Chơi Giáo Dục Có Thể Chơi Ngay
          </span>
        </div>
      </div>

      {/* Hero Games Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-white/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-5xl md:text-6xl border-4 border-purple-200 animate-float shrink-0">
            🎪
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display text-white">
              Đấu Trường Trò Chơi Trí Tuệ
            </h1>
            <p className="text-xs md:text-sm text-purple-100 font-bold mt-1 max-w-lg leading-relaxed">
              Vừa chơi vừa học! Mỗi trò chơi giúp bé rèn luyện phản xạ, luyện vần, tính nhẩm và từ vựng tiếng Anh.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-white/20 rounded-2xl text-xs font-black flex items-center gap-1.5 backdrop-blur-xs">
          <span>⭐ Nhận Sao & XP sau mỗi màn</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Tất Cả (14)', icon: '🌟' },
          { id: 'viet', label: 'Tiếng Việt (5)', icon: '📚' },
          { id: 'math', label: 'Toán Học (5)', icon: '🔢' },
          { id: 'english', label: 'Tiếng Anh (2)', icon: '🇬🇧' },
          { id: 'fun', label: 'Giải Trí & Mỹ Thuật (2)', icon: '🎨' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setActiveCategory(tab.id as GameCategory);
            }}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
              activeCategory === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Games Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-3xl p-5 shadow-lg border-3 border-amber-200 hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-5xl group-hover:scale-110 transition-transform">
                  {game.emoji}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                  {game.categoryLabel}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-black text-slate-900 font-display">
                {game.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                {game.description}
              </p>

              <div className="mt-3">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  🎯 {game.skillTag}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">{game.mascot}</span>
              <button
                onClick={() => handleLaunchGame(game.id)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Chơi ngay</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render Active Game */}
      {activeGameId === 'catch_letters' && <CatchFallingLettersGame onExit={handleCloseGame} />}
      {activeGameId === 'syllable_builder' && <SyllableBuilderGame onExit={handleCloseGame} />}
      {activeGameId === 'rhyme_hunter' && <RhymeHunterGame onExit={handleCloseGame} />}
      {activeGameId === 'sentence_scramble' && <SentenceScrambleGame onExit={handleCloseGame} />}
      {activeGameId === 'listen_pick' && <ListenPickPhonicsGame onExit={handleCloseGame} />}
      {activeGameId === 'falling_numbers' && <FallingNumbersMathGame onExit={handleCloseGame} />}
      {activeGameId === 'speed_racing' && <MathSpeedRacingGame onExit={handleCloseGame} />}
      {activeGameId === 'number_tower' && <NumberTowerGame onExit={handleCloseGame} />}
      {activeGameId === 'ocean_fishing' && <OceanFishingGame onExit={handleCloseGame} />}
      {activeGameId === 'shape_sorting' && <ShapeSortingGame onExit={handleCloseGame} />}
      {activeGameId === 'animal_safari' && <EnglishAnimalSoundGame onExit={handleCloseGame} />}
      {activeGameId === 'color_balloon' && <EnglishColorBalloonGame onExit={handleCloseGame} />}
      {activeGameId === 'memory_cards' && <MemoryCardsGame onExit={handleCloseGame} />}
      {activeGameId === 'coloring_canvas' && <ColoringCanvasGame onExit={handleCloseGame} />}
    </div>
  );
};
