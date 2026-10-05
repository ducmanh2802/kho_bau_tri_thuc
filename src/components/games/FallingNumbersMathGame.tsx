import React, { useState, useEffect, useRef } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

interface FallingBall {
  id: number;
  val: number;
  x: number; // percentage
  y: number; // percentage
  speed: number;
  color: string;
}

const BALL_COLORS = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];

export const FallingNumbersMathGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [condition, setCondition] = useState<{ text: string; check: (n: number) => boolean; speech: string }>({
    text: 'LỚN HƠN 5 (> 5)',
    check: (n) => n > 5,
    speech: 'Hứng các quả bóng có số lớn hơn năm',
  });
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState<FallingBall[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const nextId = useRef(1);

  const initGame = () => {
    setScore(0);
    setIsGameOver(false);
    setBalls([]);
    setCondition({
      text: 'LỚN HƠN 5 (> 5)',
      check: (n) => n > 5,
      speech: 'Hứng các quả bóng có số lớn hơn năm',
    });
    sound.speak('Hãy hứng các quả bóng có số lớn hơn năm nhé!');
  };

  useEffect(() => {
    initGame();
  }, []);

  // Spawn falling balls
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      const val = Math.floor(Math.random() * 10) + 1; // 1 to 10
      const newBall: FallingBall = {
        id: nextId.current++,
        val,
        x: Math.floor(Math.random() * 75) + 12,
        y: -10,
        speed: Math.random() * 0.4 + 0.35,
        color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      };
      setBalls((prev) => [...prev.slice(-10), newBall]);
    }, 1100);

    return () => clearInterval(timer);
  }, [isGameOver]);

  // Falling animation
  useEffect(() => {
    if (isGameOver) return;

    const animTimer = setInterval(() => {
      setBalls((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + b.speed }))
          .filter((b) => b.y < 105)
      );
    }, 40);

    return () => clearInterval(animTimer);
  }, [isGameOver]);

  const handleBallClick = (ball: FallingBall) => {
    if (condition.check(ball.val)) {
      sound.playCorrect();
      const newScore = score + 1;
      setScore(newScore);

      setBalls((prev) => prev.filter((b) => b.id !== ball.id));

      if (newScore >= 6) {
        setIsGameOver(true);
      } else if (newScore === 3) {
        // Change condition to Keep interest high!
        setCondition({
          text: 'BÉ HƠN 6 (< 6)',
          check: (n) => n < 6,
          speech: 'Bây giờ hứng các số bé hơn sáu nhé',
        });
        sound.speak('Giỏi lắm! Bây giờ hãy hứng các quả bóng có số bé hơn sáu nhé!');
      }
    } else {
      sound.playWrong();
      sound.speak(`Số ${ball.val} không thỏa mãn điều kiện, bé tìm lại nhé!`);
    }
  };

  return (
    <GameModalWrapper
      title="Hứng Số Rơi Rộn Ràng"
      subtitle="Bé nhanh tay chạm vào các quả bóng số đúng yêu cầu"
      mascotEmoji="🦊"
      score={score}
      maxScore={6}
      isGameOver={isGameOver}
      onRestart={initGame}
      onExit={onExit}
      instructions={`Bé ơi! Hãy chạm vào các bóng có số: [ ${condition.text} ]`}
      audioInstruction={condition.speech}
    >
      <div className="w-full h-full relative rounded-3xl bg-gradient-to-b from-indigo-200 via-sky-100 to-amber-100 overflow-hidden border-2 border-indigo-300 p-4 select-none">
        {/* Sky Stars */}
        <div className="absolute top-6 left-10 text-3xl opacity-50 animate-float">⭐</div>
        <div className="absolute top-12 right-12 text-4xl opacity-50 animate-float" style={{ animationDelay: '1.2s' }}>🌟</div>

        {/* Condition Banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 px-6 py-2.5 rounded-2xl shadow-lg border-2 border-indigo-300 flex items-center gap-3 z-10">
          <span className="text-xs md:text-sm font-bold text-slate-700">Quy tắc hứng:</span>
          <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-base md:text-lg rounded-xl shadow-sm animate-pulse-subtle">
            {condition.text}
          </span>
          <button
            onClick={() => sound.speak(condition.speech)}
            className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-1 rounded-lg font-bold"
          >
            🔊 Nghe
          </button>
        </div>

        {/* Falling Balls */}
        {balls.map((b) => (
          <button
            key={b.id}
            onClick={() => handleBallClick(b)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
            }}
            className={`absolute w-14 h-14 md:w-16 md:h-16 ${b.color} text-white font-black text-2xl md:text-3xl rounded-full shadow-xl flex items-center justify-center border-4 border-white/80 active:scale-125 cursor-pointer transform -translate-x-1/2 transition-transform`}
          >
            {b.val}
          </button>
        ))}

        {/* Bottom Basket */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-800 text-white px-8 py-2 rounded-2xl border-4 border-amber-950 shadow-2xl flex items-center gap-2">
          <span className="text-3xl">🧺</span>
          <span className="text-xs md:text-sm font-black">Rổ Hứng Số Thần Kỳ</span>
        </div>
      </div>
    </GameModalWrapper>
  );
};
