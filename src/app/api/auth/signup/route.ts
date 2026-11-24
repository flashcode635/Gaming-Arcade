import { NextResponse, type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongo';
import { hashPassword, toPublicUser, validatePassword, validateUsername } from '@/lib/auth';
import { SIGNUP_BONUS } from '@/lib/wallet-constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signup  Body: { username, password }
 * Creates the player in MongoDB (collection: users, unique username index).
 * Passwords are stored as scrypt(salt + hash) — never in plain text.
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
  if (!username) {
    return NextResponse.json(
      { ok: false, error: 'Invalid username — 3-20 characters, letters, numbers or underscore only.' },
      { status: 400 },
    );
  }
  const password = validatePassword(payload.password);
  if (!password) {
    return NextResponse.json(
      { ok: false, error: 'Invalid password — minimum 6 characters.' },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ username }, { projection: { _id: 1 } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Username already taken.' }, { status: 409 });
    }

    const { salt, hash } = await hashPassword(password);
    const createdAt = new Date();
    const startingBalance = SIGNUP_BONUS;
    try {
      await users.insertOne({
        username,
        salt,
        passwordHash: hash,
        balance: startingBalance,
        createdAt,
        lastLoginAt: createdAt,
      });
    } catch (insertErr) {
      if ((insertErr as { code?: number }).code === 11000) {
        return NextResponse.json({ ok: false, error: 'Username already taken.' }, { status: 409 });
      }
      throw insertErr;
    }

    return NextResponse.json(
      { ok: true, user: toPublicUser({ username, createdAt }), balance: startingBalance },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[auth/signup] failed:', err);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
