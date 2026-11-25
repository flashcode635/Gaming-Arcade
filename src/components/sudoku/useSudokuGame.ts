// useSudokuGame.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Board,
  CellNotes,
  Difficulty,
  UndoSnapshot,
  MAX_ERRORS,
  DIFFICULTY_TIME_LIMITS,
  generatePuzzle,
} from './sudokuLogic';
import { useGameCurrency } from '@/context/GameCurrencyContext';

/** Registry promise: every new game costs $1, solving pays $5. */
const SUDOKU_COST = 1;
export const SUDOKU_WIN_PAYOUT = 5;

export function useSudokuGame(initialDifficulty: Difficulty = 'medium') {
  const { balance, deductBalance } = useGameCurrency();
  const [hasStarted, setHasStarted] = useState(false);
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [given, setGiven] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [errorCount, setErrorCount] = useState(0);
  const [notes, setNotes] = useState<CellNotes>({});
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState<UndoSnapshot[]>([]);
  const [won, setWon] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [timer, setTimer] = useState(DIFFICULTY_TIME_LIMITS[initialDifficulty]);
  const [isRunning, setIsRunning] = useState(false);

  // Derived instead of stored: three mistakes is always exactly game over —
  // no effect needed to "sync" it.
  const gameOver = errorCount >= MAX_ERRORS;
  const isPlayable = hasStarted && !won && !timeUp && !gameOver && !isPaused;

  /** Every playable Sudoku round requires a successful entry debit. */
  const startNewGame = useCallback((diff: Difficulty) => {
    if (!deductBalance(SUDOKU_COST)) return;
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setBoard(puzzle);
    setSolution(sol);
    setGiven(puzzle.map(row => row.map(cell => cell !== null)));
    setSelectedCell(null);
    setErrors(new Set());
    setErrorCount(0);
    setNotes({});
    setNotesMode(false);
    setHistory([]);
    setWon(false);
    setTimeUp(false);
    setIsPaused(false);
    setDifficulty(diff);
    setTimer(DIFFICULTY_TIME_LIMITS[diff]);
    setIsRunning(true);
    setHasStarted(true);
  }, [deductBalance]);

  // Countdown timer
  useEffect(() => {
    if (!isRunning || isPaused || won || timeUp || gameOver) return;

    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setTimeUp(true);
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, won, timeUp, gameOver]);

  const pushHistory = () => {
    setHistory(prev => [
      ...prev,
      {
        board: board.map(r => [...r]),
        notes: { ...notes },
        errors: new Set(errors),
        errorCount,
      },
    ]);
  };

  const clearNote = (key: string) =>
    setNotes(prev => {
      if (!prev[key]) return prev;
      const rest = { ...prev };
      delete rest[key];
      return rest;
    });

  // FIX: given cells are now selectable (so typing can no longer silently land
  // in the previously selected cell after clicking a given cell).
  // Writing into a given cell is still blocked inside handleNumberInput / erase.
  const handleCellClick = (row: number, col: number) => {
    if (!isPlayable) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!isPlayable || !selectedCell) return;
    const [row, col] = selectedCell;
    if (given[row][col]) return;

    const key = `${row}-${col}`;

    // Notes mode: toggle note
    if (notesMode) {
      pushHistory();
      setNotes(prev => {
        const current = prev[key] ?? [];
        const next = current.includes(num)
          ? current.filter(v => v !== num)
          : [...current, num].sort((a, b) => a - b);

        if (next.length === 0) {
          const rest = { ...prev };
          delete rest[key];
          return rest;
        }
        return { ...prev, [key]: next };
      });
      return;
    }

    if (board[row][col] === num) return;
    pushHistory();

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    clearNote(key);

    if (num !== solution[row][col]) {
      setErrors(prev => new Set(prev).add(key));
      const nextErrorCount = errorCount + 1;
      setErrorCount(nextErrorCount);
      // Three strikes — the round ends right here (event-driven, no effect).
      if (nextErrorCount >= MAX_ERRORS) setIsRunning(false);
    } else {
      setErrors(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      // Win check lives with the move that can complete the grid.
      const solved = newBoard.every((row, ri) =>
        row.every((cell, ci) => cell === solution[ri][ci])
      );
      if (solved) {
        setWon(true);
        setIsRunning(false);
      }
    }
  };

  const eraseSelectedCell = () => {
    if (!isPlayable || !selectedCell) return;
    const [row, col] = selectedCell;
    if (given[row]?.[col]) return;

    const key = `${row}-${col}`;
    if (!board[row][col] && !notes[key]) return;

    pushHistory();

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = null;
    setBoard(newBoard);
    clearNote(key);
    setErrors(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const undo = () => {
    if (!isPlayable || history.length === 0) return;
    const snapshot = history[history.length - 1];
    setBoard(snapshot.board);
    setNotes(snapshot.notes);
    setErrors(snapshot.errors);
    // FIX: restore the mistake counter too, otherwise an undone wrong entry
    // still counts towards the 3-mistake game over.
    setErrorCount(snapshot.errorCount);
    setHistory(prev => prev.slice(0, -1));
  };

  const toggleNotesMode = () => {
    if (isPlayable) setNotesMode(prev => !prev);
  };

  const togglePause = () => {
    if (won || timeUp || gameOver) return;
    setIsPaused(prev => !prev);
  };

  // FIX: clamp at 0 so duplicate user mistakes can't produce negative counts
  const remainingCount = (num: number) =>
    Math.max(0, 9 - board.reduce((count, row) => count + row.filter(cell => cell === num).length, 0));

  const getSelectedDigit = () =>
    selectedCell ? board[selectedCell[0]]?.[selectedCell[1]] ?? null : null;

  // Cells that break a Sudoku rule right now (same digit twice in a row,
  // column or box). Purely visual feedback so the player can SEE why a
  // placement is wrong instead of just getting an unexplained red cell.
  const conflictCells = useMemo(() => {
    const set = new Set<string>();
    if (board.length === 0) return set;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const value = board[r][c];
        if (value == null) continue;
        let conflict = false;
        for (let i = 0; i < 9 && !conflict; i++) {
          if (i !== c && board[r][i] === value) conflict = true;
          if (i !== r && board[i][c] === value) conflict = true;
        }
        const boxRow = Math.floor(r / 3) * 3;
        const boxCol = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3 && !conflict; i++) {
          for (let j = 0; j < 3 && !conflict; j++) {
            const rr = boxRow + i;
            const cc = boxCol + j;
            if ((rr !== r || cc !== c) && board[rr][cc] === value) conflict = true;
          }
        }
        if (conflict) set.add(`${r}-${c}`);
      }
    }
    return set;
  }, [board]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      return;
    }
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      togglePause();
      return;
    }
    if (e.key.toLowerCase() === 'n') {
      toggleNotesMode();
      return;
    }
    if (!isPlayable) return;

    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      handleNumberInput(num);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      eraseSelectedCell();
    } else if (selectedCell) {
      const [r, c] = selectedCell;
      if (e.key === 'ArrowUp') setSelectedCell([Math.max(0, r - 1), c]);
      else if (e.key === 'ArrowDown') setSelectedCell([Math.min(8, r + 1), c]);
      else if (e.key === 'ArrowLeft') setSelectedCell([r, Math.max(0, c - 1)]);
      else if (e.key === 'ArrowRight') setSelectedCell([r, Math.min(8, c + 1)]);
    }
  };

  return {
    // state
    board, given, selectedCell, errors, errorCount, notes, notesMode, history,
    won, timeUp, gameOver, isPaused, difficulty, timer, isPlayable, conflictCells, hasStarted,
    // wallet
    balance,
    canStartNewGame: balance >= SUDOKU_COST,
    // actions
    startNewGame, handleCellClick, handleNumberInput, eraseSelectedCell,
    undo, toggleNotesMode, togglePause, handleKeyDown,
    // helpers
    remainingCount, getSelectedDigit,
  };
}

export type SudokuGame = ReturnType<typeof useSudokuGame>;