import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { useGameStage } from '../../hooks/useGameStage';
import { sound } from '../../services/sound';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';

export interface PhonicsItem {
  word: string;
  vietnamese: string;
  emoji: string;
  sound: string;
  options: string[];
  answer: string;
}

export const POOLS: PhonicsItem[][] = [
  [
    { word: 'CAT', vietnamese: 'con mèo', emoji: '🐱', sound: 'k', options: ['C', 'B', 'D'], answer: 'C' },
    { word: 'DOG', vietnamese: 'con chó', emoji: '🐶', sound: 'd', options: ['D', 'B', 'P'], answer: 'D' },
    { word: 'APPLE', vietnamese: 'quả táo', emoji: '🍎', sound: 'a', options: ['A', 'E', 'O'], answer: 'A' },
    { word: 'BALL', vietnamese: 'quả bóng', emoji: '⚽', sound: 'b', options: ['B', 'D', 'P'], answer: 'B' },
    { word: 'FISH', vietnamese: 'con cá', emoji: '🐟', sound: 'f', options: ['F', 'V', 'P'], answer: 'F' },
    { word: 'EGG', vietnamese: 'quả trứng', emoji: '🥚', sound: 'e', options: ['E', 'A', 'I'], answer: 'E' },
  ],
  [
    { word: 'SUN', vietnamese: 'mặt trời', emoji: '☀️', sound: 's', options: ['S', 'X', 'Z'], answer: 'S' },
    { word: 'MOON', vietnamese: 'mặt trăng', emoji: '🌙', sound: 'm', options: ['M', 'N', 'W'], answer: 'M' },
    { word: 'PIG', vietnamese: 'con lợn', emoji: '🐷', sound: 'p', options: ['P', 'B', 'D'], answer: 'P' },
    { word: 'LION', vietnamese: 'con sư tử', emoji: '🦁', sound: 'l', options: ['L', 'R', 'N'], answer: 'L' },
    { word: 'TIGER', vietnamese: 'con hổ', emoji: '🐯', sound: 't', options: ['T', 'D', 'J'], answer: 'T' },
    { word: 'HEN', vietnamese: 'con gà mái', emoji: '🐔', sound: 'h', options: ['H', 'K', 'G'], answer: 'H' },
  ],
  [
    { word: 'SHIP', vietnamese: 'con tàu', emoji: '🚢', sound: 'sh', options: ['SH', 'S', 'CH'], answer: 'SH' },
    { word: 'CHICK', vietnamese: 'gà con', emoji: '🐤', sound: 'ch', options: ['CH', 'SH', 'TH'], answer: 'CH' },
    { word: 'THIN', vietnamese: 'gầy, mỏng', emoji: '🧍', sound: 'th', options: ['TH', 'T', 'H'], answer: 'TH' },
    { word: 'PHONE', vietnamese: 'điện thoại', emoji: '📞', sound: 'ph', options: ['PH', 'P', 'F'], answer: 'PH' },
    { word: 'KITE', vietnamese: 'cái diều', emoji: '🪁', sound: 'k', options: ['K', 'C', 'G'], answer: 'K' },
    { word: 'ZEBRA', vietnamese: 'ngựa vằn', emoji: '🦓', sound: 'z', options: ['Z', 'S', 'X'], answer: 'Z' },
  ],
  [
    { word: 'RED', vietnamese: 'màu đỏ', emoji: '🔴', sound: 'r', options: ['R', 'L', 'W'], answer: 'R' },
    { word: 'BLUE', vietnamese: 'màu xanh', emoji: '🔵', sound: 'b', options: ['BL', 'B', 'BR'], answer: 'BL' },
    { word: 'GREEN', vietnamese: 'màu xanh lá', emoji: '🟢', sound: 'gr', options: ['GR', 'G', 'R'], answer: 'GR' },
    { word: 'STAR', vietnamese: 'ngôi sao', emoji: '⭐', sound: 'st', options: ['ST', 'S', 'T'], answer: 'ST' },
    { word: 'FROG', vietnamese: 'con ếch', emoji: '🐸', sound: 'fr', options: ['FR', 'F', 'R'], answer: 'FR' },
    { word: 'CLOCK', vietnamese: 'đồng hồ', emoji: '⏰', sound: 'cl', options: ['CL', 'C', 'K'], answer: 'CL' },
  ],
  [
    { word: 'ORANGE', vietnamese: 'quả cam', emoji: '🍊', sound: 'o', options: ['O', 'A', 'E'], answer: 'O' },
    { word: 'TWO', vietnamese: 'số hai', emoji: '2️⃣', sound: 't', options: ['T', 'W', 'O'], answer: 'T' },
    { word: 'THREE', vietnamese: 'số ba', emoji: '3️⃣', sound: 'th', options: ['TH', 'T', 'H'], answer: 'TH' },
    { word: 'FIVE', vietnamese: 'số năm', emoji: '5️⃣', sound: 'f', options: ['F', 'V', 'PH'], answer: 'F' },
    { word: 'MOTHER', vietnamese: 'mẹ', emoji: '👩', sound: 'm', options: ['M', 'N', 'TH'], answer: 'M' },
    { word: 'FATHER', vietnamese: 'bố', emoji: '👨', sound: 'f', options: ['F', 'PH', 'V'], answer: 'F' },
  ],
  [
    { word: 'SCHOOL', vietnamese: 'trường học', emoji: '🏫', sound: 's', options: ['S', 'C', 'H'], answer: 'S' },
    { word: 'BOOK', vietnamese: 'quyển sách', emoji: '📖', sound: 'b', options: ['B', 'P', 'D'], answer: 'B' },
    { word: 'PENCIL', vietnamese: 'bút chì', emoji: '✏️', sound: 'p', options: ['P', 'B', 'Q'], answer: 'P' },
    { word: 'FRIEND', vietnamese: 'bạn bè', emoji: '🧒', sound: 'fr', options: ['FR', 'F', 'FL'], answer: 'FR' },
    { word: 'HAPPY', vietnamese: 'vui vẻ', emoji: '😊', sound: 'h', options: ['H', 'Y', 'P'], answer: 'H' },
    { word: 'JUMP', vietnamese: 'nhảy', emoji: '🤸', sound: 'j', options: ['J', 'G', 'Y'], answer: 'J' },
  ],
];

