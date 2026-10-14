import React, { useMemo } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { useGameStage } from '../../hooks/useGameStage';
import { defaultRoundsPerTier, getTierMeta, pickDistinct, seededRng } from '../../data/gameLevels';

export type ShapeCategory = 'tron' | 'vuong' | 'tam-giac' | 'chu-nhat';

export interface ShapeItem {
  name: string;
  emoji: string;
  category: ShapeCategory;
  hint: string;
}

export const SHAPE_POOL: ShapeItem[] = [
  { name: 'Quả bóng đá', emoji: '⚽', category: 'tron', hint: 'Quả bóng lăn tròn lông lốc' },
  { name: 'Hộp quà vuông', emoji: '🎁', category: 'vuong', hint: 'Hộp quà có các mặt vuông vức' },
  { name: 'Miếng dưa hấu', emoji: '🍉', category: 'tam-giac', hint: 'Cắt lát hình tam giác 3 cạnh' },
  { name: 'Cuốn sách bài tập', emoji: '📘', category: 'chu-nhat', hint: 'Có hai cạnh dài và hai cạnh ngắn' },
  { name: 'Chiếc bánh quy tròn', emoji: '🍪', category: 'tron', hint: 'Bánh quy bơ tròn xoe' },
  { name: 'Biển báo nguy hiểm', emoji: '⚠️', category: 'tam-giac', hint: 'Biển cảnh báo màu vàng 3 cạnh' },
  { name: 'Quả xoài', emoji: '🥭', category: 'tron', hint: 'Quả xoài tròn dài' },
  { name: 'Cửa sổ lớp học', emoji: '🪟', category: 'chu-nhat', hint: 'Cửa sổ có khung dài' },
  { name: 'Mặt đồng hồ', emoji: '⏰', category: 'tron', hint: 'Đồng hồ quay tròn kim' },
  { name: 'Miếng bánh pizza', emoji: '🍕', category: 'tam-giac', hint: 'Lát bánh 3 cạnh' },
  { name: 'Sô cô la vuông', emoji: '🍫', category: 'vuong', hint: 'Miếng sô cô la 4 cạnh bằng nhau' },
  { name: 'Cái bảng lớp', emoji: '📋', category: 'chu-nhat', hint: 'Bảng có hai cạnh dài' },
  { name: 'Quả dưa hấu', emoji: '🍈', category: 'tron', hint: 'Quả dưa lăn tròn' },
  { name: 'Thước ê ke', emoji: '📐', category: 'tam-giac', hint: 'Thước vẽ góc 3 cạnh' },
  { name: 'Chiếc khăn mùi xoa', emoji: '🧣', category: 'vuong', hint: 'Khăn gấp 4 cạnh bằng nhau' },
  { name: 'Cánh cửa tủ', emoji: '🚪', category: 'chu-nhat', hint: 'Cánh cửa dài đứng' },
  { name: 'Quả cam', emoji: '🍊', category: 'tron', hint: 'Quả cam tròn xoe' },
  { name: 'Mũ sinh nhật', emoji: '🎉', category: 'tam-giac', hint: 'Mũ chóp nhọn 3 cạnh' },
  { name: 'Tấm gạch vuông', emoji: '🧱', category: 'vuong', hint: 'Viên gạch 4 cạnh bằng nhau' },
  { name: 'Chiếc bánh mì', emoji: '🍞', category: 'chu-nhat', hint: 'Ổ bánh dài' },
  { name: 'Hòn bi ve', emoji: '🔮', category: 'tron', hint: 'Viên tròn lăn' },
  { name: 'Mái nhà', emoji: '🏠', category: 'tam-giac', hint: 'Mái hiên 3 cạnh' },
  { name: 'Bánh chưng xanh', emoji: '🟩', category: 'vuong', hint: 'Bánh Tết 4 cạnh bằng nhau' },
  { name: 'Bức ảnh khung', emoji: '🖼️', category: 'chu-nhat', hint: 'Khung ảnh dài' },
];

export function buildShapeRounds(tier: number, nonce = 0, seed?: number): ShapeItem[] {
  const roundsPerTier = defaultRoundsPerTier();
  const count = roundsPerTier[tier - 1];
  const rngSeed = seed ?? 4500 + tier * 43 + nonce * 1009;
  // Tier 1-2 only show near-obvious items; higher tiers add tricky shapes.
  const pool = tier <= 2 ? SHAPE_POOL.slice(0, 10) : SHAPE_POOL;
  return pickDistinct<ShapeItem>(pool, count, seededRng(rngSeed));
}

