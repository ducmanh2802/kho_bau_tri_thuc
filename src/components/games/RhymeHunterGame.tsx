import React, { useEffect, useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { useGameStage } from '../../hooks/useGameStage';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta, pickDistinct, seededRng, shuffleSeeded } from '../../data/gameLevels';

interface RhymeFruit {
  id: string;
  word: string;
  hasRhyme: boolean;
  emoji: string;
  picked: boolean;
}

interface RhymeRound {
  targetRhyme: string;
  targetDescription: string;
  fruits: RhymeFruit[];
}

const RHYME_FAMILIES: { rhyme: string; words: string[] }[] = [
  { rhyme: 'an', words: ['cái bàn', 'bạn Lan', 'cái can'] },
  { rhyme: 'on', words: ['chú thỏ con', 'lon ton', 'ngọn cỏ'] },
  { rhyme: 'at', words: ['hạt cát', 'ca hát', 'bát ngát'] },
  { rhyme: 'ach', words: ['quyển sách', 'tách trà', 'vá rách'] },
  { rhyme: 'anh', words: ['cây xanh', 'anh trai', 'bức tranh'] },
  { rhyme: 'ay', words: ['máy bay', 'đôi tay', 'cỏ may'] },
];

const DISTRACTOR_POOL = [
  'con cá', 'hoa sen', 'mặt trời', 'quả cam', 'búp bê',
  'con vịt', 'cây bàng', 'củ cà rốt', 'quả táo', 'đám mây',
  'con chó', 'bông hồng', 'chú mèo', 'cái ghế', 'quả chuối',
];

const FRUIT_EMOJI = ['🍎', '🍐', '🍊', '🍑', '🍓', '🍇', '🍉', '🍒', '🥭', '🍌'] as const;

const ROUNDS_PER_TIER = GAME_LEVEL_POLICY.TIERS.map(() => 3);

function buildRhymeRounds(tier: number): RhymeRound[] {
  const rng = seededRng(5600 + tier * 61);
  const fams = pickDistinct(RHYME_FAMILIES, 3, rng);
  const targetCount = tier <= 2 ? 2 : tier <= 4 ? 3 : 4;
  const rounds: RhymeRound[] = [];
  let fruitId = 0;
  for (const fam of fams) {
    const targets = pickDistinct(fam.words, 3, rng).slice(0, targetCount);
    const distractorCount = Math.max(2, 6 - targetCount);
    const distractors = pickDistinct(
      DISTRACTOR_POOL.filter((w) => !fam.words.includes(w)),
      distractorCount,
      seededRng(5600 + tier * 61 + rounds.length * 101)
    );
    const fruits: RhymeFruit[] = [
      ...targets.map((w) => ({ id: `r${rounds.length}-${fruitId++}`, word: w, hasRhyme: true, emoji: FRUIT_EMOJI[Math.floor(rng() * FRUIT_EMOJI.length)], picked: false })),
      ...distractors.map((w) => ({ id: `r${rounds.length}-${fruitId++}`, word: w, hasRhyme: false, emoji: FRUIT_EMOJI[Math.floor(rng() * FRUIT_EMOJI.length)], picked: false })),
    ];
    rounds.push({
      targetRhyme: fam.rhyme,
      targetDescription: `vần "${fam.rhyme.toUpperCase()}"`,
      fruits: shuffleSeeded(fruits, seededRng(5600 + tier * 61 + rounds.length * 733)),
    });
  }
  return rounds;
}

