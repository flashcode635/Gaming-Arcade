"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ResetIcon } from '../assets/svg/Icons';
import { SnakeIcon } from '../assets/svg/GameIcons';
import { useGameCurrency } from '../context/GameCurrencyContext';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const GAME_COST = 1;

export default function Snake() {
  const { balance, addBalance, deductBalance } = useGameCurrency();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    if (balance < GAME_COST) return;
    
    deductBalance(GAME_COST);
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsRunning(false);
  }, [generateFood, balance, deductBalance]);

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
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(50, prev - 3));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, score]);

  useEffect(() => {
    if (isRunning && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isRunning, gameOver, moveSnake, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          if (!gameOver) {
            setIsRunning(prev => !prev);
          }
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  const handleDirectionButton = (newDir: Direction) => {
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
            <p className="text-xl sm:text-2xl font-bold text-green-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">High Score</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">{highScore}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">Length</p>
            <p className="text-xl sm:text-2xl font-bold text-teal-400">{snake.length}</p>
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
                <button
                  onClick={resetGame}
                  disabled={balance < GAME_COST}
                  className="mt-4 bg-green-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {balance >= GAME_COST ? `Play Again (-$${GAME_COST})` : 'Not Enough Credits'}
                </button>
              </div>
            )}

            {!isRunning && !gameOver && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <SnakeIcon className="w-10 h-10 text-green-400 mb-2" />
                <p className="text-green-400 text-xl font-bold mb-2">Snake</p>
                <p className="text-gray-400 text-sm mb-4">Press Space or tap Start</p>
                <button
                  onClick={() => {
                    if (balance >= GAME_COST) {
                      resetGame();
                      setIsRunning(true);
                    }
                  }}
                  disabled={balance < GAME_COST}
                  className="bg-green-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => isRunning ? setIsRunning(false) : setIsRunning(true)}
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
            className="flex-1 bg-linear-to-r from-green-500 to-cyan-500 text-black font-bold py-2.5 sm:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            New Game
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center mt-3">
          Use Arrow Keys / WASD to move • Space to pause
        </p>
      </div>
    </div>
  );
}
