'use client';

/**
 * usePlinkoGame — client controller for the server-authoritative Plinko flow.
 *
 * Money flow per drop (shared IndexedDB wallet, same as every other game):
 *   1. the bet (DROP_BET) is deducted IMMEDIATELY — every drop always costs;
 *   2. POST /api/plinko/drop { username, roundId } with Idempotency-Key:
 *      roundId — the server dedupes by that key, so one retry of the same
 *      drop can never book (or charge) twice;
 *   3. the returned path becomes an ActiveBall the canvas replays;
 *   4. when the animation finishes the payout is credited back;
 *   5. if both attempts fail the bet is refunded.
 * The server no longer owns a wallet — the client wallet is the only balance.
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  DROP_BET,
  canAffordDrop,
  computeWaypoints,
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

/** localStorage ledger of round ids whose payout this wallet already collected. */
const CREDITED_KEY = 'neon-arcade:plinko:credited-rounds';

function readCreditedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(CREDITED_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

function persistCreditedSet(set: Set<string>): void {
  try {
    localStorage.setItem(CREDITED_KEY, JSON.stringify(Array.from(set).slice(-200)));
  } catch {
    // private mode / storage full — worst case a payout re-credits once
  }
}

interface UsePlinkoGameOptions {
  username: string;
  /** Live board geometry; re-read on every drop so resizes are respected. */
  geometryRef: MutableRefObject<BoardGeometry>;
}

export function usePlinkoGame({ username, geometryRef }: UsePlinkoGameOptions) {
  const { balance, addBalance, deductBalance } = useGameCurrency();

  const ballsRef = useRef<ActiveBall[]>([]);
  const landEventsRef = useRef<LandEvent[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlightRef = useRef(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [totalDrops, setTotalDrops] = useState(0);
  const [recentRounds, setRecentRounds] = useState<RecentRound[]>([]);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pushLandEvent = useCallback((event: LandEvent) => {
    landEventsRef.current = [...landEventsRef.current.slice(-5), event];
  }, []);

  /** Credits the payout of a finished round and removes its ball. */
  const settleBall = useCallback(
    (ball: ActiveBall) => {
      ballsRef.current = ballsRef.current.filter((b) => b.id !== ball.id);
      timersRef.current.delete(ball.id);
      setPendingCount(ballsRef.current.length);
      const credited = readCreditedSet();
      credited.add(ball.id);
      persistCreditedSet(credited);
      if (ball.payout > 0) addBalance(ball.payout);
      setLastWin(ball.multiplier);
      pushLandEvent({
        id: ball.id,
        slotIndex: ball.slotIndex,
        multiplier: ball.multiplier,
        at: Date.now(),
      });
    },
    [addBalance, pushLandEvent],
  );

  const clearAllBalls = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    ballsRef.current = [];
    landEventsRef.current = [];
    setPendingCount(0);
  }, []);

  // --- refresh the recent-rounds ledger (never touches the wallet) ---------
  const syncRounds = useCallback(async () => {
    try {
      const res = await fetch(`/api/plinko/state?username=${encodeURIComponent(username)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data?.ok) {
        setRecentRounds(Array.isArray(data.rounds) ? data.rounds.slice(0, MAX_RECENT) : []);
      }
    } catch {
      // offline — ledger refresh is cosmetic, ignore
    }
  }, [username]);

  // --- stale-while-revalidate (rounds ledger only) --------------------------
  // When the window regains focus or the network returns, quietly refresh the
  // recent-rounds list. The WALLET is deliberately never revalidated here —
  // it is IndexedDB-first, and acting on a stale balance could cost money.
  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === 'visible') void syncRounds();
    };
    window.addEventListener('focus', revalidate);
    document.addEventListener('visibilitychange', revalidate);
    window.addEventListener('online', revalidate);
    return () => {
      window.removeEventListener('focus', revalidate);
      document.removeEventListener('visibilitychange', revalidate);
      window.removeEventListener('online', revalidate);
    };
  }, [syncRounds]);

  // --- reload reconciliation ------------------------------------------------
  // The bet is charged the moment a drop starts and the payout is credited
  // when the animation ends. If the tab dies in between, the server already
  // sealed the round but the payout was never credited — reconcile the last
  // rounds against the localStorage ledger on every mount and pay what is
  // still owed. Idempotent: rounds are marked credited BEFORE the money moves.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/plinko/state?username=${encodeURIComponent(username)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (cancelled || !data?.ok || !Array.isArray(data.rounds)) return;
        setRecentRounds(data.rounds.slice(0, MAX_RECENT));

        const credited = readCreditedSet();
        let owed = 0;
        for (const round of data.rounds as Array<{ id: string; payout: number }>) {
          if (credited.has(round.id)) continue;
          credited.add(round.id);
          if (round.payout > 0) owed += round.payout;
        }
        persistCreditedSet(credited);
        if (owed > 0 && !cancelled) addBalance(owed);
      } catch {
        // offline — whatever is owed is reconciled on the next visit
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, addBalance]);

  // --- drop ----------------------------------------------------------------
  const drop = useCallback(async () => {
    if (inFlightRef.current >= MAX_IN_FLIGHT) return;
    // Charge the wallet up-front — every single drop costs the bet.
    if (!deductBalance(DROP_BET)) {
      setOutOfCredits(true);
      return;
    }

    inFlightRef.current += 1;
    // Stripe-style idempotency: one UUID per drop, reused on every retry of
    // THIS drop. The server books the round under this key, so a retried
    // request replays the sealed outcome instead of creating a new round.
    const roundId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const requestDrop = async (): Promise<Response> => {
      let lastResponse: Response | null = null;
      // Initial attempt + one automatic retry, both carrying the SAME
      // Idempotency-Key so the server-side dedupe keeps them safe.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch('/api/plinko/drop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': roundId,
            },
            body: JSON.stringify({ username, roundId }),
          });
          if (res.ok || (res.status >= 400 && res.status < 500)) {
            // Success or a definite client error — never retry those.
            return res;
          }
          lastResponse = res; // 5xx — fall through to the retry
        } catch (err) {
          lastResponse = undefined as unknown as Response;
          if (attempt === 1) throw err;
        }
      }
      return lastResponse as Response;
    };

    try {
      const res = await requestDrop();
      const data = await res.json().catch(() => undefined);

      if (!res.ok || !data?.ok || !data.round) {
        // Server refused — give the bet back so the player never loses money
        // on a drop that did not happen.
        addBalance(DROP_BET);
        if (res.status === 402) setOutOfCredits(true);
        else setError('Server could not process the drop — bet refunded.');
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
      addBalance(DROP_BET); // network error on both attempts — refund
      setError('Network error — the bet was refunded.');
    } finally {
      inFlightRef.current -= 1;
    }
  }, [addBalance, deductBalance, geometryRef, settleBall, username]);

  // --- reset the board state without changing the shared wallet ------------
  const reset = useCallback(async () => {
    try {
      await fetch('/api/plinko/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
    } catch {
      // reset endpoint is cosmetic — ignore network hiccups
    }
    clearAllBalls();
    setLastWin(null);
    setTotalDrops(0);
    setRecentRounds([]);
    setOutOfCredits(false);
    setError(null);
  }, [clearAllBalls, username]);

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

  const canDrop = !outOfCredits && canAffordDrop(balance);

  return {
    ballsRef,
    landEventsRef,
    balance,
    lastWin,
    totalDrops,
    recentRounds,
    outOfCredits,
    error,
    pendingCount,
    canDrop,
    drop,
    reset,
    resyncGeometry,
    clearError: () => setError(null),
  };
}
