import React, { useEffect, useMemo } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { defaultRoundsPerTier, getTierMeta, pickDistinct, seededRng } from '../../data/gameLevels';

interface PhonicsCard {
  word: string;
  emoji: string;
  spokenText: string;
}

interface PhonicsRound {
  spokenPrompt: string;
  targetWord: string;
  cards: PhonicsCard[];
}

const THEMES: { name: string; words: { word: string; emoji: string }[] }[] = [
  {
    name: 'con vật',
    words: [
      { word: 'Con mèo', emoji: '🐱' },
      { word: 'Con cá', emoji: '🐟' },
      { word: 'Con chó', emoji: '🐶' },
      { word: 'Con gà', emoji: '🐓' },
      { word: 'Con vịt', emoji: '🦆' },
      { word: 'Con thỏ', emoji: '🐰' },
    ],
  },
  {
    name: 'quả cây',
    words: [
      { word: 'Quả cam', emoji: '🍊' },
      { word: 'Quả chuối', emoji: '🍌' },
      { word: 'Quả táo', emoji: '🍎' },
      { word: 'Quả dưa hấu', emoji: '🍉' },
      { word: 'Quả nho', emoji: '🍇' },
      { word: 'Quả lê', emoji: '🍐' },
    ],
  },
  {
    name: 'đồ dùng học tập',
    words: [
      { word: 'Quyển sách', emoji: '📖' },
      { word: 'Cây bút', emoji: '✏️' },
      { word: 'Cái cặp', emoji: '🎒' },
      { word: 'Thước kẻ', emoji: '📏' },
      { word: 'Cái bảng', emoji: '📋' },
      { word: 'Hộp màu', emoji: '🖍️' },
    ],
  },
  {
    name: 'thiên nhiên',
    words: [
      { word: 'Mặt trời', emoji: '☀️' },
      { word: 'Mặt trăng', emoji: '🌙' },
      { word: 'Ngôi sao', emoji: '⭐' },
      { word: 'Đám mây', emoji: '☁️' },
      { word: 'Cầu vồng', emoji: '🌈' },
      { word: 'Ngọn gió', emoji: '🌬️' },
    ],
  },
  {
    name: 'đồ vật gia đình',
    words: [
      { word: 'Chiếc ghế', emoji: '🪑' },
      { word: 'Cái quạt', emoji: '🪭' },
      { word: 'Chiếc đèn', emoji: '💡' },
      { word: 'Cái nồi', emoji: '🍲' },
      { word: 'Cái chổi', emoji: '🧹' },
      { word: 'Cái tủ', emoji: '🗄️' },
    ],
  },
  {
    name: 'đồ ăn',
    words: [
      { word: 'Bánh mì', emoji: '🍞' },
      { word: 'Quả trứng', emoji: '🥚' },
      { word: 'Cốc sữa', emoji: '🥛' },
      { word: 'Đĩa cơm', emoji: '🍚' },
      { word: 'Cốc nước', emoji: '🥤' },
      { word: 'Củ cà rốt', emoji: '🥕' },
    ],
  },
];

function buildPhonicsRounds(tier: number): PhonicsRound[] {
  const roundsPerTier = defaultRoundsPerTier();
  const count = roundsPerTier[tier - 1];
  const rng = seededRng(7800 + tier * 47);
  // Tier 1-2 stay inside easy visual themes; higher tiers blend themes.
  const themeCount = tier <= 1 ? 1 : tier <= 3 ? 2 : tier <= 5 ? 3 : THEMES.length;
  const themes = pickDistinct(THEMES, themeCount, seededRng(7800 + tier * 61));
  const rounds: PhonicsRound[] = [];
  for (let i = 0; i < count; i++) {
    const theme = themes[i % themes.length];
    const rngI = seededRng(7800 + tier * 47 + i * 331);
    const picked = pickDistinct(theme.words, 4, rngI);
    const target = picked[0];
    rounds.push({
      spokenPrompt: target.word,
      targetWord: target.word,
      cards: picked.map((w) => ({ word: w.word, emoji: w.emoji, spokenText: w.word })),
    });
  }
  return rounds;
}

export const ListenPickPhonicsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => defaultRoundsPerTier(), []);
  const stage = useGameStage({ gameId: 'listen_pick', roundsPerTier, advanceDelayMs: 1200 });

  const rounds = useMemo(() => buildPhonicsRounds(stage.tier), [stage.tier]);
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