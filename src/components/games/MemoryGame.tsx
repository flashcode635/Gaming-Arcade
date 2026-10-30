"use client";

import { useState, useEffect } from 'react';
import { ResetIcon } from '@/assets/svg/Icons';
import { useGameCurrency } from '@/context/GameCurrencyContext';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
const GAME_COST = 1;

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createOrderedBoard = (): Card[] =>
  EMOJIS.flatMap((emoji, index) => [
    { id: index * 2, emoji, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false },
  ]);

const createBoard = (): Card[] => shuffleArray(createOrderedBoard());

export default function MemoryGame() {
  const { balance, addBalance, deductBalance } = useGameCurrency();
  const [cards, setCards] = useState<Card[]>(createOrderedBoard);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Shuffle after mount so server and client markup match (no hydration mismatch)
  useEffect(() => {
    setCards(createBoard());
  }, []);

  const totalPairs = EMOJIS.length;
  const isWon = matches === totalPairs;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !isWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isWon]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(m => m + 1);
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (isWon && isRunning) {
      setIsRunning(false);
      if (bestScore === null || moves < bestScore) {
        setBestScore(moves);
      }
    }
  }, [isWon, isRunning, moves, bestScore]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    if (!isRunning) setIsRunning(true);

    setCards(prev => prev.map(c =>
      c.id === id ? { ...c, isFlipped: true } : c
    ));
    setFlippedCards(prev => [...prev, id]);
  };

  const resetGame = () => {
    if (balance < GAME_COST) return;
    
    deductBalance(GAME_COST);
    setCards(createBoard());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsRunning(false);
    setIsLocked(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row md:gap-10 items-baseline justify-between px-4 sm:px-8 pt-2 sm:pt-4 pb-4 sm:pb-8 bg-black/70">
       <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-green-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Time</p>
            <p className="text-white font-bold text-sm sm:text-lg font-mono">{formatTime(timer)}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-green-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Moves</p>
            <p className="text-white font-bold text-sm sm:text-lg">{moves}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-cyan-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Matches</p>
            <p className="text-white font-bold text-sm sm:text-lg">{matches}/{totalPairs}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-cyan-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Best</p>
            <p className="text-white font-bold text-sm sm:text-lg">{bestScore ?? '-'}</p>
          </div>
          {/* extra */}
            {isWon && (
          <div className="mb-4 text-center p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-pulse-neon">
            <p className="text-green-400 text-lg sm:text-xl font-bold">🎉 You Won!</p>
            <p className="text-green-300 text-xs sm:text-sm">
              Completed in {moves} moves • {formatTime(timer)}
            </p>
          </div>
        )}
          <div className="w-full col-span-4 flex flex-col items-center justify-center gap-3 sm:gap-4">

              <button
                onClick={resetGame}
                disabled={balance < GAME_COST}
                className="w-full bg-linear-to-r from-green-500 to-cyan-500 text-black font-bold py-2.5 sm:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {balance >= GAME_COST ? `New Game (-$${GAME_COST})` : 'Not Enough Credits'}
              </button>

              <p className="text-gray-600 text-xs text-center mt-3">
                Click cards to flip them. Find all matching pairs!
              </p>
          </div>
        </div>

      <div className="bg-dark-card/90 backdrop-blur-sm border border-cyan-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-120 w-full">
       
{/* grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="flip-card aspect-square"
              disabled={card.isFlipped || card.isMatched || isLocked}
            >
              <div className={`flip-card-inner ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}>
                <div className="flip-card-back bg-dark-surface border-2 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5 cursor-pointer">
                  <span className="text-cyan-500/40 text-xl sm:text-3xl font-bold">?</span>
                </div>
                <div className={`flip-card-front ${card.isMatched ? 'bg-green-500/10 border-2 border-green-500/40' : 'bg-green-500/10 border-2 border-green-500/40'}`}>
                  <span className="text-2xl sm:text-4xl animate-pulse-neon">{card.emoji}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
      
    </div>
  );
}
