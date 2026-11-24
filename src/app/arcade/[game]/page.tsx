import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import Snake from "@/components/games/Snake";
import Plinko from "@/components/games/Plinko";
import MemoryGame from "@/components/games/MemoryGame";
import Minesweeper from "@/components/games/Minesweeper";
import TicTacToe from "@/components/games/TicTacToe";
import Sudoku from "@/components/sudoku/Sudoku";
import { GAMES, GAME_ORDER, isGameType, type GameType } from "@/lib/games";

/**
 * /arcade/[game] — one route for every cabinet.
 * e.g. /arcade/snake, /arcade/plinko, /arcade/memory …
 */

// ComponentType — some cabinets (Sudoku) legitimately return null while the
// puzzle is generated, so () => ReactElement was too narrow.
const GAME_COMPONENTS: Record<GameType, ComponentType> = {
  plinko: Plinko,
  snake: Snake,
  memory: MemoryGame,
  minesweeper: Minesweeper,
  sudoku: Sudoku,
  tictactoe: TicTacToe,
};

export function generateStaticParams() {
  return GAME_ORDER.map((game) => ({ game }));
}

/** Unknown slugs 404 instead of being rendered on demand. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  if (!isGameType(game)) return { title: "Not found" };
  const meta = GAMES[game];
  return { title: meta.name, description: meta.description };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  if (!isGameType(game)) notFound();

  const Game = GAME_COMPONENTS[game];
  return <Game />;
}
