'use client';

import Link from 'next/link';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { openCommandMenu } from '@/components/core/CommandMenu';
import { ProfileMenu } from '@/components/core/ProfileMenu';

const SearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

export const TopBar = () => {
  const { balance, isSignedIn } = useGameCurrency();
  const walletTone =
    balance < 10 ? 'text-red-400' : balance < 30 ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className="flex w-full items-center gap-2 sm:gap-3">
      {/* brand */}
      <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Neon Arcade home">
        {/* <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-700 font-display text-sm font-black text-black shadow-[0_0_18px_rgba(16,185,129,0.28)] transition-transform group-hover:scale-105">
          N
        </span> */}
        <span className="hidden leading-none sm:block">
          <span className="block font-display text-[13px] font-bold uppercase tracking-[0.18em] text-white">
            Neon Arcade
          </span>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.24em] text-emerald-400/60">
            Player lobby
          </span>
        </span>
      </Link>

      {/* command menu trigger — full field on desktop, icon on phones */}
      <button
        type="button"
        onClick={openCommandMenu}
        className="arcade-search group ml-1 hidden min-h-10 flex-1 items-center gap-2.5 rounded-xl px-3 text-left transition-colors sm:flex sm:max-w-xs"
        title="Search games and actions"
        aria-label="Open command menu"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-colors group-hover:text-emerald-400" />
        <span className="truncate text-[13px] text-zinc-500 transition-colors group-hover:text-zinc-300">
          Search games…
        </span>
        <kbd className="ml-auto hidden shrink-0 items-center rounded-md border
         border-white/8 bg-white/3 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 lg:inline-flex">
          Ctrl K
        </kbd>
      </button>
      <button
        type="button"
        onClick={openCommandMenu}
        className="arcade-search flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:hidden"
        aria-label="Open command menu"
      >
        <SearchIcon className="h-4 w-4 text-zinc-400" />
      </button>

      {/* wallet + account */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 rounded-lg border
         border-white/[0.07] bg-white/2.5 px-2.5 py-1.5">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 sm:block">
            Wallet
          </span>
          <span className={`font-mono text-[13px] font-bold tabular-nums ${walletTone}`}>
            ${balance.toFixed(2)}
          </span>
        </div>

        {!isSignedIn && (
          <>
            <Link
              href="/login"
              className="arcade-secondary-btn hidden min-h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors lg:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="arcade-cta hidden min-h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-all md:inline-flex"
            >
              Join free
            </Link>
          </>
        )}
        <ProfileMenu />
      </div>
    </div>
  );
};
