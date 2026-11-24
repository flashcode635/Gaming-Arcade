'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GAME_ICONS } from '@/components/games/iconMap';
import { GAMES, isGameType } from '@/lib/games';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { ProfileMenu } from '@/components/core/ProfileMenu';

/**
 * Sticky nav shown on /arcade/<game> pages: back to the hub, game name,
 * wallet and the player profile dropdown (theme, settings, account
 * actions). Hidden on / and /arcade.
 */
export default function GameNav() {
  const pathname = usePathname();
  const { balance } = useGameCurrency();

  // /arcade/<game> -> "game"
  const slug = pathname.split('/')[2] ?? '';
  const meta = isGameType(slug) ? GAMES[slug] : null;

  if (!pathname.startsWith('/arcade/') || !meta) return null;

  const Icon = GAME_ICONS[meta.id];

  return (
    <nav className="arcade-topbar-shell sticky sticky-safe-top z-50 border-b backdrop-blur-xl">
      <div className="mx-auto grid min-h-14 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-6 lg:px-8">
        <Link
          href="/arcade"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg px-1.5 text-emerald-400 transition-colors hover:text-emerald-300 sm:gap-2 sm:px-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-semibold sm:text-sm">Arcade</span>
        </Link>

        <h2 className="flex items-center justify-center gap-2 font-display text-sm font-semibold text-white sm:text-base">
          <span
            className="arcade-icon-tile flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: `${meta.accent}18`, color: meta.accent }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate">{meta.name}</span>
        </h2>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <div
            className="arcade-game-wallet flex items-center rounded-lg border px-2.5 py-1.5"
            style={{
              background: `${meta.accent}12`,
              borderColor: `${meta.accent}45`,
              color: meta.accent,
            }}
          >
            <span className="font-mono text-xs font-bold tabular-nums sm:text-sm">
              ${balance.toFixed(2)}
            </span>
          </div>
          <ProfileMenu />
        </div>
      </div>
      <span
        aria-hidden="true"
        className="block h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.accent}40, transparent)` }}
      />
    </nav>
  );
}
