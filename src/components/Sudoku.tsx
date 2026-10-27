"use client";

import { useState, useEffect } from 'react';
import { ResetIcon } from '../assets/svg/Icons';

type Board = (number | null)[][];

const generateSolvedBoard = (): number[][] => {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
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

  const solve = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(board);
  return board;
};

const generatePuzzle = (difficulty: number): { puzzle: Board; solution: number[][] } => {
  const solution = generateSolvedBoard();
  const puzzle: Board = solution.map(row => [...row]);

  let cellsToRemove = difficulty;
  const positions: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  positions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }

  return { puzzle, solution };
};

export default function Sudoku() {
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [given, setGiven] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timer, setTimer] = useState(0);
  const [timeLimit, setTimeLimit] = useState(360);
  const [isRunning, setIsRunning] = useState(false);

  const diffMap = { easy: 30, medium: 45, hard: 55 };
  const timeLimits = { easy: 420, medium: 360, hard: 240 };

  const startNewGame = (diff: 'easy' | 'medium' | 'hard') => {
    const { puzzle, solution: sol } = generatePuzzle(diffMap[diff]);
    setBoard(puzzle);
    setSolution(sol);
    setGiven(puzzle.map(row => row.map(cell => cell !== null)));
    setSelectedCell(null);
    setErrors(new Set());
    setWon(false);
    setTimeUp(false);
    setDifficulty(diff);
    setTimeLimit(timeLimits[diff]);
    setTimer(timeLimits[diff]);
    setIsRunning(true);
  };

  useEffect(() => {
    startNewGame('medium');
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !won && !timeUp) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            setTimeUp(true);
            setIsRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, won, timeUp]);

  const handleCellClick = (row: number, col: number) => {
    if (given[row]?.[col] || timeUp) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || won || timeUp) return;
    const [row, col] = selectedCell;
    if (given[row][col]) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    const newErrors = new Set(errors);
    const key = `${row}-${col}`;
    if (num !== null && num !== solution[row][col]) {
      newErrors.add(key);
    } else {
      newErrors.delete(key);
    }
    setErrors(newErrors);

    if (newBoard.every((r, ri) => r.every((cell, ci) => cell === solution[ri][ci]))) {
      setWon(true);
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      handleNumberInput(num);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      if (selectedCell) {
        const [row, col] = selectedCell;
        if (!given[row][col]) {
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = null;
          setBoard(newBoard);
          setErrors(prev => {
            const n = new Set(prev);
            n.delete(`${row}-${col}`);
            return n;
          });
        }
      }
    } else if (e.key === 'ArrowUp' && selectedCell) {
      setSelectedCell([Math.max(0, selectedCell[0] - 1), selectedCell[1]]);
    } else if (e.key === 'ArrowDown' && selectedCell) {
      setSelectedCell([Math.min(8, selectedCell[0] + 1), selectedCell[1]]);
    } else if (e.key === 'ArrowLeft' && selectedCell) {
      setSelectedCell([selectedCell[0], Math.max(0, selectedCell[1] - 1)]);
    } else if (e.key === 'ArrowRight' && selectedCell) {
      setSelectedCell([selectedCell[0], Math.min(8, selectedCell[1] + 1)]);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (board.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="bg-dark-card/90 backdrop-blur-sm border border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">Time Left</p>
            <p className={`text-lg sm:text-xl font-mono font-bold ${
              timer <= 60 ? 'text-red-400 animate-pulse' : timer <= 120 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {formatTime(timer)}
            </p>
          </div>
          <div className="flex gap-1 sm:gap-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => startNewGame(d)}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  difficulty === d
                    ? 'bg-green-500 text-black'
                    : 'bg-dark-surface text-gray-400 hover:text-green-400 border border-green-500/20'
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">Errors</p>
            <p className="text-lg sm:text-xl font-bold text-red-400">{errors.size}</p>
          </div>
        </div>

        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="grid grid-cols-9 border-2 border-green-500/40 rounded-lg overflow-hidden">
            {board.map((row, ri) =>
              row.map((cell, ci) => {
                const isSelected = selectedCell?.[0] === ri && selectedCell?.[1] === ci;
                const isGiven = given[ri]?.[ci];
                const isError = errors.has(`${ri}-${ci}`);
                const isBorderRight = (ci + 1) % 3 === 0 && ci < 8;
                const isBorderBottom = (ri + 1) % 3 === 0 && ri < 8;
                
                const boxRow = Math.floor(ri / 3);
                const boxCol = Math.floor(ci / 3);
                const boxIndex = boxRow * 3 + boxCol;
                const boxClass = boxIndex % 2 === 0 ? 'sudoku-box-light' : 'sudoku-box-dark';

                return (
                  <div
                    key={`${ri}-${ci}`}
                    onClick={() => handleCellClick(ri, ci)}
                    className={`sudoku-cell ${boxClass}
                      ${isSelected ? 'selected' : ''}
                      ${isGiven ? 'given' : 'user-input'}
                      ${isError ? 'error' : ''}
                      ${isBorderRight ? 'sudoku-border-right' : ''}
                      ${isBorderBottom ? 'sudoku-border-bottom' : ''}
                    `}
                  >
                    {cell || ''}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-9 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="bg-dark-surface border border-green-500/20 text-green-400 font-bold py-2 sm:py-3 rounded-lg hover:bg-green-500/10 transition-colors text-sm sm:text-lg"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (selectedCell && !given[selectedCell[0]][selectedCell[1]]) {
                const newBoard = board.map(r => [...r]);
                newBoard[selectedCell[0]][selectedCell[1]] = null;
                setBoard(newBoard);
                setErrors(prev => {
                  const n = new Set(prev);
                  n.delete(`${selectedCell[0]}-${selectedCell[1]}`);
                  return n;
                });
              }
            }}
            className="flex-1 bg-dark-surface border border-green-500/30 text-green-400 font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-green-500/10 transition-colors text-sm sm:text-base"
          >
            🗑️ Erase
          </button>
          <button
            onClick={() => startNewGame(difficulty)}
            className="flex-1 bg-linear-to-r from-green-500 to-cyan-500 text-black font-bold py-2.5 sm:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            New Game
          </button>
        </div>

        {timeUp && (
          <div className="mt-4 text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-xl font-bold">⏰ Time's Up!</p>
            <p className="text-red-300 text-sm">Try again with a new game</p>
          </div>
        )}

        {won && (
          <div className="mt-4 text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-xl font-bold">🎉 Congratulations!</p>
            <p className="text-green-300 text-sm">Solved with {formatTime(timer)} remaining</p>
          </div>
        )}
      </div>
    </div>
  );
}
