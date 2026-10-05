import React, { useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

interface FishQuestion {
  id: number;
  expr: string;
  ans: number;
  fishPool: { val: number; emoji: string; color: string }[];
}

const FISH_QUESTIONS: FishQuestion[] = [
  {
    id: 1,
    expr: '9 - 4',
    ans: 5,
    fishPool: [
      { val: 5, emoji: '🐠', color: 'text-amber-500' },
      { val: 3, emoji: '🐟', color: 'text-blue-500' },
      { val: 6, emoji: '🐡', color: 'text-rose-500' },
      { val: 4, emoji: '🐠', color: 'text-emerald-500' },
    ],
  },
  {
    id: 2,
    expr: '7 - 2',
    ans: 5,
    fishPool: [
      { val: 4, emoji: '🐟', color: 'text-blue-500' },
      { val: 5, emoji: '🐠', color: 'text-amber-500' },
      { val: 6, emoji: '🐡', color: 'text-purple-500' },
      { val: 3, emoji: '🐠', color: 'text-teal-500' },
    ],
  },
  {
    id: 3,
    expr: '10 - 7',
    ans: 3,
    fishPool: [
      { val: 2, emoji: '🐡', color: 'text-rose-500' },
      { val: 3, emoji: '🐟', color: 'text-blue-500' },
      { val: 4, emoji: '🐠', color: 'text-amber-500' },
      { val: 5, emoji: '🐠', color: 'text-emerald-500' },
    ],
  },
  {
    id: 4,
    expr: '8 - 6',
    ans: 2,
    fishPool: [
      { val: 1, emoji: '🐟', color: 'text-blue-500' },
      { val: 2, emoji: '🐠', color: 'text-amber-500' },
      { val: 3, emoji: '🐡', color: 'text-rose-500' },
      { val: 4, emoji: '🐠', color: 'text-purple-500' },
    ],
  },
];

export const OceanFishingGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hookedFish, setHookedFish] = useState<number | null>(null);

  const current = FISH_QUESTIONS[qIdx];

  const handleCatchFish = (val: number) => {
    if (val === current.ans) {
      sound.playCorrect();
      sound.speak(`Cắn câu rồi! ${current.expr} bằng ${current.ans}!`);
      setHookedFish(val);
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        setHookedFish(null);
        if (qIdx + 1 < FISH_QUESTIONS.length) {
          setQIdx(qIdx + 1);
        } else {
          setIsGameOver(true);
        }
      }, 1400);
    } else {
      sound.playWrong();
      sound.speak(`Chú cá mang số ${val} chưa đúng phép tính rồi, bé thử lại nhé!`);
    }
  };

  const restartGame = () => {
    setQIdx(0);
    setScore(0);
    setHookedFish(null);
    setIsGameOver(false);
  };

  return (
    <GameModalWrapper
      title="Câu Cá Đại Dương Xanh"
      subtitle="Thả cần câu bắt chú cá mang kết quả đúng của phép trừ"
      mascotEmoji="🎣"
      score={score}
      maxScore={FISH_QUESTIONS.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions={`Tính phép trừ: ${current.expr} = ?`}
      audioInstruction={`${current.expr} bằng mấy`}
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-sky-200 via-sky-400 to-blue-800 rounded-3xl p-4 md:p-6 border-3 border-blue-400 relative overflow-hidden select-none">
        {/* Boat on water surface */}
        <div className="w-full flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3 bg-white/95 px-5 py-2.5 rounded-2xl shadow-lg border-2 border-amber-300">
            <span className="text-3xl">⛵</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Thuyền Trưởng Cáo hỏi:</span>
              <span className="text-2xl md:text-3xl font-black text-amber-900 font-display">
                {current.expr} = ?
              </span>
            </div>
            <button
              onClick={() => sound.speak(`${current.expr} bằng mấy?`)}
              className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full"
            >
              🔊
            </button>
          </div>

          <div className="text-2xl animate-float">☁️</div>
        </div>

        {/* Fishing Line */}
        <div className="absolute top-16 left-1/3 w-0.5 h-32 bg-amber-950/60 flex flex-col items-center justify-end">
          <span className="text-xl">🪝</span>
        </div>

        {/* Ocean Waves Decor */}
        <div className="absolute inset-x-0 top-24 text-center text-4xl text-blue-200/50">
          🌊 🌊 🌊 🌊 🌊 🌊
        </div>

        {/* Swimming Fish in Deep Water */}
        <div className="w-full flex-1 flex flex-wrap items-center justify-around gap-4 p-4 z-10">
          {current.fishPool.map((fish, idx) => (
            <button
              key={idx}
              onClick={() => handleCatchFish(fish.val)}
              className={`p-4 bg-white/90 hover:bg-white rounded-3xl shadow-xl border-3 border-blue-300 hover:border-amber-400 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer min-w-[110px] md:min-w-[130px] ${
                hookedFish === fish.val ? 'scale-125 -translate-y-8 bg-amber-100 border-amber-500' : 'hover:scale-105'
              }`}
            >
              <span className="text-5xl md:text-6xl animate-pulse-subtle">{fish.emoji}</span>
              <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-xl rounded-xl shadow-sm">
                Số {fish.val}
              </span>
              <span className="text-[10px] text-blue-700 font-bold">Chạm để câu</span>
            </button>
          ))}
        </div>

        {/* Sea floor decor */}
        <div className="w-full flex justify-between px-8 text-3xl opacity-80">
          <span>🪸</span>
          <span>🦀</span>
          <span>🐚</span>
          <span>🌿</span>
        </div>
      </div>
    </GameModalWrapper>
  );
};