export const ShapeSortingGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => defaultRoundsPerTier(), []);
  const stage = useGameStage({ gameId: 'shape_sorting', roundsPerTier, advanceDelayMs: 1200 });

  const items = useMemo(() => buildShapeRounds(stage.tier, stage.nonce), [stage.tier, stage.nonce]);
  const currentItem = items[stage.roundIdx];

  const BASKETS: { category: ShapeCategory; title: string; emoji: string; color: string }[] = [
    { category: 'tron', title: 'Hình Tròn', emoji: '🔴', color: 'border-red-400 bg-red-50 text-red-900' },
    { category: 'vuong', title: 'Hình Vuông', emoji: '🟦', color: 'border-blue-400 bg-blue-50 text-blue-900' },
    { category: 'tam-giac', title: 'Hình Tam Giác', emoji: '🔺', color: 'border-amber-400 bg-amber-50 text-amber-900' },
    { category: 'chu-nhat', title: 'Hình Chữ Nhật', emoji: '🟩', color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  ];

  const handleBasketTap = (cat: ShapeCategory) => {
    if (stage.locked) return;
    if (cat === currentItem.category) {
      sound.playCorrect();
      sound.speak(`Đúng rồi! ${currentItem.name} thuộc dạng ${BASKETS.find((b) => b.category === cat)?.title}!`);
      stage.submitCorrect();
    } else {
      sound.playWrong();
      sound.speak(`Chưa đúng rồi! ${currentItem.hint}, bé chọn lại rổ nhé!`);
      stage.submitWrong();
    }
  };

  return (
    <GameModalWrapper
      gameId="shape_sorting"
      title="Phân Loại Hình Học Vui Nhộn"
      subtitle="Xếp các đồ vật quen thuộc vào đúng giỏ hình học"
      mascotEmoji="📦"
      score={stage.score}
      isGameOver={stage.isGameOver}
      phase={stage.phase}
      tier={stage.tier}
      tierMeta={stage.tierMeta}
      tierCount={stage.tierCount}
      roundNumber={stage.roundNumber}
      roundTotal={stage.roundTotal}
      starsEarned={stage.starsEarned}
      nextTierMeta={stage.tier + 1 <= stage.tierCount ? getTierMeta(stage.tier + 1) : undefined}
      onNextTier={stage.startNextTier}
      earnedXp={stage.xpEarned}
      earnedStars={stage.starsEarned}
      prevBestStars={stage.prevBestStars}
      onRestart={stage.restartGame}
      onExit={onExit}
      instructions={`Hãy xếp "${currentItem.name}" vào chiếc giỏ hình học đúng!`}
      audioInstruction={`Hãy xếp ${currentItem.name} vào chiếc giỏ hình học đúng`}
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-4 md:p-6 border-2 border-amber-300 relative select-none">
        {/* Conveyor Belt with Current Item */}
        <div className="flex flex-col items-center my-auto">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
            Đồ vật cần phân loại ({stage.roundNumber}/{stage.roundTotal}):
          </span>

          <div className="p-6 bg-white rounded-3xl shadow-xl border-4 border-amber-400 flex flex-col items-center animate-pop">
            <span className="text-7xl md:text-8xl mb-2">{currentItem.emoji}</span>
            <span className="text-xl md:text-2xl font-black text-amber-950 font-display">
              {currentItem.name}
            </span>
            {stage.tier <= 3 && (
              <span className="text-xs text-slate-500 font-semibold mt-1">({currentItem.hint})</span>
            )}
          </div>
        </div>

        {/* 4 Baskets at the bottom */}
        <div className="w-full max-w-2xl">
          <span className="text-xs font-bold text-slate-600 block text-center mb-2">
            Chạm vào chiếc giỏ phù hợp:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BASKETS.map((b) => (
              <button
                key={b.category}
                onClick={() => handleBasketTap(b.category)}
                disabled={stage.locked}
                className={`p-3 rounded-2xl border-3 shadow-md flex flex-col items-center justify-center gap-1 transition-all active:scale-95 hover:scale-105 cursor-pointer ${b.color} ${stage.locked ? 'opacity-80' : ''}`}
              >
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-sm font-black font-display">{b.title}</span>
                <span className="text-[10px] font-bold opacity-75">Bỏ vào giỏ 🧺</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};