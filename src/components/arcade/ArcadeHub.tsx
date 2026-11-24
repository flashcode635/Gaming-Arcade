'use client';

import Link from 'next/link';
import { GAME_ICONS } from '@/components/games/iconMap';
import { GAMES, GAME_ORDER, DIFFICULTY_STYLES } from '@/lib/games';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { TopBar } from '@/components/core/topBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDelayedTrue } from '@/hooks/useDelayedTrue';

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Placeholder drawn with the same boxes as the loaded hub so the switch from
 * skeleton to content is pixel-stable. Only rendered when the IndexedDB
 * profile read takes longer than 300 ms (see useDelayedTrue).
 */
function HubSkeleton() {
  return (
    <div className="flex min-h-screen flex-col" aria-hidden>
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="hidden h-4 w-28 sm:block" />
          <Skeleton className="ml-2 hidden h-10 w-64 rounded-xl sm:block" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-11 w-72 sm:h-14 sm:w-96" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-16 w-full max-w-md rounded-xl lg:w-80" />
        </div>
        <Skeleton className="mt-6 h-[74px] w-full rounded-2xl" />

        <div className="mt-10 flex items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {GAME_ORDER.map((id) => (
            <div
              key={id}
              className="arcade-game-card flex min-h-56 flex-col rounded-2xl border p-5 sm:p-6"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-3/4" />
              <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The arcade hub at /arcade — the player's home base after sign-up.
 * Shows the wallet and identity up top, then all six game cabinets.
 */
export default function ArcadeHub() {
  const { username, balance, sessionBaseline, isSignedIn, isAuthLoaded } = useGameCurrency();
  const showSkeleton = useDelayedTrue(!isAuthLoaded, 300);

  if (showSkeleton) return <HubSkeleton />;

  const sessionDelta = sessionBaseline == null ? 0 : balance - sessionBaseline;
  const sessionTone =
    sessionDelta > 0.001 ? 'text-emerald-300' : sessionDelta < -0.001 ? 'text-red-400' : 'text-zinc-400';
  const sessionLabel = `${sessionDelta > 0 ? '+' : sessionDelta < 0 ? '−' : ''}$${Math.abs(sessionDelta).toFixed(2)}`;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ------------------------------ chrome ------------------------------ */}
      <header className="arcade-topbar-shell sticky sticky-safe-top z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <TopBar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {/* ------------------------------- hero ------------------------------ */}
        <section>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-emerald-400">
                Neon Arcade <span className="text-zinc-700">/</span> Player lobby
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl">
                Choose your <span className="text-emerald-300 neon-text">game.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                Six quick cabinets, one shared wallet. Every round costs $1 — win it back, then take
                the next one.
              </p>
            </div>

            <dl className="grid w-full max-w-md shrink-0 grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] lg:w-auto">
              {[
                { label: 'Cabinets', value: '06' },
                { label: 'Per play', value: '$1' },
                { label: 'Top payout', value: '10×' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-4 py-3 ${index > 0 ? 'border-l border-white/[0.06]' : ''}`}
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-sm font-semibold text-zinc-200">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* player / wallet strip */}
          <aside className="arcade-player-card relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-4 overflow-hidden rounded-2xl px-4 py-4 sm:px-5">
            <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
              <span className="profile-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-emerald-300">
                {username.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-white">{username}</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isSignedIn ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  />
                  {isSignedIn ? 'Signed in' : 'Guest trial'}
                </p>
              </div>
            </div>

            <span className="relative hidden h-9 w-px bg-white/[0.07] sm:block" />

            <div className="relative">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Balance</p>
              <p className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">
                ${balance.toFixed(2)}
              </p>
            </div>

            <div className="relative">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Session</p>
              <p className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${sessionTone}`}>
                {sessionLabel}
              </p>
            </div>

            <div className="relative hidden sm:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Entry</p>
              <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-zinc-300">−$1.00</p>
            </div>

            <div className="relative ml-auto flex w-full items-center gap-2 sm:w-auto">
              {isSignedIn ? (
                <Link
                  href="/settings"
                  className="arcade-secondary-btn inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors sm:flex-none"
                >
                  Settings &amp; theme
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="arcade-secondary-btn inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors sm:flex-none"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="arcade-cta inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-all sm:flex-none"
                  >
                    Join free — $100
                  </Link>
                </>
              )}
            </div>

            {balance < 1 && (
              <p className="relative w-full text-[11px] leading-relaxed text-red-400">
                {isSignedIn
                  ? 'Wallet empty — win a round to refill it.'
                  : 'Trial credits used up — sign up for a fresh $100.'}
              </p>
            )}
          </aside>
        </section>

        {/* ----------------------------- cabinets ---------------------------- */}
        <section id="cabinets" className="mt-10 scroll-mt-24 sm:mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                The floor
              </p>
              <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                All cabinets
              </h2>
            </div>
            <p className="font-mono text-[11px] text-zinc-500">
              06 games <span className="px-1 text-zinc-700">·</span> $1 entry
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {GAME_ORDER.map((id) => {
              const game = GAMES[id];
              const Icon = GAME_ICONS[id];
              const locked = balance < game.costPerTurn;

              return (
                <Link
                  key={id}
                  href={`/arcade/${id}`}
                  aria-disabled={locked}
                  tabIndex={locked ? -1 : undefined}
                  onClick={(event) => {
                    if (locked) event.preventDefault();
                  }}
                  className={`group arcade-game-card relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
                    locked
                      ? 'cursor-not-allowed opacity-45'
                      : 'hover:-translate-y-0.5'
                  }`}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-px opacity-70"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${game.accent}, transparent)`,
                    }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(420px circle at 15% 0%, ${game.accent}12, transparent 65%)`,
                    }}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className="arcade-icon-tile flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `${game.accent}18`,
                        color: game.accent,
                        boxShadow: `inset 0 0 0 1px ${game.accent}2e`,
                      }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${DIFFICULTY_STYLES[game.difficulty]}`}
                    >
                      {game.difficulty}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-white">{game.name}</h3>
                      <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                        ${game.costPerTurn}/play
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
                      {game.description}
                    </p>
                  </div>

                  <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <span
                      className="arcade-accent inline-flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: locked ? '#f87171' : game.accent }}
                    >
                      {locked ? 'Low balance' : 'Play now'}
                      <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                    <span
                      className="arcade-payout-chip rounded-md px-2 py-1 font-mono text-[10px] font-bold"
                      style={{ color: game.accent, background: `${game.accent}14` }}
                    >
                      {game.payout}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            Neon Arcade <span className="px-1 text-zinc-800">·</span> Wallet in IndexedDB
          </p>
          <nav className="flex items-center gap-5 text-xs text-zinc-500">
            <Link href="/" className="transition-colors hover:text-emerald-300">
              Home
            </Link>
            <Link href="/arcade" className="transition-colors hover:text-emerald-300">
              Lobby
            </Link>
            {isSignedIn && (
              <Link href="/settings" className="transition-colors hover:text-emerald-300">
                Settings
              </Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
