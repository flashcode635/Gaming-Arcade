"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ResetIcon } from '../../assets/svg/Icons';
import { SnakeIcon } from '../../assets/svg/GameIcons';
import { useGameCurrency } from '../../context/GameCurrencyContext';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const GAME_COST = 1;
/** Registry payout promise: "$0.5 / apple" — credited live as apples are eaten. */
const APPLE_PAYOUT = 0.5;

export default function Snake() {
  const { balance, deductBalance, addBalance } = useGameCurrency();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isRunning, setIsRunning] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const creditedApplesRef = useRef(0);

  // $0.5 per apple, credited live. Derived from score (+10 per apple) in an
  // effect instead of the moveSnake updater so StrictMode can never
  // double-credit a payout inside a render-phase updater.
  useEffect(() => {
    const apples = Math.floor(score / 10);
    const uncredited = apples - creditedApplesRef.current;
    if (uncredited > 0) {
      creditedApplesRef.current = apples;
      addBalance(uncredited * APPLE_PAYOUT);
    }
  }, [score, addBalance]);

  /**
   * Picks a random FREE cell for the next apple. Returns null when the snake
   * covers the whole board (victory) — never loops forever.
   */
  const generateFood = useCallback((snakeBody: Position[]): Position | null => {
    const totalCells = GRID_SIZE * GRID_SIZE;
    if (snakeBody.length >= totalCells) return null;

    const occupied = new Set(snakeBody.map(seg => seg.y * GRID_SIZE + seg.x));
    const freeCells: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      if (!occupied.has(i)) freeCells.push(i);
    }
    if (freeCells.length === 0) return null;

    const pick = freeCells[Math.floor(Math.random() * freeCells.length)] as number;
    return { x: pick % GRID_SIZE, y: Math.floor(pick / GRID_SIZE) };
  }, []);

  const resetGame = useCallback(() => {
    if (!deductBalance(GAME_COST)) return false;
    creditedApplesRef.current = 0;
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake) ?? { x: 15, y: 15 });
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsRunning(true);
    setIsGameActive(true);
    return true;
  }, [generateFood, deductBalance]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const dir = directionRef.current;

      switch (dir) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsRunning(false);
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }

      if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameOver(true);
        setIsRunning(false);
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setSpeed(prev => Math.max(50, prev - 3));

        // The next apple spawns immediately — as long as a free cell exists.
        const nextFood = generateFood(newSnake);
        if (nextFood === null) {
          // Board fully covered: victory, no more apples to place.
          setGameWon(true);
          setIsRunning(false);
          setHighScore(prev => Math.max(prev, score + 10));
          setFood(prevFood => prevFood);
        } else {
          setFood(nextFood);
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, score]);

  useEffect(() => {
    if (isRunning && !gameOver && !gameWon) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isRunning, gameOver, gameWon, moveSnake, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameActive) return;
      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir !== 'DOWN') { directionRef.current = 'UP'; setDirection('UP'); }
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir !== 'UP') { directionRef.current = 'DOWN'; setDirection('DOWN'); }
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir !== 'RIGHT') { directionRef.current = 'LEFT'; setDirection('LEFT'); }
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir !== 'LEFT') { directionRef.current = 'RIGHT'; setDirection('RIGHT'); }
          e.preventDefault();
          break;
        case ' ':
          if (!gameOver && !gameWon) {
            setIsRunning(prev => !prev);
          }
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameWon, isGameActive]);

  const handleDirectionButton = (newDir: Direction) => {
    if (!isGameActive) return;
    const dir = directionRef.current;
    if (
      (newDir === 'UP' && dir !== 'DOWN') ||
      (newDir === 'DOWN' && dir !== 'UP') ||
      (newDir === 'LEFT' && dir !== 'RIGHT') ||
      (newDir === 'RIGHT' && dir !== 'LEFT')
    ) {
      directionRef.current = newDir;
      setDirection(newDir);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-dark-card/90 backdrop-blur-sm border border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">Score</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400 tabular-nums">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">High Score</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400 tabular-nums">{highScore}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">Length</p>
            <p className="text-xl sm:text-2xl font-bold text-teal-400 tabular-nums">{snake.length}</p>
          </div>
        </div>

        <div className="flex justify-center mb-3 sm:mb-4">
          <div
            className="relative border-2 border-green-500/30 rounded-lg overflow-hidden max-w-full"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, background: '#000000' }}
          >
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <div key={`vl-${i}`}>
                <div
                  className="absolute top-0 bottom-0 border-l border-green-500/5"
                  style={{ left: i * CELL_SIZE }}
                />
                <div
                  className="absolute left-0 right-0 border-t border-cyan-500/5"
                  style={{ top: i * CELL_SIZE }}
                />
              </div>
            ))}

            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm ${index === 0 ? 'bg-green-400 shadow-lg shadow-green-500/50' : 'bg-green-500'}`}
                style={{
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  opacity: 1 - (index / snake.length) * 0.4,
                }}
              />
            ))}

            <div
              className="absolute rounded-full bg-cyan-400 animate-pulse-neon"
              style={{
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.6)',
              }}
            />

            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <p className="text-green-400 text-2xl font-bold mb-2">Game Over!</p>
                <p className="text-white text-lg">Score: {score}</p>
                <p className="text-cyan-300 text-sm mt-1 tabular-nums">Earned ${((Math.floor(score / 10)) * APPLE_PAYOUT).toFixed(2)}</p>
                <button
                  onClick={resetGame}
                  disabled={balance < GAME_COST}
                  className="mt-4 bg-green-500 text-black font-bold py-2.5 px-6 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                >
                  {balance >= GAME_COST ? `Play Again (-$${GAME_COST})` : 'Not Enough Credits'}
                </button>
              </div>
            )}

            {gameWon && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
                <p className="text-cyan-400 text-2xl font-bold mb-1">You Win!</p>
                <p className="text-green-400 text-sm mb-2">You covered the whole board!</p>
                <p className="text-white text-lg">Score: {score}</p>
                <p className="text-cyan-300 text-sm mt-1 tabular-nums">Earned ${((Math.floor(score / 10)) * APPLE_PAYOUT).toFixed(2)}</p>
                <button
                  onClick={resetGame}
                  disabled={balance < GAME_COST}
                  className="mt-4 bg-cyan-500 text-black font-bold py-2.5 px-6 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                >
                  {balance >= GAME_COST ? `Play Again (-$${GAME_COST})` : 'Not Enough Credits'}
                </button>
              </div>
            )}

            {!isRunning && !gameOver && !gameWon && (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                <SnakeIcon className="w-10 h-10 text-green-400 mb-2" />
                <p className="text-green-400 text-xl font-bold mb-2">Snake</p>
                <p className="text-gray-400 text-sm mb-4">Press Space or tap Start</p>
                <button
                  onClick={() => {
                    if (resetGame()) setIsRunning(true);
                  }}
                  disabled={balance < GAME_COST}
                  className="bg-green-500 text-black font-bold py-2.5 px-6 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                >
                  {balance >= GAME_COST ? `Start Game (-$${GAME_COST})` : 'Not Enough Credits'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-45 mx-auto mb-4">
          <div></div>
          <button
            onClick={() => handleDirectionButton('UP')}
            className="bg-dark-surface border border-green-500/30 text-green-400 font-bold py-3 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            ▲
          </button>
          <div></div>
          <button
            onClick={() => handleDirectionButton('LEFT')}
            className="bg-dark-surface border border-green-500/30 text-green-400 font-bold py-3 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            ◀
          </button>
          <button
            onClick={() => { if (isGameActive && !gameOver && !gameWon) setIsRunning(prev => !prev); }}
            className="bg-dark-surface border border-cyan-500/30 text-cyan-400 font-bold py-3 rounded-lg hover:bg-cyan-500/10 transition-colors text-sm"
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => handleDirectionButton('RIGHT')}
            className="bg-dark-surface border border-green-500/30 text-green-400 font-bold py-3 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            ▶
          </button>
          <div></div>
          <button
            onClick={() => handleDirectionButton('DOWN')}
            className="bg-dark-surface border border-green-500/30 text-green-400 font-bold py-3 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            ▼
          </button>
          <div></div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={resetGame}
            disabled={balance < GAME_COST}
            className="flex-1 bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold py-2.5 sm:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            New Game
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center mt-3">
          Use Arrow Keys / WASD to move • Space to pause • Every apple pays $0.50
        </p>
      </div>
    </div>
  );
}
