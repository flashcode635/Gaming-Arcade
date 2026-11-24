import { NextResponse, type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongo';
import { validateUsername } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/balance  Body: { username, balance }
 * Persists the player's final wallet balance into MongoDB. Called when the
 * player logs out (and could be called periodically) so coins survive
 * across devices.
 */
export async function POST(request: NextRequest) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const payload = (body ?? {}) as { username?: unknown; balance?: unknown };

  const username = validateUsername(payload.username);
  const balance =
    typeof payload.balance === 'number' && Number.isFinite(payload.balance) && payload.balance >= 0
      ? Math.round(payload.balance * 100) / 100
      : null;

  if (!username || balance === null) {
    return NextResponse.json({ ok: false, error: 'Invalid username or balance.' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db
      .collection('users')
      .updateOne({ username }, { $set: { balance, balanceUpdatedAt: new Date() } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Unknown player.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, balance }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[auth/balance] failed:', err);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
