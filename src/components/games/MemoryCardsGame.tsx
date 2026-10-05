import React, { useState, useEffect } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';

interface CardItem {
  id: number;
  pairId: number;
  label: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const PAIRS = [
  { pairId: 1, label: 'Quả táo', emoji: '🍎' },
  { pairId: 2, label: 'Mèo con', emoji: '🐱' },
  { pairId: 3, label: 'Cún cưng', emoji: '🐶' },
  { pairId: 4, label: 'Ngôi sao', emoji: '⭐' },
  { pairId: 5, label: 'Bông hoa', emoji: '🌸' },
  { pairId: 6, label: 'Mặt trời', emoji: '☀️' },
];

export const MemoryCardsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = () => {
    // Duplicate and shuffle
    const deck: CardItem[] = [];
    let idCounter = 1;
    PAIRS.forEach((p) => {
      deck.push({ id: idCounter++, pairId: p.pairId, label: p.label, emoji: p.emoji, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, pairId: p.pairId, label: p.label, emoji: p.emoji, isFlipped: false, isMatched: false });
    });

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIds([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    sound.playClick();
    const nextFlipped = [...flippedIds, id];
    setFlippedIds(nextFlipped);

    // Flip this card
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const first = cards.find((c) => c.id === firstId);
      const second = cards.find((c) => c.id === secondId);

      if (first && second && first.pairId === second.pairId) {
        // Matched!
        sound.playCorrect();
        sound.speak(`Cặp ${first.label}!`);
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          )
        );
        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);
        setFlippedIds([]);

        if (newMatched >= PAIRS.length) {
          setIsGameOver(true);
        }
      } else {
        // Not match
        sound.playWrong();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  return (
    <GameModalWrapper
      title="Lật Thẻ Trí Nhớ Vàng"
      subtitle="Tìm và ghép đúng các cặp hình giống nhau"
      mascotEmoji="🧠"
      score={matchedPairs}
      maxScore={PAIRS.length}
      isGameOver={isGameOver}
      onRestart={initGame}
      onExit={onExit}
      instructions="Bé hãy lật từng thẻ để tìm hai hình giống hệt nhau nhé!"
      audioInstruction="Hãy lật các thẻ để tìm hai hình giống nhau"
    >
      <div className="w-full max-w-xl flex flex-col items-center justify-between p-2 md:p-4 select-none">
        {/* Moves Counter */}
        <div className="mb-3 px-4 py-1.5 bg-amber-100 rounded-full border border-amber-300 text-xs md:text-sm font-bold text-amber-900">
          Đã thử: <span className="font-black">{moves}</span> lượt · Đã tìm: <span className="font-black">{matchedPairs}/{PAIRS.length}</span> cặp
        </div>

        {/* 12 Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
          {cards.map((card) => {
            const showFace = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`h-24 md:h-28 rounded-2xl border-3 shadow-md flex flex-col items-center justify-center transition-all transform cursor-pointer ${
                  showFace
                    ? 'bg-white border-amber-400 rotate-0 scale-100'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-600 hover:scale-105 active:scale-95'
                } ${card.isMatched ? 'opacity-70 bg-emerald-50 border-emerald-400' : ''}`}
              >
                {showFace ? (
                  <div className="flex flex-col items-center animate-pop">
                    <span className="text-3xl md:text-4xl">{card.emoji}</span>
                    <span className="text-[11px] font-black text-amber-900 mt-1">{card.label}</span>
                  </div>
                ) : (
                  <span className="text-3xl text-white font-black drop-shadow">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameModalWrapper>
  );
};
