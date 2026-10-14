import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { useGameStage } from '../../hooks/useGameStage';
import { sound } from '../../services/sound';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';
import { getTierMeta as _t } from '../../data/gameLevels';

export interface SpellingItem {
  prompt: string;
  emoji: string;
  options: string[];
  answer: string;
  hint: string;
}

export const POOLS: SpellingItem[][] = [
  // T1: c/k
  [
    { prompt: 'Điền chữ còn thiếu: ...on cá', emoji: '🐟', options: ['c', 'k', 'q'], answer: 'c', hint: 'Loài bơi dưới nước' },
    { prompt: 'Điền chữ còn thiếu: ...ẹo', emoji: '🍬', options: ['k', 'c', 'q'], answer: 'k', hint: 'Món ngọt ngào bé thích' },
    { prompt: 'Điền chữ còn thiếu: ...im', emoji: '🪡', options: ['k', 'c', 'h'], answer: 'k', hint: 'Dụng cụ may vá của mẹ' },
    { prompt: 'Điền chữ còn thiếu: ...ửa sổ', emoji: '🪟', options: ['c', 'k', 't'], answer: 'c', hint: 'Nhà nào cũng có để đón nắng' },
    { prompt: 'Điền chữ còn thiếu: ...ính', emoji: '👓', options: ['k', 'c', 'g'], answer: 'k', hint: 'Đeo lên mắt để nhìn rõ' },
    { prompt: 'Chọn từ viết đúng:', emoji: '✏️', options: ['cái kéo', 'kái kéo', 'qái kéo'], answer: 'cái kéo', hint: 'Dụng cụ cắt giấy' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐱', options: ['con mèo', 'kon mèo', 'con mẻo'], answer: 'con mèo', hint: 'Con vật kêu meo meo' },
    { prompt: 'Điền chữ còn thiếu: ...a hát', emoji: '🎤', options: ['c', 'k', 'q'], answer: 'c', hint: 'Bé cầm mic và cất tiếng' },
  ],
  // T2: g/gh
  [
    { prompt: 'Điền chữ còn thiếu: ...ế gỗ', emoji: '🪑', options: ['gh', 'g', 'k'], answer: 'gh', hint: 'Đồ dùng để ngồi trong lớp' },
    { prompt: 'Điền chữ còn thiếu: ...à', emoji: '🐔', options: ['g', 'gh', 'k'], answer: 'g', hint: 'Con vật gáy ò ó o' },
    { prompt: 'Điền chữ còn thiếu: ...i nhớ', emoji: '📝', options: ['gh', 'g', 'h'], answer: 'gh', hint: 'Viết bài để thuộc lâu' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐻', options: ['gấu bông', 'ghấu bông', 'gấu bung'], answer: 'gấu bông', hint: 'Bạn ôm đi ngủ êm mềm' },
    { prompt: 'Điền chữ còn thiếu: ...e thuyền', emoji: '⛵', options: ['gh', 'g', 'k'], answer: 'gh', hint: 'Chỗ ngồi trên thuyền' },
    { prompt: 'Điền chữ còn thiếu: ...ỗng', emoji: '🪿', options: ['ng', 'ngh', 'g'], answer: 'ng', hint: 'Con vật cổ dài kêu to' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🎁', options: ['quà tặng', 'qùa tặng', 'quà tăng'], answer: 'quà tặng', hint: 'Bé nhận vào sinh nhật' },
    { prompt: 'Điền chữ còn thiếu: ...i chép', emoji: '📒', options: ['gh', 'g', 'k'], answer: 'gh', hint: 'Vở viết bài hằng ngày' },
  ],
  // T3: ng/ngh
  [
    { prompt: 'Điền vần còn thiếu: ...ỉ ngơi', emoji: '😴', options: ['ngh', 'ng', 'nh'], answer: 'ngh', hint: 'Nằm nhắm mắt cho khỏe' },
    { prompt: 'Điền vần còn thiếu: ...ủ', emoji: '😴', options: ['ng', 'ngh', 'n'], answer: 'ng', hint: 'Nhắm mắt đi vào giấc' },
    { prompt: 'Điền vần còn thiếu: ...ỉ hè', emoji: '☀️', options: ['ngh', 'ng', 'gh'], answer: 'ngh', hint: 'Kỳ vui chơi sau năm học' },
    { prompt: 'Điền vần còn thiếu: ...à voi', emoji: '🐘', options: ['ng', 'ngh', 'n'], answer: 'ng', hint: 'Món quý lấy từ chú voi' },
    { prompt: 'Điền vần còn thiếu: ...on nớt', emoji: '🐣', options: ['n', 'ng', 'ngh'], answer: 'n', hint: 'Chú chim mới nở yếu ớt' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🌾', options: ['nghé con', 'ngé con', 'nghé kon'], answer: 'nghé con', hint: 'Chú trâu nhỏ ngoài đồng' },
    { prompt: 'Điền vần còn thiếu: ...iêng', emoji: '🙏', options: ['ngh', 'ng', 'n'], answer: 'ngh', hint: 'Cúi đầu chào lễ phép' },
    { prompt: 'Điền vần còn thiếu: ...ệ sĩ', emoji: '🎨', options: ['ngh', 'ng', 'nh'], answer: 'ngh', hint: 'Người vẽ tranh rất đẹp' },
  ],
  // T4: ôn tập c/k, g/gh, ng/ngh (không có ch/tr, s/x, d/gi/r)
  [
    { prompt: 'Điền chữ còn thiếu: ...ua', emoji: '🦀', options: ['c', 'k', 'q'], answer: 'c', hint: 'Con vật có càng' },
    { prompt: 'Điền chữ còn thiếu: ...ỗ', emoji: '🪵', options: ['g', 'gh', 'k'], answer: 'g', hint: 'Bàn ghế làm từ gì' },
    { prompt: 'Điền chữ còn thiếu: ...e', emoji: '👂', options: ['ngh', 'ng', 'nh'], answer: 'ngh', hint: 'Dùng tai để làm gì' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐓', options: ['con gà', 'con ghà', 'kon gà'], answer: 'con gà', hint: 'Con vật gáy sáng' },
    { prompt: 'Điền chữ còn thiếu: ...áy', emoji: '💤', options: ['ng', 'ngh', 'nh'], answer: 'ng', hint: 'Điều bé phát ra khi say giấc' },
    { prompt: 'Điền chữ còn thiếu: ...i', emoji: '📝', options: ['gh', 'g', 'h'], answer: 'gh', hint: 'Viết chữ vào vở' },
    { prompt: 'Điền chữ còn thiếu: ...a', emoji: '🎤', options: ['c', 'k', 'q'], answer: 'c', hint: 'Hát một bài' },
    { prompt: 'Điền chữ còn thiếu: ...ề', emoji: '🧑‍🌾', options: ['ngh', 'ng', 'nh'], answer: 'ngh', hint: 'Công việc nuôi sống' },
  ],
  // T5: thử thách ch/tr, s/x
  [
    { prompt: 'Chọn từ viết đúng:', emoji: '🌳', options: ['cây tre', 'cây che', 'cây trè'], answer: 'cây tre', hint: 'Cây cao mọc thành bụi' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐦', options: ['chim sẻ', 'trim sẻ', 'chim xẻ'], answer: 'chim sẻ', hint: 'Chú chim nhỏ hót hay' },
    { prompt: 'Chọn từ viết đúng:', emoji: '☀️', options: ['mặt trời', 'mặt chời', 'mặt tời'], answer: 'mặt trời', hint: 'Ông tỏa nắng ban ngày' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🎒', options: ['sách vở', 'xách vở', 'sách vỡ'], answer: 'sách vở', hint: 'Mang đến trường mỗi ngày' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🧹', options: ['cái chổi', 'cái trổi', 'cái chỗi'], answer: 'cái chổi', hint: 'Dùng quét nhà sạch' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🍲', options: ['nồi súp', 'nồi xúp', 'nồi sup'], answer: 'nồi súp', hint: 'Món nước nóng thơm ngon' },
    { prompt: 'Điền chữ còn thiếu: ...ái cây', emoji: '🍎', options: ['tr', 'ch', 's'], answer: 'tr', hint: 'Ăn vào khỏe người' },
    { prompt: 'Điền chữ còn thiếu: ...e mưa', emoji: '🌧️', options: ['ch', 'tr', 'x'], answer: 'ch', hint: 'Giơ ô khi trời đổ' },
  ],
  // T6: thử thách d/gi/r + tổng hợp
  [
    { prompt: 'Chọn từ viết đúng:', emoji: '🍉', options: ['dưa hấu', 'giưa hấu', 'rưa hấu'], answer: 'dưa hấu', hint: 'Quả to ruột đỏ hạt đen' },
    { prompt: 'Chọn từ viết đúng:', emoji: '👩‍🏫', options: ['giáo viên', 'dáo viên', 'ráo viên'], answer: 'giáo viên', hint: 'Người dạy bé học' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🐍', options: ['con rắn', 'con dắn', 'con giắn'], answer: 'con rắn', hint: 'Con vật dài trườn đi' },
    { prompt: 'Chọn từ viết đúng:', emoji: '🌧️', options: ['giọt mưa', 'dọt mưa', 'rọt mưa'], answer: 'giọt mưa', hint: 'Hạt nước rơi từ mây' },
    { prompt: 'Điền chữ còn thiếu: ...ông bão', emoji: '💨', options: ['gi', 'd', 'r'], answer: 'gi', hint: 'Bão tới, bé ở trong nhà' },
    { prompt: 'Điền chữ còn thiếu: ...ễ dàng', emoji: '😊', options: ['d', 'gi', 'r'], answer: 'd', hint: 'Làm một cái là xong' },
    { prompt: 'Điền chữ còn thiếu: ...ổ bánh', emoji: '🍞', options: ['r', 'd', 'gi'], answer: 'r', hint: 'Đựng bánh mới ra lò' },
    { prompt: 'Chọn câu viết đúng chính tả:', emoji: '🏫', options: ['Bé đến trường học bài', 'Bé đến chường học bài', 'Bé đến trường học bải'], answer: 'Bé đến trường học bài', hint: 'Câu nói về buổi sáng' },
  ],
];

void _t;
void GAME_LEVEL_POLICY;

export const SpellingDuelGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => GAME_LEVEL_POLICY.ROUNDS_PER_TIER.slice() as unknown as number[], []);
  const stage = useGameStage({ gameId: 'spelling_duel', roundsPerTier });
  const [picked, setPicked] = useState<string | null>(null);

  const pool = POOLS[Math.min(stage.tier - 1, POOLS.length - 1)];
  const rng = useMemo(() => seededRng(stage.tier * 7919 + stage.roundIdx * 131 + stage.nonce * 17), [stage.tier, stage.roundIdx, stage.nonce]);
  const item = useMemo(() => {
    const list = shuffleSeeded(pool, seededRng(stage.tier * 1000 + 7 + stage.nonce * 101));
    return list[stage.roundIdx % list.length];
  }, [pool, stage.tier, stage.roundIdx, stage.nonce]);
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
      gameId="spelling_duel"
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
      earnedStars={stage.starsEarned}
      prevBestStars={stage.prevBestStars}
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
