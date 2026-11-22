/**
 * Plinko engine — shared between the server (outcome decision) and the client (animation).
 *
 * Architecture: the server decides the outcome (slot index) using a weighted CSPRNG,
 * then derives a short direction array ("L"/"R" per peg row) whose number of "R"s is
 * exactly the chosen slot index. The client replays that path as a deterministic
 * animation — the ball always lands in the slot the server picked.
 *
 * Galton math: with N peg rows there are N+1 landing positions, and the final slot
 * equals the number of "R" bounces. 8 rows -> 9 slots, which is why SLOT_COUNT = 9.
 */

// ---------------------------------------------------------------------------
// Game configuration
// ---------------------------------------------------------------------------

/** Number of peg rows the ball passes through (each row = one L/R decision). */
export const PLINKO_ROWS = 8;

/** Landing slots = rows + 1 (classic Galton board math). */
export const SLOT_COUNT = PLINKO_ROWS + 1; // 9

/** Fixed cost per drop, enforced server-side. */
export const DROP_BET = 1;

/** Balance a new (or reset) player account starts with. */
export const STARTING_BALANCE = 100;

/** Payout multiplier for each slot, index 0 (left edge) .. 8 (right edge). */
export const MULTIPLIERS: readonly number[] = [5, 1.5, 1.25, 0.5, 0.25, 0.5, 1.25, 1.5, 5];

/**
 * Probability of landing in each slot, chosen by the server (must sum to 1).
 * Bell-shaped so it visually matches a Galton board, but explicitly tuned:
 *
 *   RTP = Σ probability[i] × multiplier[i] = 0.9525  →  ~4.75% house edge.
 *
 * The old client-side version had no explicit edge — it emerged from physics.
 * Here the edge is a single tunable table. Bump the edge slots' probability
 * if you want the 5x to hit more often (and the RTP to drop).
 */
export const SLOT_PROBABILITIES: readonly number[] = [
  0.02, 0.065, 0.125, 0.2, 0.18, 0.2, 0.125, 0.065, 0.02,
];

/** Expected return per unit bet (≈ 0.9525 with the table above). */
export const HOUSE_RTP = MULTIPLIERS.reduce(
  (ev, mult, i) => ev + mult * (SLOT_PROBABILITIES[i] ?? 0),
  0,
);

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** One bounce decision. The ball moves one half-spacing right on "R", left on "L". */
export type PathMove = 'L' | 'R';

/** A completed round, persisted in the server-side ledger. */
export interface RoundRecord {
  id: string;
  username: string;
  bet: number;
  slotIndex: number;
  multiplier: number;
  payout: number;
  path: PathMove[];
  balanceAfter: number;
  createdAt: string;
}

/** Public shape of a round as exposed by the state endpoint (no path needed). */
export interface RoundSummary {
  id: string;
  slotIndex: number;
  multiplier: number;
  payout: number;
  bet: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Cryptographic randomness (isomorphic: Node 18+ and browsers both ship
// globalThis.crypto.getRandomValues)
// ---------------------------------------------------------------------------

/** Uniform float in [0, 1) from a CSPRNG. Never use Math.random for outcomes. */
export function randomFloat(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] / 4294967296; // 2^32
}

/** Picks a slot index from SLOT_PROBABILITIES (weighted random). */
export function pickSlotIndex(): number {
  const roll = randomFloat();
  let acc = 0;
  for (let i = 0; i < SLOT_PROBABILITIES.length; i++) {
    acc += SLOT_PROBABILITIES[i] ?? 0;
    if (roll < acc) return i;
  }
  return SLOT_PROBABILITIES.length - 1;
}

/**
 * Builds the direction array for a chosen slot: a uniformly random shuffle of
 * `slotIndex` "R"s and (rows - slotIndex) "L"s. Every valid path to that slot
 * is equally likely and the ball is guaranteed to end in the right slot.
 */
export function generatePath(slotIndex: number, rows: number = PLINKO_ROWS): PathMove[] {
  const clamped = Math.max(0, Math.min(rows, slotIndex));
  const moves: PathMove[] = [];
  for (let i = 0; i < rows; i++) moves.push(i < clamped ? 'R' : 'L');
  // Fisher-Yates shuffle
  for (let i = moves.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat() * (i + 1));
    const tmp = moves[i] as PathMove;
    moves[i] = moves[j] as PathMove;
    moves[j] = tmp;
  }
  return moves;
}

// ---------------------------------------------------------------------------
// Board geometry (pure math, driven by the canvas size on the client)
// ---------------------------------------------------------------------------

export const PEG_RADIUS = 5;
export const BALL_RADIUS = 8;

export interface BoardGeometry {
  width: number;
  height: number;
  centerX: number;
  /** Horizontal spacing unit: one slot width / one full L-R step. */
  unit: number;
  /** Y of the first peg row. */
  topY: number;
  /** Vertical distance between peg rows. */
  rowGap: number;
  /** Y where the ball spawns. */
  startY: number;
  slotTopY: number;
  slotHeight: number;
  slotWidth: number;
}

