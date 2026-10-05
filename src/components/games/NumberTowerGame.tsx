import React, { useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

interface TowerLevel {
  id: number;
  part1: number;
  total: number;
  missing: number;
  options: number[];
}

const TOWER_LEVELS: TowerLevel[] = [
  { id: 1, part1: 7, total: 10, missing: 3, options: [3, 2, 4, 1] },
  { id: 2, part1: 4, total: 8, missing: 4, options: [4, 5, 3, 2] },
  { id: 3, part1: 2, total: 7, missing: 5, options: [5, 6, 4, 3] },
  { id: 4, part1: 6, total: 10, missing: 4, options: [4, 3, 5, 2] },
  { id: 5, part1: 5, total: 9, missing: 4, options: [4, 3, 5, 6] },
];

export const NumberTowerGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [towerBlocks, setTowerBlocks] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = TOWER_LEVELS[levelIdx];

  const handlePickBrick = (num: number) => {
    if (num === current.missing) {
      sound.playCorrect();
      sound.speak(`Đúng rồi! ${current.part1} cộng ${num} bằng ${current.total}!`);
      const newScore = score + 1;
      setScore(newScore);
      setTowerBlocks((prev) => [...prev, num]);

      setTimeout(() => {
        if (levelIdx + 1 < TOWER_LEVELS.length) {
          setLevelIdx(levelIdx + 1);
        } else {
          setIsGameOver(true);
        }
      }, 1200);
    } else {
      sound.playWrong();
      sound.speak(`Chưa đúng rồi! ${current.part1} cộng ${num} chưa bằng ${current.total}, bé tính lại nhé!`);
    }
  };

  const restartGame = () => {
    setLevelIdx(0);
    setScore(0);
    setTowerBlocks([]);
    setIsGameOver(false);
  };

  return (
    <GameModalWrapper
      title="Xây Tháp Số Lên Mây"
      subtitle="Tìm viên gạch số còn thiếu để tháp số cao vút chạm cầu vồng"
      mascotEmoji="🏰"
      score={score}
      maxScore={TOWER_LEVELS.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions={`Tìm viên gạch thích hợp: ${current.part1} + ? = ${current.total}`}
      audioInstruction={`${current.part1} cộng mấy để bằng ${current.total}`}
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 rounded-3xl p-4 md:p-6 border-2 border-sky-400 relative overflow-hidden select-none">
        {/* Rainbow & Cloud at top */}
        <div className="flex items-center gap-2 text-4xl">
          <span>🌈</span>
          <span>☁️</span>
          <span>🏰</span>
          <span>☁️</span>
        </div>

        {/* The Tower Stack View */}
        <div className="flex flex-col-reverse items-center justify-end my-2 flex-1 w-full max-w-xs">
          {/* Base foundation */}
          <div className="w-48 h-8 bg-amber-900 rounded-lg border-2 border-amber-950 flex items-center justify-center text-xs font-bold text-amber-100">
            Nền Móng Vững Chắc
          </div>

          {/* Built blocks */}
          {towerBlocks.map((val, idx) => (
            <div
              key={idx}
              className="w-40 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl border-3 border-amber-600 flex items-center justify-center font-black text-xl text-white shadow-md my-0.5 animate-pop"
            >
              Tầng {idx + 1} (+{val})
            </div>
          ))}

          {/* Current Target Block Outline */}
          <div className="w-40 h-14 bg-white/70 border-3 border-dashed border-amber-500 rounded-2xl flex items-center justify-center gap-2 px-3 shadow-inner my-1">
            <span className="text-xl font-black text-amber-900">
              {current.part1} + <span className="text-rose-600 underline">?</span> = {current.total}
            </span>
          </div>
        </div>

        {/* Choice of Bricks */}
        <div className="w-full max-w-md">
          <span className="text-xs font-bold text-slate-700 block text-center mb-2">
            Chọn viên gạch số đúng để xếp lên tháp:
          </span>
          <div className="grid grid-cols-4 gap-3">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handlePickBrick(opt)}
                className="py-3 bg-white hover:bg-amber-100 border-3 border-amber-400 text-amber-950 font-black text-2xl rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer font-display"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};
