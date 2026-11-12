'use client';

import { useEffect, useRef, useState } from 'react';
import { TargetIcon, ResetIcon, NoCreditsIcon, WarningIcon, LightningIcon } from '@/assets/svg/Icons';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { usePlinkoGame } from '@/hooks/usePlinkoPhysics';
import {
  BALL_RADIUS,
  DROP_BET,
  MULTIPLIERS,
  PEG_RADIUS,
  STARTING_BALANCE,
  allPegs,
  buildGeometry,
  sampleBallPath,
  slotCenterX,
  type BoardGeometry,
} from '@/engine/plinkoEngine';
import type { ActiveBall, LandEvent } from '@/hooks/usePlinkoPhysics';

/** Slot palette by payout tier (hue / saturation / lightness). */
function slotHsl(multiplier: number): { hue: number; sat: number; light: number } {
  if (multiplier >= 5) return { hue: 45, sat: 100, light: 55 };
  if (multiplier >= 1.5) return { hue: 140, sat: 80, light: 50 };
  if (multiplier >= 1) return { hue: 160, sat: 70, light: 50 };
  if (multiplier >= 0.5) return { hue: 30, sat: 80, light: 50 };
  return { hue: 0, sat: 80, light: 50 };
}

const FLASH_MS = 700;

interface FrameRefs {
  ballsRef: React.MutableRefObject<ActiveBall[]>;
  landEventsRef: React.MutableRefObject<LandEvent[]>;
}

/**
 * The renderer is a pure function of (server path, startTime, now).
 * No physics, no randomness on the client — the ball simply replays the
 * direction array the server sealed for the round.
 */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  g: BoardGeometry,
  { ballsRef, landEventsRef }: FrameRefs,
  now: number,
) {
  ctx.clearRect(0, 0, g.width, g.height);

  // --- pegs -----------------------------------------------------------------
  const pegs = allPegs(g);
  ctx.fillStyle = '#00e5ff';
  ctx.shadowColor = '#00e5ff';
  for (const peg of pegs) {
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
    ctx.shadowBlur = 5;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // --- slots ----------------------------------------------------------------
  const slotW = g.slotWidth;
  MULTIPLIERS.forEach((mult, i) => {
    const { hue, sat, light } = slotHsl(mult);
    const x = slotCenterX(i, g) - slotW / 2;
    const y = g.slotTopY;
    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.2)`;
    ctx.fillRect(x, y, slotW, g.slotHeight);
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.6)`;
    ctx.strokeRect(x, y, slotW, g.slotHeight);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mult}x`, slotCenterX(i, g), y + 22);
  });

  // --- landing flashes --------------------------------------------------------
  const events = landEventsRef.current;
  if (events.length > 0) {
    landEventsRef.current = events.filter((e) => now - e.at < FLASH_MS);
    for (const event of landEventsRef.current) {
      const { hue } = slotHsl(event.multiplier);
      const age = (now - event.at) / FLASH_MS;
      const alpha = 1 - age;
      const x = slotCenterX(event.slotIndex, g) - slotW / 2;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.35})`;
      ctx.fillRect(x, g.slotTopY, slotW, g.slotHeight);
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, g.slotTopY, slotW, g.slotHeight);
      ctx.lineWidth = 1;
    }
  }

  // --- balls ------------------------------------------------------------------
  for (const ball of ballsRef.current) {
    const elapsed = now - ball.startTime;
    const pos = sampleBallPath(ball.anim, elapsed);

    // tiny cosmetic wobble so simultaneous balls never look identical
    let phase = 0;
    for (let i = 0; i < ball.id.length; i++) phase = (phase + ball.id.charCodeAt(i) * (i + 1)) % 628;
    const wobble = pos.done ? 0 : Math.sin(elapsed / 70 + phase) * 1.3;
    const x = pos.x + wobble;
    const y = pos.y;

    const gradient = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, BALL_RADIUS);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, ball.color);
    gradient.addColorStop(1, ball.color);

    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(x - 2, y - 2, BALL_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
  }
}

