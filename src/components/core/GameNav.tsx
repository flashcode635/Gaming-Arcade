"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlinkoIcon, SudokuIcon, TicTacToeIcon, SnakeIcon, MemoryIcon, MinesweeperIcon } from "@/assets/svg/GameIcons";
import BalanceChip from "./BalanceChip";
import ProfileMenu from "./ProfileMenu";
import type { GameType } from "@/lib/games";

const NAV_META: Record<GameType, { label: string; Icon: typeof PlinkoIcon }> = {
  plinko: { label: "Plinko", Icon: PlinkoIcon },
  sudoku: { label: "Sudoku", Icon: SudokuIcon },
  tictactoe: { label: "Tic-Tac-Toe", Icon: TicTacToeIcon },
  snake: { label: "Snake", Icon: SnakeIcon },
  memory: { label: "Memory", Icon: MemoryIcon },
  minesweeper: { label: "Mines", Icon: MinesweeperIcon },
};

export default function GameNav() {
  const pathname = usePathname();

  const slug = pathname.replace(/^\//, "").split("/")[0] as GameType;
  const meta = NAV_META[slug];

  if (pathname === "/" || !meta) return null;
  const { label, Icon } = meta;

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-2 text-green-400 hover:text-green-300 transition-colors min-h-11 px-2"
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
        <div className="flex items-center gap-2 sm:gap-3">
          <BalanceChip />
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
}
