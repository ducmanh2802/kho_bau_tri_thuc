import React, { useEffect, useMemo } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { defaultRoundsPerTier, getTierMeta, pickDistinct, seededRng, shuffleSeeded } from '../../data/gameLevels';

interface AnimalSafariItem {
  englishName: string;
  vietnameseMeaning: string;
  emoji: string;
  soundCue: string;
}

interface AnimalRound {
  target: AnimalSafariItem;
  options: AnimalSafariItem[];
}

const SAFARI_ANIMALS: AnimalSafariItem[] = [
  { englishName: 'Dog', vietnameseMeaning: 'Con chó', emoji: '🐶', soundCue: 'Woof woof! Find the Dog!' },
  { englishName: 'Cat', vietnameseMeaning: 'Con mèo', emoji: '🐱', soundCue: 'Meow meow! Find the Cat!' },
  { englishName: 'Duck', vietnameseMeaning: 'Con vịt', emoji: '🦆', soundCue: 'Quack quack! Find the Duck!' },
  { englishName: 'Lion', vietnameseMeaning: 'Sư tử', emoji: '🦁', soundCue: 'Roar! Find the Lion!' },
  { englishName: 'Monkey', vietnameseMeaning: 'Con khỉ', emoji: '🐵', soundCue: 'Ooh ooh aah aah! Find the Monkey!' },
  { englishName: 'Elephant', vietnameseMeaning: 'Con voi', emoji: '🐘', soundCue: 'Paaah! Find the Elephant!' },
  { englishName: 'Giraffe', vietnameseMeaning: 'Hươu cao cổ', emoji: '🦒', soundCue: 'Munch! Find the Giraffe!' },
  { englishName: 'Zebra', vietnameseMeaning: 'Ngựa vằn', emoji: '🦓', soundCue: 'Bray! Find the Zebra!' },
  { englishName: 'Fox', vietnameseMeaning: 'Con cáo', emoji: '🦊', soundCue: 'Yip yip! Find the Fox!' },
  { englishName: 'Bear', vietnameseMeaning: 'Con gấu', emoji: '🐻', soundCue: 'Growl! Find the Bear!' },
  { englishName: 'Frog', vietnameseMeaning: 'Con ếch', emoji: '🐸', soundCue: 'Ribbit! Find the Frog!' },
  { englishName: 'Tiger', vietnameseMeaning: 'Con hổ', emoji: '🐯', soundCue: 'Grrr! Find the Tiger!' },
];

function buildAnimalRounds(tier: number): AnimalRound[] {
  const roundsPerTier = defaultRoundsPerTier();
  const count = roundsPerTier[tier - 1];
  const poolSize = tier <= 1 ? 4 : tier === 2 ? 5 : tier === 3 ? 6 : tier === 4 ? 8 : tier === 5 ? 10 : SAFARI_ANIMALS.length;
  const pool = SAFARI_ANIMALS.slice(0, poolSize);
  const rng = seededRng(9100 + tier * 59);
  const rounds: AnimalRound[] = [];
  for (let i = 0; i < count; i++) {
    const rngI = seededRng(9100 + tier * 59 + i * 271);
    const picked = pickDistinct(pool, 4, rngI);
    const shuffled = shuffleSeeded(picked, seededRng(9100 + tier * 59 + i * 853));
    rounds.push({ target: shuffled[0], options: shuffled });
  }
  return rounds;
}

export const EnglishAnimalSoundGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => defaultRoundsPerTier(), []);
  const stage = useGameStage({ gameId: 'animal_safari', roundsPerTier, advanceDelayMs: 1300 });

  const rounds = useMemo(() => buildAnimalRounds(stage.tier), [stage.tier]);
  const current = rounds[stage.roundIdx];

  const playVoice = () => {
    sound.speak(current.target.englishName, 'en-GB');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      sound.speak(`Find the ${current.target.englishName}!`, 'en-GB');
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.tier, stage.roundIdx]);

  const handlePickAnimal = (item: AnimalSafariItem) => {
    if (stage.locked) return;
    if (item.englishName === current.target.englishName) {
      sound.playCorrect();
      sound.speak(`Great job! This is a ${item.englishName}!`, 'en-GB');
      stage.submitCorrect();
    } else {
      sound.playWrong();
      sound.speak(`No, this is a ${item.englishName}. Find the ${current.target.englishName}!`, 'en-GB');
      stage.submitWrong();
    }
  };

  return (
    <GameModalWrapper
      title="Safari Tiếng Anh — Animal Explorer"
      subtitle="Lắng nghe tên loài vật bằng tiếng Anh và chạm đúng con thú"
      mascotEmoji="🦁"
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
      instructions={`Listen & find: [ ${current.target.englishName} ] (${current.target.vietnameseMeaning})`}
      audioInstruction={`Find the ${current.target.englishName}`}
      audioLang="en-GB"
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-emerald-100 via-yellow-50 to-emerald-200 rounded-3xl p-4 md:p-6 border-3 border-emerald-400 select-none">
        {/* Top Prompt with pronunciation button */}
        <div className="flex flex-col items-center my-auto">
          <div className="flex items-center gap-3 bg-white/95 px-6 py-3 rounded-3xl shadow-lg border-2 border-emerald-400">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Find the animal:</span>
              <span className="text-3xl md:text-4xl font-black text-emerald-950 font-display">
                {current.target.englishName}
              </span>
              <span className="text-xs text-slate-500 font-semibold block">({current.target.vietnameseMeaning})</span>
            </div>
            <button
              onClick={playVoice}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-md active:scale-95 transition-transform"
              title="Nghe phát âm"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Animal Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl">
          {current.options.map((animal, idx) => (
            <button
              key={idx}
              onClick={() => handlePickAnimal(animal)}
              disabled={stage.locked}
              className="p-4 bg-white/90 hover:bg-white border-3 border-emerald-200 hover:border-emerald-400 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="text-5xl md:text-6xl animate-pulse-subtle">{animal.emoji}</span>
              <span className="text-base font-black text-slate-800 font-display">
                {animal.englishName}
              </span>
              <span className="text-xs text-emerald-700 font-bold">{animal.vietnameseMeaning}</span>
            </button>
          ))}
        </div>
      </div>
    </GameModalWrapper>
  );
};