/**
 * Server-only Plinko store: outcome sealing + round ledger.
 *
 * The WALLET lives on the client (IndexedDB, shared with every other game):
 * each drop deducts the bet immediately and each landing credits the payout.
 * The server's job is only to seal each round's fate (weighted CSPRNG slot +
 * derived path) and persist a ledger for history. Swap the ledger for a real
 * DB without touching the API routes.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  DROP_BET,
  MULTIPLIERS,
  STARTING_BALANCE,
  generatePath,
  pickSlotIndex,
  round2,
  type PathMove,
  type RoundRecord,
  type RoundSummary,
} from '@/engine/plinkoEngine';

// ---------------------------------------------------------------------------
// Persistent files
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), '.data');
const ROUNDS_FILE = path.join(DATA_DIR, 'rounds.json');
const MAX_LEDGER_ROWS = 200;

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(file: string, value: unknown): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(value));
  renameSync(tmp, file);
}

// ---------------------------------------------------------------------------
// Per-process state (survives dev-server hot reloads via globalThis)
// ---------------------------------------------------------------------------

interface StoreState {
  /** One promise chain per username -> serialized read-modify-write cycles. */
  chains: Map<string, Promise<unknown>>;
  /** Idempotency cache: client roundId -> the round already booked for it. */
  processed: Map<string, RoundRecord>;
}

const globalStore = globalThis as typeof globalThis & { __plinkoStore?: StoreState };
const store: StoreState = globalStore.__plinkoStore ?? { chains: new Map(), processed: new Map() };
globalStore.__plinkoStore = store;

function withLock<T>(key: string, fn: () => T): Promise<T> {
  const prev = store.chains.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  store.chains.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type PlaceBetResult = { ok: true; round: RoundRecord; replay: boolean };

/** Usernames are display strings; keep them boring since they key the ledger. */
export function sanitizeUsername(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  const cleaned = s.replace(/[^A-Za-z0-9 _-]/g, '').slice(0, 24);
  return cleaned.length > 0 ? cleaned : 'Player';
}

/**
 * The heart of the game: seal the fate (weighted CSPRNG slot), derive the
 * direction array, persist the round — atomically per username. Money is
 * handled entirely by the client wallet.
 */
export function placeBet(
  username: string,
  bet: number,
  clientRoundId?: string,
): Promise<PlaceBetResult> {
  return withLock(username, (): PlaceBetResult => {
    // Idempotency: a retried request with the same roundId never books twice.
    if (clientRoundId) {
      const seen = store.processed.get(clientRoundId);
      if (seen) return { ok: true, round: seen, replay: true };
    }

    // --- fate is sealed here ---------------------------------------------
    const slotIndex = pickSlotIndex();
    const path: PathMove[] = generatePath(slotIndex);
    const multiplier = MULTIPLIERS[slotIndex] ?? 0;
    const payout = round2(bet * multiplier);
    // ----------------------------------------------------------------------

    const round: RoundRecord = {
      id: clientRoundId ?? randomUUID(),
      username,
      bet,
      slotIndex,
      multiplier,
      payout,
      path,
      createdAt: new Date().toISOString(),
    };

    const ledger = readJson<RoundRecord[]>(ROUNDS_FILE, []);
    ledger.push(round);
    if (ledger.length > MAX_LEDGER_ROWS) ledger.splice(0, ledger.length - MAX_LEDGER_ROWS);
    writeJsonAtomic(ROUNDS_FILE, ledger);

    if (clientRoundId) {
      store.processed.set(clientRoundId, round);
      if (store.processed.size > 500) {
        const oldest = store.processed.keys().next();
        if (!oldest.done) store.processed.delete(oldest.value);
      }
    }

    return { ok: true, round, replay: false };
  });
}

export interface StateResult {
  ok: true;
  balance: number;
  bet: number;
  rounds: RoundSummary[];
}

export function getState(username: string): Promise<StateResult> {
  return withLock(username, (): StateResult => {
    const rounds = readJson<RoundRecord[]>(ROUNDS_FILE, [])
      .filter((r) => r.username === username)
      .slice(-10)
      .reverse()
      .map(toSummary);
    return { ok: true, balance: STARTING_BALANCE, bet: DROP_BET, rounds };
  });
}

export interface ResetResult {
  ok: true;
  balance: number;
}

export function resetBalance(_username: string): Promise<ResetResult> {
  return Promise.resolve({ ok: true, balance: STARTING_BALANCE });
}

function toSummary(r: RoundRecord): RoundSummary {
  return {
    id: r.id,
    slotIndex: r.slotIndex,
    multiplier: r.multiplier,
    payout: r.payout,
    bet: r.bet,
    createdAt: r.createdAt,
  };
}
