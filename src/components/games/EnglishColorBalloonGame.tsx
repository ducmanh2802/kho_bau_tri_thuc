import React, { useState, useEffect } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';

interface ColorTarget {
  name: string;
  vietnamese: string;
  cssColor: string;
  hex: string;
}

const COLOR_TARGETS: ColorTarget[] = [
  { name: 'RED', vietnamese: 'Màu đỏ', cssColor: 'bg-red-500', hex: '#EF4444' },
  { name: 'BLUE', vietnamese: 'Màu xanh dương', cssColor: 'bg-blue-500', hex: '#3B82F6' },
  { name: 'GREEN', vietnamese: 'Màu xanh lá', cssColor: 'bg-emerald-500', hex: '#10B981' },
  { name: 'YELLOW', vietnamese: 'Màu vàng', cssColor: 'bg-amber-400', hex: '#FBBF24' },
  { name: 'PURPLE', vietnamese: 'Màu tím', cssColor: 'bg-purple-500', hex: '#8B5CF6' },
];

interface Balloon {
  id: number;
  colorName: string;
  cssColor: string;
  x: number;
  y: number;
  speed: number;
}

export const EnglishColorBalloonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [targetIdx, setTargetIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentTarget = COLOR_TARGETS[targetIdx];

  const playVoice = () => {
    sound.speak(`Pop the ${currentTarget.name} balloon!`, 'en-US');
  };

  useEffect(() => {
    playVoice();
  }, [targetIdx]);

  // Spawn balloons
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      // 50% chance of target color
      const isTarget = Math.random() < 0.5;
      const chosenColor = isTarget
        ? currentTarget
        : COLOR_TARGETS[Math.floor(Math.random() * COLOR_TARGETS.length)];

      const newBalloon: Balloon = {
        id: Date.now() + Math.random(),
        colorName: chosenColor.name,
        cssColor: chosenColor.cssColor,
        x: Math.floor(Math.random() * 70) + 15,
        y: 110,
        speed: Math.random() * 0.4 + 0.4,
      };

      setBalloons((prev) => [...prev.slice(-10), newBalloon]);
    }, 1100);

    return () => clearInterval(timer);
  }, [isGameOver, currentTarget]);

  // Float balloons upwards
  useEffect(() => {
    if (isGameOver) return;

    const animTimer = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -20)
      );
    }, 40);

    return () => clearInterval(animTimer);
  }, [isGameOver]);

  const handleBalloonPop = (b: Balloon) => {
    sound.playPop();

    if (b.colorName === currentTarget.name) {
      sound.playCorrect();
      const newScore = score + 1;
      setScore(newScore);

      setBalloons((prev) => prev.filter((item) => item.id !== b.id));

      if (newScore >= 6) {
        setIsGameOver(true);
      } else if (newScore % 2 === 0) {
        // Change color target
        setTargetIdx((targetIdx + 1) % COLOR_TARGETS.length);
      }
    } else {
      sound.playWrong();
      sound.speak(`That is ${b.colorName}. Touch ${currentTarget.name}!`, 'en-US');
    }
  };

  const restartGame = () => {
    setTargetIdx(0);
    setScore(0);
    setBalloons([]);
    setIsGameOver(false);
  };

  return (
    <GameModalWrapper
      title="Pop The Color Balloons!"
      subtitle="Đập vỡ những quả bóng bay đúng màu sắc tiếng Anh"
      mascotEmoji="🎈"
      score={score}
      maxScore={6}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions={`Touch & Pop: [ ${currentTarget.name} ] (${currentTarget.vietnamese})`}
      audioInstruction={`Pop the ${currentTarget.name} balloon`}
    >
      <div className="w-full h-full relative rounded-3xl bg-gradient-to-b from-sky-200 via-sky-100 to-indigo-100 overflow-hidden border-3 border-sky-300 select-none">
        {/* Sky Clouds */}
        <div className="absolute top-4 left-6 text-3xl opacity-60 animate-float">☁️</div>
        <div className="absolute top-12 right-12 text-4xl opacity-50 animate-float" style={{ animationDelay: '1.4s' }}>☁️</div>

        {/* Color Target Banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 px-6 py-2.5 rounded-2xl shadow-lg border-2 border-sky-300 flex items-center gap-3 z-10">
          <span className="text-xs md:text-sm font-bold text-slate-700">Pop the color:</span>
          <span
            className={`px-4 py-1.5 text-white font-black text-lg md:text-xl rounded-xl shadow-md ${currentTarget.cssColor} animate-pulse-subtle`}
          >
            {currentTarget.name}
          </span>
          <button
            onClick={playVoice}
            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full"
            title="Nghe màu"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Rising Balloons */}
        {balloons.map((b) => (
          <button
            key={b.id}
            onClick={() => handleBalloonPop(b)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
            }}
            className={`absolute w-16 h-20 md:w-20 md:h-24 ${b.cssColor} rounded-full shadow-2xl flex flex-col items-center justify-center text-white border-2 border-white/50 active:scale-125 cursor-pointer transform -translate-x-1/2 transition-transform`}
          >
            <span className="font-black text-xs md:text-sm uppercase tracking-wider">{b.colorName}</span>
            <div className="absolute -bottom-2 w-1.5 h-3 bg-white/80 rounded-full" />
            <div className="absolute -bottom-6 w-0.5 h-4 bg-slate-400" />
          </button>
        ))}
      </div>
    </GameModalWrapper>
  );
};