export default function Plinko() {
  const { username, balance } = useGameCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geometryRef = useRef<BoardGeometry>(buildGeometry(520, 520));
  const [canvasSize, setCanvasSize] = useState({ width: 520, height: 520 });

  const {
    ballsRef,
    landEventsRef,
    lastWin,
    totalDrops,
    recentRounds,
    outOfCredits,
    error,
    isSyncing,
    canDrop,
    drop,
    reset,
    resyncGeometry,
    clearError,
  } = usePlinkoGame({ username, geometryRef });

  // Responsive canvas size (same behaviour as the old physics version).
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

  // Canvas setup + render loop. Re-runs only on resize; every frame reads refs,
  // so animation causes zero React re-renders.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const geometry = buildGeometry(canvasSize.width, canvasSize.height);
    geometryRef.current = geometry;
    resyncGeometry();

    let raf = 0;
    const render = () => {
      drawFrame(ctx, geometry, { ballsRef, landEventsRef }, Date.now());
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [canvasSize, ballsRef, landEventsRef, geometryRef, resyncGeometry]);

  // Auto-dismiss transient errors.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 3000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  const profit = balance - STARTING_BALANCE;
  const lastWinColor =
    lastWin === null
      ? 'text-gray-600'
      : lastWin >= 5
        ? 'text-yellow-400'
        : lastWin >= 1.5
          ? 'text-green-400'
          : lastWin >= 1
            ? 'text-teal-400'
            : lastWin >= 0.5
              ? 'text-orange-400'
              : 'text-red-400';

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-5xl w-full">
        {/* ------------------------------ sidebar ------------------------------ */}
        <div className="lg:w-80 w-full space-y-3 sm:space-y-4 order-2 lg:order-1">
          <div className="p-3 sm:p-4 rounded-xl bg-dark-card/90 backdrop-blur-sm border border-green-500/30 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">Balance</p>
                <p
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    balance < 10 ? 'text-red-400' : balance < 30 ? 'text-yellow-400' : 'text-green-400'
                  }`}
                >
                  ${balance.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">Profit</p>
                <p
                  className={`text-lg sm:text-xl font-bold font-mono ${
                    profit > 0 ? 'text-green-400' : profit < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {profit > 0 ? '+' : ''}
                  {profit.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-wider">
              Server wallet {isSyncing ? '• syncing…' : '• synced'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Drops</p>
              <p className="text-white font-bold text-base sm:text-lg">{totalDrops}</p>
            </div>
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Cost</p>
              <p className="text-cyan-400 font-bold text-base sm:text-lg">{DROP_BET}</p>
            </div>
            <div className="bg-dark-card/90 rounded-lg p-2 sm:p-3 text-center border border-green-500/10">
              <p className="text-gray-500 text-[10px] sm:text-xs">Last Win</p>
              <p className={`font-bold text-base sm:text-lg ${lastWinColor}`}>
                {lastWin !== null ? `+${lastWin}` : '—'}
              </p>
            </div>
          </div>

          {recentRounds.length > 0 && (
            <div className="bg-dark-card/90 rounded-lg p-3 border border-green-500/10">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                Recent rounds (server ledger)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recentRounds.map((round) => {
                  const { hue, sat, light } = slotHsl(round.multiplier);
                  return (
                    <span
                      key={round.id}
                      className="px-2 py-0.5 rounded text-[11px] font-bold font-mono"
                      style={{
                        color: `hsl(${hue}, ${sat}%, ${light}%)`,
                        background: `hsla(${hue}, ${sat}%, ${light}%, 0.12)`,
                        border: `1px solid hsla(${hue}, ${sat}%, ${light}%, 0.4)`,
                      }}
                    >
                      {round.multiplier}x
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => void drop()}
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
                  <span>Drop Ball (-{DROP_BET})</span>
                </>
              ) : (
                <>
                  <NoCreditsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isSyncing ? 'Syncing…' : 'No Credits'}</span>
                </>
              )}
            </button>
            <button
              onClick={() => void reset()}
              className="w-full bg-dark-card/90 border border-green-500/30 text-green-400 font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Reset Game</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center gap-2">
              <WarningIcon className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {outOfCredits && !error && (
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

        {/* ------------------------------ board ------------------------------ */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 gap-2">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-green-500/20 bg-black max-w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <p className="text-[11px] text-gray-500 text-center">
            Outcome is decided by the server (weighted CSPRNG) — the client only replays the returned path.
          </p>
        </div>
      </div>
    </div>
  );
}
