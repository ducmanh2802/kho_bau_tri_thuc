import React, { useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Zap } from 'lucide-react';

interface MathQuestion {
  id: number;
  expr: string;
  ans: number;
  options: number[];
}

const QUESTIONS: MathQuestion[] = [
  { id: 1, expr: '3 + 4', ans: 7, options: [7, 6, 8, 5] },
  { id: 2, expr: '8 - 3', ans: 5, options: [5, 4, 6, 3] },
  { id: 3, expr: '6 + 2', ans: 8, options: [8, 9, 7, 10] },
  { id: 4, expr: '10 - 4', ans: 6, options: [6, 5, 7, 8] },
  { id: 5, expr: '5 + 5', ans: 10, options: [10, 9, 11, 8] },
];

export const MathSpeedRacingGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [carProgress, setCarProgress] = useState(10); // percentage 10% to 90%
  const [isGameOver, setIsGameOver] = useState(false);
  const [turboActive, setTurboActive] = useState(false);

  const current = QUESTIONS[qIdx];

  const handleSelectOption = (num: number) => {
    if (num === current.ans) {
      sound.playCorrect();
      sound.speak(`Chính xác! ${current.expr} bằng ${current.ans}!`);
      setTurboActive(true);
      const newScore = score + 1;
      setScore(newScore);

      const nextProg = 10 + (newScore / QUESTIONS.length) * 80;
      setCarProgress(nextProg);

      setTimeout(() => {
        setTurboActive(false);
        if (qIdx + 1 < QUESTIONS.length) {
          setQIdx(qIdx + 1);
        } else {
          setIsGameOver(true);
        }
      }, 1200);
    } else {
      sound.playWrong();
      sound.speak(`Chưa đúng rồi! Bé thử tính lại nhé!`);
    }
  };

  const restartGame = () => {
    setQIdx(0);
    setScore(0);
    setCarProgress(10);
    setIsGameOver(false);
    setTurboActive(false);
  };

  return (
    <GameModalWrapper
      title="Đường Đua Toán Học Thần Tốc"
      subtitle="Giải nhanh các phép tính để xe đua phóng vút về đích"
      mascotEmoji="🏎️"
      score={score}
      maxScore={QUESTIONS.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions="Bé hãy chọn kết quả đúng của phép tính để nạp năng lượng Nitro cho xe đua!"
      audioInstruction="Hãy chọn kết quả đúng của phép tính để xe đua phóng nhanh về đích"
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-4 md:p-6 border-4 border-amber-400 text-white relative overflow-hidden select-none">
        {/* Racetrack View */}
        <div className="w-full relative h-28 bg-slate-700 rounded-2xl border-4 border-slate-600 overflow-hidden flex items-center shadow-inner">
          {/* Track Lines */}
          <div className="absolute inset-x-0 h-1 border-t-2 border-dashed border-white/40" />

          {/* Finish Line */}
          <div className="absolute right-6 inset-y-0 w-8 bg-repeat-y opacity-80" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '16px 16px', backgroundColor: '#fff' }} />
          <div className="absolute right-8 top-1 text-2xl">🏁</div>

          {/* Player Racecar */}
          <div
            style={{ left: `${carProgress}%`, transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            className="absolute transform -translate-y-1/2 top-1/2 flex items-center"
          >
            <span className="text-5xl md:text-6xl drop-shadow-lg">🏎️</span>
            {turboActive && (
              <span className="text-3xl -ml-2 text-amber-400 animate-ping">🔥</span>
            )}
          </div>
        </div>

        {/* Current Math Question */}
        <div className="my-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-6 h-6 ${turboActive ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-xs md:text-sm font-bold text-amber-300 uppercase tracking-widest">
              Vòng đua {qIdx + 1} / {QUESTIONS.length}
            </span>
          </div>

          <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-amber-400/50 shadow-2xl flex items-center gap-4">
            <span className="text-4xl md:text-6xl font-black text-amber-300 font-display">
              {current.expr} = ?
            </span>
            <button
              onClick={() => sound.speak(`${current.expr} bằng mấy?`)}
              className="p-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-full font-bold"
              title="Nghe phép tính"
            >
              🔊
            </button>
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-xl">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectOption(opt)}
              className="py-4 px-6 bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-3xl rounded-2xl shadow-xl border-2 border-white/50 active:scale-95 transition-all cursor-pointer font-display"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </GameModalWrapper>
  );
};