export const PhonicsPopGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => GAME_LEVEL_POLICY.ROUNDS_PER_TIER.slice() as unknown as number[], []);
  const stage = useGameStage({ gameId: 'phonics_pop', roundsPerTier, advanceDelayMs: 900 });
  const [picked, setPicked] = useState<string | null>(null);

  const pool = POOLS[Math.min(stage.tier - 1, POOLS.length - 1)];
  const item = useMemo(() => {
    const list = shuffleSeeded(pool, seededRng(stage.tier * 3000 + 5 + stage.nonce * 101));
    return list[stage.roundIdx % list.length];
  }, [pool, stage.tier, stage.roundIdx, stage.nonce]);
  const options = useMemo(
    () => shuffleSeeded(item.options, seededRng(stage.tier * 911 + stage.roundIdx * 37 + stage.nonce * 17)),
    [item, stage.tier, stage.roundIdx, stage.nonce]
  );

  const speakWord = () => sound.speak(item.word, 'en-GB');

  const choose = (opt: string) => {
    if (stage.locked || stage.phase !== 'playing') return;
    setPicked(opt);
    if (opt === item.answer) {
      sound.playCorrect();
      sound.speak(`Great! ${item.word}!`, 'en-GB');
      stage.submitCorrect();
      setTimeout(() => setPicked(null), 900);
    } else {
      sound.playWrong();
      sound.speak(`Listen again: ${item.word}`, 'en-GB');
      stage.submitWrong();
      setTimeout(() => setPicked(null), 900);
    }
  };

  return (
    <GameModalWrapper
      gameId="phonics_pop"
      title="Phonics Pop — Bắn Âm Tiếng Anh"
      subtitle="Nghe từ, chọn âm đầu đúng theo giọng Anh-Anh"
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
      instructions={`What is the beginning sound of "${item.word}" (${item.vietnamese})?`}
      audioInstruction={`What is the beginning sound of ${item.word}?`}
      audioLang="en-GB"
    >
      <div className="w-full max-w-2xl mx-auto text-center space-y-4 kb-game-stage animate-rise">
        <button onClick={speakWord} className="text-8xl hover:scale-110 transition-transform cursor-pointer" title="Nghe từ">
          {item.emoji}
        </button>
        <div>
          <p className="text-3xl font-black tracking-widest text-slate-900 font-display">{item.word}</p>
          <p className="text-sm font-bold text-slate-500">{item.vietnamese} • Bấm loa để nghe 🔊</p>
        </div>
        <p className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5 inline-block">
          Chọn ÂM ĐẦU đúng — Beginning sound
        </p>
        <div className="grid grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`min-h-[64px] rounded-2xl font-black text-2xl border-3 transition-all active:scale-95 cursor-pointer ${
                picked === opt
                  ? opt === item.answer
                    ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                    : 'bg-rose-500 text-white border-rose-600'
                  : 'bg-gradient-to-b from-amber-300 to-orange-400 text-white border-orange-400 shadow-lg hover:scale-105'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </GameModalWrapper>
  );
};
