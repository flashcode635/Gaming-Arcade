export type GameType =
  | "plinko"
  | "sudoku"
  | "tictactoe"
  | "snake"
  | "memory"
  | "minesweeper";

export interface GameMeta {
  /** URL slug under /arcade/<slug> */
  id: GameType;
  name: string;
  tagline: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Cost per turn / per drop in $. */
  costPerTurn: number;
  /** Accent color (hex) used across cards, badges and glows. */
  accent: string;
  /** Payout hint shown on the landing page. */
  payout: string;
}

/**
 * Solid borderless pills for difficulty badges — colour-coded per level
 * (Easy = emerald, Medium = amber, Hard = red), rendered rounded-full.
 */
export const DIFFICULTY_STYLES: Record<GameMeta["difficulty"], string> = {
  Hard: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  Medium: "bg-white/[0.04] text-zinc-300 border border-white/[0.08]",
  Easy: "bg-emerald-500/[0.06] text-emerald-400 border border-emerald-500/15",
};

/**
 * Single source of truth for the six arcade games.
 * The landing page, arcade hub, /arcade/[game] router and GameNav all read
 * from this registry so slugs, names and accent colors stay in sync.
 */
export const GAMES: Record<GameType, GameMeta> = {
  plinko: {
    id: "plinko",
    name: "Plinko",
    tagline: "Drop. Bounce. Multiply.",
    description: "Drop the ball through neon pegs and chase the 10x jackpot slot.",
    difficulty: "Hard",
    costPerTurn: 1,
    accent: "#00ff88",
    payout: "Up to 10x",
  },
  sudoku: {
    id: "sudoku",
    name: "Sudoku",
    tagline: "The classic 9x9 puzzle",
    description: "Fill the grid with logic — no math, no guessing, pure focus.",
    difficulty: "Medium",
    costPerTurn: 1,
    accent: "#39d98a",
    payout: "Solve = +$5",
  },
  tictactoe: {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    tagline: "Beat the bot, take the pot",
    description: "Three in a row against a sharp AI opponent. Draw = refund.",
    difficulty: "Easy",
    costPerTurn: 1,
    accent: "#00ff88",
    payout: "2x per win",
  },
  snake: {
    id: "snake",
    name: "Snake",
    tagline: "Eat, grow, survive",
    description: "Apples keep coming until you crash — or cover the whole board.",
    difficulty: "Medium",
    costPerTurn: 1,
    accent: "#82f5b0",
    payout: "$0.5 / apple",
  },
  memory: {
    id: "memory",
    name: "Memory Match",
    tagline: "Flip. Remember. Win.",
    description: "Match every neon pair in as few moves as you can.",
    difficulty: "Easy",
    costPerTurn: 1,
    accent: "#48d9a0",
    payout: "Win +$2 · Perfect +$5",
  },
  minesweeper: {
    id: "minesweeper",
    name: "Minesweeper",
    tagline: "Gems or boom?",
    description: "Uncover gems, dodge the mines, cash out any time.",
    difficulty: "Hard",
    costPerTurn: 1,
    accent: "#1fca79",
    payout: "Cash out anytime",
  },
};

export const GAME_ORDER: GameType[] = [
  "plinko",
  "snake",
  "memory",
  "minesweeper",
  "sudoku",
  "tictactoe",
];

export function isGameType(value: string): value is GameType {
  return Object.prototype.hasOwnProperty.call(GAMES, value);
}
