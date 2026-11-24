"use client";

import Link from "next/link";
import {
  GamepadIcon,
  PlinkoIcon,
  SudokuIcon,
  TicTacToeIcon,
  SnakeIcon,
  MemoryIcon,
  MinesweeperIcon,
} from "@/assets/svg/GameIcons";
import BalanceChip from "./BalanceChip";
import ProfileMenu from "./ProfileMenu";

const QUICK_LINKS = [
  { href: "/plinko", label: "Plinko", Icon: PlinkoIcon },
  { href: "/sudoku", label: "Sudoku", Icon: SudokuIcon },
  { href: "/tictactoe", label: "Tic-Tac-Toe", Icon: TicTacToeIcon },
  { href: "/snake", label: "Snake", Icon: SnakeIcon },
  { href: "/memory", label: "Memory", Icon: MemoryIcon },
  { href: "/minesweeper", label: "Mines", Icon: MinesweeperIcon },
];

export const TopBar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-green-500/20">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Neon Arcade home">
          <span className="size-9 rounded-lg bg-linear-to-br from-green-500 to-cyan-500 flex items-center justify-center text-black">
            <GamepadIcon className="w-5 h-5" />
          </span>
          <span className="hidden sm:flex items-baseline gap-1 font-display font-bold text-lg uppercase tracking-widest">
            <span className="text-green-400">Neon</span>
            <span className="text-cyan-400">Arcade</span>
          </span>
        </Link>

        {/* Quick links (desktop) */}
        <ul className="hidden lg:flex items-center gap-1">
          {QUICK_LINKS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-sans text-sm font-medium text-zinc-400 hover:text-white hover:bg-green-500/10 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          <BalanceChip />
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};
