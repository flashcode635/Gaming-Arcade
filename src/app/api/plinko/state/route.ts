import { NextResponse, type NextRequest } from 'next/server';
import { getState, sanitizeUsername } from '@/lib/plinkoStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/plinko/state?username=Player
 * Authoritative balance + recent round history (used to sync on mount/focus).
 */
export async function GET(request: NextRequest) {
  const username = sanitizeUsername(request.nextUrl.searchParams.get('username'));
  try {
    const state = await getState(username);
    return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[plinko/state] failed:', err);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
