'use client';

/**
 * usePlinkoGame — client controller for the server-authoritative Plinko flow.
 *
 * (The file keeps its historical name; it no longer runs any physics. The ball
 * follows a direction array ("L"/"R" per peg row) handed down by the server.)
 *
 * Flow per drop:
 *   1. POST /api/plinko/drop { username, roundId }   — fate is sealed server-side
 *   2. server replies { round: { slotIndex, multiplier, payout, path, ... } }
 *   3. hook turns `path` into waypoints for the current board geometry and adds
 *      an ActiveBall; the canvas renderer samples it deterministically
 *   4. when the animation finishes, the net delta (payout - bet) is applied to
 *      the shared wallet. Deltas compose safely even with balls in flight.
 *
 * The displayed balance can therefore never spoil the outcome mid-air, and the
 * authoritative value is re-synced from GET /api/plinko/state on mount and on
 * window focus.
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  DROP_BET,
  STARTING_BALANCE,
  computeWaypoints,
  round2,
  type BallPath,
  type BoardGeometry,
  type PathMove,
  type RoundSummary,
} from '@/engine/plinkoEngine';
import { useGameCurrency } from '@/context/GameCurrencyContext';

export interface ActiveBall {
  id: string;
  path: PathMove[];
  anim: BallPath;
  startTime: number;
  color: string;
  slotIndex: number;
  multiplier: number;
  payout: number;
  bet: number;
}

export interface LandEvent {
  id: string;
  slotIndex: number;
  multiplier: number;
  at: number;
}

type RecentRound = RoundSummary;

const BALL_COLORS = [
  '#ff3b3b', '#ff6b00', '#ffd000', '#ff2d95', '#b14bff',
  '#ff5e7d', '#ff9500', '#e0ff00', '#ff00aa', '#ff4444',
];

const MAX_IN_FLIGHT = 4;
const MAX_RECENT = 8;

interface UsePlinkoGameOptions {
  username: string;
  /** Live board geometry; re-read on every drop so resizes are respected. */
  geometryRef: MutableRefObject<BoardGeometry>;
}

export function usePlinkoGame({ username, geometryRef }: UsePlinkoGameOptions) {
  const { balance, setBalance } = useGameCurrency();

  const ballsRef = useRef<ActiveBall[]>([]);
  const landEventsRef = useRef<LandEvent[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlightRef = useRef(0);
  const balanceRef = useRef(balance);
  const [pendingCount, setPendingCount] = useState(0);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [totalDrops, setTotalDrops] = useState(0);
  const [recentRounds, setRecentRounds] = useState<RecentRound[]>([]);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const pushLandEvent = useCallback((event: LandEvent) => {
    landEventsRef.current = [...landEventsRef.current.slice(-5), event];
  }, []);

  const applyServerBalance = useCallback(
    (serverBalance: number) => {
      balanceRef.current = serverBalance;
      setBalance(round2(serverBalance));
    },
    [setBalance],
  );

  /** Applies the net effect of a finished round and removes its ball. */
  const settleBall = useCallback(
    (ball: ActiveBall) => {
      ballsRef.current = ballsRef.current.filter((b) => b.id !== ball.id);
      timersRef.current.delete(ball.id);
      setPendingCount(ballsRef.current.length);
      balanceRef.current = round2(balanceRef.current - ball.bet + ball.payout);
      setBalance(round2(balanceRef.current));
      setLastWin(ball.multiplier);
      pushLandEvent({
        id: ball.id,
        slotIndex: ball.slotIndex,
        multiplier: ball.multiplier,
        at: Date.now(),
      });
    },
    [pushLandEvent, setBalance],
  );

  const clearAllBalls = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    ballsRef.current = [];
    landEventsRef.current = [];
    setPendingCount(0);
  }, []);

  // --- sync authoritative state (mount + focus) ---------------------------
  const syncState = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastSyncRef.current < 2000) return;
      lastSyncRef.current = now;
      try {
        const res = await fetch(`/api/plinko/state?username=${encodeURIComponent(username)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data?.ok) {
          applyServerBalance(data.balance);
          setRecentRounds(Array.isArray(data.rounds) ? data.rounds.slice(0, MAX_RECENT) : []);
        }
      } catch {
        // offline — keep whatever we display locally
      } finally {
        setIsSyncing(false);
      }
    },
    [applyServerBalance, username],
  );

  useEffect(() => {
    setIsSyncing(true);
    void syncState(true);
  }, [syncState]);

  useEffect(() => {
    const onFocus = () => void syncState(false);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [syncState]);

  // --- drop ----------------------------------------------------------------
  const drop = useCallback(async () => {
    if (inFlightRef.current >= MAX_IN_FLIGHT) return;
    // Conservative funds check: every unsettled ball already spent its bet.
    const available = balanceRef.current - ballsRef.current.length * DROP_BET;
    if (available < DROP_BET) {
      setOutOfCredits(true);
      return;
    }

    inFlightRef.current += 1;
    const roundId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const res = await fetch('/api/plinko/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, roundId }),
      });
      const data = await res.json();

      if (res.status === 402) {
        setOutOfCredits(true);
        if (typeof data?.balance === 'number') applyServerBalance(data.balance);
        return;
      }
      if (!res.ok || !data?.ok || !data.round) {
        setError('Server could not process the drop. Try again.');
        return;
      }

      const round = data.round as {
        id: string;
        slotIndex: number;
        multiplier: number;
        payout: number;
        bet: number;
        path: PathMove[];
      };

      setOutOfCredits(false);
      setError(null);
      setTotalDrops((n) => n + 1);

      const ball: ActiveBall = {
        id: round.id,
        path: round.path,
        anim: computeWaypoints(round.path, geometryRef.current),
        startTime: Date.now(),
        color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)] ?? '#ff3b3b',
        slotIndex: round.slotIndex,
        multiplier: round.multiplier,
        payout: round.payout,
        bet: round.bet,
      };
      ballsRef.current = [...ballsRef.current, ball];
      setPendingCount(ballsRef.current.length);

      const timer = setTimeout(() => settleBall(ball), ball.anim.totalMs + 60);
      timersRef.current.set(ball.id, timer);
    } catch {
      setError('Network error — the drop was not placed.');
    } finally {
      inFlightRef.current -= 1;
    }
  }, [applyServerBalance, geometryRef, settleBall, username]);

  // --- reset (server-side top-up) ------------------------------------------
  const reset = useCallback(async () => {
    try {
      const res = await fetch('/api/plinko/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      clearAllBalls();
      setLastWin(null);
      setTotalDrops(0);
      setRecentRounds([]);
      setOutOfCredits(false);
      setError(null);
      if (data?.ok) applyServerBalance(data.balance);
      else applyServerBalance(STARTING_BALANCE);
    } catch {
      setError('Reset failed — check your connection.');
    }
  }, [applyServerBalance, clearAllBalls, username]);

  // --- geometry resync (called by the canvas on resize) --------------------
  const resyncGeometry = useCallback(() => {
    ballsRef.current = ballsRef.current.map((ball) => ({
      ...ball,
      anim: computeWaypoints(ball.path, geometryRef.current),
    }));
  }, [geometryRef]);

  // --- cleanup ---------------------------------------------------------------
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const canDrop =
    !outOfCredits && !isSyncing && balance - pendingCount * DROP_BET >= DROP_BET;

  return {
    ballsRef,
    landEventsRef,
    balance,
    lastWin,
    totalDrops,
    recentRounds,
    outOfCredits,
    error,
    isSyncing,
    pendingCount,
    canDrop,
    drop,
    reset,
    resyncGeometry,
    clearError: () => setError(null),
  };
}
