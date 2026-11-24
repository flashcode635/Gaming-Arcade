'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { GAME_ICONS } from '@/components/games/iconMap';
import { GAMES, GAME_ORDER } from '@/lib/games';

/**
 * Split-screen shell for the auth pages.
 *
 * Left: the Neon Arcade brand panel — logo, tagline and a live preview of the
 * six games (mirrors the marketing layout). Right: the auth form itself.
 * On small screens the brand panel collapses to a compact header.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-stretch">
      {/* ------------------------- brand panel (left) ------------------------- */}
      <aside className="hidden lg:flex w-[46%] xl:w-[42%] flex-col justify-between p-10 border-r border-green-500/15 relative overflow-hidden">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <span className="w-11 h-11 rounded-xl bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center text-black font-black text-lg neon-glow">
              N
            </span>
            <span className="font-display font-bold text-2xl uppercase tracking-widest">
              <span className="neon-text text-white">Neon</span>{' '}
              <span className="neon-text-cyan text-white">Arcade</span>
            </span>
          </Link>

          <h2 className="mt-10 font-display font-bold text-4xl xl:text-5xl leading-tight text-white">
            Play. Win coins.
            <br />
            <span className="neon-text text-green-100">Climb the board.</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base leading-relaxed max-w-md">
            Six quick games, one shared balance and a wallet that keeps score.
            Sign up once and your coins follow you everywhere.
          </p>
        </div>

        {/* game preview grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 my-8">
          {GAME_ORDER.map((id) => {
            const game = GAMES[id];
            const Icon = GAME_ICONS[id];
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-card/60 border border-white/5 hover:border-white/20 transition-colors"
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${game.accent}1f`, color: game.accent }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{game.name}</p>
                  <p className="text-zinc-500 text-[11px] truncate">{game.payout}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono font-semibold">
            $100 free coins on sign-up
          </span>
          <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
            Guest trial — $50 to play
          </span>
        </div>
      </aside>

      {/* ------------------------- form panel (right) ------------------------- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-12 relative">
        {/* compact brand header for mobile */}
        <Link href="/" className="lg:hidden mb-8 inline-flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center text-black font-black">
            N
          </span>
          <span className="font-display font-bold text-xl uppercase tracking-widest">
            <span className="neon-text text-white">Neon</span>{' '}
            <span className="neon-text-cyan text-white">Arcade</span>
          </span>
        </Link>
        {children}
      </main>
    </div>
  );
}
