// sudoku.ts
export type Board = (number | null)[][];
export type CellNotes = Record<string, number[]>;
export type Difficulty = 'easy' | 'medium' | 'hard';

export type UndoSnapshot = {
  board: Board;
  notes: CellNotes;
  errors: Set<string>;
  errorCount: number;
};

export const DIFFICULTY_CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 30,
  medium: 45,
  hard: 55,
};

export const DIFFICULTY_TIME_LIMITS: Record<Difficulty, number> = {
  easy: 420,
  medium: 360,
  hard: 240,
};

export const MAX_ERRORS = 3;

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/** Unbiased Fisher-Yates shuffle (replaces the biased sort(() => Math.random() - 0.5)). */
const shuffleInPlace = <T>(items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

/**
 * Counts the solutions of a puzzle (stops once `limit` are found).
 * 0 = broken, 1 = unique (proper Sudoku), 2+ = ambiguous.
 * Uses MRV (minimum remaining values) backtracking for speed.
 */
export const countSolutions = (puzzle: Board, limit = 2): number => {
  const grid: number[][] = puzzle.map(row => row.map(cell => cell ?? 0));
  let count = 0;

  const isValid = (row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  const solve = (): void => {
    if (count >= limit) return;

    // MRV: pick the empty cell with the fewest candidates
    let bestRow = -1;
    let bestCol = -1;
    let bestCandidates: number[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) continue;
        const candidates: number[] = [];
        for (let num = 1; num <= 9; num++) {
          if (isValid(row, col, num)) candidates.push(num);
        }
        if (candidates.length === 0) return; // dead end -> this branch has no solution
        if (bestRow === -1 || candidates.length < bestCandidates.length) {
          bestRow = row;
          bestCol = col;
          bestCandidates = candidates;
        }
      }
    }

    if (bestRow === -1) {
      count += 1; // no empty cell left -> found a full solution
      return;
    }

    for (const num of bestCandidates) {
      grid[bestRow][bestCol] = num;
      solve();
      grid[bestRow][bestCol] = 0;
      if (count >= limit) return;
    }
  };

  solve();
  return count;
};

const generateSolvedBoard = (): number[][] => {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  const isValid = (row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
      if (board[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  const solve = (): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) continue;

        const candidates = shuffleInPlace([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of candidates) {
          if (isValid(row, col, num)) {
            board[row][col] = num;
            if (solve()) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
    return true;
  };

  solve();
  return board;
};

/**
 * Generates a puzzle with a GUARANTEED UNIQUE solution.
 *
 * FIX for the "random red error" bug: the old implementation punched out cells
 * blindly, so ~84% of medium and 100% of hard puzzles ended up with multiple
 * valid solutions. The app then compares every input against ONE stored
 * solution and flags a legal move as a mistake whenever the player follows a
 * different (equally valid) solution path.
 *
 * Strategy: dig holes one by one in random order and keep a removal ONLY if
 * the puzzle still has exactly one solution. If a hole breaks uniqueness it
 * is restored. Several rounds are attempted (each on a fresh solved board)
 * until the difficulty target is reached or the time budget runs out, always
 * returning the best (most-removed) unique puzzle found.
 */
export const generatePuzzle = (
  difficulty: Difficulty
): { puzzle: Board; solution: number[][] } => {
  const target = DIFFICULTY_CELLS_TO_REMOVE[difficulty];
  const MAX_ROUNDS = difficulty === 'hard' ? 12 : 6;
  const deadline = Date.now() + 1500; // keep generation snappy

  let bestPuzzle: Board | null = null;
  let bestSolution: number[][] = [];
  let bestRemoved = -1;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    if (bestRemoved >= target || Date.now() > deadline) break;

    const solution = generateSolvedBoard();
    const puzzle: Board = solution.map(row => [...row]);

    const positions: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) positions.push([i, j]);
    }
    shuffleInPlace(positions);

    let removed = 0;
    for (const [row, col] of positions) {
      if (removed >= target) break;

      const backup = puzzle[row][col];
      puzzle[row][col] = null;

      if (countSolutions(puzzle, 2) === 1) {
        removed += 1; // still unique -> keep the hole
      } else {
        puzzle[row][col] = backup; // would create a second solution -> restore
      }
    }

    if (removed > bestRemoved) {
      bestRemoved = removed;
      bestPuzzle = puzzle;
      bestSolution = solution;
    }
  }

  return { puzzle: bestPuzzle as Board, solution: bestSolution };
};
