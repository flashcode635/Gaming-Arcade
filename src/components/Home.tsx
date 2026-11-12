'use client';

import Link from 'next/link';
import type { GameType } from '@/lib/games';
import { useTheme } from '../context/ThemeContext';
import { PlinkoIcon, SudokuIcon, TicTacToeIcon, SnakeIcon, MemoryIcon, MinesweeperIcon, GamepadIcon, BoltIcon, TrophyIcon, SettingsIcon } from '../assets/svg/GameIcons';
import { useGameCurrency } from '../context/GameCurrencyContext';

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
    color: 'from-cyan-500 to-teal-500',
    difficulty: 'Medium',
    costPerTurn: 1,
  },
  {
    id: 'tictactoe' as GameType,
    title: 'Tic-Tac-Toe',
    icon: TicTacToeIcon,
    description: 'Beat the AI or play with friends',
    color: 'from-emerald-500 to-green-500',
    difficulty: 'Easy',
    costPerTurn: 1,
  },
  {
    id: 'snake' as GameType,
    title: 'Snake',
    icon: SnakeIcon,
    description: 'Classic snake game',
    color: 'from-green-400 to-emerald-500',
    difficulty: 'Medium',
    costPerTurn: 1,
  },
  {
    id: 'memory' as GameType,
    title: 'Memory Match',
    icon: MemoryIcon,
    description: 'Test your memory',
    color: 'from-teal-500 to-cyan-500',
    difficulty: 'Easy',
    costPerTurn: 1,
  },
  {
    id: 'minesweeper' as GameType,
    title: 'Minesweeper',
    icon: MinesweeperIcon,
    description: 'Find gems, avoid mines',
    color: 'from-red-500 to-orange-500',
    difficulty: 'Hard',
    costPerTurn: 1,
  },
];

export default function Home() {
  const { balance, username } = useGameCurrency();
  const { isDarkMode, setIsDarkMode } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col bg-black/70 ">
      <header className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-16">
        {/* Top Bar - Welcome & Balance */}
        <div className="w-full max-w-6xl mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-green-500 to-cyan-500 flex items-center justify-center text-black font-black text-lg sm:text-xl">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Welcome back,</p>
              <h2 className="text-white text-lg sm:text-xl font-bold">{username}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-gray-400 text-xs sm:text-sm">Balance</p>
              <p className={`text-2xl sm:text-3xl font-black font-mono ${
                balance < 10 ? 'text-red-400' : balance < 30 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                ${balance.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 sm:p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <Link
              href="/settings"
              className="p-2 sm:p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors flex items-center justify-center"
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-3 sm:mb-4 animate-float">
            <span className="neon-text">Neon</span>
            <span className="neon-text-cyan">Arcade</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
            Your ultimate mini-games hub
          </p>
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <span className="px-2 sm:px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
              <GamepadIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              6 Games
            </span>
            <span className="px-2 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
              <BoltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              $1 Per Turn
            </span>
            <span className="px-2 sm:px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs sm:text-sm font-bold">
              💰 ${balance.toFixed(2)}
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
                    <span className="px-2 py-1 bg-green-500/10 rounded-md text-xs text-green-400 border border-green-500/20">
                      {game.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-cyan-500/10 rounded-md text-xs text-cyan-400 border border-cyan-500/20">
                      ${game.costPerTurn}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-green-400 transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {game.description}
                </p>
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-green-400 group-hover:text-cyan-400 transition-colors">
                  <span className="text-xs sm:text-sm font-semibold">
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
        <p className="text-gray-600 text-sm flex items-center justify-center gap-1.5">
          <GamepadIcon className="w-4 h-4" />
          NeonArcade — Built with React & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
