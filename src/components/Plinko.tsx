"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { TargetIcon, ResetIcon, NoCreditsIcon, WarningIcon, LightningIcon } from '../assets/svg/Icons';
import { useGameCurrency } from '../context/GameCurrencyContext';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

const ROWS = 12;
const DISPLAY_ROWS = ROWS - 2;
const PEG_RADIUS = 5;
const BALL_RADIUS = 8;
const GRAVITY = 0.3;
const BOUNCE = 0.7;
const FRICTION = 0.99;
const DROP_COST = 1;

const MULTIPLIERS = [5, 1.5, 1.25, 0.5, 0.25, 0.5, 1.25, 1.5, 5];
const SLOT_WEIGHTS = [1, 1.2, 1.2, 1.3, 1.8, 1.3, 1.2, 1.2, 1];
const TOTAL_WEIGHT = SLOT_WEIGHTS.reduce((a, b) => a + b, 0);

export default function Plinko() {
  const { balance, addBalance, deductBalance } = useGameCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [totalDrops, setTotalDrops] = useState(0);
  const [showLowCredits, setShowLowCredits] = useState(false);
  const animFrameRef = useRef<number>(0);
  const ballsRef = useRef<Ball[]>([]);
  const creditsRef = useRef(balance);

  useEffect(() => {
    creditsRef.current = balance;
  }, [balance]);

  const [canvasSize, setCanvasSize] = useState({ width: 520, height: 520 });
  
  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(520, window.innerWidth - 40);
      const height = Math.min(520, window.innerHeight - 200);
      setCanvasSize({ width: Math.max(320, width), height: Math.max(400, height) });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const horizontalPadding = Math.max(40, canvasWidth * 0.1);
  const pyramidWidth = canvasWidth - 2 * horizontalPadding;
  const maxPegsInRow = 11;
  const pegSpacingX = pyramidWidth / (maxPegsInRow - 1);
  const pegSpacingY = (canvasHeight - 130) / DISPLAY_ROWS;

  const slotGap = 6;
  const totalGaps = slotGap * (MULTIPLIERS.length - 1);
  const slotStackWidth = pyramidWidth + 40;
  const slotStackStartX = (canvasWidth - slotStackWidth) / 2;

  const getSlotPositions = useCallback(() => {
    const availableWidth = slotStackWidth - totalGaps;
    const unitWidth = availableWidth / TOTAL_WEIGHT;
    const positions: { x: number; width: number; centerX: number }[] = [];
    let currentX = slotStackStartX;
    for (let i = 0; i < MULTIPLIERS.length; i++) {
      const w = unitWidth * SLOT_WEIGHTS[i];
      positions.push({
        x: currentX,
        width: w,
        centerX: currentX + w / 2,
      });
      currentX += w + slotGap;
    }
    return positions;
  }, []);

  const getPegs = useCallback(() => {
    const pegs: { x: number; y: number }[] = [];
    for (let row = 0; row < DISPLAY_ROWS; row++) {
      const pegsInRow = row + 2;
      const rowWidth = (pegsInRow - 1) * pegSpacingX;
      const startX = horizontalPadding + (pyramidWidth - rowWidth) / 2;
      for (let col = 0; col < pegsInRow; col++) {
        pegs.push({
          x: startX + col * pegSpacingX,
          y: 50 + row * pegSpacingY,
        });
      }
    }
    return pegs;
  }, [pegSpacingX, pegSpacingY, pyramidWidth]);

  const dropBall = useCallback(() => {
    if (creditsRef.current < DROP_COST) return;

    deductBalance(DROP_COST);
    setTotalDrops(prev => prev + 1);

    const colors = [
      '#ff3b3b', '#ff6b00', '#ffd000', '#ff2d95', '#b14bff',
      '#ff5e7d', '#ff9500', '#e0ff00', '#ff00aa', '#ff4444',
    ];

    const u1 = Math.random();
    const u2 = Math.random();
    const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    const newBall: Ball = {
      id: Date.now() + Math.random(),
      x: canvasWidth / 2 + normalRandom * 3,
      y: 25,
      vx: normalRandom * 0.3,
      vy: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    ballsRef.current = [...ballsRef.current, newBall];
    setBalls([...ballsRef.current]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pegs = getPegs();

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      pegs.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      const slotPositions = getSlotPositions();
      MULTIPLIERS.forEach((mult, i) => {
        const slot = slotPositions[i];
        const y = canvasHeight - 40;
        let hue, saturation, lightness;
        if (mult >= 5) {
          hue = 45; saturation = 100; lightness = 55;
        } else if (mult >= 1.5) {
          hue = 140; saturation = 80; lightness = 50;
        } else if (mult >= 1) {
          hue = 160; saturation = 70; lightness = 50;
        } else if (mult >= 0.5) {
          hue = 30; saturation = 80; lightness = 50;
        } else {
          hue = 0; saturation = 80; lightness = 50;
        }
        const gap = 3;
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`;
        ctx.fillRect(slot.x + gap, y, slot.width - gap * 2, 35);
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
        ctx.strokeRect(slot.x + gap, y, slot.width - gap * 2, 35);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${mult}x`, slot.centerX, y + 22);
      });

      ballsRef.current = ballsRef.current.filter((ball) => {
        ball.vy += GRAVITY;
        ball.vx *= FRICTION;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x < BALL_RADIUS) {
          ball.x = BALL_RADIUS;
          ball.vx = -ball.vx * BOUNCE;
        }
        if (ball.x > canvasWidth - BALL_RADIUS) {
          ball.x = canvasWidth - BALL_RADIUS;
          ball.vx = -ball.vx * BOUNCE;
        }

        pegs.forEach((peg) => {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BALL_RADIUS + PEG_RADIUS) {
            const angle = Math.atan2(dy, dx);
            ball.x = peg.x + (BALL_RADIUS + PEG_RADIUS) * Math.cos(angle);
            ball.y = peg.y + (BALL_RADIUS + PEG_RADIUS) * Math.sin(angle);
            ball.vx = Math.cos(angle) * 1.5 + (Math.random() - 0.5) * 0.4;
            ball.vy = Math.abs(ball.vy) * BOUNCE * 0.6;
          }
        });

        if (ball.y > canvasHeight - 45) {
          const slotPositions = getSlotPositions();
          let slotIndex = 0;
          for (let i = 0; i < slotPositions.length; i++) {
            if (ball.x >= slotPositions[i].x && ball.x < slotPositions[i].x + slotPositions[i].width) {
              slotIndex = i;
              break;
            }
            if (i === slotPositions.length - 1) slotIndex = i;
          }
          const mult = MULTIPLIERS[slotIndex];

          addBalance(mult);
          setLastWin(mult);
          return false;
        }

        const gradient = ctx.createRadialGradient(
          ball.x - 3, ball.y - 3, 1,
          ball.x, ball.y, BALL_RADIUS
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, ball.color);
        gradient.addColorStop(1, ball.color);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, BALL_RADIUS * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        return true;
      });

      setBalls([...ballsRef.current]);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [getPegs, getSlotPositions, pyramidWidth]);

  useEffect(() => {
    if (balance > 0 && balance < 10) {
      setShowLowCredits(true);
      const timer = setTimeout(() => setShowLowCredits(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  const resetGame = () => {
    setLastWin(null);
    setTotalDrops(0);
    ballsRef.current = [];
    setBalls([]);
  };

  const canDrop = balance >= DROP_COST;
  const profit = balance - 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-5xl w-full">
        <div className="lg:w-80 w-full space-y-3 sm:space-y-4 order-2 lg:order-1">
          <div className="p-3 sm:p-4 rounded-xl bg-dark-card/90 backdrop-blur-sm border border-green-500/30 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">Balance</p>
                <p className={`text-2xl sm:text-3xl font-black font-mono ${
                  balance < 10 ? 'text-red-400' : balance < 30 ? 'text-yellow-400' : 'text-green-400'
                } ${showLowCredits ? 'animate-pulse-neon' : ''}`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">Profit</p>
                <p className={`text-lg sm:text-xl font-bold font-mono ${
                  profit > 0 ? 'text-green-400' : profit < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {profit > 0 ? '+' : ''}{profit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Drops</p>
              <p className="text-white font-bold text-base sm:text-lg">{totalDrops}</p>
            </div>
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Cost</p>
              <p className="text-cyan-400 font-bold text-base sm:text-lg">{DROP_COST}</p>
            </div>
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Last Win</p>
              <p className={`font-bold text-base sm:text-lg ${
                lastWin !== null
                  ? lastWin >= 5 ? 'text-yellow-400' : lastWin >= 1.5 ? 'text-green-400' : lastWin >= 1 ? 'text-teal-400' : lastWin >= 0.5 ? 'text-orange-400' : 'text-red-400'
                  : 'text-gray-600'
              }`}>
                {lastWin !== null ? `+${lastWin}` : '—'}
              </p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={dropBall}
              disabled={!canDrop}
              className={`w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                canDrop
                  ? 'bg-linear-to-r from-green-500 to-cyan-500 text-black hover:opacity-90 neon-glow cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              {canDrop ? (
                <>
                  <TargetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Drop Ball (-{DROP_COST})</span>
                </>
              ) : (
                <>
                  <NoCreditsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>No Credits</span>
                </>
              )}
            </button>
            <button
              onClick={resetGame}
              className="w-full bg-dark-card/90 border border-green-500/30 text-green-400 font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Reset Game</span>
            </button>
          </div>

          {!canDrop && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center gap-2">
              <WarningIcon className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm font-semibold">Out of credits! Reset to play again.</p>
            </div>
          )}

          {canDrop && balance < 10 && (
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center gap-2">
              <LightningIcon className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Low credits — play carefully!</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center order-1 lg:order-2">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="rounded-xl border border-green-500/20 bg-black max-w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}
