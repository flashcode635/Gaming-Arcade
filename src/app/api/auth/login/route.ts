import { NextResponse, type NextRequest } from 'next/server';
import type { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';
import { toPublicUser, validateUsername, verifyPassword } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login  Body: { username, password }
 * Verifies the scrypt password hash against the MongoDB user record.
 */
export async function POST(request: NextRequest) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const payload = (body ?? {}) as { username?: unknown; password?: unknown };

  const username = validateUsername(payload.username);
  const password = typeof payload.password === 'string' ? payload.password : '';
  if (!username || password.length === 0) {
    return NextResponse.json({ ok: false, error: 'Invalid username or password.' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne<{
      _id: ObjectId;
      username: string;
      createdAt?: Date | string;
      salt: string;
      passwordHash: string;
    }>({ username });

    if (!user || typeof user.salt !== 'string' || typeof user.passwordHash !== 'string') {
      return NextResponse.json({ ok: false, error: 'Invalid username or password.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.salt, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Invalid username or password.' }, { status: 401 });
    }

    await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    return NextResponse.json(
      { ok: true, user: toPublicUser(user) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[auth/login] failed:', err);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
