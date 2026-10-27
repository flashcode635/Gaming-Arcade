"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlinkoIcon, SudokuIcon, TicTacToeIcon, SnakeIcon, MemoryIcon, MinesweeperIcon } from "@/assets/svg/GameIcons";
import { useGameCurrency } from "@/context/GameCurrencyContext";
import { useTheme } from "@/context/ThemeContext";
import type { GameType } from "@/lib/games";

const NAV_META: Record<GameType, { label: string; Icon: typeof PlinkoIcon }> = {
  plinko: { label: "Plinko", Icon: PlinkoIcon },
  sudoku: { label: "Sudoku", Icon: SudokuIcon },
  tictactoe: { label: "Tic-Tac-Toe", Icon: TicTacToeIcon },
  snake: { label: "Snake", Icon: SnakeIcon },
  memory: { label: "Memory", Icon: MemoryIcon },
  minesweeper: { label: "Mines", Icon: MinesweeperIcon },
};

function GameBalance() {
  const { balance } = useGameCurrency();
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
      <span className="text-green-400 font-bold text-sm">${balance.toFixed(2)}</span>
    </div>
  );
}

export default function GameNav() {
  const pathname = usePathname();
  const { isDarkMode, setIsDarkMode } = useTheme();

  const slug = pathname.replace(/^\//, "").split("/")[0] as GameType;
  const meta = NAV_META[slug];

  if (pathname === "/" || !meta) return null;
  const { label, Icon } = meta;

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-2 text-green-400 hover:text-green-300 transition-colors min-h-[44px] px-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-sm sm:text-base">Back</span>
        </Link>
        <h2 className="text-white font-bold text-sm sm:text-lg neon-text flex items-center gap-1 sm:gap-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          <span className="hidden sm:inline">{label}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <GameBalance />
        </div>
      </div>
    </nav>
  );
}
