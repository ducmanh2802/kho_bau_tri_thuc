import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';

export interface SyllablePuzzle {
  word: string;
  emoji: string;
  initial: string;
  vowel: string;
  tone: string;
  toneSymbol: string;
  readAloud: string;
}

export interface SyllableSeed {
  w: string;
  i: string;
  v: string;
  t: string;
  sym: string;
  emoji: string;
}

const TONE_NAMES: Record<string, string> = {
  ngang: 'ngang', sắc: 'sắc', huyền: 'huyền', hỏi: 'hỏi', ngã: 'ngã', nặng: 'nặng',
};

function seed(v: SyllableSeed): SyllablePuzzle {
  return {
    word: v.w,
    emoji: v.emoji,
    initial: v.i,
    vowel: v.v,
    tone: v.t,
    toneSymbol: v.sym,
    readAloud: `${v.i} - ${v.v} - ${v.i}${v.v} - ${TONE_NAMES[v.t]} - ${v.w}`,
  };
}

export const POOL_BY_TIER: SyllableSeed[][] = [
  // T1 — vần a
  [
    { w: 'cá', i: 'c', v: 'a', t: 'sắc', sym: '´', emoji: '🐟' },
    { w: 'gà', i: 'g', v: 'a', t: 'huyền', sym: '`', emoji: '🐓' },
    { w: 'bà', i: 'b', v: 'a', t: 'huyền', sym: '`', emoji: '👵' },
    { w: 'ba', i: 'b', v: 'a', t: 'ngang', sym: '-', emoji: '👨' },
    { w: 'ca', i: 'c', v: 'a', t: 'ngang', sym: '-', emoji: '🎤' },
    { w: 'cà', i: 'c', v: 'a', t: 'huyền', sym: '`', emoji: '🍆' },
    { w: 'ga', i: 'g', v: 'a', t: 'ngang', sym: '-', emoji: '🚂' },
    { w: 'má', i: 'm', v: 'a', t: 'sắc', sym: '´', emoji: '👩' },
    { w: 'mạ', i: 'm', v: 'a', t: 'nặng', sym: '.', emoji: '🌾' },
    { w: 'đa', i: 'd', v: 'a', t: 'ngang', sym: '-', emoji: '🌳' },
    { w: 'thả', i: 'th', v: 'a', t: 'hỏi', sym: '?', emoji: '🪁' },
    { w: 'dạ', i: 'd', v: 'a', t: 'nặng', sym: '.', emoji: '🙋' },
  ],
  // T2 — vần e / ê
  [
    { w: 'bé', i: 'b', v: 'e', t: 'sắc', sym: '´', emoji: '👶' },
    { w: 'bè', i: 'b', v: 'e', t: 'huyền', sym: '`', emoji: '🛶' },
    { w: 'che', i: 'th', v: 'e', t: 'ngang', sym: '-', emoji: '⛱️' },
    { w: 'mê', i: 'm', v: 'e', t: 'ngang', sym: '-', emoji: '😍' },
    { w: 'mè', i: 'm', v: 'e', t: 'huyền', sym: '`', emoji: '🌿' },
    { w: 'thẻ', i: 'th', v: 'e', t: 'hỏi', sym: '?', emoji: '🎫' },
    { w: 'thề', i: 'th', v: 'e', t: 'huyền', sym: '`', emoji: '🤝' },
    { w: 'bê', i: 'b', v: 'ê', t: 'ngang', sym: '-', emoji: '🐄' },
    { w: 'dê', i: 'd', v: 'ê', t: 'ngang', sym: '-', emoji: '🐐' },
    { w: 'hề', i: 'th', v: 'ê', t: 'huyền', sym: '`', emoji: '🤡' },
    { w: 'mề', i: 'm', v: 'ê', t: 'huyền', sym: '`', emoji: '🐔' },
    { w: 'thuê', i: 'th', v: 'ê', t: 'ngang', sym: '-', emoji: '🏠' },
  ],
  // T3 — vần o
  [
    { w: 'cò', i: 'c', v: 'o', t: 'huyền', sym: '`', emoji: '🦢' },
    { w: 'cỏ', i: 'c', v: 'o', t: 'hỏi', sym: '?', emoji: '🌱' },
    { w: 'có', i: 'c', v: 'o', t: 'sắc', sym: '´', emoji: '✨' },
    { w: 'cọ', i: 'c', v: 'o', t: 'nặng', sym: '.', emoji: '🖌️' },
    { w: 'bò', i: 'b', v: 'o', t: 'huyền', sym: '`', emoji: '🐮' },
    { w: 'bỏ', i: 'b', v: 'o', t: 'hỏi', sym: '?', emoji: '🗑️' },
    { w: 'bọ', i: 'b', v: 'o', t: 'nặng', sym: '.', emoji: '🪲' },
    { w: 'bố', i: 'b', v: 'o', t: 'sắc', sym: '´', emoji: '👨' },
    { w: 'gò', i: 'g', v: 'o', t: 'huyền', sym: '`', emoji: '⛰️' },
    { w: 'gõ', i: 'g', v: 'o', t: 'ngã', sym: '~', emoji: '🚪' },
    { w: 'mò', i: 'm', v: 'o', t: 'huyền', sym: '`', emoji: '🦀' },
    { w: 'dỗ', i: 'd', v: 'o', t: 'ngã', sym: '~', emoji: '🤗' },
  ],
  // T4 — vần u
  [
    { w: 'cú', i: 'c', v: 'u', t: 'sắc', sym: '´', emoji: '🦉' },
    { w: 'củ', i: 'c', v: 'u', t: 'hỏi', sym: '?', emoji: '🥔' },
    { w: 'cụ', i: 'c', v: 'u', t: 'nặng', sym: '.', emoji: '👴' },
    { w: 'cũ', i: 'c', v: 'u', t: 'ngã', sym: '~', emoji: '👕' },
    { w: 'bú', i: 'b', v: 'u', t: 'sắc', sym: '´', emoji: '🍼' },
    { w: 'gù', i: 'g', v: 'u', t: 'huyền', sym: '`', emoji: '🕊️' },
    { w: 'mù', i: 'm', v: 'u', t: 'huyền', sym: '`', emoji: '🌫️' },
    { w: 'mũ', i: 'm', v: 'u', t: 'ngã', sym: '~', emoji: '🧢' },
    { w: 'thu', i: 'th', v: 'u', t: 'ngang', sym: '-', emoji: '🍂' },
    { w: 'thủ', i: 'th', v: 'u', t: 'hỏi', sym: '?', emoji: '🥅' },
    { w: 'thú', i: 'th', v: 'u', t: 'sắc', sym: '´', emoji: '🐱' },
    { w: 'dù', i: 'd', v: 'u', t: 'huyền', sym: '`', emoji: '☂️' },
  ],
  // T5 — vần i
  [
    { w: 'bi', i: 'b', v: 'i', t: 'ngang', sym: '-', emoji: '🔮' },
    { w: 'bí', i: 'b', v: 'i', t: 'sắc', sym: '´', emoji: '🎃' },
    { w: 'bị', i: 'b', v: 'i', t: 'nặng', sym: '.', emoji: '🤒' },
    { w: 'dì', i: 'd', v: 'i', t: 'huyền', sym: '`', emoji: '👩‍👧' },
    { w: 'gì', i: 'g', v: 'i', t: 'huyền', sym: '`', emoji: '❓' },
    { w: 'mi', i: 'm', v: 'i', t: 'ngang', sym: '-', emoji: '👀' },
    { w: 'mí', i: 'm', v: 'i', t: 'sắc', sym: '´', emoji: '👁️' },
    { w: 'thi', i: 'th', v: 'i', t: 'ngang', sym: '-', emoji: '📝' },
    { w: 'thì', i: 'th', v: 'i', t: 'huyền', sym: '`', emoji: '⏳' },
    { w: 'đi', i: 'đ', v: 'i', t: 'ngang', sym: '-', emoji: '🚶' },
    { w: 'ti', i: 't', v: 'i', t: 'ngang', sym: '-', emoji: '📺' },
    { w: 'li', i: 'l', v: 'i', t: 'ngang', sym: '-', emoji: '🔍' },
  ],
  // T6 — ôn tập tổng hợp (âm đ/l/n/t mới + dấu ngã)
  [
    { w: 'đá', i: 'đ', v: 'a', t: 'sắc', sym: '´', emoji: '⚽' },
    { w: 'lúa', i: 'l', v: 'u', t: 'sắc', sym: '´', emoji: '🌾' },
    { w: 'na', i: 'n', v: 'a', t: 'ngang', sym: '-', emoji: '🍈' },
    { w: 'no', i: 'n', v: 'o', t: 'ngang', sym: '-', emoji: '🍚' },
    { w: 'nụ', i: 'n', v: 'u', t: 'nặng', sym: '.', emoji: '🌷' },
    { w: 'đô', i: 'đ', v: 'o', t: 'ngang', sym: '-', emoji: '🏙️' },
    { w: 'đồ', i: 'đ', v: 'o', t: 'huyền', sym: '`', emoji: '🧸' },
    { w: 'đổ', i: 'đ', v: 'o', t: 'hỏi', sym: '?', emoji: '💧' },
    { w: 'đỗ', i: 'đ', v: 'o', t: 'ngã', sym: '~', emoji: '🎓' },
    { w: 'tí', i: 't', v: 'i', t: 'sắc', sym: '´', emoji: '🤏' },
    { w: 'tô', i: 't', v: 'o', t: 'ngang', sym: '-', emoji: '🍜' },
    { w: 'tủ', i: 't', v: 'u', t: 'hỏi', sym: '?', emoji: '🗄️' },
  ],
];

