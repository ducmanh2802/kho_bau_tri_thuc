import React, { useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

type ShapeCategory = 'tron' | 'vuong' | 'tam-giac' | 'chu-nhat';

interface ShapeItem {
  id: number;
  name: string;
  emoji: string;
  category: ShapeCategory;
  hint: string;
}

const ITEMS: ShapeItem[] = [
  { id: 1, name: 'Quả bóng đá', emoji: '⚽', category: 'tron', hint: 'Quả bóng lăn tròn lông lốc' },
  { id: 2, name: 'Hộp quà vuông', emoji: '🎁', category: 'vuong', hint: 'Hộp quà có các mặt vuông vức' },
  { id: 3, name: 'Miếng dưa hấu', emoji: '🍉', category: 'tam-giac', hint: 'Cắt lát hình tam giác 3 cạnh' },
  { id: 4, name: 'Cuốn sách bài tập', emoji: '📘', category: 'chu-nhat', hint: 'Có hai cạnh dài và hai cạnh ngắn' },
  { id: 5, name: 'Chiếc bánh quy tròn', emoji: '🍪', category: 'tron', hint: 'Bánh quy bơ tròn xoe' },
  { id: 6, name: 'Biển báo nguy hiểm', emoji: '⚠️', category: 'tam-giac', hint: 'Biển cảnh báo màu vàng 3 cạnh' },
];

export const ShapeSortingGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [itemIdx, setItemIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentItem = ITEMS[itemIdx];

  const BASKETS: { category: ShapeCategory; title: string; emoji: string; color: string }[] = [
    { category: 'tron', title: 'Hình Tròn', emoji: '🔴', color: 'border-red-400 bg-red-50 text-red-900' },
    { category: 'vuong', title: 'Hình Vuông', emoji: '🟦', color: 'border-blue-400 bg-blue-50 text-blue-900' },
    { category: 'tam-giac', title: 'Hình Tam Giác', emoji: '🔺', color: 'border-amber-400 bg-amber-50 text-amber-900' },
    { category: 'chu-nhat', title: 'Hình Chữ Nhật', emoji: '🟩', color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  ];

  const handleBasketTap = (cat: ShapeCategory) => {
    if (cat === currentItem.category) {
      sound.playCorrect();
      sound.speak(`Đúng rồi! ${currentItem.name} thuộc dạng ${BASKETS.find((b) => b.category === cat)?.title}!`);
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        if (itemIdx + 1 < ITEMS.length) {
          setItemIdx(itemIdx + 1);
        } else {
          setIsGameOver(true);
        }
      }, 1200);
    } else {
      sound.playWrong();
      sound.speak(`Chưa đúng rồi! ${currentItem.hint}, bé chọn lại rổ nhé!`);
    }
  };

  const restartGame = () => {
    setItemIdx(0);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <GameModalWrapper
      title="Phân Loại Hình Học Vui Nhộn"
      subtitle="Xếp các đồ vật quen thuộc vào đúng giỏ hình học"
      mascotEmoji="📦"
      score={score}
      maxScore={ITEMS.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions={`Hãy xếp "${currentItem.name}" vào chiếc giỏ hình học đúng!`}
      audioInstruction={`Hãy xếp ${currentItem.name} vào chiếc giỏ hình học đúng`}
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-4 md:p-6 border-2 border-amber-300 relative select-none">
        {/* Conveyor Belt with Current Item */}
        <div className="flex flex-col items-center my-auto">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
            Đồ vật cần phân loại ({itemIdx + 1}/{ITEMS.length}):
          </span>

          <div className="p-6 bg-white rounded-3xl shadow-xl border-4 border-amber-400 flex flex-col items-center animate-pop">
            <span className="text-7xl md:text-8xl mb-2">{currentItem.emoji}</span>
            <span className="text-xl md:text-2xl font-black text-amber-950 font-display">
              {currentItem.name}
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-1">({currentItem.hint})</span>
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
                className={`p-3 rounded-2xl border-3 shadow-md flex flex-col items-center justify-center gap-1 transition-all active:scale-95 hover:scale-105 cursor-pointer ${b.color}`}
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