export function buildGeometry(width: number, height: number): BoardGeometry {
  const hPadding = Math.max(32, width * 0.08);
  // 9 slot columns must fit between the paddings; the peg pyramid spans 8 units.
  const unit = (width - 2 * hPadding) / 9;
  const topY = 56;
  const slotTopY = height - 48;
  const rowGap = (slotTopY - 26 - topY) / (PLINKO_ROWS - 1);
  return {
    width,
    height,
    centerX: width / 2,
    unit,
    topY,
    rowGap,
    startY: 18,
    slotTopY,
    slotHeight: 35,
    slotWidth: unit * 0.9,
  };
}

/** Row `row` (0-based) holds `row + 2` pegs. */
export function pegCount(row: number): number {
  return row + 2;
}

/**
 * X of peg `col` in `row`. Rows are staggered (classic Galton): row 0 has pegs
 * at ±unit/2 around the center, row 7 spans -4u..+4u.
 */
export function pegX(row: number, col: number, g: BoardGeometry): number {
  return g.centerX + ((2 * col - (row + 1)) * g.unit) / 2;
}

export function pegY(row: number, g: BoardGeometry): number {
  return g.topY + row * g.rowGap;
}

export interface Peg {
  x: number;
  y: number;
}

export function allPegs(g: BoardGeometry): Peg[] {
  const pegs: Peg[] = [];
  for (let row = 0; row < PLINKO_ROWS; row++) {
    const count = pegCount(row);
    for (let col = 0; col < count; col++) {
      pegs.push({ x: pegX(row, col, g), y: pegY(row, g) });
    }
  }
  return pegs;
}

/** Center X of slot `slotIndex` (0..8): centerX + (slotIndex - 4) * unit. */
export function slotCenterX(slotIndex: number, g: BoardGeometry): number {
  return g.centerX + (slotIndex - 4) * g.unit;
}

// ---------------------------------------------------------------------------
// Path -> animation waypoints
// ---------------------------------------------------------------------------

const FIRST_FALL_MS = 280; // spawn -> first peg row
const HOP_MS = 240; // one peg row to the next
const SLOT_DROP_MS = 360; // last row -> into the slot

export interface BallPath {
  points: Peg[];
  segmentMs: number[];
  totalMs: number;
}

/**
 * Converts a direction array into waypoints:
 *   spawn -> one waypoint per peg row (the gap the ball threads) -> drop into slot.
 * The ball enters row r having made k "R" moves so far; its x is
 * centerX + (2k - r) * unit / 2, i.e. the midpoint between two pegs of that row.
 * After the final row the exit x is exactly the center of slot `numberOfRs`.
 */
export function computeWaypoints(path: PathMove[], g: BoardGeometry): BallPath {
  const points: Peg[] = [{ x: g.centerX, y: g.startY }];
  const segmentMs: number[] = [FIRST_FALL_MS];

  let rights = 0;
  for (let row = 0; row < PLINKO_ROWS; row++) {
    points.push({
      x: g.centerX + ((2 * rights - row) * g.unit) / 2,
      y: pegY(row, g),
    });
    segmentMs.push(HOP_MS);
    if (path[row] === 'R') rights++;
  }

  const slotX = slotCenterX(rights, g);
  points.push({ x: slotX, y: pegY(PLINKO_ROWS - 1, g) + g.rowGap * 0.55 });
  segmentMs.push(HOP_MS);
  points.push({ x: slotX, y: g.slotTopY + g.slotHeight * 0.45 });
  segmentMs.push(SLOT_DROP_MS);

  return { points, segmentMs, totalMs: segmentMs.reduce((a, b) => a + b, 0) };
}

// ---------------------------------------------------------------------------
// Easing + sampling (used by the canvas renderer)
// ---------------------------------------------------------------------------

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeInQuad(t: number): number {
  return t * t;
}

export interface SampledPosition {
  x: number;
  y: number;
  done: boolean;
}

/**
 * Position of a ball `elapsedMs` after its run started. Deterministic: the
 * renderer is a pure function of (path, startTime, now) — no physics state.
 */
export function sampleBallPath(ballPath: BallPath, elapsedMs: number): SampledPosition {
  const { points, segmentMs } = ballPath;
  let remaining = elapsedMs;
  for (let i = 0; i < points.length - 1; i++) {
    const seg = segmentMs[i] ?? SLOT_DROP_MS;
    const isLast = i === points.length - 2;
    if (remaining < seg || isLast) {
      const p = Math.min(1, Math.max(0, remaining / seg));
      const a = points[i] as Peg;
      const b = points[i + 1] as Peg;
      return {
        x: a.x + (b.x - a.x) * easeInOutQuad(p),
        y: a.y + (b.y - a.y) * easeInQuad(p),
        done: p >= 1 && isLast,
      };
    }
    remaining -= seg;
  }
  const last = points[points.length - 1] as Peg;
  return { x: last.x, y: last.y, done: true };
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function multiplierColorKind(multiplier: number): 'jackpot' | 'good' | 'ok' | 'weak' | 'bad' {
  if (multiplier >= 5) return 'jackpot';
  if (multiplier >= 1.5) return 'good';
  if (multiplier >= 1) return 'ok';
  if (multiplier >= 0.5) return 'weak';
  return 'bad';
}
