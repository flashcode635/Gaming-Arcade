'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SnakeIcon } from '@/assets/svg/GameIcons';
import { useGameCurrency } from '@/context/GameCurrencyContext';

export type AuthMode = 'signup' | 'login';

const INPUT_CLASSES =
  'w-full px-4 py-2.5 rounded-lg bg-dark-surface border border-green-500/30 text-white placeholder:text-zinc-600 font-sans text-sm focus:outline-none focus:border-cyan-500/60 transition-colors';
const LABEL_CLASSES = 'block text-xs uppercase tracking-widest text-zinc-500 mb-1.5 font-mono';

interface AuthCardProps {
  initialMode: AuthMode;
}

export default function AuthCard({ initialMode }: AuthCardProps) {
  const router = useRouter();
  const { loginUser, username, isAuthLoaded } = useGameCurrency();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [usernameField, setUsernameField] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in — send the player straight back to the arcade.
  useEffect(() => {
    if (isAuthLoaded && username !== 'Player') router.replace('/');
  }, [isAuthLoaded, username, router]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
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
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password }),
      });
      const data = await res.json().catch(() => undefined);
      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Something went wrong. Try again.');
        return;
      }
      const player = typeof data.user?.username === 'string' ? data.user.username : name;
      loginUser(player);
      setSuccess(mode === 'signup' ? `Welcome to NeonArcade, ${player}!` : `Welcome back, ${player}!`);
      setTimeout(() => router.replace('/'), 700);
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-dark-card/90 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 sm:p-8 neon-glow">
      <div className="text-center mb-6">
        <SnakeIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h1 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-widest text-white">
          {mode === 'signup' ? 'Join the Arcade' : 'Player Login'}
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-2">
          {mode === 'signup'
            ? 'Create your player profile — account saved in MongoDB, session kept in IndexedDB.'
            : 'Sign in to load your saved player profile.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-lg bg-dark-surface border border-green-500/20">
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`py-2 rounded-md font-semibold text-sm transition-colors ${
            mode === 'signup'
              ? 'bg-linear-to-r from-green-500 to-cyan-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`py-2 rounded-md font-semibold text-sm transition-colors ${
            mode === 'login'
              ? 'bg-linear-to-r from-green-500 to-cyan-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className={LABEL_CLASSES}>
            Player Name
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
            placeholder="Minimum 6 characters"
            className={INPUT_CLASSES}
          />
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
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-semibold text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-semibold text-center">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-linear-to-r from-green-500 to-cyan-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Login'}
        </button>
      </form>

      <p className="text-zinc-600 text-xs text-center mt-6">
        <a href="/" className="text-cyan-400 hover:text-cyan-300 underline">
          Back to the arcade
        </a>
      </p>
    </div>
  );
}
