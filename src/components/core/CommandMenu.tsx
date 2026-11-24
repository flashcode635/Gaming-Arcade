'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { GAME_ICONS } from '@/components/games/iconMap';
import { GAMES, GAME_ORDER } from '@/lib/games';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { useLogoutWithUndo } from '@/hooks/useLogoutWithUndo';
import { isEditableTarget, useIsApplePlatform } from '@/lib/shortcut';
import { Kbd } from '@/components/core/Kbd';

const OPEN_EVENT = 'neon-arcade:open-command-menu';

/** Lets any component (TopBar chip, etc.) open the palette imperatively. */
export function openCommandMenu(): void {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/**
 * Linear-style command menu: Cmd/Ctrl+K (or the TopBar chip) searches every
 * page and action. Fully keyboard-driven; shortcuts never fire while the user
 * is typing in a field.
 */
export default function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { isSignedIn, username } = useGameCurrency();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const logoutWithUndo = useLogoutWithUndo();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        // Shortcuts don't fire while someone is typing in a field.
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenRequest = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpenRequest);
    };
  }, []);

  const run = useCallback(
    (action: () => void) => {
      setOpen(false);
      action();
    },
    [],
  );

  const go = useCallback((href: string) => run(() => router.push(href)), [router, run]);

  const isApple = useIsApplePlatform();
  const mod = isApple ? '⌘' : 'Ctrl';

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="max-w-xl">
      <CommandInput placeholder={`Search games, pages, actions… (${mod}+K)`} />
      <CommandList>
        <CommandEmpty>No matches found.</CommandEmpty>

        <CommandGroup heading="Games">
          {GAME_ORDER.map((id) => {
            const game = GAMES[id];
            const Icon = GAME_ICONS[id];
            return (
              <CommandItem
                key={id}
                value={`game ${game.name} ${game.tagline}`}
                onSelect={() => go(`/arcade/${id}`)}
                className="text-zinc-200 data-[selected=true]:text-white"
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{game.name}</span>
                <span className="text-xs text-zinc-500 truncate">{game.tagline}</span>
                <span
                  className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ color: game.accent, background: `${game.accent}1f` }}
                >
                  {game.payout}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem value="arcade hub home games lobby" onSelect={() => go('/arcade')} className="text-zinc-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <rect x="2.5" y="7" width="19" height="10" rx="3" />
              <path d="M7 12h.01M12 12h.01M9.5 9.5v5" />
            </svg>
            Arcade hub
            <span className="text-xs text-zinc-500">all six cabinets</span>
          </CommandItem>
          <CommandItem value="landing what is neon arcade product" onSelect={() => go('/')} className="text-zinc-200">
            <span className="w-4 h-4 rounded-sm bg-linear-to-br from-green-500 to-emerald-700 text-black text-[9px] font-black flex items-center justify-center">
              N
            </span>
            Neon Arcade home
            <span className="text-xs text-zinc-500">what is this</span>
          </CommandItem>
          <CommandItem value="settings preferences graphics theme wallet" onSelect={() => go(isSignedIn ? '/settings' : '/login?next=%2Fsettings')} className="text-zinc-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
            </svg>
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="toggle theme dark light mode"
            onSelect={() => run(() => setIsDarkMode(!isDarkMode))}
            className="text-zinc-200"
          >
            {isDarkMode ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zinc-400">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            Switch to {isDarkMode ? 'light' : 'dark'} mode
          </CommandItem>
          {isSignedIn ? (
            <CommandItem
              value="log out sign out wallet saved"
              onSelect={() => run(logoutWithUndo)}
              className="text-red-400 data-[selected=true]:text-red-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                <path d="M15 12H4m0 0 3-3m-3 3 3 3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
              </svg>
              Log out {username}
            </CommandItem>
          ) : (
            <>
              <CommandItem value="sign up create account 100 coins" onSelect={() => go('/signup')} className="text-green-400">
                <span className="w-4 h-4 rounded-sm bg-green-500 text-black text-[9px] font-black flex items-center justify-center">
                  +
                </span>
                Sign up — $100 free coins
              </CommandItem>
              <CommandItem value="log in existing account" onSelect={() => go('/login')} className="text-cyan-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                  <path d="M10 12h11m0 0-3-3m3 3-3 3M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
                </svg>
                Log in
              </CommandItem>
            </>
          )}
        </CommandGroup>
      </CommandList>

      {/* Superhuman-style hint footer — real Kbd chips, platform-aware */}
      <div className="border-t border-white/10 px-3 py-2 flex items-center gap-4 text-[10px] font-mono text-zinc-500">
        <span className="flex items-center gap-1"><Kbd mod={false} keys="↑↓" /> navigate</span>
        <span className="flex items-center gap-1"><Kbd mod={false} keys="↵" /> select</span>
        <span className="flex items-center gap-1"><Kbd mod={false} keys="esc" /> close</span>
        <span className="ml-auto flex items-center gap-1"><Kbd keys="K" /> toggle</span>
      </div>
    </CommandDialog>
  );
}
