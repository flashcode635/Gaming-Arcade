import { NextResponse, type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongo';
import { validateUsername } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/check?username=neon_rider
 * Live availability check used by the sign-up form.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('username') ?? '';
  const username = validateUsername(raw);

  if (!username) {
    return NextResponse.json(
      { ok: false, available: false, error: 'INVALID_FORMAT' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const db = await getDb();
    const existing = await db
      .collection('users')
      .findOne({ username }, { projection: { _id: 1 } });

    return NextResponse.json(
      { ok: true, available: !existing },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[auth/check] failed:', err);
    // Fail open: never block sign-up because the availability ping failed.
    return NextResponse.json(
      { ok: false, available: true, error: 'CHECK_UNAVAILABLE' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
