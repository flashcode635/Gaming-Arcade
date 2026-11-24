'use client';

import Link from 'next/link';
import type { GameType } from '@/lib/games';
import { PlinkoIcon, SudokuIcon, TicTacToeIcon, SnakeIcon, MemoryIcon, MinesweeperIcon, GamepadIcon, BoltIcon } from '../assets/svg/GameIcons';
import { useGameCurrency } from '../context/GameCurrencyContext';
import { TopBar } from './core/topBar';

const games = [
  {
    id: 'plinko' as GameType,
    title: 'Plinko',
    icon: PlinkoIcon,
    description: 'Drop the ball and win big!',
    color: 'from-green-500 to-cyan-500',
    difficulty: 'Hard',
    costPerTurn: 1,
  },
  {
    id: 'sudoku' as GameType,
    title: 'Sudoku',
    icon: SudokuIcon,
    description: 'Classic number puzzle',
    color: 'from-green-500 to-cyan-500',
    difficulty: 'Medium',
    costPerTurn: 1,
  },
  {
    id: 'tictactoe' as GameType,
    title: 'Tic-Tac-Toe',
    icon: TicTacToeIcon,
    description: 'Beat the AI or play with friends',
    color: 'from-green-500 to-cyan-500',
    difficulty: 'Easy',
    costPerTurn: 1,
  },
  {
    id: 'snake' as GameType,
    title: 'Snake',
    icon: SnakeIcon,
    description: 'Classic snake game',
    color: 'from-green-500 to-cyan-500',
    difficulty: 'Medium',
    costPerTurn: 1,
  },
  {
    id: 'memory' as GameType,
    title: 'Memory Match',
    icon: MemoryIcon,
    description: 'Test your memory',
    color: 'from-green-500 to-cyan-500',
    difficulty: 'Easy',
    costPerTurn: 1,
  },
  {
    id: 'minesweeper' as GameType,
    title: 'Minesweeper',
    icon: MinesweeperIcon,
    description: 'Find gems, avoid mines',
    color: 'from-green-500 to-cyan-500',
    difficulty: 'Hard',
    costPerTurn: 1,
  },
];

export default function Home() {
  const { balance } = useGameCurrency();

  return (
    <div className="min-h-screen flex flex-col bg-dark-card/20 backdrop-blur-sm">
      <TopBar />
      <header className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-display font-bold text-6xl md:text-7xl uppercase tracking-widest text-white mb-3 sm:mb-4 animate-float flex flex-col md:flex-row gap-4">
            <span className="neon-text">Neo</span>
            <span className="neon-text-cyan">Arcade</span>
          </h1>
          {/* <p className="font-sans font-normal text-zinc-400 tracking-wide text-sm sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
            Your ultimate mini-games hub
          </p> */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <span className="px-2 sm:px-3 py-1 font-mono font-medium tabular-nums bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
              <GamepadIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              6 Games
            </span>
            <span className="px-2 sm:px-3 py-1 font-mono font-medium tabular-nums bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
              <BoltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              $1 Per Turn
            </span>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl w-full px-3 sm:px-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              aria-disabled={balance < game.costPerTurn}
              tabIndex={balance < game.costPerTurn ? -1 : undefined}
              onClick={(e) => { if (balance < game.costPerTurn) e.preventDefault(); }}
              className={`card-hover group relative bg-dark-card/30 backdrop-blur-sm border border-green-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left overflow-hidden min-h-40 sm:min-h-45 block ${balance < game.costPerTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <game.icon className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-500/10 rounded-md font-mono font-medium text-[11px] uppercase tracking-wider text-green-400 border border-green-500/20">
                      {game.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-cyan-500/10 rounded-md font-mono font-bold tabular-nums text-xs text-cyan-400 border border-cyan-500/20">
                      ${game.costPerTurn}
                    </span>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg sm:text-xl tracking-tight text-white group-hover:text-green-400 transition-colors">
                  {game.title}
                </h3>
                <p className="font-sans font-normal text-zinc-500 text-xs sm:text-sm leading-relaxed">
                  {game.description}
                </p>
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-green-400 group-hover:text-cyan-400 transition-colors">
                  <span className="font-sans font-semibold tracking-wide text-xs sm:text-sm">
                    {balance >= game.costPerTurn ? 'Play Now' : 'Not Enough Credits'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </header>

      <footer className="border-t border-green-500/10 py-6 text-center">
        <p className="font-sans font-normal text-zinc-600 text-xs flex items-center justify-center gap-1.5">
          <GamepadIcon className="w-4 h-4" />
          Neon Arcade — Built with React & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
