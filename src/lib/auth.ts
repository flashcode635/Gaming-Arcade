import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 6;

/** 3-20 chars, letters/numbers/underscore. Returns the trimmed name or null. */
export function validateUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length < USERNAME_MIN || trimmed.length > USERNAME_MAX) return null;
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) return null;
  return trimmed;
}

/** Minimum 6, maximum 72 chars. Returns the password or null. */
export function validatePassword(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length < PASSWORD_MIN || raw.length > 72) return null;
  return raw;
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString('hex') };
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  try {
    const derived = await scrypt(password, salt, 64);
    const stored = Buffer.from(hash, 'hex');
    if (stored.length !== derived.length) return false;
    return timingSafeEqual(stored, derived);
  } catch {
    return false;
  }
}

export interface PublicUser {
  username: string;
  createdAt: string;
}

export function toPublicUser(user: { username: unknown; createdAt?: unknown }): PublicUser {
  const createdAt =
    user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : typeof user.createdAt === 'string'
        ? user.createdAt
        : new Date().toISOString();
  return { username: String(user.username), createdAt };
}