export const RhymeHunterGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const stage = useGameStage({ gameId: 'rhyme_hunter', roundsPerTier: ROUNDS_PER_TIER, advanceDelayMs: 1200 });
  const [roundsState, setRoundsState] = useState<RhymeRound[]>([]);

  const rounds = useMemo(() => buildRhymeRounds(stage.tier), [stage.tier]);

  useEffect(() => {
    setRoundsState(rounds.map((r) => ({ ...r, fruits: r.fruits.map((f) => ({ ...f, picked: false })) })));
  }, [rounds]);

  const currentRound = roundsState[stage.roundIdx];
  if (!currentRound) return null;

  const remainingInRound = currentRound.fruits.filter((f) => f.hasRhyme && !f.picked).length;

  const handleFruitClick = (fruitId: string) => {
    if (stage.locked) return;
    const fruit = currentRound.fruits.find((f) => f.id === fruitId);
    if (!fruit || fruit.picked) return;

    if (fruit.hasRhyme) {
      sound.playCorrect();
      sound.speak(`Đúng rồi! "${fruit.word}" có ${currentRound.targetDescription}!`);

      const updated = roundsState.map((r, ri) =>
        ri === stage.roundIdx
          ? { ...r, fruits: r.fruits.map((f) => (f.id === fruitId ? { ...f, picked: true } : f)) }
          : r
      );
      setRoundsState(updated);

      const stillRemaining = updated[stage.roundIdx].fruits.filter((f) => f.hasRhyme && !f.picked).length;
      if (stillRemaining === 0) {
        sound.playStar();
        stage.submitCorrect();
      }
    } else {
      sound.playWrong();
      sound.speak(`Từ "${fruit.word}" chưa đúng rồi, bé hãy tìm quả có ${currentRound.targetDescription} nhé!`);
      stage.submitWrong();
    }
  };

  return (
    <GameModalWrapper
      title="Săn Vần Trong Vườn Cây"
      subtitle="Hái những trái cây ngọt ngào chứa vần được yêu cầu"
      mascotEmoji="🐰"
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
      earnedStars={1}
      onRestart={stage.restartGame}
      onExit={onExit}
      instructions={`Bé hãy hái các quả mang từ chứa [ ${currentRound.targetDescription} ]!`}
      audioInstruction={`Hãy hái các quả chứa ${currentRound.targetDescription}`}
    >
      <div className="w-full h-full relative rounded-3xl bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200 overflow-hidden border-2 border-emerald-300 p-4 flex flex-col justify-between">
        {/* Mission HUD */}
        <div className="bg-white/95 px-6 py-2.5 rounded-2xl shadow-md border-2 border-emerald-300 self-center flex items-center gap-3 z-10">
          <span className="text-sm font-bold text-emerald-900">Nhiệm vụ: Tìm quả có</span>
          <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-xl rounded-xl shadow-sm">
            {currentRound.targetDescription}
          </span>
          <span className="text-xs text-slate-500 font-semibold">(Còn {remainingInRound} quả)</span>
        </div>

        {/* Tree and Fruits Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 items-center justify-items-center max-w-xl mx-auto my-auto w-full">
          {currentRound.fruits.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFruitClick(f.id)}
              disabled={f.picked || stage.locked}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer w-full max-w-[150px] ${
                f.picked
                  ? 'opacity-20 scale-90 border-slate-300 bg-slate-100'
                  : 'bg-white/90 hover:bg-white border-amber-300 hover:border-amber-400 shadow-md hover:scale-105'
              }`}
            >
              <span className="text-4xl md:text-5xl mb-1 animate-pulse-subtle">{f.emoji}</span>
              <span className="text-sm md:text-base font-black text-amber-950 tracking-wide">
                {f.word}
              </span>
              <span className="text-[10px] text-blue-600 font-bold mt-0.5">Bấm để hái</span>
            </button>
          ))}
        </div>

        {/* Bottom Basket */}
        <div className="self-center bg-amber-800 text-amber-100 px-6 py-2 rounded-2xl border-4 border-amber-900 shadow-lg flex items-center gap-3">
          <span className="text-2xl">🧺</span>
          <span className="text-xs md:text-sm font-bold">Giỏ trái cây thần kỳ: Đã hái {stage.score} quả đúng!</span>
        </div>
      </div>
    </GameModalWrapper>
  );
};