import React, { useState, useEffect } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';

interface PhonicsCard {
  id: number;
  word: string;
  emoji: string;
  spokenText: string;
}

const ROUNDS_DATA: { spokenPrompt: string; targetWord: string; cards: PhonicsCard[] }[] = [
  {
    spokenPrompt: 'Con mèo',
    targetWord: 'Con mèo',
    cards: [
      { id: 1, word: 'Con mèo', emoji: '🐱', spokenText: 'Con mèo' },
      { id: 2, word: 'Con cá', emoji: '🐟', spokenText: 'Con cá' },
      { id: 3, word: 'Con chó', emoji: '🐶', spokenText: 'Con chó' },
      { id: 4, word: 'Con gà', emoji: '🐓', spokenText: 'Con gà' },
    ],
  },
  {
    spokenPrompt: 'Quả cam',
    targetWord: 'Quả cam',
    cards: [
      { id: 5, word: 'Quả chuối', emoji: '🍌', spokenText: 'Quả chuối' },
      { id: 6, word: 'Quả cam', emoji: '🍊', spokenText: 'Quả cam' },
      { id: 7, word: 'Quả táo', emoji: '🍎', spokenText: 'Quả táo' },
      { id: 8, word: 'Quả dưa hấu', emoji: '🍉', spokenText: 'Quả dưa hấu' },
    ],
  },
  {
    spokenPrompt: 'Quyển sách',
    targetWord: 'Quyển sách',
    cards: [
      { id: 9, word: 'Cây bút', emoji: '✏️', spokenText: 'Cây bút' },
      { id: 10, word: 'Cái cặp', emoji: '🎒', spokenText: 'Cái cặp' },
      { id: 11, word: 'Quyển sách', emoji: '📖', spokenText: 'Quyển sách' },
      { id: 12, word: 'Thước kẻ', emoji: '📏', spokenText: 'Thước kẻ' },
    ],
  },
  {
    spokenPrompt: 'Mặt trời',
    targetWord: 'Mặt trời',
    cards: [
      { id: 13, word: 'Mặt trăng', emoji: '🌙', spokenText: 'Mặt trăng' },
      { id: 14, word: 'Ngôi sao', emoji: '⭐', spokenText: 'Ngôi sao' },
      { id: 15, word: 'Đám mây', emoji: '☁️', spokenText: 'Đám mây' },
      { id: 16, word: 'Mặt trời', emoji: '☀️', spokenText: 'Mặt trời' },
    ],
  },
];

export const ListenPickPhonicsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = ROUNDS_DATA[roundIdx];

  const playVoice = () => {
    sound.speak(current.spokenPrompt);
  };

  useEffect(() => {
    // Speak automatically on round start
    const timer = setTimeout(() => {
      playVoice();
    }, 400);
    return () => clearTimeout(timer);
  }, [roundIdx]);

  const handlePick = (card: PhonicsCard) => {
    if (card.word === current.targetWord) {
      sound.playCorrect();
      sound.speak(`Chính xác! Đó là ${card.word}!`);
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        if (roundIdx + 1 < ROUNDS_DATA.length) {
          setRoundIdx(roundIdx + 1);
        } else {
          setIsGameOver(true);
        }
      }, 1200);
    } else {
      sound.playWrong();
      sound.speak(`Đây là ${card.word}, bé hãy nghe lại và chọn nhé!`);
    }
  };

  const restartGame = () => {
    setRoundIdx(0);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <GameModalWrapper
      title="Đôi Tai Thính — Nghe & Chọn"
      subtitle="Lắng nghe âm thanh và chọn đúng hình ảnh tương ứng"
      mascotEmoji="🦉"
      score={score}
      maxScore={ROUNDS_DATA.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions="Bé hãy bấm vào chiếc loa để nghe từ và chọn hình đúng!"
      audioInstruction="Hãy bấm vào chiếc loa để nghe và chọn hình đúng"
    >
      <div className="w-full max-w-xl flex flex-col items-center justify-center p-4">
        {/* Giant Speaker Button */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={playVoice}
            className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 rounded-full shadow-xl flex items-center justify-center border-4 border-white active:scale-95 transition-all cursor-pointer animate-pulse-subtle"
          >
            <Volume2 className="w-12 h-12 text-amber-950" />
          </button>
          <span className="text-xs md:text-sm font-black text-amber-900 mt-2 bg-white/80 px-4 py-1 rounded-full shadow-sm">
            Bấm vào loa để nghe lại 🔊
          </span>
        </div>

        {/* 4 Illustrated Cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {current.cards.map((c) => (
            <button
              key={c.id}
              onClick={() => handlePick(c)}
              className="p-4 bg-white hover:bg-amber-50 border-3 border-amber-300 hover:border-amber-500 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="text-5xl md:text-6xl">{c.emoji}</span>
              <span className="text-base md:text-lg font-black text-slate-800 tracking-wide font-display">
                {c.word}
              </span>
            </button>
          ))}
        </div>
      </div>
    </GameModalWrapper>
  );
};
