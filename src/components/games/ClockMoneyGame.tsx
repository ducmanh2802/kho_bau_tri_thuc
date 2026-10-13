import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { useGameStage } from '../../hooks/useGameStage';
import { sound } from '../../services/sound';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';

interface QuizItem {
  prompt: string;
  emoji: string;
  options: string[];
  answer: string;
  hint: string;
}

const POOLS: QuizItem[][] = [
  [
    { prompt: 'Đồng hồ chỉ 7 giờ. Bé chọn đúng mặt đồng hồ nào?', emoji: '🕖', options: ['7 giờ', '8 giờ', '6 giờ'], answer: '7 giờ', hint: 'Kim ngắn chỉ 7' },
    { prompt: '1 + 1 tờ 1000đ bằng mấy?', emoji: '💵', options: ['2000đ', '1000đ', '3000đ'], answer: '2000đ', hint: '1000 + 1000' },
    { prompt: 'Bút chì dài khoảng mấy?', emoji: '✏️', options: ['15cm', '15m', '15km'], answer: '15cm', hint: 'Gang tay bé' },
    { prompt: 'Sáng bé đi học lúc mấy giờ?', emoji: '🌅', options: ['7 giờ sáng', '12 giờ đêm', '7 giờ tối'], answer: '7 giờ sáng', hint: 'Buổi sáng' },
    { prompt: 'Thứ Hai rồi đến thứ mấy?', emoji: '📅', options: ['Thứ Ba', 'Chủ Nhật', 'Thứ Bảy'], answer: 'Thứ Ba', hint: 'Đếm thứ' },
    { prompt: 'Cái thước dài 20cm, cắt 5cm còn mấy?', emoji: '📏', options: ['15cm', '25cm', '10cm'], answer: '15cm', hint: '20 - 5' },
  ],
  [
    { prompt: 'Đồng hồ chỉ 12 giờ trưa. Kim ngắn chỉ số mấy?', emoji: '🕛', options: ['12', '6', '3'], answer: '12', hint: 'Cả 2 kim chỉ 12' },
    { prompt: 'Mẹ cho 5000đ, mua kẹo 2000đ còn mấy?', emoji: '🍬', options: ['3000đ', '7000đ', '2000đ'], answer: '3000đ', hint: '5000 - 2000' },
    { prompt: 'Gang tay bé dài khoảng?', emoji: '🤏', options: ['1 gang (~15cm)', '1 mét', '1 ki-lô-mét'], answer: '1 gang (~15cm)', hint: 'Ngón tay' },
    { prompt: 'Buổi tối bé ngủ lúc mấy giờ?', emoji: '🌙', options: ['9 giờ tối', '9 giờ sáng', '12 giờ trưa'], answer: '9 giờ tối', hint: 'Trời tối' },
    { prompt: 'Hôm nay thứ Tư, hôm qua là thứ mấy?', emoji: '📆', options: ['Thứ Ba', 'Thứ Năm', 'Thứ Hai'], answer: 'Thứ Ba', hint: 'Lùi 1 ngày' },
    { prompt: 'Đoạn dây 10cm + 4cm = ?', emoji: '🧵', options: ['14cm', '6cm', '10cm'], answer: '14cm', hint: '10 + 4' },
  ],
  [
    { prompt: 'Kim dài chỉ 12, kim ngắn chỉ 3. Mấy giờ?', emoji: '🕒', options: ['3 giờ', '12 giờ', '6 giờ'], answer: '3 giờ', hint: 'Kim ngắn quyết định' },
    { prompt: '2 tờ 2000đ + 1 tờ 1000đ = ?', emoji: '💰', options: ['5000đ', '4000đ', '6000đ'], answer: '5000đ', hint: '2000+2000+1000' },
    { prompt: 'Cửa lớp cao khoảng?', emoji: '🚪', options: ['2m', '2cm', '20cm'], answer: '2m', hint: 'Cao hơn bé nhiều' },
    { prompt: 'Một tuần có mấy ngày?', emoji: '🗓️', options: ['7 ngày', '5 ngày', '10 ngày'], answer: '7 ngày', hint: '2,3,4,5,6,7,CN' },
    { prompt: 'Bé cao 110cm, bạn cao 105cm. Ai cao hơn?', emoji: '📐', options: ['Bé', 'Bạn', 'Bằng nhau'], answer: 'Bé', hint: '110 > 105' },
    { prompt: 'Sáng 7 giờ + 2 giờ nữa là mấy giờ?', emoji: '⏰', options: ['9 giờ', '5 giờ', '10 giờ'], answer: '9 giờ', hint: '7 + 2' },
  ],
  [
    { prompt: 'Nửa giờ = bao nhiêu phút?', emoji: '⏳', options: ['30 phút', '60 phút', '15 phút'], answer: '30 phút', hint: 'Một giờ 60 phút' },
    { prompt: 'Mua vở 8000đ, đưa 10000đ, thối lại?', emoji: '📒', options: ['2000đ', '18000đ', '8000đ'], answer: '2000đ', hint: '10000 - 8000' },
    { prompt: 'Sân trường dài khoảng?', emoji: '🏫', options: ['30m', '30cm', '30km'], answer: '30m', hint: 'Chạy mệt' },
    { prompt: 'Tháng 1 có 31 ngày. Sau tháng 1 là tháng mấy?', emoji: '📅', options: ['Tháng 2', 'Tháng 12', 'Tháng 3'], answer: 'Tháng 2', hint: 'Đếm tháng' },
    { prompt: '15cm so với 1dm (10cm): ?', emoji: '📏', options: ['Dài hơn', 'Ngắn hơn', 'Bằng nhau'], answer: 'Dài hơn', hint: '15 > 10' },
    { prompt: 'Bé có 10 viên bi, cho bạn 3, còn?', emoji: '🔮', options: ['7 viên', '13 viên', '3 viên'], answer: '7 viên', hint: '10 - 3' },
  ],
  [
    { prompt: 'Kim ngắn giữa 4 và 5, kim dài chỉ 6. Khoảng mấy giờ?', emoji: '🕟', options: ['4 giờ rưỡi', '6 giờ', '5 giờ'], answer: '4 giờ rưỡi', hint: 'Quá 4, gần 5' },
    { prompt: 'Tờ 10000đ đổi được mấy tờ 2000đ?', emoji: '💵', options: ['5 tờ', '2 tờ', '10 tờ'], answer: '5 tờ', hint: '2000 × 5' },
    { prompt: 'Cái bàn cao 70cm, ghế cao 40cm. Bàn hơn ghế?', emoji: '🪑', options: ['30cm', '110cm', '20cm'], answer: '30cm', hint: '70 - 40' },
    { prompt: 'Hôm nay thứ Sáu, 2 ngày nữa là?', emoji: '📆', options: ['Chủ Nhật', 'Thứ Bảy', 'Thứ Hai'], answer: 'Chủ Nhật', hint: '6,7,CN' },
    { prompt: 'Đoạn thẳng dài nhất?', emoji: '📐', options: ['1m', '90cm', '9cm'], answer: '1m', hint: '1m = 100cm' },
    { prompt: 'Lan có 6 cam, thêm 5 cam. Tất cả?', emoji: '🍊', options: ['11 quả', '1 quả', '10 quả'], answer: '11 quả', hint: '6 + 5' },
  ],
  [
    { prompt: 'Từ 8 giờ sáng đến 11 giờ trưa là mấy giờ?', emoji: '⏰', options: ['3 giờ', '19 giờ', '2 giờ'], answer: '3 giờ', hint: '11 - 8' },
    { prompt: 'Mua 2 bút 3000đ/cây, đưa 10000đ, thối?', emoji: '🖊️', options: ['4000đ', '6000đ', '3000đ'], answer: '4000đ', hint: '10000 - 6000' },
    { prompt: 'Con đường từ nhà đến trường 1km = ?', emoji: '🛣️', options: ['1000m', '100m', '10m'], answer: '1000m', hint: '1km = 1000m' },
    { prompt: 'Năm có mấy tháng?', emoji: '🗓️', options: ['12 tháng', '10 tháng', '7 tháng'], answer: '12 tháng', hint: 'Đếm ngón tay' },
    { prompt: 'Bình có 18 que tính, dùng 9. Còn?', emoji: '🥢', options: ['9 que', '27 que', '8 que'], answer: '9 que', hint: '18 - 9' },
    { prompt: 'Tổ 1 có 10 bạn, tổ 2 có 9 bạn. Cả 2 tổ?', emoji: '👫', options: ['19 bạn', '1 bạn', '20 bạn'], answer: '19 bạn', hint: '10 + 9' },
  ],
];

