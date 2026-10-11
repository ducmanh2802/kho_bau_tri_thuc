import React, { useEffect, useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { RotateCcw } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { defaultRoundsPerTier, getTierMeta, pickDistinct, seededRng } from '../../data/gameLevels';

interface SentenceLevel {
  correctWords: string[];
  meaning: string;
  emoji: string;
}

const SENTENCE_POOL: { words: string[]; meaning: string; emoji: string }[] = [
  { words: ['Lan', 'đi', 'học'], meaning: 'Lan đi học đến trường', emoji: '🎒' },
  { words: ['Bé', 'yêu', 'mẹ'], meaning: 'Bé thương yêu mẹ', emoji: '❤️' },
  { words: ['Mèo', 'kêu', 'meo'], meaning: 'Chú mèo kêu meo meo', emoji: '🐱' },
  { words: ['Trời', 'đang', 'mưa'], meaning: 'Trời đang mưa', emoji: '🌧️' },
  { words: ['Bé', 'chơi', 'bóng'], meaning: 'Bé chơi bóng', emoji: '⚽' },
  { words: ['Hoa', 'rất', 'đẹp'], meaning: 'Bông hoa rất đẹp', emoji: '🌸' },
  { words: ['Con', 'mèo', 'trèo', 'cây'], meaning: 'Chú mèo trèo cây', emoji: '🐱' },
  { words: ['Bà', 'nấu', 'cháo', 'ngon'], meaning: 'Bà nấu cháo rất ngon', emoji: '🍲' },
  { words: ['Bố', 'đi', 'làm', 'sớm'], meaning: 'Bố đi làm từ sớm', emoji: '💼' },
  { words: ['Chim', 'sơn', 'ca', 'hót'], meaning: 'Chim sơn ca hót', emoji: '🐦' },
  { words: ['Bạn', 'Nam', 'chăm', 'chỉ'], meaning: 'Bạn Nam rất chăm chỉ', emoji: '👦' },
  { words: ['Chú', 'thỏ', 'ăn', 'cà', 'rốt'], meaning: 'Chú thỏ ăn cà rốt', emoji: '🐰' },
  { words: ['Bé', 'tưới', 'nước', 'cho', 'hoa'], meaning: 'Bé tưới nước cho hoa', emoji: '💧' },
  { words: ['Mẹ', 'nấu', 'cơm', 'ngon', 'quá'], meaning: 'Mẹ nấu cơm ngon quá', emoji: '🍚' },
  { words: ['Hoa', 'nở', 'rực', 'rỡ'], meaning: 'Bông hoa khoe sắc', emoji: '🌺' },
  { words: ['Bé', 'gấp', 'quần', 'áo', 'gọn'], meaning: 'Bé gấp quần áo gọn gàng', emoji: '👕' },
  { words: ['Ông', 'mặt', 'trời', 'tỏa', 'nắng'], meaning: 'Ông mặt trời tỏa nắng ấm', emoji: '☀️' },
  { words: ['Con', 'gà', 'trống', 'gáy', 'to'], meaning: 'Con gà trống gáy ò ó o', emoji: '🐓' },
  { words: ['Bé', 'rửa', 'tay', 'trước', 'khi', 'ăn'], meaning: 'Bé rửa tay trước khi ăn cơm', emoji: '🧼' },
  { words: ['Bố', 'đọc', 'truyện', 'cho', 'bé', 'nghe'], meaning: 'Bố đọc truyện cho bé nghe', emoji: '📖' },
  { words: ['Em', 'giúp', 'mẹ', 'quét', 'nhà'], meaning: 'Em giúp mẹ quét nhà thật sạch', emoji: '🧹' },
  { words: ['Đàn', 'gà', 'con', 'chạy', 'lon', 'ton'], meaning: 'Đàn gà con chạy lon ton theo mẹ', emoji: '🐤' },
  { words: ['Bé', 'cùng', 'bà', 'trồng', 'hoa'], meaning: 'Bé cùng bà trồng hoa trước sân nhà', emoji: '🌱' },
  { words: ['Mùa', 'xuân', 'hoa', 'nở', 'rực', 'rỡ'], meaning: 'Mùa xuân về muôn hoa nở rực rỡ', emoji: '🌸' },
];

function buildScrambleRounds(tier: number): SentenceLevel[] {
  const roundsPerTier = defaultRoundsPerTier();
  const count = roundsPerTier[tier - 1];
  const rng = seededRng(6700 + tier * 29);
  let pool: { words: string[]; meaning: string; emoji: string }[];
  if (tier <= 1) pool = SENTENCE_POOL.filter((s) => s.words.length <= 3);
  else if (tier === 2) pool = SENTENCE_POOL.filter((s) => s.words.length === 4);
  else if (tier === 3) pool = SENTENCE_POOL.filter((s) => s.words.length === 4 || s.words.length === 5);
  else if (tier === 4) pool = SENTENCE_POOL.filter((s) => s.words.length === 5 || s.words.length === 6);
  else pool = SENTENCE_POOL.filter((s) => s.words.length >= 5);
  return pickDistinct(pool, count, rng).map((s) => ({ correctWords: s.words, meaning: s.meaning, emoji: s.emoji }));
}

export const SentenceScrambleGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => defaultRoundsPerTier(), []);
  const stage = useGameStage({ gameId: 'sentence_scramble', roundsPerTier, advanceDelayMs: 2000 });
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [trainDriving, setTrainDriving] = useState(false);

  const rounds = useMemo(() => buildScrambleRounds(stage.tier), [stage.tier]);
  const currentLevel = rounds[stage.roundIdx];

  useEffect(() => {
    setAssembledWords([]);
    setTrainDriving(false);
  }, [stage.tier, stage.roundIdx]);

  // Scramble pool (excluding already assembled ones)
  const availableWords = React.useMemo(() => {
    const copy = [...currentLevel.correctWords];
    copy.reverse();
    if (copy.join(' ') === currentLevel.correctWords.join(' ')) {
      copy.push(copy.shift()!);
    }
    return copy;
  }, [currentLevel]);

  const handleWordTap = (word: string) => {
    if (stage.locked || trainDriving) return;
    sound.playClick();
    const nextAssembled = [...assembledWords, word];
    setAssembledWords(nextAssembled);

    if (nextAssembled.length === currentLevel.correctWords.length) {
      if (nextAssembled.join(' ') === currentLevel.correctWords.join(' ')) {
        sound.playCorrect();
        sound.speak(`Hoan hô! "${nextAssembled.join(' ')}"`);
        setTrainDriving(true);
        stage.submitCorrect();
      } else {
        sound.playWrong();
        sound.speak('Chưa đúng thứ tự rồi, bé bấm nút xếp lại nhé!');
      }
    }
  };

  const handleRemoveWord = (idx: number) => {
    if (trainDriving) return;
    sound.playClick();
    setAssembledWords((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleResetAssembled = () => {
    sound.playClick();
    setAssembledWords([]);
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
              <button
                key={idx}
                onClick={() => word && handleRemoveWord(idx)}
                disabled={!word || trainDriving}
                title={word ? 'Chạm để gỡ từ này' : undefined}
                className={`w-20 md:w-28 h-16 md:h-20 rounded-2xl border-4 flex flex-col items-center justify-center font-black text-sm md:text-lg shadow-md transition-all shrink-0 ${
                  word
                    ? 'bg-amber-400 border-amber-500 text-amber-950 scale-100 hover:bg-amber-300 cursor-pointer active:scale-95'
                    : 'bg-white/60 border-dashed border-amber-300 text-slate-300 cursor-default'
                }`}
              >
                <span>{word || `Toa ${idx + 1}`}</span>
                {word && <span className="text-[9px] text-amber-900 font-bold opacity-75">✕ Gỡ</span>}
              </button>
            );
          })}
        </div>

        {/* Railway tracks */}
        <div className="w-full h-3 bg-amber-800 rounded-full flex items-center justify-around my-1 opacity-70">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-amber-950" />
          ))}
        </div>

        {/* Meaning hint */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600">
          <span>{currentLevel.emoji}</span>
          <span>{currentLevel.meaning}</span>
        </div>

        {/* Word Options Pool */}
        <div className="flex-1 flex flex-col items-center justify-center my-4 w-full">
          <span className="text-xs font-bold text-slate-600 mb-2">Chạm vào các từ bên dưới:</span>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
            {poolWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordTap(word)}
                disabled={stage.locked}
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
            disabled={trainDriving}
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