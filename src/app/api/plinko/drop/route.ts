import { NextResponse, type NextRequest } from 'next/server';
import { DROP_BET } from '@/engine/plinkoEngine';
import { placeBet, sanitizeUsername } from '@/lib/plinkoStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/plinko/drop
 * Body: { username?: string, roundId?: string }
 *
 * The server alone decides the outcome: it deducts the bet, picks the slot with
 * a weighted CSPRNG, derives the L/R direction array (its length is the row
 * count; the number of "R"s equals the chosen slot), persists the round and
 * returns everything the client needs to play the animation.
 */
export async function POST(request: NextRequest) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const payload = (body ?? {}) as { username?: unknown; roundId?: unknown; bet?: unknown };

  const username = sanitizeUsername(payload.username);
  const roundId =
    typeof payload.roundId === 'string' && payload.roundId.length <= 64
      ? payload.roundId
      : undefined;
  // Bets are fixed for now; the server ignores whatever the client claims.
  const bet = DROP_BET;

  try {
    const result = await placeBet(username, bet, roundId);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, balance: result.balance },
        { status: 402 },
      );
    }
    return NextResponse.json(
      { ok: true, round: result.round },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[plinko/drop] failed:', err);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
