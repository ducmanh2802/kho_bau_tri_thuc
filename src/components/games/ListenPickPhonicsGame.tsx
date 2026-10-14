import React, { useEffect, useMemo } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { defaultRoundsPerTier, getTierMeta } from '../../data/gameLevels';
import { THEMES, buildPhonicsRounds } from '../../data/games/listen_pick';
import type { PhonicsCard, PhonicsRound } from '../../data/games/listen_pick';

export { THEMES, buildPhonicsRounds };

export const ListenPickPhonicsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => defaultRoundsPerTier(), []);
  const stage = useGameStage({ gameId: 'listen_pick', roundsPerTier, advanceDelayMs: 1200 });

  const rounds = useMemo(() => buildPhonicsRounds(stage.tier, stage.nonce), [stage.tier, stage.nonce]);
  const current = rounds[stage.roundIdx];

  const playVoice = () => {
    sound.speak(current.spokenPrompt);
  };

  useEffect(() => {
    const timer = setTimeout(() => playVoice(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.tier, stage.roundIdx]);

  const handlePick = (card: PhonicsCard) => {
    if (stage.locked) return;
    if (card.word === current.targetWord) {
      sound.playCorrect();
      sound.speak(`Chính xác! Đó là ${card.word}!`);
      stage.submitCorrect();
    } else {
      sound.playWrong();
      sound.speak(`Đây là ${card.word}, bé hãy nghe lại và chọn nhé!`);
      stage.submitWrong();
    }
  };

  return (
    <GameModalWrapper
      gameId="listen_pick"
      title="Đôi Tai Thính — Nghe & Chọn"
      subtitle="Lắng nghe âm thanh và chọn đúng hình ảnh tương ứng"
      mascotEmoji="🦉"
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
      instructions="Bé hãy bấm vào chiếc loa để nghe từ và chọn hình đúng!"
      audioInstruction="Hãy bấm vào chiếc loa để nghe và chọn hình đúng"
    >
      <div className="w-full max-w-xl flex flex-col items-center justify-center p-4">
        {/* Giant Speaker Button */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={playVoice}
            disabled={stage.locked}
            className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 rounded-full shadow-xl flex items-center justify-center border-4 border-white active:scale-95 transition-all cursor-pointer animate-pulse-subtle"
          >
            <Volume2 className="w-12 h-12 text-amber-950" />
          </button>
          <span className="text-xs md:text-sm font-black text-amber-900 mt-2 bg-white/80 px-4 py-1 rounded-full shadow-sm">
            Bấm vào loa để nghe lại 🔊
          </span>
        </div>

        {/* 4 Illustrated Cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {current.cards.map((c, idx) => (
            <button
              key={idx}
              onClick={() => handlePick(c)}
              disabled={stage.locked}
              className="p-4 bg-white hover:bg-amber-50 border-3 border-amber-300 hover:border-amber-500 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="text-5xl md:text-6xl">{c.emoji}</span>
              <span className="text-base md:text-lg font-black text-slate-800 tracking-wide font-display">
                {c.word}
              </span>
            </button>
          ))}
        </div>
      </div>
    </GameModalWrapper>
  );
};