export const ClockMoneyGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => GAME_LEVEL_POLICY.ROUNDS_PER_TIER.slice() as unknown as number[], []);
  const stage = useGameStage({ gameId: 'clock_money', roundsPerTier });
  const [picked, setPicked] = useState<string | null>(null);

  const pool = POOLS[Math.min(stage.tier - 1, POOLS.length - 1)];
  const item = useMemo(() => {
    const list = shuffleSeeded(pool, seededRng(stage.tier * 2000 + 11));
    return list[stage.roundIdx % list.length];
  }, [pool, stage.tier, stage.roundIdx]);
  const options = useMemo(
    () => shuffleSeeded(item.options, seededRng(stage.tier * 7919 + stage.roundIdx * 57 + 3)),
    [item, stage.tier, stage.roundIdx]
  );

  const choose = (opt: string) => {
    if (stage.locked || stage.phase !== 'playing') return;
    setPicked(opt);
    if (opt === item.answer) {
      sound.playCorrect();
      sound.speak('Chính xác! Bé giỏi toán thực tế quá!', 'vi-VN');
      stage.submitCorrect();
      setTimeout(() => setPicked(null), 900);
    } else {
      sound.playWrong();
      sound.speak(item.hint, 'vi-VN');
      stage.submitWrong();
      setTimeout(() => setPicked(null), 900);
    }
  };

  return (
    <GameModalWrapper
      title="Thám Hiểm Giờ & Tiền Việt"
      subtitle="Xem giờ, tiêu tiền, đo độ dài như người lớn"
      mascotEmoji="⏰"
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
      instructions={item.prompt}
      audioInstruction={item.prompt}
      audioLang="vi-VN"
    >
      <div className="w-full max-w-2xl mx-auto text-center space-y-4 kb-game-stage animate-rise">
        <div className="text-7xl animate-bounce-soft">{item.emoji}</div>
        <h3 className="text-lg md:text-2xl font-black text-slate-900 font-display leading-snug">{item.prompt}</h3>
        <div className="grid grid-cols-1 gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`min-h-[52px] px-4 py-3 rounded-2xl font-black text-base border-3 transition-all active:scale-95 cursor-pointer ${
                picked === opt
                  ? opt === item.answer
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-rose-500 text-white border-rose-600'
                  : 'bg-white hover:bg-sky-50 text-slate-800 border-sky-300 shadow'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-bold text-sky-700">💡 {item.hint}</p>
      </div>
    </GameModalWrapper>
  );
};
