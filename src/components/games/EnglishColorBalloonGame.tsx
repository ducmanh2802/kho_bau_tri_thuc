import React, { useEffect, useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta } from '../../data/gameLevels';

export interface ColorTarget {
  name: string;
  vietnamese: string;
  cssColor: string;
  hex: string;
}

// T02/A5 — palette limited to Grade-1 Kid's Box colours (WHITE instead of
// TURQUOISE; LIME dropped as beyond the syllabus).
export const COLOR_TARGETS: ColorTarget[] = [
  { name: 'RED', vietnamese: 'Màu đỏ', cssColor: 'bg-red-500', hex: '#EF4444' },
  { name: 'BLUE', vietnamese: 'Màu xanh dương', cssColor: 'bg-blue-500', hex: '#3B82F6' },
  { name: 'GREEN', vietnamese: 'Màu xanh lá', cssColor: 'bg-emerald-500', hex: '#10B981' },
  { name: 'YELLOW', vietnamese: 'Màu vàng', cssColor: 'bg-amber-400', hex: '#FBBF24' },
  { name: 'PURPLE', vietnamese: 'Màu tím', cssColor: 'bg-purple-500', hex: '#8B5CF6' },
  { name: 'ORANGE', vietnamese: 'Màu cam', cssColor: 'bg-orange-500', hex: '#F97316' },
  { name: 'PINK', vietnamese: 'Màu hồng', cssColor: 'bg-pink-500', hex: '#EC4899' },
  { name: 'BLACK', vietnamese: 'Màu đen', cssColor: 'bg-slate-900', hex: '#1F2937' },
  { name: 'WHITE', vietnamese: 'Màu trắng', cssColor: 'bg-white', hex: '#FFFFFF' },
  { name: 'BROWN', vietnamese: 'Màu nâu', cssColor: 'bg-amber-900', hex: '#78350F' },
  { name: 'GRAY', vietnamese: 'Màu xám', cssColor: 'bg-slate-500', hex: '#6B7280' },
];

const TIER_GOALS = GAME_LEVEL_POLICY.TIERS.map((t, i) => 5 + (i < 3 ? i : 3));

interface Balloon {
  id: number;
  colorName: string;
  cssColor: string;
  x: number;
  y: number;
  speed: number;
}

const TIER_CONFIG: { colorCount: number; spawnMs: number; speedMin: number; speedMax: number }[] = [
  { colorCount: 5, spawnMs: 1100, speedMin: 0.4, speedMax: 0.55 },
  { colorCount: 7, spawnMs: 1000, speedMin: 0.42, speedMax: 0.6 },
  { colorCount: 8, spawnMs: 900, speedMin: 0.44, speedMax: 0.66 },
  { colorCount: 9, spawnMs: 820, speedMin: 0.46, speedMax: 0.7 },
  { colorCount: 10, spawnMs: 720, speedMin: 0.5, speedMax: 0.78 },
  { colorCount: 11, spawnMs: 620, speedMin: 0.54, speedMax: 0.9 },
];

export const EnglishColorBalloonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => TIER_GOALS, []);
  const stage = useGameStage({ gameId: 'color_balloon', roundsPerTier, advanceDelayMs: 900 });
  const [targetIdx, setTargetIdx] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  const config = TIER_CONFIG[Math.min(stage.tier - 1, TIER_CONFIG.length - 1)];
  const palette = COLOR_TARGETS.slice(0, config.colorCount);
  const currentTarget = palette[targetIdx % palette.length];

  const playVoice = () => {
    sound.speak(`Pop the ${currentTarget.name} balloon!`, 'en-GB');
  };

  useEffect(() => {
    setBalloons([]);
    setTargetIdx(0);
    window.setTimeout(playVoice, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.tier]);

  // Spawn balloons
  useEffect(() => {
    if (stage.phase !== 'playing') return;
    const timer = setInterval(() => {
      const isTarget = Math.random() < 0.5;
      const chosenColor = isTarget
        ? currentTarget
        : palette[Math.floor(Math.random() * palette.length)];

      const newBalloon: Balloon = {
        id: Date.now() + Math.random(),
        colorName: chosenColor.name,
        cssColor: chosenColor.cssColor,
        x: Math.floor(Math.random() * 70) + 15,
        y: 110,
        speed: Math.random() * (config.speedMax - config.speedMin) + config.speedMin,
      };

      setBalloons((prev) => [...prev.slice(-10), newBalloon]);
    }, config.spawnMs);

    return () => clearInterval(timer);
  }, [stage.phase, stage.tier, currentTarget, config]);

  // Float balloons upwards
  useEffect(() => {
    if (stage.phase !== 'playing') return;

    const animTimer = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -20)
      );
    }, 40);

    return () => clearInterval(animTimer);
  }, [stage.phase, stage.tier]);

  const handleBalloonPop = (b: Balloon) => {
    if (stage.locked || stage.phase !== 'playing') return;
    sound.playPop();

    if (b.colorName === currentTarget.name) {
      sound.playCorrect();
      setBalloons((prev) => prev.filter((item) => item.id !== b.id));
      if (stage.roundNumber % 2 === 0) {
        setTargetIdx((ti) => (ti + 1) % palette.length);
      }
      stage.submitCorrect();
    } else {
      sound.playWrong();
      sound.speak(`That is ${b.colorName}. Touch ${currentTarget.name}!`, 'en-GB');
      stage.submitWrong();
    }
  };

  return (
    <GameModalWrapper
      gameId="color_balloon"
      title="Pop The Color Balloons!"
      subtitle="Đập vỡ những quả bóng bay đúng màu sắc tiếng Anh"
      mascotEmoji="🎈"
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
      instructions={`Touch & Pop: [ ${currentTarget.name} ] (${currentTarget.vietnamese})`}
      audioInstruction={`Pop the ${currentTarget.name} balloon`}
      audioLang="en-GB"
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