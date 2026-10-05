import React, { useState } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

interface RhymeRound {
  targetRhyme: string;
  targetDescription: string;
  fruits: { id: number; word: string; hasRhyme: boolean; emoji: string; picked: boolean }[];
}

const ROUNDS: RhymeRound[] = [
  {
    targetRhyme: 'an',
    targetDescription: 'vần "AN"',
    fruits: [
      { id: 1, word: 'cái bàn', hasRhyme: true, emoji: '🍎', picked: false },
      { id: 2, word: 'con cá', hasRhyme: false, emoji: '🍐', picked: false },
      { id: 3, word: 'bạn Lan', hasRhyme: true, emoji: '🍊', picked: false },
      { id: 4, word: 'hoa sen', hasRhyme: false, emoji: '🍑', picked: false },
      { id: 5, word: 'cái can', hasRhyme: true, emoji: '🍎', picked: false },
      { id: 6, word: 'mặt trời', hasRhyme: false, emoji: '🍓', picked: false },
    ],
  },
  {
    targetRhyme: 'on',
    targetDescription: 'vần "ON"',
    fruits: [
      { id: 7, word: 'chú thỏ con', hasRhyme: true, emoji: '🍊', picked: false },
      { id: 8, word: 'quả cam', hasRhyme: false, emoji: '🍎', picked: false },
      { id: 9, word: 'ngọn cỏ', hasRhyme: true, emoji: '🍐', picked: false },
      { id: 10, word: 'búp bê', hasRhyme: false, emoji: '🍑', picked: false },
      { id: 11, word: 'lon ton', hasRhyme: true, emoji: '🍓', picked: false },
      { id: 12, word: 'cây bàng', hasRhyme: false, emoji: '🍎', picked: false },
    ],
  },
  {
    targetRhyme: 'at',
    targetDescription: 'vần "AT"',
    fruits: [
      { id: 13, word: 'hạt cát', hasRhyme: true, emoji: '🍎', picked: false },
      { id: 14, word: 'con vịt', hasRhyme: false, emoji: '🍐', picked: false },
      { id: 15, word: 'ca hát', hasRhyme: true, emoji: '🍊', picked: false },
      { id: 16, word: 'củ cà rốt', hasRhyme: false, emoji: '🍑', picked: false },
      { id: 17, word: 'bát ngát', hasRhyme: true, emoji: '🍓', picked: false },
    ],
  },
];

export const RhymeHunterGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundsState, setRoundsState] = useState(ROUNDS);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentRound = roundsState[roundIdx];
  const remainingInRound = currentRound.fruits.filter((f) => f.hasRhyme && !f.picked).length;

  const handleFruitClick = (fruitId: number) => {
    const fruit = currentRound.fruits.find((f) => f.id === fruitId);
    if (!fruit || fruit.picked) return;

    if (fruit.hasRhyme) {
      sound.playCorrect();
      sound.speak(`Đúng rồi! "${fruit.word}" có ${currentRound.targetDescription}!`);
      const newScore = score + 1;
      setScore(newScore);

      const updated = [...roundsState];
      const targetF = updated[roundIdx].fruits.find((f) => f.id === fruitId);
      if (targetF) targetF.picked = true;
      setRoundsState(updated);

      // Check if all correct fruits picked in this round
      const stillRemaining = updated[roundIdx].fruits.filter((f) => f.hasRhyme && !f.picked).length;
      if (stillRemaining === 0) {
        sound.playStar();
        setTimeout(() => {
          if (roundIdx + 1 < roundsState.length) {
            setRoundIdx(roundIdx + 1);
            sound.speak(`Xuất sắc! Tiếp theo, hãy săn các quả có ${roundsState[roundIdx + 1].targetDescription} nhé!`);
          } else {
            setIsGameOver(true);
          }
        }, 1200);
      }
    } else {
      sound.playWrong();
      sound.speak(`Từ "${fruit.word}" chưa đúng rồi, bé hãy tìm quả có ${currentRound.targetDescription} nhé!`);
    }
  };

  const restartGame = () => {
    setRoundIdx(0);
    setScore(0);
    setIsGameOver(false);
    // Reset fruits picked
    setRoundsState(
      ROUNDS.map((r) => ({
        ...r,
        fruits: r.fruits.map((f) => ({ ...f, picked: false })),
      }))
    );
  };

  return (
    <GameModalWrapper
      title="Săn Vần Trong Vườn Cây"
      subtitle="Hái những trái cây ngọt ngào chứa vần được yêu cầu"
      mascotEmoji="🐰"
      score={score}
      maxScore={9}
      isGameOver={isGameOver}
      onRestart={restartGame}
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
              disabled={f.picked}
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
          <span className="text-xs md:text-sm font-bold">Giỏ trái cây thần kỳ: Đã hái {score} quả đúng!</span>
        </div>
      </div>
    </GameModalWrapper>
  );
};
