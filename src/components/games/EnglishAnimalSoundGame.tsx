import React, { useState, useEffect } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Volume2 } from 'lucide-react';

interface AnimalSafariItem {
  id: number;
  englishName: string;
  vietnameseMeaning: string;
  emoji: string;
  soundCue: string;
}

const SAFARI_ANIMALS: AnimalSafariItem[] = [
  { id: 1, englishName: 'Dog', vietnameseMeaning: 'Con chó', emoji: '🐶', soundCue: 'Woof woof! Find the Dog!' },
  { id: 2, englishName: 'Cat', vietnameseMeaning: 'Con mèo', emoji: '🐱', soundCue: 'Meow meow! Find the Cat!' },
  { id: 3, englishName: 'Duck', vietnameseMeaning: 'Con vịt', emoji: '🦆', soundCue: 'Quack quack! Find the Duck!' },
  { id: 4, englishName: 'Lion', vietnameseMeaning: 'Sư tử', emoji: '🦁', soundCue: 'Roar! Find the Lion!' },
  { id: 5, englishName: 'Monkey', vietnameseMeaning: 'Con khỉ', emoji: '🐵', soundCue: 'Ooh ooh aah aah! Find the Monkey!' },
];

export const EnglishAnimalSoundGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [animalIdx, setAnimalIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = SAFARI_ANIMALS[animalIdx];

  const playVoice = () => {
    sound.speak(current.englishName, 'en-GB');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      sound.speak(`Find the ${current.englishName}!`, 'en-GB');
    }, 400);
    return () => clearTimeout(timer);
  }, [animalIdx]);

  const handlePickAnimal = (item: AnimalSafariItem) => {
    if (item.englishName === current.englishName) {
      sound.playCorrect();
      sound.speak(`Great job! This is a ${item.englishName}!`, 'en-GB');
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        if (animalIdx + 1 < SAFARI_ANIMALS.length) {
          setAnimalIdx(animalIdx + 1);
        } else {
          setIsGameOver(true);
        }
      }, 1300);
    } else {
      sound.playWrong();
      sound.speak(`No, this is a ${item.englishName}. Find the ${current.englishName}!`, 'en-GB');
    }
  };

  const restartGame = () => {
    setAnimalIdx(0);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <GameModalWrapper
      title="Safari Tiếng Anh — Animal Explorer"
      subtitle="Lắng nghe tên loài vật bằng tiếng Anh và chạm đúng con thú"
      mascotEmoji="🦁"
      score={score}
      maxScore={SAFARI_ANIMALS.length}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions={`Listen & find: [ ${current.englishName} ] (${current.vietnameseMeaning})`}
      audioInstruction={`Find the ${current.englishName}`}
      audioLang="en-GB"
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-emerald-100 via-yellow-50 to-emerald-200 rounded-3xl p-4 md:p-6 border-3 border-emerald-400 select-none">
        {/* Top Prompt with pronunciation button */}
        <div className="flex flex-col items-center my-auto">
          <div className="flex items-center gap-3 bg-white/95 px-6 py-3 rounded-3xl shadow-lg border-2 border-emerald-400">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Find the animal:</span>
              <span className="text-3xl md:text-4xl font-black text-emerald-950 font-display">
                {current.englishName}
              </span>
              <span className="text-xs text-slate-500 font-semibold block">({current.vietnameseMeaning})</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-xl">
          {SAFARI_ANIMALS.map((animal) => (
            <button
              key={animal.id}
              onClick={() => handlePickAnimal(animal)}
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
