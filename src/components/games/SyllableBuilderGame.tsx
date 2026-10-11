import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { useGameStage } from '../../hooks/useGameStage';
import { defaultRoundsPerTier, getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';

interface SyllablePuzzle {
  word: string;
  emoji: string;
  initial: string;
  vowel: string;
  tone: string;
  toneSymbol: string;
  readAloud: string;
}

interface SyllableSeed {
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

const POOL_BY_TIER: SyllableSeed[][] = [
  [
    { w: 'cá', i: 'c', v: 'a', t: 'sắc', sym: '´', emoji: '🐟' },
    { w: 'gà', i: 'g', v: 'a', t: 'huyền', sym: '`', emoji: '🐓' },
    { w: 'bé', i: 'b', v: 'e', t: 'sắc', sym: '´', emoji: '👶' },
    { w: 'bà', i: 'b', v: 'a', t: 'huyền', sym: '`', emoji: '👵' },
    { w: 'mẹ', i: 'm', v: 'e', t: 'nặng', sym: '.', emoji: '👩' },
    { w: 'thỏ', i: 'th', v: 'o', t: 'hỏi', sym: '?', emoji: '🐰' },
  ],
  [
    { w: 'cò', i: 'c', v: 'o', t: 'huyền', sym: '`', emoji: '🦩' },
    { w: 'bò', i: 'b', v: 'o', t: 'huyền', sym: '`', emoji: '🐮' },
    { w: 'bí', i: 'b', v: 'i', t: 'sắc', sym: '´', emoji: '🎃' },
    { w: 'dê', i: 'd', v: 'ê', t: 'ngang', sym: '-', emoji: '🐐' },
    { w: 'mì', i: 'm', v: 'i', t: 'huyền', sym: '`', emoji: '🍜' },
    { w: 'cọ', i: 'c', v: 'o', t: 'nặng', sym: '.', emoji: '🧹' },
  ],
  [
    { w: 'thả', i: 'th', v: 'a', t: 'hỏi', sym: '?', emoji: '🪂' },
    { w: 'dạ', i: 'd', v: 'a', t: 'nặng', sym: '.', emoji: '👋' },
    { w: 'thù', i: 'th', v: 'u', t: 'huyền', sym: '`', emoji: '😾' },
    { w: 'mả', i: 'm', v: 'a', t: 'hỏi', sym: '?', emoji: '🗿' },
    { w: 'gò', i: 'g', v: 'o', t: 'huyền', sym: '`', emoji: '⛰️' },
    { w: 'bú', i: 'b', v: 'u', t: 'sắc', sym: '´', emoji: '🍼' },
  ],
  [
    { w: 'thê', i: 'th', v: 'ê', t: 'ngang', sym: '-', emoji: '👰' },
    { w: 'mề', i: 'm', v: 'ê', t: 'huyền', sym: '`', emoji: '🐔' },
    { w: 'thu', i: 'th', v: 'u', t: 'ngang', sym: '-', emoji: '🍂' },
    { w: 'gù', i: 'g', v: 'u', t: 'huyền', sym: '`', emoji: '🕊️' },
    { w: 'thị', i: 'th', v: 'i', t: 'nặng', sym: '.', emoji: '🛒' },
    { w: 'củ', i: 'c', v: 'u', t: 'hỏi', sym: '?', emoji: '🥔' },
  ],
  [
    { w: 'dạ', i: 'd', v: 'a', t: 'nặng', sym: '.', emoji: '🙋' },
    { w: 'mộ', i: 'm', v: 'o', t: 'nặng', sym: '.', emoji: '🪦' },
    { w: 'cù', i: 'c', v: 'u', t: 'huyền', sym: '`', emoji: '🪃' },
    { w: 'gì', i: 'g', v: 'i', t: 'huyền', sym: '`', emoji: '❓' },
    { w: 'bì', i: 'b', v: 'i', t: 'huyền', sym: '`', emoji: '🎒' },
    { w: 'thạ', i: 'th', v: 'a', t: 'nặng', sym: '.', emoji: '🪨' },
  ],
  [
    { w: 'thì', i: 'th', v: 'i', t: 'huyền', sym: '`', emoji: '⏳' },
    { w: 'mò', i: 'm', v: 'o', t: 'huyền', sym: '`', emoji: '🔎' },
    { w: 'gả', i: 'g', v: 'a', t: 'hỏi', sym: '?', emoji: '💍' },
    { w: 'bẻ', i: 'b', v: 'e', t: 'hỏi', sym: '?', emoji: '🥖' },
    { w: 'thủ', i: 'th', v: 'u', t: 'hỏi', sym: '?', emoji: '🚢' },
    { w: 'mạ', i: 'm', v: 'a', t: 'nặng', sym: '.', emoji: '🌾' },
  ],
];

function buildSyllableRounds(tier: number): SyllablePuzzle[] {
  const roundsPerTier = defaultRoundsPerTier();
  const count = roundsPerTier[tier - 1];
  const pool = POOL_BY_TIER[Math.min(tier - 1, POOL_BY_TIER.length - 1)];
  const shuffled = shuffleSeeded(pool, seededRng(8900 + tier * 53));
  return Array.from({ length: count }, (_, i) => seed(shuffled[i % shuffled.length]));
}

export const SyllableBuilderGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => defaultRoundsPerTier(), []);
  const stage = useGameStage({ gameId: 'syllable_builder', roundsPerTier, advanceDelayMs: 1500 });
  const [selectedInitial, setSelectedInitial] = useState<string>('');
  const [selectedVowel, setSelectedVowel] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const rounds = useMemo(() => buildSyllableRounds(stage.tier), [stage.tier]);
  const current = rounds[stage.roundIdx];

  const INITIAL_OPTIONS = ['c', 'b', 'g', 'm', 'th', 'd'];
  const VOWEL_OPTIONS = ['a', 'e', 'o', 'u', 'i', 'ê'];
  const TONE_OPTIONS = [
    { label: 'Không dấu', val: 'ngang', sym: '-' },
    { label: 'Dấu Sắc (/)', val: 'sắc', sym: '´' },
    { label: 'Dấu Huyền (\\)', val: 'huyền', sym: '`' },
    { label: 'Dấu Hỏi (?)', val: 'hỏi', sym: '?' },
    { label: 'Dấu Ngã (~)', val: 'ngã', sym: '~' },
    { label: 'Dấu Nặng (.)', val: 'nặng', sym: '.' },
  ];

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
      earnedStars={1}
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