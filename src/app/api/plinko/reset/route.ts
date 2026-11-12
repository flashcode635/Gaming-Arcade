import { NextResponse, type NextRequest } from 'next/server';
import { resetBalance, sanitizeUsername } from '@/lib/plinkoStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/plinko/reset  Body: { username?: string }
 * Tops the account back up to STARTING_BALANCE (server-side, like everything else).
 */
export async function POST(request: NextRequest) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const payload = (body ?? {}) as { username?: unknown };
  const username = sanitizeUsername(payload.username);

  try {
    const result = await resetBalance(username);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[plinko/reset] failed:', err);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