export const SYLLABLE_ROUNDS_PER_TIER = [4, 4, 5, 5, 6, 6];

export function buildSyllableRounds(tier: number, nonce = 0, seedOverride?: number): SyllablePuzzle[] {
  const safeTier = Math.min(Math.max(Math.round(tier), 1), POOL_BY_TIER.length);
  const count = SYLLABLE_ROUNDS_PER_TIER[safeTier - 1];
  const pool = POOL_BY_TIER[safeTier - 1];
  const shuffled = shuffleSeeded(pool, seededRng(seedOverride ?? 8900 + safeTier * 53 + nonce * 1009));
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(seed);
}

export const INITIAL_OPTIONS = ['c', 'b', 'g', 'm', 'th', 'd', 'đ', 'l', 'n', 't'];
export const VOWEL_OPTIONS = ['a', 'e', 'o', 'u', 'i', 'ê'];
export const TONE_OPTIONS = [
  { label: 'Không dấu', val: 'ngang', sym: '-' },
  { label: 'Dấu Sắc (/)', val: 'sắc', sym: '´' },
  { label: 'Dấu Huyền (\\)', val: 'huyền', sym: '`' },
  { label: 'Dấu Hỏi (?)', val: 'hỏi', sym: '?' },
  { label: 'Dấu Ngã (~)', val: 'ngã', sym: '~' },
  { label: 'Dấu Nặng (.)', val: 'nặng', sym: '.' },
];

