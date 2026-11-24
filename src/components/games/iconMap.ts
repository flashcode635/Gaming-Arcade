import type { ComponentType } from 'react';
import {
  MemoryIcon,
  MinesweeperIcon,
  PlinkoIcon,
  SnakeIcon,
  SudokuIcon,
  TicTacToeIcon,
} from '@/assets/svg/GameIcons';
import type { GameType } from '@/lib/games';

/** Icon component for each game slug — shared by landing, hub, nav and auth. */
export const GAME_ICONS: Record<GameType, ComponentType<{ className?: string }>> = {
  plinko: PlinkoIcon,
  snake: SnakeIcon,
  memory: MemoryIcon,
  minesweeper: MinesweeperIcon,
  sudoku: SudokuIcon,
  tictactoe: TicTacToeIcon,
};
