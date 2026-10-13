import React, { useMemo, useState } from 'react';
import { sound } from '../../services/sound';
import { ArrowLeft, Play, Gamepad2, Star } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta } from '../../data/gameLevels';
import { CatchFallingLettersGame } from './CatchFallingLettersGame';
import { SyllableBuilderGame } from './SyllableBuilderGame';
import { RhymeHunterGame } from './RhymeHunterGame';
import { SentenceScrambleGame } from './SentenceScrambleGame';
import { ListenPickPhonicsGame } from './ListenPickPhonicsGame';
import { SpellingDuelGame } from './SpellingDuelGame';
import { FallingNumbersMathGame } from './FallingNumbersMathGame';
import { MathSpeedRacingGame } from './MathSpeedRacingGame';
import { NumberTowerGame } from './NumberTowerGame';
import { OceanFishingGame } from './OceanFishingGame';
import { ShapeSortingGame } from './ShapeSortingGame';
import { ClockMoneyGame } from './ClockMoneyGame';
import { WordStoryGame } from './WordStoryGame';
import { EnglishAnimalSoundGame } from './EnglishAnimalSoundGame';
import { EnglishColorBalloonGame } from './EnglishColorBalloonGame';
import { PhonicsPopGame } from './PhonicsPopGame';
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
  isNew?: boolean;
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
    id: 'spelling_duel',
    title: 'Đấu Trường Chính Tả',
    category: 'viet',
    categoryLabel: 'Tiếng Việt',
    emoji: '✏️',
    mascot: '🦉 Cú Chấm Bài',
    description: 'Chinh phục c/k, g/gh, ng/ngh, ch/tr, s/x, d/gi/r qua 6 màn đấu.',
    skillTag: 'Chính tả phân biệt — sát đề Trạng Nguyên',
    color: 'from-rose-400 to-orange-500',
    isNew: true,
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
    id: 'clock_money',
    title: 'Thám Hiểm Giờ & Tiền Việt',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '⏰',
    mascot: '🦊 Cáo Thời Gian',
    description: 'Xem giờ đúng, tiêu tiền Việt, đo cm/m và đếm ngày tháng.',
    skillTag: 'Đo lường & Thực tế — dạng thi mới',
    color: 'from-cyan-500 to-blue-600',
    isNew: true,
  },
  {
    id: 'word_story',
    title: 'Chuyện Kể Toán Học',
    category: 'math',
    categoryLabel: 'Toán Học',
    emoji: '🔍',
    mascot: '🐻 Thám Tử Nhí',
    description: 'Đọc chuyện ngắn, giải toán lời văn từ dễ đến 100 như đề thi thật.',
    skillTag: 'Toán lời văn 6 cấp độ',
    color: 'from-indigo-500 to-violet-600',
    isNew: true,
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
    id: 'phonics_pop',
    title: 'Phonics Pop — Bắn Âm',
    category: 'english',
    categoryLabel: 'Tiếng Anh',
    emoji: '🔤',
    mascot: '🦉 Cú Phonics',
    description: 'Nghe từ giọng Anh-Anh, bắn đúng âm đầu: SH, CH, TH, BL, GR…',
    skillTag: 'Phonics nâng cao giọng Anh-Anh',
    color: 'from-fuchsia-500 to-purple-600',
    isNew: true,
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

/** Registry: game id -> component. Thêm game mới chỉ cần thêm 1 dòng ở đây + catalog. */
const GAME_REGISTRY: Record<string, React.ComponentType<{ onExit: () => void }>> = {
  catch_letters: CatchFallingLettersGame,
  syllable_builder: SyllableBuilderGame,
  rhyme_hunter: RhymeHunterGame,
  sentence_scramble: SentenceScrambleGame,
  listen_pick: ListenPickPhonicsGame,
  spelling_duel: SpellingDuelGame,
  falling_numbers: FallingNumbersMathGame,
  speed_racing: MathSpeedRacingGame,
  number_tower: NumberTowerGame,
  ocean_fishing: OceanFishingGame,
  shape_sorting: ShapeSortingGame,
  clock_money: ClockMoneyGame,
  word_story: WordStoryGame,
  animal_safari: EnglishAnimalSoundGame,
  color_balloon: EnglishColorBalloonGame,
  phonics_pop: PhonicsPopGame,
  memory_cards: MemoryCardsGame,
  coloring_canvas: ColoringCanvasGame,
};

function GameProgressDots({ gameId }: { gameId: string }) {
  const progress = StorageService.getGameProgress(gameId);
  const maxTier = GAME_LEVEL_POLICY.MAX_TIER;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
        <span>{getTierMeta(progress.unlockedTier).emoji}</span>
        <span>Màn {progress.unlockedTier}/{maxTier}</span>
        <span className="ml-auto flex items-center gap-0.5">
          ⭐ {Object.values(progress.starsByTier ?? {}).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxTier }, (_, i) => {
          const tierNo = i + 1;
          const stars = (progress.starsByTier as Record<number, number> | undefined)?.[tierNo] ?? 0;
          const unlocked = tierNo <= progress.unlockedTier;
          return (
            <div
              key={tierNo}
              title={`Màn ${tierNo}: ${stars} sao`}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background: stars >= 3 ? '#f59e0b' : stars >= 1 ? '#fcd34d' : unlocked ? '#e2e8f0' : '#f1f5f9',
                opacity: unlocked ? 1 : 0.5,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export const GamesHubScreen: React.FC<{ onBack: () => void; onProfileUpdate: () => void }> = ({
  onBack,
  onProfileUpdate,
}) => {
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<GameCategory | 'total', number> = {
      total: GAMES_CATALOG.length,
      all: GAMES_CATALOG.length,
      viet: 0,
      math: 0,
      english: 0,
      fun: 0,
    };
    for (const g of GAMES_CATALOG) c[g.category] += 1;
    return c;
  }, []);

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

  const ActiveGame = activeGameId ? GAME_REGISTRY[activeGameId] : null;

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
            {counts.total} Trò Chơi Giáo Dục Có Thể Chơi Ngay
          </span>
        </div>
      </div>

      {/* Hero Games Banner */}
      <div className="animate-gradient kb-hero-pattern bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-white/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-5xl md:text-6xl border-4 border-purple-200 animate-float shrink-0">
            🎪
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display text-white">
              Đấu Trường Trò Chơi Trí Tuệ
            </h1>
            <p className="text-xs md:text-sm text-purple-100 font-bold mt-1 max-w-lg leading-relaxed">
              Vừa chơi vừa học! 6 màn từ dễ đến Vua Trò Chơi 👑 — mỗi màn mở khóa màn tiếp theo, nhận Sao & XP.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 justify-center md:justify-start">
              {GAME_LEVEL_POLICY.TIERS.map((t) => (
                <span key={t.id} className="kb-chip text-[10px] bg-white/20 px-2 py-0.5 backdrop-blur-xs">
                  {t.emoji} {t.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-white/20 rounded-2xl text-xs font-black flex items-center gap-1.5 backdrop-blur-xs">
          <Star className="w-4 h-4 fill-amber-300 text-amber-200" />
          <span>⭐ Nhận Sao & XP sau mỗi màn</span>
        </div>
      </div>

      {/* Category Tabs — counts computed dynamically */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: `Tất Cả (${counts.all})`, icon: '🌟' },
          { id: 'viet', label: `Tiếng Việt (${counts.viet})`, icon: '📚' },
          { id: 'math', label: `Toán Học (${counts.math})`, icon: '🔢' },
          { id: 'english', label: `Tiếng Anh (${counts.english})`, icon: '🇬🇧' },
          { id: 'fun', label: `Giải Trí (${counts.fun})`, icon: '🎨' },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 stagger">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="kb-card kb-card-hover rounded-3xl p-5 flex flex-col justify-between group animate-rise"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-5xl group-hover:scale-110 transition-transform">
                  {game.emoji}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                    {game.categoryLabel}
                  </span>
                  {game.isNew && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-500 text-white rounded-full animate-pulse-subtle">
                      ✨ Mới
                    </span>
                  )}
                </div>
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
                <GameProgressDots gameId={game.id} />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">{game.mascot}</span>
              <button
                onClick={() => handleLaunchGame(game.id)}
                className="kb-btn kb-btn-primary px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Chơi ngay</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render Active Game via registry */}
      {ActiveGame && <ActiveGame onExit={handleCloseGame} />}
    </div>
  );
};