export const SyllableBuilderGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => SYLLABLE_ROUNDS_PER_TIER.slice(), []);
  const stage = useGameStage({ gameId: 'syllable_builder', roundsPerTier, advanceDelayMs: 1500 });
  const [selectedInitial, setSelectedInitial] = useState<string>('');
  const [selectedVowel, setSelectedVowel] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const rounds = useMemo(() => buildSyllableRounds(stage.tier, stage.nonce), [stage.tier, stage.nonce]);
  const current = rounds[stage.roundIdx];


  const handleCheck = () => {
    if (stage.locked) return;
    if (!selectedInitial || !selectedVowel || !selectedTone) {
      sound.speak('Bé hãy chọn đủ âm đầu, vần và dấu thanh nhé!');
      return;
    }

    if (
      selectedInitial === current.initial &&
      selectedVowel === current.vowel &&
      selectedTone === current.tone
    ) {
      sound.playCorrect();
      sound.speak(current.readAloud);
      setFeedback(`Đúng rồi! ${current.word.toUpperCase()}!`);
      setSelectedInitial('');
      setSelectedVowel('');
      setSelectedTone('');
      stage.submitCorrect();
      window.setTimeout(() => setFeedback(null), 1500);
    } else {
      sound.playWrong();
      sound.speak(`Chưa đúng rồi! Bé thử chọn lại nhé.`);
      setFeedback('Chưa đúng rồi, bé thử lại nào!');
      stage.submitWrong();
      window.setTimeout(() => setFeedback(null), 1200);
    }
  };

  return (
    <GameModalWrapper
      gameId="syllable_builder"
      title="Xưởng Ghép Tiếng Lớp 1"
      subtitle="Ghép các mảnh âm đầu, vần và dấu thanh để tạo thành từ đúng"
      mascotEmoji="🦊"
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
      instructions={`Bé hãy ghép thành từ: "${current.word}"`}
      audioInstruction={`Hãy ghép thành từ ${current.word}`}
    >
      <div className="w-full max-w-2xl bg-white/90 rounded-3xl p-4 md:p-6 shadow-xl border-3 border-amber-300 flex flex-col items-center">
        {/* Target Image & Word */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl p-3 bg-amber-100 rounded-2xl shadow-inner border border-amber-200">
            {current.emoji}
          </div>
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Từ cần ghép:</span>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-amber-900 font-display">{current.word}</span>
              <button
                onClick={() => sound.speak(current.word)}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full"
                title="Nghe từ"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Builder Workbench Slots */}
        <div className="flex items-center justify-center gap-2 md:gap-4 my-3 p-3 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 w-full max-w-lg">
          {/* Initial slot */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-1">Âm đầu</span>
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-blue-400 flex items-center justify-center text-2xl font-black text-blue-700 shadow-sm">
              {selectedInitial || '?'}
            </div>
          </div>

          <span className="text-2xl font-black text-amber-500">+</span>

          {/* Vowel slot */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-1">Nguyên âm</span>
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-emerald-400 flex items-center justify-center text-2xl font-black text-emerald-700 shadow-sm">
              {selectedVowel || '?'}
            </div>
          </div>

          <span className="text-2xl font-black text-amber-500">+</span>

          {/* Tone slot */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-1">Dấu thanh</span>
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-rose-400 flex items-center justify-center text-2xl font-black text-rose-700 shadow-sm">
              {TONE_OPTIONS.find((t) => t.val === selectedTone)?.sym || '?'}
            </div>
          </div>
        </div>

        {/* Selection Options */}
        <div className="w-full space-y-3 mt-2">
          {/* Step 1: Initial */}
          <div>
            <span className="text-xs font-bold text-blue-700 block mb-1">1. Chọn âm đầu:</span>
            <div className="flex flex-wrap gap-2">
              {INITIAL_OPTIONS.map((char) => (
                <button
                  key={char}
                  onClick={() => {
                    sound.playClick();
                    setSelectedInitial(char);
                  }}
                  className={`w-11 h-11 rounded-xl font-black text-lg border-2 transition-all active:scale-95 ${
                    selectedInitial === char
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                      : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Vowel */}
          <div>
            <span className="text-xs font-bold text-emerald-700 block mb-1">2. Chọn nguyên âm:</span>
            <div className="flex flex-wrap gap-2">
              {VOWEL_OPTIONS.map((char) => (
                <button
                  key={char}
                  onClick={() => {
                    sound.playClick();
                    setSelectedVowel(char);
                  }}
                  className={`w-11 h-11 rounded-xl font-black text-lg border-2 transition-all active:scale-95 ${
                    selectedVowel === char
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Tone */}
          <div>
            <span className="text-xs font-bold text-rose-700 block mb-1">3. Chọn dấu thanh:</span>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.val}
                  onClick={() => {
                    sound.playClick();
                    setSelectedTone(t.val);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm border-2 transition-all active:scale-95 ${
                    selectedTone === t.val
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-105'
                      : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="mt-3 text-sm font-black text-emerald-700 animate-bounce flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {feedback}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleCheck}
          disabled={stage.locked}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base md:text-lg rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
        >
          Kiểm tra kết quả 🎯
        </button>
      </div>
    </GameModalWrapper>
  );
};