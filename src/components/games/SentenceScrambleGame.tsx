import React, { useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { RotateCcw } from 'lucide-react';

interface SentenceLevel {
  id: number;
  correctWords: string[];
  meaning: string;
  emoji: string;
}

const LEVELS: SentenceLevel[] = [
  { id: 1, correctWords: ['Lan', 'đi', 'học'], meaning: 'Lan đi học đến trường', emoji: '🎒' },
  { id: 2, correctWords: ['Bé', 'yêu', 'mẹ'], meaning: 'Bé thương yêu mẹ', emoji: '❤️' },
  { id: 3, correctWords: ['Con', 'mèo', 'trèo', 'cây', 'cau'], meaning: 'Chú mèo trèo cây', emoji: '🐱' },
  { id: 4, correctWords: ['Hoa', 'nở', 'rực', 'rỡ'], meaning: 'Bông hoa khoe sắc', emoji: '🌸' },
];

export const SentenceScrambleGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [trainDriving, setTrainDriving] = useState(false);

  const currentLevel = LEVELS[levelIdx];

  // Scramble pool (excluding already assembled ones)
  const availableWords = React.useMemo(() => {
    // Generate scrambled copy
    const copy = [...currentLevel.correctWords];
    // Deterministic pseudo-scramble
    copy.reverse();
    if (copy.join(' ') === currentLevel.correctWords.join(' ')) {
      copy.push(copy.shift()!);
    }
    return copy;
  }, [currentLevel]);

  const handleWordTap = (word: string) => {
    sound.playClick();
    const nextAssembled = [...assembledWords, word];
    setAssembledWords(nextAssembled);

    // If assembled all words, check correctness
    if (nextAssembled.length === currentLevel.correctWords.length) {
      if (nextAssembled.join(' ') === currentLevel.correctWords.join(' ')) {
        sound.playCorrect();
        sound.speak(`Hoan hô! "${nextAssembled.join(' ')}"`);
        setTrainDriving(true);
        const newScore = score + 1;
        setScore(newScore);

        setTimeout(() => {
          setTrainDriving(false);
          setAssembledWords([]);
          if (levelIdx + 1 < LEVELS.length) {
            setLevelIdx(levelIdx + 1);
          } else {
            setIsGameOver(true);
          }
        }, 2000);
      } else {
        sound.playWrong();
        sound.speak('Chưa đúng thứ tự rồi, bé bấm nút xếp lại nhé!');
      }
    }
  };

  const handleResetAssembled = () => {
    sound.playClick();
    setAssembledWords([]);
  };

  const restartGame = () => {
    setLevelIdx(0);
    setScore(0);
    setAssembledWords([]);
    setIsGameOver(false);
    setTrainDriving(false);
  };

  // Words that are still in pool
  const poolWords = availableWords.filter((w) => {
    const totalCount = availableWords.filter((x) => x === w).length;
    const usedCount = assembledWords.filter((x) => x === w).length;
    return usedCount < totalCount;
  });

  return (
    <GameModalWrapper
      title="Đoàn Tàu Xếp Câu"
      subtitle="Bấm các toa tàu theo đúng thứ tự để tạo thành câu hoàn chỉnh"
      mascotEmoji="🚂"
      score={score}
      maxScore={LEVELS.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions="Bé hãy chạm vào từng từ theo đúng thứ tự để đoàn tàu lăn bánh!"
      audioInstruction="Hãy chạm vào từng từ theo đúng thứ tự để đoàn tàu lăn bánh"
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-sky-100 to-amber-100 rounded-3xl p-4 md:p-6 border-2 border-sky-300 relative overflow-hidden">
        {/* Train Racetrack Area */}
        <div
          className={`w-full flex items-center justify-start gap-2 py-4 px-2 overflow-x-auto transition-transform duration-1000 ${
            trainDriving ? 'translate-x-full opacity-60' : 'translate-x-0'
          }`}
        >
          {/* Engine */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-5xl md:text-6xl animate-bounce">🚂</span>
            <span className="text-[10px] font-bold text-slate-500">Đầu tàu</span>
          </div>

          {/* Assembled train cars */}
          {currentLevel.correctWords.map((_, idx) => {
            const word = assembledWords[idx];
            return (
              <div
                key={idx}
                className={`w-20 md:w-28 h-16 md:h-20 rounded-2xl border-4 flex flex-col items-center justify-center font-black text-sm md:text-lg shadow-md transition-all shrink-0 ${
                  word
                    ? 'bg-amber-400 border-amber-500 text-amber-950 scale-100'
                    : 'bg-white/60 border-dashed border-amber-300 text-slate-300'
                }`}
              >
                <span>{word || `Toa ${idx + 1}`}</span>
              </div>
            );
          })}
        </div>

        {/* Railway tracks */}
        <div className="w-full h-3 bg-amber-800 rounded-full flex items-center justify-around my-1 opacity-70">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-amber-950" />
          ))}
        </div>

        {/* Word Options Pool */}
        <div className="flex-1 flex flex-col items-center justify-center my-4 w-full">
          <span className="text-xs font-bold text-slate-600 mb-2">Chạm vào các từ bên dưới:</span>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
            {poolWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordTap(word)}
                className="px-5 py-3 bg-white hover:bg-amber-50 border-3 border-amber-400 text-amber-950 font-black text-lg md:text-xl rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom controls & reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetAssembled}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs md:text-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Xếp lại từ đầu
          </button>
        </div>
      </div>
    </GameModalWrapper>
  );
};
