"use client";

import { useState } from 'react';
import { ResetIcon } from '../assets/svg/Icons';
import { MinesweeperIcon } from '../assets/svg/GameIcons';
import { useGameCurrency } from '../context/GameCurrencyContext';

type CellState = 'hidden' | 'revealed';
type CellContent = 'gem' | 'mine';

interface Cell {
  state: CellState;
  content: CellContent;
  revealedByPlayer?: boolean;
}

const GRID_SIZE = 5;
const TOTAL_MINES = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const TOTAL_GEMS = TOTAL_CELLS - TOTAL_MINES;

export default function Minesweeper() {
  const { balance, addBalance, deductBalance } = useGameCurrency();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gemsFound, setGemsFound] = useState(0);
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [betAmount, setBetAmount] = useState(1);
  const [currentBet, setCurrentBet] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

  const maxBet = mode === 'basic' ? 8 : 20;
  const rewardPerGem = betAmount / 5;

  const initializeGrid = () => {
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        state: 'hidden' as CellState,
        content: 'gem' as CellContent
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < TOTAL_MINES) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (newGrid[row][col].content !== 'mine') {
        newGrid[row][col].content = 'mine';
        minesPlaced++;
      }
    }

    return newGrid;
  };

  const startGame = () => {
    if (balance < betAmount) return;
    
    const success = deductBalance(betAmount);
    if (!success) return;

    const newGrid = initializeGrid();
    setGrid(newGrid);
    setGameStarted(true);
    setGameOver(false);
    setGemsFound(0);
    setCurrentBet(betAmount);
    setWinnings(0);
    setGameResult(null);
  };

  const revealCell = (row: number, col: number) => {
    if (!gameStarted || gameOver) return;
    if (grid[row][col].state !== 'hidden') return;

    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    const cell = newGrid[row][col];

    if (cell.content === 'mine') {
      cell.state = 'revealed';
      cell.revealedByPlayer = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newGrid[r][c].state = 'revealed';
        }
      }
      setGrid(newGrid);
      setGameOver(true);
      setGameResult('lose');
      setWinnings(0);
      return;
    }

    cell.state = 'revealed';
    cell.revealedByPlayer = true;
    
    const newGemsFound = gemsFound + 1;
    setGemsFound(newGemsFound);
    
    const currentWinnings = newGemsFound * (currentBet / 5);
    setWinnings(currentWinnings);

    setGrid(newGrid);

    if (newGemsFound === TOTAL_GEMS) {
      const finalWinnings = TOTAL_GEMS * (currentBet / 5);
      setWinnings(finalWinnings);
      setGameOver(true);
      setGameResult('win');
      addBalance(finalWinnings);
    }
  };

  const cashOut = () => {
    if (!gameStarted || gameOver) return;
    
    const finalWinnings = gemsFound * (currentBet / 5);
    
    if (finalWinnings > 0) {
      addBalance(finalWinnings);
    }
    
    setWinnings(finalWinnings);
    setGameOver(true);
    setGameResult('win');
    
    const newGrid = grid.map(r => r.map(c => ({ ...c, state: 'revealed' as CellState })));
    setGrid(newGrid);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setGrid([]);
    setGemsFound(0);
    setCurrentBet(0);
    setWinnings(0);
    setGameResult(null);
  };

  const getCellColor = (cell: Cell) => {
    if (cell.state !== 'revealed') {
      if (gameOver && cell.content === 'gem') {
        return 'bg-yellow-500/20 border border-yellow-500/40';
      }
      return 'bg-dark-surface border border-green-500/20 hover:border-green-500/40';
    }
    
    if (cell.content === 'mine') return 'bg-red-500/30 border border-red-500/50';
    
    if (cell.content === 'gem') {
      if (cell.revealedByPlayer) {
        return 'bg-green-500/20 border border-green-500/40';
      }
      return 'bg-yellow-500/20 border border-yellow-500/40';
    }
    
    return 'bg-dark-surface border border-green-500/20';
  };

  const getCellContent = (cell: Cell) => {
    if (cell.state !== 'revealed') return '';
    if (cell.content === 'mine') return '💣';
    return '💎';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-5xl w-full">
        <div className="lg:w-80 w-full space-y-3 sm:space-y-4 order-2 lg:order-1">
          {/* Balance */}
          <div className="p-3 sm:p-4 rounded-xl bg-dark-card/90 backdrop-blur-sm border border-green-500/30 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">Balance</p>
                <p className={`text-2xl sm:text-3xl font-black font-mono ${
                  balance < 10 ? 'text-red-400' : balance < 30 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
              {gameStarted && (
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">Winnings</p>
                  <p className={`text-lg sm:text-xl font-bold font-mono ${
                    winnings > 0 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    ${winnings.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Gems Found</p>
              <p className="text-white font-bold text-base sm:text-lg">{gemsFound}/{TOTAL_GEMS}</p>
            </div>
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Per Gem</p>
              <p className="text-cyan-400 font-bold text-base sm:text-lg">${(gameStarted ? currentBet : betAmount) / 5}</p>
            </div>
          </div>

          {/* Bet Settings (only before game starts) */}
          {!gameStarted && (
            <div className="bg-dark-card/90 rounded-xl p-3 sm:p-4 border border-green-500/20 space-y-4">
              {/* Mode Selector */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">Game Mode:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMode('basic'); setBetAmount(Math.min(betAmount, 8)); }}
                    className={`py-2 rounded-lg font-bold text-sm transition-all ${
                      mode === 'basic'
                        ? 'bg-green-500 text-black'
                        : 'bg-dark-surface text-gray-400 border border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => setMode('advanced')}
                    className={`py-2 rounded-lg font-bold text-sm transition-all ${
                      mode === 'advanced'
                        ? 'bg-cyan-500 text-black'
                        : 'bg-dark-surface text-gray-400 border border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>

              {/* Bet Amount Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs sm:text-sm">Bet Amount:</p>
                  <p className="text-green-400 font-bold text-lg sm:text-xl">${betAmount}</p>
                </div>
                <input
                  type="range"
                  min="1"
                  max={maxBet}
                  step="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-green-500"
                  style={{
                    background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${(betAmount / maxBet) * 100}%, #0d1a0d ${(betAmount / maxBet) * 100}%, #0d1a0d 100%)`
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500 text-[10px]">$1</span>
                  <span className="text-gray-500 text-[10px]">${maxBet}</span>
                </div>
              </div>

              {/* Quick Bet Buttons */}
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs mb-2">Quick Select:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, Math.ceil(maxBet / 4), Math.ceil(maxBet / 2), maxBet].map((val, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBetAmount(val)}
                      className={`py-2 rounded-lg font-bold text-sm transition-all ${
                        betAmount === val
                          ? 'bg-green-500 text-black'
                          : 'bg-dark-surface text-gray-400 border border-green-500/20 hover:border-green-500/40'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                <p className="text-green-400 text-xs sm:text-sm font-semibold mb-1">
                  💎 Each gem = ${(betAmount / 5).toFixed(2)}
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Find all {TOTAL_GEMS} gems to win ${((TOTAL_GEMS * betAmount) / 5).toFixed(2)}!
                </p>
                <p className="text-gray-500 text-[10px] mt-1">
                  Hit a mine = lose your ${betAmount} bet
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            {!gameStarted ? (
              <button
                onClick={startGame}
                disabled={balance < betAmount}
                className={`w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                  balance >= betAmount
                    ? 'bg-linear-to-r from-green-500 to-cyan-500 text-black hover:opacity-90 neon-glow cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                Start Game (-${betAmount})
              </button>
            ) : !gameOver ? (
              <button
                onClick={cashOut}
                className="w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base bg-linear-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 neon-glow cursor-pointer"
              >
                Cash Out (${winnings.toFixed(2)})
              </button>
            ) : null}
            
            <button
              onClick={resetGame}
              className="w-full bg-dark-card/90 border border-green-500/30 text-green-400 font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Game</span>
            </button>
          </div>

          {/* Game Result */}
          {gameResult && (
            <div className={`p-3 rounded-xl border ${
              gameResult === 'win'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <p className={`text-sm font-bold text-center ${
                gameResult === 'win' ? 'text-green-400' : 'text-red-400'
              }`}>
                {gameResult === 'win' 
                  ? `🎉 You won $${winnings.toFixed(2)}!` 
                  : `💥 Hit a mine! Lost $${currentBet.toFixed(2)}`}
              </p>
              {gameResult === 'win' && (
                <p className="text-xs text-gray-400 text-center mt-1">
                  Found {gemsFound} gems × ${(currentBet / 5).toFixed(2)} per gem
                </p>
              )}
            </div>
          )}
        </div>

        {/* Game Grid */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2">
          <div className="bg-dark-card/90 backdrop-blur-sm border border-green-500/20 rounded-2xl p-4 sm:p-6">
            {!gameStarted ? (
              <div className="text-center py-8 sm:py-12">
                <MinesweeperIcon className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">Minesweeper</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-4">
                  Find gems, avoid mines!
                </p>
                <div className="text-gray-500 text-xs sm:text-sm space-y-1">
                  <p>Grid: {GRID_SIZE}×{GRID_SIZE} ({TOTAL_CELLS} cells)</p>
                  <p>Mines: {TOTAL_MINES} | Gems: {TOTAL_GEMS}</p>
                  <p className="text-green-400 mt-2">
                    Each gem = Bet ÷ 5
                  </p>
                  <p className="text-gray-400 text-[10px] mt-1">
                    {mode === 'basic' ? 'Basic: Max bet $8' : 'Advanced: Max bet $20'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => revealCell(rowIndex, colIndex)}
                      disabled={cell.state !== 'hidden' || gameOver}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg font-bold text-lg sm:text-xl transition-all ${getCellColor(cell)} ${
                        cell.state === 'hidden' && !gameOver ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                      }`}
                    >
                      <span className={
                        cell.content === 'mine' ? 'text-red-400' : 'text-green-400'
                      }>
                        {getCellContent(cell)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
