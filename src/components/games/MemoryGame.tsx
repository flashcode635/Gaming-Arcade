"use client";

import { useState, useEffect, useRef } from 'react';
import { ResetIcon } from '@/assets/svg/Icons';
import { useGameCurrency } from '@/context/GameCurrencyContext';

interface Card {
  id: number;
  symbol: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const iconClass = "w-8 h-8 sm:w-10 sm:h-10";

const ControllerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <rect x="2" y="7" width="20" height="10" rx="5" />
    <path d="M7 12h4M9 10v4" />
    <circle cx="16" cy="11" r="1" />
    <circle cx="18" cy="13" r="1" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const DiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8" cy="8" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="16" cy="16" r="1" />
  </svg>
);

const TentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M3 20L12 4l9 16z" />
    <path d="M12 20v-6" />
    <path d="M8 20l4-6 4 6" />
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.5c2.5 0 4.5-2 4.5-4.5C22 6 17.5 3 12 3z" />
    <circle cx="7.5" cy="10.5" r="1" />
    <circle cx="10.5" cy="7.5" r="1" />
    <circle cx="15" cy="8" r="1" />
  </svg>
);

const MaskIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M4 5c3 1.5 5 1.5 8 0 3 1.5 5 1.5 8 0v6c0 4-3.5 7-8 7s-8-3-8-7z" />
    <path d="M8 11c.8 1 2.4 1 3.2 0M12.8 11c.8 1 2.4 1 3.2 0" />
  </svg>
);

const NoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const HornIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M3 10v4h4l10 5V5L7 10z" />
    <path d="M21 9v6" />
  </svg>
);

const ICONS = [ControllerIcon, TargetIcon, DiceIcon, TentIcon, PaletteIcon, MaskIcon, NoteIcon, HornIcon];
const GAME_COST = 1;
/** Registry payout promise: "Perfect bonus" — every win pays, a perfect game pays extra. */
const MEMORY_WIN_PAYOUT = 2;
const MEMORY_PERFECT_BONUS = 5;

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createOrderedBoard = (): Card[] =>
  ICONS.flatMap((_, index) => [
    { id: index * 2, symbol: index, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, symbol: index, isFlipped: false, isMatched: false },
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
  const timeoutsRef = useRef<number[]>([]);

  // Shuffle after mount so server and client markup match (no hydration
  // mismatch). The two-pass render is the documented fix for random UI — the
  // react-hooks lint flags every setState-in-effect, so silence it here only.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(createBoard());
  }, []);

  const totalPairs = ICONS.length;
  const isWon = matches === totalPairs;

  // Pending flip timeouts must never leak into the next game.
  useEffect(() => {
    const pending = timeoutsRef;
    return () => {
      pending.current.forEach((t) => clearTimeout(t));
      pending.current = [];
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !isWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isWon]);

  // Resolve a pair of flipped cards. All state writes happen inside the
  // timeout callbacks (never synchronously in the effect body) so the
  // react-hooks/set-state-in-effect rule stays green.
  useEffect(() => {
    if (flippedCards.length !== 2) return;
    const [first, second] = flippedCards;
    const firstCard = cards.find(c => c.id === first);
    const secondCard = cards.find(c => c.id === second);

    if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
      const t = window.setTimeout(() => {
        setCards(prev => prev.map(card =>
          card.id === first || card.id === second
            ? { ...card, isMatched: true }
            : card
        ));
        const nextMatches = matches + 1;
        setMatches(nextMatches);
        setFlippedCards([]);
        setIsLocked(false);
        if (nextMatches === totalPairs) {
          setIsRunning(false);
          setBestScore(prev => (prev === null || moves < prev ? moves : prev));
          // Payout: every win pays; a perfect game (only matching flips,
          // moves === pairs) collects the extra bonus.
          addBalance(MEMORY_WIN_PAYOUT);
          if (moves === totalPairs) addBalance(MEMORY_PERFECT_BONUS);
        }
      }, 500);
      timeoutsRef.current.push(t);
    } else {
      const t = window.setTimeout(() => {
        setCards(prev => prev.map(card =>
          card.id === first || card.id === second
            ? { ...card, isFlipped: false }
            : card
        ));
        setFlippedCards([]);
        setIsLocked(false);
      }, 1000);
      timeoutsRef.current.push(t);
    }
  }, [flippedCards, cards, matches, moves, totalPairs, addBalance]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    if (!isRunning) setIsRunning(true);

    setCards(prev => prev.map(c =>
      c.id === id ? { ...c, isFlipped: true } : c
    ));
    const nextFlipped = [...flippedCards, id];
    if (nextFlipped.length === 2) {
      // Locking + move counting live here (event handler), not in an effect.
      setMoves(m => m + 1);
      setIsLocked(true);
    }
    setFlippedCards(nextFlipped);
  };

  const resetGame = () => {
    if (balance < GAME_COST) return;

    deductBalance(GAME_COST);
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
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
    <div className="min-h-fit flex flex-col md:flex-row md:gap-10 items-baseline justify-center px-4 sm:px-8 pt-2 sm:pt-4 pb-1 sm:pb-2 bg-black/70 rounded-2xl sm:rounded-3xl overflow-hidden">
       <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-green-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Time</p>
            <p className="text-white font-bold text-sm sm:text-lg font-mono tabular-nums">{formatTime(timer)}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-green-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Moves</p>
            <p className="text-white font-bold text-sm sm:text-lg tabular-nums">{moves}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-cyan-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Matches</p>
            <p className="text-white font-bold text-sm sm:text-lg tabular-nums">{matches}/{totalPairs}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-cyan-500/20">
            <p className="text-gray-500 text-[10px] sm:text-xs">Best</p>
            <p className="text-white font-bold text-sm sm:text-lg tabular-nums">{bestScore ?? '-'}</p>
          </div>
          {/* win banner (col-span-4 keeps it out of the stats grid cells) */}
            {isWon && (
          <div className="col-span-4 text-center p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-pulse-neon">
            <p className="text-green-400 text-lg sm:text-xl font-bold tabular-nums">
              You Won! +${(MEMORY_WIN_PAYOUT + (moves === totalPairs ? MEMORY_PERFECT_BONUS : 0)).toFixed(2)}
            </p>
            <p className="text-green-300 text-xs sm:text-sm tabular-nums">
              Completed in {moves} moves • {formatTime(timer)}
              {moves === totalPairs ? ' • PERFECT GAME +$5.00' : ''}
            </p>
          </div>
        )}
          <div className="w-full col-span-4 flex flex-col items-center justify-center gap-3 sm:gap-4">

              <button
                onClick={resetGame}
                disabled={balance < GAME_COST}
                className="w-full bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold py-2.5 sm:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {balance >= GAME_COST ? `New Game (-$${GAME_COST})` : 'Not Enough Credits'}
              </button>

              <p className="text-gray-600 text-xs text-center mt-3">
                Click cards to flip them. Every win pays $2.00 — a perfect game adds a $5.00 bonus.
              </p>
          </div>
        </div>

      <div className="bg-dark-card/90 backdrop-blur-sm border border-cyan-500/20 rounded-2xl sm:rounded-3xl overflow-hidden p-3 sm:p-5 max-w-120 w-full mx-auto">
       
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
                  <span className="text-2xl sm:text-4xl animate-pulse-neon">{(() => { const Icon = ICONS[card.symbol]; return <Icon />; })()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
      
    </div>
  );
}
