'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameCurrency } from '@/context/GameCurrencyContext';

export type AuthMode = 'signup' | 'login';

const INPUT_CLASSES =
  'w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-white/10 text-white placeholder:text-zinc-600 font-sans text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/40 transition-colors';
const LABEL_CLASSES = 'block text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5 font-mono';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface AuthCardProps {
  initialMode: AuthMode;
}

/** Simple client-side strength score for the password meter. */
function scorePassword(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0;
  if (password.length < 6) return 1;
  const varied = /[A-Za-z]/.test(password) && /\d/.test(password);
  if (password.length >= 10 && varied) return 3;
  if (password.length >= 6) return varied || password.length >= 8 ? 2 : 2;
  return 2;
}

const STRENGTH_META = [
  { label: '', color: 'bg-zinc-700' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Okay', color: 'bg-yellow-500' },
  { label: 'Strong', color: 'bg-green-500' },
] as const;

/**
 * Where to land after auth. `?next=/settings` (used by the settings guard)
 * wins when it is a safe same-site path; otherwise players go to the arcade.
 */
function readNextPath(): string {
  if (typeof window === 'undefined') return '/arcade';
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/arcade';
}

export default function AuthCard({ initialMode }: AuthCardProps) {
  const router = useRouter();
  const { loginUser, username, isAuthLoaded, balance } = useGameCurrency();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [usernameField, setUsernameField] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [availability, setAvailability] = useState<Availability>('idle');

  const checkSeq = useRef(0);

  // Already signed in — send the player straight to the arcade.
  useEffect(() => {
    if (isAuthLoaded && username !== 'Player') router.replace(readNextPath());
  }, [isAuthLoaded, username, router]);

  // Live username availability (sign-up only, debounced).
  useEffect(() => {
    if (mode !== 'signup') {
      setAvailability('idle');
      return;
    }
    const name = usernameField.trim();
    if (name.length === 0) {
      setAvailability('idle');
      return;
    }
    if (name.length < 3 || name.length > 20 || !/^[A-Za-z0-9_]+$/.test(name)) {
      setAvailability('invalid');
      return;
    }
    setAvailability('checking');
    const seq = ++checkSeq.current;
    const timer = setTimeout(() => {
      fetch(`/api/auth/check?username=${encodeURIComponent(name)}`)
        .then((res) => res.json())
        .then((data: { available?: boolean }) => {
          if (checkSeq.current !== seq) return;
          setAvailability(data?.available ? 'available' : 'taken');
        })
        .catch(() => {
          if (checkSeq.current !== seq) return;
          setAvailability('idle'); // fail open — server validates again on submit
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [usernameField, mode]);

  const strength = useMemo(() => scorePassword(password), [password]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
    setAvailability('idle');
  };

  const availabilityHint = () => {
    switch (availability) {
      case 'checking':
        return <span className="text-zinc-500">Checking availability…</span>;
      case 'available':
        return <span className="text-green-400 font-semibold">Username is available</span>;
      case 'taken':
        return <span className="text-red-400 font-semibold">Username is already taken</span>;
      case 'invalid':
        return (
          <span className="text-yellow-500">
            3-20 characters — letters, numbers or underscore
          </span>
        );
      default:
        return (
          <span className="text-zinc-600">
            Your player name — shown on every game screen
          </span>
        );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setSuccess(null);

    const name = usernameField.trim();
    if (name.length < 3 || name.length > 20 || !/^[A-Za-z0-9_]+$/.test(name)) {
      setError('Username: 3-20 characters, letters, numbers or underscore only.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      // Signup creates a record — send an Idempotency-Key for the whole
      // submit session so a retried submit can never double-create.
      const idempotencyKey =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ username: name, password }),
      });
      const data = await res.json().catch(() => undefined);
      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Something went wrong. Try again.');
        return;
      }
      const player = typeof data.user?.username === 'string' ? data.user.username : name;
      const serverBalance = typeof data.balance === 'number' ? data.balance : undefined;
      loginUser(player, { balance: serverBalance });
      setSuccess(
        mode === 'signup'
          ? `Welcome to Neon Arcade, ${player} — $${(serverBalance ?? 100).toFixed(0)} added!`
          : `Welcome back, ${player}!`,
      );
      setTimeout(() => router.replace(readNextPath()), 600);
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-dark-card/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-green-500/5">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1.5">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-green-400 hover:text-green-300 font-semibold"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New to the arcade?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-green-400 hover:text-green-300 font-semibold"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className={LABEL_CLASSES}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              value={usernameField}
              onChange={(e) => setUsernameField(e.target.value)}
              placeholder="e.g. neon_rider"
              className={INPUT_CLASSES}
            />
            <p className="text-xs mt-1.5 min-h-4">{availabilityHint()}</p>
          </div>

          <div>
            <label htmlFor="password" className={LABEL_CLASSES}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              className={INPUT_CLASSES}
            />
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${STRENGTH_META[strength].color}`}
                    style={{ width: `${(strength / 3) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-500 w-14 text-right">
                  {STRENGTH_META[strength].label}
                </span>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirm" className={LABEL_CLASSES}>
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className={INPUT_CLASSES}
              />
              {confirm.length > 0 && confirm !== password && (
                <p className="text-xs mt-1.5 text-red-400">Passwords do not match yet.</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-semibold text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold py-3 rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account — $100 free' : 'Log in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] uppercase tracking-widest text-zinc-600 font-mono">or</span>
          <span className="flex-1 h-px bg-white/10" />
        </div>

        <Link
          href="/arcade"
          className="w-full flex items-center justify-center gap-2 border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold py-3 rounded-xl hover:bg-cyan-500/20 transition-colors"
        >
          Play as guest
          {isAuthLoaded && (
            <span className="text-cyan-400/80 font-mono text-xs">(${balance.toFixed(0)} trial)</span>
          )}
        </Link>

        <p className="text-zinc-600 text-[11px] text-center mt-5 leading-relaxed">
          Accounts live in MongoDB, your wallet in IndexedDB. By continuing you
          accept the house rules: play fair, have fun.
        </p>
      </div>

      <p className="text-zinc-600 text-xs text-center mt-4">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300">
          ← Back to neonarcade.app
        </Link>
      </p>
    </div>
  );
}
