"use client";

import { useState, useCallback } from 'react';
import { ResetIcon } from '../../assets/svg/Icons';
import { useGameCurrency } from '../../context/GameCurrencyContext';

type Cell = 'X' | 'O' | null;
type Board = Cell[];
type GameMode = 'pvp' | 'ai';
const GAME_COST = 1;

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const checkWinner = (board: Board): Cell => {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const minimax = (board: Board, isMaximizing: boolean): number => {
  const winner = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (board.every(cell => cell !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

const getBestMove = (board: Board): number => {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
};

export default function TicTacToe() {
  const { balance, addBalance, deductBalance } = useGameCurrency();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winLine, setWinLine] = useState<number[] | null>(null);

  const winner = checkWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  const findWinLine = useCallback((b: Board): number[] | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, c, d] = combo;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return combo;
      }
    }
    return null;
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner || isDraw) return;
    if (gameMode === 'ai' && !isXTurn) return;

    const newBoard = [...board];
    newBoard[index] = isXTurn ? 'X' : 'O';
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    const newDraw = !newWinner && newBoard.every(cell => cell !== null);

    if (newWinner) {
      setWinLine(findWinLine(newBoard));
      setScores(prev => ({ ...prev, [newWinner]: prev[newWinner as 'X' | 'O'] + 1 }));
    } else if (newDraw) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }

    setIsXTurn(!isXTurn);

    if (gameMode === 'ai' && !newWinner && !newDraw) {
      setTimeout(() => {
        const aiMove = getBestMove([...newBoard]);
        if (aiMove !== -1) {
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 'O';
          setBoard(aiBoard);
          const aiWinner = checkWinner(aiBoard);
          const aiDraw = !aiWinner && aiBoard.every(cell => cell !== null);
          if (aiWinner) {
            setWinLine(findWinLine(aiBoard));
            setScores(prev => ({ ...prev, O: prev.O + 1 }));
          } else if (aiDraw) {
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
          }
          setIsXTurn(true);
        }
      }, 300);
    }
  };

  const resetGame = () => {
    if (balance < GAME_COST) return;
    
    deductBalance(GAME_COST);
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinLine(null);
  };

  const resetAll = () => {
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
  };

  const getStatus = () => {
    if (winner) return `${winner} Wins! 🎉`;
    if (isDraw) return "It's a Draw! 🤝";
    if (gameMode === 'ai') {
      return isXTurn ? "Your Turn (X)" : "AI Thinking...";
    }
    return `${isXTurn ? "X" : "O"}'s Turn`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-dark-card/90 backdrop-blur-sm border border-cyan-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full">
        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={() => { setGameMode('ai'); resetAll(); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              gameMode === 'ai' ? 'bg-cyan-500 text-black' : 'bg-dark-surface text-gray-400 border border-cyan-500/20'
            }`}
          >
            🤖 vs AI
          </button>
          <button
            onClick={() => { setGameMode('pvp'); resetAll(); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              gameMode === 'pvp' ? 'bg-cyan-500 text-black' : 'bg-dark-surface text-gray-400 border border-cyan-500/20'
            }`}
          >
            👥 vs Player
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-green-500/20">
            <p className="text-green-400 font-bold text-sm sm:text-lg">X</p>
            <p className="text-white font-bold text-xl sm:text-2xl">{scores.X}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-gray-500/20">
            <p className="text-gray-400 font-bold text-sm sm:text-lg">Draw</p>
            <p className="text-white font-bold text-xl sm:text-2xl">{scores.draws}</p>
          </div>
          <div className="bg-dark-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-cyan-500/20">
            <p className="text-cyan-400 font-bold text-sm sm:text-lg">O</p>
            <p className="text-white font-bold text-xl sm:text-2xl">{scores.O}</p>
          </div>
        </div>

        <div className="text-center mb-3 sm:mb-4">
          <p className={`text-base sm:text-lg font-bold ${winner ? 'text-green-400' : isDraw ? 'text-cyan-400' : 'text-white'}`}>
            {getStatus()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 max-w-[280px] sm:max-w-[300px] mx-auto">
          {board.map((cell, index) => {
            const isWinCell = winLine?.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`aspect-square rounded-lg sm:rounded-xl text-3xl sm:text-4xl font-black flex items-center justify-center transition-all duration-200
                  ${!cell && !winner && !isDraw ? 'hover:bg-green-500/10 cursor-pointer' : 'cursor-default'}
                  ${isWinCell ? 'bg-green-500/20 border-2 border-green-500/50 scale-105' : 'bg-dark-surface border border-green-500/20'}
                `}
              >
                {cell && (
                  <span className={`${cell === 'X' ? 'text-green-400' : 'text-cyan-400'} ${isWinCell ? 'animate-pulse-neon' : ''}`}>
                    {cell}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={resetGame}
            disabled={balance < GAME_COST}
            className="flex-1 bg-linear-to-r from-green-500 to-cyan-500 text-black font-bold py-2.5 sm:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            {balance >= GAME_COST ? `New Round (-$${GAME_COST})` : 'Not Enough Credits'}
          </button>
          <button
            onClick={resetAll}
            className="bg-dark-surface border border-cyan-500/30 text-cyan-400 font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl hover:bg-cyan-500/10 transition-colors text-sm sm:text-base"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
