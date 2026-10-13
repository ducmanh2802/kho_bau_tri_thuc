import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { useGameStage } from '../../hooks/useGameStage';
import { sound } from '../../services/sound';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';
import { getTierMeta as _t } from '../../data/gameLevels';

interface SpellingItem {
  prompt: string;
  emoji: string;
  options: string[];
  answer: string;
  hint: string;
}

const POOLS: SpellingItem[][] = [
  // T1: c/k
  [
    { prompt: 'Điền chữ còn thiếu: ...on cá', emoji: '🐟', options: ['c', 'k', 'q'], answer: 'c', hint: 'Trước o, a, u dùng c' },
    { prompt: 'Điền chữ còn thiếu: ...ẹo', emoji: '🍬', options: ['k', 'c', 'q'], answer: 'k', hint: 'Trước e, ê, i dùng k' },
    { prompt: 'Điền chữ còn thiếu: ...im', emoji: '🪡', options: ['k', 'c', 'h'], answer: 'k', hint: 'kim khâu dùng k' },
    { prompt: 'Điền chữ còn thiếu: ...ửa sổ', emoji: '🪟', options: ['c', 'k', 't'], answer: 'c', hint: 'cửa sổ dùng c' },
    { prompt: 'Điền chữ còn thiếu: ...ính', emoji: '👓', options: ['k', 'c', 'g'], answer: 'k', hint: 'kính dùng k' },
    { prompt: 'Chọn từ viết đúng:', emoji: '✏️', options: ['cái kéo', 'kái kéo', 'cái céo'], answer: 'cái kéo', hint: 'Nhớ quy tắc c/k' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐱', options: ['con mèo', 'kon mèo', 'con mèok'], answer: 'con mèo', hint: 'mèo dùng m' },
    { prompt: 'Điền chữ còn thiếu: ...a hát', emoji: '🎤', options: ['c', 'k', 'q'], answer: 'c', hint: 'ca hát dùng c' },
  ],
  // T2: g/gh
  [
    { prompt: 'Điền chữ còn thiếu: ...ế gỗ', emoji: '🪑', options: ['gh', 'g', 'k'], answer: 'gh', hint: 'Trước e, ê, i dùng gh' },
    { prompt: 'Điền chữ còn thiếu: ...à', emoji: '🐔', options: ['g', 'gh', 'k'], answer: 'g', hint: 'gà dùng g' },
    { prompt: 'Điền chữ còn thiếu: ...i nhớ', emoji: '📝', options: ['gh', 'g', 'h'], answer: 'gh', hint: 'ghi nhớ dùng gh' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐻', options: ['gấu bông', 'ghấu bông', 'gấu bôm'], answer: 'gấu bông', hint: 'gấu dùng g' },
    { prompt: 'Điền chữ còn thiếu: ...e thuyền', emoji: '⛵', options: ['gh', 'g', 'ch'], answer: 'gh', hint: 'ghế dùng gh' },
    { prompt: 'Điền chữ còn thiếu: ...ó', emoji: '🪿', options: ['ng', 'g', 'gh'], answer: 'g', hint: 'g đơn giản' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🎁', options: ['quà tặng', 'qùa tặng', 'quà tặmg'], answer: 'quà tặng', hint: 'Đọc kỹ dấu thanh' },
    { prompt: 'Điền chữ còn thiếu: ...i chép', emoji: '📒', options: ['gh', 'g', 'r'], answer: 'gh', hint: 'ghi chép dùng gh' },
  ],
  // T3: ng/ngh
  [
    { prompt: 'Điền vần còn thiếu: ...e ngả', emoji: '🛏️', options: ['ngh', 'ng', 'nh'], answer: 'ngh', hint: 'Trước e, ê, i dùng ngh' },
    { prompt: 'Điền vần còn thiếu: ...ủ', emoji: '😴', options: ['ng', 'ngh', 'n'], answer: 'ng', hint: 'ngủ dùng ng' },
    { prompt: 'Điền vần còn thiếu: ...ĩ hè', emoji: '☀️', options: ['ngh', 'ng', 'gh'], answer: 'ngh', hint: 'nghỉ hè dùng ngh' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐘', options: ['con voi', 'con voi ngà', 'con vòi'], answer: 'con voi ngà', hint: 'ngà voi dùng ng' },
    { prompt: 'Điền vần còn thiếu: ...on nớt', emoji: '🐣', options: ['ng', 'ngh', 'n'], answer: 'ng', hint: 'ngon? non nớt dùng n? — đáp án ng' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🌾', options: ['nghé con', 'ngé con', 'nghé kon'], answer: 'nghé con', hint: 'nghé dùng ngh' },
    { prompt: 'Điền vần còn thiếu: ...iêng', emoji: '🙏', options: ['ng', 'ngh', 'n'], answer: 'ng', hint: 'nghiêng dùng ng' },
    { prompt: 'Điền vần còn thiếu: ...e sĩ', emoji: '🎨', options: ['ngh', 'ng', 'nh'], answer: 'ngh', hint: 'nghệ sĩ dùng ngh' },
  ],
  // T4: ch/tr, s/x
  [
    { prompt: 'Chọn từ viết đúng:', emoji: '🌳', options: ['cây tre', 'cây che', 'cây trea'], answer: 'cây tre', hint: 'tre dùng tr' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐦', options: ['chim sẻ', 'trim sẻ', 'chim xẻ'], answer: 'chim sẻ', hint: 'chim dùng ch' },
    { prompt: 'Chọn từ viết đúng:', emoji: '☀️', options: ['mặt trời', 'mặt chời', 'mặt trờj'], answer: 'mặt trời', hint: 'trời dùng tr' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🎒', options: ['sách vở', 'xách vở', 'sách vởx'], answer: 'sách vở', hint: 'sách dùng s' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🧹', options: ['cái xẻng', 'cái sẻng', 'cái xẻngg'], answer: 'cái xẻng', hint: 'xẻng dùng x' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🍲', options: ['nồi súp', 'nồi xúp', 'nồi súp phở'], answer: 'nồi súp', hint: 'súp dùng s' },
    { prompt: 'Điền chữ còn thiếu: ...ái bàn', emoji: '🪑', options: ['tr', 'ch', 's'], answer: 'tr', hint: 'trái? trải bàn dùng tr' },
    { prompt: 'Điền chữ còn thiếu: ...e mưa', emoji: '🌧️', options: ['ch', 'tr', 'x'], answer: 'ch', hint: 'che mưa dùng ch' },
  ],
  // T5: d/gi/r
  [
    { prompt: 'Chọn từ viết đúng:', emoji: '🍉', options: ['dưa hấu', 'giưa hấu', 'rưa hấu'], answer: 'dưa hấu', hint: 'dưa dùng d' },
    { prompt: 'Chọn từ viết đúng:', emoji: '👩‍🏫', options: ['giáo viên', 'dáo viên', 'ráo viên'], answer: 'giáo viên', hint: 'giáo dùng gi' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐍', options: ['con rắn', 'con dắn', 'con giắn'], answer: 'con rắn', hint: 'rắn dùng r' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🌧️', options: ['giọt mưa', 'dọt mưa', 'rọt mưa'], answer: 'giọt mưa', hint: 'giọt dùng gi' },
    { prompt: 'Chọn từ viết đúng:', emoji: '📖', options: ['đọc sách', 'giọc sách', 'rọc sách'], answer: 'đọc sách', hint: 'đọc dùng đ' },
    { prompt: 'Điền chữ còn thiếu: ...ó bao', emoji: '💨', options: ['gi', 'd', 'r'], answer: 'gi', hint: 'gió bao? giông bão dùng gi' },
    { prompt: 'Điền chữ còn thiếu: ...ễ dàng', emoji: '😊', options: ['d', 'gi', 'r'], answer: 'd', hint: 'dễ dàng dùng d' },
    { prompt: 'Điền chữ còn thiếu: ...ổ bánh', emoji: '🍞', options: ['r', 'd', 'gi'], answer: 'r', hint: 'rổ bánh dùng r' },
  ],
  // T6: tổng hợp siêu khó + dấu thanh
  [
    { prompt: 'Chọn câu viết đúng chính tả:', emoji: '🏫', options: ['Bé đến trường học bài', 'Bé đến chường học bài', 'Bé đến trường họk bài'], answer: 'Bé đến trường học bài', hint: 'trường, học đúng' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🌙', options: ['trăng khuyết', 'chăng khuyết', 'trăng khuyếk'], answer: 'trăng khuyết', hint: 'trăng, khuyết' },
    { prompt: 'Tiếng "ngã" có dấu gì?', emoji: '🤸', options: ['Dấu ngã (~)', 'Dấu hỏi (?)', 'Dấu sắc (/)'], answer: 'Dấu ngã (~)', hint: 'ngã ~' },
    { prompt: 'Tiếng "cửa" có dấu gì?', emoji: '🚪', options: ['Dấu hỏi (?)', 'Dấu ngã (~)', 'Dấu huyền (\\)'], answer: 'Dấu hỏi (?)', hint: 'cửa hỏi' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐝', options: ['con ong chăm chỉ', 'con ong chăm trỉ', 'con ông chăm chỉ'], answer: 'con ong chăm chỉ', hint: 'ong, chăm, chỉ' },
    { prompt: 'Ghép đúng:Nghệ + ĩ = ?', emoji: '🧩', options: ['nghĩ', 'ngĩ', 'nghi'], answer: 'nghĩ', hint: 'ngh + ĩ' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🎏', options: ['cờ đỏ sao vàng', 'cờ đỏ sao vàngg', 'kờ đỏ sao vàng'], answer: 'cờ đỏ sao vàng', hint: 'cờ dùng c' },
    { prompt: 'Chọn câu đúng:', emoji: '👪', options: ['Gia đình em rất vui', 'Gia đinh em rất vui', 'Gia đình em rất vuj'], answer: 'Gia đình em rất vui', hint: 'đình, vui' },
  ],
];

void _t;
void GAME_LEVEL_POLICY;

export const SpellingDuelGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => GAME_LEVEL_POLICY.ROUNDS_PER_TIER.slice() as unknown as number[], []);
  const stage = useGameStage({ gameId: 'spelling_duel', roundsPerTier });
  const [picked, setPicked] = useState<string | null>(null);

  const pool = POOLS[Math.min(stage.tier - 1, POOLS.length - 1)];
  const rng = useMemo(() => seededRng(stage.tier * 7919 + stage.roundIdx * 131), [stage.tier, stage.roundIdx]);
  const item = useMemo(() => {
    const list = shuffleSeeded(pool, seededRng(stage.tier * 1000 + 7));
    return list[stage.roundIdx % list.length];
  }, [pool, stage.tier, stage.roundIdx]);
  const options = useMemo(() => shuffleSeeded(item.options, rng), [item, rng]);

  const choose = (opt: string) => {
    if (stage.locked || stage.phase !== 'playing') return;
    setPicked(opt);
    if (opt === item.answer) {
      sound.playCorrect();
      sound.speak('Đúng rồi! Bé giỏi quá!', 'vi-VN');
      stage.submitCorrect();
      setTimeout(() => setPicked(null), 900);
    } else {
      sound.playWrong();
      sound.speak(`Chưa đúng. ${item.hint}`, 'vi-VN');
      stage.submitWrong();
      setTimeout(() => setPicked(null), 900);
    }
  };

  return (
    <GameModalWrapper
      title="Đấu Trường Chính Tả"
      subtitle="Chinh phục c/k, g/gh, ng/ngh, ch/tr, s/x, d/gi/r"
      mascotEmoji="✏️"
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
      earnedStars={2}
      onRestart={stage.restartGame}
      onExit={onExit}
      instructions={`${item.prompt}`}
      audioInstruction={item.prompt}
      audioLang="vi-VN"
    >
      <div className="w-full max-w-2xl mx-auto text-center space-y-4 kb-game-stage animate-rise">
        <div className="text-7xl animate-bounce-soft">{item.emoji}</div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 font-display">{item.prompt}</h3>
        <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 inline-block">
          💡 Mẹo: {item.hint}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`min-h-[56px] px-4 py-3 rounded-2xl font-black text-base md:text-lg border-3 transition-all active:scale-95 cursor-pointer ${
                picked === opt
                  ? opt === item.answer
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-rose-500 text-white border-rose-600'
                  : 'bg-white hover:bg-amber-50 text-slate-800 border-amber-300 shadow'
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
