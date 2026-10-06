import React, { useState, useEffect, useRef } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

interface FallingBubble {
  id: number;
  char: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage 0% to 100%
  speed: number;
  color: string;
}

const LETTERS_POOL = ['A', 'B', 'C', 'D', 'Đ', 'E', 'Ê', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'Ô', 'Ơ', 'U', 'Ư'];
const BUBBLE_COLORS = ['bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-purple-400', 'bg-pink-400'];

export const CatchFallingLettersGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [targetChar, setTargetChar] = useState<string>('A');
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<FallingBubble[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const nextId = useRef(1);

  // Pick new target
  const pickNewTarget = () => {
    const randomChar = LETTERS_POOL[Math.floor(Math.random() * LETTERS_POOL.length)];
    setTargetChar(randomChar);
    sound.speak(`Hãy tìm và bắt chữ ${randomChar} nhé!`);
  };

  const initGame = () => {
    setScore(0);
    setIsGameOver(false);
    setBubbles([]);
    pickNewTarget();
  };

  useEffect(() => {
    initGame();
  }, []);

  // Spawn bubbles periodically
  useEffect(() => {
    if (isGameOver) return;

    const spawnTimer = setInterval(() => {
      // 40% chance of spawning the target character
      const isTarget = Math.random() < 0.45;
      const char = isTarget
        ? targetChar
        : LETTERS_POOL[Math.floor(Math.random() * LETTERS_POOL.length)];

      const newBubble: FallingBubble = {
        id: nextId.current++,
        char,
        x: Math.floor(Math.random() * 75) + 10,
        y: -10,
        speed: Math.random() * 0.4 + 0.35,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      };

      setBubbles((prev) => [...prev.slice(-12), newBubble]);
    }, 1100);

    return () => clearInterval(spawnTimer);
  }, [isGameOver, targetChar]);

  // Bubble animation loop
  useEffect(() => {
    if (isGameOver) return;

    const animTimer = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + b.speed }))
          .filter((b) => b.y < 105)
      );
    }, 40);

    return () => clearInterval(animTimer);
  }, [isGameOver]);

  const handleBubbleClick = (bubble: FallingBubble) => {
    if (bubble.char === targetChar) {
      sound.playCorrect();
      const newScore = score + 1;
      setScore(newScore);

      // Pop effect: remove clicked bubble
      setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

      if (newScore >= 6) {
        setIsGameOver(true);
      } else {
        // Change target every 2 successful catches
        if (newScore % 2 === 0) {
          pickNewTarget();
        }
      }
    } else {
      sound.playWrong();
      sound.speak(`Đây là chữ ${bubble.char}, bé tìm chữ ${targetChar} nhé!`);
    }
  };

  return (
    <GameModalWrapper
      title="Bắt Chữ Cái Bay"
      subtitle="Bé nhanh tay chạm vào đúng chữ cái được yêu cầu nhé!"
      mascotEmoji="🐻"
      score={score}
      maxScore={6}
      isGameOver={isGameOver}
      onRestart={initGame}
      onExit={onExit}
      instructions={`Bé ơi! Hãy chạm vào các bóng bóng mang chữ: [ ${targetChar} ]`}
      audioInstruction={`Hãy chạm vào các bong bóng mang chữ ${targetChar}`}
    >
      <div className="w-full h-full relative rounded-2xl bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 overflow-hidden border-2 border-sky-300 select-none">
        {/* Sky Clouds and decor */}
        <div className="absolute top-4 left-6 text-4xl opacity-70 animate-float">☁️</div>
        <div className="absolute top-10 right-10 text-5xl opacity-60 animate-float" style={{ animationDelay: '1.5s' }}>☁️</div>
        <div className="absolute bottom-2 left-0 right-0 h-14 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-b-xl flex items-center justify-around text-2xl">
          <span>🌻</span>
          <span>🌳</span>
          <span>🌷</span>
          <span>🏡</span>
          <span>🌻</span>
        </div>

        {/* Target display HUD — max-w keeps it inside 200%-zoom widths. */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 max-w-[calc(100%-0.75rem)] bg-white/95 px-3 md:px-6 py-2 rounded-2xl shadow-lg border-2 border-amber-300 flex items-center gap-2 md:gap-3 z-10">
          <span className="text-xs md:text-sm font-bold text-amber-900 whitespace-nowrap">Bé cần bắt chữ:</span>
          <span className="w-10 h-10 md:w-12 md:h-12 bg-amber-400 text-amber-950 font-black text-2xl md:text-3xl rounded-xl flex items-center justify-center shadow-md animate-pulse-subtle shrink-0">
            {targetChar}
          </span>
          <button
            onClick={() => sound.speak(`Bắt chữ ${targetChar}`)}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 min-h-[44px] rounded-lg font-bold shrink-0"
          >
            🔊 Nghe
          </button>
        </div>

        {/* Floating / Falling Bubbles */}
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => handleBubbleClick(b)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              transition: 'transform 0.15s ease',
            }}
            className={`absolute w-14 h-14 md:w-16 md:h-16 ${b.color} text-white font-black text-2xl md:text-3xl rounded-full shadow-lg flex items-center justify-center border-4 border-white/80 active:scale-125 cursor-pointer transform -translate-x-1/2`}
          >
            {b.char}
          </button>
        ))}
      </div>
    </GameModalWrapper>
  );
};
