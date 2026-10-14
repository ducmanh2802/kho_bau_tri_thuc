import React, { useMemo, useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { useGameStage } from '../../hooks/useGameStage';
import { sound } from '../../services/sound';
import { GAME_LEVEL_POLICY } from '../../config/policy';
import { getTierMeta, seededRng, shuffleSeeded } from '../../data/gameLevels';

export interface StoryItem {
  story: string;
  emoji: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export const POOLS: StoryItem[][] = [
  [
    { story: 'Lan có 3 quả táo. Mẹ cho thêm 2 quả.', emoji: '🍎', question: 'Lan có tất cả mấy quả táo?', options: ['5 quả', '4 quả', '6 quả'], answer: '5 quả', hint: '3 + 2 = 5' },
    { story: 'Bé có 5 viên bi, cho bạn 1 viên.', emoji: '🔮', question: 'Bé còn mấy viên bi?', options: ['4 viên', '6 viên', '5 viên'], answer: '4 viên', hint: '5 - 1 = 4' },
    { story: 'Trên cành có 4 chú chim, bay đến thêm 3 chú.', emoji: '🐦', question: 'Có tất cả mấy chú chim?', options: ['7 chú', '6 chú', '5 chú'], answer: '7 chú', hint: '4 + 3 = 7' },
    { story: 'Hộp có 6 cái bánh, bé ăn 2 cái.', emoji: '🍪', question: 'Còn mấy cái bánh?', options: ['4 cái', '8 cái', '6 cái'], answer: '4 cái', hint: '6 - 2 = 4' },
    { story: 'Lớp có 5 bạn trai và 4 bạn gái.', emoji: '👫', question: 'Cả lớp có mấy bạn?', options: ['9 bạn', '8 bạn', '10 bạn'], answer: '9 bạn', hint: '5 + 4 = 9' },
    { story: 'Ao có 7 con cá, bắt đi 3 con.', emoji: '🐟', question: 'Còn mấy con cá?', options: ['4 con', '10 con', '5 con'], answer: '4 con', hint: '7 - 3 = 4' },
  ],
  [
    { story: 'Mẹ mua 10 quả trứng, dùng 4 quả để rán.', emoji: '🥚', question: 'Còn mấy quả trứng?', options: ['6 quả', '14 quả', '4 quả'], answer: '6 quả', hint: '10 - 4 = 6' },
    { story: 'Vườn có 6 cây cam và 5 cây bưởi.', emoji: '🍊', question: 'Vườn có mấy cây?', options: ['11 cây', '10 cây', '9 cây'], answer: '11 cây', hint: '6 + 5 = 11' },
    { story: 'Bé gấp 8 con hạc, tặng bạn 5 con.', emoji: '🦩', question: 'Bé còn mấy con hạc?', options: ['3 con', '13 con', '5 con'], answer: '3 con', hint: '8 - 5 = 3' },
    { story: 'Xe buýt có 9 bạn, thêm 6 bạn lên xe.', emoji: '🚌', question: 'Xe có mấy bạn?', options: ['15 bạn', '14 bạn', '3 bạn'], answer: '15 bạn', hint: '9 + 6 = 15' },
    { story: 'Tủ có 12 quyển truyện, cho em 5 quyển.', emoji: '📚', question: 'Còn mấy quyển?', options: ['7 quyển', '17 quyển', '5 quyển'], answer: '7 quyển', hint: '12 - 5 = 7' },
    { story: 'Sân có 10 bông hoa, nở thêm 7 bông.', emoji: '🌸', question: 'Có mấy bông hoa?', options: ['17 bông', '16 bông', '3 bông'], answer: '17 bông', hint: '10 + 7 = 17' },
  ],
  [
    { story: 'Bé Lan đọc 8 trang sáng, 7 trang chiều.', emoji: '📖', question: 'Cả ngày đọc mấy trang?', options: ['15 trang', '14 trang', '16 trang'], answer: '15 trang', hint: '8 + 7 = 15' },
    { story: 'Bình có 14 que tính, dùng 6 que xếp hình.', emoji: '🥢', question: 'Còn mấy que?', options: ['8 que', '20 que', '6 que'], answer: '8 que', hint: '14 - 6 = 8' },
    { story: 'Đàn gà có 9 con, nở thêm 8 con.', emoji: '🐔', question: 'Đàn gà có mấy con?', options: ['17 con', '16 con', '18 con'], answer: '17 con', hint: '9 + 8 = 17' },
    { story: 'Cửa hàng có 20 cái kẹo, bán 12 cái.', emoji: '🍬', question: 'Còn mấy cái kẹo?', options: ['8 cái', '32 cái', '12 cái'], answer: '8 cái', hint: '20 - 12 = 8' },
    { story: 'Tổ 1 trồng 11 cây, tổ 2 trồng 8 cây.', emoji: '🌳', question: 'Hai tổ trồng mấy cây?', options: ['19 cây', '18 cây', '20 cây'], answer: '19 cây', hint: '11 + 8 = 19' },
    { story: 'Bé có 16 sticker, dán hết 9 cái.', emoji: '⭐', question: 'Còn mấy sticker?', options: ['7 cái', '25 cái', '9 cái'], answer: '7 cái', hint: '16 - 9 = 7' },
  ],
  // T4: cộng/trừ KHÔNG nhớ trong 100 (T02/A6)
  [
    { story: 'Hộp có 24 cái bánh, mẹ cho thêm 3 cái.', emoji: '🍪', question: 'Hộp có mấy cái bánh?', options: ['27 cái', '26 cái', '28 cái'], answer: '27 cái', hint: '24 + 3 = 27' },
    { story: 'Lớp có 31 bạn, thêm 5 bạn mới.', emoji: '🧒', question: 'Lớp có mấy bạn?', options: ['36 bạn', '35 bạn', '37 bạn'], answer: '36 bạn', hint: '31 + 5 = 36' },
    { story: 'Bé có 42 sticker, dán hết 11 cái.', emoji: '⭐', question: 'Còn mấy sticker?', options: ['31 cái', '32 cái', '30 cái'], answer: '31 cái', hint: '42 - 11 = 31' },
    { story: 'Sân có 56 bông hoa, héo 23 bông.', emoji: '🌸', question: 'Còn mấy bông tươi?', options: ['33 bông', '32 bông', '34 bông'], answer: '33 bông', hint: '56 - 23 = 33' },
    { story: 'Thư viện có 48 sách, cho mượn 15 sách.', emoji: '📚', question: 'Còn mấy sách?', options: ['33 sách', '32 sách', '34 sách'], answer: '33 sách', hint: '48 - 15 = 33' },
    { story: 'Bé chạy 12 vòng sáng, 11 vòng chiều.', emoji: '🏃', question: 'Cả ngày mấy vòng?', options: ['23 vòng', '22 vòng', '24 vòng'], answer: '23 vòng', hint: '12 + 11 = 23' },
  ],
  // T5: cộng/trừ KHÔNG nhớ trong 100
  [
    { story: 'Mẹ đi chợ với 50 nghìn, mua rau 10 nghìn.', emoji: '🥬', question: 'Còn mấy nghìn?', options: ['40 nghìn', '60 nghìn', '30 nghìn'], answer: '40 nghìn', hint: '50 - 10 = 40' },
    { story: 'Lớp 1A 32 bạn, lớp 1B 25 bạn.', emoji: '🏫', question: 'Hai lớp mấy bạn?', options: ['57 bạn', '56 bạn', '58 bạn'], answer: '57 bạn', hint: '32 + 25 = 57' },
    { story: 'Sân bay có 48 máy bay, cất cánh 16 chiếc.', emoji: '✈️', question: 'Còn mấy chiếc?', options: ['32 chiếc', '31 chiếc', '33 chiếc'], answer: '32 chiếc', hint: '48 - 16 = 32' },
    { story: 'Bé tiết kiệm 24 nghìn rồi thêm 35 nghìn.', emoji: '🐷', question: 'Có mấy nghìn?', options: ['59 nghìn', '58 nghìn', '60 nghìn'], answer: '59 nghìn', hint: '24 + 35 = 59' },
    { story: 'Vườn 65 hoa, héo 24 hoa.', emoji: '🌷', question: 'Còn mấy hoa tươi?', options: ['41 hoa', '40 hoa', '42 hoa'], answer: '41 hoa', hint: '65 - 24 = 41' },
    { story: 'Truyện 76 trang, đọc 34 trang.', emoji: '📖', question: 'Còn mấy trang?', options: ['42 trang', '41 trang', '43 trang'], answer: '42 trang', hint: '76 - 34 = 42' },
  ],
  // T6: cộng/trừ KHÔNG nhớ trong 100
  [
    { story: 'Trại hè 52 bạn, thêm 34 bạn đăng ký.', emoji: '⛺', question: 'Có mấy bạn?', options: ['86 bạn', '85 bạn', '87 bạn'], answer: '86 bạn', hint: '52 + 34 = 86' },
    { story: 'Kho 96 thùng, xuất 52 thùng.', emoji: '📦', question: 'Còn mấy thùng?', options: ['44 thùng', '43 thùng', '45 thùng'], answer: '44 thùng', hint: '96 - 52 = 44' },
    { story: 'Bé có 23 bút chì và 24 bút màu.', emoji: '🖍️', question: 'Có mấy cái bút?', options: ['47 bút', '46 bút', '48 bút'], answer: '47 bút', hint: '23 + 24 = 47' },
    { story: 'Sách 89 trang, đọc 56 trang.', emoji: '📕', question: 'Còn mấy trang?', options: ['33 trang', '32 trang', '34 trang'], answer: '33 trang', hint: '89 - 56 = 33' },
    { story: 'Đội trống 34 bạn nam và 25 bạn nữ.', emoji: '🥁', question: 'Đội có mấy bạn?', options: ['59 bạn', '58 bạn', '60 bạn'], answer: '59 bạn', hint: '34 + 25 = 59' },
    { story: 'Siêu thị 78 kẹo, bán 45 kẹo.', emoji: '🏪', question: 'Còn mấy kẹo?', options: ['33 kẹo', '32 kẹo', '34 kẹo'], answer: '33 kẹo', hint: '78 - 45 = 33' },
  ],
];

export const WordStoryGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const roundsPerTier = useMemo(() => GAME_LEVEL_POLICY.ROUNDS_PER_TIER.slice() as unknown as number[], []);
  const stage = useGameStage({ gameId: 'word_story', roundsPerTier });
  const [picked, setPicked] = useState<string | null>(null);

  const pool = POOLS[Math.min(stage.tier - 1, POOLS.length - 1)];
  const item = useMemo(() => {
    const list = shuffleSeeded(pool, seededRng(stage.tier * 4000 + 9 + stage.nonce * 101));
    return list[stage.roundIdx % list.length];
  }, [pool, stage.tier, stage.roundIdx, stage.nonce]);
  const options = useMemo(
    () => shuffleSeeded(item.options, seededRng(stage.tier * 331 + stage.roundIdx * 91 + stage.nonce * 17)),
    [item, stage.tier, stage.roundIdx, stage.nonce]
  );

  const choose = (opt: string) => {
    if (stage.locked || stage.phase !== 'playing') return;
    setPicked(opt);
    if (opt === item.answer) {
      sound.playCorrect();
      sound.speak('Đúng rồi! Bé giải toán lời văn siêu giỏi!', 'vi-VN');
      stage.submitCorrect();
      setTimeout(() => setPicked(null), 1000);
    } else {
      sound.playWrong();
      sound.speak(item.hint, 'vi-VN');
      stage.submitWrong();
      setTimeout(() => setPicked(null), 1000);
    }
  };

  return (
    <GameModalWrapper
      gameId="word_story"
      title="Chuyện Kể Toán Học"
      subtitle="Đọc chuyện, giải toán lời văn như thám tử nhí"
      mascotEmoji="🔍"
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
      instructions={item.story + ' ' + item.question}
      audioInstruction={item.story + ' ' + item.question}
      audioLang="vi-VN"
    >
      <div className="w-full max-w-2xl mx-auto space-y-4 kb-game-stage animate-rise">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 text-center shadow">
          <div className="text-6xl mb-2">{item.emoji}</div>
          <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">{item.story}</p>
          <p className="mt-2 text-lg md:text-xl font-black text-amber-950 font-display">{item.question}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`min-h-[56px] px-4 py-3 rounded-2xl font-black text-lg border-3 transition-all active:scale-95 cursor-pointer ${
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
